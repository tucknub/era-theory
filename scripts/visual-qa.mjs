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
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => consoleErrors.push(error.message));
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts?.ready);

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    brokenImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.getAttribute('src')),
  }));
  if (metrics.scrollWidth > metrics.innerWidth + 2) failures.push(`${path} ${viewport.width}px: horizontal overflow ${metrics.scrollWidth} > ${metrics.innerWidth}`);
  if (metrics.brokenImages.length) failures.push(`${path} ${viewport.width}px: broken images ${metrics.brokenImages.join(', ')}`);
  if (consoleErrors.length) failures.push(`${path} ${viewport.width}px: console/page errors ${consoleErrors.join(' | ')}`);
  return page;
}

async function screenshotTop(path, name, viewport) {
  const page = await preparePage(path, viewport);
  await page.screenshot({ path: resolve(out, name) });
  await page.close();
}

async function screenshotSection(path, section, name, viewport) {
  const page = await preparePage(path, viewport);
  const locator = page.locator(`#${section}`);
  if (await locator.count() !== 1) {
    failures.push(`${path}: missing unique #${section}`);
  } else {
    await locator.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -88));
    await page.waitForTimeout(120);
    await page.screenshot({ path: resolve(out, name) });
  }
  await page.close();
}

const desktop = { width: 1536, height: 1000 };
const mobile = { width: 390, height: 844 };

await screenshotTop('/', 'home-desktop.png', desktop);
await screenshotTop('/', 'home-mobile.png', mobile);
await screenshotSection('/', 'quick-verdict', 'home-stories-desktop.png', desktop);
await screenshotSection('/', 'quick-verdict', 'home-stories-mobile.png', mobile);
await screenshotSection('/', 'reports', 'home-library-desktop.png', desktop);
await screenshotSection('/', 'reports', 'home-library-mobile.png', mobile);
await screenshotTop('/reports/colts/', 'colts-desktop.png', desktop);
await screenshotTop('/reports/colts/', 'colts-mobile.png', mobile);
await screenshotTop('/reports/lions/', 'lions-desktop.png', desktop);
await screenshotTop('/reports/lions/', 'lions-mobile.png', mobile);
await screenshotTop('/research/', 'research-desktop.png', desktop);
await screenshotTop('/research/', 'research-mobile.png', mobile);
await screenshotSection('/research/', 'report-proof', 'research-report-proof-desktop.png', desktop);
await screenshotSection('/research/', 'report-proof', 'research-report-proof-mobile.png', mobile);
await screenshotTop('/research/lions/', 'lions-research-desktop.png', desktop);
await screenshotTop('/research/lions/', 'lions-research-mobile.png', mobile);

for (const section of ['verdict','eras','questions','results','polian','grigson','ballard','quarterback','drafts','transactions','coaching','evidence','sensitivity','final']) {
  await screenshotSection('/reports/colts/', section, `colts-${section}-desktop.png`, desktop);
}
for (const section of ['polian','grigson','ballard','quarterback','evidence','sensitivity','final']) {
  await screenshotSection('/reports/colts/', section, `colts-${section}-mobile.png`, mobile);
}

for (const section of ['verdict','eras','questions','millen','mayhew','stafford','quinn','patricia','holmes','trade','development','resilience','evidence','sensitivity','final']) {
  await screenshotSection('/reports/lions/', section, `lions-${section}-desktop.png`, desktop);
}
for (const section of ['millen','mayhew','stafford','quinn','holmes','trade','development','resilience','evidence','sensitivity','final']) {
  await screenshotSection('/reports/lions/', section, `lions-${section}-mobile.png`, mobile);
}

async function testMobileMenu(path, navId, label) {
  const page = await preparePage(path, mobile);
  const button = page.locator('.menu-button');
  await button.click();
  const nav = page.locator(navId);
  if (!(await nav.isVisible())) failures.push(`${label} mobile navigation did not open.`);
  if ((await button.getAttribute('aria-expanded')) !== 'true') failures.push(`${label} mobile menu aria-expanded did not become true.`);
  await page.close();
}
await testMobileMenu('/', '#home-mobile-nav', 'Homepage');
await testMobileMenu('/reports/colts/', '#mobile-nav', 'Colts');
await testMobileMenu('/reports/lions/', '#lions-mobile-nav', 'Lions');
await testMobileMenu('/research/', '#research-mobile-nav', 'Research hub');
await testMobileMenu('/research/lions/', '#research-mobile-nav', 'Detroit research');

// The site homepage must behave like a multi-report library, not a Colts-only landing page.
{
  const page = await preparePage('/', desktop);
  const title = (await page.locator('#home-title').textContent())?.trim() || '';
  if (title !== 'Sports debates, researched all the way through.') failures.push(`Homepage title did not switch to site-first language: ${title}`);

  const chooser = page.locator('#quick-verdict .verdict-lane');
  if ((await chooser.count()) !== 2) failures.push(`Homepage story chooser expected 2 published reports, found ${await chooser.count()}.`);
  const chooserText = (await page.locator('#quick-verdict').textContent()) || '';
  for (const marker of ['Indianapolis Colts','Detroit Lions','Bill Polian','Brad Holmes']) {
    if (!chooserText.includes(marker)) failures.push(`Homepage story chooser missing marker: ${marker}`);
  }

  const proofText = (await page.locator('.proof-after-story').textContent()) || '';
  for (const marker of ['53','729','600,000','729 / 729']) {
    if (!proofText.includes(marker)) failures.push(`Homepage combined proof totals missing marker: ${marker}`);
  }

  const libraryText = (await page.locator('#reports').textContent()) || '';
  for (const marker of ['Which Colts front office actually built the best era?','Who actually changed the Detroit Lions?','003']) {
    if (!libraryText.includes(marker)) failures.push(`Homepage report library missing marker: ${marker}`);
  }

  const headerAction = page.locator('.site-header .header-action');
  if ((await headerAction.textContent())?.trim() !== 'Explore stories') failures.push('Homepage header CTA did not become Explore stories.');
  await page.close();
}

// The general methodology entry point must expose both report audits and combined site totals.
{
  const page = await preparePage('/research/', desktop);
  const proof = page.locator('#report-proof');
  if ((await proof.count()) !== 1) failures.push('Research hub missing #report-proof chooser.');
  const proofText = (await proof.textContent()) || '';
  for (const marker of ['Indianapolis Colts','Detroit Lions','401','328','729','53','600,000']) {
    if (!proofText.includes(marker)) failures.push(`Research hub proof chooser missing marker: ${marker}`);
  }
  const detroitLink = proof.locator('a[href="../research/lions/index.html"], a[href="lions/index.html"]');
  if ((await detroitLink.count()) < 1) failures.push('Research hub missing Detroit methodology link.');
  const auditText = (await page.locator('.audit-strip').textContent()) || '';
  for (const marker of ['53','729','729 / 729','600,000']) {
    if (!auditText.includes(marker)) failures.push(`Research hub combined audit strip missing marker: ${marker}`);
  }
  const sourceText = (await page.locator('#sources').textContent()) || '';
  if (!sourceText.includes('Detroit Lions')) failures.push('Research hub sources do not include Detroit Lions.');
  const headerAction = page.locator('.site-header .header-action');
  if ((await headerAction.textContent())?.trim() !== 'Explore stories') failures.push('Research hub header CTA did not become Explore stories.');
  await page.close();
}

async function testDialog(path, dialogId, label) {
  const page = await preparePage(path, desktop);
  await page.locator('[data-open-methodology]').first().click();
  const dialog = page.locator(dialogId);
  if (!(await dialog.isVisible())) failures.push(`${label} methodology dialog did not open.`);
  await page.locator('.dialog-close').click();
  if (await dialog.isVisible()) failures.push(`${label} methodology dialog did not close.`);
  await page.close();
}
await testDialog('/reports/colts/', '#methodology-dialog', 'Colts');
await testDialog('/reports/lions/', '#lions-methodology-dialog', 'Lions');

// Colts sensitivity preserves the known counterexamples.
{
  const page = await preparePage('/reports/colts/', desktop);
  await page.locator('#sensitivity').scrollIntoViewIfNeeded();
  const select = page.locator('#scenario');
  const submit = page.locator('#model-controls button[type="submit"]');
  const winner = page.locator('#model-winner');
  for (const [scenario, expected] of [['published','Bill Polian'],['draftOnly','Chris Ballard'],['resilienceOnly','Ryan Grigson']]) {
    await select.selectOption(scenario); await submit.click();
    const actual = (await winner.textContent())?.trim();
    if (actual !== expected) failures.push(`Colts sensitivity ${scenario}: expected ${expected}, got ${actual}`);
  }
  await page.close();
}

// Detroit's defining robustness property: Holmes remains first even in the extreme models.
{
  const page = await preparePage('/reports/lions/', desktop);
  await page.locator('#sensitivity').scrollIntoViewIfNeeded();
  const select = page.locator('#lions-scenario');
  const submit = page.locator('#lions-model-controls button[type="submit"]');
  const winner = page.locator('#lions-model-winner');
  for (const scenario of ['published','draftOnly','resilienceOnly']) {
    await select.selectOption(scenario); await submit.click();
    const actual = (await winner.textContent())?.trim();
    if (actual !== 'Brad Holmes') failures.push(`Lions sensitivity ${scenario}: expected Brad Holmes, got ${actual}`);
  }
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error('Visual QA failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('Visual QA passed: homepage and research hub present Colts and Lions as first-class published reports with correct combined totals; authentic images load; layouts do not overflow; mobile navigation works; key story sections render; and both reports preserve their expected sensitivity behavior.');
