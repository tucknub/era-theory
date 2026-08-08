# Era Theory QA

## Scope

Current production surfaces:

- `/` — Era Theory homepage and story library
- `/reports/colts/` — Colts Era Lab guided report
- `/research/` — methodology, evidence inventory, source policy and limitations
- `/image-credits.html` — authentic imagery rights and transformation records

## Visual target

Era Theory should feel like a premium sports editorial feature, not a research dashboard or old fan site.

The selected visual system combines:

- dark navy / Colts-blue editorial design;
- large fan-first questions and verdicts;
- authentic photography of real people and historical moments;
- true subject cutouts / background removal where composition benefits;
- layered typography, atmosphere and data around the authentic people;
- technical scorecards and model controls deeper in the page rather than at the entrance.

## Permanent real-person rule

No generated lookalikes or synthetic replacements of real athletes, executives, coaches or historical participants.

Real people remain authentic source photographs. Background pixels may be removed or hidden through segmentation-derived clipping. Crops, masks, tonal treatment, color grade and surrounding design are allowed. The photographed person must not be generated, face-swapped, redrawn or reconstructed.

Current narrative anchors:

- Bill Polian — authentic 2007 photo
- Peyton Manning — authentic 2010 Indianapolis Colts photo
- Andrew Luck — authentic September 2014 Colts photo within the Grigson era
- Jonathan Taylor — authentic 2022 Colts photo
- Anthony Richardson — authentic 2023 archive/evidence photo

Ryan Grigson and Chris Ballard portrait candidates remain excluded until reusable publication rights are clear.

## Browser verification

GitHub Actions runs Chromium/Playwright against the built `dist` site.

Primary viewports:

- Desktop: 1536 × 1000
- Mobile: 390 × 844

The browser suite checks:

1. Homepage, Colts report and research route load.
2. No JavaScript console errors.
3. No broken images.
4. No horizontal overflow on desktop or mobile.
5. Homepage and report mobile navigation opens/closes.
6. Methodology dialog opens/closes.
7. The published balanced model loads Bill Polian first.
8. Drafting + roster-move stress test produces Chris Ballard.
9. Roster + adversity stress test produces Ryan Grigson.
10. Section-aware screenshots are captured for the hero and major chapters instead of repeatedly capturing only the page top.
11. Polian, Grigson/Luck, Ballard/Taylor, quarterback, evidence and sensitivity sections receive visual QA.

## Static verification

`npm run verify` checks:

- fan-first homepage/report markers;
- full-precision model inputs;
- official final scores;
- registered report routes;
- private-workbook link rejection;
- 401/401 source-coverage language;
- authentic archive manifest and local assets;
- public image credits;
- no production image hotlinks;
- correct Manning/Luck historical source filenames;
- permanent authentic-cutout stylesheet and integrity markers;
- canonical metadata, sitemap, robots, favicon, manifest, 404 and security headers.

## Visual-review standard

A report is not visually approved because the hero looks good. Review the whole story.

For every major chapter ask:

- Does the person/image actually belong to this historical era?
- Is the real person immediately recognizable?
- Does the photography look integrated with the page rather than pasted into a card?
- Can the fan understand the question before reading methodology?
- Is the answer visible before the proof layer?
- Does the visual/data block explain what was learned?
- Does mobile preserve the same story and hierarchy?

## Colts redesign status

The authentic-cutout redesign has passed desktop/mobile visual and interaction QA on the redesign branch. The approved visual direction uses real-photo subject cutouts rather than generated people or framed photo panels.

Official model remains unchanged:

- Bill Polian — 70.5
- Ryan Grigson — 61.1
- Chris Ballard — 47.8

No visual change is allowed to alter research scores or underlying model precision without an explicit research change.
