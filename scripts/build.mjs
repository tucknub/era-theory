import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const src = resolve(root, 'src');
const dist = resolve(root, 'dist');

const registry = JSON.parse(await readFile(resolve(src, 'data', 'reports.json'), 'utf8'));
if (registry.schemaVersion !== 1 || !Array.isArray(registry.reports)) {
  throw new Error('Invalid report registry schema.');
}

const published = registry.reports.filter(report => report.status === 'published');
const numbers = new Set();
const slugs = new Set();
for (const report of published) {
  if (!report.number || !report.slug || !report.route) throw new Error('Published report is missing number, slug, or route.');
  if (numbers.has(report.number)) throw new Error(`Duplicate report number: ${report.number}`);
  if (slugs.has(report.slug)) throw new Error(`Duplicate report slug: ${report.slug}`);
  if (report.route.startsWith('/') || report.route.includes('..')) throw new Error(`Unsafe report route: ${report.route}`);
  numbers.add(report.number);
  slugs.add(report.slug);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(src, dist, { recursive: true });
console.log(`Built Era Theory into dist/ with ${published.length} published report${published.length === 1 ? '' : 's'}.`);
