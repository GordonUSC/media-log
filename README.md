# Gordon Bellamy · Speaking, Board & Advisory

Current GitHub Pages address: https://gordonusc.github.io/media-log/

This revision makes paid speaking and board/advisory inquiries the primary journeys while retaining a searchable media record and the original accessible archive destinations.

Static site: index.html, site.css, site.js and media-data.js. No package install or build is needed. Serve the repository with a local HTTP server. No backend or third-party analytics; inquiry fields remain in page memory. YouTube is loaded only on click.

## Pages
- index.html: current proposed speaking/board experience
- archive.html: original August 2026 main page, retained as history
- eyes.html: existing eye-gaze archive
- hello.html: existing welcome for Joey

The 49-record collection merges one duplicate, corrects MDEV's event year and the Digital Civics URL, and labels records without public references. See REVIEW.md for the critique, source evidence, remaining opportunities, and validation limits.

## Local checks
JavaScript syntax: node --check site.js
Interaction test: node tests/interface.cjs (uses the existing isolated jsdom runtime at /tmp/gordtopia-engine-test; this dependency is not shipped to visitors).

## Assets
USC portrait: https://cinema.usc.edu/images/directory/66A6FD4F_DC09_4CA7_42C07DBE5C0971B9.jpg
Additional existing public headshot: https://www.kepplerspeakers.com/bellamy-g.jpg
UConn video thumbnail: https://i.ytimg.com/vi/Lb8ZcOXPQ-I/hqdefault.jpg
Clash Display and Switzer fonts are retained from the previously published page's embedded assets. No generated likeness or testimonial is used.
