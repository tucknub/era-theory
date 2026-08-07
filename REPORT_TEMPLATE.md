# Era Theory Report Template

Every Era Theory report is a complete research project first and a website page second.

## Start a new report safely

Create a private, non-published research workbench with:

```bash
npm run new-report -- --number=002 --slug=example --title="Example Era Lab" --sport="Basketball"
```

This creates `workbench/<slug>/`. The `workbench/` directory is ignored by Git and is outside `src/`, so it is not copied into the production website.

Do **not** add a report to `src/data/reports.json` until its research and publication gates are satisfied.

## Required private research manifest

- Report number and slug
- Sport, league, team, promotion, or competition
- Era names and exact season/date cutoffs
- Active/incomplete evidence excluded from final scoring
- Secure location of the native research workbook or database
- Final dimensions, weights, formulas, and limitations
- Final ranking and sensitivity-test result
- Last completed season included
- Next evidence update trigger
- Source-audit totals and unresolved-source flags

The private evidence locator does not belong in the public registry when the underlying workbook is private.

## Public report registry

Published reports are registered in:

`src/data/reports.json`

The public registry contains only publication-safe metadata such as report number, slug, title, route, scoring cutoff, research visibility, final result, evidence count and robustness count.

The build rejects duplicate report numbers/slugs and unsafe routes. Verification checks every registered published report automatically.

## Minimum research modules

1. Era and leadership timeline
2. Season-level results
3. Sport-specific premium-position or cornerstone decisions
4. Drafting, recruiting, talent acquisition, or development
5. Trades, contracts, free agency, or resource allocation
6. Coaching and organizational ecosystem
7. Player/team peak production and retention
8. Injury, absence, disruption, or adversity response
9. Final weighted scorecard
10. Sensitivity and leave-one-dimension-out tests

The modules can change when a sport requires different categories. Era Theory should not force baseball, wrestling, college sports, fantasy football or another sport into an NFL-specific model.

## Website routes

Each published report belongs at:

`src/reports/<slug>/index.html`

The umbrella homepage remains at:

`src/index.html`

Public methodology/source material may live at a report-specific route or a shared route such as:

`src/research/`

Shared design and interaction files stay in `src/` unless a report genuinely needs a sport-specific visual system.

## Research privacy policy

A report may be publicly auditable without publishing its complete organized research database.

For a report whose registry value is `researchVisibility: "private"`:

- Keep the raw/native workbook private.
- Do not place the workbook URL in production HTML.
- Publish the evidence inventory, formulas, source policy, exclusions, limitations and robustness results needed to understand the methodology.
- Verification fails if a private report's production HTML contains a Google Sheets workbook link.

## Source-integrity gate

Before publication:

- 100% of core evidence rows must contain at least one source.
- High-impact or recent claims should receive a primary/official source cross-check when practical.
- Unresolved evidence stays labeled and excluded rather than receiving a forced grade.
- Post-cutoff information may be noted only when clearly marked as outside the scored period.
- Source families and any evidence-coded judgment must be disclosed publicly.

## Visual policy

- Use authentic editorial or archival imagery for real people, teams, crowds, venues, matches, games, ceremonies and historical events.
- Never use generated lookalikes or fabricated documentary scenes.
- Generated material may support abstract atmosphere, maps, timelines, diagrams, textures, lighting and data visualization.
- Every report must remain understandable without decorative imagery.

## Publication gate

A report is publishable only when:

- The evidence base is source-linked and auditable.
- Scored cutoffs are explicit.
- Unresolved evidence is visibly excluded or labeled.
- The final conclusion survives plausible alternative weighting models.
- A public methodology/source surface exists when the raw evidence base remains private.
- Mobile and desktop routes function.
- All relative links and assets pass the verification script.
- The report is intentionally added to `src/data/reports.json` as `published`.
