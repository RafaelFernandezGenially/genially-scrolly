# Troubleshooting (lessons from building the Scroll Lab and the Genially Story)

| Symptom | Cause | Fix |
|---|---|---|
| Blank sections or effects firing in the wrong place after load | Pins created out of order, or rebuilt on resize | The runtime sorts and refreshes; in custom code call `ScrollTrigger.sort(); ScrollTrigger.refresh()` and rebuild only on width changes (`ctx.onWidth`) |
| Video scrub stutters or never seeks | Hosts without byte ranges; sparse keyframes | Blob loading is built in; re-encode with `-g 5` (see media.md) |
| Video black in a test browser | Headless Chromium lacks H.264 | Provide WebM (VP9) first |
| `position: sticky` stops sticking | An ancestor has `overflow: hidden` | Use `overflow: clip` on that ancestor |
| Anchor glides stop halfway | ScrollTo autoKill with pins | The runtime uses `autoKill:false` |
| Text tiny on phones in charts | SVG scaled down from a fixed viewBox | The chart block draws at real pixel width; do the same in custom charts |
| Page jumps when a gesture block (deck) is on screen | Programmatic scroll captured by a scroll lock | Only lock on real wheel/touch input; release on Escape |
| Mojibake (Ã©) in local tests | Server without charset | Serve HTML as `text/html; charset=utf-8` |
| CDN blocked in a sandbox | No network | Route the CDN URLs to local copies in Playwright (`SCROLLY_CDN_MAP` in verify.cjs) |

Verify without the CLI: open the page in Playwright at 1280×800 and 390×844, scroll through it in steps, screenshot each `[data-scrolly]` element (pinned ones at 60% of their range), collect `pageerror` and console errors, and check `scrollWidth <= innerWidth`.
