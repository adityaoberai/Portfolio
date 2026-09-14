# OG image

`og.html` is the source for `static/og.png`. It uses the same palette, Newsreader font files, and portrait as the site. Re-render with:

```
npm run og
```

The script finds Chrome or Edge (or uses the `CHROME` env var) and screenshots the page at 1200x630 with a 2x device scale factor.
