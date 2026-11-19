---
name: geniallyscrolly-blocks
description: How to write, register and test a new Genially Scrolly block, or adapt one of the 111 Scroll Lab reference effects into a page. Use when a scrollytelling needs an effect the runtime does not have.
---

# Writing a block

1. **Check the catalogue first:** `npx genially-scrolly catalog --search <word>` and `--reference`. Reference effects carry working code (`registry.json → reference[].code`) and a live demo link.
2. **Write it** with `Scrolly.block(name, (el, ctx) => {…})` in a `<script>` after `scrolly.js` and before `Scrolly.init()`:
   - Read params from `el.dataset`, or JSON with `Scrolly.util.json(el)`.
   - Respect calm mode: `if(!ctx.M)` render the final readable state and return.
   - Lazy-load heavy work with `ctx.near(el, fn)`; pause loops off-screen with `ctx.visible(el)`.
   - Pin with `ScrollTrigger.create({trigger: el, pin: true, start: 'top top', end: '+=200%'})`; rebuild layout only in `ctx.onWidth(fn)`.
   - Draw charts at real pixel width, never a scaled fixed viewBox.
   - Use tokens (`var(--sc-accent)` …), never hard-coded brand colours.
3. **Register it** for everyone: add an entry to `registry/blocks.src.mjs` (name, category, title, description, params, snippet, use, ld, pin) and the code to `packages/runtime/src/`; run `node scripts/build.mjs && node scripts/registry.mjs && node scripts/docs.mjs`.
4. **Test it** in `examples/kitchen-sink/index.html` and run `npx genially-scrolly verify examples/kitchen-sink`. Look at the desktop and phone screenshots and at `?calm`.
