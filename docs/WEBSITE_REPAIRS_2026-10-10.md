# Website audit repairs — 10 October 2026

Canonical checkout: `C:\Users\jzava\Documents\GitHub\Jorge-Zavala-D.github.io`.
Scope: findings in `WEBSITE_AUDIT_2026-10-09.md`, preserving the design and
Overleaf-first CV. No plugin runtime fork, hosting migration or content redesign.

## Changes

- Isolated comments and Distill fixtures replace missing demonstration posts.
  All six integration checks run independently and gate publication.
- Deployments use locked JavaScript/Ruby dependencies, pinned build tools and
  immutable action commits, Node 24, read-only build permissions, separate
  publishing permissions and serialized releases.
- Real-site desktop Chromium and mobile WebKit checks cover all six pages,
  contrast/accessibility, keyboard focus, horizontal overflow, internal links,
  the actual CV download, and accidental development-file publication.
- Site-specific contrast, link underlines and focus rings are corrected without
  changing the palette or page layout. Custom Sass is included in the existing
  cache fingerprint; the duplicate, dated CV stylesheet workaround is removed.
- Live verification checks the deployed CV bytes and pages, external references,
  and Lighthouse measurements for this site's homepage and CV. Blocked external
  requests remain explicitly marked for manual review.
- Retired upstream-demo Docker publishing, badge, formatting-writer, RenderCV,
  TOC and citation workflows. These no longer compete with the publishing or CV
  workflows. CodeQL was re-enabled after GitHub's inactivity suspension.
- Development scripts/tests, documentation, caches, dependencies and the unused
  RenderCV demo are excluded from the public build. Windows line endings are
  normalized without changing content; the formatter no longer reports false
  CRLF-only failures.
- The preview container builds this checkout rather than an unrelated latest
  upstream image. It preserves the lockfile and uses container-local output.
- The CV helper prefers working MiKTeX, compiles twice, validates output and
  atomically replaces the reviewed PDF. Failure tests preserve the existing PDF;
  logs and prior PDFs remain in ignored local review folders.
- Added Alexandra Scacco to the authoritative Overleaf supervisor line. Kept
  the CV's master's thesis title and aligned the web summary to it. Recompiled
  and visually reviewed the five-page PDF; refreshed the General docs mirror.

## Validation

Local formatter, style ownership, dependency audit and CV failure-protection
checks pass. The live-CV wait check has a real HTTP regression test that exercises
a missing first deployment response followed by matching PDF bytes.

Production integration/build/browser results and final live verification will
be recorded here after the repair commits pass the actual deployment pipeline.

## Boundaries

Automated accessibility checks are not a complete WCAG certification. External
sites can block automated requests; those require human review. Windows does
not currently have Ruby or Docker, so the production Linux build is verified in
GitHub Actions and the exact generated artifact can be previewed locally.
