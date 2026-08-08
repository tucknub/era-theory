import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const reportPath = resolve(dist, 'reports', 'lions', 'index.html');
const cssPath = resolve(dist, 'reports', 'lions', 'story.css');
const jsPath = resolve(dist, 'reports', 'lions', 'lions.js');
const methodologyPath = resolve(dist, 'research', 'lions', 'index.html');

await stat(reportPath);
await stat(cssPath);
await stat(jsPath);
await stat(methodologyPath);
await stat(resolve(dist, 'assets', 'archive', 'lions-manifest.json'));

const report = await readFile(reportPath, 'utf8');
const css = await readFile(cssPath, 'utf8');
const js = await readFile(jsPath, 'utf8');
const methodology = await readFile(methodologyPath, 'utf8');
const home = await readFile(resolve(dist, 'index.html'), 'utf8');
const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
const registry = JSON.parse(await readFile(resolve(dist, 'data', 'reports.json'), 'utf8'));
const lionsArchive = JSON.parse(await readFile(resolve(dist, 'assets', 'archive', 'lions-manifest.json'), 'utf8'));
const imageCredits = await readFile(resolve(dist, 'image-credits.html'), 'utf8');

const reportMeta = registry.reports?.find(item => item.number === '002' && item.slug === 'lions');
if (!reportMeta || reportMeta.status !== 'published') throw new Error('Report 002 is missing from the published registry.');
if (reportMeta.finalScore !== 71.6) throw new Error(`Unexpected Detroit final score in registry: ${reportMeta.finalScore}`);
if (reportMeta.coreEvidenceRecords !== 328) throw new Error(`Unexpected Detroit core evidence count: ${reportMeta.coreEvidenceRecords}`);
if (reportMeta.randomWeightSimulations !== 300000) throw new Error(`Unexpected Detroit simulation count: ${reportMeta.randomWeightSimulations}`);
if (reportMeta.methodologyRoute !== 'research/lions/index.html') throw new Error(`Unexpected Detroit methodology route: ${reportMeta.methodologyRoute}`);

if (!Array.isArray(lionsArchive.assets) || lionsArchive.assets.length !== 4) {
  throw new Error(`Expected 4 approved Lions archive assets; found ${lionsArchive.assets?.length ?? 0}.`);
}
for (const asset of lionsArchive.assets) {
  if (asset.status !== 'approved') throw new Error(`Non-approved Lions asset entered archive: ${asset.id}`);
  if (!asset.localSrc?.startsWith('/assets/archive/')) throw new Error(`Lions asset lacks local archive path: ${asset.id}`);
  await stat(resolve(dist, asset.localSrc.replace(/^\//, '')));
  for (const value of [asset.id, asset.sourcePage, asset.creator, asset.license, asset.changes]) {
    if (!imageCredits.includes(value)) throw new Error(`Image credits missing Detroit rights metadata for ${asset.id}: ${value}`);
  }
}

for (const marker of [
  'How did the Lions go from 0–16 to a contender?',
  'Holmes wins—and this time the model barely has to argue with itself.',
  'The Quinn conversion failure',
  'Who gets credit for Matthew Stafford?',
  'Not one thing. The connections between things.',
  'Final weighted verdict',
  'Sensitivity lab',
  '328 of 328',
  '71.6',
  '../../research/lions/index.html',
  '/assets/archive/calvin-johnson-lions-2007.jpg',
  '/assets/archive/matthew-stafford-lions-2015.jpg',
  '/assets/archive/jared-goff-lions-2022.jpg',
  '/assets/archive/penei-sewell-lions-2022.jpg'
]) {
  if (!report.includes(marker)) throw new Error(`Detroit report missing marker: ${marker}`);
}
for (const marker of ['--calvin-cutout', '--stafford-cutout', '--sewell-cutout', 'clip-path:var(--calvin-cutout)', 'clip-path:var(--sewell-cutout)']) {
  if (!css.includes(marker)) throw new Error(`Detroit authentic-cutout stylesheet missing marker: ${marker}`);
}
for (const marker of ['Brad Holmes', '93.84666666666666', 'renderScorecards', 'renderRadar', 'setupSensitivity', 'lions-model-controls']) {
  if (!js.includes(marker)) throw new Error(`Detroit interaction layer missing marker: ${marker}`);
}
for (const marker of [
  'How do we know what changed in Detroit?',
  '328 / 328',
  '300,000',
  'Mayhew → Stafford',
  'Quinn → Stafford',
  'Holmes → Goff + capital',
  'The verdict is clear. The active era is not finished.',
  'Why isn\'t the entire workbook public?'
]) {
  if (!methodology.includes(marker)) throw new Error(`Detroit methodology missing marker: ${marker}`);
}

if (!home.includes('Who actually changed the Detroit Lions?')) throw new Error('Server-rendered homepage fallback is missing Report 002.');
if (!sitemap.includes('<loc>https://era-theory.pages.dev/reports/lions/</loc>')) throw new Error('Sitemap is missing Report 002.');
if (!sitemap.includes('<loc>https://era-theory.pages.dev/research/lions/</loc>')) throw new Error('Sitemap is missing Detroit methodology.');

for (const html of [report, methodology]) {
  if (/docs\.google\.com\/spreadsheets/i.test(html)) throw new Error('Detroit public surface exposes the private research workbook.');
  if (/<img\b[^>]*\bsrc=["']https?:\/\//i.test(html)) throw new Error('Detroit public surface hotlinks a remote image.');
}
if (/(ai-generated stand-in|synthetic portrait|lookalike)/i.test(report) && !/No AI-generated stand-ins/i.test(report)) {
  throw new Error('Detroit report contains suspicious synthetic-person language.');
}

const archiveNames = new Set(lionsArchive.assets.map(asset => asset.localSrc));
for (const src of [...report.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(match => match[1])) {
  if (src.startsWith('/assets/archive/') && !archiveNames.has(src)) {
    throw new Error(`Detroit report references an image outside the approved Lions manifest: ${src}`);
  }
}

console.log('Detroit Report 002 verification passed: registry, 71.6 final score, 328 evidence records, 300,000 simulations, dedicated methodology, server-rendered library entry, four approved self-hosted authentic images, cutout treatment, rights credits, privacy guards and interactions are present.');
