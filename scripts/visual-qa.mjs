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
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => consoleErrors.push(error.message));
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts?.ready);

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    brokenImages: [...document.images]
      .filter(image => !image.complete || image.naturalWidth === 0)
      .map(image => image.getAttribute('src')),
  }));
  if (metrics.scrollWidth > metrics.innerWidth + 2) {
    failures.push(`${path} ${viewport.width}px: horizontal overflow ${metrics.scrollWidth} > ${metrics.innerWidth}`);
  }
  if (metrics.brokenImages.length) {
    failures.push(`${path} ${viewport.width}px: broken images ${metrics.brokenImages.join(', ')}`);
  }
  if (consoleErrors.length) {
    failures.push(`${path} ${viewport.width}px: console/page errors ${consoleErrors.join(' | ')}`);
  }
  return page;
}

async function screenshotTop(path, name, viewport) {
  const page = await preparePage(path, viewport);
  await page.screenshot({ path: resolve(out, name) });
  await page.close();
}

async function screenshotSection(section, name, viewport) {
  const page = await preparePage('/reports/colts/', viewport);
  const locator = page.locator(`#${section}`);
  if (await locator.count() !== 1) {
    failures.push(`Missing unique #${section}`);
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
await screenshotTop('/reports/colts/', 'colts-desktop.png', desktop);
await screenshotTop('/reports/colts/', 'colts-mobile.png', mobile);
await screenshotTop('/research/', 'research-desktop.png', desktop);
await screenshotTop('/research/', 'research-mobile.png', mobile);

for (const section of ['verdict','eras','questions','results','polian','grigson','ballard','quarterback','drafts','transactions','coaching','evidence','sensitivity','final']) {
  await screenshotSection(section, `colts-${section}-desktop.png`, desktop);
}
for (const section of ['polian','grigson','ballard','quarterback','evidence','sensitivity','final']) {
  await screenshotSection(section, `colts-${section}-mobile.png`, mobile);
}

// Mobile menu behavior.
{
  const page = await preparePage('/reports/colts/', mobile);
  const button = page.locator('.menu-button');
  await button.click();
  const nav = page.locator('#mobile-nav');
  if (!(await nav.isVisible())) failures.push('Colts mobile navigation did not open.');
  if ((await button.getAttribute('aria-expanded')) !== 'true') failures.push('Colts mobile menu aria-expanded did not become true.');
  await page.close();
}

// Methodology dialog behavior.
{
  const page = await preparePage('/reports/colts/', desktop);
  await page.locator('[data-open-methodology]').first().click();
  const dialog = page.locator('#methodology-dialog');
  if (!(await dialog.isVisible())) failures.push('Methodology dialog did not open.');
  await page.locator('.dialog-close').click();
  if (await dialog.isVisible()) failures.push('Methodology dialog did not close.');
  await page.close();
}

// Sensitivity presets must produce the known counterexamples.
{
  const page = await preparePage('/reports/colts/', desktop);
  await page.locator('#sensitivity').scrollIntoViewIfNeeded();
  const select = page.locator('#scenario');
  const submit = page.locator('#model-controls button[type="submit"]');
  const winner = page.locator('#model-winner');

  const cases = [
    ['published', 'Bill Polian'],
    ['draftOnly', 'Chris Ballard'],
    ['resilienceOnly', 'Ryan Grigson'],
  ];
  for (const [scenario, expected] of cases) {
    await select.selectOption(scenario);
    await submit.click();
    const actual = (await winner.textContent())?.trim();
    if (actual !== expected) failures.push(`Sensitivity ${scenario}: expected ${expected}, got ${actual}`);
  }
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error('Visual QA failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('Visual QA passed: authentic images load, layouts do not overflow, menus/dialogs work, key story sections render, and sensitivity counterexamples remain correct.');
