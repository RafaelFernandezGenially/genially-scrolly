// Generates examples/gallery/index.html: all 111 Scroll Lab effects, live, built only from the registry snippets.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path'; import {fileURLToPath} from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const effects = (await import(join(root, 'registry/effects.src.mjs'))).default;
const reg = JSON.parse(readFileSync(join(root, 'registry/registry.json'), 'utf8'));
const fonts = JSON.parse(readFileSync(join(root, 'styles/fonts.json'), 'utf8'));
const pins = new Set(reg.blocks.filter(b => b.pin).map(b => b.name));
// blocks that want the full width of the page
const BLEED = new Set(['horizontal','stack','kinetic','marquee','color-flow','zoom-through','portal','grow','shrink','curtain','deep-zoom','camera','video-scrub','sequence','colour-journey','road','ken-burns','world3d','object3d','bars3d','layers3d','lottie','theatre','deck','film-labels','waffle-steps','clock','giant-lines','opposite-columns','parallax-gallery','steps','dot-field','timeline','counter']);
// page-level effects are used by the gallery itself instead of being repeated inline
const PAGE = {'fx-108':'The header at the top of this page hides when you scroll down and comes back when you scroll up.', 'fx-109':'The chapter pills in the header are this block: they follow the chapter you are reading.', 'fx-110':'The ring at the bottom right fills with reading progress; click it to go back to the top.', 'fx-111':'Scroll to the very end: the footer is revealed from under the page.', 'fx-st-chip':'The chip that decodes the chapter name as you change chapter is Scrolly.init({chapters:true}).'};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fix = s => s.replace(/assets\//g, '../kitchen-sink/assets/');
const cats = [...new Set(effects.map(e => e.category))];
const card = (e, i) => {
  const head = `<div class="gx-head sc-wrap"><span class="gx-n">${String(i + 1).padStart(3, '0')}</span><div><h3>${esc(e.title)}</h3><p><code>npx genially-scrolly add ${e.name}</code> · block <code>${e.block}</code>${pins.has(e.block) ? ' · <b>pins</b>' : ''}${e.note ? ` · ${esc(e.note)}` : ''}</p></div><a href="${reg.lab}#${e.id}" target="_blank" rel="noopener">Lab ↗</a></div>`;
  if(PAGE[e.id]) return `<article class="gx" id="${e.name}">${head}<p class="gx-page sc-wrap">${PAGE[e.id]}</p></article>`;
  const body = fix(e.snippet);
  return `<article class="gx" id="${e.name}">${head}${BLEED.has(e.block) ? body : `<div class="sc-wrap gx-body">${body}</div>`}</article>`;
};
let n = 0;
const sections = cats.map((c, k) => `<section class="gx-cat" data-chapter="${String(k + 1).padStart(2, '0')} · ${c.toUpperCase()}">
  <header class="sc-wrap gx-cat-head"><p class="sc-kicker">${String(k + 1).padStart(2, '0')} · ${effects.filter(e => e.category === c).length} effects</p><h2 class="sc-h2" data-scrolly="reveal" data-effect="clip">${c}</h2></header>
  ${effects.filter(e => e.category === c).map(e => card(e, n++)).join('\n  ')}
</section>`).join('\n');
const themes = Object.keys(fonts);
const html = `<!doctype html>
<html lang="en" data-sc-theme="genially">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Effects gallery · Genially Scrolly</title>
<meta name="description" content="All ${effects.length} Scroll Lab effects as Genially Scrolly blocks. Every one is a snippet: npx genially-scrolly add <name>.">
<meta name="generator" content="Genially Scrolly ${reg.version}">
<link rel="stylesheet" href="${fonts.genially}" data-sc-fonts>
<link rel="stylesheet" href="../../packages/runtime/dist/scrolly.css">
<link rel="stylesheet" href="../../styles/presets.css">
<style>
  .gx-top{background:color-mix(in srgb, var(--sc-bg) 88%, transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--sc-line)}
  .gx-top .row{display:flex;align-items:center;gap:12px;padding:10px var(--sc-gutter) 4px}
  .gx-top b{font:800 15px var(--sc-font-display)} .gx-top select{margin-left:auto;font:500 13px var(--sc-font-body);padding:6px 10px;border-radius:999px;border:1px solid var(--sc-line);background:var(--sc-surface);color:var(--sc-ink)}
  .gx-top nav{padding:4px var(--sc-gutter) 8px}
  .gx-hero{padding-top:calc(var(--sc-header, 90px) + 8vh)}
  .gx-cat-head{padding-top:14vh}
  .gx{padding-block:8vh 4vh;border-top:1px solid var(--sc-line)}
  .gx-head{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:start;margin-bottom:28px}
  .gx-head h3{font:800 clamp(20px,2.6vw,30px)/1.1 var(--sc-font-display);margin:0 0 6px}
  .gx-head p{margin:0;font:400 14px/1.5 var(--sc-font-body);color:var(--sc-muted)} .gx-head code{font:500 12.5px var(--sc-font-mono);background:var(--sc-surface);padding:2px 6px;border-radius:6px;overflow-wrap:anywhere}
  .gx-n{font:500 13px var(--sc-font-mono);color:var(--sc-accent);padding-top:6px} .gx-head a{font:600 13px var(--sc-font-body);color:var(--sc-accent);text-decoration:none;padding-top:6px;white-space:nowrap}
  .gx-page{font:400 18px/1.5 var(--sc-font-body);color:var(--sc-muted)}
  .gx-body img{max-width:100%}
  .gx-stats{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px} .gx-stats span{font:600 14px var(--sc-font-mono);padding:8px 14px;border-radius:999px;background:var(--sc-surface)}
  @media (max-width:640px){ .gx-head{grid-template-columns:1fr} .gx-n,.gx-head a{padding:0} }
</style>
</head>
<body>
<header data-scrolly="header" class="gx-top">
  <div class="row"><b>Genially Scrolly · ${effects.length} effects</b>
    <label class="sc-sr">Style</label><select id="theme" aria-label="Style preset">${themes.map(t => `<option>${t}</option>`).join('')}</select></div>
  <nav data-scrolly="toc" aria-label="Chapters"></nav>
</header>
<main>
  <section class="sc-wrap gx-hero">
    <p class="sc-kicker" data-scrolly="scramble">THE SCROLL LAB, AS A LIBRARY</p>
    <h1 class="sc-display" data-scrolly="scatter-letters">Every effect.</h1>
    <p class="sc-lede">All ${effects.length} effects of the Scroll Lab, live, each built from one snippet of plain HTML. Copy one with <code>npx genially-scrolly add &lt;name&gt;</code>, or ask Claude for <code>/geniallyscrolly</code> and describe the story you want. Charts use sample data. Switch the style at the top: every effect follows it.</p>
    <div class="gx-stats"><span>${reg.blocks.length} blocks</span><span>${effects.length} effects</span><span>${cats.length} categories</span><span>${reg.blocks.filter(b => b.pin).length} pinning blocks</span><span>GSAP · D3 · three.js · Lottie · Theatre · Matter</span></div>
  </section>
${sections}
</main>
<footer data-scrolly="curtain-footer" style="background:var(--sc-accent);color:var(--sc-on-accent);display:grid;align-content:end;padding:60px var(--sc-gutter)">
  <p class="sc-display">That's all ${effects.length}.</p>
  <p class="sc-lede">Free for non-commercial use with the "Made with Genially Scrolly" mark. Commercial licence: <code>npx genially-scrolly pro</code>.</p>
</footer>
<button data-scrolly="ring"></button>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="../../packages/runtime/dist/scrolly.js"></script>
<script>
  const FONTS = ${JSON.stringify(fonts)};
  const sel = document.getElementById('theme');
  try { const t = new URLSearchParams(location.search).get('theme') || localStorage.getItem('sc-gallery-theme'); if(t && FONTS[t]){ sel.value = t; document.documentElement.dataset.scTheme = t; document.querySelector('[data-sc-fonts]').href = FONTS[t]; } } catch(e){}
  sel.addEventListener('change', () => { const t = sel.value; document.documentElement.dataset.scTheme = t; document.querySelector('[data-sc-fonts]').href = FONTS[t]; try { localStorage.setItem('sc-gallery-theme', t); } catch(e){} setTimeout(() => Scrolly.ctx && Scrolly.ctx.refresh(), 400); });
  Scrolly.init({chapters:true, cursor:true});
</script>
</body>
</html>
`;
mkdirSync(join(root, 'examples/gallery'), {recursive:true});
writeFileSync(join(root, 'examples/gallery/index.html'), html);
console.log(`gallery: ${effects.length} effects in ${cats.length} categories · ${(html.length / 1024).toFixed(0)} KB`);
