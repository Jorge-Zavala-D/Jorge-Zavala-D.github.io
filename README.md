# Jorge E. Zavala — Academic Website

Personal academic website for Jorge E. Zavala, a political economist working on conflict,
transitional justice, development, migration, and digital inclusion.

The site is built with [Jekyll](https://jekyllrb.com/) and
[al-folio](https://github.com/alshedivat/al-folio), and published through GitHub Actions to
GitHub Pages.

## Live site

[jorge-zavala-d.github.io/Jorge-Zavala-Academic-Site](https://jorge-zavala-d.github.io/Jorge-Zavala-Academic-Site/)

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

## Privacy

Only public professional information and curated project descriptions belong in this repository.
Raw research data, participant information, contracts, client-confidential deliverables, and
private-repository links must not be committed.
