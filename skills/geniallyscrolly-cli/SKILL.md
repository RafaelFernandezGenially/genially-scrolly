---
name: geniallyscrolly-cli
description: Commands of the Genially Scrolly CLI (init, add, theme, catalog, lint, preview, verify, build, license, skills update). Use when running or explaining `npx genially-scrolly` commands in a scrollytelling project.
---

# Genially Scrolly CLI

All commands are non-interactive, safe for agents, and work offline except the CDN libraries the page loads.

| Command | What it does |
|---|---|
| `npx genially-scrolly init <dir> --template story\|course\|report\|launch --theme <preset> --title "…"` | Scaffolds `index.html`, `styles.css`, `vendor/scrolly/`, `assets/`, `scrolly.json`, `BRIEF.md`, `STORYBOARD.md` |
| `add <block-or-effect> [--to index.html]` | Prints a block or effect snippet (all 111 Lab effects have one), or inserts it before `</main>` |
| `theme <preset> [--in index.html]` | Switches preset and its Google Fonts link |
| `catalog [--effects] [--search q] [--category c] [--reference] [--json]` | Lists the 86 blocks, the 111 effects (`--effects`) or the Lab sources (`--reference`) |
| `themes` · `templates` | Lists presets (with mood words) and templates |
| `lint [file]` | Unknown blocks, script order, unpinned CDN versions, missing alt text, pin budget, invalid JSON, charts without real/sample source, steps without graphic layers, hidden mark (licence), big assets |
| `studio [dir] [--port 5174] [--no-open]` | Opens **Scrolly Studio** on localhost in a new browser tab: a reduced Genially-style editor (layers, insert the 111 effects, edit text/images/chart data, brand colours and fonts, assets, desktop/phone preview, Save to `index.html` with history). AI, analytics, watermark and publish buttons show the Genially paid-plan invitation |
| `preview [dir] [--port 5173]` | Local static server (`?calm` shows reduced motion) |
| `verify [dir]` | Playwright: desktop + phone screenshots of every block, console errors, overflow, mark present → `.scrolly/verify/REPORT.md` |
| `build [dir] [--out dist]` | Copies a host-ready folder (no Markdown files) |
| `license [status\|activate <key>]` | Saves a licence key; the Genially service is not connected in this release, so nothing unlocks yet |
| `pro` | Prints the tiers and what a licence unlocks |
| `skills update [--global]` | Installs these skills into `.claude/skills` |

Exit codes: `lint` exits 1 on errors; `verify` exits 2 when Playwright is missing.
