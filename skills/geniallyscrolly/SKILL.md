---
name: geniallyscrolly
description: Make a scrollytelling page with Genially Scrolly (a story, course, report or product launch) from a prompt and a style. Asks a few short questions, then writes a brief and storyboard, builds, checks on desktop and phone, and publishes. Use for /geniallyscrolly, scrollytelling, scroll story, pagina con scroll, or edits to a Genially Scrolly project.
---

# /geniallyscrolly

Genially Scrolly turns a prompt, a style and some content into a finished scrollytelling page: plain HTML where every effect is one `data-scrolly="…"` attribute, run by a small runtime on GSAP. This skill is the guide. It asks a few short questions, writes a brief and a storyboard, builds from a template, checks the page on desktop and phone, and ships it. Follow the steps in order and do not skip the checks.

Read these only when the step needs them. They sit next to this file when the skill was installed from the repo, the plugin or the skill ZIP. If they are not there (for example a skill saved in claude.ai with only this file), fetch them from the public repo: `https://raw.githubusercontent.com/RafaelFernandezGenially/genially-scrolly/main/skills/geniallyscrolly/<file>` (or `https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@main/skills/geniallyscrolly/<file>`):
`references/intent-interview.md` · `references/routes/<route>.md` · `references/blocks.md` · `references/style-system.md` · `references/motion-rules.md` · `references/data-viz.md` · `references/learning-design.md` · `references/media.md` · `references/accessibility-performance.md` · `references/publishing.md` · `references/pro-and-licensing.md` · `references/troubleshooting.md`

## 0. Find the kit

You need four things from the kit: `packages/runtime/dist/scrolly.js`, `scrolly.css`, `styles/presets.css` + `styles/presets.json`, and `registry/registry.json` (86 blocks, 111 ready effects — one per Scroll Lab effect — with snippets in `registry/effects/<name>.html`). The live gallery of all 111 is `examples/gallery/index.html`. Look in this order and use the first that works:

1. The current project already has `vendor/scrolly/scrolly.js` → it is a Genially Scrolly project; go to step 1 with state "existing project".
2. The repo is on disk (a `genially-scrolly/` folder, or `npx genially-scrolly --help` works) → use the CLI: `npx genially-scrolly init`, `add`, `lint`, `verify`.
3. Anywhere else, including claude.ai: use the public repo. **Pages load the runtime straight from the CDN** — no install, no copying:
   - `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@v0.2.0/packages/runtime/dist/scrolly.min.css">`
   - `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@v0.2.0/styles/presets.css">`
   - `<script src="https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@v0.2.0/packages/runtime/dist/scrolly.min.js"></script>` (after gsap + ScrollTrigger; the page skeleton is in `references/publishing.md`)
   Read the catalogue and templates the same way: `https://raw.githubusercontent.com/RafaelFernandezGenially/genially-scrolly/main/registry/registry.json`, `https://raw.githubusercontent.com/RafaelFernandezGenially/genially-scrolly/main/templates/<route>/body.html`, `https://raw.githubusercontent.com/RafaelFernandezGenially/genially-scrolly/main/registry/effects/<effect>.html`, `https://raw.githubusercontent.com/RafaelFernandezGenially/genially-scrolly/main/styles/presets.json`, `https://raw.githubusercontent.com/RafaelFernandezGenially/genially-scrolly/main/styles/fonts.json`. Sample pictures and videos: `https://cdn.jsdelivr.net/gh/RafaelFernandezGenially/genially-scrolly@v0.2.0/examples/kitchen-sink/assets/<file>` (replace them with the user's own).
4. The CLI without installing anything: `npx github:RafaelFernandezGenially/genially-scrolly <command>` (needs Node 18+).

## 1. Start from the project state

| State | Do this |
|---|---|
| The user asks a question about Genially Scrolly | Answer from the references; no build. |
| `BRIEF.md` exists and the page is not built | Skip the interview; go to step 3 with that brief. |
| An existing project and a specific change ("make the chart a race", "switch to editorial style") | Make the change directly, then run step 6 (checks). No interview. |
| A new page from a prompt | Steps 2 → 7. |
| The user gave a finished storyboard or script | Write it into `STORYBOARD.md` in the format of `templates/STORYBOARD.md`, then steps 4 → 7. |

## 2. Interview briefly, then write BRIEF.md

The page has to fit what the user wants, so ask before building — briefly. Use the question tool (not plain-text questions), in the user's language, following `references/intent-interview.md`:

- **Round 1 (4 questions): goal → route, audience, style (3 matching presets + "our brand / a reference"), feel** (calm · lively · spectacular · playful).
- **Round 2 (up to 4, adapted to round 1): content they have, must-have moments** (3D, moving data, film scrub, big type, activities, journey, toys), **length and device**, and **use** (only if commercial use is unclear).
- **At most one follow-up** for what you cannot build without: brand colours/logo, the data file and its source, learning objectives (course), the key finding (report).

Skip anything the prompt already answers; if it answers everything, confirm your reading in one line and go on. If the user is away or says "just do it", use the defaults in the reference, list them as assumptions, and continue.

Write `BRIEF.md` from `templates/BRIEF.md`. From here on the brief is the only source of intent: re-read it, do not re-ask.

## 3. Route

Read `references/routes/<route>.md` for the chosen route. It gives the chapter skeleton, the blocks that fit and the traps. Routes: `story` (narrative, editorial, brand story), `course` (learning module, onboarding, training), `report` (data story, annual report, dashboard-in-a-story), `launch` (product or feature launch), `custom` (anything else: start from the closest route and adapt).

## 4. Storyboard before code

Write `STORYBOARD.md` (format in `templates/STORYBOARD.md`): one row per beat with the message, the block, the asset or data it needs, and motion intensity (calm / medium / hero). Then check it against `references/motion-rules.md`:

- One idea per beat; 8–16 beats for a full page.
- At most one pinned block per screenful of story, and never two hero moments in a row: alternate pinned and plain sections.
- Every number has a source; every chart is marked real or sample (`references/data-viz.md`).
- Every learning activity has a purpose stated in the brief (`references/learning-design.md`).
- Every asset exists or has a plan (`references/media.md`). Missing pictures: use the user's, draw SVG/CSS, use a 3D/particle block, or ask. AI image generation through Genially is a Pro feature (step 7).

Show the storyboard to the user in a short table only if they are present and the page is large; otherwise continue.

## 5. Build

1. Scaffold: `npx genially-scrolly init <dir> --template <route> --theme <preset> --title "<title>"` (or, without the CLI, copy the template body into the page skeleton from `references/publishing.md`).
2. Replace the template body beat by beat with the storyboard. Take snippets from `references/blocks.md` (or `npx genially-scrolly add <block-or-effect>`; `npx genially-scrolly catalog --effects` lists all 111 effects); never invent block names: lint rejects them. The must-have moments in the brief map to blocks in `references/intent-interview.md`.
3. Style: set the preset; for a brand or reference, override tokens in `styles.css` following `references/style-system.md` (contrast checked, display/body/mono fonts, 6 accents in a fixed order).
4. Write the real copy. Short sentences, one idea per step, the reader's language. No lorem ipsum left anywhere.
5. Put assets in `assets/`. Videos to scrub: encode as described in `references/media.md` (frequent keyframes) and give both WebM and MP4.

Every Scroll Lab effect already has a block and a ready snippet (`registry.json → effects`). For something new, start from the closest effect's source in `registry.json → reference` (Lab code + live demo) and write a custom block (`references/blocks.md`, "Custom blocks"). Heavy libraries (three.js, D3, Lottie, Theatre.js, Matter.js) and the GSAP plugins a block needs load automatically, only when that block is on the page.

## 6. Check: lint, verify, look

1. `npx genially-scrolly lint` → fix every error, read every warning.
2. `npx genially-scrolly verify` → screenshots of every block on desktop (1280×800) and phone (390×844) plus console errors, in `.scrolly/verify/`. Without the CLI, do the same with Playwright (`references/troubleshooting.md` has the script outline).
3. **Look at the screenshots.** Fix overlapping text, blank pinned sections, unreadable labels on phones, and anything cut off. Re-run verify after fixes. Also open `?calm` (reduced motion): every block must show its content without motion.

## 7. Ship and tell the user what applies

Publish per `references/publishing.md` (inside claude.ai: one Artifact with the page and all files; elsewhere: `npx genially-scrolly build` → any static host). Then tell the user, briefly and only what applies (`references/pro-and-licensing.md` has the wording):

- **Free tier**: non-commercial use, every block, the "Made with Genially Scrolly" mark stays on (also on certificates).
- **Commercial use** (a company site, a paid course, client work, ads): needs a Genially Scrolly licence.
- **Pro features** — no mark, Genially analytics (scroll depth, completions, quiz results), Genially APIs (AI images in the page's style, asset library, publish to Genially): need a licence **and** the Genially connection. That connection is not live in this release; say so plainly, never pretend it worked, and offer the free alternative.

Hard rules: never hide, remove or restyle away the mark (lint fails); never fake analytics or generated images; never put API keys in the page.
