import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const files = await readdir(dist);
for (const required of ['index.html', 'home.css', 'home.js', 'styles.css', 'app.js']) {
  if (!files.includes(required)) throw new Error(`Missing ${required}`);
}

const home = await readFile(resolve(dist, 'index.html'), 'utf8');
const js = await readFile(resolve(dist, 'app.js'), 'utf8');
const registry = JSON.parse(await readFile(resolve(dist, 'data', 'reports.json'), 'utf8'));

for (const marker of ['Every era leaves evidence.', 'Report library', 'Evidence first. Atmosphere second.', '300,000 model simulations']) {
  if (!home.includes(marker)) throw new Error(`Missing homepage marker: ${marker}`);
}

if (!Array.isArray(registry.reports) || registry.reports.length === 0) {
  throw new Error('Report registry contains no reports.');
}

const published = registry.reports.filter(report => report.status === 'published');
if (published.length === 0) throw new Error('Report registry contains no published reports.');

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

  if (reportMeta.researchVisibility === 'private' && /docs\.google\.com\/spreadsheets/i.test(report)) {
    throw new Error(`Report ${reportMeta.number} exposes a private Google Sheets workbook.`);
  }

  if (reportMeta.methodologyRoute) {
    await stat(resolve(dist, reportMeta.methodologyRoute));
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

if (/docs\.google\.com\/spreadsheets/i.test(home)) {
  throw new Error('Homepage exposes a private Google Sheets workbook.');
}

console.log(`Verification passed: homepage, ${published.length} registered report${published.length === 1 ? '' : 's'}, public methodology, privacy guards, full-precision model inputs, assets, sections, and interactions are present.`);
