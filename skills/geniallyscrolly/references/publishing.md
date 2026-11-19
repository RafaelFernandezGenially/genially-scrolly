# Publishing

## Inside claude.ai (Artifact tool)
Publish `index.html` as the page with its own files (`styles.css`, `assets/*`) in `files`, `root` = the project folder. The runtime, CSS and presets load from the public repo through cdn.jsdelivr.net, which artifacts allow (fonts come from Google Fonts, also allowed). The certificate download uses the `downloads` capability: declare `capabilities: {downloads: true}` when the page has a certificate.

**The kit** is the public repo https://github.com/RafaelFernandezGenially/genially-scrolly. Read any file at `https://raw.githubusercontent.com/RafaelFernandezGenially/genially-scrolly/main/<path>` or `https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@main/<path>`; pages pin `@v0.3.0`.

## Anywhere else
`npx github:RafaelFernandezGenially/genially-scrolly build --out dist` and upload `dist/` to any static host (Netlify, Vercel, GitHub Pages, S3). No server code.

## Page skeleton without the CLI
```html
<!doctype html><html lang="en" data-sc-theme="genially"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>…</title>
<link rel="stylesheet" href="FONTS_URL_FROM_styles/fonts.json">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@v0.3.0/packages/runtime/dist/scrolly.min.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@v0.3.0/styles/presets.css">
</head><body>
<main> … blocks … </main>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@v0.3.0/packages/runtime/dist/scrolly.min.js"></script>
<script>Scrolly.init({license: null, chapters: true});</script>
</body></html>
```
Other GSAP plugins, three.js, D3, Lottie, Theatre.js and Matter.js load by themselves when a block needs them.
