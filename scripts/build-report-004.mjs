import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { archiveCubsAssets } from './archive-cubs.mjs';
const root=resolve(import.meta.dirname,'..');const dist=resolve(root,'dist');
const registry=JSON.parse(await readFile(resolve(dist,'data','reports.json'),'utf8'));
const cubs=registry.reports.find(r=>r.number==='004'&&r.slug==='cubs'&&r.status==='published');
if(!cubs)throw new Error('Published Cubs Report 004 is missing from the registry.');
function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
function replaceRequired(text,from,to,label){if(!text.includes(from))throw new Error(`Report 004 audit patch missing expected ${label}: ${from}`);return text.replace(from,to)}
const assets=await archiveCubsAssets({root,dist});
const creditsPath=resolve(dist,'image-credits.html');let credits=await readFile(creditsPath,'utf8');
const section=`<section aria-labelledby="cubs-image-credits"><p class="report-label">REPORT 004 · CHICAGO CUBS</p><h2 id="cubs-image-credits">Cubs authentic archive.</h2>${assets.map(a=>`<article class="credit-card" id="${escapeHtml(a.id)}"><img src="${escapeHtml(a.localSrc)}" alt="${escapeHtml(a.alt)}" loading="lazy"/><div><h3>${escapeHtml(a.caption)}</h3><p><strong>Credit:</strong> ${escapeHtml(a.creator)}</p><p><strong>License:</strong> <a href="${escapeHtml(a.licenseUrl)}" rel="noreferrer">${escapeHtml(a.license)}</a></p><p><strong>Changes:</strong> ${escapeHtml(a.changes)}</p><p><a href="${escapeHtml(a.sourcePage)}" rel="noreferrer">Original source record ↗</a></p></div></article>`).join('')}</section>`;
if(!credits.includes('ET-CUBS-001')){credits=credits.replace('</main>',`${section}</main>`);await writeFile(creditsPath,credits)}

const cubsPath=resolve(dist,'reports','cubs','index.html');let cubsHtml=await readFile(cubsPath,'utf8');
if(!cubsHtml.includes('cubs-polish.css'))cubsHtml=cubsHtml.replace('<link rel="stylesheet" href="cubs.css" />','<link rel="stylesheet" href="cubs.css" />\n  <link rel="stylesheet" href="cubs-polish.css" />');
// Final audited workbook values (Report 004 research audit v2).
for(const [from,to] of [
  ['A 160-record Era Theory study','A 135-record Era Theory study'],
  ['80.6','80.7'],['55.1','73.9'],['93.8','91.1'],['94.0','96.0'],
  ['86.5','80.4'],['81.3','81.8'],['82.8','73.0'],['65.2','62.6'],['82.1','81.1'],
  ['160 / 160','135 / 135'],['160 sourced records','135 sourced records'],['160 records','135 records'],
  ['Rizzo</b> · 98','Rizzo</b> · 100'],['Hendricks</b> · 97','Hendricks</b> · 95'],
  ['Title-first named model: <b>82.4','Title-first named model: <b>80.0'],
  ['Dynasty-first: <b>77.6','Dynasty-first: <b>77.3'],
  ['Highest leave-one-out: <b>85.1','Highest leave-one-out: <b>82.7']
])cubsHtml=cubsHtml.replaceAll(from,to);

cubsHtml=replaceRequired(cubsHtml,
  '<p>The 2012–14 mature draft classes average <strong>75.3</strong>. The 2015–18 window drafts average <strong>55.0</strong>. Mature 2019–20 classes average <strong>25.0</strong>. Happ and Hoerner were real hits, but Chicago never produced enough new star-level MLB value—especially pitching—to recreate the first wave.</p><div class="grade-slope"><article><span>2012–14</span><strong>75.3</strong><p>foundation classes</p></article><b>→</b><article><span>2015–18</span><strong>55.0</strong><p>window replenishment</p></article><b>→</b><article><span>2019–20</span><strong>25.0</strong><p>mature decline classes</p></article></div>',
  '<p>The mature draft classes average <strong>68.3</strong>, while the broader prospect-development index is <strong>84.2</strong>. Combined, the development dimension lands at <strong>73.9</strong>. The early 2013–14 classes were exceptional, but later drafting was uneven and internal pitching renewal never matched the first position-player wave.</p><div class="grade-slope"><article><span>2012–14</span><strong>84.3</strong><p>foundation draft classes</p></article><b>→</b><article><span>2015–18</span><strong>71.8</strong><p>window draft classes</p></article><b>→</b><article><span>2019–21</span><strong>47.7</strong><p>decline draft classes</p></article></div>',
  'development chapter');

cubsHtml=replaceRequired(cubsHtml,
  '<div class="move-grid"><article><strong>91.5</strong><span>foundation supplementation</span></article><article><strong>78.4</strong><span>window supplementation</span></article><article><strong>63.5</strong><span>decline supplementation</span></article><article><strong>85.6</strong><span>second-build supplementation</span></article></div>',
  '<div class="move-grid"><article><strong>80.4</strong><span>trade conversion</span></article><article><strong>81.8</strong><span>veteran supplementation</span></article><article><strong>64.0</strong><span>decline external additions</span></article><article><strong>86.8</strong><span>second-build external additions</span></article></div>',
  'external-additions grid');

cubsHtml=replaceRequired(cubsHtml,
  '<div class="durability-fall"><span>2016 <b>100</b></span><span>2017 <b>86</b></span><span>2018 <b>68</b></span><span>2019 <b>53</b></span><span>2020 <b>42</b></span><span>2021 <b>24</b></span></div>',
  '<div class="durability-fall"><span>Competitive floor <b>90</b></span><span>Position replenishment <b>62</b></span><span>Homegrown pitching <b>35</b></span><span>Retention <b>58</b></span><span>Decline response <b>68</b></span></div>',
  'durability diagnostic');

cubsHtml=cubsHtml.replace('then a 5.9-WAR, 31-HR, 35-SB All-Star/Gold Glove player in 2025','then a 31-HR, 35-SB All-Star and Gold Glove core player in 2025');
await writeFile(cubsPath,cubsHtml);

// The committed methodology page is the stable layout template; replace its old research audit with the final workbook audit in dist.
const cubsResearchPath=resolve(dist,'research','cubs','index.html');let method=await readFile(cubsResearchPath,'utf8');
for(const [from,to] of [
  ['<strong>160</strong><span>core evidence records</span>','<strong>135</strong><span>core evidence records</span>'],
  ['<strong>160 / 160</strong><span>records source-linked</span>','<strong>135 / 135</strong><span>records source-linked</span>'],
  ['160 of 160 core records carry a source.','135 of 135 core records carry a source.'],
  ['80.6','80.7'],['82.4','80.0'],['85.1','82.7'],['0.1415%','0.107%'],['80.53','80.0'],['80.17','80.0']
])method=method.replaceAll(from,to);
const oldAudit='<div class="source-audit"><div><strong>14 / 14</strong><span>Season results</span></div><div><strong>12 / 12</strong><span>Foundation assets</span></div><div><strong>13 / 13</strong><span>Trade chains</span></div><div><strong>14 / 14</strong><span>Draft classes</span></div><div><strong>39 / 39</strong><span>Prospect records</span></div><div><strong>20 / 20</strong><span>Major acquisitions</span></div><div><strong>7 / 7</strong><span>Peak-team rows</span></div><div><strong>6 / 6</strong><span>Postseason cases</span></div><div><strong>7 / 7</strong><span>Durability seasons</span></div><div><strong>8 / 8</strong><span>Retention decisions</span></div><div><strong>8 / 8</strong><span>Decline signals</span></div><div><strong>8 / 8</strong><span>2021 teardown moves</span></div><div><strong>4 / 4</strong><span>Second-build seasons</span></div></div>';
const newAudit='<div class="source-audit"><div><strong>14 / 14</strong><span>Season results</span></div><div><strong>16 / 16</strong><span>Core asset records</span></div><div><strong>9 / 9</strong><span>Foundation acquisition events</span></div><div><strong>14 / 14</strong><span>Draft classes</span></div><div><strong>18 / 18</strong><span>Prospect records</span></div><div><strong>7 / 7</strong><span>Trade conversions</span></div><div><strong>14 / 14</strong><span>Veteran additions</span></div><div><strong>5 / 5</strong><span>Roster-architecture rows</span></div><div><strong>5 / 5</strong><span>Peak-team rows</span></div><div><strong>6 / 6</strong><span>Postseason cases</span></div><div><strong>7 / 7</strong><span>Retention decisions</span></div><div><strong>6 / 6</strong><span>Decline signals</span></div><div><strong>5 / 5</strong><span>2021 teardown trades</span></div><div><strong>5 / 5</strong><span>Teardown asset-tree rows</span></div><div><strong>4 / 4</strong><span>Second-build seasons</span></div></div>';
method=replaceRequired(method,oldAudit,newAudit,'methodology evidence audit');
method=method.replace('Duplicate summary tabs are excluded from the 160 count so the public evidence number is not inflated.','Formula/summary rows are excluded from the 135 core-record count; the audit counts the 15 structured evidence registers listed above.');
method=method.replace('The exact grade moves. The non-dynasty conclusion remains robust.','99.8% of unrestricted tests and 100% of bounded plausible tests score the lifecycle at 70 or better. Roughly half reach 80. The non-dynasty conclusion remains structural: the window has one pennant and one title.');
method=method.replace('<article><strong>0%</strong><span>bounded models ≥90</span></article>','<article><strong>0%</strong><span>bounded models ≥90</span></article>');
await writeFile(cubsResearchPath,method);

const homePath=resolve(dist,'index.html');let home=await readFile(homePath,'utf8');
if(!home.includes('Did the Cubs build a dynasty—or one great championship window?')){const tile=`<article class="report-tile"><div class="report-number">004</div><div class="report-tile-body"><p>MLB · COMPLETED SEASONS 2012–2025</p><h3>${escapeHtml(cubs.publicQuestion)}</h3><span>${escapeHtml(cubs.subtitle)}</span><p>${escapeHtml(cubs.summary)}</p></div><div class="report-tile-result"><strong>${Number(cubs.finalScore).toFixed(1)}</strong><small>${escapeHtml(cubs.resultLabel)}</small><a href="reports/cubs/index.html">Start the story</a></div></article>`;home=home.replace('        <article class="report-tile planned">',`${tile}\n        <article class="report-tile planned">`)}
if(!home.includes('/report-004-site.js'))home=home.replace('</body>','<script src="/report-004-site.js" defer></script>\n</body>');
await writeFile(homePath,home);
const researchPath=resolve(dist,'research','index.html');let research=await readFile(researchPath,'utf8');
if(!research.includes('/report-004-site.js')){research=research.replace('</body>','<script src="/report-004-site.js" defer></script>\n</body>');await writeFile(researchPath,research)}
console.log(`Finalized audited Report 004 with ${assets.length} rights-approved Cubs images, an ${Number(cubs.finalScore).toFixed(1)} lifecycle score and ${cubs.coreEvidenceRecords}/${cubs.coreEvidenceRecords} sourced core evidence records.`);
