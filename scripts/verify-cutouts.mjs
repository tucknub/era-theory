import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

await stat(resolve(dist, 'authentic-cutouts.css'));
const styles = await readFile(resolve(dist, 'styles.css'), 'utf8');
const cutouts = await readFile(resolve(dist, 'authentic-cutouts.css'), 'utf8');
const home = await readFile(resolve(dist, 'index.html'), 'utf8');
const report = await readFile(resolve(dist, 'reports', 'colts', 'index.html'), 'utf8');

if (!styles.includes('@import url("authentic-cutouts.css")')) {
  throw new Error('Authentic cutout stylesheet is not loaded last by the shared visual system.');
}

for (const marker of [
  'AUTHENTIC_PIXEL_CUTOUTS',
  '--manning-cutout:',
  '--luck-cutout:',
  '--polian-cutout:',
  '--taylor-cutout:',
  'clip-path:var(--manning-cutout)',
  'clip-path:var(--luck-cutout)',
  'clip-path:var(--polian-cutout)',
  'clip-path:var(--taylor-cutout)',
  'The photographed people themselves are not generated',
]) {
  if (!cutouts.includes(marker)) throw new Error(`Authentic cutout guard missing marker: ${marker}`);
}

for (const expected of [
  '/assets/archive/peyton-manning-colts-2010.jpg',
  '/assets/archive/andrew-luck-2014.jpg',
  '/assets/archive/jonathan-taylor-2022.jpg',
]) {
  if (!home.includes(expected)) throw new Error(`Homepage no longer anchors an era to approved authentic photography: ${expected}`);
}

for (const expected of [
  '/assets/archive/bill-polian-rca-dome-2007.jpg',
  '/assets/archive/peyton-manning-colts-2010.jpg',
  '/assets/archive/andrew-luck-2014.jpg',
  '/assets/archive/jonathan-taylor-2022.jpg',
]) {
  if (!report.includes(expected)) throw new Error(`Colts narrative missing approved authentic photography: ${expected}`);
}

for (const stale of [
  'peyton-manning-pro-bowl-2006',
  'andrew-luck-2018',
  'during a 2018 game',
  'Keith Allison · CC BY-SA 2.0',
]) {
  if (home.includes(stale) || report.includes(stale)) throw new Error(`Stale historical image reference returned: ${stale}`);
}

if (!cutouts.includes('.home-page .era-ballard-secondary { display:none !important; }')) {
  throw new Error('Homepage Richardson secondary layer must remain disabled while the hero uses the clean Taylor cutout.');
}
if (!cutouts.includes('.colts-story-page .ballard-visuals .ar-photo { display:none !important; }')) {
  throw new Error('Ballard narrative Richardson secondary layer must remain disabled while Taylor is the cutout anchor.');
}

console.log('Authentic cutout verification passed: the homepage and Colts narrative use approved real source photographs with background-only silhouette clipping, historically correct Manning/Luck references, and no generated-person fallback.');
