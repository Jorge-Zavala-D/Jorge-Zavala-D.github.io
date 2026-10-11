# Jorge E. Zavala — Academic Website

Personal academic website of Jorge E. Zavala, a political economist working on
conflict, transitional justice, development, migration, and digital inclusion.
Built with Jekyll and al-folio's pinned plugin gems. Live at
[jorge-zavala-d.github.io](https://jorge-zavala-d.github.io/).

## Canonical repository and content

Work locally in `C:\Users\jzava\Documents\GitHub\Jorge-Zavala-D.github.io`.

Keep this clone on `main` for all source edits and commits. `gh-pages` contains only
generated deployment output and is committed automatically by the deployment workflow;
do not switch to it to edit or verify the website. Local dependencies and test output
are ignored on `main` and must never be committed to either branch.

- `_pages/about.md` — homepage and research overview
- `_pages/research.md` and `_bibliography/papers.bib` — academic research
- `_pages/policy.md` — applied research, public writing, and talks
- `_pages/teaching.md` — university and professional teaching
- `_pages/cv.md` and `_data/cv.yml` — summarized web CV
- `assets/_sass/_jorge.scss` — site-specific design; automatically fingerprinted by the theme's stylesheet cache filter

Do not fork plugin runtime components to repair starter content or configuration.
See `docs/BOUNDARIES.md` for ownership.

## Preview and validation

For a full local preview, install Docker Desktop once, then run `docker compose up --build`
from this repository. Open <http://127.0.0.1:8080/>. Restart after changing `_config.yml`.
The container builds this repository's locked dependencies, not an unrelated upstream image,
and never restores or deletes your lockfile. Generated output stays inside the container.

Ruby and Docker are not currently installed on this Windows computer. The production
build runs on GitHub's Linux runner. Download the successful **website** artifact from
a deployment run, extract it into `_site`, and run `npm ci` followed by
`npx http-server _site -p 4000 -c-1` to preview that exact build locally.

Checks: `npm run lint:prettier`, `npm run lint:style-contract`, and `npm run test:visual`.
With Ruby installed, run the six `test/integration_*.sh` checks and
`bundle exec al-folio upgrade audit`, `overrides audit`, and `report`.
Approved Linux screenshots in `test/visual/site.spec.js-snapshots/` provide the visual baseline.
Browser screenshots and diagnostic reports are retained in workflow artifacts.

## Publishing

Pushes to `main` publish only after integration, formatting, style ownership,
desktop/mobile accessibility, layout, internal links, CV and publication-boundary
checks pass. Concurrent releases are serialized. Pages settings use **Deploy from
branch**, `gh-pages`, `/ (root)`. Keep the root URL and empty `baseurl` in `_config.yml`.

After publishing, the live verification workflow waits for the reviewed CV bytes,
checks the deployed pages and external references, and measures the actual homepage
and CV with Lighthouse. Websites that block automated requests are reported for
manual review, not falsely marked verified. Automated checks do not certify WCAG conformance.

The release also requires Ruby lockfile/runtime and installed Python dependency audits;
reports are retained in the **dependency-audit** artifact. The container preview audits its
own environment, including its different Python version. See
[`docs/DEPENDENCY_SECURITY_AUDIT_2026-10-10.md`](docs/DEPENDENCY_SECURITY_AUDIT_2026-10-10.md).

## Overleaf-first CV workflow

The single English master is
`C:\Users\jzava\Dropbox (Personal)\Apps\Overleaf\CV_Jorge Zavala\CV_Jorge Zavala_ENG.tex`,
with `resume.cls`. Do not keep another editable CV source in this repository.

1. Edit the Overleaf source first.
2. Run `./scripts/sync-cv.ps1` from this repository. It prefers the installed MiKTeX
   compiler and runs two passes. An explicit `-CompilerPath` also accepts pdflatex,
   latexmk, or Tectonic. The reviewed PDF is replaced only after compilation and PDF validation.
3. Inspect `assets/pdf/Jorge_Zavala_CV.pdf`. Logs and the previous PDF remain in ignored
   `output/cv-build/` for review. `./test/sync-cv.Tests.ps1` checks failure protection.
4. Update `_data/cv.yml` and affected topical pages with the same factual changes.
5. Validate, commit and push the website changes. Check the live CV download after deployment.

The old RenderCV writer is retired. Web CV data is a summary, never a second PDF source.
The reviewed PDF is intentionally committed so each deployment includes the same CV.
Compilation success alone does not prove correct document layout.

## Privacy

Only public professional information and curated project descriptions belong here.
Never commit raw research data, participant information, contracts, confidential
client deliverables, or private-repository links. Development scripts, tests,
documentation, caches and the unused RenderCV demo are excluded from the published site.
