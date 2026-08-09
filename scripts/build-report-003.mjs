import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { archivePacersAssets } from './archive-pacers.mjs';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const registry = JSON.parse(await readFile(resolve(dist, 'data', 'reports.json'), 'utf8'));
const pacers = registry.reports.find(report => report.number === '003' && report.slug === 'pacers' && report.status === 'published');
if (!pacers) throw new Error('Published Pacers Report 003 is missing from the registry.');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

const archivedPacers = await archivePacersAssets({ root, dist });

const creditsPath = resolve(dist, 'image-credits.html');
let credits = await readFile(creditsPath, 'utf8');
const pacersCredits = `
    <section aria-labelledby="pacers-image-credits">
      <p class="report-label">REPORT 003 · INDIANA PACERS</p>
      <h2 id="pacers-image-credits">Pacers authentic archive.</h2>
      ${archivedPacers.map(asset => `
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
if (!credits.includes('ET-PACERS-001')) {
  credits = credits.replace('</main>', `${pacersCredits}\n  </main>`);
  await writeFile(creditsPath, credits);
}

const homePath = resolve(dist, 'index.html');
let home = await readFile(homePath, 'utf8');
if (!home.includes('How did the Pacers keep turning one star into the next?')) {
  const tile = `
        <article class="report-tile">
          <div class="report-number">003</div>
          <div class="report-tile-body"><p>NBA · COMPLETED SEASONS THROUGH 2025–26</p><h3>${escapeHtml(pacers.publicQuestion)}</h3><span>${escapeHtml(pacers.subtitle)}</span><p>${escapeHtml(pacers.summary)}</p></div>
          <div class="report-tile-result"><strong>${Number(pacers.finalScore).toFixed(1)}</strong><small>${escapeHtml(pacers.resultLabel)}</small><a href="reports/pacers/index.html">Start the story</a></div>
        </article>`;
  home = home.replace('        <article class="report-tile planned">', `${tile}\n        <article class="report-tile planned">`);
  await writeFile(homePath, home);
}

console.log(`Finalized Report 003 publication build with ${archivedPacers.length} rights-approved Pacers images, public image credits and a server-rendered homepage library tile.`);
