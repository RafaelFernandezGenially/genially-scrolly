# Data visualisation

- **Form follows the job:** change over time → line; compare items → bar (sorted); share of a whole → donut (≤ 5 parts) or waffle (people/percent); ranking that changes → race (pinned); one headline number → kpi or counter (not a chart).
- **Real or sample, always.** Every chart JSON has `"source": "real"` or `"sample"`; the runtime shows the chip. Real data comes from the user (file, connector) and keeps its exact values; never round silently or invent. If the user has no data, use sample data and say so in the chart note.
- **Titles say the message** ("Games overtook presentations in 2026"), notes say the period and unit.
- **Colour follows the entity:** series use the accents in fixed order; the same category keeps the same colour across charts (pass `color` per series when needed).
- **One axis.** Never a dual-axis chart; two measures → two charts.
- **Hover + table:** the chart block adds hover values and a "Show as a table" view automatically: keep them.
- **More forms, same block:** `chart` also draws treemap, pack, sunburst, stream, slope, dumbbell, lollipop, waterfall, radial, multiples, annotated (pinned), network, heatmap, beeswarm, ridgeline, radar (pinned), gantt, morph (pinned area → bars → 100%), globe and map-flight. D3 loads only when one is used. The JSON shape of each is in `blocks.md` (`chart` params) and every one has a ready effect: `npx genially-scrolly add treemap`, `add globe`, …
- **Picking a form:** part-to-whole → donut, waffle, treemap, pack, sunburst · change over time → line, annotated, stream, morph, waterfall · ranking → bar, lollipop, race · before/after → slope, dumbbell · distribution → beeswarm, ridgeline, heatmap · relations → network · places → globe, map-flight · plans → gantt · profiles → radar, multiples. In 3D only for one dramatic moment: `bars3d`.
- **Internal data:** if numbers come from the user's company systems, remind them to check before sharing publicly.
