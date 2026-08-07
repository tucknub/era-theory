# Era Theory

Era Theory is a reusable sports-leadership analysis site. It turns complete research systems into visual, interactive reports without pretending every sport should use the same scoring model.

## Site structure

- `/` — Era Theory umbrella homepage and report library
- `/reports/colts/` — Report 001: Colts Era Lab
- `/research/` — public methodology, evidence inventory, source policy and limitations
- `src/data/reports.json` — publication-safe registry of live reports
- `REPORT_TEMPLATE.md` — research, privacy and publication rules for future reports

## Report 001: Colts Era Lab

The completed 1998–2025 Indianapolis Colts front-office study compares Bill Polian, Ryan Grigson and Chris Ballard.

- Bill Polian: 70.5
- Ryan Grigson: 61.1
- Chris Ballard: 47.8
- 28 research tabs
- 401 core structured evidence records
- Seven weighted dimensions
- 300,000 random-weight robustness simulations
- Interactive sensitivity model
- Quarterback, draft, transaction, coaching, player-peak and resilience chapters

## Research privacy and transparency

The complete native Google Sheets workbook remains the private evidence base. It is intentionally not published as an unrestricted public file.

The public `/research/` route publishes the research scope, evidence-register counts, model construction, robustness tests, source families, exclusions and known limitations. Production verification rejects private-workbook Google Sheets links when a report is marked `researchVisibility: "private"`.

## Starting another Era Theory report

Create a private local research workbench:

```bash
npm run new-report -- --number=002 --slug=example --title="Example Era Lab" --sport="Basketball"
```

The command creates `workbench/<slug>/` with a manifest and research checklist. `workbench/` is ignored by Git and is outside `src/`, so it cannot be published by the normal production build.

A report is added to `src/data/reports.json` only when it is publication-ready. The build validates registry uniqueness and route safety; the verification script automatically checks every registered published report.

## Visual policy

The production site does not use AI-generated lookalikes of real people or synthetic documentary imagery. Generated material may support abstract atmosphere, textures, maps, diagrams and data visualization. Any future real-person or historical-event photography must be authentic and appropriately licensed or sourced.

## Local use

```bash
npm run build
npm run verify
npm run start
```

Open `http://localhost:4173` for the homepage, `http://localhost:4173/reports/colts/` for Report 001 and `http://localhost:4173/research/` for the public research audit.

## Deployment

The output directory is `dist`.

- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/`

## Private evidence base

The complete Colts research workbook is retained privately in Google Drive and is not linked as a public raw-data download from the production site.
