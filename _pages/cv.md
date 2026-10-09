---
layout: page
permalink: /cv/
title: CV
nav: true
nav_order: 5
description: A concise academic record of education, appointments, research, teaching, grants, presentations, and methods.
---

{% assign cv = site.data.cv.cv %}

<div class="cv-page">
  <section class="cv-hero" aria-labelledby="cv-profile-title">
    <div class="cv-hero__copy">
      <p class="eyebrow">Academic profile</p>
      <h2 id="cv-profile-title">{{ cv.name }}</h2>
      <p class="cv-hero__role">{{ cv.label }}</p>
      <p class="cv-hero__summary">{{ cv.summary }}</p>
    </div>
    <div class="cv-hero__aside">
      <dl class="cv-contact">
        <div>
          <dt>Based in</dt>
          <dd>{{ cv.location }}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd><a href="mailto:{{ cv.email }}">{{ cv.email }}</a></dd>
        </div>
      </dl>
      <div class="cv-actions">
        <a
          class="button button--primary"
          href="{{ '/assets/pdf/Jorge_Zavala_CV.pdf' | relative_url }}"
          target="_blank"
          rel="noopener noreferrer"
        >
          View full CV (PDF)
        </a>
        <a class="cv-actions__text" href="{{ '/assets/pdf/Jorge_Zavala_CV.pdf' | relative_url }}" download>
          Download PDF
        </a>
      </div>
    </div>
  </section>

  <nav class="cv-index" aria-label="CV sections">
    <p class="section-kicker">On this page</p>
    <div class="cv-index__links">
      {% for section_pair in cv.sections %}
        <a href="#{{ section_pair[0] | slugify }}">{{ section_pair[0] }}</a>
      {% endfor %}
    </div>
  </nav>

  <div class="cv-sections">
    {% for section_pair in cv.sections %}
      {% assign section_title = section_pair[0] %}
      {% assign entries = section_pair[1] %}
      {% assign section_slug = section_title | slugify %}

      <section class="cv-section cv-section--{{ section_slug }}" id="{{ section_slug }}">
        <header class="cv-section__header">
          <p class="cv-section__number">{{ forloop.index | prepend: '0' | slice: -2, 2 }}</p>
          <div>
            <h2>{{ section_title }}</h2>
            <p>{{ entries.size }} {% if entries.size == 1 %}entry{% else %}entries{% endif %}</p>
          </div>
        </header>

        {% if section_title == 'Skills' %}
          <div class="cv-compact-grid">
            {% for entry in entries %}
              <article class="cv-compact-card">
                <p class="cv-entry__eyebrow">{{ entry.level }}</p>
                <h3>{{ entry.name }}</h3>
                <p>{{ entry.keywords }}</p>
              </article>
            {% endfor %}
          </div>
        {% elsif section_title == 'Languages' %}
          <div class="cv-language-list">
            {% for entry in entries %}
              <div>
                <span>{{ entry.name }}</span>
                <strong>{{ entry.summary }}</strong>
              </div>
            {% endfor %}
          </div>
        {% else %}
          <div class="cv-entry-list">
            {% for entry in entries %}
              {% assign start_year = entry.start_date | append: '' | split: '-' | first %}
              {% assign end_year = entry.end_date | append: '' | split: '-' | first %}

              <article class="cv-entry">
                <div class="cv-entry__meta">
                  {% if entry.date %}
                    <span>{{ entry.date }}</span>
                  {% elsif entry.releaseDate %}
                    <span>{{ entry.releaseDate }}</span>
                  {% elsif start_year != '' %}
                    <span>
                      {{ start_year }}
                      {% if end_year != '' and end_year != start_year %}
                        –{% if end_year == 'present' %}Present{% else %}{{ end_year }}{% endif %}
                      {% endif %}
                    </span>
                  {% endif %}
                  {% if entry.location %}<span>{{ entry.location }}</span>{% endif %}
                  {% if entry.publisher %}<span>{{ entry.publisher }}</span>{% endif %}
                  {% if entry.awarder %}<span>{{ entry.awarder }}</span>{% endif %}
                </div>

                {% if entry.institution %}
                  <h3>{{ entry.studyType | default: entry.degree }} in {{ entry.area }}</h3>
                  <p class="cv-entry__place">{{ entry.institution }}</p>
                {% elsif entry.company %}
                  <h3>{{ entry.position }}</h3>
                  <p class="cv-entry__place">{{ entry.company }}</p>
                {% elsif entry.title %}
                  <h3>{{ entry.title }}</h3>
                {% elsif entry.name %}
                  <h3>{{ entry.name }}</h3>
                {% elsif entry.bullet %}
                  <div class="cv-entry__standalone">{{ entry.bullet | markdownify }}</div>
                {% endif %}

                {% if entry.authors %}
                  <p class="cv-entry__authors">{{ entry.authors | join: ', ' }}</p>
                {% endif %}

                {% if entry.summary %}
                  <div class="cv-entry__summary">{{ entry.summary | markdownify }}</div>
                {% endif %}

                {% if entry.score %}
                  <p class="cv-entry__score">{{ entry.score }}</p>
                {% endif %}

                {% if entry.highlights %}
                  <ul class="cv-entry__highlights">
                    {% for highlight in entry.highlights limit: 2 %}
                      <li>{{ highlight | markdownify | remove: '<p>' | remove: '</p>' }}</li>
                    {% endfor %}
                  </ul>
                {% endif %}
              </article>
            {% endfor %}
          </div>
        {% endif %}
      </section>
    {% endfor %}

  </div>

  <section class="cv-download-note">
    <div>
      <p class="section-kicker">Complete record</p>
      <h2>Prefer the conventional document?</h2>
      <p>The PDF contains the full, print-ready curriculum vitae and is the version to cite or circulate.</p>
    </div>
    <a
      class="button button--ghost"
      href="{{ '/assets/pdf/Jorge_Zavala_CV.pdf' | relative_url }}"
      target="_blank"
      rel="noopener noreferrer"
    >
      Open PDF
    </a>
  </section>
</div>
