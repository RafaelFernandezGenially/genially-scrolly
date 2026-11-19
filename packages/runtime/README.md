# @genially/scrolly

The Genially Scrolly runtime: scrollytelling blocks as HTML attributes, on GSAP ScrollTrigger.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@genially/scrolly@0.2.0/dist/scrolly.min.css">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@genially/scrolly@0.2.0/dist/scrolly.min.js"></script>

<p class="sc-h2" data-scrolly="words">Most content is made to be looked at.</p>
<div data-scrolly="chart"><script type="application/json">{"type":"globe","source":"sample","stops":[["Córdoba",-4.78,37.89],["New York",-74,40.71]]}</script></div>
<script>Scrolly.init();</script>
```

86 blocks and 111 ready effects (every effect of the Scroll Lab). GSAP plugins, three.js, D3, Lottie, Theatre.js and Matter.js load on demand, only when a block on the page needs them. Reduced motion (`prefers-reduced-motion` or `?calm`) shows every block's final state.

Free for non-commercial use with the "Made with Genially Scrolly" mark. Commercial use, removing the mark, Genially analytics and APIs need a licence (see LICENSE.md). Full docs, CLI and agent skill: the genially-scrolly repository.
