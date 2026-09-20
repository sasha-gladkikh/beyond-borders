"""Generate the Common Ground landing page from its editorial catalog."""
import json
from pathlib import Path
from datetime import date
from html import escape

ROOT = Path(__file__).resolve().parents[1]
items = json.loads((ROOT / 'content/common-ground.json').read_text())['articles']
seen = set()
for item in items:
    if item['id'] in seen:
        raise ValueError('Duplicate article id: ' + item['id'])
    seen.add(item['id'])
articles = [a for a in items if a.get('status') == 'published']
for a in articles:
    for key in ['id', 'title', 'summary', 'author', 'date', 'format', 'url', 'topics', 'readingMinutes']:
        if not a.get(key):
            raise ValueError(f'Missing {key} in {a["id"]}')
    date.fromisoformat(a['date'])
    if a['readingMinutes'] < 1:
        raise ValueError('Reading time must be positive')
    for field in ['url', 'image']:
        if a.get(field):
            target = (ROOT / a[field]).resolve()
            if not target.is_relative_to(ROOT) or not target.is_file():
                raise ValueError(f'Invalid local {field}: {a[field]}')
    if a.get('image') and not a.get('imageAlt'):
        raise ValueError('An image needs descriptive alt text')
articles.sort(key=lambda a: a['date'], reverse=True)
featured = next((a for a in articles if a.get('featured')), articles[0] if articles else None)
if sum(bool(a.get('featured')) for a in articles) > 1:
    raise ValueError('Choose one featured article')
e = lambda value: escape(str(value), quote=True)

def art(a):
    if a['id'] in ('resettlement', 'digital-access'):
        svg=(ROOT / a['image']).read_text()
        svg=svg.replace('<svg ', '<svg class="cg-preview-svg" aria-hidden="true" focusable="false" ', 1)
        if a['id']=='resettlement':
            svg=svg.replace('<g transform=', '<g class="cg-ticket" transform=', 1)
            svg=svg.replace('<g fill="none"', '<g class="cg-connections" fill="none"', 1)
            svg=svg.replace('<g fill="#fffefa"', '<g class="cg-steps" fill="#fffefa"', 1)
            svg=svg.replace('<g font-family=', '<g class="cg-step-labels" font-family=', 1)
        else:
            svg=svg.replace('<path d="M72', '<path class="cg-route-in" pathLength="1" d="M72', 1)
            svg=svg.replace('<path d="M470', '<path class="cg-route-out" pathLength="1" d="M470', 1)
            svg=svg.replace('<circle cx="416"', '<circle class="cg-barrier" cx="416"', 1)
        return svg
    if a.get('image'):
        return f'<img src="{e(a["image"])}" alt="{e(a["imageAlt"])}" loading="lazy" width="960" height="640">'
    if a['id'] == 'digital-access':
        return '<div class="cg-access-art" aria-hidden="true"><span>THE QUESTION OF ACCESS</span><div class="access-art-line"><b>01</b><i></i><b>02</b><i></i><b>03</b><i></i><b>04</b></div><p>Available.<br><em>Accessible?</em></p><small>Reach &nbsp; / &nbsp; Understand &nbsp; / &nbsp; Book &nbsp; / &nbsp; Attend</small></div>'
    return f'<div class="cg-type-art" aria-hidden="true"><span>{e(a["format"])}</span><p>Common<br><em>Ground</em></p></div>'

def card(a):
    label=date.fromisoformat(a['date']).strftime('%B %d, %Y').replace(' 0',' ')
    terms=' '.join([a['title'], a['summary'], a['author'], *a['topics']])
    return f'''<article class="cg-story story-{e(a['id'])} {'is-lead' if a is featured else ''}" data-topics="{e(json.dumps(a['topics']))}" data-format="{e(a['format'])}" data-search="{e(terms.lower())}"><a class="cg-story-image" href="{e(a['url'])}" aria-label="Read {e(a['title'])}">{art(a)}</a><div class="cg-story-copy"><p class="cg-story-category">{e(a['format'])} <span>· {e(a['topics'][0])}</span></p><h2><a href="{e(a['url'])}">{e(a['title'])}</a></h2><p class="cg-story-summary">{e(a['summary'])}</p><p class="cg-story-meta"><span class="cg-author-name">{e(a['author'])}</span><span class="cg-publish-details"><time datetime="{e(a['date'])}">{label}</time> · {e(a['readingMinutes'])} min read</span></p><a class="cg-story-read" href="{e(a['url'])}">Read the article <span aria-hidden="true">↗</span></a></div></article>'''
ordered=([featured] if featured else [])+[a for a in articles if a is not featured]
formats=sorted(set(a['format'] for a in articles))
options=''.join(f'<option value="{e(f)}">{e(f)}</option>' for f in formats)
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Common Ground | By Beyond Borders</title><meta name="description" content="Research commentary and perspectives on displacement, health, and access to care."><link rel="icon" href="assets/mark.png"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap"><link rel="stylesheet" href="styles.css?v=39"><link rel="stylesheet" href="journal.css?v=8"><link rel="stylesheet" href="common-ground-editorial-type.css?v=1"></head><body class="journal-page gazette-home"><a class="skip-link" href="#main">Skip to content</a><header class="cg-news-header"><a class="cg-news-brand" href="journal.html">Common<br><strong>Ground</strong><span>BY BEYOND BORDERS</span></a><nav aria-label="Publication navigation"><a href="#stories" aria-current="page">Latest</a><a href="common-ground-topics.html">Topics</a><a href="common-ground-standards.html">Our standards</a><a href="index.html">Beyond Borders <svg class="link-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a></nav></header><div class="cg-topic-bar"><span>Displacement</span><span>Health</span><span>Research</span><span>Community</span></div><main id="main" class="cg-news-main"><header class="cg-cover-heading"><p class="eyebrow">By Beyond Borders</p><h1>Common Ground</h1><p>How people rebuild their lives, navigate healthcare, and find support.</p></header><section id="stories" aria-label="Common Ground articles"><details class="cg-search-disclosure"><summary>Search the publication</summary><form class="cg-library-tools" role="search" hidden><label>Search the publication<input id="cg-search" type="search" placeholder="Search by topic, title, or author" autocomplete="off"></label><label>Article type<select id="cg-format"><option value="all">All articles</option>{options}</select></label><p id="cg-count" role="status" aria-live="polite">{len(articles)} {'article' if len(articles)==1 else 'articles'}</p></form></details><div class="cg-story-grid">{''.join(card(a) for a in ordered)}</div><p class="cg-no-results" hidden>No articles match your search. Try another word or choose “All articles.”</p></section><section class="cg-contribute"><div><p class="eyebrow">Join the conversation</p><h2>Contribute to Common Ground.</h2><p>Bring your research, experience, or creative work to the conversation on displacement and health. We welcome proposals across disciplines and formats.</p></div><a href="common-ground-contribute.html">Propose a contribution <svg class="link-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a></section><section id="about-publication" class="cg-news-about"><p class="eyebrow">About Common Ground</p><h2>Understanding displacement.<br>Advancing health.</h2><div><p>Common Ground brings together research, lived experience, and creative perspectives to explore how displacement shapes health and access to care.</p><p>Published by Beyond Borders, we connect evidence with the realities of people and communities rebuilding their lives.</p><a href="common-ground-standards.html">Our editorial approach ↗</a></div></section></main><footer class="journal-footer"><a href="index.html">Beyond Borders</a><p>Research commentaries are interpretations of published work and are not independently peer reviewed.</p></footer><script src="common-ground.js?v=3"></script></body></html>'''
# The signup page accepts consent-based requests through the existing inbox form.
signup='<section class="cg-subscribe"><p class="eyebrow">Stay in the conversation</p><h2>Get new Common Ground stories by email.</h2><p>Research, perspectives, and visual stories on displacement and health.</p><a href="common-ground-signup.html">Request email updates</a></section>'
page=page.replace('<section class="cg-contribute">',signup+'<section class="cg-contribute">')
(ROOT / 'journal.html').write_text(page)
print(f'Built Common Ground with {len(articles)} published article(s).')
# Topic browsing shares the catalog and renders each published story once.
all_topics=sorted({topic for a in articles for topic in a['topics']})
buttons='<button type="button" data-topic="all" aria-pressed="true">All topics</button>'+''.join(f'<button type="button" data-topic="{e(topic)}" aria-pressed="false">{e(topic)}</button>' for topic in all_topics)
topic_page=page[:page.index('<main id="main"')]+ '<main id="main" class="cg-news-main cg-topics-main"><header class="cg-cover-heading"><p class="eyebrow">Explore Common Ground</p><h1>Questions that connect.</h1><p>Explore displacement and health through our published work.</p></header><div class="cg-topic-filters" role="group" aria-label="Filter articles by topic" hidden>'+buttons+'</div><p class="cg-topic-count" role="status" aria-live="polite">'+str(len(articles))+' articles</p><div class="cg-story-grid cg-topic-grid">'+''.join(card(a).replace(' is-lead','') for a in ordered)+'</div></main>'+page[page.index('<footer'):]
topic_page=topic_page.replace('<title>Common Ground | By Beyond Borders</title>','<title>Topics | Common Ground</title>').replace('gazette-home','gazette-home cg-topics-page')
(ROOT/'common-ground-topics.html').write_text(topic_page)

# Keep publication navigation and footer consistent, including supporting pages.
import re
arrow='<svg class="link-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>'
links=[('journal.html','Latest'),('common-ground-topics.html','Topics'),('common-ground-standards.html','Our standards'),('index.html','Beyond Borders '+arrow)]
footer='<footer class="journal-footer cg-shared-footer"><a class="cg-footer-brand" href="journal.html">Common Ground<span>By Beyond Borders</span></a><nav aria-label="Footer navigation"><a href="journal.html">Latest</a><a href="common-ground-topics.html">Topics</a><a href="common-ground-standards.html">Our standards</a><a href="common-ground-contribute.html">Contribute</a><a href="common-ground-signup.html">Email updates</a><a href="index.html">Beyond Borders '+arrow+'</a></nav><p>Research commentaries interpret published work and are not independently peer reviewed.</p></footer>'
for target in [*ROOT.glob('journal*.html'),*ROOT.glob('common-ground-*.html')]:
    text=target.read_text()
    nav='<nav aria-label="Publication navigation">'+''.join('<a href="'+url+'"'+(' aria-current="page"' if target.name==url else '')+'>'+label+'</a>' for url,label in links)+'</nav>'
    text=re.sub(r'<nav aria-label="Publication navigation">.*?</nav>',lambda m:nav,text,flags=re.S)
    text=re.sub(r'<footer class="journal-footer[^"]*">.*?</footer>',lambda m:footer,text,flags=re.S)
    if 'common-ground-browse.css' not in text:
        text=text.replace('</head>','<link rel="stylesheet" href="common-ground-browse.css?v=2"></head>')
    target.write_text(text)
