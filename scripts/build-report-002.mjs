import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { archiveLionsAssets } from './archive-lions.mjs';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const registry = JSON.parse(await readFile(resolve(dist, 'data', 'reports.json'), 'utf8'));
const detroit = registry.reports.find(report => report.number === '002' && report.slug === 'lions' && report.status === 'published');
if (!detroit) throw new Error('Published Detroit Report 002 is missing from the registry.');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

const archivedLions = await archiveLionsAssets({ root, dist });

// Add Detroit's authentic-image rights records to the shared public credits page.
const creditsPath = resolve(dist, 'image-credits.html');
let credits = await readFile(creditsPath, 'utf8');
const detroitCredits = `
    <section aria-labelledby="detroit-image-credits">
      <p class="report-label">REPORT 002 · DETROIT LIONS</p>
      <h2 id="detroit-image-credits">Detroit authentic archive.</h2>
      ${archivedLions.map(asset => `
      <article class="credit-card" id="${escapeHtml(asset.id)}">
        <img src="${escapeHtml(asset.localSrc)}" alt="${escapeHtml(asset.alt)}" loading="lazy" />
        <div>
          <h3>${escapeHtml(asset.caption)}</h3>
          <p><strong>Credit:</strong> ${escapeHtml(asset.creator)}</p>
          <p><strong>License:</strong> <a href="${escapeHtml(asset.licenseUrl)}" rel="noreferrer">${escapeHtml(asset.license)}</a></p>
          <p><strong>Changes:</strong> ${escapeHtml(asset.changes)}</p>
          <p><a href="${escapeHtml(asset.sourcePage)}" rel="noreferrer">Original source record ↗</a></p>
        </div>
      </article>`).join('\n')}
    </section>`;
if (!credits.includes('ET-LIONS-001')) {
  credits = credits.replace('</main>', `${detroitCredits}\n  </main>`);
  await writeFile(creditsPath, credits);
}

// Make the no-JavaScript homepage fallback aware of Report 002.
const homePath = resolve(dist, 'index.html');
let home = await readFile(homePath, 'utf8');
if (!home.includes('Who actually changed the Detroit Lions?')) {
  const detroitTile = `
        <article class="report-tile">
          <div class="report-number">002</div>
          <div class="report-tile-body"><p>NFL · COMPLETED SEASONS THROUGH 2025</p><h3>${escapeHtml(detroit.publicQuestion)}</h3><span>${escapeHtml(detroit.subtitle)}</span><p>${escapeHtml(detroit.summary)}</p></div>
          <div class="report-tile-result"><strong>${Number(detroit.finalScore).toFixed(1)}</strong><small>${escapeHtml(detroit.resultLabel)}</small><a href="reports/lions/index.html">Start the story</a></div>
        </article>`;
  home = home.replace('        <article class="report-tile planned">', `${detroitTile}\n        <article class="report-tile planned">`);
  await writeFile(homePath, home);
}

// Report 002 has a dedicated methodology page. Keep all Detroit research links on that surface.
// The final photo-treatment layer overrides the first-pass rough polygons after visual QA.
const lionsPath = resolve(dist, 'reports', 'lions', 'index.html');
let lions = await readFile(lionsPath, 'utf8');
lions = lions.replaceAll('../../research/index.html', '../../research/lions/index.html');
if (!lions.includes('photo-treatment-v2.css')) {
  lions = lions.replace('<link rel="stylesheet" href="story.css" />', '<link rel="stylesheet" href="story.css" />\n  <link rel="stylesheet" href="photo-treatment-v2.css" />');
}
await writeFile(lionsPath, lions);

console.log(`Finalized Report 002 publication build with ${archivedLions.length} rights-approved Detroit images, Detroit image credits, a server-rendered homepage library tile, report-specific methodology links and the refined authentic-photo treatment.`);
