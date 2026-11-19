# Motion rules

- **One idea per beat.** If a block needs a paragraph to justify it, cut it.
- **Pin budget:** a pinned block (`pin: true` in the registry) holds the page for 100–400% of a screen. Keep to about one per screenful of story and never two hero pins in a row. Lint warns above 8 per page.
- **Rhythm:** alternate tension and rest: pinned → plain → pinned. After a hero moment, give a calm section (words, marker, a chart).
- **Scrub vs trigger:** scrub (tied to scroll) for things the reader controls (video, camera, counters, charts); trigger once for small entrances (reveal, kpi, scramble).
- **Phones:** horizontal becomes a swipe strip; steps put the graphic on top (52% of the screen) and the text below. Keep text inside graphics ≥ 14px at 390px wide.
- **Reduced motion:** the runtime switches to calm mode automatically (OS setting or `?calm`): every block shows its final, readable state. Never put information only in motion.
- **Speed:** scrub smoothing .4–.8; snap pinned galleries to items; don't make the reader scroll more than ~3 screens for one idea.
- **Pins and resizes:** the runtime rebuilds only when the width changes and sorts triggers before refreshing (a lesson from the Scroll Lab: rebuilding pins on height changes leaves blank sections on mobile).
