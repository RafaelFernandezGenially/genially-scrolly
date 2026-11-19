// Blocks added in 0.2.0 to cover every Scroll Lab effect. The snippet of each block is taken from the
// first effect in effects.src.mjs that uses it, so the two catalogues never drift apart.
// pin: true = holds the page while it plays.
const b = (name, category, title, description, params = {}, extra = {}) => ({name, category, title, description, params, ...extra});
export default [
  // text
  b('scatter-letters','Text','Scattered letters','Letters start scattered and rotated and fall into place as the line crosses the screen.', {}, {use:'Short punchy titles (under 30 characters).'}),
  b('text-path','Text','Text on a path','A sentence travels along a curved SVG path, driven by scroll.', {}, {use:'A single sentence that should feel like a journey.'}),
  b('odometer','Text','Odometer','Each digit rolls like a mechanical counter to its value.', {'data-value':'the number to show (commas allowed)'}, {use:'One headline figure.'}),
  b('giant-lines','Text','Giant sliding lines','Rows of huge type slide in opposite directions with scroll.', {}, {use:'Section breaks and brand words.'}),
  b('weight-wave','Text','Weight wave','A wave of font weight runs through the letters as you scroll (needs a variable font).', {}, {use:'One-word statements.'}),
  // reveal & scale
  b('assemble','Reveal','Assemble from chaos','Tiles fly in from random places and assemble a shape drawn as rows of 0/1.', {'data-shape':'rows of 0/1 separated by |'}, {use:'A logo or letter built from pieces.'}),
  b('shrink','Scale & colour','Shrink away','A full-bleed image shrinks into a rounded card as you leave it.', {}, {use:'Transition out of a hero image.'}),
  b('colour-journey','Scale & colour','Colour journey','A pinned panel steps through a palette, background and text together.', {'data-colors':'bg/fg/label, comma separated'}, {pin:true, use:'Introducing a brand palette or moods.'}),
  b('fisheye','Scale & colour','Fisheye list','List items scale up as they reach the centre of the screen.', {}, {use:'A long list of options or formats.'}),
  b('hue-shift','Scale & colour','Hue shift','An image or element cycles its hue with scroll.', {'data-degrees':'how far to rotate the hue (default 360)'}, {use:'Playful colour variety on one image.'}),
  b('flip-cards','Scale & colour','Flip-down cards','Cards flip down from the top edge in sequence.', {}, {use:'Three to six short items.'}),
  // data
  b('gauge','Data','Gauge','A half-dial fills to a value.', {'data-value':'0–100', 'data-suffix':'e.g. %', 'data-label':'caption'}, {use:'One percentage that matters.', ld:'Show the pass mark or completion rate.', snippet:'<div data-scrolly="gauge" data-value="73" data-suffix="%" data-label="Completion"></div>'}),
  b('pictogram','Data','Pictogram','100 icons; the first N light up.', {'data-value':'0–100', 'data-icon':'a character or emoji', 'data-label':'caption'}, {use:'"8 in 10" style statements.'}),
  b('scatter','Data','Rearranging scatter','A cloud of dots that regroups and ranks itself. Inside a steps block it follows the step (a, b, c).', {'data-n':'number of dots', 'data-groups':'comma-separated group names'}, {use:'Showing that a population splits.'}),
  // timelines & infographic
  b('road','Infographic','Poster camera timeline','A pinned poster with a road; the camera travels from stop to stop and snaps to each.', {'JSON':'[{title, text, value?}]'}, {pin:true, use:'A journey, a process, a week in the life.', ld:'A learning path with milestones.'}),
  b('progress-line','Timelines','Horizontal progress line','A line fills across steps and lights each one as you pass.', {}, {use:'Four to six phases.'}),
  b('year-counter','Timelines','Sticky year counter','A big year stays on screen and rolls as each dated paragraph arrives.', {'children':'[data-year]'}, {use:'History and origin stories.'}),
  b('clock','Timelines','Clock dial','A pinned clock whose hands run through a day; notes appear at given hours.', {'data-from':'start hour', 'data-to':'end hour', 'data-label':'title', 'JSON':'{hour: note}'}, {pin:true, use:'A day in the life.'}),
  // layout
  b('opposite-columns','Layout','Opposite columns','Two columns scroll in opposite directions.', {}, {use:'Image-rich galleries.'}),
  b('parallax-gallery','Layout','Parallax gallery','Columns of images moving at different speeds.', {'children':'[data-speed]'}, {use:'Mood boards and portfolios.'}),
  b('ken-burns','Zoom & pan','Ken Burns sequence','Pinned images crossfade with a slow pan and zoom.', {}, {pin:true, use:'Documentary-style photo stories.'}),
  b('dot-field','From the Story','Reactive dot field','A canvas of dots that ripples with scroll and swells around the pointer.', {'data-gap':'px between dots'}, {use:'Backgrounds for a hero or a chapter.'}),
  b('waffle-steps','From the Story','Waffle + shape morph','A pinned 10×10 waffle that splits into groups step by step while an icon morphs (MorphSVG).', {'JSON':'[{title, split:[…], labels?, icon (svg path), button}]'}, {pin:true, use:'Who uses / who pays style breakdowns.'}),
  // hover & click
  b('image-trail','Hover & click','Image trail','Images follow the pointer and fade.', {'data-images':'comma-separated urls'}, {use:'Playful hero areas on desktop.'}),
  b('rolling-links','Hover & click','Rolling links','Link text rolls up to a copy on hover.', {}, {use:'Navigation and footers.'}),
  b('click-burst','Hover & click','Click burst','Confetti-like shapes burst from each click.', {}, {use:'Celebrations and end screens.', ld:'Reward a correct answer.'}),
  b('stickers','Hover & click','Throwable stickers','Drag and fling stickers around a board (Draggable + Inertia).', {}, {use:'Playful sections, mood boards.'}),
  b('hover-preview','Hover & click','Hover list with preview','A floating preview image follows the pointer over a list.', {'li':'data-img'}, {use:'Project lists, chapters.'}),
  b('flip-layout','Hover & click','Grid ↔ list','Toggle buttons animate the items between grid and list layouts (Flip).', {'container':'[data-flip-items]'}, {use:'Catalogues.'}),
  b('cursor-zone','Hover & click','Context cursor','The page cursor changes label inside the zone (needs Scrolly.init({cursor:true})).', {'data-cursor':'label, e.g. play / drag / open'}, {use:'Videos and draggable areas.'}),
  // 3D & WebGL (three.js is loaded only when one of these is on the page)
  b('world3d','3D & WebGL','Fly-through world','A pinned three.js world; the camera flies past floating words as you scroll.', {'data-words':'comma-separated words'}, {pin:true, use:'Openers that say "there is a lot to explore".'}),
  b('object3d','3D & WebGL','Object that turns','A 3D object rotates and changes material with scroll.', {}, {pin:true, use:'Product or concept reveal.'}),
  b('distort','3D & WebGL','Distortion on hover','A WebGL shader ripples an image under the pointer.', {'data-src':'image', 'data-alt':'description'}, {use:'Hero images on desktop.'}),
  b('bars3d','3D & WebGL','3D chart with a camera move','3D bars grow while the camera orbits; a data table is kept for screen readers.', {'JSON':'{labels, values, title, source}'}, {pin:true, use:'One dramatic chart per story.'}),
  b('layers3d','3D & WebGL','Layers in 3D','Child images separate into 3D layers with labels from their alt text.', {'children':'img with alt'}, {pin:true, use:'Showing how something is built.'}),
  // formats, physics, full page
  b('lottie','Animation formats','Lottie scrubbed by scroll','A Lottie animation scrubbed by scroll. Without data-src it plays a built-in demo.', {'data-src':'animation .json', 'data-alt':'description'}, {pin:true, use:'Explainers drawn by a motion designer.'}),
  b('theatre','Animation formats','Theatre.js sequence','Children are animated by a Theatre.js sequence driven by scroll (GSAP fallback).', {'JSON':'keyframes per actor'}, {pin:true, use:'Choreographed scenes.'}),
  b('physics','Physics','Falling formats','Labels fall and pile up with matter.js when the section arrives; drag them around.', {'data-labels':'comma-separated', 'data-count':'how many'}, {use:'Playful "so many options" moments.'}),
  b('deck','Full-page','Swipe deck','Full-screen slides that change one per gesture (Observer). Releases the page at both ends.', {}, {pin:true, use:'A short presentation inside the story.'}),
  b('film-labels','From the Story','Labels that track a film','A scrubbed film with labels that follow tracked anchor points.', {'data-src':'video', 'data-anchors':'anchors.json', 'data-labels':'comma-separated'}, {pin:true, use:'Explaining the parts of something filmed.'}),
  // CSS only, view transitions, media
  b('css-scroll','CSS only','CSS scroll-driven effects','Runs native CSS scroll-driven animations (.sc-css-rise / clip / hue / parallax / progress) and falls back gracefully.', {}, {use:'Light pages with zero JavaScript motion.'}),
  b('vt-cards','View Transitions','Card to detail','A card expands into a detail view with the View Transitions API (crossfade fallback).', {'article':'data-title, data-text'}, {use:'Galleries that open into detail.'}),
  b('video-cards','Media','Preview clips in context','Video cards play when hovered or seen and pause otherwise.', {}, {use:'"See it in use" sections.'}),
  // navigation
  b('header','Navigation','Hide-on-scroll header','The header hides when scrolling down and returns when scrolling up.', {}, {use:'Long pages with navigation.'}),
  b('toc','Navigation','Chapter pills + progress','Pills built from [data-chapter] sections, with the current one highlighted and a progress bar.', {}, {use:'Long stories and courses.', ld:'Learners always know where they are.'}),
  b('ring','Navigation','Progress ring','A ring that fills with reading progress and scrolls to top on click.', {}, {use:'Any long page.'}),
  b('curtain-footer','Navigation','Curtain footer','The footer is revealed from under the page like a curtain.', {}, {use:'Endings and calls to action.'})
];
