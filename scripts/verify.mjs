import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const files = await readdir(dist);
for (const required of ['index.html', 'home.css', 'home.js', 'styles.css', 'app.js']) {
  if (!files.includes(required)) throw new Error(`Missing ${required}`);
}
await stat(resolve(dist, 'reports', 'colts', 'index.html'));
await stat(resolve(dist, 'research', 'index.html'));
await stat(resolve(dist, 'research', 'research.css'));
await stat(resolve(dist, 'research', 'research.js'));
const home = await readFile(resolve(dist, 'index.html'), 'utf8');
const report = await readFile(resolve(dist, 'reports', 'colts', 'index.html'), 'utf8');
const research = await readFile(resolve(dist, 'research', 'index.html'), 'utf8');
const researchJs = await readFile(resolve(dist, 'research', 'research.js'), 'utf8');
const js = await readFile(resolve(dist, 'app.js'), 'utf8');
for (const marker of ['Every era leaves evidence.', 'Report library', 'Evidence first. Atmosphere second.', '300,000 model simulations']) {
  if (!home.includes(marker)) throw new Error(`Missing homepage marker: ${marker}`);
}
for (const marker of ['Final weighted verdict', 'The Ballard contradiction', 'Sensitivity lab', '300K', 'Methodology &amp; sources']) {
  if (!report.includes(marker)) throw new Error(`Missing Colts report marker: ${marker}`);
}
for (const marker of ['Methodology without giving away the vault.', '401', '300,000', 'Private workbook policy', 'research-mobile-nav']) {
  if (!research.includes(marker)) throw new Error(`Missing research marker: ${marker}`);
}
for (const marker of ['research-mobile-nav', 'aria-expanded']) {
  if (!researchJs.includes(marker)) throw new Error(`Missing research JS marker: ${marker}`);
}
for (const marker of ['scenarioWeights', 'renderRadar', 'renderScorecards', '68.25892857142857']) {
  if (!js.includes(marker)) throw new Error(`Missing JS marker: ${marker}`);
}
console.log('Verification passed: homepage, Colts report, public methodology route, mobile research navigation, full-precision model inputs, assets, sections, and interactions are present.');
