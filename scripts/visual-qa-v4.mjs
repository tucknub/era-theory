import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const base=process.env.ERA_THEORY_QA_BASE||'http://127.0.0.1:4173';
const out=resolve(process.cwd(),'screenshots');await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});const failures=[];
const desktop={width:1536,height:1000},mobile={width:390,height:844};

async function preparePage(path,viewport){
  const page=await browser.newPage({viewport});const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}${path}`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts?.ready);await page.waitForTimeout(450);
  const metrics=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src'))}));
  if(metrics.scrollWidth>metrics.innerWidth+2)failures.push(`${path} ${viewport.width}px: horizontal overflow ${metrics.scrollWidth} > ${metrics.innerWidth}`);
  if(metrics.brokenImages.length)failures.push(`${path} ${viewport.width}px: broken images ${metrics.brokenImages.join(', ')}`);
  if(errors.length)failures.push(`${path} ${viewport.width}px: console/page errors ${errors.join(' | ')}`);
  return page;
}
async function screenshotTop(path,name,viewport){const p=await preparePage(path,viewport);await p.screenshot({path:resolve(out,name)});await p.close()}
async function screenshotSection(path,id,name,viewport){const p=await preparePage(path,viewport);const loc=p.locator(`#${id}`);if(await loc.count()!==1)failures.push(`${path}: missing unique #${id}`);else{await loc.scrollIntoViewIfNeeded();await p.evaluate(()=>window.scrollBy(0,-88));await p.waitForTimeout(120);await p.screenshot({path:resolve(out,name)})}await p.close()}

// All published story + methodology entry points.
for(const [path,stem] of [['/','home'],['/reports/colts/','colts'],['/reports/lions/','lions'],['/reports/pacers/','pacers'],['/reports/cubs/','cubs'],['/research/','research'],['/research/lions/','lions-research'],['/research/pacers/','pacers-research'],['/research/cubs/','cubs-research']]){
  await screenshotTop(path,`${stem}-desktop.png`,desktop);await screenshotTop(path,`${stem}-mobile.png`,mobile);
}
await screenshotSection('/','quick-verdict','home-stories-desktop.png',desktop);await screenshotSection('/','quick-verdict','home-stories-mobile.png',mobile);
await screenshotSection('/','reports','home-library-desktop.png',desktop);await screenshotSection('/research/','report-proof','research-report-proof-desktop.png',desktop);

// Preserve established report regression surfaces.
for(const s of ['polian','grigson','ballard','quarterback','evidence','sensitivity','final'])await screenshotSection('/reports/colts/',s,`colts-${s}-desktop.png`,desktop);
for(const s of ['millen','mayhew','stafford','quinn','holmes','trade','development','resilience','evidence','sensitivity','final'])await screenshotSection('/reports/lions/',s,`lions-${s}-desktop.png`,desktop);
for(const s of ['george','middle','haliburton','siakam','resilience','evidence','sensitivity','final'])await screenshotSection('/reports/pacers/',s,`pacers-${s}-desktop.png`,desktop);

// Report 004 agency-review surfaces.
for(const s of ['verdict','timeline','foundation','peak','dynasty','development','spending','control','teardown','recovery','evidence','sensitivity','final'])await screenshotSection('/reports/cubs/',s,`cubs-${s}-desktop.png`,desktop);
for(const s of ['foundation','peak','dynasty','development','control','recovery','evidence','sensitivity','final'])await screenshotSection('/reports/cubs/',s,`cubs-${s}-mobile.png`,mobile);

async function testMenu(path,navId,label){const p=await preparePage(path,mobile);const b=p.locator('.menu-button');if(await b.count()!==1)failures.push(`${label}: missing mobile menu button.`);else{await b.click();const nav=p.locator(navId);if(!(await nav.isVisible()))failures.push(`${label}: mobile navigation did not open.`);if((await b.getAttribute('aria-expanded'))!=='true')failures.push(`${label}: aria-expanded did not become true.`)}await p.close()}
await testMenu('/','#home-mobile-nav','Homepage');await testMenu('/reports/colts/','#mobile-nav','Colts');await testMenu('/reports/lions/','#lions-mobile-nav','Lions');await testMenu('/reports/pacers/','#pacers-mobile-nav','Pacers');await testMenu('/reports/cubs/','#cubs-mobile-nav','Cubs');await testMenu('/research/','#research-mobile-nav','Research hub');await testMenu('/research/cubs/','#research-mobile-nav','Cubs methodology');

// Four-story cross-sport homepage.
{
  const p=await preparePage('/',desktop);const chooser=p.locator('#quick-verdict .verdict-lane');if(await chooser.count()!==4)failures.push(`Homepage chooser expected 4 reports, found ${await chooser.count()}.`);
  const text=(await p.locator('#quick-verdict').textContent())||'';for(const m of ['Indianapolis Colts','Detroit Lions','Indiana Pacers','Chicago Cubs','Bill Polian','Brad Holmes','Haliburton Core','Great championship window'])if(!text.includes(m))failures.push(`Homepage chooser missing ${m}.`);
  const proof=(await p.locator('.proof-after-story').textContent())||'';for(const m of ['83','1064','1,200,000','1064 / 1064'])if(!proof.includes(m))failures.push(`Homepage totals missing ${m}.`);
  const library=(await p.locator('#reports').textContent())||'';for(const m of ['Did the Cubs build a dynasty—or one great championship window?','005'])if(!library.includes(m))failures.push(`Homepage library missing ${m}.`);
  const guide=(await p.locator('.story-question-rail').textContent())||'';for(const m of ['Was 2016 really that dominant?','Why did the farm stop replenishing the roster?'])if(!guide.includes(m))failures.push(`Homepage fan-question rail missing Cubs marker: ${m}.`);
  const note=(await p.locator('.authentic-note').textContent())||'';if(!note.includes('NFL, NBA and MLB'))failures.push('Homepage authentic-history note does not identify NFL, NBA and MLB.');await p.close();
}

// Research hub totals + MLB-specific model/source entry.
{
  const p=await preparePage('/research/',desktop);const proof=p.locator('#report-proof');if(await proof.count()!==1)failures.push('Research hub missing report-proof chooser.');const t=(await proof.textContent())||'';for(const m of ['Indianapolis Colts','Detroit Lions','Indiana Pacers','Chicago Cubs','401','328','175','160','1064','83','1,200,000'])if(!t.includes(m))failures.push(`Research hub proof missing ${m}.`);
  const audit=(await p.locator('.audit-strip').textContent())||'';for(const m of ['83','1064','1064 / 1064','1,200,000'])if(!audit.includes(m))failures.push(`Research audit totals missing ${m}.`);
  const model=(await p.locator('#model').textContent())||'';if(!model.includes('MLB rebuild-lifecycle model'))failures.push('Research hub does not explain Report 004 MLB lifecycle model.');const sources=(await p.locator('#sources').textContent())||'';if(!sources.includes('MLB Report 004')||!sources.includes('Cubs methodology'))failures.push('Research hub missing Cubs source/methodology entry.');await p.close();
}

// Existing sensitivity behavior stays intact.
{
 const p=await preparePage('/reports/colts/',desktop),select=p.locator('#scenario'),submit=p.locator('#model-controls button[type="submit"]'),winner=p.locator('#model-winner');for(const [s,e] of [['published','Bill Polian'],['draftOnly','Chris Ballard'],['resilienceOnly','Ryan Grigson']]){await select.selectOption(s);await submit.click();if((await winner.textContent())?.trim()!==e)failures.push(`Colts ${s} regression.`)}await p.close();
}
{
 const p=await preparePage('/reports/lions/',desktop),select=p.locator('#lions-scenario'),submit=p.locator('#lions-model-controls button[type="submit"]'),winner=p.locator('#lions-model-winner');for(const s of ['published','draftOnly','resilienceOnly']){await select.selectOption(s);await submit.click();if((await winner.textContent())?.trim()!=='Brad Holmes')failures.push(`Lions ${s} regression.`)}await p.close();
}
{
 const p=await preparePage('/reports/pacers/',desktop);const expectations={published:['79.3','59.9','83.6'],durability:['78.1','63.6','72.9'],resilience:['78.3','64.2','73.4']};for(const [preset,e] of Object.entries(expectations)){await p.locator(`[data-preset="${preset}"]`).click();const a=[await p.locator('#pg-score').textContent(),await p.locator('#os-score').textContent(),await p.locator('#hali-score').textContent()].map(v=>v?.trim());if(a.join('|')!==e.join('|'))failures.push(`Pacers ${preset} regression: ${a.join('/')}`)}await p.close();
}

// Cubs lifecycle sensitivity must match the audited workbook.
{
  const p=await preparePage('/reports/cubs/',desktop);const expectations={published:['80.6','Championship-caliber rebuild / great window'],title:['82.4','Championship-caliber rebuild / great window'],dynasty:['77.6','Successful but incomplete lifecycle'],development:['74.9','Successful but incomplete lifecycle'],recovery:['79.6','Successful but incomplete lifecycle']};
  for(const [preset,[expectedScore,expectedClass]] of Object.entries(expectations)){await p.locator(`[data-preset="${preset}"]`).click();const score=(await p.locator('#cubs-preset-score').textContent())?.trim(),klass=(await p.locator('#cubs-preset-class').textContent())?.trim();if(score!==expectedScore)failures.push(`Cubs ${preset}: expected ${expectedScore}, got ${score}`);if(klass!==expectedClass)failures.push(`Cubs ${preset}: expected ${expectedClass}, got ${klass}`)}
  const sources=await p.locator('main img').evaluateAll(imgs=>imgs.map(i=>i.getAttribute('src')));for(const src of ['/assets/archive/theo-epstein-cubs-2016.jpg','/assets/archive/kris-bryant-cubs-2016.jpg','/assets/archive/anthony-rizzo-cubs-2016.jpg','/assets/archive/jake-arrieta-world-series-2016.jpg','/assets/archive/cubs-world-series-celebration-2016.jpg','/assets/archive/pete-crow-armstrong-cubs-system-2022.jpg'])if(!sources.includes(src))failures.push(`Cubs report missing authentic source ${src}.`);await p.close();
}

// Cubs public methodology: evidence proof only, never private workbook.
{
 const p=await preparePage('/research/cubs/',desktop);const text=(await p.locator('main').textContent())||'';for(const m of ['14','160','160 / 160','300,000','Eight MLB lifecycle questions','0 / 100,000','Recent drafts are immature'])if(!text.includes(m))failures.push(`Cubs methodology missing ${m}.`);if(/docs\.google\.com\/spreadsheets/i.test(await p.content()))failures.push('Cubs methodology leaks private Google Sheet URL.');await p.close();
}

await browser.close();
if(failures.length){console.error('Visual QA v4 failed:\n- '+failures.join('\n- '));process.exit(1)}
console.log('Visual QA v4 passed: four published stories across NFL/NBA/MLB; 83 seasons, 1,064/1,064 sourced records and 1,200,000 tests; Colts/Lions/Pacers sensitivity regressions intact; Cubs authentic photography, lifecycle chapters, methodology, mobile navigation and five audited sensitivity presets all render without overflow, broken images or browser errors.');
