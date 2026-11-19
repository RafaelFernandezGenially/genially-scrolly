<p align="center"><b>genially<span>.</span>scrolly</b></p>

<h1 align="center">Genially Scrolly</h1>
<p align="center">Scrollytelling from a prompt. Write HTML, add <code>data-scrolly</code>, scroll.<br>Built for people and for AI agents.</p>

<p align="center"><a href="#quick-start">Quick start</a> · <a href="#blocks">Blocks</a> · <a href="#styles">Styles</a> · <a href="#templates">Templates</a> · <a href="#skills">Skills</a> · <a href="https://claude.ai/artifact/5WUUjtSuaiCftcwstWEFsy">Scroll Lab (111 live effects)</a> · <a href="#licence">Licence</a></p>

---

Genially Scrolly turns an idea into a finished scroll-driven page: stories, courses, reports and launches. Every effect is one attribute on plain HTML, run by a small runtime on [GSAP](https://gsap.com/). An agent skill, **`/geniallyscrolly`**, guides the whole process: it interviews you once, writes a brief and a storyboard, builds from a template in your style, checks the page on desktop and phone, and ships it.

```html
<div data-scrolly="steps">
  <div class="sc-graphic">
    <img data-show="a" src="one.jpg" alt="The assembled slide">
    <img data-show="b" src="two.jpg" alt="The same slide in layers">
  </div>
  <div class="sc-steps">
    <div data-step="a"><p>One slide looks flat.</p></div>
    <div data-step="b"><p>It is really six layers.</p></div>
  </div>
</div>
```

## Quick start

### With an AI agent (recommended)

**Claude Code plugin**
```bash
claude plugin marketplace add RafaelFernandezGenially/genially-scrolly
claude plugin install geniallyscrolly@genially-scrolly
```
Then type **`/geniallyscrolly`** and describe what you want: *"a scrollytelling about the history of our school, warm and friendly, with a quiz at the end"*.

**Standalone skills** (Claude Code, Cursor, Codex and other agents that read `SKILL.md`)
```bash
npx skills add RafaelFernandezGenially/genially-scrolly            # pick skills
npx skills add RafaelFernandezGenially/genially-scrolly --all      # all three
```

**claude.ai** (no admin needed on Team plans, where user skills are on by default)
1. Download [`geniallyscrolly-skill.zip`](https://github.com/RafaelFernandezGenially/genially-scrolly/releases/latest/download/geniallyscrolly-skill.zip).
2. In Claude: **Customize → Skills → + → Create skill → Upload a skill**, and choose the ZIP. Make sure it is switched on.
3. In a new chat, write `/geniallyscrolly` and what you want, e.g. *"a scrollytelling about how our onboarding works, playful, with a quiz"*.

Pages made this way load the runtime from this public repo through jsDelivr, so nothing else needs installing or sharing.

### By hand
```bash
npx github:RafaelFernandezGenially/genially-scrolly init my-story --template story --theme editorial --title "The river"
cd my-story
npx github:RafaelFernandezGenially/genially-scrolly preview   # http://localhost:5173
npx github:RafaelFernandezGenially/genially-scrolly lint      # structure, accessibility, licence rules
npx github:RafaelFernandezGenially/genially-scrolly verify    # desktop + phone screenshots (Playwright)
npx github:RafaelFernandezGenially/genially-scrolly build     # host-ready folder
```
Requirements: Node 18+. `verify` needs Playwright. Or skip the CLI and load the runtime from the CDN:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@v0.2.0/packages/runtime/dist/scrolly.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@v0.2.0/styles/presets.css">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@v0.2.0/packages/runtime/dist/scrolly.min.js"></script>
<script>Scrolly.init();</script>
```

## What you can build

| Route | For | Highlights |
|---|---|---|
| **story** | brand stories, explainers, histories | sticky steps, kinetic type, zoom-through, Prezi-style camera, timeline |
| **course** | onboarding, training, lessons | progress tracker, knowledge checks, branching scenarios, flashcards, sorting, video questions, certificate |
| **report** | data stories, annual reports | KPI tiles, bar/line/donut/waffle/race charts with real/sample labels, pinned counters |
| **launch** | products and features | particles, film scrubbed by scroll, feature stacks, sideways galleries, before/after |

## How it works

1. **The skill** asks two short rounds of questions (goal, audience, style, feel; then content, must-have moments, length and device, use), writes `BRIEF.md` and `STORYBOARD.md`.
2. **The CLI** scaffolds the page from a template with a style preset.
3. **The runtime** (`scrolly.js`, ~174 KB unminified, no build step; three.js, D3, Lottie, Theatre.js, Matter.js and GSAP plugins load only when a block on the page needs them) finds every `data-scrolly` element and wires it: pins, scrubbing, lazy loading, calm mode for reduced motion, rebuilds only on width changes.
4. **The checks** (`lint`, `verify`) catch structural, accessibility and licence problems and take screenshots the agent must look at.

## Blocks

**86 blocks** in the runtime and **111 ready effects** — every effect of the [Scroll Lab](https://claude.ai/artifact/5WUUjtSuaiCftcwstWEFsy), each one snippet away ([full reference](skills/geniallyscrolly/references/blocks.md)). See them all live in [`examples/gallery`](examples/gallery) and switch between the 8 styles.

| Category | Blocks |
|---|---|
| Reveal & text | `reveal` `assemble` `curtain` `words` `scramble` `fill-text` `marker` `kinetic` `marquee` `scatter-letters` `text-path` `odometer` `giant-lines` `weight-wave` |
| Scale & colour | `grow` `shrink` `color-flow` `colour-journey` `zoom-through` `portal` `fisheye` `hue-shift` `flip-cards` `dot-field` |
| Layout & zoom | `steps` `stack` `horizontal` `parallax` (speed + lag) `opposite-columns` `parallax-gallery` `camera` `deep-zoom` `ken-burns` |
| Data | `chart` — 25 types: bar, line, donut, waffle, race + D3 treemap, pack, sunburst, stream, slope, dumbbell, lollipop, waterfall, radial, small multiples, annotated (pinned), network, heatmap, beeswarm, ridgeline, radar (pinned), Gantt, morph (pinned), globe, map flight · `kpi` `counter` `gauge` `pictogram` `scatter` `waffle-steps` |
| Timelines & infographic | `timeline` `road` `progress-line` `year-counter` `clock` |
| Media | `video-scrub` `film-labels` `sequence` `autoplay-video` `video-cards` |
| 3D & WebGL (three.js) | `world3d` `object3d` `distort` `particles` `bars3d` `layers3d` |
| Animation formats & physics | `lottie` `theatre` `physics` |
| Hover & click | `compare` `hotspots` `spotlight` `magnetic` `tilt` `image-trail` `rolling-links` `click-burst` `stickers` `hover-preview` `flip-layout` `cursor-zone` |
| Full page & navigation | `deck` `header` `toc` `ring` `curtain-footer` `css-scroll` `vt-cards` |
| Learning | `progress` `quiz` `scenario` `flashcards` `sort` `glossary` `video-quiz` `certificate` |

```bash
npx genially-scrolly catalog --effects --category 3d   # the 111 effects
npx genially-scrolly add globe --to index.html          # an effect, ready to edit
npx genially-scrolly add quiz --to index.html           # or a block
```

## Styles

Eight presets, each a set of CSS tokens and a font trio: `genially`, `editorial`, `swiss`, `neon-arcade`, `soft-paper`, `corporate-clean`, `museum`, `cobalt-clay`. Or give the skill your brand or a reference image and it derives the tokens (contrast-checked). See [style-system.md](skills/geniallyscrolly/references/style-system.md).

## Templates

`story`, `course`, `report`, `launch` in [`templates/`](templates). All 111 effects live: [`examples/gallery`](examples/gallery). The core blocks in one page: [`examples/kitchen-sink`](examples/kitchen-sink).

## Skills

| Skill | Use |
|---|---|
| `/geniallyscrolly` | Entry point: interview → brief → storyboard → build → check → ship |
| `/geniallyscrolly-cli` | The CLI commands |
| `/geniallyscrolly-blocks` | Writing new blocks from the Lab sources |

## Licence

Genially Scrolly is **free for non-commercial use** under the [Genially Scrolly License](LICENSE.md), with the "Made with Genially Scrolly" mark on every page. **Commercial use needs a licence**, in the spirit of Remotion's model.

| | Free | Creator | Team | Enterprise |
|---|---|---|---|---|
| Non-commercial use | ✓ | ✓ | ✓ | ✓ |
| Commercial use | — | 1 person | organisation | organisation |
| Remove the mark | — | ✓ | ✓ | ✓ |
| Genially analytics | — | ✓ | ✓ | ✓ |
| Genially APIs (AI images, assets, publish) | — | — | ✓ | ✓ |
| LMS / xAPI, SSO, custom terms | — | — | — | ✓ |

> The Genially licensing and Pro services are **not live in this release**. The runtime ships the hooks (`Scrolly.init({license})`, `Scrolly.track`, `Scrolly.genially.*`); every key resolves to "not connected" until Genially opens the service.

## Packages

| Path | What |
|---|---|
| `packages/runtime` | `scrolly.js` + `scrolly.css` (blocks, calm mode, mark, Pro hooks) |
| `packages/cli` | `genially-scrolly` CLI |
| `registry/` | `registry.json`: 86 blocks, 111 effects (snippets in `registry/effects/`), Lab sources |
| `styles/` | presets (tokens + fonts) |
| `templates/` | story, course, report, launch |
| `skills/` | agent skills |
| `examples/` | gallery (all 111 effects) and kitchen sink |

## Development

```bash
node scripts/build.mjs      # runtime → packages/runtime/dist
node scripts/registry.mjs   # registry.json + block snippets
node scripts/docs.mjs       # skills/geniallyscrolly/references/blocks.md
node packages/cli/bin/scrolly.mjs verify examples/kitchen-sink
```

Made by Genially. Born from the Genially Story and the Scroll Lab.
