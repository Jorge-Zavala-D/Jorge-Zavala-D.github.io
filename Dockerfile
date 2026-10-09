FROM node:24-bookworm-slim AS node
FROM ruby:3.3.5-slim-bookworm
COPY --from=node /usr/local/ /usr/local/
ENV DEBIAN_FRONTEND=noninteractive EXECJS_RUNTIME=Node
RUN apt-get update && apt-get install -y --no-install-recommends build-essential git imagemagick python3-pip zlib1g-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /srv/jekyll
COPY Gemfile Gemfile.lock requirements.txt ./
RUN gem install bundler -v 4.0.4 --no-document && bundle install --jobs 4 --retry 3
RUN python3 -m pip install --no-cache-dir --break-system-packages -r requirements.txt
EXPOSE 8080 35729
CMD ["bash", "/srv/jekyll/bin/entry_point.sh"]
