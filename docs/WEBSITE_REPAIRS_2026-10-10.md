# Website audit repairs — 10 October 2026

Canonical checkout: `C:\Users\jzava\Documents\GitHub\Jorge-Zavala-D.github.io`.

Scope: findings in `WEBSITE_AUDIT_2026-10-09.md`, preserving the design,
GitHub Pages hosting and Overleaf-first CV. No plugin runtime fork or redesign.

## Repairs

- Restored isolated comments and Distill fixtures. All six integration checks
  run independently and gate publication; test fixtures are never published.
- Deployment uses locked dependencies, immutable action revisions, Node 24,
  read-only builds, separate publishing permissions and serialized releases.
  The candidate site must pass formatting, style ownership, integration and
  actual-site browser checks before it can replace the live site.
- Desktop Chromium and mobile WebKit cover all six pages: automated WCAG
  checks, contrast, visible keyboard focus, horizontal overflow, internal links,
  CV content/download and accidental development-file publication. Twelve
  reviewed Linux screenshot baselines now guard the existing layout.
- Corrected site-specific contrast, inline-link underlines and focus rings while
  preserving the palette and layout. The custom Sass participates in the existing
  automatic cache fingerprint; the duplicate dated CV stylesheet was removed.
- Live verification waits for the exact source commit and PDF bytes, then checks
  the deployed pages, external references and Lighthouse measurements of the
  homepage and CV. Blocked external requests are reported for manual review;
  missing pages and genuine server errors still fail the check.
- Retired irrelevant upstream-demo publishing, badge, formatting-writer,
  RenderCV, TOC and citation workflows. CodeQL was re-enabled after GitHub's
  inactivity suspension. There is one publishing path and one CV source.
- Excluded development scripts/tests, documentation, caches, dependencies and
  the unused RenderCV demo from the public build. Normalized line endings and
  corrected the formatter's Windows handling.
- The preview container builds this checkout, preserves the lockfile and writes
  generated pages inside the container. The Linux container smoke check verifies
  the homepage, CV page and PDF download.
- The CV helper prefers working MiKTeX, compiles twice without shell escape,
  validates the PDF and atomically replaces it using unique temporary paths.
  Failure tests preserve the existing PDF; logs and prior PDFs stay in ignored
  local review folders. Overleaf remains authoritative; the website YAML is a
  manually maintained summary, not a second editable CV source.
- Added Alexandra Scacco to the authoritative Overleaf PhD supervisor line.
  Preserved the master's thesis title from the CV and aligned the website summary:
  “Profiling Extremism Hotspots: Identifying High-Risk Provinces for Violent
  Extremism in Burkina Faso Using Machine Learning.” Recompiled the five-page
  PDF, visually reviewed its pages and refreshed the General docs mirror.

## Validation evidence

- [Production release d134315](https://github.com/Jorge-Zavala-D/Jorge-Zavala-D.github.io/actions/runs/37999791100):
  all six integration jobs, production build, all 18 applicable browser tests and
  publication passed. The two external-reference tests are deliberately reserved
  for the live-site workflow. All twelve page captures were visually inspected.
- [Container preview](https://github.com/Jorge-Zavala-D/Jorge-Zavala-D.github.io/actions/runs/37999187918):
  the checkout-derived image, homepage, CV page, PDF and unchanged lockfile passed.
- Formatting, style ownership, CodeQL and upgrade-contract checks passed on
  `d1343157fd3514a2cbe22bc00231b92a66b6e7a2`.
- Local compiler-failure and invalid-TeX tests preserved the existing PDF. The
  real HTTP readiness regression rejected missing/stale release markers and
  incorrect PDF bytes before accepting the matching release.
- Final reviewed PDF SHA-256:
  `C8AC5DB28965D0C6B789BE4425D251E1E94668BC411A6DD09666996397E472FC`.
  The website artifact and General docs mirror match. The live workflow verifies
  this digest automatically when this revision is published.
- The final screenshot gate and live-site checks run on the commit containing
  this report; their run URLs and results are reported in the delivery message.

## Boundaries

Automated accessibility checks are not complete WCAG certification. External
sites can block automated requests and require human review. Ruby and Docker are
not installed in this Windows environment: the production build and exact Docker
runtime were tested in Linux CI, with generated artifacts available locally.
