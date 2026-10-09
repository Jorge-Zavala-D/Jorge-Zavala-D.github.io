#!/usr/bin/env bash
set -euo pipefail

bundle check || bundle install --jobs 4 --retry 3
# Container-local output avoids Windows bind-mount write deadlocks.
exec bundle exec jekyll serve --host 0.0.0.0 --port 8080 --livereload --force_polling --destination /tmp/_site
