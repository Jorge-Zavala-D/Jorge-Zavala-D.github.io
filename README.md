# Jorge E. Zavala — Academic Website

Personal academic website for Jorge E. Zavala, a political economist working on conflict,
transitional justice, development, migration, and digital inclusion.

The site is built with [Jekyll](https://jekyllrb.com/) and
[al-folio](https://github.com/alshedivat/al-folio), and published through GitHub Actions to
GitHub Pages.

## Live site

[jorge-zavala-d.github.io](https://jorge-zavala-d.github.io/)

## Content map

- `_pages/about.md` — homepage and research overview
- `_pages/research.md` — dissertation and collaborative research
- `_pages/publications.md` — BibTeX-generated research outputs
- `_pages/policy.md` — applied research, public writing, and talks
- `_pages/teaching.md` — university and professional teaching
- `_pages/cv.md` and `_data/cv.yml` — web CV
- `_bibliography/papers.bib` — publication data
- `assets/css/_jorge.scss` — site-specific visual system

## Local development

Follow the upstream setup instructions in [`docs/INSTALL.md`](docs/INSTALL.md). The production
build is defined in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Publishing

Changes pushed to `main` are built by GitHub Actions and deployed to the `gh-pages` branch.
Repository Pages settings should use **Deploy from a branch**, with `gh-pages` and `/ (root)`.

## CV workflow

The English Overleaf source in Dropbox is the single source of truth:
`C:\Users\jzava\Dropbox (Personal)\Apps\Overleaf\CV_Jorge Zavala\CV_Jorge Zavala_ENG.tex`.
Do not maintain a second `.tex` copy in this repository.

For every CV update:

1. Edit the Overleaf `.tex` source first.
2. From this repository, run `.\scripts\sync-cv.ps1`. The script compiles the source with
   Tectonic or `latexmk` and replaces `assets\pdf\Jorge_Zavala_CV.pdf`.
3. Update `_data/cv.yml` and any topical page affected by the same factual change.
4. Validate, commit, and push the source-controlled website changes.

The generated website PDF is intentionally committed so visitors always receive the same reviewed
CV version that was deployed with the site.

## Privacy

Only public professional information and curated project descriptions belong in this repository.
Raw research data, participant information, contracts, client-confidential deliverables, and
private-repository links must not be committed.
