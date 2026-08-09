import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const reportPath = resolve(dist, 'reports', 'pacers', 'index.html');
const researchPath = resolve(dist, 'research', 'pacers', 'index.html');
const cssPath = resolve(dist, 'reports', 'pacers', 'pacers.css');
const jsPath = resolve(dist, 'reports', 'pacers', 'pacers.js');
const manifestPath = resolve(dist, 'assets', 'archive', 'pacers-manifest.json');

for (const path of [reportPath,researchPath,cssPath,jsPath,manifestPath]) await access(path);
const [report,research,css,js,manifestRaw,registryRaw,credits,ledger] = await Promise.all([
  readFile(reportPath,'utf8'), readFile(researchPath,'utf8'), readFile(cssPath,'utf8'), readFile(jsPath,'utf8'),
  readFile(manifestPath,'utf8'), readFile(resolve(dist,'data','reports.json'),'utf8'), readFile(resolve(dist,'image-credits.html'),'utf8'), readFile(resolve(root,'ERA_THEORY_IMAGE_RIGHTS_LEDGER.csv'),'utf8')
]);
const manifest = JSON.parse(manifestRaw);
const registry = JSON.parse(registryRaw);
const pacers = registry.reports.find(r => r.number === '003' && r.slug === 'pacers' && r.status === 'published');
if (!pacers) throw new Error('Report 003 is not registered as published.');

const requiredReportMarkers = [
  'How did the Pacers keep turning one star into the next?',
  '80.5','73.5','55.0','Star-to-star conversion','Sensitivity lab',
  '178 / 178','300,000','2025–26','Resilience heavy',
  '/assets/archive/paul-george-pacers-2014.jpg',
  '/assets/archive/victor-oladipo-pacers-2018.jpg',
  '/assets/archive/domantas-sabonis-pacers-2018.jpg',
  '/assets/archive/tyrese-haliburton-pacers-2025.jpg',
  '/assets/archive/pascal-siakam-pacers-2025.jpg'
];
for (const marker of requiredReportMarkers) if (!report.includes(marker)) throw new Error(`Pacers report missing marker: ${marker}`);

for (const marker of ['178 / 178','300,000','91.6%','8.4%','Zubac','19–63','three completed NBA seasons']) {
  if (!research.includes(marker)) throw new Error(`Pacers methodology missing marker: ${marker}`);
}

if (report.includes('docs.google.com/spreadsheets') || research.includes('docs.google.com/spreadsheets')) {
  throw new Error('Private Pacers research workbook URL leaked into public HTML.');
}
if (/https?:\/\/(?!www\.nba\.com|nba\.com|www\.basketball-reference\.com|basketball-reference\.com|creativecommons\.org|commons\.wikimedia\.org)[^"'\s>]+\.(?:jpg|jpeg|png|webp)/i.test(report)) {
  throw new Error('Report 003 contains an unreviewed remote image URL.');
}

if (!Array.isArray(manifest.assets) || manifest.assets.length !== 5) throw new Error('Pacers archive must contain exactly five approved assets.');
for (const asset of manifest.assets) {
  if (asset.status !== 'approved' || !asset.localSrc?.startsWith('/assets/archive/')) throw new Error(`Invalid Pacers archive record: ${asset.id}`);
  await access(resolve(dist, asset.localSrc.replace(/^\//,'')));
  if (!credits.includes(asset.id)) throw new Error(`Image credits missing ${asset.id}.`);
  if (!ledger.includes(asset.id)) throw new Error(`Rights ledger missing ${asset.id}.`);
}

for (const token of ['conversion-hero','pg-cutout','hali-cutout','siakam-cutout','split-photo-pair']) {
  if (!css.includes(token)) throw new Error(`Pacers authentic-photo treatment missing CSS token: ${token}`);
}
for (const token of ['published','resilience','Paul George Core','Haliburton Core','renderRadar','renderModel']) {
  if (!js.includes(token)) throw new Error(`Pacers interaction script missing token: ${token}`);
}

if (Number(pacers.finalScore) !== 80.5 || Number(pacers.coreEvidenceRecords) !== 178 || Number(pacers.randomWeightSimulations) !== 300000) {
  throw new Error('Report 003 registry metadata does not match the audited research record.');
}

const sitemap = await readFile(resolve(dist,'sitemap.xml'),'utf8');
for (const route of ['https://era-theory.pages.dev/reports/pacers/','https://era-theory.pages.dev/research/pacers/']) {
  if (!sitemap.includes(route)) throw new Error(`Sitemap missing ${route}`);
}

console.log('Verified Pacers Report 003: registry, story markers, private-workbook exclusion, five rights-approved self-hosted images, credits/ledger, authentic-photo treatment, interaction code, methodology and sitemap routes.');
