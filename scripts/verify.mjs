import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const baseUrl = 'https://era-theory.pages.dev';
const files = await readdir(dist);

for (const required of [
  'index.html', 'home.css', 'home.js', 'styles.css', 'app.js',
  'favicon.svg', 'site.webmanifest', 'sitemap.xml', 'robots.txt', '404.html', '_headers', 'image-credits.html'
]) {
  if (!files.includes(required)) throw new Error(`Missing ${required}`);
}

await stat(resolve(dist, 'reports', 'colts', 'index.html'));
await stat(resolve(dist, 'reports', 'colts', 'story.css'));
await stat(resolve(dist, 'research', 'index.html'));
await stat(resolve(dist, 'research', 'research.css'));
await stat(resolve(dist, 'research', 'research.js'));

const home = await readFile(resolve(dist, 'index.html'), 'utf8');
const homeJs = await readFile(resolve(dist, 'home.js'), 'utf8');
const js = await readFile(resolve(dist, 'app.js'), 'utf8');
const coltsStory = await readFile(resolve(dist, 'reports', 'colts', 'index.html'), 'utf8');
const coltsStoryCss = await readFile(resolve(dist, 'reports', 'colts', 'story.css'), 'utf8');
const research = await readFile(resolve(dist, 'research', 'index.html'), 'utf8');
const researchJs = await readFile(resolve(dist, 'research', 'research.js'), 'utf8');
const registry = JSON.parse(await readFile(resolve(dist, 'data', 'reports.json'), 'utf8'));
const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8');
const headers = await readFile(resolve(dist, '_headers'), 'utf8');
const notFound = await readFile(resolve(dist, '404.html'), 'utf8');
const webManifest = JSON.parse(await readFile(resolve(dist, 'site.webmanifest'), 'utf8'));
const coltsArchive = JSON.parse(await readFile(resolve(dist, 'assets', 'archive', 'colts-manifest.json'), 'utf8'));
const imageCredits = await readFile(resolve(dist, 'image-credits.html'), 'utf8');

for (const marker of [
  'Which Colts era was actually the best?',
  'Polian wins. The interesting part is why.',
  'Follow the questions Colts fans already argue about.',
  'Simple to follow. Serious underneath.',
  '401 / 401'
]) {
  if (!home.includes(marker)) throw new Error(`Missing fan-first homepage marker: ${marker}`);
}
for (const marker of ['data/reports.json', 'hydrateReportLibrary', 'renderPublishedTile', 'report-library', 'Start the story']) {
  if (!homeJs.includes(marker)) throw new Error(`Homepage registry renderer missing marker: ${marker}`);
}

if (!Array.isArray(coltsArchive.assets) || coltsArchive.assets.length !== 5) {
  throw new Error(`Expected 5 approved Colts archive assets; found ${coltsArchive.assets?.length ?? 0}.`);
}
for (const asset of coltsArchive.assets) {
  if (asset.status !== 'approved') throw new Error(`Non-approved asset entered public archive: ${asset.id}`);
  if (!asset.localSrc?.startsWith('/assets/archive/')) throw new Error(`Archive asset lacks local source: ${asset.id}`);
  await stat(resolve(dist, asset.localSrc.replace(/^\//, '')));
  for (const value of [asset.id, asset.sourcePage, asset.creator, asset.license, asset.changes]) {
    if (!imageCredits.includes(value)) throw new Error(`Image credits missing rights metadata for ${asset.id}: ${value}`);
  }
}

for (const marker of [
  'Who built the best Colts era?',
  'Was Polian really just Peyton Manning?',
  'Was Grigson really that bad?',
  'This is the Ballard contradiction.',
  'Who actually solved quarterback?',
  'Who drafted best?',
  'Who made the smartest moves?',
  'What if you disagree with what we think matters?',
  'Final weighted verdict',
  'The Ballard contradiction',
  'Sensitivity lab',
  '/assets/archive/bill-polian-rca-dome-2007.jpg',
  '/assets/archive/peyton-manning-colts-2010.jpg',
  '/assets/archive/andrew-luck-2014.jpg',
  '/assets/archive/anthony-richardson-2023.png',
  '/assets/archive/jonathan-taylor-2022.jpg'
]) {
  if (!coltsStory.includes(marker)) throw new Error(`Colts story missing marker: ${marker}`);
}
for (const marker of ['report-story-hero', 'chapter-map', 'ballard-visuals', 'deep-evidence', 'fan-sensitivity']) {
  if (!coltsStoryCss.includes(marker)) throw new Error(`Colts story stylesheet missing marker: ${marker}`);
}
for (const marker of ['scenarioWeights', 'renderRadar', 'renderScorecards', '68.25892857142857', 'Who solved quarterback?']) {
  if (!js.includes(marker)) throw new Error(`Interactive model missing marker: ${marker}`);
}

if (!Array.isArray(registry.reports) || registry.reports.length === 0) throw new Error('Report registry contains no reports.');
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
  if (!report.includes(String(reportMeta.finalScore))) throw new Error(`Report ${reportMeta.number} missing final score ${reportMeta.finalScore}.`);
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
  if (!sitemap.includes(`<loc>${publicUrl(reportMeta.route)}</loc>`)) throw new Error(`Sitemap missing report ${reportMeta.number}.`);
}

for (const marker of [
  'How do we know?',
  'Five steps. That is the whole idea.',
  '401 / 401',
  'Seven football questions. Results matter most.',
  'Every core evidence row has a source.',
  'Why isn\'t the entire workbook public?',
  'research-mobile-nav'
]) {
  if (!research.includes(marker)) throw new Error(`Missing fan-first research marker: ${marker}`);
}
for (const marker of ['research-mobile-nav', 'aria-expanded']) {
  if (!researchJs.includes(marker)) throw new Error(`Missing research JS marker: ${marker}`);
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
for (const marker of [
  `<loc>${baseUrl}/</loc>`,
  `<loc>${baseUrl}/reports/colts/</loc>`,
  `<loc>${baseUrl}/research/</loc>`,
  `<loc>${baseUrl}/image-credits.html</loc>`
]) {
  if (!sitemap.includes(marker)) throw new Error(`Sitemap missing URL: ${marker}`);
}
if (!robots.includes(`Sitemap: ${baseUrl}/sitemap.xml`)) throw new Error('robots.txt does not advertise the sitemap.');
if (!notFound.includes('name="robots" content="noindex"')) throw new Error('404 page must be noindex.');
if (!notFound.includes('Return to Era Theory')) throw new Error('404 page lacks a recovery link.');
if (webManifest.name !== 'Era Theory' || webManifest.start_url !== '/') throw new Error('Invalid web manifest.');
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
  if (/<img\b[^>]*\bsrc=["']https?:\/\//i.test(html)) {
    throw new Error(`Production HTML hotlinks an image instead of using the authentic archive: ${htmlPath}`);
  }
}

console.log(`Verification passed: fan-first homepage, guided Colts story, fan-readable methodology, ${published.length} registered report${published.length === 1 ? '' : 's'}, full-precision model, ${coltsArchive.assets.length} rights-approved self-hosted Colts images, image credits, hotlink rejection, privacy guards, canonical metadata, sitemap, robots, favicon, 404, manifest and security headers.`);
