import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { archiveCubsAssets } from './archive-cubs.mjs';

const root=resolve(import.meta.dirname,'..');
const dist=resolve(root,'dist');
const registry=JSON.parse(await readFile(resolve(dist,'data','reports.json'),'utf8'));
const cubs=registry.reports.find(r=>r.number==='004'&&r.slug==='cubs'&&r.status==='published');
if(!cubs)throw new Error('Published Cubs Report 004 is missing from the registry.');
function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')}

const assets=await archiveCubsAssets({root,dist});
const creditsPath=resolve(dist,'image-credits.html');
let credits=await readFile(creditsPath,'utf8');
const section=`<section aria-labelledby="cubs-image-credits"><p class="report-label">REPORT 004 · CHICAGO CUBS</p><h2 id="cubs-image-credits">Cubs authentic archive.</h2>${assets.map(a=>`<article class="credit-card" id="${escapeHtml(a.id)}"><img src="${escapeHtml(a.localSrc)}" alt="${escapeHtml(a.alt)}" loading="lazy"/><div><h3>${escapeHtml(a.caption)}</h3><p><strong>Credit:</strong> ${escapeHtml(a.creator)}</p><p><strong>License:</strong> <a href="${escapeHtml(a.licenseUrl)}" rel="noreferrer">${escapeHtml(a.license)}</a></p><p><strong>Changes:</strong> ${escapeHtml(a.changes)}</p><p><a href="${escapeHtml(a.sourcePage)}" rel="noreferrer">Original source record ↗</a></p></div></article>`).join('')}</section>`;
if(!credits.includes('ET-CUBS-001')){credits=credits.replace('</main>',`${section}</main>`);await writeFile(creditsPath,credits)}

// Keep the server-rendered homepage fallback aligned with the frozen Report 004 registry.
const homePath=resolve(dist,'index.html');
let home=await readFile(homePath,'utf8');
const homeReplacements=[
  ['Did the Cubs build a dynasty—or one great championship window?','Did the Cubs break up the 2016 core at the right time?'],
  ['Rebuild → title → decline → second build','Build → title → decline → teardown → re-entry'],
  ['How Chicago built the 2016 champion, why the young core stopped regenerating and how the 2021 teardown helped finance the next contender.','How Chicago built and converted an elite championship core, why the exit probably came one offseason late, what the 2021 selloff really returned and who actually built the 2025 contender.'],
  ['Championship lifecycle — not a dynasty','Successful lifecycle, imperfect exit'],
  ['80.7','82.0']
];
for(const [from,to] of homeReplacements)home=home.replaceAll(from,to);
if(!home.includes(cubs.publicQuestion)){
  const tile=`<article class="report-tile"><div class="report-number">004</div><div class="report-tile-body"><p>MLB · COMPLETED SEASONS 2012–2025</p><h3>${escapeHtml(cubs.publicQuestion)}</h3><span>${escapeHtml(cubs.subtitle)}</span><p>${escapeHtml(cubs.summary)}</p></div><div class="report-tile-result"><strong>${Number(cubs.finalScore).toFixed(1)}</strong><small>${escapeHtml(cubs.resultLabel)}</small><a href="reports/cubs/index.html">Start the story</a></div></article>`;
  home=home.replace('        <article class="report-tile planned">',`${tile}\n        <article class="report-tile planned">`);
}
if(!home.includes('/report-004-site.js'))home=home.replace('</body>','<script src="/report-004-site.js" defer></script>\n</body>');
await writeFile(homePath,home);

const researchPath=resolve(dist,'research','index.html');
let research=await readFile(researchPath,'utf8');
if(!research.includes('/report-004-site.js')){research=research.replace('</body>','<script src="/report-004-site.js" defer></script>\n</body>');await writeFile(researchPath,research)}

console.log(`Finalized frozen Report 004 with ${assets.length} rights-approved Cubs images, an ${Number(cubs.finalScore).toFixed(1)} lifecycle score and ${cubs.coreEvidenceRecords}/${cubs.coreEvidenceRecords} sourced core evidence records.`);
