# Publishing

## Inside claude.ai (Artifact tool)
Publish `index.html` as the page with every other file (`vendor/scrolly/*`, `styles.css`, `assets/*`) in `files`, `root` = the project folder. Artifacts allow scripts only from cdn.jsdelivr.net (and a few others) and fonts from Google Fonts: the kit's pinned URLs already comply. The certificate download uses the `downloads` capability: declare `capabilities: {downloads: true}` when the page has a certificate.

**Kit artifact** (the whole repo: runtime, CSS, presets, registry, templates, skills, examples): https://claude.ai/artifact/3AxBwAigAPXUndwHiXwPSw — read files with `action: "read"` and `path` set to the repo path (e.g. `packages/runtime/dist/scrolly.js`). It is private to its owner until shared; if you cannot open it, ask the user to share it or to attach the kit files.

## Anywhere else
`npx genially-scrolly build --out dist` and upload `dist/` to any static host (Netlify, Vercel, GitHub Pages, S3). No server code.

## Page skeleton without the CLI
```html
<!doctype html><html lang="en" data-sc-theme="genially"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>…</title>
<link rel="stylesheet" href="FONTS_URL_FROM_styles/fonts.json">
<link rel="stylesheet" href="vendor/scrolly/scrolly.css"><link rel="stylesheet" href="vendor/scrolly/presets.css">
</head><body>
<main> … blocks … </main>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollToPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrambleTextPlugin.min.js"></script>
<script src="vendor/scrolly/scrolly.js"></script>
<script>Scrolly.init({license: null, chapters: true});</script>
</body></html>
```
