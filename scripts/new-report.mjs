import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, ...parts] = arg.replace(/^--/, '').split('=');
  return [key, parts.join('=')];
}));

const slug = (args.slug || '').trim().toLowerCase();
const title = (args.title || '').trim();
const number = (args.number || '').trim();
const sport = (args.sport || '').trim();

if (!slug || !title || !number) {
  console.error('Usage: npm run new-report -- --number=002 --slug=example --title="Example Era Lab" [--sport="Basketball"]');
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('Slug must use lowercase letters, numbers, and single hyphens only.');
  process.exit(1);
}

if (!/^\d{3}$/.test(number)) {
  console.error('Report number must be three digits, for example 002.');
  process.exit(1);
}

const root = resolve(import.meta.dirname, '..');
const target = resolve(root, 'workbench', slug);

try {
  await access(target, constants.F_OK);
  console.error(`Refusing to overwrite existing workbench: ${target}`);
  process.exit(1);
} catch {
  // Expected when the workbench does not exist yet.
}

await mkdir(target, { recursive: true });

const manifest = {
  number,
  slug,
  title,
  sport: sport || 'TBD',
  status: 'research-draft',
  publicationRoute: `src/reports/${slug}/index.html`,
  researchVisibility: 'private',
  eraDefinitions: [],
  scoringCutoff: null,
  excludedIncompleteEvidence: [],
  dimensions: [],
  finalRanking: null,
  sensitivityResult: null,
  sourceAudit: {
    coreRows: 0,
    sourcedRows: 0,
    requiredBeforePublication: '100% of core rows'
  }
};

const checklist = `# ${title} — Research Workbench\n\nReport ${number} is a private research draft. Nothing in this directory is published by the site build.\n\n## Gate 1 — Define the question\n\n- [ ] Define the leadership eras and exact boundaries.\n- [ ] Define what the report is trying to decide.\n- [ ] Record inherited conditions for each era.\n- [ ] Define the completed-season/date cutoff.\n- [ ] List active or unresolved evidence that must be excluded.\n\n## Gate 2 — Build the evidence\n\n- [ ] Era and leadership timeline.\n- [ ] Season-level results.\n- [ ] Sport-specific cornerstone/premium-position decisions.\n- [ ] Talent acquisition and development.\n- [ ] Trades/contracts/free agency/resource allocation.\n- [ ] Coaching and organizational ecosystem.\n- [ ] Peak production and retention.\n- [ ] Injury/absence/disruption/adversity response.\n- [ ] Row-level source fields for every core evidence register.\n\n## Gate 3 — Model the eras\n\n- [ ] Define dimensions and formulas from this sport's evidence.\n- [ ] Publish weights totaling 100%.\n- [ ] Produce a final scorecard.\n- [ ] Run plausible alternative weighting scenarios.\n- [ ] Run leave-one-dimension-out tests.\n- [ ] Run randomized-weight robustness tests when appropriate.\n\n## Gate 4 — Publication\n\n- [ ] 100% of core evidence rows have at least one source.\n- [ ] Recent/high-risk facts receive primary-source cross-checks.\n- [ ] Full private research asset stays private unless intentionally released.\n- [ ] Public methodology/source page explains enough to audit the conclusion.\n- [ ] Real people/events use authentic imagery only.\n- [ ] Desktop/mobile QA passes.\n- [ ] Add the report to src/data/reports.json only when publication-ready.\n- [ ] Move/build the final page at src/reports/${slug}/index.html.\n`;

await writeFile(resolve(target, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(resolve(target, 'research-checklist.md'), checklist);

console.log(`Created private research workbench: workbench/${slug}/`);
console.log('It is outside src/, so the production build will not publish it.');
