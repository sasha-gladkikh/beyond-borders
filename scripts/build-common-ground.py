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
    if a.get('image'):
        return f'<img src="{e(a["image"])}" alt="{e(a["imageAlt"])}" loading="lazy" width="960" height="640">'
    if a['id'] == 'digital-access':
        return '<div class="cg-access-art" aria-hidden="true"><span>THE QUESTION OF ACCESS</span><div class="access-art-line"><b>01</b><i></i><b>02</b><i></i><b>03</b><i></i><b>04</b></div><p>Available.<br><em>Accessible?</em></p><small>Reach &nbsp; / &nbsp; Understand &nbsp; / &nbsp; Book &nbsp; / &nbsp; Attend</small></div>'
    return f'<div class="cg-type-art" aria-hidden="true"><span>{e(a["format"])}</span><p>Common<br><em>Ground</em></p></div>'

def card(a):
    label=date.fromisoformat(a['date']).strftime('%B %d, %Y').replace(' 0',' ')
    terms=' '.join([a['title'], a['summary'], a['author'], *a['topics']])
    return f'''<article class="cg-story {'is-lead' if a is featured else ''}" data-format="{e(a['format'])}" data-search="{e(terms.lower())}"><a class="cg-story-image" href="{e(a['url'])}" aria-label="Read {e(a['title'])}">{art(a)}</a><div class="cg-story-copy"><p class="cg-story-category">{e(a['format'])} <span>· {e(a['topics'][0])}</span></p><h2><a href="{e(a['url'])}">{e(a['title'])}</a></h2><p class="cg-story-summary">{e(a['summary'])}</p><p class="cg-story-meta">{e(a['author'])}<br><time datetime="{e(a['date'])}">{label}</time> · {e(a['readingMinutes'])} min read</p><a class="cg-story-read" href="{e(a['url'])}">Explore the piece <svg class="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></a></div></article>'''
ordered=([featured] if featured else [])+[a for a in articles if a is not featured]
formats=sorted(set(a['format'] for a in articles))
options=''.join(f'<option value="{e(f)}">{e(f)}</option>' for f in formats)
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Common Ground | By Beyond Borders</title><meta name="description" content="Research commentary and perspectives on displacement, health, and access to care."><link rel="icon" href="assets/mark.png"><link rel="stylesheet" href="styles.css?v=39"><link rel="stylesheet" href="journal.css?v=7"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap"><link rel="stylesheet" href="common-ground-typography.css?v=1"><link rel="stylesheet" href="common-ground-home.css?v=1"></head><body class="journal-page gazette-home cg-editorial-home"><a class="skip-link" href="#main">Skip to content</a><header class="cg-news-header"><a class="cg-news-brand" href="journal.html">Common<br><strong>Ground</strong><span>BY BEYOND BORDERS</span></a><nav aria-label="Publication navigation"><a href="journal.html" aria-current="page">Latest</a><a href="common-ground-topics.html">Topics</a><a href="common-ground-standards.html">Our standards</a><a href="index.html">Beyond Borders <svg class="link-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a></nav></header><div class="cg-topic-bar"><span>Displacement</span><span>Health</span><span>Research</span><span>Community</span></div><main id="main" class="cg-news-main"><header class="cg-cover-heading"><div class="cg-edition-line"><span>By Beyond Borders</span><span>Displacement · Health · Human experience</span></div><h1>Common <em>Ground</em><span class="cg-masthead-dot" aria-hidden="true">.</span></h1><div class="cg-cover-bottom"><p>Evidence, perspectives, and the questions that move refugee health forward.</p><a href="common-ground-topics.html">Explore the topics <svg class="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></a></div></header><section id="stories" aria-label="Common Ground articles"><div class="cg-library-heading"><h2>Latest perspectives</h2><span>Research. Interpretation. New ways of seeing.</span></div><details class="cg-search-disclosure"><summary>Search the publication</summary><form class="cg-library-tools" role="search" hidden><label>Search the publication<input id="cg-search" type="search" placeholder="Search by topic, title, or author" autocomplete="off"></label><label>Article type<select id="cg-format"><option value="all">All articles</option>{options}</select></label><p id="cg-count" role="status" aria-live="polite">{len(articles)} {'article' if len(articles)==1 else 'articles'}</p></form></details><div class="cg-story-grid">{''.join(card(a) for a in ordered)}</div><p class="cg-no-results" hidden>No articles match your search. Try another word or choose “All articles.”</p></section><section class="cg-contribute"><div><p class="eyebrow">An open invitation</p><h2>Contribute to Common Ground.</h2><p>We welcome contributions from students, researchers, clinicians, community practitioners, and people with lived experience of displacement. Original work in a range of formats is considered for publication, with an emphasis on thoughtful perspectives that deepen understanding of displacement and health. All submissions are subject to editorial review.</p></div><a href="common-ground-contribute.html">Submit a proposal <svg class="link-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a></section><section id="about-publication" class="cg-news-about"><p class="eyebrow">About Common Ground</p><h2>Careful reading.<br>Wider understanding.</h2><div><p>Common Ground is a publication by Beyond Borders examining displacement and health through research commentary and informed perspectives.</p><p>We link to original sources, distinguish findings from interpretation, and explain what the evidence cannot establish.</p><a href="common-ground-standards.html">Read our editorial standards</a></div></section></main><footer class="journal-footer"><a href="index.html">Beyond Borders</a><p>Research commentaries are interpretations of published work and are not independently peer reviewed.</p></footer><script src="common-ground.js?v=1"></script></body></html>'''
(ROOT / 'journal.html').write_text(page)
print(f'Built Common Ground with {len(articles)} published article(s).')
# Topic collections contain only published work and rebuild with the catalog.
from urllib.parse import quote
all_topics=sorted({topic for a in articles for topic in a['topics']})
sections=[]
for topic in all_topics:
    related=[a for a in articles if topic in a['topics']]
    entries=''.join(f'<li><p class="eyebrow">{e(a["format"])}</p><h3><a href="{e(a["url"])}">{e(a["title"])}</a></h3><p>{e(a["summary"])}</p></li>' for a in related)
    sections.append(f'<section class="cg-topic-collection" id="{quote(topic.lower().replace(" ","-"))}"><h2>{e(topic)}</h2><p class="figure-note">{len(related)} published {"article" if len(related)==1 else "articles"}</p><ul>{entries}</ul></section>')
topic_page=page[:page.index('<main id="main"')]+ '<main id="main" class="cg-resource"><p class="eyebrow">Explore Common Ground</p><h1>Questions that connect.</h1><p class="journal-deck">Follow the evidence across our published work, organized by topic.</p>'+''.join(sections)+'</main>'+page[page.index('<footer'):]
topic_page=topic_page.replace('<title>Common Ground | By Beyond Borders</title>','<title>Topics | Common Ground</title>').replace('<script src="common-ground.js?v=1"></script>','').replace('href="#stories" aria-current="page"','href="journal.html"')
(ROOT/'common-ground-topics.html').write_text(topic_page)

# Keep the active navigation indicator accurate in the generated topic index.
topic_path=ROOT/'common-ground-topics.html'
topic_text=topic_path.read_text().replace('href="journal.html" aria-current="page"','href="journal.html"').replace('href="common-ground-topics.html">Topics','href="common-ground-topics.html" aria-current="page">Topics')
topic_path.write_text(topic_text)

# The cover layout is exclusive to the publication landing page.
p=ROOT/'common-ground-topics.html'
p.write_text(p.read_text().replace('gazette-home cg-editorial-home','gazette-home').replace('<link rel="stylesheet" href="common-ground-home.css?v=1">',''))
