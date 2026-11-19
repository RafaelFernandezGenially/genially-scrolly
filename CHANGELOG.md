# Changelog

## 0.2.0 · 2026-11-19
- **Every Scroll Lab effect is in the library: 111 ready effects** (`registry/effects/`, `npx genially-scrolly add <effect>`, `catalog --effects`) on **86 blocks** (47 new).
- New blocks: assemble, scatter-letters, text-path, odometer, giant-lines, weight-wave, shrink, colour-journey, fisheye, hue-shift, flip-cards, gauge, pictogram, scatter, road, progress-line, year-counter, clock, opposite-columns, parallax-gallery, ken-burns, dot-field, waffle-steps, image-trail, rolling-links, click-burst, stickers, hover-preview, flip-layout, cursor-zone, header, toc, ring, curtain-footer, deck, css-scroll, vt-cards, video-cards, and three.js blocks world3d, object3d, distort, bars3d, layers3d, plus lottie, theatre, physics (Matter.js) and film-labels.
- `chart` draws 25 types: 20 new D3 forms (treemap, pack, sunburst, stream, slope, dumbbell, lollipop, waterfall, radial, multiples, annotated, network, heatmap, beeswarm, ridgeline, radar, gantt, morph, globe, map-flight). D3, three.js, Lottie, Theatre.js, Matter.js and the GSAP plugins a block needs load on demand.
- `parallax` supports `data-lag`. Minified builds `scrolly.min.js` / `scrolly.min.css` (46 KB gzipped).
- `examples/gallery`: all 111 effects live, with a style switcher; checked on desktop, phone, calm mode and a light preset.
- Fixes: stack cards no longer flash black, zoom-through keeps its background, labels on light fills are dark, links follow the theme, chapter chip sits under the header and steps aside during pinned scenes, 3D scenes keep their framing on portrait phones, nothing widens the page on phones.
- Skill: a two-round intent interview (goal, audience, style, feel; content, must-have moments, length and device, use) and a richer BRIEF.
- npm: the CLI package bundles the kit, so `npx genially-scrolly` works outside the repo (`node scripts/pack.mjs`).

## 0.1.0 · 2026-11-19
- Runtime with 39 blocks, calm mode, chapter chip, custom cursor, progress bar, Lenis option, "Made with Genially Scrolly" mark, Pro hooks (licence, analytics, Genially APIs) without a live service.
- CLI: init, add, theme, catalog, themes, templates, lint, preview, verify, build, license, pro, skills update.
- 8 style presets, 4 templates, kitchen-sink example.
- Registry with 111 reference effects from the Scroll Lab.
- Skills: /geniallyscrolly, /geniallyscrolly-cli, /geniallyscrolly-blocks.
