# Ruby and Python dependency security audit — 10 October 2026

Scope: the canonical website repository, its production build environment and its
container preview. This is a known-advisory dependency audit, not a penetration test
or a certification that every dependency is vulnerability-free.

## Findings and repairs

| Component                                        | Baseline finding                                                                                                                                                                                                                                                                | Repair                                                                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `nbconvert` 7.16.6                               | [CVE-2025-53000](https://github.com/advisories/GHSA-xm59-rqc7-hhvf), [CVE-2026-39378](https://github.com/advisories/GHSA-7jqv-fw35-gmx9), [CVE-2026-39377](https://github.com/advisories/GHSA-4c99-qj7h-p3vg): executable search-path, file-read and file-write vulnerabilities | Pin 7.17.1, the minimum release fixing all three.                                                                                                            |
| `css_parser` 1.22.0                              | [CVE-2026-53727](https://github.com/advisories/GHSA-9pmc-p236-855h): SSRF and local file disclosure                                                                                                                                                                             | Remove the unused downloader and lightbox plugins that require the vulnerable 1.x branch, along with the direct parser dependency.                           |
| Ruby 3.3.5                                       | Outdated maintenance release                                                                                                                                                                                                                                                    | Use [Ruby 3.3.12](https://www.ruby-lang.org/en/news/2026/07/16/ruby-3-3-12-released/) consistently in the shared build action, upgrade checks and container. |
| Ruby's `resolv` 0.3.1, still shipped with 3.3.12 | [CVE-2026-80212 and CVE-2026-80213](https://www.ruby-lang.org/en/news/2026/08/27/multiple-vulnerabilities-in-resolv/): malicious DNS response memory exhaustion and hostname validation bypass                                                                                  | Explicitly include the patched 0.3.2 maintenance branch in the locked website bundle.                                                                        |

`jekyll-3rd-party-libraries` 0.0.1 requires `css_parser < 2.0`, while the advisory
requires 3.0 or newer. The optional `al_img_tools` plugin also requires that old
downloader. Neither local downloading nor lightbox/zoom features are used by this
website. Removing both avoids a vulnerable dependency, a forced incompatible
upgrade, or a starter-local fork of plugin runtime code.

The actual Linux container runtime audit also detected three existing advisories
in bundled `net-imap` 0.4.25: [CVE-2026-47240](https://github.com/advisories/GHSA-8p34-64r3-mwg8),
[CVE-2026-47241](https://github.com/advisories/GHSA-c4fp-cxrr-mj66) and
[CVE-2026-47242](https://github.com/advisories/GHSA-46q3-7gv7-qmgg), covering command injection
and denial of service. The audit failed before publication. The website now explicitly
locks the patched 0.5.15 maintenance branch and checks its active version. This finding
illustrates why the installed Linux runtime is checked separately from both the
project lockfile and the temporary Windows audit-tool environment.

All 44 configured `{{version}}` library URLs are expanded to their existing version
numbers. Their resolved URLs, integrity hashes and library versions are unchanged.
When updating a library in `_config.yml`, update its explicit URL and its version
together. Responsive WebP portraits use the independent `jekyll-imagemagick` plugin;
they are unaffected. If lightbox or download features are needed later, restore them
only through an upstream dependency chain that passes the advisory audit.

The preview now installs Python packages in `/opt/site-python`, rather than modifying
Debian-managed Python packages. The documented manual setup uses `.venv`.
Both installation paths use pip 26.2.1 and the same `requirements.txt`.

## Verification and ongoing release gates

Baseline audits returned nonzero exit codes and detected the findings above.
After the repair, the local Ruby lockfile audit reports zero findings, and the
fresh Windows Python 3.13 environment reports zero findings across 32 packages,
including pip. The real `assets/jupyter/blog.ipynb` converts to HTML without
executing its cells and retains its source content.

`bash bin/audit-dependencies` is required before production publication. It:

1. Runs pinned `bundler-audit` 0.9.3 against `Gemfile.lock` and the current
   Ruby Advisory Database; records the database's exact Git revision.
2. Inventories installed runtime gems absent from the lockfile, substitutes
   the site's actual locked versions, and audits that inventory as well.
   It also verifies that `bundle exec` activates patched DNS and IMAP libraries.
3. Runs pinned `pip-audit` 2.10.1 from a separate auditor environment against
   the actual website Python package directory, including installation tools.
   The auditor's dependencies cannot upgrade or mask the website's dependencies.
4. Converts the existing notebook to HTML and checks that its source survives.

The container smoke workflow runs the same checks inside the built container;
this separately covers Debian's Python 3.11 rather than assuming the production
Python 3.13 results apply. JSON results, installed-package lists and runtime
inventories are retained in **dependency-audit** and **container-dependency-audit**
workflow artifacts, including on failure. No advisories are ignored.

The unchanged release checks still cover six integrations, 12 approved desktop/mobile
screenshots, accessibility, internal links, CV downloads and publication boundaries.
Live verification checks the exact release marker and PDF bytes before browser tests.

## Preserved boundaries

- No changes to page content, styling, screenshot baselines, CV data, PDF or the
  Dropbox/Overleaf source. The public PDF SHA-256 remains
  `C8AC5DB28965D0C6B789BE4425D251E1E94668BC411A6DD09666996397E472FC`.
- No permanent Ruby installation on this Windows computer. The temporary local
  Ruby audit runtime and raw reports are under ignored `output/ci/`.
- Dependency presence establishes a remediation requirement, not proof that the
  public static site was exploited. The checks do not audit every native Debian
  package, remote CDN asset or unknown vulnerability. Transitive Python packages
  are resolved at installation and audited before each release; their installed
  versions are retained in the report rather than claimed to be fully locked.
