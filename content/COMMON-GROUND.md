# Publishing to Common Ground

The landing page is generated from `content/common-ground.json`. Edit the catalog, not the generated `journal.html`.

## Add a review or essay

1. Create the article HTML page using `journal-digital-access.html` as the layout reference. Replace its title, author, date, article body, sources, and metadata. Remove its article-specific interactive components and `journal.js` unless relevant. Do not reuse the current author's byline for another contributor.
2. Add an entry to the `articles` list in the catalog. Use a unique `id`, a descriptive `title`, short `summary`, `author`, ISO `date` (YYYY-MM-DD), `format`, `topics`, positive `readingMinutes`, and the local HTML `url`.
3. For an image-led card, set `image` to an asset path and provide meaningful `imageAlt`. If no image is ready, set `image` to null; the page supplies a restrained typographic cover. Use authorized images with captions/credits in the article.
4. Start with `status: "draft"`. Change it to `"published"` when the content is approved. Draft entries are excluded from the listing; this is not access control for draft files. Keep confidential or unfinished article files outside a publicly deployed directory.
5. Set `featured: true` on one published entry. Set the old feature to false. If none is featured, the latest published article leads.
6. Run `python3 scripts/build-common-ground.py` from the project folder. Preview `journal.html`, check links and mobile layout, then deploy using the project's normal process. Building does not deploy.

Cards are ordered newest first. The main feature occupies a wide lead position; additional articles appear in a three-column grid that adapts to small screens. Search covers titles, descriptions, authors and topics. The article-type selector grows automatically from published formats, so empty categories are not advertised.

Suggested formats: Research commentary, Literature review, Perspective, Field notes. Use “Literature review” only when the article actually describes the reviewed literature and its selection approach; do not label commentary as original research or peer-reviewed work.

Minimal draft entry:

```json
{
  "id": "unique-article-slug",
  "title": "Your article title",
  "summary": "A concise explanation of the article's question and contribution.",
  "author": "Author name",
  "date": "2026-09-19",
  "format": "Perspective",
  "topics": ["Healthcare access"],
  "readingMinutes": 4,
  "url": "your-article.html",
  "image": null,
  "imageAlt": "",
  "featured": false,
  "status": "draft"
}
```

The build checks duplicate IDs, dates, required published fields, one featured article, and local article/image files. Verify factual claims and sources separately. Future-dated entries marked published are not automatically scheduled; use draft status until ready.

## Editorial features
The catalog also generates `common-ground-topics.html` from published topics. Use consistent topic names; never add placeholder articles to populate a collection. Run `python3 scripts/build-common-ground.py` after catalog edits.

Structure a research commentary around **The finding**, **The open question**, and **The implication**. Distinguish the source authors’ results from your interpretation. Use the digital access article as a layout reference, replacing all article-specific citations, evidence-panel content, metadata, and discussion-guide links.

Each new author needs an accurate profile and each commentary should have its own discussion guide. The digital-access guide has a print stylesheet and a Print / save as PDF button.

Contributor responses: invite proposals through `common-ground-contribute.html`. Do not fabricate quotations or imply that an invitation is a published contribution. Before adding a response, obtain the contributor’s approval, confirm attribution, disclose relevant affiliations/conflicts, and label the response separately from research evidence. Replace the invitation on the relevant article only after the response is ready.

Follow `common-ground-standards.html`. Add a dated correction note for substantive corrections and a visible updated date when revising article content. Do not claim external review unless completed and authorized for attribution.
