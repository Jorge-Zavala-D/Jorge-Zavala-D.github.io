# Academic website infrastructure audit — 9 October 2026

## Conclusion and scope

The public website works at <https://jorge-zavala-d.github.io/>. The content,
root-domain configuration, responsive CV renderer, and main publishing path are
usable. The maintenance checks are **not all healthy**: two CI jobs fail, some
checks do not cover this site's actual publishing workflow, and browser
accessibility checks find issues. This is an operational audit, not a claim of
perfect code, comprehensive security certification, or WCAG conformance.

All website changes were made in
`C:\Users\jzava\Documents\GitHub\Jorge-Zavala-D.github.io` on `main`. The starting
checkout was clean and matched `origin/main` at `1d6585618bef3254c4f936b776aed0e81c6859a2`.
The Financial Inclusion Week update is commit `01d537a`.

Reviewed: repository instructions and plugin ownership boundaries; Gemfile and
lockfile; configuration and exclusions; six public pages; web CV data and
renderer; custom stylesheet and cache workaround; CV compilation helper;
deployment, integration, upgrade, formatting, visual, accessibility, link,
RenderCV, Lighthouse, and scheduled workflows; public workflow status and
failure logs; public navigation/download links, browser errors, mobile layout,
and automated accessibility checks. Infrastructure files were not rewritten as
part of this audit. Content and the reviewed CV PDF were updated separately.

## Publishing and content ownership

- **Authoritative hosting:** GitHub Pages, repository
  `Jorge-Zavala-D/Jorge-Zavala-D.github.io`; default branch `main`. `_config.yml`
  has the correct HTTPS root URL and an empty `baseurl`.
- **Build:** `.github/workflows/deploy.yml` installs the locked Ruby/JavaScript
  dependencies, builds Jekyll in production mode, purges CSS, and publishes
  `_site` to `gh-pages`. GitHub's Pages workflow then serves the generated site.
  This is appropriate for custom plugin gems; do not replace it with the
  restricted built-in source build without rechecking plugin compatibility.
- **Theme ownership:** runtime belongs to the al-folio gems. Site-specific
  content and `assets/css/_jorge.scss` belong here. The style-contract check
  passed; no new plugin-runtime override was added.
- **CV authority:** the existing English source is
  `C:\Users\jzava\Dropbox (Personal)\Apps\Overleaf\CV_Jorge Zavala\CV_Jorge Zavala_ENG.tex`,
  with `resume.cls`. The repository contains the public generated PDF, not a
  second editable TeX source. `_data/cv.yml` is a manually curated web summary.
- **Secondary Sites files:** `.openai/hosting.json` and `sites-runtime/` remain in
  the repository, but both are excluded from the Jekyll public build. They are
  not the authority for the GitHub Pages website. No second repository or
  hosting migration was created in this update.

Jekyll's official documentation supports using an independent build for custom
plugins: [GitHub Actions publishing](https://jekyllrb.com/docs/continuous-integration/github-actions/).

## Findings requiring maintenance

### P1 — The integration gate fails before most tests run

`test/integration_comments.sh` expects demonstration blog pages at
`blog/2022/giscus-comments/index.html` and `blog/2015/disqus-comments/index.html`.
The generated personal site does not contain the first expected fixture.
The July run and the new October run fail at this lookup, so plugin-toggle,
Distill, bootstrap, upgrade-CLI, and CSS-minification integration steps are
skipped. This is a broken test contract, not evidence that the CV renderer fails.

Evidence: [October integration run](https://github.com/Jorge-Zavala-D/Jorge-Zavala-D.github.io/actions/runs/37994281450),
`.github/workflows/unit-tests.yml`, and `test/integration_comments.sh`.

Recommended fix: supply isolated fixtures for the features these tests claim to
exercise, or deliberately remove irrelevant starter-demo checks. Do not add
sample blog posts to the public site just to satisfy a test. Validate the later
steps independently after repairing the first failure.

### P1 — A second CV generation workflow conflicts with the chosen CV workflow

`.github/workflows/render-cv.yml` runs whenever `_data/cv.yml` changes. Its last
July run and the new October run fail in RenderCV validation. The web data
includes profile fields such as `label`, `image`, and `summary`, which the
installed RenderCV schema rejected in the July log. The workflow also writes
another PDF under `assets/rendercv/rendercv_output/` and has a repository-writing
step, although the actual public download is `assets/pdf/Jorge_Zavala_CV.pdf`
compiled from Overleaf. An Einstein demonstration PDF is still in the published
asset tree. The failed RenderCV job did not replace the reviewed public CV.

Evidence: [October RenderCV run](https://github.com/Jorge-Zavala-D/Jorge-Zavala-D.github.io/actions/runs/37994281568),
`.github/workflows/render-cv.yml`, `assets/rendercv/settings.yaml`, and `README.md`.

Recommended fix: retire the competing RenderCV writer for this personal site
and remove unused demonstration outputs after review. Keep the Overleaf source
and reviewed public PDF workflow; do not introduce another authoritative CV.

### P1 — Automated accessibility checks find contrast and link-identification issues

Browser checks with axe-core 4.10.3, using WCAG 2 A/AA and 2.1 AA tags, detected
low-contrast text on all six pages. Affected elements include shared footer
links, homepage theme numbers, publication year headings, the public-feature
date and text, and teaching labels. Publications and public-work pages also
have links in text blocks that are not sufficiently distinguished. Some homepage
and public-work checks were marked incomplete and require human review.

Recommended fix: adjust the site-owned stylesheet's actual foreground/background
combinations and link underlines/focus states, then repeat checks at desktop and
mobile widths. Preserve the light, understated design. An automated pass alone
would still not establish full accessibility compliance.

### P2 — Visual, external-link, and performance checks do not cover normal publishing

- `.github/workflows/visual-regression.yml` runs on pull requests to `main`, but
  its push trigger covers only `v1.0-dev`. Direct publication pushes to `main`
  therefore do not get this check. Tests still compare upstream `/al-folio/`
  demonstration routes to a `v0.16.3` baseline, not this site's own approved
  homepage, research, policy, teaching, and CV layouts.
- `.github/workflows/broken-links.yml` is gated to
  `github.repository == 'alshedivat/al-folio'`; it is skipped here. The separate
  post-deployment site checker runs offline and checks local links only.
- `.github/workflows/lighthouse-badger.yml` targets
  `https://alshedivat.github.io/al-folio/`, not Jorge's website, and its last run
  failed. It cannot establish this site's performance or accessibility quality.
- The accessibility workflow is manually triggered; it had no recorded run
  before this audit. Manual browser accessibility checks were performed here.

Recommended fix: replace irrelevant demo coverage with this site's six routes,
approved screenshots, and a small live-site link/accessibility smoke check.
Retarget or retire Lighthouse before relying on its results.

### P2 — Unnecessary development and demonstration files are public

The `gh-pages` tree contains `scripts/sync-cv.ps1`, `test/` files, `AGENTS.md`,
`CLAUDE.md`, `requirements.txt`, and unused RenderCV demonstration assets.
Live requests to `/scripts/sync-cv.ps1` and `/test/style_contract.js` returned 200.
These are not needed by visitors; the CV helper also exposes a local workstation
path. This check did not find a private credential in these files, but publishing
build helpers needlessly broadens the public output.

Recommended fix: add reviewed development paths to Jekyll's exclusions and
remove unused demo assets from the published output. Confirm those URLs return
404 while real downloads and runtime assets remain available. `sites-runtime/`
and `.openai/` are already excluded correctly.

### P2 — Some build inputs are not reproducibly pinned

The Ruby gems and local JavaScript dependencies have lockfiles. However, the
deployment fetches `fjogeleit/yaml-update-action@main`, installs global `purgecss`
without a version, and upgrades `nbconvert` without a version. There is no
deployment concurrency guard. Workflows also use older actions whose Node 20
runtime is being forced to Node 24 according to their logs; this is distinct from
the explicitly selected Node 20 shell runtime.

Recommended fix: pin external actions to reviewed immutable revisions, pin
build-tool versions, update actions to supported runtimes, and serialize
publication. These are maintenance/reproducibility risks, not an observed
compromise. See [GitHub's runtime migration notice](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/).

### P2 — Formatting, local compilation, and scheduled checks need attention

- Repository-wide `npm run lint:prettier` reports 88 existing formatting failures.
  Most are a workstation line-ending mismatch, not 88 independent code defects:
  `git ls-files --eol` shows LF in Git and CRLF in the Windows working tree.
  Checking with `--end-of-line auto` isolates `_pages/research.md` among the
  existing files. The touched CV data and public-work page pass targeted checks.
  GitHub's formatter job passed; it installs current formatter packages rather
  than using the local lockfile, so its environment is not identical to this one.
- Ruby, Bundler, and Docker are not available on this workstation's PATH, so
  a complete local Jekyll build and container smoke test could not be executed.
  The production build was exercised through GitHub Actions instead.
- The first CV compilation attempt with TinyTeX failed because `parskip.sty`
  was missing. The existing MiKTeX installation compiled the document successfully
  in two passes. The helper can be given an explicit compiler path, but its
  current automatic choice does not avoid this incomplete TinyTeX installation.
- The web CV contains a page-specific stylesheet cache query,
  `?v=20260726-cv3`, from a previous repair. It does not automatically revise
  when the imported custom stylesheet changes; recheck caching during any CSS
  repair instead of assuming a source edit is sufficient.
- Before this update, CodeQL and citation schedules were reported as
  `disabled_inactivity`. Their previous successful runs are not ongoing monitoring.
- The manually curated web CV also contains factual differences from the PDF,
  including an additional PhD supervisor and a different master's thesis title.
  This update changes only the requested event. Reconcile those fields against
  the owner's current authoritative CV in a separate content review.

Recommended fix: establish a working local build environment without replacing
the site architecture, select the verified CV compiler, address formatting in
a separate mechanical change, and review which scheduled workflows are useful
for this site before re-enabling them.

## Checks actually executed

| Check                                              | Observed result                                                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Clean checkout, remote, branch and synchronization | Correct canonical repository; no pre-existing edits                                                                             |
| `npm ci`                                           | Passed using lockfile; local Node 24.19.0 / npm 11.17.0                                                                         |
| Starter style contract                             | Passed                                                                                                                          |
| Repository-wide formatting                         | 88 warnings with default LF policy; line-ending-neutral check isolates one pre-existing page                                    |
| Targeted formatting and diff whitespace            | Passed for updated content                                                                                                      |
| `npm audit --json`                                 | Zero reported vulnerabilities in the installed npm dependency tree; does not cover gems, global build tools, or the whole site  |
| Six desktop routes                                 | HTTP 200; correct canonical URLs; no captured page exceptions or broken loaded images                                           |
| Four mobile routes at 390 × 844                    | No horizontal overflow; navigation opens; CV sections populated                                                                 |
| Eleven internal navigation/PDF destinations        | HTTP 200                                                                                                                        |
| Sitemap, robots, stylesheets, custom 404 file      | Served successfully                                                                                                             |
| Thirteen external destinations before update       | Ten returned 200; two WZB destinations returned 403 and LinkedIn returned 999; these restrictions do not establish broken links |
| Credential-pattern and sensitive-extension scan    | No matches for the limited patterns checked; not a comprehensive secret/security audit                                          |
| CV compilation                                     | Five-page PDF; event text present; conference and following page rendered and visually inspected                                |
| October CI                                         | Production deployment and upgrade contract passed; integration and RenderCV failures reproduced                                 |

Publication verification: [production deployment](https://github.com/Jorge-Zavala-D/Jorge-Zavala-D.github.io/actions/runs/37994281525),
[GitHub Pages publication](https://github.com/Jorge-Zavala-D/Jorge-Zavala-D.github.io/actions/runs/37994440512), and
[post-deployment local-link check](https://github.com/Jorge-Zavala-D/Jorge-Zavala-D.github.io/actions/runs/37994452120)
completed successfully. The live `/cv/` and `/policy/` pages display the October
6 entry. The public CV and the general-documents Dropbox copy have the same
SHA-256 hash, `984d98b8f561ea0735b986dccbf872d693d6a2f0593ff4db6a9db2138f0a9123`.

## Financial Inclusion Week update and source discipline

Added one chronological panelist entry to the existing CV Conferences section,
one web CV entry, and a short latest-appearance feature plus chronological list
entry on Applied & Public Work. The UN Open Source Week appearance remains
separate. No new publication, formal policy impact, or unverified result was
claimed.

The organizer confirms FIW was virtual, 5–8 October 2026, and provides recording
access through registration: [CFI event page](https://www.centerforfinancialinclusion.org/convenings/financial-inclusion-week/).
The supplied handoff and public speaker/partner announcements support Jorge's
October 6 panel contribution. The site links to the organizer's access page, not
to a purported direct recording that was not verified.

## Limits and recommended next work

No full local Ruby build, Docker test, new visual-baseline suite, Lighthouse
measurement, full Ruby vulnerability audit, authenticated Pages-settings audit,
or exhaustive external-site validation was performed. No architecture graph
was generated: there was no existing graph, and direct configuration, CI-log,
and rendered-page evidence was used for this operational audit.

First repair the broken and competing CV/test workflows and accessibility issues;
then clean public build output and retarget smoke/visual checks; finally pin and
modernize the publishing inputs. Keep these repairs distinct from academic
content changes and from plugin-owned runtime development.
