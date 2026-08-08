import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const baseUrl = 'https://era-theory.pages.dev';
const files = await readdir(dist);

for (const required of [
  'index.html', 'home.css', 'home.js', 'styles.css', 'app.js',
  'favicon.svg', 'site.webmanifest', 'sitemap.xml', 'robots.txt', '404.html', '_headers'
]) {
  if (!files.includes(required)) throw new Error(`Missing ${required}`);
}

const home = await readFile(resolve(dist, 'index.html'), 'utf8');
const js = await readFile(resolve(dist, 'app.js'), 'utf8');
const registry = JSON.parse(await readFile(resolve(dist, 'data', 'reports.json'), 'utf8'));
const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8');
const headers = await readFile(resolve(dist, '_headers'), 'utf8');
const notFound = await readFile(resolve(dist, '404.html'), 'utf8');
const manifest = JSON.parse(await readFile(resolve(dist, 'site.webmanifest'), 'utf8'));

for (const marker of ['Every era leaves evidence.', 'Report library', 'Evidence first. Atmosphere second.', '300,000 model simulations']) {
  if (!home.includes(marker)) throw new Error(`Missing homepage marker: ${marker}`);
}
for (const marker of [
  `<link rel="canonical" href="${baseUrl}/"`,
  'property="og:title"',
  'name="twitter:card"',
  'application/ld+json',
  'href="/favicon.svg"',
  'href="/site.webmanifest"'
]) {
  if (!home.includes(marker)) throw new Error(`Homepage missing publication metadata: ${marker}`);
}

if (!Array.isArray(registry.reports) || registry.reports.length === 0) {
  throw new Error('Report registry contains no reports.');
}

const published = registry.reports.filter(report => report.status === 'published');
if (published.length === 0) throw new Error('Report registry contains no published reports.');

function publicUrl(route = '') {
  const clean = route.replace(/index\.html$/i, '').replace(/^\/+/, '');
  return clean ? `${baseUrl}/${clean}` : `${baseUrl}/`;
}

for (const reportMeta of published) {
  const reportPath = resolve(dist, reportMeta.route);
  await stat(reportPath);
  const report = await readFile(reportPath, 'utf8');

  for (const marker of reportMeta.requiredMarkers || []) {
    if (!report.includes(marker)) throw new Error(`Report ${reportMeta.number} missing marker: ${marker}`);
  }

  if (!report.includes(reportMeta.title)) throw new Error(`Report ${reportMeta.number} missing title: ${reportMeta.title}`);
  if (reportMeta.finalScore != null && !report.includes(String(reportMeta.finalScore))) {
    throw new Error(`Report ${reportMeta.number} missing final score: ${reportMeta.finalScore}`);
  }
  for (const marker of [
    `<link rel="canonical" href="${publicUrl(reportMeta.route)}"`,
    'property="og:type" content="article"',
    'application/ld+json'
  ]) {
    if (!report.includes(marker)) throw new Error(`Report ${reportMeta.number} missing publication metadata: ${marker}`);
  }

  if (reportMeta.researchVisibility === 'private' && /docs\.google\.com\/spreadsheets/i.test(report)) {
    throw new Error(`Report ${reportMeta.number} exposes a private Google Sheets workbook.`);
  }

  if (reportMeta.methodologyRoute) {
    const methodologyPath = resolve(dist, reportMeta.methodologyRoute);
    await stat(methodologyPath);
    const methodology = await readFile(methodologyPath, 'utf8');
    if (!methodology.includes(`<link rel="canonical" href="${publicUrl(reportMeta.methodologyRoute)}"`)) {
      throw new Error(`Methodology route missing canonical URL: ${reportMeta.methodologyRoute}`);
    }
  }

  if (!sitemap.includes(`<loc>${publicUrl(reportMeta.route)}</loc>`)) {
    throw new Error(`Sitemap missing report ${reportMeta.number}.`);
  }
}

await stat(resolve(dist, 'research', 'index.html'));
await stat(resolve(dist, 'research', 'research.css'));
await stat(resolve(dist, 'research', 'research.js'));
const research = await readFile(resolve(dist, 'research', 'index.html'), 'utf8');
const researchJs = await readFile(resolve(dist, 'research', 'research.js'), 'utf8');

for (const marker of ['Methodology without giving away the vault.', '401', '300,000', 'Private workbook policy', 'research-mobile-nav']) {
  if (!research.includes(marker)) throw new Error(`Missing research marker: ${marker}`);
}
for (const marker of ['research-mobile-nav', 'aria-expanded']) {
  if (!researchJs.includes(marker)) throw new Error(`Missing research JS marker: ${marker}`);
}
for (const marker of ['scenarioWeights', 'renderRadar', 'renderScorecards', '68.25892857142857']) {
  if (!js.includes(marker)) throw new Error(`Missing JS marker: ${marker}`);
}

for (const marker of [
  `<loc>${baseUrl}/</loc>`,
  `<loc>${baseUrl}/research/</loc>`
]) {
  if (!sitemap.includes(marker)) throw new Error(`Sitemap missing URL: ${marker}`);
}
if (!robots.includes(`Sitemap: ${baseUrl}/sitemap.xml`)) throw new Error('robots.txt does not advertise the sitemap.');
if (!notFound.includes('name="robots" content="noindex"')) throw new Error('404 page must be noindex.');
if (!notFound.includes('Return to Era Theory')) throw new Error('404 page lacks a recovery link.');
if (manifest.name !== 'Era Theory' || manifest.start_url !== '/') throw new Error('Invalid web manifest.');
for (const header of ['X-Content-Type-Options: nosniff', 'Referrer-Policy: strict-origin-when-cross-origin', 'X-Frame-Options: DENY']) {
  if (!headers.includes(header)) throw new Error(`Missing security header: ${header}`);
}

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await collectHtml(path));
    if (entry.isFile() && entry.name.endsWith('.html')) paths.push(path);
  }
  return paths;
}

for (const htmlPath of await collectHtml(dist)) {
  const html = await readFile(htmlPath, 'utf8');
  if (/docs\.google\.com\/spreadsheets/i.test(html)) {
    throw new Error(`Production HTML exposes a private Google Sheets workbook: ${htmlPath}`);
  }
}

console.log(`Verification passed: homepage, ${published.length} registered report${published.length === 1 ? '' : 's'}, public methodology, privacy guards, full-precision model inputs, canonical metadata, sitemap, robots, favicon, 404, manifest, security headers, assets, sections, and interactions are present.`);
