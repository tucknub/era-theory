# Era Theory

Era Theory turns complicated sports arguments into guided, source-backed stories that an average fan can understand without giving up the deeper evidence.

The operating rule is simple:

> Tell me → Show me → Prove it.

A casual fan gets the question, answer, people, timeline and takeaway first. The complete scorecards, formulas, sources, caveats and robustness tests remain available underneath.

## Site structure

- `/` — Era Theory homepage and story library
- `/reports/colts/` — Report 001: Colts Era Lab
- `/research/` — plain-English methodology, evidence inventory, source policy and limitations
- `/image-credits.html` — authentic-image creator, license and transformation records
- `src/data/reports.json` — publication-safe registry of live reports
- `REPORT_TEMPLATE.md` — research, storytelling, imagery and publication rules for future reports

## Report 001: Colts Era Lab

The completed 1998–2025 Indianapolis Colts front-office study compares Bill Polian, Ryan Grigson and Chris Ballard.

- Bill Polian: 70.5
- Ryan Grigson: 61.1
- Chris Ballard: 47.8
- 28 completed seasons
- 401 core structured evidence records
- 401 / 401 core records source-linked
- Seven weighted dimensions
- 300,000 random-weight robustness simulations
- Interactive sensitivity model
- Guided chapters on results, Polian, Grigson, Ballard, quarterback, drafting, transactions, coaching and adversity

## Fan-first publication standard

Every Era Theory report should answer, in order:

1. What is the sports argument?
2. What is the quick answer?
3. Who and what should the fan recognize?
4. Why did the eras differ?
5. What visual evidence makes that difference obvious?
6. What did we learn?
7. Does the conclusion survive a deeper audit?

Do not lead a public report with methodology language, model terminology or raw evidence counts. Those establish credibility after the fan understands why the story matters.

Every important chart or comparison should make three things clear without requiring methodology knowledge:

- What am I looking at?
- Why should I care?
- What did we learn?

## Authentic imagery standard

Real people and real historical moments stay real.

Era Theory uses authentic, rights-reviewed source photography for recognizable athletes, executives, coaches, crowds, games, venues and historical events. The site may transform the presentation of that photography without substituting a synthetic person.

Allowed treatments include:

- responsive crops and focal points;
- true background removal / silhouette clipping;
- transparent or visually transparent cutout presentation;
- masking and edge fades;
- color grading, duotone and tonal normalization;
- layering and overlap with typography/data;
- atmosphere, lighting and texture around the authentic subject.

The photographed person must not be generated, redrawn, face-swapped or reconstructed. AI-generated design support may be used for abstract atmosphere, textures, lighting, maps, diagrams and other non-historical visual elements.

The Colts implementation includes a rights ledger, archive manifest, generated public image credits, self-hosted archived source files and a permanent authentic-cutout guard.

## Research privacy and transparency

The complete native research workbook remains the private evidence base. It is intentionally not published as an unrestricted public file.

The public `/research/` route publishes the research scope, evidence-register counts, model construction, robustness tests, source families, exclusions and known limitations. Production verification rejects private-workbook Google Sheets links when a report is marked `researchVisibility: "private"`.

## Starting another Era Theory report

Create a private local research workbench:

```bash
npm run new-report -- --number=002 --slug=example --title="Example Era Lab" --sport="Basketball"
```

The command creates `workbench/<slug>/` with a manifest and research checklist. `workbench/` is ignored by Git and is outside `src/`, so it cannot be published by the normal production build.

A report is added to `src/data/reports.json` only when it is publication-ready. The build validates registry uniqueness and route safety; the verification script automatically checks every registered published report.

## Required QA

Before publication, each report must pass:

- `npm run build`
- `npm run verify`
- desktop browser QA at approximately 1536 × 1000
- mobile browser QA at approximately 390 × 844
- no horizontal overflow
- no broken images or console errors
- working navigation and interactive controls
- visual review of the hero and all major story chapters
- authentic-image rights/credit verification
- fan-comprehension review: the conclusion must make sense before the technical layer is opened

## Local use

```bash
npm run build
npm run verify
npm run start
```

Open `http://localhost:4173` for the homepage, `http://localhost:4173/reports/colts/` for Report 001 and `http://localhost:4173/research/` for methodology and sources.

## Deployment

The output directory is `dist`.

- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/`

The production Cloudflare Pages project is expected to auto-deploy from `main`. Merge to `main` only after the required browser and static QA passes.

## Private evidence base

The complete Colts research workbook is retained privately in Google Drive and is not linked as a public raw-data download from the production site.
