---
layout: page
permalink: /publications/
title: Publications
description: Academic publications, working papers, and research reports by Jorge E. Zavala.
nav: true
nav_order: 2
---

<div class="page-intro">
  <p class="eyebrow">Writing &amp; evidence</p>
  <p class="page-intro__lede">
    Academic articles, working papers, book chapters, and research reports. Work intended for
    public and policy audiences is collected separately under
    <a href="{{ '/policy/' | relative_url }}">Policy &amp; Public Work</a>.
  </p>
</div>

{% include bib_search.liquid %}

<div class="publications">
{% bibliography %}
</div>
