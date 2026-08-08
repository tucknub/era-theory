# Era Theory Report Template

Every Era Theory report is a complete research project first, a guided sports story second and a technical audit surface third.

## Core publication principle

Use three levels of depth:

1. **Tell me** — the question, quick answer and plain-English conclusion.
2. **Show me** — real people, timelines, records, comparisons and visuals that make the answer understandable.
3. **Prove it** — sources, exact scores, formulas, methodology, caveats and robustness tests.

An average fan should understand levels 1 and 2 without opening level 3.

Nobody should have to figure out what they are looking at, why it matters or what to click next.

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

Published reports are registered in `src/data/reports.json`.

The registry should describe the sports argument, not just an internal report name. Public-facing metadata should include a plain-English question, subtitle, summary, route, scoring cutoff, research visibility, final result, evidence count and robustness count.

Report numbers remain useful archival labels but should not be the primary entry point for fans.

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

## Fan-story architecture

A published report should normally progress through:

1. The sports question
2. The quick verdict
3. Meet the eras
4. The major fan arguments as chapters
5. Visual evidence and plain-English takeaways
6. The deeper scorecard/evidence layer
7. A robustness section that asks whether the answer changes when priorities change
8. Final conclusion and next story

Use questions as chapter titles whenever possible. Prefer “Who solved quarterback?” to “Quarterback Management,” and “Does the verdict still hold if we change what matters?” to “Sensitivity Analysis.”

Each major section should include an explicit takeaway such as `What this tells us:` when the visual or data could otherwise be misread.

## Authentic imagery workflow

Real history requires authentic imagery.

### Required for recognizable real subjects

Use authentic, rights-reviewed photography for:

- athletes and players;
- executives, general managers and owners;
- coaches and staff;
- crowds presented as a real event;
- games, ceremonies, drafts, press conferences and historical moments;
- identifiable real venues when presented historically.

### Allowed presentation treatments

The design may transform how the source photograph is presented while preserving the photographed subject:

- crop and resize;
- subject isolation / background removal;
- transparent or visually transparent cutouts;
- segmentation-derived silhouette clipping;
- masks and edge fades;
- duotone and color grading;
- tonal normalization across different source photos;
- layering, overlap and responsive focal positioning;
- lighting, texture and abstract atmosphere around the authentic image.

The actual person may not be generated, redrawn, face-swapped or reconstructed.

### AI/design support

Generated material may support abstract atmosphere, smoke, light, paper/metal textures, maps, timelines, diagrams, dividers and other non-historical visual elements that cannot be mistaken for documentary evidence.

### Rights/archive requirements

For every public authentic image:

- record the creator/source page;
- record the license or publication-right status;
- record whether attribution/share-alike is required;
- record the permitted transformation;
- archive or self-host the approved source/derivative when permitted;
- provide public image credits when required or useful;
- keep pending or unclear-rights candidates out of production.

Do not hotlink production imagery.

## Website routes

Each published report belongs at `src/reports/<slug>/index.html`.

The umbrella homepage remains at `src/index.html`.

Public methodology/source material may live at a report-specific route or a shared route such as `src/research/`.

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

## Visual and comprehension gate

Before publication:

- The hero uses recognizable, historically appropriate visual anchors.
- Real-person imagery passes the authentic-image policy above.
- Major chapters have been visually reviewed, not only the hero.
- Desktop and mobile compositions both work.
- The page has no broken images, horizontal overflow or console errors.
- Navigation clearly tells the reader what to read next.
- Interactive controls have known expected outcomes and are tested.
- Charts explain what they show and what was learned.
- A fan can summarize the core conclusion after a short read without needing to explain the scoring model.

## Publication gate

A report is publishable only when:

- The evidence base is source-linked and auditable.
- Scored cutoffs are explicit.
- Unresolved evidence is visibly excluded or labeled.
- The final conclusion survives plausible alternative weighting models.
- A public methodology/source surface exists when the raw evidence base remains private.
- Authentic-image rights and credits are complete.
- Mobile and desktop routes function.
- Browser interaction/visual QA passes.
- All relative links and assets pass the verification script.
- The report is intentionally added to `src/data/reports.json` as `published`.
