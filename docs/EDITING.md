# Editing the site

All of the site's facts live in `src/content/`. The pages in `src/App.js` read
from those files, so each publication, talk, or resource is recorded once and
appears everywhere it is used (homepage, Publications, CV).

After any change, run `npm run build` to check it, then commit and push to
`main`. The GitHub Actions workflow builds the site and publishes it to
GitHub Pages.

Note that this repository is public. Do not put private correspondence,
proposal statuses, or application plans in it.

## Files

| File | What it holds |
| --- | --- |
| `site.json` | Contact details, ORCID, teaching totals, CV file, page titles and descriptions, homepage notices |
| `publications.json` | Publications, books and editorial projects, commissioned work, awards |
| `presentations.json` | Talks, upcoming and past |
| `resources.json` | Archival collections, primary texts, scholarship |
| `cv.json` | Education, appointment, research interests, teaching institutions, memberships |
| `sample.json` | The edition sample (`null` until one is ready) |

Text in `*asterisks*` is set in italics. Use ordinary hyphens, not en or em dashes.

## Common tasks

**Update a publication's status.** In `publications.json`, change `status`
(`forthcoming` or `published`) and add `volume`, `issue`, `year`, `pages`,
`doi`, and `links` as they become known. Leave a field out rather than
guessing. Link labels should say what the link is: "Journal article",
"Publisher page", "Journal issue".

**Add a notice.** Add an entry to `notices` in `site.json` and remove the
oldest, keeping three. A notice about a publication can point at its record
(`"publication": "trauma"`) so its wording follows the record's status.

**Record a talk.** Add it to `presentations.json` with `"status": "accepted"`
and the event month as `"date": "2027-03"`. Accepted talks are listed under
Accepted presentations, and stay there after the event until you change the
status. The build prints a review reminder for any accepted talk whose month
has passed. Once you confirm the talk was given, change the status to
`"delivered"` and it moves to Selected past presentations.

**Update the CV.** The CV page and the PDF are made from the same content:
`cv.json`, plus the publication, presentation, and award records. After
changing any of these:

```
npm run build      # fails with a reminder if the PDF is now out of date
npm run cv:pdf     # prints /cv/ to public/castleberry-cv.pdf
npm run build
```

Set `cv.updated` in `site.json` to the date the PDF should show. The PDF
generator needs Playwright and Chromium (`CHROMIUM_PATH` can point to a
browser). If the machine can't reach Google Fonts, `FONT_DIR` can point to a
folder of local font files. The build refuses to deploy a PDF that no longer
matches the CV content.

**Add a resource.** Add an entry to the right group in `resources.json`.
Entries are sorted by author automatically. Label each link as a "Finding aid",
"Digitized text", "Catalog record", or "Publisher page". Never call a catalog
record a readable text.

**Update the edition's progress figures.** Edit the archival paragraphs in the
`Edition` component in `src/App.js`. Then change `editionProgressUpdated` in
`site.json`.

**Publish the edition sample.** This repository is public, and everything in
`src/content/` is bundled into the site. So prepare the sample elsewhere, and
add it here only when it is ready to publish. Replace `null` in
`sample.json` with the authentic text you have edited, including
`"enabled": true`. Never use a generated or placeholder passage. Put any
images in `public/edition-sample/`. The build refuses to run if
`sample.json` holds a sample without `"enabled": true`, or if that image
folder exists while no sample is enabled. The fields are:

```json
{
  "enabled": true,
  "title": "", "date": "", "description": "", "archive": "", "identifier": "",
  "image": { "src": "/edition-sample/page1.jpg", "full": "/edition-sample/page1-large.jpg", "width": 1200, "height": 1600, "alt": "", "credit": "" },
  "textLabel": "Edited text",
  "text": ["paragraph", "paragraph"],
  "editorialNote": ["paragraph"],
  "annotations": [{ "ref": "line 4", "note": "" }],
  "citation": { "author": "Ella Lyman Cabot", "documentTitle": "", "date": "", "editor": "Jacob B. Castleberry", "project": "Ella Lyman Cabot Critical Edition (in development)", "identifier": "" },
  "reproductionCredit": "",
  "versionDate": ""
}
```

Leave out `image` if reproduction is not authorized. Once the sample is
filled in, the build adds `/cabot-edition/sample/` to the site and the
sitemap, and the edition page links to it.

## How pages are built

`npm run build` runs the React build, then `scripts/postbuild.js`. That script
gives each route in `site.json` its own `index.html`, with that page's title,
description, and canonical URL, so direct visits and reloads work on GitHub
Pages. It also writes `404.html` for unknown addresses and `sitemap.xml`.
Page text is rendered by JavaScript in the browser.

## Checks

```
npm test -- --watchAll=false   # routing, page titles, shared records
npm run build                  # also lists past accepted talks to confirm
```
