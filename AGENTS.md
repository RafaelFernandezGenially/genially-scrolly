# AGENTS.md

You are working in the Genially Scrolly repo or in a project made with it.

- Making or editing a scrollytelling page: follow `skills/geniallyscrolly/SKILL.md` (interview once → BRIEF.md → STORYBOARD.md → build → lint → verify → ship).
- Use only block names from `registry/registry.json`; `npx genially-scrolly lint` rejects others.
- Never hide or remove the "Made with Genially Scrolly" mark; never fake Pro features (licence verification, Genially analytics, AI images). They need a licence and the Genially connection, which is not live in this release.
- Mark every chart `"source": "real"` or `"sample"`.
- After any change: `lint`, then `verify`, then look at the screenshots (desktop and phone) and `?calm`.
- Changing the runtime: edit `packages/runtime/src`, then `npm run build`; add new blocks to `registry/blocks.src.mjs` and test them in `examples/kitchen-sink`.
