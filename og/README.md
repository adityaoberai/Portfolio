# OG image

`og.html` is the source for `static/og.png`. It uses the V3 palette, the Newsreader font files, and `room.jpg`, a high-resolution capture of the room.

Regenerate after the room or the copy changes:

```
npm run build
npm start            # in another terminal; serves http://127.0.0.1:4173 by default
npm run assets       # rewrites og/room.jpg, static/room-still.jpg, static/aditya-480.{webp,jpg}
npm run og           # renders og.html to static/og.png
```

`npm run assets` (`scripts/derive-assets.mjs`) pins the Bengaluru clock to 11:00 so the window shows a daytime sky, and hides the room's overlays before capturing. `npm run og` finds Chrome or Edge (or uses the `CHROME` env var) and screenshots the page at 1200x630 with a 2x device scale factor.
