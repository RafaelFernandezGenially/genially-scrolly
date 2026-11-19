# Blocks (86 in the runtime)

Every block is an element with `data-scrolly="<name>"`. Params are data attributes or a JSON `<script type="application/json">` child. "pins" = holds the page while it plays (count them: motion-rules.md). Live demos of related effects are in the Scroll Lab (https://claude.ai/artifact/5WUUjtSuaiCftcwstWEFsy).

## Reveal

### `reveal` · Reveal on enter
Fades, wipes, circles, blurs or scales an element in. Add data-stagger to reveal its children in groups.

- `data-effect`: fade-up | clip | circle | blur | scale | tiles
- `data-scrub`: tie the reveal to scroll position
- `data-stagger`: seconds between children (batch reveal)

Use for: Openers, section titles, image entrances. · L&D: Pace a lesson: reveal one idea at a time.

```html
<h2 class="sc-h2" data-scrolly="reveal" data-effect="clip" data-scrub>A headline that wipes in</h2>
```

## Text

### `words` · Word-by-word reveal
Words light up as the reader scrolls, so reading speed follows scrolling speed. Keeps links and emphasis.

Use for: Manifestos, quotes, key statements. · L&D: Learning objectives that the learner reads at their own pace.

```html
<p class="sc-h2" data-scrolly="words">Most content is made to be <em>looked at</em>. This one is made to be <em>scrolled</em>.</p>
```

### `scramble` · Scramble decode
A line decodes from noise the first time it is seen. Needs ScrambleTextPlugin.

Use for: Kickers, chapter labels, numbers.

```html
<p class="sc-kicker" data-scrolly="scramble">CHAPTER 2 · THE ENGINE</p>
```

### `fill-text` · Fill on scroll
Outlined giant type fills with colour as you scroll past.

Use for: Big statements between chapters.

```html
<p class="sc-display" data-scrolly="fill-text">Fill on scroll</p>
```

### `marker` · Marker highlight
Every <mark> inside gets a highlighter stroke drawn as it reaches the reading line.

Use for: Body text with one or two key ideas. · L&D: Mark the exact definition learners must remember.

```html
<p data-scrolly="marker">Highlight the <mark>key phrase</mark> as people read.</p>
```

### `kinetic` · Kinetic word swap · pins
Pinned giant words swap through masked letters, one per stretch of scroll.

Use for: Taglines with three beats.

```html
<div data-scrolly="kinetic"><div class="sc-kw"><span>Look</span><span>Click</span><span>Play</span></div></div>
```

### `marquee` · Velocity marquee
Rows of giant type scroll sideways, faster with scroll speed, flipping with direction.

Use for: Breaks between chapters, lists of formats.

```html
<div data-scrolly="marquee"><div class="sc-row"><span><span>Quizzes</span><span>Games</span><span>Lessons</span></span></div></div>
```

## Data

### `counter` · Counter
A big number counts up once, or with data-pin it is scrubbed by scroll and rewinds.

- `data-to`: final value
- `data-prefix`: 
- `data-suffix`: 
- `data-decimals`: 0
- `data-pin`: pin and scrub
- `data-length`: scroll length when pinned, e.g. 150%

Use for: One headline number.

```html
<div data-scrolly="counter" data-to="30000000" data-suffix="+" data-pin><span class="sc-kicker">people</span></div>
```

## Layout

### `steps` · Sticky graphic + steps (scrollytelling core)
A graphic stays on screen while text steps scroll past; each step switches the graphic layers marked with data-show. Fires a scrolly:step event for custom graphics.

- `data-side`: left puts the graphic on the right
- `.sc-graphic [data-show]`: space-separated step ids that show this layer
- `.sc-steps [data-step]`: step id

Use for: The backbone of most stories: maps, charts, products explained step by step. · L&D: Explain a process one step at a time with the diagram always visible.

```html
<div data-scrolly="steps">
  <div class="sc-graphic">
    <img data-show="a" src="one.jpg" alt="…" style="width:100%;height:100%;object-fit:cover">
    <img data-show="b" src="two.jpg" alt="…" style="width:100%;height:100%;object-fit:cover">
  </div>
  <div class="sc-steps">
    <div data-step="a"><p><b>Step one.</b> What the first picture shows.</p></div>
    <div data-step="b"><p><b>Step two.</b> What changes next.</p></div>
  </div>
</div>
```

### `stack` · Sticky card stack
Cards pin one over another; the one below shrinks and darkens.

- `style --c / --fg`: card colours

Use for: Lists of 3 to 6 big ideas.

```html
<div data-scrolly="stack"><article style="--c:var(--sc-accent)"><h3 class="sc-h2">One</h3></article><article style="--c:var(--sc-accent-3)"><h3 class="sc-h2">Two</h3></article></div>
```

### `horizontal` · Sideways chapter · pins
Vertical scroll drives a horizontal strip with snapping and speed skew; becomes a swipe strip on phones. Mark inner art with data-drift for parallax.

- `data-no-snap`: turn snapping off
- `[data-drift]`: inner parallax amount in %

Use for: Timelines, galleries, product lines.

```html
<section data-scrolly="horizontal"><div class="sc-track">
  <article style="--c:var(--sc-accent)"><h3 class="sc-h2">2015</h3><p>…</p></article>
  <article style="--c:var(--sc-accent-3)"><h3 class="sc-h2">2020</h3><p>…</p></article>
</div></section>
```

### `parallax` · Parallax layers
Children with data-speed move at their own speed.

- `[data-speed]`: 1 = normal, 0.8 slower, 1.2 faster
- `[data-lag]`: seconds the element trails the scroll (smooth-follow feel)

Use for: Depth in hero images and galleries.

```html
<div data-scrolly="parallax"><img data-speed="0.8" src="back.jpg" alt=""><img data-speed="1.2" src="front.png" alt=""></div>
```

## Scale & colour

### `color-flow` · Colour flow
The background glides between colours as each band reaches the middle of the screen.

- `[data-bg]`: band background
- `[data-fg]`: band text colour

Use for: Mood changes between chapters.

```html
<div data-scrolly="color-flow"><div data-bg="#6C29FF" data-fg="#fff"><p class="sc-h2">Purple</p></div><div data-bg="#C8FE53" data-fg="#121212"><p class="sc-h2">Lime</p></div></div>
```

### `zoom-through` · Zoom through a glyph · pins
Big text scales around one character (data-origin) until it fills the screen: a door into the next chapter.

- `[data-origin]`: the character to dive into
- `data-scale`: 60
- `data-to`: background at the end

Use for: Transitions on a key number or word.

```html
<div data-scrolly="zoom-through"><div class="sc-zw">19<span data-origin>0</span>+</div></div>
```

### `portal` · Dot portal · pins
A dot grows into a circle that becomes the next room; its content fades in.

Use for: Chapter transitions.

```html
<div data-scrolly="portal" style="background:var(--sc-accent-2)"><p class="sc-h2">Next room.</p></div>
```

### `grow` · Grow to full screen · pins
A rounded card opens to full bleed.

Use for: Hero images, product reveals.

```html
<div data-scrolly="grow"><img src="photo.jpg" alt="…"></div>
```

## Reveal

### `curtain` · Curtain split · pins
Two halves slide apart to show what is behind.

Use for: Reveals and before/after moments.

```html
<div data-scrolly="curtain"><div class="sc-half l">Open&nbsp;</div><div class="sc-half r">&nbsp;up</div><p class="sc-h2">What was behind</p></div>
```

## Zoom & camera

### `deep-zoom` · Deep zoom into an image · pins
Scroll pushes into one point of a picture.

- `data-origin`: x% y% of the point
- `data-scale`: 5

Use for: Details in maps, paintings, machines. · L&D: Zoom from the whole system to the part being taught.

```html
<div data-scrolly="deep-zoom" data-origin="52% 62%" data-scale="5"><img src="big.jpg" alt="…"></div>
```

### `camera` · Prezi-style camera · pins
One big canvas; scroll flies a camera between stops (zooming out between them), can rotate to tilted frames, snaps to each stop, with stop buttons and captions.

- `data-width / data-height`: world size in px
- `[data-stop]`: a stop; data-x, data-y, data-zoom (radius in px), data-rotate, data-title, data-text

Use for: Concept maps, ecosystems, mind maps. · L&D: A course map learners fly through, with a hidden easter egg.

```html
<section data-scrolly="camera" data-width="3000" data-height="1800">
  <div data-stop data-title="Learn" data-text="Lessons and quizzes." data-x="700" data-y="500" data-zoom="420" style="width:420px;height:280px;background:var(--sc-accent)">Learn</div>
  <div data-stop data-title="Work" data-text="Onboarding and reports." data-x="2300" data-y="500" data-zoom="420" style="width:420px;height:280px;background:var(--sc-accent-2)">Work</div>
</section>
```

## Media

### `video-scrub` · Video scrubbed by scroll · pins
Scroll is the playhead. The film is fetched once as a blob so seeking is instant even on hosts without byte ranges. Encode with frequent keyframes (ffmpeg -g 5 -bf 0).

- `data-src`: webm (VP9)
- `data-fallback`: mp4 (H.264)
- `data-duration`: seconds
- `data-length`: scroll length, e.g. 300%
- `data-poster`: image

Use for: Product films, 3D renders, process videos.

```html
<div data-scrolly="video-scrub" data-src="film.webm" data-fallback="film.mp4" data-duration="8" data-poster="poster.jpg"></div>
```

### `sequence` · Image sequence · pins
Frames drawn on a canvas, exact per scroll position. Lighter than video for short loops.

- `data-frames`: pattern, e.g. frames/f{000}.webp
- `data-count`: number of frames

Use for: Rotations, assemblies, Apple-style product moments.

```html
<div data-scrolly="sequence" data-frames="frames/f{000}.webp" data-count="72"></div>
```

### `autoplay-video` · Plays when seen
Muted video plays while on screen and pauses when it leaves, with a visible pause button.

Use for: Ambient loops, demos.

```html
<div data-scrolly="autoplay-video"><video src="clip.mp4" poster="poster.jpg"></video></div>
```

## 3D

### `particles` · Particles that re-form (Three.js) · pins
Thousands of points move from one shape to the next per stretch of scroll. Three.js loads only when the block is near.

- `data-shapes`: cloud, sphere, cube, ring, text:WORD (comma separated)

Use for: Openers, brand moments.

```html
<div data-scrolly="particles" data-shapes="cloud,sphere,text:PLAY,ring"></div>
```

## Timeline

### `timeline` · Serpentine timeline
A winding path draws itself with a dot riding it; each stop lights as it passes.

- `[data-year]`: one stop each

Use for: Histories, roadmaps, processes. · L&D: A learning path with milestones.

```html
<div data-scrolly="timeline"><div data-year="2015">Founded.</div><div data-year="2020">Grew.</div><div data-year="2026">Today.</div></div>
```

## Data

### `chart` · Chart (25 types)
SVG chart drawn at the real pixel width (readable on phones), animated with scroll, with hover values and a table view. Mark data as real or sample. bar/line/donut/waffle/race are built in; the D3 types load D3 only when used.

- `JSON type`: bar | line | donut | waffle | race · D3: treemap | pack | sunburst | stream | slope | dumbbell | lollipop | waterfall | radial | multiples | annotated (pins) | network | heatmap | beeswarm | ridgeline | radar (pins) | gantt | morph (pins) | globe (pins) | map-flight (pins)
- `JSON items`: [[label, value]] for treemap/pack/lollipop
- `JSON notes`: annotated: [[index, text, dir]]
- `JSON nodes/links`: network
- `JSON rows/cols/values`: heatmap
- `JSON groups/points`: beeswarm
- `JSON tasks`: gantt: [[name, start, end]]
- `JSON stops`: globe/map-flight: [[name, lon, lat, text?]]
- `JSON source`: real | sample
- `JSON labels / series`: [{name, values, color?}]
- `JSON max, unit, center, colors, alt`: optional

Use for: Any number that needs a shape.

```html
<div data-scrolly="chart"><script type="application/json">{"type":"bar","title":"Minutes per visit","source":"sample","note":"illustrative","labels":["Quiz","Game","Lesson"],"series":[{"name":"Minutes","values":[6,14,9]}]}</script></div>
```

### `kpi` · KPI tiles
Stat tiles that count up once when they arrive.

- `[data-value]`: number
- `data-prefix / data-suffix`: 
- `data-short`: 3.6M style

Use for: Dashboards inside stories.

```html
<div data-scrolly="kpi"><div><small>Users</small><b data-value="3663475" data-short></b><span>last 12 weeks</span></div></div>
```

## Hover & click

### `compare` · Before/after compare
Drag to compare two images; optional numbered hotspots.

- `data-hotspots`: [[x%, y%, "text"], …]
- `data-label`: accessible name

Use for: Redesigns, restorations, x-rays.

```html
<div data-scrolly="compare" data-hotspots='[[30,40,"The detail"]]'><img src="before.jpg" alt="Before"><img src="after.jpg" alt="After"></div>
```

### `hotspots` · Image hotspots
Numbered buttons on an image that open short notes.

- `data-hotspots`: [[x%, y%, "text"], …]

Use for: Diagrams, maps, product anatomy. · L&D: Label the parts of a machine or a body.

```html
<div data-scrolly="hotspots" data-hotspots='[[20,30,"Here"],[70,60,"And here"]]'><img src="diagram.jpg" alt="…"></div>
```

### `spotlight` · Spotlight reveal
The pointer cuts a hole in the top layer to show the one underneath.

- `data-radius`: 120

Use for: Hidden layers, x-ray views.

```html
<div data-scrolly="spotlight" style="aspect-ratio:16/9"><img src="under.jpg" alt="…"><img src="over.jpg" alt="…"></div>
```

### `magnetic` · Magnetic buttons
Buttons and links inside lean toward the pointer.

Use for: Calls to action.

```html
<p data-scrolly="magnetic"><a class="sc-btn" href="#">Start</a></p>
```

### `tilt` · 3D tilt cards
Direct children tip toward the pointer.

Use for: Feature cards.

```html
<div data-scrolly="tilt"><div class="sc-ld">Card</div><div class="sc-ld">Card</div></div>
```

## Learning

### `progress` · Progress tracker
Lists every learning activity on the page and remembers completion on this device.

- `data-title`: heading

L&D: Turns a long page into a module learners can come back to.

```html
<div data-scrolly="progress" data-title="Your progress"></div>
```

### `quiz` · Knowledge check
Multiple-choice questions with instant feedback, an explanation either way and a score.

- `JSON`: [{q, options, answer, why}]
- `data-title`: name in the tracker

L&D: Check understanding after each chapter.

```html
<div data-scrolly="quiz" data-title="Knowledge check"><script type="application/json">[{"q":"What does scrub mean?","options":["Plays once","Scroll drives it both ways"],"answer":1,"why":"Scroll back and it rewinds."}]</script></div>
```

### `scenario` · Branching scenario
A conversation where choices change what happens next, with a mood meter and the path shown at the end.

- `JSON`: {start, who, nodes:{id:{say, choices:[[label, next, score]]} | {end, text}}}

L&D: Soft skills, sales, customer service, compliance.

```html
<div data-scrolly="scenario" data-title="Scenario"><script type="application/json">{"start":"a","who":"Marta","nodes":{"a":{"say":"Completion is 31%.","choices":[["Ask where people drop off","good",1],["Add more content","bad",-1]]},"good":{"end":"Great outcome","text":"You found the blocker."},"bad":{"end":"Missed it","text":"Start from the data."}}}</script></div>
```

### `flashcards` · Flashcards
Flip cards with a spaced-repetition queue: missed cards come back sooner.

- `JSON`: [[front, back], …]

L&D: Vocabulary, product names, rules.

```html
<div data-scrolly="flashcards" data-title="Flashcards"><script type="application/json">[["Scrub","Scroll drives the animation"],["Pin","The section holds still"]]</script></div>
```

### `sort` · Sort it out
Drag (or tap, then tap a box) items into categories, then check.

- `JSON`: {bins:[…], items:[[label, binIndex]]}

L&D: Practise judgement: risks, needs, the right tool.

```html
<div data-scrolly="sort" data-title="Sort it out"><script type="application/json">{"bins":["Safe","Risky"],"items":[["Strong password",0],["Shared login",1]]}</script></div>
```

### `glossary` · Glossary on demand
Terms open a definition on hover, focus or tap.

- `.sc-term data-def`: the definition
- `data-goal`: terms to open to complete

L&D: Help newcomers without slowing experts.

```html
<p data-scrolly="glossary" data-title="Glossary">A <button class="sc-term" data-def="Decides when an effect starts.">trigger</button> starts it.</p>
```

### `video-quiz` · Video that asks a question
The video pauses at data-at seconds and asks a question before it continues.

- `data-at`: seconds
- `JSON`: {q, options, answer, why}

L&D: Keeps learners active during video.

```html
<div data-scrolly="video-quiz" data-at="2.5" data-title="Video question"><video src="clip.mp4"></video><script type="application/json">{"q":"What did you notice?","options":["A","B"],"answer":1,"why":"Because…"}</script></div>
```

### `certificate` · Certificate
Draws the learner name, date and completed activities; downloads as PNG (inside claude.ai via the downloads capability). The free tier prints the Genially Scrolly mark.

- `data-course`: course name

L&D: A clear end point and a record of completion.

```html
<div data-scrolly="certificate" data-course="Onboarding 101"></div>
```

## Text

### `scatter-letters` · Scattered letters
Letters start scattered and rotated and fall into place as the line crosses the screen.

Use for: Short punchy titles (under 30 characters).

```html
<p class="sc-display" data-scrolly="scatter-letters">Pieces fall into place</p>
```

### `text-path` · Text on a path
A sentence travels along a curved SVG path, driven by scroll.

Use for: A single sentence that should feel like a journey.

```html
<div data-scrolly="text-path">Every click is a story that moves along a line</div>
```

### `odometer` · Odometer
Each digit rolls like a mechanical counter to its value.

- `data-value`: the number to show (commas allowed)

Use for: One headline figure.

```html
<div data-scrolly="odometer" data-value="30,000,000"></div>
```

### `giant-lines` · Giant sliding lines
Rows of huge type slide in opposite directions with scroll.

Use for: Section breaks and brand words.

```html
<div data-scrolly="giant-lines"><div>Look · Click · Play · Look · Click</div><div style="color:transparent;-webkit-text-stroke:2px var(--sc-ink)">Learn · Share · Create · Learn</div></div>
```

### `weight-wave` · Weight wave
A wave of font weight runs through the letters as you scroll (needs a variable font).

Use for: One-word statements.

```html
<p class="sc-display" data-scrolly="weight-wave">INTERACTIVE</p>
```

## Reveal

### `assemble` · Assemble from chaos
Tiles fly in from random places and assemble a shape drawn as rows of 0/1.

- `data-shape`: rows of 0/1 separated by |

Use for: A logo or letter built from pieces.

```html
<div data-scrolly="assemble" data-shape="00111100|01100110|01100000|01101110|01100110|00111100"></div>
```

## Scale & colour

### `shrink` · Shrink away
A full-bleed image shrinks into a rounded card as you leave it.

Use for: Transition out of a hero image.

```html
<div data-scrolly="shrink"><img src="assets/g2.jpg" alt="The engine shrinking into a card"></div>
```

### `colour-journey` · Colour journey · pins
A pinned panel steps through a palette, background and text together.

- `data-colors`: bg/fg/label, comma separated

Use for: Introducing a brand palette or moods.

```html
<div data-scrolly="colour-journey" data-colors="#6C29FF/#fff/Purple,#C8FE53/#121212/Lime,#F73C69/#fff/Pink,#121212/#BAA2FC/Night"></div>
```

### `fisheye` · Fisheye list
List items scale up as they reach the centre of the screen.

Use for: A long list of options or formats.

```html
<ul data-scrolly="fisheye" style="list-style:none;padding:0;font:800 clamp(28px,5vw,64px)/1.45 var(--sc-font-display)"><li>Presentations</li><li>Quizzes</li><li>Escape rooms</li><li>Infographics</li><li>Games</li><li>Courses</li><li>Reports</li></ul>
```

### `hue-shift` · Hue shift
An image or element cycles its hue with scroll.

- `data-degrees`: how far to rotate the hue (default 360)

Use for: Playful colour variety on one image.

```html
<img data-scrolly="hue-shift" src="assets/g0.jpg" alt="The word click, cycling through colours" style="width:100%;border-radius:var(--sc-radius)">
```

### `flip-cards` · Flip-down cards
Cards flip down from the top edge in sequence.

Use for: Three to six short items.

```html
<div data-scrolly="flip-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px"><div style="background:var(--sc-accent);color:var(--sc-on-accent);border-radius:var(--sc-radius);display:grid;place-items:center;font:800 clamp(18px,2.4vw,30px) var(--sc-font-display);aspect-ratio:3/4">Look</div><div style="background:var(--sc-accent-2);color:var(--sc-on-accent-2);border-radius:var(--sc-radius);display:grid;place-items:center;font:800 clamp(18px,2.4vw,30px) var(--sc-font-display);aspect-ratio:3/4">Click</div><div style="background:var(--sc-accent-3);color:#fff;border-radius:var(--sc-radius);display:grid;place-items:center;font:800 clamp(18px,2.4vw,30px) var(--sc-font-display);aspect-ratio:3/4">Play</div><div style="background:var(--sc-accent-4);color:#121212;border-radius:var(--sc-radius);display:grid;place-items:center;font:800 clamp(18px,2.4vw,30px) var(--sc-font-display);aspect-ratio:3/4">Learn</div></div>
```

## Data

### `gauge` · Gauge
A half-dial fills to a value.

- `data-value`: 0–100
- `data-suffix`: e.g. %
- `data-label`: caption

Use for: One percentage that matters. · L&D: Show the pass mark or completion rate.

```html
<div data-scrolly="gauge" data-value="73" data-suffix="%" data-label="Completion"></div>
```

### `pictogram` · Pictogram
100 icons; the first N light up.

- `data-value`: 0–100
- `data-icon`: a character or emoji
- `data-label`: caption

Use for: "8 in 10" style statements.

```html
<div data-scrolly="pictogram" data-value="80" data-label="in 100 users are teachers" data-icon="●"></div>
```

### `scatter` · Rearranging scatter
A cloud of dots that regroups and ranks itself. Inside a steps block it follows the step (a, b, c).

- `data-n`: number of dots
- `data-groups`: comma-separated group names

Use for: Showing that a population splits.

```html
<div data-scrolly="steps"><div class="sc-graphic"><div data-show="a b c" style="padding:16px"><div data-scrolly="scatter" data-groups="Schools,Companies,Others" style="height:100%"></div></div></div><div class="sc-steps"><div data-step="a"><p>A cloud of 60 lessons.</p></div><div data-step="b"><p>Grouped by who made them.</p></div><div data-step="c"><p>Ranked by completion.</p></div></div></div>
```

## Infographic

### `road` · Poster camera timeline · pins
A pinned poster with a road; the camera travels from stop to stop and snaps to each.

- `JSON`: [{title, text, value?}]

Use for: A journey, a process, a week in the life. · L&D: A learning path with milestones.

```html
<div data-scrolly="road"><script type="application/json">[{"title":"Monday","text":"A teacher opens a template."},{"title":"Tuesday","text":"She adds a quiz and a map.","value":"+12 slides"},{"title":"Wednesday","text":"Students play it in class.","value":"28 players"},{"title":"Friday","text":"It is shared with the school.","value":"340 views"}]</script></div>
```

## Timelines

### `progress-line` · Horizontal progress line
A line fills across steps and lights each one as you pass.

Use for: Four to six phases.

```html
<div data-scrolly="progress-line"><span>Idea</span><span>Draft</span><span>Review</span><span>Publish</span></div>
```

### `year-counter` · Sticky year counter
A big year stays on screen and rolls as each dated paragraph arrives.

- `children`: [data-year]

Use for: History and origin stories.

```html
<div data-scrolly="year-counter"><div data-year="2015"><p>Founded in Córdoba.</p></div><div data-year="2018"><p>Teachers adopt it.</p></div><div data-year="2020"><p>Remote classes.</p></div><div data-year="2026"><p>Everyone builds.</p></div></div>
```

### `clock` · Clock dial · pins
A pinned clock whose hands run through a day; notes appear at given hours.

- `data-from`: start hour
- `data-to`: end hour
- `data-label`: title
- `JSON`: {hour: note}

Use for: A day in the life.

```html
<div data-scrolly="clock" data-from="8" data-to="23" data-label="A day of clicks"><script type="application/json">{"8":"Morning classes start","11":"Peak of the day","17":"Afternoon homework","21":"Evening study"}</script></div>
```

## Layout

### `opposite-columns` · Opposite columns
Two columns scroll in opposite directions.

Use for: Image-rich galleries.

```html
<div data-scrolly="opposite-columns"><div style="display:grid;gap:12px"><img src="assets/g0.jpg" alt="" style="width:100%;border-radius:16px"><img src="assets/g0.jpg" alt="" style="width:100%;border-radius:16px"><img src="assets/g0.jpg" alt="" style="width:100%;border-radius:16px"><img src="assets/g0.jpg" alt="" style="width:100%;border-radius:16px"></div><div style="display:grid;gap:12px"><img src="assets/g2.jpg" alt="" style="width:100%;border-radius:16px"><img src="assets/g2.jpg" alt="" style="width:100%;border-radius:16px"><img src="assets/g2.jpg" alt="" style="width:100%;border-radius:16px"><img src="assets/g2.jpg" alt="" style="width:100%;border-radius:16px"></div></div>
```

### `parallax-gallery` · Parallax gallery
Columns of images moving at different speeds.

- `children`: [data-speed]

Use for: Mood boards and portfolios.

```html
<div data-scrolly="parallax-gallery"><div data-speed="0.8"><img src="assets/g0.jpg" alt=""><img src="assets/g1.jpg" alt=""></div><div data-speed="1.25"><img src="assets/g2.jpg" alt=""><img src="assets/g3.jpg" alt=""></div><div data-speed="0.95"><img src="assets/g1.jpg" alt=""><img src="assets/g0.jpg" alt=""></div></div>
```

## Zoom & pan

### `ken-burns` · Ken Burns sequence · pins
Pinned images crossfade with a slow pan and zoom.

Use for: Documentary-style photo stories.

```html
<div data-scrolly="ken-burns"><img src="assets/g0.jpg" alt=""><img src="assets/g1.jpg" alt=""><img src="assets/g2.jpg" alt=""></div>
```

## From the Story

### `dot-field` · Reactive dot field
A canvas of dots that ripples with scroll and swells around the pointer.

- `data-gap`: px between dots

Use for: Backgrounds for a hero or a chapter.

```html
<div data-scrolly="dot-field" style="background:var(--sc-surface);border-radius:var(--sc-radius)"></div>
```

### `waffle-steps` · Waffle + shape morph · pins
A pinned 10×10 waffle that splits into groups step by step while an icon morphs (MorphSVG).

- `JSON`: [{title, split:[…], labels?, icon (svg path), button}]

Use for: Who uses / who pays style breakdowns.

```html
<div data-scrolly="waffle-steps"><script type="application/json">[{"title":"Each dot is 1% of users","button":"Users","split":[0],"icon":"M2 9h4l9-6v18l-9-6H2z"},{"title":"Most users are in education","button":"Who","split":[80,20],"labels":["Education ~80%","Companies ~20%"],"icon":"M12 3L1 9l11 6 9-4.9V17h2V9L12 3z"},{"title":"Revenue splits about evenly","button":"Who pays","split":[50,50],"labels":["Education ~50%","Companies ~50%"],"icon":"M12 2a10 10 0 1 0 0 20z"}]</script></div>
```

## Hover & click

### `image-trail` · Image trail
Images follow the pointer and fade.

- `data-images`: comma-separated urls

Use for: Playful hero areas on desktop.

```html
<div data-scrolly="image-trail" data-images="assets/g0.jpg,assets/g1.jpg,assets/g2.jpg,assets/g3.jpg" class="sc-ld"><p class="sc-h2">Move across me</p></div>
```

### `rolling-links` · Rolling links
Link text rolls up to a copy on hover.

Use for: Navigation and footers.

```html
<p data-scrolly="rolling-links" style="font:800 32px var(--sc-font-display);display:flex;gap:24px;flex-wrap:wrap"><a href="#">Work</a><a href="#">About</a><a href="#">Contact</a></p>
```

### `click-burst` · Click burst
Confetti-like shapes burst from each click.

Use for: Celebrations and end screens. · L&D: Reward a correct answer.

```html
<div data-scrolly="click-burst" class="sc-ld" style="min-height:260px;display:grid;place-items:center"><p class="sc-h2">Click anywhere</p></div>
```

### `stickers` · Throwable stickers
Drag and fling stickers around a board (Draggable + Inertia).

Use for: Playful sections, mood boards.

```html
<div data-scrolly="stickers" class="sc-ld" style="min-height:380px"><b style="background:var(--sc-accent);color:var(--sc-on-accent);font:800 clamp(18px,2.6vw,28px) var(--sc-font-display);padding:14px 22px;border-radius:18px;transform:rotate(-8deg)">Quiz ✦</b><b style="background:var(--sc-accent-2);color:var(--sc-on-accent-2);font:800 clamp(18px,2.6vw,28px) var(--sc-font-display);padding:14px 22px;border-radius:999px;transform:rotate(0deg)">Game!</b><b style="background:var(--sc-accent-3);color:#fff;font:800 clamp(18px,2.6vw,28px) var(--sc-font-display);padding:14px 22px;border-radius:18px;transform:rotate(8deg)">Lesson</b><b style="background:var(--sc-accent-4);color:#121212;font:800 clamp(18px,2.6vw,28px) var(--sc-font-display);padding:14px 22px;border-radius:999px;transform:rotate(-8deg)">Map ↗</b><b style="background:var(--sc-accent);color:var(--sc-on-accent);font:800 clamp(18px,2.6vw,28px) var(--sc-font-display);padding:14px 22px;border-radius:18px;transform:rotate(0deg)">Escape</b><b style="background:var(--sc-accent-2);color:var(--sc-on-accent-2);font:800 clamp(18px,2.6vw,28px) var(--sc-font-display);padding:14px 22px;border-radius:999px;transform:rotate(8deg)">10/10</b></div>
```

### `hover-preview` · Hover list with preview
A floating preview image follows the pointer over a list.

- `li`: data-img

Use for: Project lists, chapters.

```html
<ul data-scrolly="hover-preview"><li data-img="assets/g0.jpg">Quiz night</li><li data-img="assets/g1.jpg">Escape room</li><li data-img="assets/g2.jpg">Product tour</li></ul>
```

### `flip-layout` · Grid ↔ list
Toggle buttons animate the items between grid and list layouts (Flip).

- `container`: [data-flip-items]

Use for: Catalogues.

```html
<div data-scrolly="flip-layout"><div data-flip-items><div class="sc-ld" style="padding:8px"><img src="assets/g0.jpg" alt=""><b>Card 1</b></div><div class="sc-ld" style="padding:8px"><img src="assets/g1.jpg" alt=""><b>Card 2</b></div><div class="sc-ld" style="padding:8px"><img src="assets/g2.jpg" alt=""><b>Card 3</b></div><div class="sc-ld" style="padding:8px"><img src="assets/g3.jpg" alt=""><b>Card 4</b></div><div class="sc-ld" style="padding:8px"><img src="assets/g1.jpg" alt=""><b>Card 5</b></div><div class="sc-ld" style="padding:8px"><img src="assets/g2.jpg" alt=""><b>Card 6</b></div></div></div>
```

### `cursor-zone` · Context cursor
The page cursor changes label inside the zone (needs Scrolly.init({cursor:true})).

- `data-cursor`: label, e.g. play / drag / open

Use for: Videos and draggable areas.

```html
<div data-scrolly="cursor-zone" data-cursor="play" class="sc-ld" style="min-height:240px;display:grid;place-items:center"><p class="sc-h2">Hover me</p></div>
```

## 3D & WebGL

### `world3d` · Fly-through world · pins
A pinned three.js world; the camera flies past floating words as you scroll.

- `data-words`: comma-separated words

Use for: Openers that say "there is a lot to explore".

```html
<div data-scrolly="world3d" data-words="Quiz,Escape room,Presentation,Infographic,Game,Course"></div>
```

### `object3d` · Object that turns · pins
A 3D object rotates and changes material with scroll.

Use for: Product or concept reveal.

```html
<div data-scrolly="object3d"></div>
```

### `distort` · Distortion on hover
A WebGL shader ripples an image under the pointer.

- `data-src`: image
- `data-alt`: description

Use for: Hero images on desktop.

```html
<div data-scrolly="distort" data-src="assets/g3.jpg" data-alt="The engine, rippling under the pointer"></div>
```

### `bars3d` · 3D chart with a camera move · pins
3D bars grow while the camera orbits; a data table is kept for screen readers.

- `JSON`: {labels, values, title, source}

Use for: One dramatic chart per story.

```html
<div data-scrolly="bars3d"><script type="application/json">{"title":"Created per week","source":"sample","labels":["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"],"values":[239000,250000,274000,295000,326000,325000,320000,329000,361000,258000,343000,344000]}</script></div>
```

### `layers3d` · Layers in 3D · pins
Child images separate into 3D layers with labels from their alt text.

- `children`: img with alt

Use for: Showing how something is built.

```html
<div data-scrolly="layers3d"><img src="assets/g2.jpg" alt="Background"><img src="assets/poster.jpg" alt="Slide"><img src="assets/poster-exploded.jpg" alt="Layers"></div>
```

## Animation formats

### `lottie` · Lottie scrubbed by scroll · pins
A Lottie animation scrubbed by scroll. Without data-src it plays a built-in demo.

- `data-src`: animation .json
- `data-alt`: description

Use for: Explainers drawn by a motion designer.

```html
<div data-scrolly="lottie" data-alt="A cursor clicks, a window opens, a check draws"></div>
```

### `theatre` · Theatre.js sequence · pins
Children are animated by a Theatre.js sequence driven by scroll (GSAP fallback).

- `JSON`: keyframes per actor

Use for: Choreographed scenes.

```html
<div data-scrolly="theatre"><div class="sc-btn" style="min-height:120px;padding:0 40px;font-size:24px">genially</div><div class="sc-btn" style="width:90px;height:90px;border-radius:50%;background:var(--sc-accent-2);color:#121212">click</div></div>
```

## Physics

### `physics` · Falling formats
Labels fall and pile up with matter.js when the section arrives; drag them around.

- `data-labels`: comma-separated
- `data-count`: how many

Use for: Playful "so many options" moments.

```html
<div data-scrolly="physics" data-labels="Quiz,Game,Escape room,Slides,Infographic,Course"></div>
```

## Full-page

### `deck` · Swipe deck · pins
Full-screen slides that change one per gesture (Observer). Releases the page at both ends.

Use for: A short presentation inside the story.

```html
<div data-scrolly="deck"><div style="background:var(--sc-accent);color:var(--sc-on-accent)"><p class="sc-display">One gesture</p></div><div style="background:var(--sc-accent-2);color:var(--sc-on-accent-2)"><p class="sc-display">One slide</p></div><div style="background:var(--sc-accent-3);color:#fff"><p class="sc-display">Then let go</p></div></div>
```

## From the Story

### `film-labels` · Labels that track a film · pins
A scrubbed film with labels that follow tracked anchor points.

- `data-src`: video
- `data-anchors`: anchors.json
- `data-labels`: comma-separated

Use for: Explaining the parts of something filmed.

```html
<div data-scrolly="film-labels" data-src="assets/genially-layers.webm" data-fallback="assets/genially-layers.mp4" data-duration="6" data-poster="assets/poster.jpg" data-anchors="assets/anchors.json" data-labels="Picture,Title,Hotspots,Window,Quiz,Logic"></div>
```

## CSS only

### `css-scroll` · CSS scroll-driven effects
Runs native CSS scroll-driven animations (.sc-css-rise / clip / hue / parallax / progress) and falls back gracefully.

Use for: Light pages with zero JavaScript motion.

```html
<div data-scrolly="css-scroll" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px"><div class="sc-css-box sc-ld" style="height:260px"><div class="sc-css-progress" style="position:sticky;top:0;height:4px;background:var(--sc-accent-2)"></div><div class="sc-css-rise sc-ld" style="height:60px;margin:8px 0;background:var(--sc-accent)"></div><div class="sc-css-rise sc-ld" style="height:60px;margin:8px 0;background:var(--sc-accent)"></div><div class="sc-css-rise sc-ld" style="height:60px;margin:8px 0;background:var(--sc-accent)"></div><div class="sc-css-rise sc-ld" style="height:60px;margin:8px 0;background:var(--sc-accent)"></div><div class="sc-css-rise sc-ld" style="height:60px;margin:8px 0;background:var(--sc-accent)"></div><div class="sc-css-rise sc-ld" style="height:60px;margin:8px 0;background:var(--sc-accent)"></div><div class="sc-css-rise sc-ld" style="height:60px;margin:8px 0;background:var(--sc-accent)"></div><div class="sc-css-rise sc-ld" style="height:60px;margin:8px 0;background:var(--sc-accent)"></div></div><div class="sc-css-box sc-ld" style="height:260px"><div class="sc-css-clip" style="height:60px;margin:8px 0;background:var(--sc-accent-3);border-radius:12px"></div><div class="sc-css-clip" style="height:60px;margin:8px 0;background:var(--sc-accent-3);border-radius:12px"></div><div class="sc-css-clip" style="height:60px;margin:8px 0;background:var(--sc-accent-3);border-radius:12px"></div><div class="sc-css-clip" style="height:60px;margin:8px 0;background:var(--sc-accent-3);border-radius:12px"></div><div class="sc-css-clip" style="height:60px;margin:8px 0;background:var(--sc-accent-3);border-radius:12px"></div><div class="sc-css-clip" style="height:60px;margin:8px 0;background:var(--sc-accent-3);border-radius:12px"></div><div class="sc-css-clip" style="height:60px;margin:8px 0;background:var(--sc-accent-3);border-radius:12px"></div><div class="sc-css-clip" style="height:60px;margin:8px 0;background:var(--sc-accent-3);border-radius:12px"></div></div><div class="sc-css-box sc-ld" style="height:260px"><div class="sc-css-hue" style="height:60px;margin:8px 0;background:var(--sc-accent-2);border-radius:12px"></div><div class="sc-css-hue" style="height:60px;margin:8px 0;background:var(--sc-accent-2);border-radius:12px"></div><div class="sc-css-hue" style="height:60px;margin:8px 0;background:var(--sc-accent-2);border-radius:12px"></div><div class="sc-css-hue" style="height:60px;margin:8px 0;background:var(--sc-accent-2);border-radius:12px"></div><div class="sc-css-hue" style="height:60px;margin:8px 0;background:var(--sc-accent-2);border-radius:12px"></div><div class="sc-css-hue" style="height:60px;margin:8px 0;background:var(--sc-accent-2);border-radius:12px"></div><div class="sc-css-hue" style="height:60px;margin:8px 0;background:var(--sc-accent-2);border-radius:12px"></div><div class="sc-css-hue" style="height:60px;margin:8px 0;background:var(--sc-accent-2);border-radius:12px"></div></div></div>
```

## View Transitions

### `vt-cards` · Card to detail
A card expands into a detail view with the View Transitions API (crossfade fallback).

- `article`: data-title, data-text

Use for: Galleries that open into detail.

```html
<div data-scrolly="vt-cards"><article data-title="Quiz night" data-text="A quiz with a timer and a leaderboard."><img src="assets/g0.jpg" alt="Quiz night"></article><article data-title="Escape room" data-text="Locks, clues and a countdown."><img src="assets/g1.jpg" alt="Escape room"></article><article data-title="Product tour" data-text="Hotspots on every feature."><img src="assets/g2.jpg" alt="Product tour"></article></div>
```

## Media

### `video-cards` · Preview clips in context
Video cards play when hovered or seen and pause otherwise.

Use for: "See it in use" sections.

```html
<div data-scrolly="video-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:12px"><a href="#" class="sc-ld"><video src="assets/genially-layers.mp4" poster="assets/poster.jpg" style="width:100%;border-radius:12px"></video><b>See it in context →</b></a></div>
```

## Navigation

### `header` · Hide-on-scroll header
The header hides when scrolling down and returns when scrolling up.

Use for: Long pages with navigation.

```html
<header data-scrolly="header" style="background:var(--sc-bg);padding:12px var(--sc-gutter)"><b>Your title</b></header>
```

### `toc` · Chapter pills + progress
Pills built from [data-chapter] sections, with the current one highlighted and a progress bar.

Use for: Long stories and courses. · L&D: Learners always know where they are.

```html
<nav data-scrolly="toc" aria-label="Chapters"></nav>
```

### `ring` · Progress ring
A ring that fills with reading progress and scrolls to top on click.

Use for: Any long page.

```html
<button data-scrolly="ring"></button>
```

### `curtain-footer` · Curtain footer
The footer is revealed from under the page like a curtain.

Use for: Endings and calls to action.

```html
<footer data-scrolly="curtain-footer" style="background:var(--sc-accent-3);display:grid;align-content:end;padding:60px var(--sc-gutter)"><p class="sc-display">The end.</p></footer>
```

## All 111 Scroll Lab effects

Every effect of the Scroll Lab has a ready snippet: `npx genially-scrolly add <effect-name>` (file in `registry/effects/<name>.html`). The live gallery is `examples/gallery`.

| Category | Effect | add … | Block |
|---|---|---|---|
| Reveal | Batch fade-up | `batch-fade-up` | reveal |
| Reveal | Clip-path wipe | `clip-wipe` | reveal |
| Reveal | Circle reveal | `circle-reveal` | reveal |
| Reveal | Curtain split | `curtain-split` | curtain |
| Reveal | Blur to focus | `blur-to-focus` | reveal |
| Reveal | Assemble from chaos | `assemble` | assemble |
| Text | Fill on scroll | `fill-on-scroll` | fill-text |
| Text | Scattered letters | `scattered-letters` | scatter-letters |
| Text | Text on a path | `text-on-path` | text-path |
| Text | Scramble in | `scramble-in` | scramble |
| Text | Odometer | `odometer` | odometer |
| Text | Marker highlight | `marker-highlight` | marker |
| Text | Giant sliding lines | `giant-sliding-lines` | giant-lines |
| Text | Weight wave | `weight-wave` | weight-wave |
| Scale & colour | Grow to full screen | `grow-full-screen` | grow |
| Scale & colour | Shrink away | `shrink-away` | shrink |
| Scale & colour | Colour journey | `colour-journey` | colour-journey |
| Scale & colour | Fisheye list | `fisheye-list` | fisheye |
| Scale & colour | Hue shift | `hue-shift` | hue-shift |
| Scale & colour | Flip-down cards | `flip-down-cards` | flip-cards |
| Data | Bars that grow + line that draws | `bars-and-line` | chart |
| Data | Donut + gauge | `donut-and-gauge` | chart |
| Data | Pictogram | `pictogram` | pictogram |
| Data | Rearranging scatter | `rearranging-scatter` | scatter |
| Data | Bar chart race | `bar-chart-race` | chart |
| Data viz gallery | KPI tiles that count up | `kpi-tiles` | kpi |
| Data viz gallery | Treemap | `treemap` | chart |
| Data viz gallery | Bubble pack | `bubble-pack` | chart |
| Data viz gallery | Sunburst | `sunburst` | chart |
| Data viz gallery | Streamgraph | `streamgraph` | chart |
| Data viz gallery | Slope chart | `slope-chart` | chart |
| Data viz gallery | Dumbbell | `dumbbell` | chart |
| Data viz gallery | Lollipop | `lollipop` | chart |
| Data viz gallery | Waterfall | `waterfall` | chart |
| Data viz gallery | Radial bars | `radial-bars` | chart |
| Data viz gallery | Small multiples | `small-multiples` | chart |
| Data viz gallery | Annotated line, pinned | `annotated-line` | chart |
| Data viz gallery | Network graph | `network` | chart |
| Data viz gallery | Heatmap | `heatmap` | chart |
| Data viz gallery | Beeswarm | `beeswarm` | chart |
| Data viz gallery | Ridgeline | `ridgeline` | chart |
| Data viz gallery | Radar that morphs, pinned | `radar-morph` | chart |
| Data viz gallery | Gantt with a moving today line | `gantt` | chart |
| Infographic | Poster camera timeline | `road-timeline` | road |
| Timelines | Horizontal progress line | `progress-line` | progress-line |
| Timelines | Sticky year counter | `year-counter` | year-counter |
| Timelines | Clock dial | `clock-dial` | clock |
| Layout | Snapping horizontal panels | `snapping-panels` | horizontal |
| Layout | Opposite columns | `opposite-columns` | opposite-columns |
| Layout | Stacking panels | `stacking-panels` | stack |
| Layout | Parallax gallery | `parallax-gallery` | parallax-gallery |
| Zoom & pan | Deep zoom | `deep-zoom` | deep-zoom |
| Zoom & pan | Ken Burns sequence | `ken-burns` | ken-burns |
| Media | Image-sequence scrub | `image-sequence` | sequence |
| Media | Plays when seen | `plays-when-seen` | autoplay-video |
| Hover & click | Spotlight reveal | `spotlight` | spotlight |
| Hover & click | Magnetic buttons | `magnetic-buttons` | magnetic |
| Hover & click | 3D tilt + glare | `tilt-glare` | tilt |
| Hover & click | Image trail | `image-trail` | image-trail |
| Hover & click | Rolling links | `rolling-links` | rolling-links |
| Hover & click | Click burst | `click-burst` | click-burst |
| Hover & click | Throwable stickers | `throwable-stickers` | stickers |
| Hover & click | Hover list with preview | `hover-list-preview` | hover-preview |
| Hover & click | Grid ↔ list | `grid-list-flip` | flip-layout |
| Hover & click | Context cursor | `context-cursor` | cursor-zone |
| 3D & WebGL | Fly-through world | `fly-through-world` | world3d |
| 3D & WebGL | Object that turns with scroll | `object-turns` | object3d |
| 3D & WebGL | Distortion on hover | `distortion-hover` | distort |
| 3D & WebGL | Particles that re-form | `particles` | particles |
| 3D & WebGL | 3D chart with a camera move | `bars-3d` | bars3d |
| 3D & WebGL | A slide comes apart in 3D | `layers-3d` | layers3d |
| Animation formats | Lottie scrubbed by scroll | `lottie-scrub` | lottie |
| Animation formats | Theatre.js sequence | `theatre-sequence` | theatre |
| Physics | Falling formats | `falling-formats` | physics |
| Full-page | Swipe deck | `swipe-deck` | deck |
| Full-page | Lag + speed columns | `lag-and-speed` | parallax |
| D3 & maps | One dataset, three shapes | `one-dataset-three-shapes` | chart |
| D3 & maps | Globe that turns to the story | `globe` | chart |
| CSS only | Six effects, zero scripts | `css-only` | css-scroll |
| View Transitions | Card to detail | `view-transition-cards` | vt-cards |
| Learning & development | Progress tracker with checkpoints | `progress-tracker` | progress |
| Learning & development | Knowledge check | `knowledge-check` | quiz |
| Learning & development | Branching scenario | `branching-scenario` | scenario |
| Learning & development | Flashcards with spaced repetition | `flashcards` | flashcards |
| Learning & development | Sort it out | `sort-it-out` | sort |
| Learning & development | Video that asks a question | `video-question` | video-quiz |
| Learning & development | Glossary on demand | `glossary` | glossary |
| Learning & development | Certificate | `certificate` | certificate |
| From the Story | Word-by-word reveal | `word-reveal` | words |
| From the Story | Velocity marquee | `velocity-marquee` | marquee |
| From the Story | Sticky card stack | `sticky-card-stack` | stack |
| From the Story | Colour flow | `colour-flow` | color-flow |
| From the Story | Reactive dot field | `dot-field` | dot-field |
| From the Story | Compare, hotspots, lens | `compare-hotspots` | compare |
| From the Story | Zoom-through | `zoom-through` | zoom-through |
| From the Story | Dot portal | `dot-portal` | portal |
| From the Story | Film scrubbed by scroll | `film-scrub` | video-scrub |
| From the Story | Labels that track a film | `film-labels` | film-labels |
| From the Story | Kinetic type | `kinetic-type` | kinetic |
| From the Story | Prezi-style camera | `prezi-camera` | camera |
| From the Story | Map flight | `map-flight` | chart |
| From the Story | Waffle + shape morph | `waffle-morph` | waffle-steps |
| From the Story | Serpentine timeline | `serpentine-timeline` | timeline |
| From the Story | Sideways chapter with skew | `sideways-chapter` | horizontal |
| From the Story | Scrubbed counter | `scrubbed-counter` | counter |
| From the Story | Chapter chip that decodes | `chapter-chip` | init:chapters |
| From the Story | Preview clips in context | `preview-cards` | video-cards |
| Navigation | Hide-on-scroll header | `hide-on-scroll-header` | header |
| Navigation | Category pills + progress bar | `chapter-pills` | toc |
| Navigation | Progress ring | `progress-ring` | ring |
| Navigation | Curtain footer | `curtain-footer` | curtain-footer |

## Custom blocks

```js
Scrolly.block('my-block', (el, ctx) => {
  // ctx.M: motion allowed · ctx.ST: ScrollTrigger · ctx.near(el, fn) lazy init · ctx.onWidth(fn) rebuild on width change
  // ctx.emit(el, 'name', detail) · ctx.goTo(y, seconds) · Scrolly.util.json(el) reads the JSON child
  if(!ctx.M) return; // calm mode: leave the final state visible
  gsap.from(el, {y: 40, autoAlpha: 0, scrollTrigger: {trigger: el, start: 'top 85%'}});
});
```
Register custom blocks before `Scrolly.init()`. Add them to `registry/blocks.src.mjs` to make them part of the catalogue.
