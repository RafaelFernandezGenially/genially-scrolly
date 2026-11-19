# Intent interview

Two short rounds with the question tool (multiple choice, "Other" is always available), in the user's language. **Round 1** settles what the page is and how it should feel. **Round 2** settles what you can build it with, and adapts to the round-1 answers. Then at most one conditional follow-up. Skip any question the prompt already answers; if the prompt answers everything, skip the interview and say what you understood in one line.

If nobody is there to answer (scheduled run, "just do it", no reply), use the defaults below, write them at the top of BRIEF.md under **Assumptions**, and continue.

Keep labels to 1–5 words and put the trade-off in the option description. Recommend one option per question (first, marked "(Recommended)") when the prompt points to it.

## Round 1 · what and for whom (4 questions)

1. **Goal** · "What should the page achieve?"
   - Tell a story (brand, history, explainer) → route `story`
   - Teach something (course, onboarding, training) → `course`
   - Show data (report, results, research) → `report`
   - Launch a product or feature → `launch`
   Default: `story`. "Other" → `custom`, starting from the nearest route.

2. **Audience** · "Who will scroll through it?"
   - General public / customers
   - Students or learners
   - Colleagues / internal team
   - Executives or investors
   Decides tone, density and jargon. Default: general public.

3. **Style** · "Which look fits?" Offer the 3 presets whose `mood` in `styles/presets.json` best matches the prompt, plus "Our brand / a reference". In each description say the mood in five words. If the user can open links, mention that the gallery shows every effect in every style: `examples/gallery/index.html?theme=<preset>` (or the kit artifact's gallery).
   Default: best mood match; `genially` if nothing matches.

4. **Feel** · "How should it feel to scroll?"
   - Calm and readable: few pins, gentle reveals, text first
   - Lively (Recommended for most): one strong moment per chapter
   - Spectacular: 3D, film scrubs, big transitions, hero moments
   - Playful and interactive: things to click, drag, answer
   Sets motion intensity (calm / medium / hero) and the share of interactive blocks. Default: lively.

## Round 2 · what to build with (adapt, up to 4 questions: 5, 6, 7 and 8 when needed)

5. **Your visual resources** (multi-select, always ask) · "¿Tienes recursos visuales, colores o fuentes que quieras que incluya?" / "Do you have visuals, colours or fonts you want me to include?"
   - Logo, images or video
   - Brand colours
   - Brand fonts
   - No, use a Genially Scrolly style
   Any "yes" triggers the follow-up below: ask them to attach the files or paste the hex codes and font names. Use every one: colours and fonts become tokens (`style-system.md`), files go to `assets/` and into the beats that fit, the logo goes in the opening. Default: no (use the chosen preset).

5b. **Content you have** (multi-select; fold into question 5 when the round is full) · "What else do you already have?"
   - Text or a script
   - Numbers or a spreadsheet
   - Nothing yet: write it for me
   Default: nothing (you write the copy; charts with sample data marked "sample").

6. **Must-have moments** (multi-select, 4 options chosen to fit route + feel; never list blocks by name). Pick from:
   - 3D and WebGL (fly-through world, objects, particles, 3D charts) → `world3d`, `object3d`, `particles`, `bars3d`, `layers3d`, `distort`
   - Data that moves (charts, maps, globe, counters) → `chart` (D3 types), `kpi`, `counter`, `odometer`, `gauge`
   - Film or image sequence scrubbed by scroll → `video-scrub`, `sequence`, `film-labels`
   - Big moving type → `words`, `kinetic`, `giant-lines`, `scatter-letters`, `fill-text`
   - Things to answer or practise (quiz, scenario, flashcards) → learning blocks
   - A journey or timeline → `road`, `timeline`, `year-counter`, `clock`, `camera`
   - Hover and touch toys (stickers, image trail, physics) → `stickers`, `image-trail`, `physics`, `click-burst`
   Default: the route's defaults in `routes/<route>.md`.

7. **Length and device** · "How long, and where will most people read it?"
   - Short, mostly phone (3–5 min, 8–10 beats)
   - Medium, desktop and phone (5–8 min, 10–14 beats) (Recommended)
   - Long, mostly desktop (10+ min, 14–20 beats)
   Phone-first means fewer pinned blocks, no hover-only content, larger type. Default: medium.

8. **Use** · "Where will it be used?" Ask only when unclear.
   - Personal, school or non-profit → free tier
   - A company, client, paid course or ads → commercial licence note
   - Not sure
   Never blocks the build; it decides what you say in step 7 of SKILL.md.

If round 2 would only have one real question, fold it into round 1 instead (still max four per call).

## One conditional follow-up (only if needed)

Ask in plain text or one more question call, only for what you cannot proceed without:

- Visual resources = yes, or style = brand / reference → "Pásame tus colores (hex), el nombre de tus fuentes y adjunta el logo o las imágenes" / "Share your colours, fonts, logo or a link/screenshot." Then follow `style-system.md` (tokens, contrast check) and `media.md`. If they attach nothing, say what you used instead.
- Content includes numbers → "Attach the spreadsheet or paste the numbers, and tell me the source." Real data is marked `"source":"real"`; anything you invent is `"sample"` and said so in the page.
- Route = course → "What should learners be able to do at the end, and how do we check it?" (`learning-design.md`).
- Route = report → "What is the one number or finding people must remember?"
- Must-have = film scrub and the user has a video → ask for it; otherwise plan the Lab-style image sequence or 3D instead.

## Derived without asking

- **Language**: the language of the prompt.
- **Tone**: from audience (public: warm and concrete; learners: encouraging, second person; internal: direct; executives: brief, numbers first).
- **Motion budget** (`motion-rules.md`): calm ≤ 3 pins, lively ≤ 6, spectacular ≤ 9, always alternating with plain sections. Phone-first: −2.
- **Accessibility**: always on (reduced motion, alt text, keyboard, contrast). Not a choice.
- **Call to action**: the last beat asks the reader to do one thing (from the goal).

## Write BRIEF.md

Fill `templates/BRIEF.md`. Quote the user's own words for the goal. List every default you used under **Assumptions**. This file is the only routing artifact: later steps read it instead of asking again.
