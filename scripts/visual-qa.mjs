import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.ERA_THEORY_QA_BASE || 'http://127.0.0.1:4173';
const out = resolve(process.cwd(), 'screenshots');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];

async function preparePage(path, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts?.ready);
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: innerWidth,
    brokenImages: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'))
  }));
  if (metrics.scrollWidth > metrics.innerWidth + 2) failures.push(`${path} ${viewport.width}px: horizontal overflow ${metrics.scrollWidth} > ${metrics.innerWidth}`);
  if (metrics.brokenImages.length) failures.push(`${path} ${viewport.width}px: broken images ${metrics.brokenImages.join(', ')}`);
  if (errors.length) failures.push(`${path} ${viewport.width}px: console/page errors ${errors.join(' | ')}`);
  return page;
}

async function screenshotTop(path, name, viewport) {
  const page = await preparePage(path, viewport);
  await page.screenshot({ path: resolve(out, name) });
  await page.close();
}
async function screenshotSection(path, id, name, viewport) {
  const page = await preparePage(path, viewport);
  const locator = page.locator(`#${id}`);
  if (await locator.count() !== 1) failures.push(`${path}: missing unique #${id}`);
  else {
    await locator.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -88));
    await page.waitForTimeout(120);
    await page.screenshot({ path: resolve(out, name) });
  }
  await page.close();
}

const desktop = { width: 1536, height: 1000 };
const mobile = { width: 390, height: 844 };

// Site-wide surfaces.
for (const [path, stem] of [['/','home'],['/reports/colts/','colts'],['/reports/lions/','lions'],['/reports/pacers/','pacers'],['/research/','research'],['/research/lions/','lions-research'],['/research/pacers/','pacers-research']]) {
  await screenshotTop(path, `${stem}-desktop.png`, desktop);
  await screenshotTop(path, `${stem}-mobile.png`, mobile);
}
for (const [id, stem] of [['quick-verdict','home-stories'],['reports','home-library']]) {
  await screenshotSection('/', id, `${stem}-desktop.png`, desktop);
  await screenshotSection('/', id, `${stem}-mobile.png`, mobile);
}
await screenshotSection('/research/', 'report-proof', 'research-report-proof-desktop.png', desktop);
await screenshotSection('/research/', 'report-proof', 'research-report-proof-mobile.png', mobile);

// Preserve the established Report 001 and 002 visual regression surfaces.
for (const section of ['polian','grigson','ballard','quarterback','evidence','sensitivity','final']) {
  await screenshotSection('/reports/colts/', section, `colts-${section}-desktop.png`, desktop);
}
for (const section of ['millen','mayhew','stafford','quinn','holmes','trade','development','resilience','evidence','sensitivity','final']) {
  await screenshotSection('/reports/lions/', section, `lions-${section}-desktop.png`, desktop);
}

// Report 003 visual proof: authentic people + decisive story chapters, desktop and mobile.
for (const section of ['verdict','chain','questions','george','trade2017','middle','haliburton','system','siakam','resilience','tank','evidence','sensitivity','final']) {
  await screenshotSection('/reports/pacers/', section, `pacers-${section}-desktop.png`, desktop);
}
for (const section of ['george','middle','haliburton','siakam','resilience','evidence','sensitivity','final']) {
  await screenshotSection('/reports/pacers/', section, `pacers-${section}-mobile.png`, mobile);
}

async function testMobileMenu(path, navId, label) {
  const page = await preparePage(path, mobile);
  const button = page.locator('.menu-button');
  if (await button.count() !== 1) failures.push(`${label}: missing mobile menu button.`);
  else {
    await button.click();
    const nav = page.locator(navId);
    if (!(await nav.isVisible())) failures.push(`${label} mobile navigation did not open.`);
    if ((await button.getAttribute('aria-expanded')) !== 'true') failures.push(`${label} mobile menu aria-expanded did not become true.`);
  }
  await page.close();
}
await testMobileMenu('/', '#home-mobile-nav', 'Homepage');
await testMobileMenu('/reports/colts/', '#mobile-nav', 'Colts');
await testMobileMenu('/reports/lions/', '#lions-mobile-nav', 'Lions');
await testMobileMenu('/reports/pacers/', '#pacers-mobile-nav', 'Pacers');
await testMobileMenu('/research/', '#research-mobile-nav', 'Research hub');
await testMobileMenu('/research/lions/', '#research-mobile-nav', 'Detroit research');
await testMobileMenu('/research/pacers/', '#research-mobile-nav', 'Pacers research');

// Homepage must now be a three-story, cross-sport library.
{
  const page = await preparePage('/', desktop);
  const title = (await page.locator('#home-title').textContent())?.trim() || '';
  if (title !== 'Sports debates, researched all the way through.') failures.push(`Homepage title mismatch: ${title}`);
  const chooser = page.locator('#quick-verdict .verdict-lane');
  if ((await chooser.count()) !== 3) failures.push(`Homepage story chooser expected 3 published reports, found ${await chooser.count()}.`);
  const chooserText = (await page.locator('#quick-verdict').textContent()) || '';
  for (const marker of ['Indianapolis Colts','Detroit Lions','Indiana Pacers','Bill Polian','Brad Holmes','Haliburton Core']) if (!chooserText.includes(marker)) failures.push(`Homepage chooser missing marker: ${marker}`);
  const proofText = (await page.locator('.proof-after-story').textContent()) || '';
  for (const marker of ['69','904','900,000','904 / 904']) if (!proofText.includes(marker)) failures.push(`Homepage combined proof totals missing marker: ${marker}`);
  const libraryText = (await page.locator('#reports').textContent()) || '';
  for (const marker of ['Which Colts front office actually built the best era?','Who actually changed the Detroit Lions?','How did the Pacers keep turning one star into the next?','004']) if (!libraryText.includes(marker)) failures.push(`Homepage library missing marker: ${marker}`);
  const note = (await page.locator('.authentic-note').textContent()) || '';
  if (!note.includes('NFL and NBA')) failures.push('Homepage authentic-history note does not identify the cross-league library.');
  await page.close();
}

// General research hub must expose all three audits and cross-sport totals.
{
  const page = await preparePage('/research/', desktop);
  const proof = page.locator('#report-proof');
  if ((await proof.count()) !== 1) failures.push('Research hub missing #report-proof chooser.');
  const proofText = (await proof.textContent()) || '';
  for (const marker of ['Indianapolis Colts','Detroit Lions','Indiana Pacers','401','328','175','904','69','900,000']) if (!proofText.includes(marker)) failures.push(`Research hub proof chooser missing marker: ${marker}`);
  const auditText = (await page.locator('.audit-strip').textContent()) || '';
  for (const marker of ['69','904','904 / 904','900,000']) if (!auditText.includes(marker)) failures.push(`Research hub audit strip missing marker: ${marker}`);
  const modelText = (await page.locator('#model').textContent()) || '';
  if (!modelText.includes('eight-dimension NBA')) failures.push('Research hub does not explain the NBA-specific eight-dimension model.');
  await page.close();
}

async function testDialog(path, dialogId, label) {
  const page = await preparePage(path, desktop);
  const opener = page.locator('[data-open-methodology]').first();
  if (await opener.count() !== 1) { failures.push(`${label}: methodology opener missing.`); await page.close(); return; }
  await opener.click();
  const dialog = page.locator(dialogId);
  if (!(await dialog.isVisible())) failures.push(`${label} methodology dialog did not open.`);
  await page.locator('.dialog-close').click();
  if (await dialog.isVisible()) failures.push(`${label} methodology dialog did not close.`);
  await page.close();
}
await testDialog('/reports/colts/', '#methodology-dialog', 'Colts');
await testDialog('/reports/lions/', '#lions-methodology-dialog', 'Lions');

// Report 001 sensitivity counterexamples remain intact.
{
  const page = await preparePage('/reports/colts/', desktop);
  const select = page.locator('#scenario'), submit = page.locator('#model-controls button[type="submit"]'), winner = page.locator('#model-winner');
  for (const [scenario, expected] of [['published','Bill Polian'],['draftOnly','Chris Ballard'],['resilienceOnly','Ryan Grigson']]) {
    await select.selectOption(scenario); await submit.click();
    const actual = (await winner.textContent())?.trim();
    if (actual !== expected) failures.push(`Colts sensitivity ${scenario}: expected ${expected}, got ${actual}`);
  }
  await page.close();
}

// Report 002 remains a robust Holmes sweep.
{
  const page = await preparePage('/reports/lions/', desktop);
  const select = page.locator('#lions-scenario'), submit = page.locator('#lions-model-controls button[type="submit"]'), winner = page.locator('#lions-model-winner');
  for (const scenario of ['published','draftOnly','resilienceOnly']) {
    await select.selectOption(scenario); await submit.click();
    const actual = (await winner.textContent())?.trim();
    if (actual !== 'Brad Holmes') failures.push(`Lions sensitivity ${scenario}: expected Brad Holmes, got ${actual}`);
  }
  await page.close();
}

// Report 003 must visibly preserve its qualified, preference-sensitive result.
{
  const page = await preparePage('/reports/pacers/', desktop);
  const buttons = page.locator('[data-preset]');
  if ((await buttons.count()) !== 5) failures.push(`Pacers sensitivity expected 5 presets, found ${await buttons.count()}.`);
  const expectations = {
    published:['79.3','59.9','83.6','Haliburton'],
    equal:['79.6','63.2','80.7','Haliburton'],
    durability:['78.1','63.6','72.9','Paul George'],
    postseason:['78.0','50.7','86.3','Haliburton'],
    resilience:['78.3','64.2','73.4','Paul George']
  };
  for (const [preset, expected] of Object.entries(expectations)) {
    await page.locator(`[data-preset="${preset}"]`).click();
    const scores = [await page.locator('#pg-score').textContent(), await page.locator('#os-score').textContent(), await page.locator('#hali-score').textContent()].map(v => v?.trim());
    if (scores.join('|') !== expected.slice(0,3).join('|')) failures.push(`Pacers ${preset} scores expected ${expected.slice(0,3).join('/')}, got ${scores.join('/')}`);
    const numeric = scores.map(Number); const winner = ['Paul George','Oladipo / Sabonis','Haliburton'][numeric.indexOf(Math.max(...numeric))];
    if (winner !== expected[3]) failures.push(`Pacers ${preset}: expected ${expected[3]} winner, got ${winner}.`);
  }
  const heroSources = await page.locator('.conversion-hero img').evaluateAll(imgs => imgs.map(i => i.getAttribute('src')));
  for (const source of ['/assets/archive/paul-george-pacers-2014.jpg','/assets/archive/victor-oladipo-pacers-2018.jpg','/assets/archive/domantas-sabonis-pacers-2018.jpg','/assets/archive/tyrese-haliburton-pacers-2025.jpg']) if (!heroSources.includes(source)) failures.push(`Pacers hero missing authentic archive source ${source}.`);
  await page.close();
}

// Pacers methodology must be public-proof only, with no private workbook leak.
{
  const page = await preparePage('/research/pacers/', desktop);
  const text = (await page.locator('main').textContent()) || '';
  for (const marker of ['16','175','175 / 175','300,000','Eight NBA questions','Zubac trade is unresolved']) if (!text.includes(marker)) failures.push(`Pacers methodology missing marker: ${marker}`);
  const html = await page.content();
  if (/docs\.google\.com\/spreadsheets/i.test(html)) failures.push('Pacers methodology exposes private Google Sheet URL.');
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error('Visual QA failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('Visual QA passed: three-story NFL/NBA homepage and research hub render with 69 seasons, 904/904 sourced records and 900,000 model tests; Colts and Lions regressions remain intact; Pacers authentic archive imagery loads on desktop/mobile; Report 003 preserves its qualified Haliburton verdict and Paul George durability/resilience counterexamples; no tested surface has overflow, broken images or console/page errors.');
