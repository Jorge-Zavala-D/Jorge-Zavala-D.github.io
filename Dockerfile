FROM node:24-bookworm-slim AS node
FROM ruby:3.3.12-slim-bookworm
COPY --from=node /usr/local/ /usr/local/
ENV DEBIAN_FRONTEND=noninteractive EXECJS_RUNTIME=Node
RUN apt-get update && apt-get install -y --no-install-recommends build-essential git imagemagick python3-venv zlib1g-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /srv/jekyll
COPY Gemfile Gemfile.lock requirements.txt ./
RUN gem install bundler -v 4.0.6 --no-document && bundle install --jobs 4 --retry 3
RUN python3 -m venv /opt/site-python \
    && /opt/site-python/bin/python -m pip install --no-cache-dir --upgrade pip==26.2.1 \
    && /opt/site-python/bin/python -m pip install --no-cache-dir -r requirements.txt
ENV PATH="/opt/site-python/bin:${PATH}"
EXPOSE 8080 35729
CMD ["bash", "/srv/jekyll/bin/entry_point.sh"]
