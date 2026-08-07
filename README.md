# Era Theory

Era Theory is a reusable sports-leadership analysis site. It turns complete research systems into visual, interactive reports without pretending every sport should use the same scoring model.

## Site structure

- `/` — Era Theory umbrella homepage and report library
- `/reports/colts/` — Report 001: Colts Era Lab
- `/research/` — public methodology, evidence inventory, source policy and limitations
- `REPORT_TEMPLATE.md` — requirements and route rules for future reports

## Report 001: Colts Era Lab

The completed 1998–2025 Indianapolis Colts front-office study compares Bill Polian, Ryan Grigson, and Chris Ballard.

- Bill Polian: 70.5
- Ryan Grigson: 61.1
- Chris Ballard: 47.8
- 28 research tabs
- 401 core structured evidence records
- Seven weighted dimensions
- 300,000 random-weight robustness simulations
- Interactive sensitivity model
- Quarterback, draft, transaction, coaching, player-peak, and resilience chapters

## Research privacy and transparency

The complete native Google Sheets workbook remains the private evidence base. It is intentionally not published as an unrestricted public file.

Public transparency is provided through `/research/`, which publishes:

- research scope and cutoffs
- evidence-register counts
- category weights and construction rules
- robustness tests
- source families and source policy
- unresolved evidence and known limitations

This preserves an auditable public methodology while protecting the organized research database itself.

## Visual policy

The production site does not use AI-generated lookalikes of real people or synthetic documentary imagery. Generated material may support abstract atmosphere, textures, maps, diagrams, and data visualization. Any future real-person or historical-event photography must be authentic and appropriately licensed or sourced.

## Local use

```bash
npm run build
npm run verify
npm run start
```

Open `http://localhost:4173` for the homepage, `http://localhost:4173/reports/colts/` for Report 001, and `http://localhost:4173/research/` for the public research audit.

## Deployment

The output directory is `dist`.

- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/`

## Private evidence base

The complete Colts research workbook is retained privately in Google Drive and is not linked as a public raw-data download from the production site.
