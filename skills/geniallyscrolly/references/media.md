# Media

**Images.** Use the user's images first (ask in the interview). Free alternatives when there are none: SVG/CSS illustration you draw, coloured panels with big type, the `particles` block, charts. Always write alt text that says what the image shows.

**AI image generation** in the page's style is a Genially Pro feature (`Scrolly.genially.generateImage`). It needs a licence and the Genially connection, which is **not live in this release**: tell the user that, do not fake it, and use a free alternative. If the user has another image tool of their own, they may use it; you place the files in `assets/`.

**Video to scrub with scroll.** Re-encode with frequent keyframes so seeking is instant, and provide both formats:
`ffmpeg -i in.mov -an -vf scale=1280:-2 -c:v libvpx-vp9 -b:v 1.6M -g 5 film.webm`
`ffmpeg -i in.mov -an -vf scale=1280:-2 -c:v libx264 -crf 24 -g 5 -bf 0 -movflags +faststart film.mp4`
The runtime fetches the file once as a blob, so it seeks even on hosts that ignore byte ranges.

**Image sequences** (frames as WebP, 60–120 frames, ≤ 15 KB each at 1280 px) beat video for short exact moves.

**3D renders** (e.g. Three.js offline in a headless browser) can be exported as video and scrubbed; record per-frame screen positions as JSON to place HTML labels on objects (see the Lab's "Labels that track a film").

**Weight:** keep the page under ~25 MB; lint warns at 10 MB per file.
