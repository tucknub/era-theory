# Report 002 visual QA checklist

The GitHub Actions artifact `era-theory-visual-qa` is the rendered review surface for this report.

Required visual checks before merge:

- Homepage desktop/mobile: Report 002 appears in the story library without breaking Report 001.
- Detroit hero desktop/mobile: Calvin Johnson, Matthew Stafford and Penei Sewell read as authentic source-photo subjects integrated into the design, not boxed stock photos or synthetic stand-ins.
- Millen chapter: Calvin cutout does not remove meaningful body/helmet pixels or expose obvious rectangular background remnants.
- Mayhew chapter: Stafford cutout remains recognizable and naturally composed at both viewport sizes.
- Holmes chapter: Sewell cutout fits the open editorial layout without clipping important body pixels.
- Stafford trade chapter: Jared Goff remains an authentic full-bleed archival crop; no fake cutout is required if the crop works better.
- No horizontal overflow, broken archive images, console/page errors, or unreadable mobile type.
- Detroit mobile menu and methodology dialog open/close correctly.
- Detroit sensitivity presets keep Brad Holmes first in published, drafting+transactions-only, and roster+resilience-only scenarios.
- Detroit methodology page is readable on desktop/mobile and contains no private workbook URL.

A passing CI status is necessary but not sufficient. Inspect the screenshots before merge.
