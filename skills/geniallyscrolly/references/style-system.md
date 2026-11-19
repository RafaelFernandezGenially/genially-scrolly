# Style system

Every visual decision reads a CSS token, so a style is just a set of tokens. Pick a preset with `<html data-sc-theme="name">` (CLI: `scrolly theme <name>`), then override tokens in `styles.css` if needed.

## Presets (styles/presets.json)

| Preset | Feel | Fonts (display / body / mono) |
|---|---|---|
| genially | bold, playful, dark, brand | Unbounded / DM Sans / DM Mono |
| editorial | newspaper, longform, light | Fraunces / Source Serif 4 / IBM Plex Mono |
| swiss | minimal, poster, light | Inter Tight / Inter / JetBrains Mono |
| neon-arcade | gaming, night, energetic | Space Grotesk / Space Grotesk / Space Mono |
| soft-paper | kids, school, warm, light | Baloo 2 / Nunito / Fira Mono |
| corporate-clean | business, training, light | Manrope / Inter / IBM Plex Mono |
| museum | culture, premium, dark | Cormorant Garamond / Karla / DM Mono |
| cobalt-clay | crafted, 3D, colourful | Bricolage Grotesque / Bricolage / DM Mono |

Match the prompt's mood words to the `mood` list of each preset.

## Tokens

`--sc-bg --sc-surface --sc-surface-2 --sc-ink --sc-muted --sc-line` (surfaces and text) · `--sc-accent … --sc-accent-6` (categorical order: charts use them in this order, so colour always follows the same entity) · `--sc-on-accent --sc-on-accent-2` (text on accent 1 and 2) · `--sc-font-display --sc-font-body --sc-font-mono` · `--sc-radius` · `--sc-tint --sc-tint-2` (subtle fills: white-based on dark themes, black-based on light ones).

## From a brand or a reference

1. Take 1 background, 1 ink, 1 muted ink and up to 6 accents from the brand or the reference image (sample the image's dominant colours; prefer the brand guide when there is one).
2. Contrast: body text ≥ 4.5:1 on `--sc-bg` and `--sc-surface`; `--sc-on-accent` ≥ 4.5:1 on `--sc-accent`. Check with a contrast function; do not eyeball.
3. Fonts from Google Fonts (pinned in one `<link>`); a display face with character, a highly legible body face.
4. Write the overrides in `styles.css`: `:root[data-sc-theme]{ --sc-accent:#…; … }`.
5. Light theme? set `--sc-tint: rgba(0,0,0,.05)` and `--sc-line` dark-based.

Never copy another company's artwork or logo; a reference sets the mood, not the assets.
