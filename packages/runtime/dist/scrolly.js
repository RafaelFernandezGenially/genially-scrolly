/*! Genially Scrolly v0.3.0 · scrollytelling runtime
 *  Free for non-commercial use under the Genially Scrolly License (see LICENSE.md).
 *  Commercial use, removing the "Made with Genially Scrolly" mark, analytics and Genially APIs need a licence.
 *  Needs gsap + ScrollTrigger loaded first. Optional: SplitText, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin, Lenis. */
(function(global){
  'use strict';
  const VERSION = '0.3.0';
  const doc = global.document;
  const $ = (s, r=doc) => r.querySelector(s), $$ = (s, r=doc) => [...r.querySelectorAll(s)];
  const clamp = (v,a=0,b=1) => Math.max(a, Math.min(b, v));
  const lerp = (a,b,t) => a + (b - a)*t;
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
  const num = (v, d) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const json = el => { const s = el.querySelector(':scope > script[type="application/json"]'); if(!s) return null; try { return JSON.parse(s.textContent); } catch(e){ warn(`${el.dataset.scrolly}: invalid JSON data`, e); return null; } };
  const warn = (...a) => console.warn('[scrolly]', ...a);
  const info = (...a) => console.info('[scrolly]', ...a);
  const store = { get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} } };

  const S = { version: VERSION, blocks: {}, ctx: null, util: {clamp, lerp, ease, num, json, store, $, $$} };
  /** Register a block: fn(el, ctx) runs once per element with data-scrolly="name". */
  S.block = (name, fn, meta={}) => { S.blocks[name] = {fn, meta}; };

  /* ---------------- Pro: licence, watermark, analytics, Genially APIs ----------------
     The licensing service is HYPOTHETICAL in this release: no endpoint is shipped, so every
     key resolves to "not connected" and the free tier stays on (with the mark). When Genially
     opens the service, set Scrolly.pro.endpoint (or the licence server answers) and the same
     code path unlocks the Pro features. Removing the mark by editing this file is not allowed
     under the licence for commercial use. */
  const PRO = S.pro = {
    endpoint: null, // e.g. 'https://api.genially.com/scrolly/v1' once Genially launches it (hypothetical)
    status: {valid:false, plan:'free', features:[], reason:'No licence key: free, non-commercial use with the Genially Scrolly mark.'},
    docs: 'https://genially.com/scrolly/licence',
    has(f){ return !!(this.status.valid && this.status.features.includes(f)); },
    async verify(key){
      if(!key){ return this.status; }
      if(!/^gsl_(live|test)_[A-Za-z0-9]{20,}$/.test(key)){ this.status = {...this.status, reason:'That does not look like a Genially Scrolly licence key (gsl_live_… or gsl_test_…).'}; return this.status; }
      if(!this.endpoint){ this.status = {...this.status, reason:'Licence key found, but the Genially licensing service is not connected in this build. Pro features stay off; the mark stays on.'}; return this.status; }
      try {
        const r = await fetch(this.endpoint + '/licenses/verify', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({key, domain:location.hostname, version:VERSION})});
        const j = await r.json(); this.status = {valid:!!j.valid, plan:j.plan || 'free', features:j.features || [], reason:j.reason || ''};
      } catch(e){ this.status = {...this.status, reason:'Could not reach the Genially licensing service; staying on the free tier.'}; }
      return this.status;
    }
  };
  const proGate = feature => { const e = new Error(`"${feature}" is a Genially Scrolly Pro feature. It needs a commercial licence and a connection to Genially (${PRO.docs}).`); e.code = 'pro_required'; return e; };
  /** Analytics: sent to Genially Analytics only with a licence. Free tier sends nothing anywhere. */
  S.track = (name, props={}) => { if(!PRO.has('analytics')) return false; try { navigator.sendBeacon && navigator.sendBeacon(PRO.endpoint + '/events', JSON.stringify({name, props, page:location.pathname, t:Date.now()})); } catch(e){} return true; };
  /** Genially APIs (image generation, assets, publish to Genially). Pro only, hypothetical endpoints. */
  S.genially = {
    async generateImage({prompt, style, size='1536x1024'}={}){ if(!PRO.has('genially-api')) throw proGate('Genially image generation'); const r = await fetch(PRO.endpoint + '/images', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({prompt, style, size})}); return r.json(); },
    async uploadAsset(blob){ if(!PRO.has('genially-api')) throw proGate('Genially asset library'); const r = await fetch(PRO.endpoint + '/assets', {method:'POST', body:blob}); return r.json(); },
    async publish(html){ if(!PRO.has('genially-api')) throw proGate('Publish to Genially'); const r = await fetch(PRO.endpoint + '/publish', {method:'POST', body:html}); return r.json(); }
  };
  const mark = () => {
    if(PRO.has('no-watermark')){ const m = $('.sc-watermark'); if(m) m.remove(); return; }
    if($('.sc-watermark')) return;
    const a = doc.createElement('a'); a.className = 'sc-watermark'; a.href = 'https://genially.com/?utm_source=scrolly&utm_medium=watermark'; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = '<i aria-hidden="true"></i>Made with <b>Genially Scrolly</b>'; a.setAttribute('data-scrolly-mark', VERSION);
    doc.body.appendChild(a);
  };
  S.watermarkText = () => PRO.has('no-watermark') ? '' : 'Made with Genially Scrolly';

  /* ---------------- downloads (works inside claude.ai artifacts and plain pages) ---------------- */
  S.download = async (blob, filename) => {
    try { if(global.claude && global.claude.use){ const dl = await global.claude.use('downloads'); if(dl){ await dl.save({filename, data:blob}); return 'saved'; } } } catch(e){ if(e && e.code === 'declined') return 'declined'; }
    const a = doc.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; doc.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000); return 'saved';
  };

  /* ---------------- lazy loading of heavy libraries ---------------- */
  const loaded = {};
  S.load = src => loaded[src] || (loaded[src] = new Promise((res, rej)=>{ const s = doc.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src)); doc.head.appendChild(s); }));
  S.libs = { three:'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js', d3:'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js' };

  // which GSAP plugin each block uses (loaded automatically by init)
  S.pluginsFor = { SplitText:['words','scatter-letters','weight-wave','fill-text','kinetic'], ScrambleTextPlugin:['scramble','year-counter'], MorphSVGPlugin:['waffle-steps'], Flip:['flip-layout'], Observer:['deck'], Draggable:['stickers'], InertiaPlugin:['stickers']};

  /* ---------------- init ---------------- */
  S.init = async (opts={}) => {
    if(S.ctx) return S.ctx;
    const o = Object.assign({license:null, progress:true, cursor:false, smooth:false, chapters:false, markers:false, header:0, root:doc}, opts);
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]calm\b/.test(location.search) || doc.documentElement.dataset.motion === 'calm';
    const G = !!(global.gsap && global.ScrollTrigger);
    if(!G) warn('gsap and ScrollTrigger must load before scrolly.js. Running in calm mode.');
    const M = G && !RM;
    doc.documentElement.classList.toggle('sc-calm', !M);
    doc.body.classList.add('sc-page');
    if(o.header) doc.documentElement.style.setProperty('--sc-header', o.header + 'px');
    // load the GSAP plugins the blocks on this page need (all free since GSAP 3.13), unless the page already has them
    if(G && o.autoPlugins !== false){ const used = new Set([...doc.querySelectorAll('[data-scrolly]')].map(e=>e.dataset.scrolly)); const want = new Set(['ScrollToPlugin']);
      Object.entries(S.pluginsFor).forEach(([pl, names])=>{ if(names.some(n=>used.has(n))) want.add(pl); }); if(o.chapters) want.add('ScrambleTextPlugin');
      const v = (gsap.version || '3.13.0'); await Promise.all([...want].filter(n=>!global[n]).map(n=>S.load(`https://cdn.jsdelivr.net/npm/gsap@${v}/dist/${n}.min.js`).catch(()=>warn('Could not load ' + n)))); }
    if(G){ gsap.registerPlugin(...['ScrollTrigger','ScrollToPlugin','SplitText','ScrambleTextPlugin','DrawSVGPlugin','MotionPathPlugin','MorphSVGPlugin','Flip','Observer','Draggable','InertiaPlugin'].filter(n=>global[n]).map(n=>global[n]));
      if(o.markers) ScrollTrigger.defaults({markers:{startColor:'#C8FE53', endColor:'#F73C69', fontSize:'11px', indent:24}}); }
    const ST = G ? global.ScrollTrigger : null;
    let lenis = null;
    if(M && o.smooth && global.Lenis){ lenis = new Lenis({autoRaf:false}); lenis.on('scroll', ST.update); gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0); }
    // velocity shared by marquee, particles, skew
    let vel = 0; if(G) ST.create({start:0, end:'max', onUpdate:s=>{ vel = s.getVelocity(); }});
    const resizers = [];
    const ctx = S.ctx = { o, G, M, RM, ST, gsap: global.gsap, lenis, get vel(){ vel *= .9; return vel; }, pro:PRO, S,
      near(el, fn, margin='400px'){ const io = new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ io.disconnect(); fn(); } }, {rootMargin:margin}); io.observe(el); },
      visible(el){ const v = {on:false}; new IntersectionObserver(es=>es.forEach(e=>v.on = e.isIntersecting), {rootMargin:'120px'}).observe(el); return v; },
      /** run fn now and again only when the WIDTH changes (mobile URL bars change height constantly) */
      onWidth(fn){ resizers.push(fn); },
      refresh(){ if(G){ ST.sort(); ST.refresh(); } },
      goTo(y, dur=0){ if(lenis){ lenis.scrollTo(y, dur ? {duration:dur} : {immediate:true}); return; } if(dur && global.ScrollToPlugin && M) gsap.to(global, {scrollTo:{y, autoKill:false}, duration:dur, ease:'power2.inOut'}); else global.scrollTo(0, y); },
      emit(el, name, detail){ el.dispatchEvent(new CustomEvent('scrolly:' + name, {bubbles:true, detail})); },
      params(el){ return el.dataset; }
    };
    let lastW = innerWidth; addEventListener('resize', ()=>{ if(innerWidth === lastW) return; lastW = innerWidth; clearTimeout(ctx._rt); ctx._rt = setTimeout(()=>{ resizers.forEach(f=>{ try { f(); } catch(e){ warn(e); } }); ctx.refresh(); }, 250); });
    // page chrome
    if(o.progress){ const bar = doc.createElement('div'); bar.className = 'sc-progress'; bar.setAttribute('aria-hidden','true'); doc.body.prepend(bar); if(G) ST.create({start:0, end:'max', onUpdate:s=>bar.style.transform = `scaleX(${s.progress})`}); }
    if(o.cursor && M && matchMedia('(pointer:fine)').matches){ const c = doc.createElement('div'); c.className = 'sc-cursor'; doc.body.appendChild(c); doc.documentElement.classList.add('sc-has-cursor');
      const x = gsap.quickTo(c, 'x', {duration:.3, ease:'power3'}), y = gsap.quickTo(c, 'y', {duration:.3, ease:'power3'});
      addEventListener('pointermove', e=>{ x(e.clientX); y(e.clientY); }, {passive:true}); doc.addEventListener('pointerover', e=>c.classList.toggle('big', !!e.target.closest('a,button,[data-cursor]'))); }
    if(o.chapters && G){ let inPin = false; const check = () => { const p = ST.getAll().some(s=>s.pin && s.isActive && s.pin.getBoundingClientRect().top < 72); if(p !== inPin){ inPin = p; doc.documentElement.classList.toggle('sc-in-pin', p); } }; ST.create({start:0, end:'max', onUpdate:()=>requestAnimationFrame(check)}); ST.addEventListener('scrollEnd', check); }
    if(o.chapters){ const chip = doc.createElement('div'); chip.className = 'sc-chapter'; chip.setAttribute('aria-hidden','true'); doc.body.appendChild(chip); const secs = $$('[data-chapter]');
      const io = new IntersectionObserver(es=>es.forEach(e=>{ if(!e.isIntersecting) return; const t = e.target.dataset.chapter; if(chip.dataset.cur === t) return; chip.dataset.cur = t;
        if(M && global.ScrambleTextPlugin) gsap.to(chip, {duration:.7, scrambleText:{text:t, chars:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', speed:.6}}); else chip.textContent = t; }), {rootMargin:'-45% 0px -45% 0px'});
      secs.forEach(s=>io.observe(s)); }
    // in-page links glide (never killed by pins)
    doc.addEventListener('click', e=>{ const a = e.target.closest('a[href^="#"]'); if(!a || a.getAttribute('href').length < 2) return; const t = doc.getElementById(a.getAttribute('href').slice(1)); if(!t) return; e.preventDefault(); ctx.goTo(t.getBoundingClientRect().top + scrollY - (o.header || 0), 1.1); });
    // licence first (async, never blocks paint), mark immediately
    mark(); PRO.verify(o.license).then(st=>{ if(o.license && !st.valid) info(st.reason); mark(); });
    // run blocks in document order
    await (doc.fonts ? doc.fonts.ready.catch(()=>{}) : Promise.resolve());
    $$('[data-scrolly]', o.root).forEach(el=>{ const name = el.dataset.scrolly, b = S.blocks[name]; if(!b){ warn(`unknown block "${name}"`); return; } if(el.__sc) return; el.__sc = true;
      try { b.fn(el, ctx); } catch(e){ warn(`block "${name}" failed`, e); el.classList.add('sc-failed'); } });
    ctx.refresh(); addEventListener('load', ()=>ctx.refresh());
    return ctx;
  };
  global.Scrolly = S;
  // auto-init: <script src="scrolly.js" data-auto data-license="..."></script>
  const me = doc.currentScript;
  if(me && me.hasAttribute('data-auto')){ const go = () => S.init({license:me.dataset.license || null, cursor:me.hasAttribute('data-cursor'), chapters:me.hasAttribute('data-chapters'), smooth:me.hasAttribute('data-smooth')}); doc.readyState === 'loading' ? doc.addEventListener('DOMContentLoaded', go) : go(); }
})(window);

/* Genially Scrolly · motion blocks (reveal, text, layout, scale, camera, media, timeline) */
(function(S){
  const {clamp, num, json, $, $$} = S.util, B = S.block;
  const st = (ctx, vars) => ctx.ST.create(vars);

  /* reveal: data-effect="fade-up|clip|circle|blur|scale|tiles", data-scrub (tie to scroll) */
  B('reveal', (el, c) => {
    const fx = el.dataset.effect || 'fade-up', scrub = el.hasAttribute('data-scrub'); if(!c.M) return;
    const from = {'fade-up':{y:50, autoAlpha:0}, clip:{clipPath:'inset(0 100% 0 0)'}, circle:{clipPath:'circle(3% at 50% 50%)'}, blur:{filter:'blur(18px)', scale:1.15, autoAlpha:.4}, scale:{scale:.8, autoAlpha:0}}[fx] || {y:50, autoAlpha:0};
    const to = {'fade-up':{y:0, autoAlpha:1}, clip:{clipPath:'inset(0 0% 0 0)'}, circle:{clipPath:'circle(75% at 50% 50%)'}, blur:{filter:'blur(0px)', scale:1, autoAlpha:1}, scale:{scale:1, autoAlpha:1}}[fx] || {y:0, autoAlpha:1};
    if(fx === 'tiles' || el.hasAttribute('data-stagger')){ const kids = [...el.children]; gsap.set(kids, {y:60, autoAlpha:0});
      c.ST.batch(kids, {start:'top 90%', onEnter:b=>gsap.to(b, {y:0, autoAlpha:1, stagger:num(el.dataset.stagger, .08), duration:.8, ease:'back.out(1.5)', overwrite:true}), onLeaveBack:b=>gsap.to(b, {y:60, autoAlpha:0, duration:.3, overwrite:true})}); return; }
    gsap.fromTo(el, from, {...to, ease: scrub ? 'none' : 'power3.out', duration: scrub ? 1 : .9, scrollTrigger: scrub ? {trigger:el, start:'top 85%', end:'center 45%', scrub:.6} : {trigger:el, start:'top 85%', toggleActions:'play none none reverse'}});
  }, {category:'reveal'});

  /* words: word-by-word light-up tied to scroll */
  B('words', (el, c) => {
    const words = []; const walk = n => { [...n.childNodes].forEach(k=>{ if(k.nodeType === 3){ const parts = k.textContent.split(/(\s+)/); const f = document.createDocumentFragment(); parts.forEach(p=>{ if(!p) return; if(/^\s+$/.test(p)) f.appendChild(document.createTextNode(p)); else { const s = document.createElement('span'); s.className = 'sc-w'; s.textContent = p; words.push(s); f.appendChild(s); } }); k.replaceWith(f); } else if(k.nodeType === 1) walk(k); }); };
    walk(el); if(!c.M){ words.forEach(w=>w.style.opacity = 1); return; }
    gsap.to(words, {opacity:1, stagger:.08, ease:'none', scrollTrigger:{trigger:el, start:'top 75%', end:'bottom 55%', scrub:.4}});
  }, {category:'text'});

  B('scramble', (el, c) => { if(!c.M || !window.ScrambleTextPlugin) return; const t = el.textContent; st(c, {trigger:el, start:'top 85%', once:true, onEnter:()=>gsap.to(el, {duration:1.2, scrambleText:{text:t, chars:'01#%&*<>', revealDelay:.3, speed:.6}})}); }, {category:'text'});
  B('fill-text', (el, c) => { if(c.M) gsap.to(el, {backgroundSize:'100% 100%', ease:'none', scrollTrigger:{trigger:el, start:'top 80%', end:'bottom 45%', scrub:.5}}); }, {category:'text'});
  B('marker', (el, c) => { $$('mark', el).forEach(m=>{ if(c.M) gsap.to(m, {backgroundSize:'100% 100%', ease:'none', scrollTrigger:{trigger:m, start:'top 80%', end:'top 50%', scrub:.4, onUpdate:s=>m.classList.toggle('sc-on', s.progress > .45)}}); }); }, {category:'text'});

  /* counter: data-to, data-prefix, data-suffix, data-pin (scrubbed with pin) else counts once */
  B('counter', (el, c) => {
    const to = num(el.dataset.to, 100), dec = num(el.dataset.decimals, 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', f = new Intl.NumberFormat(el.dataset.locale || 'en', {maximumFractionDigits:dec, minimumFractionDigits:dec});
    let n = $('.sc-n', el); if(!n){ n = document.createElement('span'); n.className = 'sc-n'; el.prepend(n); }
    const set = p => n.textContent = pre + f.format(to*p) + suf; set(c.M ? 0 : 1);
    if(!c.M) return;
    if(el.hasAttribute('data-pin')) st(c, {trigger:el, pin:true, start:'top top', end:'+=' + (el.dataset.length || '150%'), scrub:.4, onUpdate:s=>set(s.progress)});
    else st(c, {trigger:el, start:'top 85%', once:true, onEnter:()=>{ const o = {p:0}; gsap.to(o, {p:1, duration:1.6, ease:'power3.out', onUpdate:()=>set(o.p)}); }});
  }, {category:'data'});

  /* kinetic: <div data-scrolly="kinetic"><div class="sc-kw"><span>Look</span><span>Click</span><span>Play</span></div></div> */
  B('kinetic', (el, c) => {
    const words = $$('.sc-kw > *', el); if(!c.M || words.length < 2){ words.slice(1).forEach(w=>w.style.visibility = 'hidden'); return; }
    const split = w => window.SplitText ? SplitText.create(w, {type:'chars', mask:'chars'}).chars : [w];
    const parts = words.map(split); parts.slice(1).forEach(p=>gsap.set(p, {yPercent:115}));
    const tl = gsap.timeline({scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=' + (words.length*90) + '%', scrub:1}});
    for(let i=1;i<parts.length;i++) tl.to(parts[i-1], {yPercent:-115, stagger:.04, duration:.5, ease:'power2.in'}).to(parts[i], {yPercent:0, stagger:.04, duration:.5, ease:'power3.out'}, '-=.3').to({}, {duration:.3});
  }, {category:'text'});

  /* steps: the scrollytelling core. Graphic stays, steps scroll. data-show="id" on graphic layers, data-step="id" on steps */
  B('steps', (el, c) => {
    const steps = $$('.sc-steps > *', el), layers = $$('.sc-graphic [data-show]', el); let cur = null;
    const set = (k, step) => { if(k === cur) return; cur = k; steps.forEach(s=>s.classList.toggle('is-active', s === step)); el.dataset.activeStep = k;
      layers.forEach(l=>l.classList.toggle('is-on', l.dataset.show.split(/\s+/).includes(k))); c.emit(el, 'step', {id:k, index:steps.indexOf(step), el:step}); };
    const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) set(e.target.dataset.step || String(steps.indexOf(e.target)), e.target); }), {rootMargin: innerWidth < 821 ? '-60% 0px -35% 0px' : '-45% 0px -45% 0px'});
    steps.forEach(s=>io.observe(s)); if(steps[0]){ const first = () => set(steps[0].dataset.step || '0', steps[0]); first(); if(c.G) c.ST.create({trigger:steps[0], start:'top 55%', onLeaveBack:first}); }
  }, {category:'layout'});

  B('stack', (el, c) => { const cards = [...el.children]; cards.forEach((k,i)=>k.style.setProperty('--i', i)); if(!c.M) return;
    cards.slice(0,-1).forEach((k,i)=>gsap.fromTo(k, {scale:1, filter:'brightness(1)'}, {scale:.9, filter:'brightness(.6)', ease:'none', scrollTrigger:{trigger:cards[i+1], start:'top bottom', end:()=>`top ${(c.o.header || 0) + 24 + (i+1)*14}px`, scrub:true}})); }, {category:'layout'});

  /* horizontal: <section data-scrolly="horizontal"><div class="sc-track"><article>…</article>…</div></section> */
  B('horizontal', (el, c) => {
    const track = $('.sc-track', el), cards = [...track.children]; if(!c.M) return;
    gsap.matchMedia().add('(min-width: 821px)', ()=>{ const dist = () => Math.max(0, track.scrollWidth - el.clientWidth); let pts = [];
      const measure = () => { const d = dist() || 1; pts = cards.map(k=>clamp((k.offsetLeft - cards[0].offsetLeft)/d)); };
      const skew = gsap.quickTo(cards, 'skewX', {duration:.4, ease:'power3'}); let rest;
      const tw = gsap.to(track, {x:()=>-dist(), ease:'none', scrollTrigger:{trigger:el, pin:true, start:'top top', end:()=>'+=' + dist(), scrub:.5, invalidateOnRefresh:true, onRefresh:measure,
        snap:el.hasAttribute('data-no-snap') ? false : {snapTo:v=>gsap.utils.snap(pts.length ? pts : [0,1], v), duration:{min:.2, max:.6}, delay:.15}, onUpdate:s=>{ skew(clamp(s.getVelocity()/-260, -8, 8)); clearTimeout(rest); rest = setTimeout(()=>skew(0), 140); }}});
      measure(); cards.forEach(k=>$$('[data-drift]', k).forEach(a=>gsap.fromTo(a, {xPercent:-num(a.dataset.drift, 10)}, {xPercent:num(a.dataset.drift, 10), ease:'none', scrollTrigger:{containerAnimation:tw, trigger:k, start:'left right', end:'right left', scrub:true}})));
      return () => gsap.set([track, ...cards], {clearProps:'transform'}); });
  }, {category:'layout'});

  B('parallax', (el, c) => { if(!c.M) return; $$('[data-speed],[data-lag]', el).forEach(k=>{ const sp = num(k.dataset.speed, 1), lag = num(k.dataset.lag, 0); gsap.fromTo(k, {y:(sp-1)*-200}, {y:(sp-1)*200, ease:'none', scrollTrigger:{trigger:el, start:'top bottom', end:'bottom top', scrub:lag ? lag*2 + .3 : true}}); }); }, {category:'layout'});

  /* color-flow: children with data-bg (and optional data-fg) */
  B('color-flow', (el, c) => { const bands = [...el.children]; const io = new IntersectionObserver(es=>es.forEach(e=>{ if(!e.isIntersecting) return; el.style.setProperty('--flow', e.target.dataset.bg || 'var(--sc-accent)'); bands.forEach(b=>b.style.color = b === e.target ? (b.dataset.fg || '') : ''); }), {rootMargin:'-49% 0px -49% 0px'}); bands.forEach(b=>io.observe(b)); }, {category:'scale'});

  B('marquee', (el, c) => { const tracks = $$('.sc-row > span', el); tracks.forEach(t=>{ t.innerHTML += t.innerHTML; }); if(!c.M) return; const xs = tracks.map(t=>gsap.quickSetter(t, 'xPercent')), pos = tracks.map(()=>0), v = c.visible(el); let dir = 1;
    gsap.ticker.add(()=>{ if(!v.on) return; const vv = c.vel; if(Math.abs(vv) > 30) dir = Math.sign(vv); tracks.forEach((t,i)=>{ pos[i] -= (.04 + Math.min(Math.abs(vv)/900, 1.6))*(i%2 ? -1 : 1)*dir; pos[i] = gsap.utils.wrap(-50, 0, pos[i]); xs[i](pos[i]); }); }); }, {category:'text'});

  /* zoom-through: <div data-scrolly="zoom-through"><div class="sc-zw">19<span data-origin>0</span>+</div></div> */
  /* resolves var(--x) to a real colour so GSAP can tween it */
  const resolveColor = (v, el) => { const m = /^var\((--[\w-]+)\)$/.exec(String(v).trim()); return m ? (getComputedStyle(el).getPropertyValue(m[1]).trim() || v) : v; };
  B('zoom-through', (el, c) => { const w = $('.sc-zw', el), z = $('[data-origin]', el) || w; if(!c.M) return; const cb = getComputedStyle(el).backgroundColor, bg0 = cb && cb !== 'rgba(0, 0, 0, 0)' ? cb : getComputedStyle(document.body).backgroundColor; el.style.backgroundColor = bg0;
    const origin = () => { const a = w.getBoundingClientRect(), b = z.getBoundingClientRect(); return `${b.left - a.left + b.width/2}px ${b.top - a.top + b.height*.52}px`; };
    gsap.timeline({scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=' + (el.dataset.length || '200%'), scrub:.6, invalidateOnRefresh:true}})
      .fromTo(w, {scale:1, transformOrigin:origin}, {scale:num(el.dataset.scale, 60), ease:'power3.in', transformOrigin:origin, immediateRender:false})
      .fromTo(el, {backgroundColor:bg0}, {backgroundColor:resolveColor(el.dataset.to || 'var(--sc-accent)', el), duration:.35, immediateRender:false}, .6); }, {category:'scale'});

  B('portal', (el, c) => { let d = $('.sc-dot', el); if(!d){ d = document.createElement('i'); d.className = 'sc-dot'; el.prepend(d); } if(!c.M) return;
    gsap.timeline({scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=' + (el.dataset.length || '160%'), scrub:.6, invalidateOnRefresh:true}})
      .to(d, {scale:()=>Math.hypot(innerWidth, innerHeight)/40 + 2, ease:'power2.in'}).to([...el.children].filter(k=>k !== d), {opacity:1, duration:.3}, '-=.1'); }, {category:'scale'});

  B('grow', (el, c) => { const m = el.firstElementChild; if(!c.M) return; gsap.timeline({scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=120%', scrub:.6}}).fromTo(m, {clipPath:'inset(28% 30% 28% 30% round 28px)'}, {clipPath:'inset(0% 0% 0% 0% round 0px)', ease:'power2.inOut'}); }, {category:'scale'});
  B('curtain', (el, c) => { if(!c.M) return; gsap.timeline({scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=120%', scrub:.8}}).to($('.sc-half.l', el), {xPercent:-101, ease:'power2.in'}, 0).to($('.sc-half.r', el), {xPercent:101, ease:'power2.in'}, 0); }, {category:'reveal'});
  /* deep-zoom: <div data-scrolly="deep-zoom" data-origin="62% 58%" data-scale="6"><img …></div> */
  B('deep-zoom', (el, c) => { const img = el.querySelector('img'); if(!c.M) return; gsap.fromTo(img, {scale:1}, {scale:num(el.dataset.scale, 5), transformOrigin:el.dataset.origin || '50% 50%', ease:'power2.in', scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=200%', scrub:.6}}); }, {category:'zoom'});

  /* camera (Prezi-style): data-width/height of the world; children with data-x data-y data-zoom data-rotate data-title data-text */
  B('camera', (el, c) => {
    const W = num(el.dataset.width, 3200), H = num(el.dataset.height, 2000), world = document.createElement('div'); world.className = 'sc-world'; world.style.width = W + 'px'; world.style.height = H + 'px';
    const items = [...el.children]; items.forEach(k=>world.appendChild(k)); el.appendChild(world);
    items.forEach(k=>{ if(k.dataset.x != null) k.style.left = num(k.dataset.x, 0) + 'px'; if(k.dataset.y != null) k.style.top = num(k.dataset.y, 0) + 'px'; if(k.dataset.rotate) k.style.rotate = k.dataset.rotate + 'deg'; });
    const stopsEls = items.filter(k=>k.hasAttribute('data-stop')), fitAll = () => Math.min(el.clientWidth/W, el.clientHeight/H)*.92;
    const stops = [{t:'Overview', x:W/2, y:H/2, s:fitAll, r:0, p:el.dataset.intro || 'The whole picture. Scroll to fly in.'}, ...stopsEls.map(k=>({t:k.dataset.title || k.dataset.stop || 'Stop', x:num(k.dataset.x,0), y:num(k.dataset.y,0), s:()=>Math.min(el.clientWidth, el.clientHeight)/(num(k.dataset.zoom, 600)*2), r:num(k.dataset.rotate, 0), p:k.dataset.text || ''})), {t:'Overview', x:W/2, y:H/2, s:fitAll, r:0, p:'And back out.'}];
    const ui = document.createElement('div'); ui.className = 'sc-cam-ui'; ui.innerHTML = stops.slice(0,-1).map((s,k)=>`<button data-k="${k}">${s.t}</button>`).join(''); el.appendChild(ui);
    const cap = document.createElement('div'); cap.className = 'sc-cam-cap'; cap.setAttribute('aria-live','polite'); el.appendChild(cap); const btns = $$('button', ui);
    const v = f => typeof f === 'function' ? f() : f, cam = {x:W/2, y:H/2, ls:0, r:0};
    const apply = () => { const sc = Math.exp(cam.ls); world.style.transform = `translate(${el.clientWidth/2}px,${el.clientHeight/2}px) scale(${sc}) rotate(${-cam.r}deg) translate(${-cam.x}px,${-cam.y}px)`; };
    const mark = k => { cap.innerHTML = `<b>STOP ${k+1} / ${stops.length} · ${stops[k].t.toUpperCase()}</b>${stops[k].p}`; btns.forEach((b,j)=>b.setAttribute('aria-current', String(j === k || (k === stops.length-1 && j === 0)))); };
    let tl = null, last = -1;
    const build = () => { if(tl){ tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); } Object.assign(cam, {x:W/2, y:H/2, ls:Math.log(fitAll()), r:0}); apply(); mark(0); if(!c.M) return;
      tl = gsap.timeline({onUpdate:apply, scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=' + (stops.length*80) + '%', scrub:1, snap:{snapTo:'labels', duration:{min:.3, max:1}, delay:.15},
        onUpdate:()=>{ const k = +String(tl.currentLabel()).slice(1); if(!isNaN(k) && k !== last){ last = k; mark(k); } }}});
      tl.addLabel('s0'); for(let k=1;k<stops.length;k++){ const a = stops[k-1], b = stops[k], la = Math.log(v(a.s)), lb = Math.log(v(b.s)), lo = Math.min(la, lb) - .3;
        tl.to(cam, {x:(a.x+b.x)/2, y:(a.y+b.y)/2, ls:lo, r:(a.r+b.r)/2, duration:.5, ease:'power2.in'}).to(cam, {x:b.x, y:b.y, ls:lb, r:b.r, duration:.5, ease:'power2.out'}).addLabel('s' + k).to({}, {duration:.35}); } };
    btns.forEach(b=>b.addEventListener('click', ()=>{ const k = +b.dataset.k, s2 = stops[k]; if(!tl){ Object.assign(cam, {x:s2.x, y:s2.y, ls:Math.log(v(s2.s)), r:s2.r}); apply(); mark(k); return; } const S2 = tl.scrollTrigger; c.goTo(S2.start + (S2.end - S2.start)*(tl.labels['s' + k]/tl.duration()), 1.3); }));
    build(); c.onWidth(build);
  }, {category:'zoom'});

  /* video-scrub: data-src="film.webm" data-fallback="film.mp4" data-duration="8" data-length="300%" */
  B('video-scrub', (el, c) => {
    let vid = el.querySelector('video'); if(!vid){ vid = document.createElement('video'); el.prepend(vid); } vid.muted = true; vid.playsInline = true; vid.preload = 'none'; if(el.dataset.poster) vid.poster = el.dataset.poster;
    const dur = num(el.dataset.duration, 6), hud = document.createElement('span'); hud.className = 'sc-hud'; hud.setAttribute('aria-hidden','true'); el.appendChild(hud);
    if(!c.M){ vid.removeAttribute('src'); hud.remove(); return; }
    let target = 0, shown = 0, active = false;
    c.near(el, ()=>{ const src = vid.canPlayType('video/webm; codecs="vp9"') && el.dataset.src ? el.dataset.src : (el.dataset.fallback || el.dataset.src);
      fetch(src).then(r=>r.ok ? r.blob() : Promise.reject()).then(b=>{ vid.src = URL.createObjectURL(b); vid.addEventListener('loadedmetadata', ()=>{ vid.currentTime = shown; }, {once:true}); }).catch(()=>{ vid.src = src; }); }, '900px');
    addEventListener('touchstart', function prime(){ const p = vid.play(); p && p.then(()=>vid.pause()).catch(()=>{}); removeEventListener('touchstart', prime); }, {passive:true});
    st(c, {trigger:el, pin:true, start:'top top', end:'+=' + (el.dataset.length || '300%'), onUpdate:s=>{ target = s.progress*(dur - .04); }, onToggle:s=>active = s.isActive});
    gsap.ticker.add(()=>{ if(!active && Math.abs(target - shown) < .001) return; shown += (target - shown)*.22; if(Math.abs(target - shown) < .002) shown = target;
      if(vid.readyState >= 1 && !vid.seeking && Math.abs(vid.currentTime - shown) > .015) vid.currentTime = shown; hud.textContent = `${shown.toFixed(1)} s / ${dur.toFixed(1)} s`; c.emit(el, 'time', {t:shown}); });
  }, {category:'media'});

  /* sequence: data-frames="frames/f{000}.webp" data-count="72" */
  B('sequence', (el, c) => {
    const N = num(el.dataset.count, 60), pat = el.dataset.frames || '', cv = document.createElement('canvas'); el.prepend(cv); const x = cv.getContext('2d'), frames = [];
    const url = i => pat.replace(/\{(0+)\}/, (m, z)=>String(i).padStart(z.length, '0'));
    const draw = i => { const im = frames[i]; if(!im || !im.complete || !im.naturalWidth) return; const w = cv.width = el.clientWidth*Math.min(devicePixelRatio, 2), h = cv.height = el.clientHeight*Math.min(devicePixelRatio, 2), s = Math.max(w/im.naturalWidth, h/im.naturalHeight); x.drawImage(im, (w - im.naturalWidth*s)/2, (h - im.naturalHeight*s)/2, im.naturalWidth*s, im.naturalHeight*s); };
    let want = c.M ? 0 : Math.floor(N*.6); c.near(el, ()=>{ for(let i=0;i<N;i++){ const im = new Image(); im.src = url(i); im.onload = ()=>{ if(i === want) draw(i); }; frames.push(im); } });
    if(c.M) st(c, {trigger:el, pin:true, start:'top top', end:'+=' + (el.dataset.length || '250%'), scrub:true, onUpdate:s=>{ want = Math.round(s.progress*(N-1)); draw(want); }});
    c.onWidth(()=>draw(want));
  }, {category:'media'});

  B('autoplay-video', (el, c) => { const v = el.querySelector('video'); if(!v) return; v.muted = true; v.playsInline = true; v.loop = true; const b = document.createElement('button'); b.className = 'sc-vbtn'; el.appendChild(b); let user = false;
    const lab = () => b.textContent = v.paused ? '▶ Play' : '❚❚ Pause'; v.addEventListener('play', lab); v.addEventListener('pause', lab); lab();
    b.addEventListener('click', ()=>{ user = true; v.paused ? v.play() : v.pause(); });
    if(c.M) new IntersectionObserver(es=>es.forEach(e=>{ if(user) return; e.isIntersecting ? v.play().catch(()=>{}) : v.pause(); }), {threshold:.4}).observe(el); }, {category:'media'});

  /* timeline: serpentine path; children <div data-year="2015">text</div> */
  B('timeline', (el, c) => {
    const items = $$(':scope > [data-year]', el), NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('aria-hidden','true'); el.prepend(svg);
    const base = document.createElementNS(NS, 'path'), dr = document.createElementNS(NS, 'path'), dot = document.createElementNS(NS, 'circle');
    base.setAttribute('fill','none'); base.setAttribute('stroke','var(--sc-line)'); base.setAttribute('stroke-width','6'); dr.setAttribute('fill','none'); dr.setAttribute('stroke','var(--sc-accent-2)'); dr.setAttribute('stroke-width','6'); dr.setAttribute('stroke-linecap','round'); dot.setAttribute('r','11'); dot.setAttribute('fill','var(--sc-accent-2)');
    svg.append(base, dr, dot);
    const layout = () => { const W = el.clientWidth, nar = W < 700, gap = nar ? 220 : 240, top = 50, H = top + items.length*gap + 30; el.style.height = H + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const xs = nar ? [24, 48] : [W*.25, W*.75], P = items.map((k,i)=>({x:xs[i%2], y:top + i*gap + gap/2})); let d = `M${P[0].x} ${top - 40} L${P[0].x} ${P[0].y}`;
      for(let i=1;i<P.length;i++){ const a = P[i-1], b = P[i]; d += ` C${a.x} ${a.y + gap*.55} ${b.x} ${b.y - gap*.55} ${b.x} ${b.y}`; } d += ` L${P[P.length-1].x} ${H}`; base.setAttribute('d', d); dr.setAttribute('d', d);
      items.forEach((k,i)=>{ const p = P[i]; k.style.top = p.y + 'px'; if(nar){ k.style.left = '76px'; k.style.translate = '0 -50%'; } else if(i%2 === 0){ k.style.left = (p.x + 30) + 'px'; k.style.translate = '0 -50%'; } else { k.style.left = (p.x - 30) + 'px'; k.style.translate = '-100% -50%'; } }); };
    layout(); c.onWidth(layout);
    if(!c.M){ items.forEach(k=>k.classList.add('is-on')); dot.remove(); return; }
    const L = () => dr.getTotalLength(); const o = {p:0}; const upd = () => { const l = L(); dr.setAttribute('stroke-dasharray', l); dr.setAttribute('stroke-dashoffset', l*(1 - o.p)); const pt = dr.getPointAtLength(l*o.p); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); };
    gsap.to(o, {p:1, ease:'none', onUpdate:upd, scrollTrigger:{trigger:el, start:'top 55%', end:'bottom 55%', scrub:.6, onRefresh:upd}}); upd();
    items.forEach(k=>st(c, {trigger:k, start:'top 55%', toggleClass:{targets:k, className:'is-on'}}));
  }, {category:'timeline'});
})(window.Scrolly);

/* Genially Scrolly · data, interaction, learning & 3D blocks */
(function(S){
  const {clamp, num, json, $, $$, store} = S.util, B = S.block, NS = 'http://www.w3.org/2000/svg';
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const palette = () => ['--sc-accent','--sc-accent-2','--sc-accent-3','--sc-accent-4','--sc-accent-5','--sc-accent-6'].map(css);
  const fmtK = v => Math.abs(v) >= 1e6 ? (v/1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/,'') + 'M' : Math.abs(v) >= 1e3 ? (v/1e3).toFixed(v >= 1e4 ? 0 : 1).replace(/\.0$/,'') + 'k' : String(Math.round(v*10)/10);
  const esc = s => String(s).replace(/[&<>"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const lum = c => { c = String(c || '').trim(); const v = /^var\((--[\w-]+)\)$/.exec(c); if(v) c = css(v[1]); let r, g, b, m = /^#?([0-9a-f]{6})$/i.exec(c), m3 = /^#([0-9a-f]{3})$/i.exec(c), mr = /rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(c);
    if(m){ const n = parseInt(m[1], 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; } else if(m3){ [r, g, b] = [...m3[1]].map(h=>parseInt(h + h, 16)); } else if(mr){ [r, g, b] = [mr[1], mr[2], mr[3]].map(Number); } else return 0; return (0.299*r + 0.587*g + 0.114*b)/255; };
  let tip; const tipInit = () => { if(tip) return; tip = document.createElement('div'); tip.className = 'sc-tip'; tip.setAttribute('role','status'); document.body.appendChild(tip);
    document.addEventListener('pointerover', e=>{ const t = e.target.closest && e.target.closest('[data-scrolly] [data-tip]'); if(t){ tip.innerHTML = t.getAttribute('data-tip'); tip.style.opacity = 1; } else tip.style.opacity = 0; });
    document.addEventListener('pointermove', e=>{ if(tip.style.opacity === '1'){ tip.style.left = Math.min(innerWidth - tip.offsetWidth - 10, e.clientX + 14) + 'px'; tip.style.top = Math.min(innerHeight - tip.offsetHeight - 10, e.clientY + 16) + 'px'; } }, {passive:true});
    addEventListener('scroll', ()=>{ tip.style.opacity = 0; }, {passive:true}); };
  S.util.tipInit = () => tipInit();
  const svgEl = (tag, attrs={}, parent) => { const e = document.createElementNS(NS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e; };

  /* chart: <div data-scrolly="chart"><script type="application/json">{type, title, source, note, labels, series:[{name, values, color}]}</script></div> */
  B('chart', (el, c) => {
    const D = json(el); if(!D) return; tipInit(); const pal = palette(), series = (D.series || []).map((s,i)=>({...s, color:s.color || pal[i % pal.length]}));
    el.insertAdjacentHTML('beforeend', `<h4 class="sc-ch-h">${esc(D.title || '')}</h4><div class="sc-ch-sub">${D.source === 'real' ? '<span class="sc-chip real">real data</span>' : D.source === 'sample' ? '<span class="sc-chip sample">sample data</span>' : ''}<span>${esc(D.note || '')}</span></div>${series.length > 1 && D.type !== 'race' ? `<div class="sc-legend">${series.map(s=>`<span style="--c:${s.color}">${esc(s.name)}</span>`).join('')}</div>` : ''}`);
    const svg = svgEl('svg', {role:'img', 'aria-label':D.alt || D.title || 'Chart'}, el);
    const rows = [['', ...series.map(s=>s.name)], ...(D.labels || []).map((l,i)=>[l, ...series.map(s=>s.values[i])])];
    el.insertAdjacentHTML('beforeend', `<details><summary>Show as a table</summary><table><thead><tr>${rows[0].map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${r.map(v=>`<td>${typeof v === 'number' ? v.toLocaleString('en') : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></details>`);
    let trig = null;
    const build = () => {
      const W = Math.max(280, svg.parentElement.clientWidth - 4), sm = W < 520, H = D.type === 'donut' ? Math.min(W, 320) : D.type === 'waffle' ? Math.min(W, 340) : D.type === 'race' ? 60 + (series.length)*44 : Math.round(clamp(W*.5, 240, 380));
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = ''; if(trig){ trig.kill(); trig = null; }
      const L = sm ? 40 : 52, T = 12, R = 12, Bt = 28, labels = D.labels || [], max = D.max || Math.max(...series.flatMap(s=>s.values)) * 1.08;
      const grid = () => { const g = svgEl('g', {}, svg); for(let k=0;k<=4;k++){ const v = max*k/4, y = H - Bt - (H - Bt - T)*k/4; svgEl('line', {x1:L, x2:W - R, y1:y, y2:y, stroke:'var(--sc-line)'}, g); const t = svgEl('text', {x:L - 6, y:y + 4, 'text-anchor':'end', class:'ax'}, g); t.textContent = fmtK(v); }
        labels.forEach((l,i)=>{ if(sm && labels.length > 7 && i % 2) return; const t = svgEl('text', {x:xAt(i), y:H - 8, 'text-anchor':'middle', class:'ax'}, g); t.textContent = l; }); };
      let xAt, anim = [], drawFn = null;
      if(D.type === 'line'){ xAt = i => L + (W - L - R)*(labels.length > 1 ? i/(labels.length - 1) : .5); const y = v => H - Bt - (H - Bt - T)*v/max; grid();
        series.forEach(s=>{ const p = svgEl('path', {d:'M' + s.values.map((v,i)=>`${xAt(i)} ${y(v)}`).join(' L'), fill:'none', stroke:s.color, 'stroke-width':2.5, 'stroke-linecap':'round', 'stroke-linejoin':'round'}, svg); const len = p.getTotalLength(); p.setAttribute('stroke-dasharray', len); p.setAttribute('stroke-dashoffset', c.M ? len : 0); anim.push([p, len]);
          s.values.forEach((v,i)=>svgEl('circle', {cx:xAt(i), cy:y(v), r:10, fill:'transparent', 'data-tip':`<b>${esc(s.name)} · ${esc(labels[i])}</b>${v.toLocaleString('en')}${D.unit || ''}`}, svg)); });
        drawFn = p => anim.forEach(([e,len])=>e.setAttribute('stroke-dashoffset', len*(1 - p))); }
      else if(D.type === 'donut'){ const r = Math.min(W, H)/2 - 24, cx = W/2, cy = H/2, C = 2*Math.PI*r, s = series[0], tot = s.values.reduce((a,b)=>a + b, 0); let acc = 0;
        svgEl('circle', {cx, cy, r, fill:'none', stroke:'var(--sc-line)', 'stroke-width':26}, svg);
        const segs = s.values.map((v,i)=>{ const col = (D.colors && D.colors[i]) || pal[i % pal.length], seg = svgEl('circle', {cx, cy, r, fill:'none', stroke:col, 'stroke-width':26, transform:`rotate(-90 ${cx} ${cy})`, 'data-tip':`<b>${esc(labels[i])}</b>${Math.round(v/tot*100)}% · ${v.toLocaleString('en')}`}, svg); const o = {start:acc/tot, len:v/tot}; acc += v; return [seg, o]; });
        const t = svgEl('text', {x:cx, y:cy + 8, 'text-anchor':'middle', 'font-size':26, 'font-weight':800}, svg); t.textContent = D.center != null ? D.center : '';
        drawFn = p => segs.forEach(([seg,o])=>{ const vis = clamp((p - o.start)/(o.len || 1))*o.len; seg.setAttribute('stroke-dasharray', `${Math.max(0, vis*C - 2)} ${C}`); seg.setAttribute('stroke-dashoffset', -o.start*C); });
        const lg = document.createElement('div'); lg.className = 'sc-legend'; lg.innerHTML = labels.map((l,i)=>`<span style="--c:${(D.colors && D.colors[i]) || pal[i % pal.length]}">${esc(l)} · ${Math.round(s.values[i]/tot*100)}%</span>`).join(''); const old = $('.sc-legend.donut', el); if(old) old.remove(); lg.classList.add('donut'); svg.before(lg); }
      else if(D.type === 'waffle'){ const s = series[0], tot = s.values.reduce((a,b)=>a + b, 0), cell = Math.min((W - 20)/10, (H - 10)/10), dots = []; let k = 0;
        s.values.forEach((v,i)=>{ const n = Math.round(v/tot*100); for(let j=0;j<n && k<100;j++,k++){ const col = (D.colors && D.colors[i]) || pal[i % pal.length]; dots.push(svgEl('circle', {cx:10 + (k%10)*cell + cell/2, cy:5 + Math.floor(k/10)*cell + cell/2, r:cell*.4, fill:col, 'data-tip':`<b>${esc(labels[i])}</b>${n} in 100`}, svg)); } });
        drawFn = p => dots.forEach((d,i)=>d.setAttribute('opacity', p*100 >= i ? 1 : .12));
        const lg = document.createElement('div'); lg.className = 'sc-legend'; lg.innerHTML = labels.map((l,i)=>`<span style="--c:${(D.colors && D.colors[i]) || pal[i % pal.length]}">${esc(l)}</span>`).join(''); if(!$('.sc-legend', el)) svg.before(lg); }
      else if(D.type === 'race'){ const LB = sm ? 90 : 130, x = v => (W - LB - 50)*v/max; const g = series.map(s=>{ const gg = svgEl('g', {}, svg); const t = svgEl('text', {x:LB - 8, y:5, 'text-anchor':'end', 'font-size':13}, gg); t.textContent = s.name; const rc = svgEl('rect', {x:LB, y:-15, height:30, rx:5, fill:s.color}, gg); const vt = svgEl('text', {y:5, 'font-size':13, 'font-weight':700}, gg); return {gg, rc, vt, s}; });
        const per = svgEl('text', {x:W - R, y:H - 6, 'text-anchor':'end', 'font-size':Math.min(48, W/8), 'font-weight':800, opacity:.5}, svg);
        drawFn = p => { const f = p*(labels.length - 1), i0 = Math.floor(f), i1 = Math.min(labels.length - 1, i0 + 1), t = f - i0; const vals = g.map(o=>o.s.values[i0] + (o.s.values[i1] - o.s.values[i0])*t), order = vals.map((v,i)=>[v,i]).sort((a,b)=>b[0] - a[0]).map(z=>z[1]);
          g.forEach((o,i)=>{ const w = Math.max(2, x(vals[i])); o.gg.setAttribute('transform', `translate(0 ${30 + order.indexOf(i)*44})`); o.rc.setAttribute('width', w); o.vt.textContent = fmtK(vals[i]); const inside = w > 60; o.vt.setAttribute('x', inside ? LB + w - 8 : LB + w + 8); o.vt.setAttribute('text-anchor', inside ? 'end' : 'start'); o.vt.setAttribute('fill', inside && lum(o.s.color) > .6 ? '#121212' : inside ? '#fff' : 'var(--sc-ink)'); });
          per.textContent = labels[Math.round(f)]; }; }
      else { /* bar (single or grouped) */ const n = labels.length, gw = (W - L - R)/n, bw = Math.min(46, gw*.8/series.length); xAt = i => L + gw*i + gw/2; const y = v => H - Bt - (H - Bt - T)*v/max; grid();
        series.forEach((s,si)=>s.values.forEach((v,i)=>{ const x = xAt(i) - bw*series.length/2 + si*bw + 1, rc = svgEl('rect', {x, width:bw - 2, rx:3, fill:s.color, y:y(v), height:H - Bt - y(v), 'data-tip':`<b>${esc(labels[i])}${series.length > 1 ? ' · ' + esc(s.name) : ''}</b>${v.toLocaleString('en')}${D.unit || ''}`}, svg); anim.push([rc, y(v), H - Bt - y(v), i]); }));
        drawFn = p => anim.forEach(([rc, yy, hh, i])=>{ const t = clamp(p*1.4 - i*.4/n); rc.setAttribute('y', H - Bt - hh*t); rc.setAttribute('height', hh*t); }); }
      if(!drawFn) return; drawFn(c.M ? 0 : 1);
      if(c.M){ const pin = D.type === 'race'; trig = c.ST.create({trigger:pin ? el : svg, start:pin ? 'top top' : 'top 85%', end:pin ? '+=200%' : 'center 50%', pin, scrub:.6, onUpdate:s=>drawFn(s.progress)}); }
    };
    build(); c.onWidth(build);
  }, {category:'data'});

  B('kpi', (el, c) => { const vals = $$('[data-value]', el); const run = () => vals.forEach((v,i)=>{ const to = num(v.dataset.value, 0), pre = v.dataset.prefix || '', suf = v.dataset.suffix || '', f = x => pre + (v.hasAttribute('data-short') ? fmtK(x) : Math.round(x).toLocaleString('en')) + suf; if(!c.M){ v.textContent = f(to); return; } const o = {x:0}; gsap.to(o, {x:to, duration:1.5 + i*.15, ease:'power3.out', onUpdate:()=>v.textContent = f(o.x)}); });
    vals.forEach(v=>v.textContent = '0'); if(c.M) c.ST.create({trigger:el, start:'top 85%', once:true, onEnter:run}); else run(); }, {category:'data'});

  /* compare: two <img>, optional hotspots via data-hotspots='[[x%,y%,"text"],…]' */
  const hotspots = (el, list) => { (list || []).forEach(([l,t,txt],i)=>{ const b = document.createElement('button'); b.className = 'sc-hs'; b.style.left = l + '%'; b.style.top = t + '%'; b.textContent = i + 1; b.setAttribute('aria-expanded','false'); b.setAttribute('aria-label', `Detail ${i+1}`); el.appendChild(b);
      b.addEventListener('click', e=>{ e.stopPropagation(); const open = b.getAttribute('aria-expanded') === 'true'; $$('.sc-pop', el).forEach(p=>p.remove()); $$('.sc-hs', el).forEach(h=>h.setAttribute('aria-expanded','false')); if(open) return; const p = document.createElement('div'); p.className = 'sc-pop'; p.setAttribute('role','status'); p.style.left = l + '%'; p.style.top = t + '%'; p.textContent = txt; el.appendChild(p); b.setAttribute('aria-expanded','true'); }); });
    document.addEventListener('click', e=>{ if(!el.contains(e.target)) $$('.sc-pop', el).forEach(p=>p.remove()); }); };
  B('compare', (el, c) => { const line = document.createElement('div'); line.className = 'sc-line'; const inp = document.createElement('input'); inp.type = 'range'; inp.min = 0; inp.max = 100; inp.value = 50; inp.setAttribute('aria-label', el.dataset.label || 'Compare before and after'); el.append(line, inp);
    const set = v => el.style.setProperty('--pos', v + '%'); inp.addEventListener('input', ()=>set(inp.value)); try { hotspots(el, JSON.parse(el.dataset.hotspots || '[]')); } catch(e){}
    if(c.M) gsap.fromTo(inp, {value:15}, {value:85, ease:'none', onUpdate:()=>set(inp.value), scrollTrigger:{trigger:el, start:'top 75%', end:'bottom 40%', scrub:.6}}); }, {category:'hover'});
  B('hotspots', (el, c) => { try { hotspots(el, JSON.parse(el.dataset.hotspots || '[]')); } catch(e){} }, {category:'hover'});
  B('spotlight', (el, c) => { const r = num(el.dataset.radius, 120); el.addEventListener('pointermove', e=>{ const b = el.getBoundingClientRect(); el.style.setProperty('--x', (e.clientX - b.left) + 'px'); el.style.setProperty('--y', (e.clientY - b.top) + 'px'); });
    el.addEventListener('pointerenter', ()=>c.M ? gsap.to(el, {'--r':r + 'px', duration:.4}) : el.style.setProperty('--r', r + 'px')); el.addEventListener('pointerleave', ()=>c.M ? gsap.to(el, {'--r':'0px', duration:.4}) : el.style.setProperty('--r','0px')); }, {category:'hover'});
  B('magnetic', (el, c) => { if(!c.M || !matchMedia('(pointer:fine)').matches) return; $$('a,button', el).forEach(b=>{ const x = gsap.quickTo(b, 'x', {duration:.4, ease:'power3'}), y = gsap.quickTo(b, 'y', {duration:.4, ease:'power3'});
    b.addEventListener('pointermove', e=>{ const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width/2)*.35); y((e.clientY - r.top - r.height/2)*.35); }); b.addEventListener('pointerleave', ()=>{ x(0); y(0); }); }); }, {category:'hover'});
  B('tilt', (el, c) => { if(!c.M || !matchMedia('(pointer:fine)').matches) return; [...el.children].forEach(k=>{ k.addEventListener('pointermove', e=>{ const r = k.getBoundingClientRect(), px = (e.clientX - r.left)/r.width - .5, py = (e.clientY - r.top)/r.height - .5; k.style.transform = `perspective(800px) rotateY(${px*18}deg) rotateX(${-py*18}deg)`; }); k.addEventListener('pointerleave', ()=>k.style.transform = ''); }); }, {category:'hover'});

  /* ---------------- learning & development ---------------- */
  const pageKey = 'scrolly:' + location.pathname;
  const ld = { state:store.get(pageKey) || {}, done(id, extra){ this.state[id] = extra || true; store.set(pageKey, this.state); document.dispatchEvent(new CustomEvent('scrolly:complete', {detail:{id, extra}})); S.track('activity_complete', {id}); } };
  S.learning = ld;
  const actId = (el, kind) => el.id || (el.id = kind + '-' + ($$(`[data-scrolly="${kind}"]`).indexOf(el) + 1));

  /* quiz: JSON [{q, options:[…], answer:index, why}] */
  B('quiz', (el, c) => { const Q = json(el) || []; const id = actId(el, 'quiz'); el.classList.add('sc-ld'); let i = 0, score = 0, answered = false;
    const render = () => { if(i >= Q.length){ el.innerHTML = `<h4>You got ${score} of ${Q.length}.</h4><button class="sc-opt primary" data-re>Try again</button>`; ld.done(id, {score, of:Q.length}); return; } const q = Q[i]; answered = false;
      el.innerHTML = `<p class="sc-meta">QUESTION ${i+1} OF ${Q.length}</p><h4>${esc(q.q)}</h4><div role="group">${q.options.map((o,j)=>`<button class="sc-opt" data-j="${j}">${esc(o)}</button>`).join('')}</div><p class="sc-fb" aria-live="polite"></p><button class="sc-opt primary" data-next hidden>${i === Q.length-1 ? 'See score' : 'Next'} →</button>`; };
    el.addEventListener('click', e=>{ const b = e.target.closest('[data-j]'); if(b && !answered){ answered = true; const q = Q[i], ok = +b.dataset.j === q.answer; if(ok) score++; b.classList.add(ok ? 'right' : 'wrong'); if(!ok) el.querySelectorAll('[data-j]')[q.answer].classList.add('reveal');
        $('.sc-fb', el).innerHTML = `<b>${ok ? 'Right.' : 'Not quite.'}</b> ${esc(q.why || '')}`; const n = $('[data-next]', el); n.hidden = false; n.focus(); }
      if(e.target.closest('[data-next]')){ i++; render(); const f = $('button', el); if(f) f.focus(); } if(e.target.closest('[data-re]')){ i = 0; score = 0; render(); } }); render(); }, {category:'learning'});

  /* flashcards: JSON [[front, back], …] with a Leitner-style queue */
  B('flashcards', (el, c) => { const F = json(el) || []; const id = actId(el, 'flashcards'); el.classList.add('sc-ld'); let q = F.map((_,i)=>i), known = 0, flipped = false;
    const render = () => { if(!q.length){ el.innerHTML = `<h4>Deck done</h4><p>You knew all ${F.length} cards.</p><button class="sc-opt primary" data-a="again">Start over</button>`; ld.done(id); return; } const [f,b] = F[q[0]];
      el.innerHTML = `<button class="sc-card${flipped ? ' flip' : ''}" data-a="flip" aria-label="${esc(flipped ? 'Answer: ' + b : f + '. Press to see the answer.')}"><span><span>${esc(f)}</span><span>${esc(b)}</span></span></button><p class="sc-meta">${known} known · ${q.length} to go</p><button class="sc-opt primary" data-a="know" ${flipped ? '' : 'disabled'}>I knew it</button><button class="sc-opt" data-a="miss" ${flipped ? '' : 'disabled'}>Not yet, show again soon</button>`; };
    el.addEventListener('click', e=>{ const b = e.target.closest('[data-a]'); if(!b) return; const a = b.dataset.a; if(a === 'flip') flipped = !flipped; if(a === 'know'){ q.shift(); known++; flipped = false; } if(a === 'miss'){ const k = q.shift(); q.splice(Math.min(2, q.length), 0, k); flipped = false; } if(a === 'again'){ q = F.map((_,i)=>i); known = 0; flipped = false; } render(); const f = $('button', el); if(f) f.focus(); }); render(); }, {category:'learning'});

  /* scenario: JSON {start:"id", who:"Name", nodes:{id:{say, choices:[[label, nextId, score]]} | {end, text}}} */
  B('scenario', (el, c) => { const D = json(el); if(!D) return; const id = actId(el, 'scenario'); el.classList.add('sc-ld'); let node = D.start, path = [], mood = 50;
    const render = () => { const n = D.nodes[node]; if(n.end){ el.innerHTML = `<h4>${esc(n.end)}</h4><p>${esc(n.text || '')}</p><p class="sc-meta">YOUR PATH: ${path.map(p=>esc(p)).join(' → ')}</p><button class="sc-opt primary" data-re>Play again</button>`; ld.done(id, {ending:n.end}); return; }
      el.innerHTML = `<p class="sc-meta">${esc(D.who || 'They')} say${D.who ? 's' : ''}</p><h4>${esc(n.say)}</h4><div class="sc-bar" aria-label="How it is going"><i style="transform:scaleX(${mood/100})"></i></div><div style="margin-top:12px">${n.choices.map((ch,j)=>`<button class="sc-opt" data-c="${j}">${esc(ch[0])}</button>`).join('')}</div>`; };
    el.addEventListener('click', e=>{ const b = e.target.closest('[data-c]'); if(b){ const ch = D.nodes[node].choices[+b.dataset.c]; path.push(ch[0]); mood = clamp(mood + (ch[2] || 0)*20, 5, 100); node = ch[1]; render(); const f = $('button', el); if(f) f.focus(); } if(e.target.closest('[data-re]')){ node = D.start; path = []; mood = 50; render(); } }); render(); }, {category:'learning'});

  /* sort: JSON {bins:["A","B"], items:[["label", binIndex]]}. Tap an item then a bin; drag works with a mouse. */
  B('sort', (el, c) => { const D = json(el); if(!D) return; const id = actId(el, 'sort'); el.classList.add('sc-ld'); let pick = null;
    const render = () => { const order = D.items.map((_,i)=>i).sort(()=>Math.random() - .5); el.innerHTML = `<div data-pool style="display:flex;flex-wrap:wrap;gap:8px">${order.map(i=>`<button class="sc-item" data-i="${i}" aria-pressed="false" draggable="true">${esc(D.items[i][0])}</button>`).join('')}</div><div class="sc-bins">${D.bins.map((b,j)=>`<button class="sc-bin" data-b="${j}"><b>${esc(b)}</b></button>`).join('')}</div><button class="sc-opt primary" data-check style="width:auto;display:inline-block">Check</button> <span class="sc-fb" aria-live="polite"></span>`; };
    const place = (ch, bin) => { bin.appendChild(ch); ch.setAttribute('aria-pressed','false'); ch.classList.remove('ok','no'); pick = null; };
    el.addEventListener('click', e=>{ const ch = e.target.closest('.sc-item'), bin = e.target.closest('.sc-bin'); if(ch){ e.stopPropagation(); $$('.sc-item', el).forEach(x=>x.setAttribute('aria-pressed', String(x === ch && pick !== ch))); pick = pick === ch ? null : ch; return; } if(bin && pick){ place(pick, bin); return; }
      if(e.target.closest('[data-check]')){ let ok = 0, placed = 0; $$('.sc-bin', el).forEach(b=>$$('.sc-item', b).forEach(x=>{ placed++; const r = D.items[+x.dataset.i][1] === +b.dataset.b; x.classList.toggle('ok', r); x.classList.toggle('no', !r); if(r) ok++; }));
        $('.sc-fb', el).textContent = placed < D.items.length ? `${D.items.length - placed} still to place · ${ok} of ${placed} right.` : ok === D.items.length ? 'All right. Nicely judged.' : `${ok} of ${D.items.length} right. Move the pink ones and check again.`; if(ok === D.items.length) ld.done(id); } });
    el.addEventListener('dragstart', e=>{ const ch = e.target.closest('.sc-item'); if(ch){ pick = ch; e.dataTransfer.setData('text/plain', ch.dataset.i); } });
    el.addEventListener('dragover', e=>{ if(e.target.closest('.sc-bin')) e.preventDefault(); }); el.addEventListener('drop', e=>{ const bin = e.target.closest('.sc-bin'); if(bin && pick){ e.preventDefault(); place(pick, bin); } }); render(); }, {category:'learning'});

  /* glossary: <p data-scrolly="glossary"><button class="sc-term" data-def="…">term</button></p>; data-goal="3" terms opened completes it */
  B('glossary', (el, c) => { const id = actId(el, 'glossary'), goal = num(el.dataset.goal, 3), seen = new Set(); let pop = null, owner = null;
    const close = () => { if(pop){ pop.remove(); pop = null; owner && owner.setAttribute('aria-expanded','false'); owner = null; } };
    const open = t => { if(owner === t) return; close(); owner = t; pop = document.createElement('div'); pop.className = 'sc-gpop'; pop.id = 'sc-gpop'; pop.setAttribute('role','tooltip'); pop.innerHTML = `<b>${esc(t.textContent)}</b><br>${esc(t.dataset.def || '')}`; document.body.appendChild(pop);
      const r = t.getBoundingClientRect(); pop.style.left = clamp(r.left + scrollX, 16, innerWidth - pop.offsetWidth - 16 + scrollX) + 'px'; pop.style.top = (r.bottom + scrollY + 8) + 'px'; t.setAttribute('aria-expanded','true'); t.setAttribute('aria-describedby','sc-gpop'); seen.add(t.textContent); if(seen.size >= goal) ld.done(id); };
    $$('.sc-term', el).forEach(t=>{ t.setAttribute('aria-expanded','false'); t.addEventListener('mouseenter', ()=>open(t)); t.addEventListener('mouseleave', close); t.addEventListener('focus', ()=>open(t)); t.addEventListener('blur', close); t.addEventListener('click', e=>{ e.preventDefault(); owner === t ? close() : open(t); }); });
    addEventListener('keydown', e=>{ if(e.key === 'Escape') close(); }); }, {category:'learning'});

  /* video-quiz: <div data-scrolly="video-quiz" data-at="2.5"><video src></video><script type=application/json>{q, options, answer, why}</script></div> */
  B('video-quiz', (el, c) => { const v = el.querySelector('video'), Q = json(el), at = num(el.dataset.at, 2), id = actId(el, 'video-quiz'); if(!v || !Q) return; v.muted = true; v.playsInline = true; v.controls = true; let asked = false;
    const ov = document.createElement('div'); ov.className = 'sc-ov'; ov.hidden = true; el.appendChild(ov);
    v.addEventListener('timeupdate', ()=>{ if(!asked && v.currentTime >= at){ asked = true; v.pause(); ov.hidden = false; ov.innerHTML = `<div style="max-width:520px;width:100%"><h4 style="margin:0 0 10px">${esc(Q.q)}</h4>${Q.options.map((o,j)=>`<button class="sc-opt" data-j="${j}">${esc(o)}</button>`).join('')}<p class="sc-fb" aria-live="polite"></p></div>`; $('button', ov).focus(); } });
    v.addEventListener('ended', ()=>{ if(asked) ld.done(id); });
    ov.addEventListener('click', e=>{ const b = e.target.closest('[data-j]'); if(!b) return; if(+b.dataset.j === Q.answer){ $('.sc-fb', ov).innerHTML = `<b>Right.</b> ${esc(Q.why || '')}`; setTimeout(()=>{ ov.hidden = true; v.play().catch(()=>{}); }, c.M ? 1000 : 200); } else { b.disabled = true; $('.sc-fb', ov).innerHTML = '<b>Not quite.</b> Try another answer.'; } }); }, {category:'learning'});

  /* progress: lists every learning activity on the page; remembers completion on this device */
  B('progress', (el, c) => { el.classList.add('sc-ld'); const kinds = ['quiz','flashcards','scenario','sort','glossary','video-quiz'];
    const acts = () => $$(kinds.map(k=>`[data-scrolly="${k}"]`).join(',')).map(a=>({id:a.id || actId(a, a.dataset.scrolly), name:a.dataset.title || a.closest('[data-title]')?.dataset.title || a.dataset.scrolly}));
    const render = () => { const A = acts(), n = A.filter(a=>ld.state[a.id]).length; el.innerHTML = `<h4>${esc(el.dataset.title || 'Your progress')}</h4><ul class="sc-track">${A.map(a=>`<li class="${ld.state[a.id] ? 'done' : ''}"><a href="#${a.id}">${esc(a.name)}</a></li>`).join('')}</ul><div class="sc-bar"><i style="transform:scaleX(${A.length ? n/A.length : 0})"></i></div><p class="sc-meta">${n} of ${A.length} done <button class="sc-opt" data-reset style="display:inline;width:auto;min-height:32px;margin:0 0 0 8px">Reset</button></p>`; };
    document.addEventListener('scrolly:complete', render); el.addEventListener('click', e=>{ if(e.target.closest('[data-reset]')){ ld.state = {}; store.set(pageKey, {}); render(); } }); setTimeout(render, 0); }, {category:'learning'});

  /* certificate: canvas that draws name, date and results; the free tier always carries the Genially Scrolly mark */
  B('certificate', (el, c) => { el.classList.add('sc-ld'); const course = el.dataset.course || document.title;
    el.innerHTML = `<canvas width="1200" height="800" aria-label="Certificate preview"></canvas><label class="sc-meta" for="sc-cert-name">YOUR NAME</label><input id="sc-cert-name" maxlength="40" placeholder="Type your name" autocomplete="name"><button class="sc-opt primary" data-dl>Download certificate</button><p class="sc-fb" aria-live="polite"></p>`;
    const cv = $('canvas', el), x = cv.getContext('2d'), inp = $('input', el); inp.value = store.get('scrolly:name') || '';
    const draw = () => { const n = Object.keys(ld.state).length, name = inp.value.trim() || 'Your name'; x.fillStyle = '#FFFFFF'; x.fillRect(0,0,1200,800); x.fillStyle = css('--sc-accent') || '#6C29FF'; x.fillRect(0,0,1200,18); x.fillRect(0,782,1200,18);
      x.fillStyle = '#121212'; x.font = '600 22px ' + css('--sc-font-mono'); x.fillText(course.toUpperCase().slice(0, 60), 90, 130); x.font = '800 74px ' + css('--sc-font-display'); x.fillText('Certificate', 90, 240); x.fillStyle = css('--sc-accent') || '#6C29FF'; x.fillText('of completion', 90, 325);
      x.fillStyle = '#625E6E'; x.font = '400 28px ' + css('--sc-font-body'); x.fillText('This certifies that', 90, 420); x.fillStyle = '#121212'; let fs = 64; do { x.font = `800 ${fs}px ${css('--sc-font-display')}`; fs -= 4; } while(x.measureText(name).width > 1000 && fs > 28); x.fillText(name, 90, 505);
      x.fillStyle = '#625E6E'; x.font = '400 28px ' + css('--sc-font-body'); x.fillText(`completed ${n} learning ${n === 1 ? 'activity' : 'activities'} · ${new Date().toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'})}`, 90, 570);
      const wm = S.watermarkText(); if(wm){ x.font = '600 20px ' + css('--sc-font-body'); x.fillStyle = '#6C29FF'; x.fillText(wm, 90, 720); } };
    inp.addEventListener('input', ()=>{ store.set('scrolly:name', inp.value); draw(); }); document.addEventListener('scrolly:complete', draw); document.fonts && document.fonts.ready.then(draw); draw();
    $('[data-dl]', el).addEventListener('click', ()=>cv.toBlob(async b=>{ const r = await S.download(b, 'certificate.png'); $('.sc-fb', el).textContent = r === 'declined' ? 'Download cancelled.' : 'Saved.'; }, 'image/png')); }, {category:'learning'});

  /* particles (Three.js, loaded only when near): data-shapes="cloud,sphere,text:PLAY,ring" */
  B('particles', (el, c) => { const cv = document.createElement('canvas'); el.prepend(cv); cv.setAttribute('aria-label', el.dataset.alt || 'Particles forming shapes');
    c.near(el, async ()=>{ let T; try { T = await import(S.libs.three); } catch(e){ el.insertAdjacentHTML('beforeend', '<p style="position:absolute;inset:auto 16px 16px">3D could not start here.</p>'); return; }
      const N = innerWidth < 821 ? 6000 : 11000, r = new T.WebGLRenderer({canvas:cv, antialias:true}); r.setPixelRatio(Math.min(devicePixelRatio, 2)); const scene = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, .1, 100); cam.position.z = 9;
      const shape = name => { const a = new Float32Array(N*3); const [kind, arg] = name.split(':');
        if(kind === 'text'){ const cv2 = document.createElement('canvas'); cv2.width = 400; cv2.height = 200; const x = cv2.getContext('2d'); x.fillStyle = '#fff'; x.font = `900 ${Math.min(130, 520/arg.length)}px ${css('--sc-font-display')}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(arg, 200, 104); const d = x.getImageData(0,0,400,200).data, pts = []; for(let y=0;y<200;y+=2) for(let xx=0;xx<400;xx+=2) if(d[(y*400+xx)*4+3] > 128) pts.push([(xx-200)/40, (100-y)/40]); for(let i=0;i<N;i++){ const p = pts[(Math.random()*pts.length)|0] || [0,0]; a[i*3] = p[0]; a[i*3+1] = p[1]; a[i*3+2] = (Math.random()-.5)*.4; } return a; }
        for(let i=0;i<N;i++){ const j = i*3; if(kind === 'sphere'){ const u = Math.random()*2-1, t = Math.random()*Math.PI*2, R = 2.6; a[j] = R*Math.sqrt(1-u*u)*Math.cos(t); a[j+1] = R*Math.sqrt(1-u*u)*Math.sin(t); a[j+2] = R*u; }
          else if(kind === 'ring'){ const t = Math.random()*Math.PI*2, b = Math.random()*Math.PI*2, tube = .5*Math.sqrt(Math.random()); a[j] = (2.6 + tube*Math.cos(b))*Math.cos(t); a[j+1] = (2.6 + tube*Math.cos(b))*Math.sin(t); a[j+2] = tube*Math.sin(b); }
          else if(kind === 'cube'){ a[j] = (Math.random()-.5)*4; a[j+1] = (Math.random()-.5)*4; a[j+2] = (Math.random()-.5)*4; }
          else { a[j] = (Math.random()-.5)*16; a[j+1] = (Math.random()-.5)*10; a[j+2] = (Math.random()-.5)*10; } } return a; };
      const names = (el.dataset.shapes || 'cloud,sphere,ring').split(','), shapes = names.map(shape), pos = new Float32Array(shapes[0]), col = new Float32Array(N*3), pal = palette().map(h=>new T.Color(h || '#ffffff'));
      for(let i=0;i<N;i++){ const k = pal[i % 3]; col[i*3] = k.r; col[i*3+1] = k.g; col[i*3+2] = k.b; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3)); const pts = new T.Points(g, new T.PointsMaterial({size:.045, vertexColors:true, transparent:true, opacity:.9, blending:T.AdditiveBlending, depthWrite:false})); scene.add(pts);
      const fit = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w/h; cam.updateProjectionMatrix(); }; fit(); c.onWidth(fit); addEventListener('resize', fit);
      let prog = c.M ? 0 : 1; const vis = c.visible(el); const delay = new Float32Array(N).map(()=>Math.random()*.35);
      const draw = t => { const f = prog*(shapes.length - 1), k = Math.min(shapes.length - 2, Math.floor(f)), u = f - k, A = shapes[k], Bb = shapes[k+1] || A; for(let i=0;i<N;i++){ const e = S.util.ease(clamp((u - delay[i]*.6)/.79)), j = i*3; pos[j] = A[j] + (Bb[j]-A[j])*e; pos[j+1] = A[j+1] + (Bb[j+1]-A[j+1])*e; pos[j+2] = A[j+2] + (Bb[j+2]-A[j+2])*e; } g.attributes.position.needsUpdate = true; pts.rotation.y = c.M ? Math.sin(t*.2)*.25 : 0; r.render(scene, cam); };
      if(c.M){ c.ST.create({trigger:el, pin:true, start:'top top', end:'+=' + (names.length*90) + '%', scrub:.6, onUpdate:s=>prog = s.progress}); c.refresh(); gsap.ticker.add(t=>{ if(vis.on) draw(t); }); } draw(0); }); }, {category:'3d'});
})(window.Scrolly);

/* Genially Scrolly · more motion blocks: text, scale & colour, data, timelines, layout, zoom, story */
(function(S){
  const {clamp, num, json, $, $$, ease} = S.util, B = S.block, NS = 'http://www.w3.org/2000/svg';
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const pal = () => ['--sc-accent','--sc-accent-2','--sc-accent-3','--sc-accent-4','--sc-accent-5','--sc-accent-6'].map(css);
  const svgEl = (tag, attrs={}, parent) => { const e = document.createElementNS(NS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e; };
  const pin = (c, el, end, fn, extra={}) => c.ST.create({trigger:el, pin:true, start:'top top', end:'+=' + end, scrub:extra.scrub ?? .6, onUpdate:s=>fn(s.progress), ...extra});
  const splitChars = el => { if(window.SplitText) return SplitText.create(el, {type:'chars,words'}).chars; const t = el.textContent; el.textContent = ''; return [...t].map(ch=>{ const s = document.createElement('span'); s.textContent = ch; s.style.display = 'inline-block'; if(ch === ' ') s.style.width = '.3em'; el.appendChild(s); return s; }); };

  /* ---------- reveal & text ---------- */
  /* assemble: squares fly in from random places and settle into a pixel shape. data-shape rows of 0/1 separated by "|" */
  B('assemble', (el, c) => { const rows = (el.dataset.shape || '00111100|01100110|01100000|01101110|01100110|00111100').split('|'), cols = rows[0].length;
    el.style.display = 'grid'; el.style.gridTemplateColumns = `repeat(${cols},1fr)`; el.style.gap = '6px'; el.style.maxWidth = el.style.maxWidth || '520px'; el.style.marginInline = 'auto';
    el.innerHTML = rows.join('').split('').map(ch=>`<i style="aspect-ratio:1;border-radius:4px;background:${ch === '1' ? 'var(--sc-accent-2)' : 'var(--sc-tint)'}"></i>`).join('');
    if(c.M) gsap.from($$('i', el), {x:()=>gsap.utils.random(-500,500), y:()=>gsap.utils.random(-300,300), rotate:()=>gsap.utils.random(-180,180), scale:()=>gsap.utils.random(.2,1.6), autoAlpha:0, ease:'power2.out', stagger:{each:.01, from:'random'}, scrollTrigger:{trigger:el, start:'top 90%', end:'center 50%', scrub:.6}}); }, {category:'reveal'});
  B('scatter-letters', (el, c) => { if(!c.M) return; const ch = splitChars(el); gsap.from(ch, {x:()=>gsap.utils.random(-400,400), y:()=>gsap.utils.random(-250,250), rotate:()=>gsap.utils.random(-120,120), autoAlpha:0, ease:'power3.out', stagger:{each:.015, from:'random'}, scrollTrigger:{trigger:el, start:'top 90%', end:'center 55%', scrub:.6}}); }, {category:'text'});
  /* text-path: a sentence travels along a wave */
  B('text-path', (el, c) => { const txt = el.textContent.trim(), id = 'scp' + Math.random().toString(36).slice(2,7); el.textContent = '';
    const svg = svgEl('svg', {viewBox:'0 0 1200 260', width:'100%', role:'img', 'aria-label':txt}, el); svgEl('path', {id, d:'M-100 180 C 150 40, 350 40, 600 150 S 1050 260, 1300 90', fill:'none', stroke:'var(--sc-line)', 'stroke-width':2}, svg);
    const t = svgEl('text', {'font-size':54, 'font-weight':800, fill:'var(--sc-ink)', 'font-family':css('--sc-font-display')}, svg), tp = svgEl('textPath', {href:'#' + id, startOffset:c.M ? 1200 : 0}, t); tp.textContent = txt;
    if(c.M){ const o = {v:1200}; gsap.to(o, {v:-1500, ease:'none', onUpdate:()=>tp.setAttribute('startOffset', o.v), scrollTrigger:{trigger:el, start:'top bottom', end:'bottom top', scrub:.4}}); } }, {category:'text'});
  /* odometer: each digit is a reel. data-value="30,000,000" */
  B('odometer', (el, c) => { const v = el.dataset.value || el.textContent.trim(); el.setAttribute('aria-label', v); el.style.cssText += ';display:flex;overflow:hidden;font:900 clamp(48px,10vw,140px)/1 var(--sc-font-display);letter-spacing:-.04em;font-variant-numeric:tabular-nums';
    el.innerHTML = [...v].map(ch=>/\d/.test(ch) ? `<span aria-hidden="true" style="height:1em;overflow:hidden;display:inline-block"><span class="sc-strip" style="display:flex;flex-direction:column">${'01234567890123456789'.split('').map(n=>`<span>${n}</span>`).join('')}</span></span>` : `<span aria-hidden="true">${ch}</span>`).join('');
    const strips = $$('.sc-strip', el), digits = [...v].filter(ch=>/\d/.test(ch)).map(Number);
    if(!c.M){ strips.forEach((s,i)=>s.style.transform = `translateY(${-(10+digits[i])*5}%)`); return; }
    c.ST.create({trigger:el, start:'top 85%', onEnter:()=>strips.forEach((s,i)=>gsap.fromTo(s, {yPercent:0}, {yPercent:-(10+digits[i])*5, duration:1.6 + i*.12, ease:'power3.out', overwrite:true})), onLeaveBack:()=>gsap.set(strips, {yPercent:0})}); }, {category:'text'});
  /* giant-lines: two oversized lines crossing in opposite directions. Children: two elements */
  B('giant-lines', (el, c) => { el.style.overflow = 'hidden'; const [a, b] = [...el.children]; [a, b].forEach(k=>k && (k.style.cssText += ';white-space:nowrap;font:900 clamp(60px,12vw,190px)/1 var(--sc-font-display);letter-spacing:-.05em'));
    if(!c.M) return; gsap.fromTo(a, {xPercent:0}, {xPercent:-40, ease:'none', scrollTrigger:{trigger:el, start:'top bottom', end:'bottom top', scrub:.3}}); if(b) gsap.fromTo(b, {xPercent:-40}, {xPercent:0, ease:'none', scrollTrigger:{trigger:el, start:'top bottom', end:'bottom top', scrub:.3}}); }, {category:'text'});
  /* weight-wave: a band of heavy weight travels through the word (needs a variable display font) */
  B('weight-wave', (el, c) => { const ch = splitChars(el); el.style.fontVariationSettings = 'normal'; if(!c.M) return;
    c.ST.create({trigger:el, start:'top bottom', end:'bottom top', onUpdate:s=>{ const p = s.progress*1.3 - .15; ch.forEach((k,i)=>{ const t = i/Math.max(1, ch.length-1); k.style.fontWeight = Math.round(200 + 700*Math.max(0, 1 - Math.abs(t - p)*4)); }); }}); }, {category:'text'});

  /* ---------- scale & colour ---------- */
  B('shrink', (el, c) => { const m = el.firstElementChild; el.style.cssText += ';height:100svh;position:relative;overflow:hidden'; if(m){ m.style.cssText += ';position:absolute;inset:0;width:100%;height:100%;object-fit:cover'; }
    if(!c.M) return; gsap.timeline({scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=120%', scrub:.6}}).fromTo(m, {clipPath:'inset(0% 0% 0% 0% round 0px)', scale:1.1}, {clipPath:'inset(18% 24% 18% 24% round 36px)', scale:1, ease:'power2.inOut'}); }, {category:'scale'});
  /* colour-journey: a pinned panel travels through colours. data-colors="#bg/#fg/Name, …" */
  B('colour-journey', (el, c) => { const list = (el.dataset.colors || `${css('--sc-accent')}/#fff/One,${css('--sc-accent-2')}/#121212/Two,${css('--sc-accent-3')}/#fff/Three`).split(',').map(x=>x.trim().split('/'));
    el.style.cssText += `;height:100svh;display:grid;place-items:center;text-align:center;background:${list[0][0]};color:${list[0][1]}`; let lab = el.querySelector('b'); if(!lab){ lab = document.createElement('b'); lab.style.font = '800 clamp(48px,10vw,140px)/1 var(--sc-font-display)'; el.prepend(lab); } lab.textContent = list[0][2] || '';
    if(!c.M) return; const tl = gsap.timeline({onUpdate:()=>{ const k = Math.min(list.length-1, Math.floor(tl.time() + .2)); if(lab.dataset.k != k){ lab.dataset.k = k; lab.textContent = list[k][2] || ''; } }, scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=' + (list.length*60) + '%', scrub:.6}});
    const R = v => { const m = /^var\((--[\w-]+)\)$/.exec(String(v).trim()); return m ? css(m[1]) : v; }; list.slice(1).forEach(([bg,fg])=>tl.to({}, {duration:.6}).to(el, {backgroundColor:R(bg), color:R(fg), ease:'power1.inOut', duration:.4})); tl.to({}, {duration:.4}); }, {category:'scale'});
  /* fisheye: list items swell near the middle of the screen */
  B('fisheye', (el, c) => { const items = [...el.children]; items.forEach(k=>{ k.style.transformOrigin = '0 50%'; k.style.transition = 'none'; }); const v = c.visible(el);
    const tick = () => { if(!v.on && c.M) return; const mid = innerHeight/2; items.forEach(k=>{ const r = k.getBoundingClientRect(), d = Math.abs(r.top + r.height/2 - mid)/mid, s = c.M ? 1 + .6*Math.max(0, 1 - d*1.4) : 1; k.style.transform = `scale(${s.toFixed(3)})`; k.style.opacity = c.M ? (.35 + .65*Math.max(0, 1 - d)).toFixed(2) : 1; }); };
    if(c.M) gsap.ticker.add(tick); else tick(); }, {category:'scale'});
  B('hue-shift', (el, c) => { if(c.M) gsap.fromTo(el, {filter:'hue-rotate(0deg) saturate(1)'}, {filter:`hue-rotate(${num(el.dataset.degrees, 320)}deg) saturate(1.6)`, ease:'none', scrollTrigger:{trigger:el, start:'top bottom', end:'bottom top', scrub:.4}}); }, {category:'scale'});
  /* flip-cards: children swing down into place like a split-flap board */
  B('flip-cards', (el, c) => { el.style.perspective = '1000px'; if(!c.M) return; gsap.from([...el.children], {rotateX:-95, transformOrigin:'50% 0', autoAlpha:0, stagger:.12, ease:'back.out(1.4)', scrollTrigger:{trigger:el, start:'top 80%', end:'center 50%', scrub:.6}}); }, {category:'scale'});

  /* ---------- data ---------- */
  /* pictogram: 100 figures; data-value colours that many. data-label, data-icon (emoji/char) */
  B('pictogram', (el, c) => { const n = clamp(num(el.dataset.value, 80), 0, 100), icon = el.dataset.icon || '●'; el.setAttribute('role','img'); el.setAttribute('aria-label', `${n} in 100 ${el.dataset.label || ''}`);
    el.innerHTML = `<p class="sc-meta" style="margin:0 0 10px">${el.dataset.label || ''} <b class="sc-pn" style="font:800 28px var(--sc-font-display);color:var(--sc-ink)">0</b></p><div style="display:grid;grid-template-columns:repeat(20,1fr);gap:4px;font-size:clamp(12px,2.4vw,22px);line-height:1">${Array.from({length:100},()=>`<span style="color:var(--sc-tint-2);text-align:center">${icon}</span>`).join('')}</div>`;
    const ic = $$('div span', el), out = $('.sc-pn', el); const set = p => { const k = Math.round(n*p); ic.forEach((s,i)=>s.style.color = i < k ? css('--sc-accent-2') : ''); out.textContent = k; };
    if(c.M) c.ST.create({trigger:el, start:'top 80%', end:'bottom 50%', scrub:.5, onUpdate:s=>set(s.progress)}); else set(1); }, {category:'data'});
  /* gauge: a needle swings to data-value (0–100) */
  B('gauge', (el, c) => { const v = clamp(num(el.dataset.value, 70), 0, 100), svg = svgEl('svg', {viewBox:'0 0 300 180', width:'100%', role:'img', 'aria-label':`${el.dataset.label || 'Gauge'}: ${v}`}, el), arc = 'M40 150 A110 110 0 0 1 260 150';
    svgEl('path', {d:arc, fill:'none', stroke:'var(--sc-tint-2)', 'stroke-width':22, 'stroke-linecap':'round'}, svg); const fill = svgEl('path', {d:arc, fill:'none', stroke:'var(--sc-accent-2)', 'stroke-width':22, 'stroke-linecap':'round', pathLength:100, 'stroke-dasharray':'0 100'}, svg);
    const needle = svgEl('line', {x1:150, y1:150, x2:150, y2:58, stroke:'var(--sc-ink)', 'stroke-width':5, 'stroke-linecap':'round'}, svg); svgEl('circle', {cx:150, cy:150, r:9, fill:'var(--sc-ink)'}, svg);
    const t = svgEl('text', {x:150, y:128, 'text-anchor':'middle', 'font-size':30, 'font-weight':800, fill:'var(--sc-ink)'}, svg);
    const set = p => { const x = v*p; fill.setAttribute('stroke-dasharray', `${x} 100`); needle.setAttribute('transform', `rotate(${-90 + x*1.8} 150 150)`); t.textContent = Math.round(x) + (el.dataset.suffix || ''); };
    if(c.M) c.ST.create({trigger:el, start:'top 85%', end:'center 50%', scrub:.6, onUpdate:s=>set(s.progress)}); else set(1); }, {category:'data'});
  /* scatter: dots regroup per step: cloud → clusters → ranking. Use inside steps or alone (pinned). data-n="60" */
  B('scatter', (el, c) => { const N = num(el.dataset.n, 60), groups = (el.dataset.groups || 'A,B,C').split(','), cols = pal(); el.style.position = 'relative'; el.style.minHeight = el.style.minHeight || '360px';
    const pts = Array.from({length:N}, (_,i)=>({g:i % groups.length, v:Math.random(), x:Math.random(), y:Math.random()}));
    const dots = pts.map(p=>{ const d = document.createElement('i'); d.style.cssText = `position:absolute;left:0;top:0;width:12px;height:12px;margin:-6px;border-radius:50%;background:${cols[p.g % cols.length]}`; el.appendChild(d); return d; });
    const lay = k => { const W = el.clientWidth, H = el.clientHeight; const order = [...pts.keys()].sort((a,b)=>pts[b].v - pts[a].v);
      dots.forEach((d,i)=>{ const p = pts[i]; let x, y; if(k === 0){ x = p.x*W*.9 + W*.05; y = p.y*H*.9 + H*.05; } else if(k === 1){ const gx = (p.g + .5)/groups.length*W; x = gx + Math.cos(i*2.4)*Math.sqrt(i % 20)*12; y = H/2 + Math.sin(i*2.4)*Math.sqrt(i % 20)*12; } else { const r = order.indexOf(i); x = 20 + (r % 12)*(W - 40)/11; y = 30 + Math.floor(r/12)*(H - 60)/Math.max(1, Math.ceil(N/12) - 1); }
        c.M ? gsap.to(d, {x, y, duration:.9, ease:'power3.inOut', delay:i*.004, overwrite:true}) : gsap.set(d, {x, y}); }); };
    let cur = 0; lay(0); c.onWidth(()=>lay(cur));
    const host = el.closest('[data-scrolly="steps"]'); if(host) host.addEventListener('scrolly:step', e=>{ cur = clamp(e.detail.index, 0, 2); lay(cur); });
    else if(c.M) c.ST.create({trigger:el, start:'top 70%', end:'bottom 30%', onUpdate:s=>{ const k = Math.min(2, Math.floor(s.progress*3)); if(k !== cur){ cur = k; lay(k); } }}); }, {category:'data'});

  /* ---------- timelines ---------- */
  /* progress-line: pinned line fills and lights each node. Children = nodes (label text) */
  B('progress-line', (el, c) => { const items = [...el.children]; el.style.cssText += ';height:100svh;display:grid;align-content:center;position:relative'; const bar = document.createElement('div'); bar.style.cssText = 'position:relative;height:6px;border-radius:3px;background:var(--sc-tint-2);margin:0 8%'; const fill = document.createElement('i'); fill.style.cssText = 'position:absolute;inset:0;background:var(--sc-accent-2);transform-origin:0 50%;transform:scaleX(0);border-radius:3px'; bar.appendChild(fill);
    items.forEach((k,i)=>{ const x = items.length > 1 ? i/(items.length-1)*100 : 50; const n = document.createElement('div'); n.style.cssText = `position:absolute;left:${x}%;top:50%;translate:-50% -50%;width:22px;height:22px;border-radius:50%;background:var(--sc-bg);border:3px solid var(--sc-muted);transition:.3s`; bar.appendChild(n); k.style.cssText += `;position:absolute;left:${x}%;top:22px;translate:-50% 0;width:max-content;max-width:22vw;text-align:center;opacity:.35;transition:opacity .3s`; bar.appendChild(k); k.__n = n; });
    el.appendChild(bar); const set = p => { fill.style.transform = `scaleX(${p})`; items.forEach((k,i)=>{ const on = p >= (items.length > 1 ? i/(items.length-1) : 0) - .001; k.style.opacity = on ? 1 : .35; k.__n.style.background = on ? 'var(--sc-accent-2)' : 'var(--sc-bg)'; k.__n.style.borderColor = on ? 'var(--sc-accent-2)' : ''; }); };
    if(c.M) pin(c, el, '200%', set); else set(1); }, {category:'timeline'});
  /* year-counter: the year stays put (sticky) and rolls to each entry. Children with data-year */
  B('year-counter', (el, c) => { const entries = $$(':scope > [data-year]', el); el.style.cssText += ';display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:24px;align-items:start';
    const y = document.createElement('div'); y.style.cssText = `position:sticky;top:calc(var(--sc-header) + 20vh);font:900 clamp(56px,10vw,150px)/1 var(--sc-font-display);letter-spacing:-.05em;color:var(--sc-accent-2);font-variant-numeric:tabular-nums`; y.textContent = entries[0] ? entries[0].dataset.year : ''; y.setAttribute('aria-hidden','true'); el.prepend(y);
    const col = document.createElement('div'); entries.forEach(k=>{ k.style.minHeight = '60svh'; k.style.display = 'flex'; k.style.alignItems = 'center'; col.appendChild(k); }); el.appendChild(col);
    const io = new IntersectionObserver(es=>es.forEach(e=>{ if(!e.isIntersecting) return; const t = e.target.dataset.year; if(y.textContent === t) return; if(c.M && window.ScrambleTextPlugin) gsap.to(y, {duration:.6, scrambleText:{text:t, chars:'0123456789'}}); else y.textContent = t; }), {rootMargin:'-45% 0px -45% 0px'}); entries.forEach(k=>io.observe(k)); }, {category:'timeline'});
  /* clock: pinned dial; the hand turns, the arc fills, the hour label changes. data-from="8" data-to="23" */
  B('clock', (el, c) => { const from = num(el.dataset.from, 0), to = num(el.dataset.to, 24), notes = json(el) || {}; el.style.cssText += ';height:100svh;display:grid;place-items:center;align-content:center;gap:12px';
    const svg = svgEl('svg', {viewBox:'0 0 300 300', width:'min(70vw,420px)', role:'img', 'aria-label':el.dataset.label || 'Clock'}, el); svgEl('circle', {cx:150, cy:150, r:130, fill:'var(--sc-surface)', stroke:'var(--sc-line)', 'stroke-width':2}, svg);
    for(let h=0;h<12;h++){ const a = h/12*2*Math.PI; svgEl('line', {x1:150 + Math.sin(a)*112, y1:150 - Math.cos(a)*112, x2:150 + Math.sin(a)*124, y2:150 - Math.cos(a)*124, stroke:'var(--sc-muted)', 'stroke-width':3}, svg); }
    const arc = svgEl('circle', {cx:150, cy:150, r:100, fill:'none', stroke:'var(--sc-accent-2)', 'stroke-width':10, pathLength:100, 'stroke-dasharray':'0 100', transform:'rotate(-90 150 150)', opacity:.6}, svg);
    const hand = svgEl('line', {x1:150, y1:150, x2:150, y2:58, stroke:'var(--sc-accent-3)', 'stroke-width':6, 'stroke-linecap':'round'}, svg); svgEl('circle', {cx:150, cy:150, r:8, fill:'var(--sc-ink)'}, svg);
    const t = svgEl('text', {x:150, y:200, 'text-anchor':'middle', 'font-size':34, 'font-weight':800, fill:'var(--sc-ink)'}, svg); const cap = document.createElement('p'); cap.className = 'sc-lede'; cap.style.textAlign = 'center'; cap.setAttribute('aria-live','polite'); el.appendChild(cap);
    const set = p => { const hr = from + (to - from)*p, H = Math.floor(hr); hand.setAttribute('transform', `rotate(${(hr % 12)*30} 150 150)`); arc.setAttribute('stroke-dasharray', `${p*100} 100`); t.textContent = `${String(H % 24).padStart(2,'0')}:${String(Math.floor((hr % 1)*60)).padStart(2,'0')}`; const k = Object.keys(notes).map(Number).filter(x=>x <= H).pop(); cap.textContent = k != null ? notes[k] : ''; };
    if(c.M) pin(c, el, '250%', set); else set(1); }, {category:'timeline'});
  /* road: a winding road with stops; the camera pans along it while it fills. JSON [{title, text, value?}] */
  B('road', (el, c) => { const stops = json(el) || []; el.style.cssText += ';height:100svh;position:relative;overflow:hidden;background:var(--sc-surface)';
    const W = 900, gap = 520, H = 300 + gap*(stops.length - 1), world = document.createElement('div'); world.style.cssText = `position:absolute;left:50%;top:0;width:${W}px;height:${H + 400}px;margin-left:-${W/2}px`; el.appendChild(world);
    const P = stops.map((s,i)=>({x:i % 2 ? W*.72 : W*.28, y:200 + i*gap})); let d = `M${P[0].x} 0 L${P[0].x} ${P[0].y}`; for(let i=1;i<P.length;i++){ const a = P[i-1], b = P[i]; d += ` C${a.x} ${a.y + gap*.5} ${b.x} ${b.y - gap*.5} ${b.x} ${b.y}`; }
    const svg = svgEl('svg', {width:W, height:H + 400, 'aria-hidden':'true'}, world); svg.style.position = 'absolute'; svgEl('path', {d, fill:'none', stroke:'var(--sc-tint-2)', 'stroke-width':34, 'stroke-linecap':'round'}, svg); const road = svgEl('path', {d, fill:'none', stroke:'var(--sc-accent-2)', 'stroke-width':12, 'stroke-linecap':'round'}, svg); const car = svgEl('circle', {r:16, fill:'var(--sc-accent-3)', stroke:'var(--sc-bg)', 'stroke-width':4}, svg);
    const cards = stops.map((s,i)=>{ const k = document.createElement('div'); k.style.cssText = `position:absolute;left:${P[i].x + (i % 2 ? -340 : 40)}px;top:${P[i].y - 70}px;width:300px;background:var(--sc-bg);border-radius:18px;padding:16px;border:1px solid var(--sc-line);opacity:.25;transition:opacity .4s`; k.innerHTML = `<p class="sc-meta" style="margin:0">STOP ${i+1} / ${stops.length}</p><b style="display:block;font:800 22px/1.15 var(--sc-font-display);margin:4px 0">${s.title || ''}</b>${s.value ? `<b style="display:block;font:800 34px var(--sc-font-display);color:var(--sc-accent-2)">${s.value}</b>` : ''}<p style="margin:4px 0 0">${s.text || ''}</p>`; world.appendChild(k); return k; });
    const L = () => road.getTotalLength(), stopAt = P.map(p=>p.y/(H)); const set = p => { const l = L(), pt = road.getPointAtLength(l*p); road.setAttribute('stroke-dasharray', l); road.setAttribute('stroke-dashoffset', l*(1 - p)); car.setAttribute('cx', pt.x); car.setAttribute('cy', pt.y); world.style.transform = `translateY(${-(pt.y - el.clientHeight*.45)}px)`; cards.forEach((k,i)=>k.style.opacity = pt.y >= P[i].y - 40 ? 1 : .25); };
    const scale = () => { const s = Math.min(1, el.clientWidth/(W + 40)); world.style.scale = s; }; scale(); c.onWidth(scale);
    if(c.M) pin(c, el, (stops.length*90) + '%', set, {snap:{snapTo:stopAt, duration:{min:.2, max:.6}, delay:.15}}); else set(1); }, {category:'timeline'});

  /* ---------- layout & zoom ---------- */
  B('opposite-columns', (el, c) => { const [a, b] = [...el.children]; el.style.cssText += ';display:grid;grid-template-columns:1fr 1fr;gap:16px;height:100svh;overflow:hidden;align-items:start'; if(!c.M) return;
    gsap.timeline({scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=150%', scrub:.6}}).fromTo(a, {yPercent:10}, {yPercent:-55, ease:'none'}, 0).fromTo(b, {yPercent:-55}, {yPercent:10, ease:'none'}, 0); }, {category:'layout'});
  /* parallax-gallery: direct children are columns; each moves at data-speed */
  B('parallax-gallery', (el, c) => { const cols = [...el.children]; el.style.cssText += `;display:grid;grid-template-columns:repeat(${cols.length},minmax(0,1fr));gap:12px;overflow:hidden`; cols.forEach((k,i)=>{ k.style.display = 'grid'; k.style.gap = '12px'; if(!c.M) return; const sp = num(k.dataset.speed, [.8,1.25,.95,1.15][i % 4]); gsap.fromTo(k, {y:(sp - 1)*-300}, {y:(sp - 1)*300, ease:'none', scrollTrigger:{trigger:el, start:'top bottom', end:'bottom top', scrub:true}}); }); }, {category:'layout'});
  /* ken-burns: pinned stills that slowly pan, zoom and crossfade. Children: <img> */
  B('ken-burns', (el, c) => { const imgs = $$(':scope > img', el); el.style.cssText += ';height:100svh;position:relative;overflow:hidden;background:#000'; imgs.forEach((im,i)=>{ im.style.cssText += `;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${i ? 0 : 1}`; });
    if(!c.M) return; const tl = gsap.timeline({scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=' + (imgs.length*80) + '%', scrub:.8}}); imgs.forEach((im,i)=>{ tl.fromTo(im, {scale:1.15, xPercent:i % 2 ? 4 : -4}, {scale:1, xPercent:i % 2 ? -4 : 4, ease:'none', duration:1}, i*.8); if(i) tl.to(im, {opacity:1, duration:.25}, i*.8); }); }, {category:'zoom'});

  /* ---------- from the story ---------- */
  /* dot-field: a canvas of dots that parts around the pointer and waves with scroll speed */
  B('dot-field', (el, c) => { const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden','true'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'; el.style.position = 'relative'; el.style.minHeight = el.style.minHeight || '420px'; el.style.overflow = 'hidden'; el.prepend(cv);
    const x = cv.getContext('2d'), dpr = Math.min(devicePixelRatio, 2); let W, H, dots = []; const ink = css('--sc-ink') || '#fff', hot = css('--sc-accent-2') || '#C8FE53';
    const size = () => { W = el.clientWidth; H = el.clientHeight; cv.width = W*dpr; cv.height = H*dpr; dots = []; const g = num(el.dataset.gap, 22); for(let yy=g/2; yy<H; yy+=g) for(let xx=g/2; xx<W; xx+=g) dots.push({x:xx, y:yy, ox:xx, oy:yy}); };
    size(); c.onWidth(size); const p = {x:-999, y:-999}, v = c.visible(el);
    el.addEventListener('pointermove', e=>{ const r = el.getBoundingClientRect(); p.x = e.clientX - r.left; p.y = e.clientY - r.top; }); el.addEventListener('pointerleave', ()=>{ p.x = p.y = -999; });
    const draw = t => { const sp = c.M ? clamp(Math.abs(c.vel)/2500) : 0; x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,W,H); x.globalAlpha = .55;
      dots.forEach(d=>{ const dx = d.x - p.x, dy = d.y - p.y, dist = Math.hypot(dx, dy), push = c.M ? Math.max(0, 1 - dist/110) : 0; d.x += (d.ox + (dx/(dist||1))*push*34 - d.x)*.18; d.y += (d.oy + (dy/(dist||1))*push*34 + Math.sin(d.ox*.03 + t*4)*sp*14 - d.y)*.18; x.fillStyle = push > .05 ? hot : ink; x.beginPath(); x.arc(d.x, d.y, 1.6 + push*3, 0, Math.PI*2); x.fill(); }); };
    if(c.M) gsap.ticker.add(t=>{ if(v.on) draw(t); }); else draw(0); }, {category:'story'});
  /* waffle-steps: 100 dots regroup per step and an icon morphs. JSON [{title, split:[a,b], labels:[..], icon:"svg path d"}] */
  B('waffle-steps', (el, c) => { const D = json(el) || []; el.classList.add('sc-waffle-steps');
    el.insertAdjacentHTML('beforeend', `<div class="sc-wg" aria-hidden="true" style="display:grid;grid-template-columns:repeat(10,1fr);gap:5px;width:min(320px,70vw)">${'<i style="aspect-ratio:1;border-radius:50%;background:var(--sc-tint-2);transition:background-color .5s"></i>'.repeat(100)}</div><div><svg viewBox="0 0 24 24" style="width:72px;height:72px;fill:var(--sc-accent-2)" aria-hidden="true"><path class="sc-wm" d="${(D[0] && D[0].icon) || 'M12 2a10 10 0 1 0 0 20z'}"/></svg><h4 class="sc-wt" style="font:800 28px/1.1 var(--sc-font-display);margin:10px 0 6px" aria-live="polite"></h4><div class="sc-wl" style="display:flex;gap:12px;flex-wrap:wrap;font-size:14px"></div><div class="sc-wb" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px"></div></div>`);
    const dots = $$('.sc-wg i', el), cols = [css('--sc-accent'), css('--sc-accent-2'), css('--sc-accent-3')], btns = $('.sc-wb', el); let cur = -1;
    btns.innerHTML = D.map((d,i)=>`<button class="sc-btn ghost" style="min-height:34px;font-size:13px" data-w="${i}">${d.button || d.title}</button>`).join('');
    const set = s => { if(s === cur || !D[s]) return; cur = s; const d = D[s], split = d.split || []; let acc = 0; const bounds = split.map(v=>acc += v);
      dots.forEach((k,i)=>{ const g = bounds.findIndex(b=>i < b); k.style.background = g < 0 ? '' : cols[g % 3]; k.style.transitionDelay = c.M ? ((i%10)*18 + Math.floor(i/10)*12) + 'ms' : '0ms'; });
      $('.sc-wt', el).textContent = d.title; $('.sc-wl', el).innerHTML = (d.labels || []).map((l,i)=>`<span style="display:inline-flex;gap:6px;align-items:center"><i style="width:10px;height:10px;border-radius:50%;background:${cols[i % 3]}"></i>${l}</span>`).join('');
      $$('[data-w]', btns).forEach(b=>b.setAttribute('aria-pressed', String(+b.dataset.w === s))); if(d.icon){ if(c.M && window.MorphSVGPlugin) gsap.to($('.sc-wm', el), {morphSVG:d.icon, duration:.8, ease:'power2.inOut', overwrite:true}); else $('.sc-wm', el).setAttribute('d', d.icon); } };
    set(0); btns.addEventListener('click', e=>{ const b = e.target.closest('[data-w]'); if(b) set(+b.dataset.w); });
    if(c.M) c.ST.create({trigger:el, pin:true, start:'top 15%', end:'+=' + (D.length*60) + '%', onUpdate:s=>set(Math.min(D.length - 1, Math.floor(s.progress*D.length)))}); }, {category:'story'});
})(window.Scrolly);

/* Genially Scrolly · hover & click, navigation, full-page and browser-native blocks */
(function(S){
  const {clamp, num, json, $, $$} = S.util, B = S.block;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const fine = () => matchMedia('(pointer:fine)').matches;

  /* image-trail: moving across the box spills images. data-images="a.jpg,b.jpg" */
  B('image-trail', (el, c) => { const imgs = (el.dataset.images || '').split(',').map(s=>s.trim()).filter(Boolean); el.style.position = 'relative'; el.style.overflow = 'hidden'; el.style.minHeight = el.style.minHeight || '420px'; if(!imgs.length) return; let lx = -999, ly = -999, k = 0;
    el.addEventListener('pointermove', e=>{ const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if(Math.hypot(x - lx, y - ly) < 70) return; lx = x; ly = y;
      const im = document.createElement('img'); im.src = imgs[k++ % imgs.length]; im.alt = ''; im.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:160px;aspect-ratio:4/3;object-fit:cover;border-radius:12px;translate:-50% -50%;pointer-events:none`; el.appendChild(im);
      if(!c.M){ setTimeout(()=>im.remove(), 900); return; } gsap.timeline({onComplete:()=>im.remove()}).from(im, {scale:.4, rotate:gsap.utils.random(-14,14), duration:.35, ease:'back.out(2)'}).to(im, {autoAlpha:0, scale:.8, y:30, duration:.6, ease:'power2.in'}, '+=.45'); }); }, {category:'hover'});
  /* rolling-links: each link rolls its letters up on hover/focus */
  B('rolling-links', (el, c) => { $$('a', el).forEach(a=>{ const t = a.textContent; a.setAttribute('aria-label', t); a.style.cssText += ';display:inline-block;overflow:hidden;line-height:1.15;vertical-align:bottom;height:1.15em';
    a.innerHTML = `<span aria-hidden="true" style="display:block">${[...t].map(ch=>`<span style="display:inline-block;white-space:pre">${ch}</span>`).join('')}</span><span aria-hidden="true" style="display:block;color:var(--sc-accent-3)">${[...t].map(ch=>`<span style="display:inline-block;white-space:pre">${ch}</span>`).join('')}</span>`;
    if(!c.M) return; const ch = $$('span span', a), tl = gsap.timeline({paused:true}).to(ch, {yPercent:-100, stagger:.015, duration:.3, ease:'power2.inOut'});
    ['pointerenter','focus'].forEach(ev=>a.addEventListener(ev, ()=>tl.play())); ['pointerleave','blur'].forEach(ev=>a.addEventListener(ev, ()=>tl.reverse())); }); }, {category:'hover'});
  /* click-burst: every click throws confetti from the click point */
  B('click-burst', (el, c) => { el.style.position = 'relative'; el.style.overflow = 'hidden'; const cols = [css('--sc-accent'), css('--sc-accent-2'), css('--sc-accent-3'), css('--sc-accent-4')];
    el.addEventListener('click', e=>{ const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; for(let i=0;i<26;i++){ const p = document.createElement('i'); p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:10px;height:10px;border-radius:${i % 3 ? '2px' : '50%'};background:${cols[i % 4]};pointer-events:none`; el.appendChild(p);
      const a = Math.random()*Math.PI*2, d = 60 + Math.random()*180; gsap.to(p, {x:Math.cos(a)*d, y:Math.sin(a)*d + 60, rotate:gsap.utils.random(-360,360), autoAlpha:0, duration:c.M ? gsap.utils.random(.7,1.3) : .01, ease:'power3.out', onComplete:()=>p.remove()}); } }); }, {category:'hover'});
  /* stickers: children can be dragged and flung (Draggable + InertiaPlugin if present) */
  B('stickers', (el, c) => { el.style.position = 'relative'; el.style.minHeight = el.style.minHeight || '420px'; el.style.overflow = 'hidden'; el.style.touchAction = 'pan-y'; const kids = [...el.children];
    kids.forEach((k,i)=>{ k.style.position = 'absolute'; k.style.left = (10 + (i*23) % 70) + '%'; k.style.top = (15 + (i*31) % 60) + '%'; k.style.cursor = 'grab'; k.setAttribute('tabindex','0'); });
    if(window.Draggable){ gsap.registerPlugin(Draggable); let z = 5; Draggable.create(kids, {bounds:el, inertia:!!window.InertiaPlugin, edgeResistance:.7, onPress(){ this.target.style.zIndex = ++z; gsap.to(this.target, {scale:1.08, duration:.2}); }, onRelease(){ gsap.to(this.target, {scale:1, duration:.3}); }}); } }, {category:'hover'});
  /* hover-preview: a list whose rows show a floating picture (data-img on each li) */
  B('hover-preview', (el, c) => { el.style.position = 'relative'; const pv = document.createElement('div'), img = document.createElement('img'); img.alt = ''; pv.style.cssText = 'position:absolute;left:0;top:0;width:220px;aspect-ratio:4/3;border-radius:14px;overflow:hidden;pointer-events:none;opacity:0;transform:scale(.6);z-index:3;translate:-50% -50%'; img.style.cssText = 'width:100%;height:100%;object-fit:cover'; pv.appendChild(img); el.appendChild(pv);
    if(!fine()) return; const x = gsap.quickTo(pv, 'x', {duration:.45, ease:'power3'}), y = gsap.quickTo(pv, 'y', {duration:.45, ease:'power3'});
    el.addEventListener('pointermove', e=>{ const r = el.getBoundingClientRect(); x(e.clientX - r.left); y(e.clientY - r.top); });
    $$('[data-img]', el).forEach(li=>li.addEventListener('pointerenter', ()=>{ img.src = li.dataset.img; gsap.to(pv, {autoAlpha:1, scale:1, duration:.3}); })); el.addEventListener('pointerleave', ()=>gsap.to(pv, {autoAlpha:0, scale:.6, duration:.3})); }, {category:'hover'});
  /* flip-layout: toggles .is-list on the container; every child glides to its new place (Flip) */
  B('flip-layout', (el, c) => { const box = el.querySelector('[data-flip-items]') || el.lastElementChild, bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:6px;margin-bottom:12px'; bar.innerHTML = '<button class="sc-btn ghost" data-v="grid" aria-pressed="true">Grid</button><button class="sc-btn ghost" data-v="list" aria-pressed="false">List</button>'; el.prepend(bar);
    bar.addEventListener('click', e=>{ const b = e.target.closest('[data-v]'); if(!b) return; $$('[data-v]', bar).forEach(o=>o.setAttribute('aria-pressed', String(o === b))); const st = window.Flip ? Flip.getState([...box.children]) : null; box.classList.toggle('is-list', b.dataset.v === 'list'); if(st && c.M) Flip.from(st, {duration:.7, ease:'power3.inOut', stagger:.03}); }); }, {category:'hover'});
  /* cursor-zone: inside it the page cursor grows and shows data-cursor text (needs Scrolly.init({cursor:true})) */
  B('cursor-zone', (el, c) => { el.addEventListener('pointerenter', ()=>{ const cu = $('.sc-cursor'); if(cu){ cu.classList.add('big'); cu.textContent = el.dataset.cursor || ''; cu.style.display = 'grid'; cu.style.placeItems = 'center'; cu.style.font = '700 11px var(--sc-font-body)'; cu.style.color = 'var(--sc-ink)'; } }); el.addEventListener('pointerleave', ()=>{ const cu = $('.sc-cursor'); if(cu){ cu.classList.remove('big'); cu.textContent = ''; } }); }, {category:'hover'});

  /* ---------- navigation ---------- */
  /* header: hides on scroll down, returns on scroll up */
  B('header', (el, c) => { el.style.cssText += ';position:fixed;left:0;right:0;top:0;z-index:70;transition:transform .45s var(--sc-ease)'; const R = document.documentElement.style; let hidden = false;
    const size = () => { R.setProperty('--sc-header', el.offsetHeight + 'px'); R.setProperty('--sc-header-shown', hidden ? '0px' : el.offsetHeight + 'px'); }; size(); if(window.ResizeObserver) new ResizeObserver(size).observe(el);
    let last = scrollY; addEventListener('scroll', ()=>{ const y = scrollY, h = y > last && y > 200; if(h !== hidden){ hidden = h; el.style.transform = h ? 'translateY(-110%)' : ''; size(); } last = y; }, {passive:true}); }, {category:'navigation'});
  /* toc: pills built from every [data-chapter] with the active one highlighted, plus a progress underline */
  B('toc', (el, c) => { const secs = $$('[data-chapter]'); el.style.cssText += ';display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;position:relative;padding-bottom:6px';
    el.innerHTML = secs.map((s,i)=>{ if(!s.id) s.id = 'chapter-' + (i+1); return `<a href="#${s.id}" style="flex:none;font:600 12px var(--sc-font-mono);padding:6px 12px;border-radius:999px;border:1px solid var(--sc-line);color:var(--sc-ink);text-decoration:none">${s.dataset.chapter}</a>`; }).join('') + '<i style="position:absolute;left:0;bottom:0;height:2px;width:100%;background:var(--sc-accent-3);transform-origin:0 50%;transform:scaleX(0)"></i>';
    const pills = $$('a', el), bar = $('i', el); const io = new IntersectionObserver(es=>es.forEach(e=>{ if(!e.isIntersecting) return; const k = secs.indexOf(e.target); pills.forEach((p,j)=>{ p.style.background = j === k ? 'var(--sc-accent-3)' : ''; p.style.color = j === k ? '#fff' : 'var(--sc-ink)'; p.setAttribute('aria-current', String(j === k)); }); const p = pills[k]; if(p) el.scrollTo({left:p.offsetLeft - el.clientWidth/2 + p.offsetWidth/2, behavior:c.M ? 'smooth' : 'auto'}); }), {rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(s=>io.observe(s)); if(c.G) c.ST.create({start:0, end:'max', onUpdate:s=>bar.style.transform = `scaleX(${s.progress})`}); }, {category:'navigation'});
  /* ring: a back-to-top button whose ring fills with page progress */
  B('ring', (el, c) => { el.style.cssText += ';position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:80;width:56px;height:56px;border-radius:50%;border:0;background:var(--sc-ink);color:var(--sc-bg);cursor:pointer;display:grid;place-items:center;padding:0';
    el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Back to top'); el.innerHTML = '<svg viewBox="0 0 56 56" width="56" height="56" style="position:absolute;inset:0;transform:rotate(-90deg)" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="none" stroke="var(--sc-accent-3)" stroke-width="3" stroke-dasharray="163.4" stroke-dashoffset="163.4"/></svg><span aria-hidden="true" style="font-size:20px">↑</span>';
    const circ = $('circle', el); if(c.G) c.ST.create({start:0, end:'max', onUpdate:s=>circ.setAttribute('stroke-dashoffset', (163.4*(1 - s.progress)).toFixed(1))}); el.addEventListener('click', ()=>c.goTo(0, 1.2)); }, {category:'navigation'});
  /* curtain-footer: the page lifts like a curtain to reveal a sticky footer underneath. Put it on the <footer>, after <main> */
  B('curtain-footer', (el, c) => { el.style.cssText += ';position:sticky;bottom:0;z-index:0;min-height:80svh'; const prev = el.previousElementSibling; if(prev){ prev.style.position = 'relative'; prev.style.zIndex = 1; prev.style.background = prev.style.background || 'var(--sc-bg)'; prev.style.borderRadius = prev.style.borderRadius || '0 0 36px 36px'; } }, {category:'navigation'});

  /* ---------- full-page ---------- */
  /* deck: while pinned, each wheel/swipe/arrow key moves exactly one slide. Children = slides */
  B('deck', (el, c) => { const slides = [...el.children]; el.style.cssText += ';height:100svh;position:relative;overflow:hidden'; slides.forEach((s,i)=>{ s.style.cssText += ';position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:20px'; gsap.set(s, {autoAlpha:i ? 0 : 1}); });
    const ui = document.createElement('div'); ui.style.cssText = 'position:absolute;right:12px;top:50%;translate:0 -50%;display:grid;gap:8px;z-index:3'; ui.innerHTML = '<button aria-label="Previous slide" style="width:44px;height:44px;border-radius:50%;border:0;background:rgba(18,18,18,.5);color:#fff">↑</button><button aria-label="Next slide" style="width:44px;height:44px;border-radius:50%;border:0;background:rgba(18,18,18,.5);color:#fff">↓</button>'; el.appendChild(ui);
    const cnt = document.createElement('span'); cnt.className = 'sc-hud'; cnt.style.cssText += ';left:12px;top:12px;right:auto;bottom:auto'; el.appendChild(cnt); let i = 0, anim = false; const lab = () => cnt.textContent = `${i+1} / ${slides.length}`; lab();
    const show = (k, dir) => { if(k === i || k < 0 || k >= slides.length) return false; anim = true; const from = slides[i], to = slides[k]; i = k; lab(); if(!c.M){ gsap.set(from, {autoAlpha:0}); gsap.set(to, {autoAlpha:1}); anim = false; return true; }
      gsap.timeline({onComplete:()=>anim = false}).set(to, {autoAlpha:1, zIndex:2, yPercent:dir*100}).set(from, {zIndex:1}).to(to, {yPercent:0, duration:.9, ease:'expo.inOut'}).to(from, {yPercent:-dir*30, duration:.9, ease:'expo.inOut'}, 0).set(from, {autoAlpha:0, yPercent:0}); return true; };
    const [up, down] = $$('button', ui); up.addEventListener('click', ()=>!anim && show(i-1, -1)); down.addEventListener('click', ()=>!anim && show(i+1, 1));
    if(!c.M || !window.Observer) return; gsap.registerPlugin(Observer); let st, saved = 0, lastUser = 0; const restore = () => scrollTo(0, saved);
    ['wheel','touchmove','keydown'].forEach(ev=>addEventListener(ev, ()=>{ lastUser = performance.now(); }, {passive:true, capture:true}));
    const intent = Observer.create({target:window, type:'wheel,touch', wheelSpeed:-1, tolerance:12, preventDefault:true, onUp:()=>{ if(anim) return; if(!show(i+1, 1) && i === slides.length-1) release(1); }, onDown:()=>{ if(anim) return; if(!show(i-1, -1) && i === 0) release(-1); },
      onEnable(){ saved = st && st.direction < 0 ? st.end - 2 : (st ? st.start + 2 : scrollY); if(c.lenis) c.lenis.stop(); scrollTo(0, saved); addEventListener('scroll', restore, {passive:true}); }, onDisable(){ removeEventListener('scroll', restore); if(c.lenis) c.lenis.start(); }}); intent.disable();
    const release = d => { intent.disable(); c.goTo(d > 0 ? st.end + 4 : st.start - 4); };
    addEventListener('keydown', e=>{ if(!intent.isEnabled) return; if(['ArrowDown','PageDown',' '].includes(e.key)){ e.preventDefault(); if(!anim && !show(i+1, 1)) release(1); } if(['ArrowUp','PageUp'].includes(e.key)){ e.preventDefault(); if(!anim && !show(i-1, -1)) release(-1); } if(e.key === 'Escape') release(1); });
    const maybe = () => { if(performance.now() - lastUser < 500) intent.enable(); }; st = c.ST.create({trigger:el, pin:true, start:'top top', end:'+=120', onEnter:maybe, onEnterBack:maybe}); }, {category:'full-page'});

  /* ---------- browser-native ---------- */
  /* css-scroll: scroll-driven animations with no JavaScript. Add a class to children: sc-css-rise | sc-css-clip | sc-css-hue | sc-css-parallax; sc-css-progress on a bar inside a scroll box */
  B('css-scroll', (el, c) => { if(!CSS.supports('animation-timeline: view()')) el.classList.add('sc-css-off'); }, {category:'css'});
  /* vt-cards: cards that morph into a detail view with the View Transitions API. Children: <article data-title data-text><img></article> */
  B('vt-cards', (el, c) => { const items = [...el.children].map(k=>({img:(k.querySelector('img') || {}).src || '', alt:(k.querySelector('img') || {}).alt || '', title:k.dataset.title || k.textContent.trim(), text:k.dataset.text || ''})); let last = null;
    const grid = () => `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:12px">${items.map((it,i)=>`<button data-i="${i}" style="border:0;border-radius:16px;padding:0;overflow:hidden;background:var(--sc-surface);color:var(--sc-ink);text-align:left;cursor:pointer"><img src="${it.img}" alt="" style="width:100%;aspect-ratio:16/10;object-fit:cover;display:block;view-transition-name:${i === last ? 'sc-vt-img' : 'none'}"><b style="display:block;padding:10px 12px;view-transition-name:${i === last ? 'sc-vt-t' : 'none'}">${it.title}</b></button>`).join('')}</div>`;
    const detail = i => `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:16px;align-items:center"><img src="${items[i].img}" alt="${items[i].alt}" style="width:100%;border-radius:18px;aspect-ratio:16/10;object-fit:cover;view-transition-name:sc-vt-img"><div><h4 style="margin:0 0 8px;font:800 32px/1 var(--sc-font-display);view-transition-name:sc-vt-t">${items[i].title}</h4><p>${items[i].text}</p><button class="sc-btn" data-back>← Back</button></div></div>`;
    const swap = (html, prep) => { if(prep) prep(); const go = () => { el.innerHTML = html; }; if(document.startViewTransition && c.M) document.startViewTransition(go); else go(); };
    el.innerHTML = grid(); el.addEventListener('click', e=>{ const b = e.target.closest('[data-i]'); if(b){ last = +b.dataset.i; swap(detail(last), ()=>{ b.querySelector('img').style.viewTransitionName = 'sc-vt-img'; b.querySelector('b').style.viewTransitionName = 'sc-vt-t'; }); } if(e.target.closest('[data-back]')) swap(grid()); }); }, {category:'css'});
  /* video-cards: preview clips that play while seen and link somewhere (data-href on each <a>) */
  B('video-cards', (el, c) => { $$('video', el).forEach(v=>{ v.muted = true; v.loop = true; v.playsInline = true; }); const io = new IntersectionObserver(es=>es.forEach(e=>{ const v = e.target; e.isIntersecting && c.M ? v.play().catch(()=>{}) : v.pause(); }), {threshold:.4}); $$('video', el).forEach(v=>io.observe(v)); }, {category:'media'});
})(window.Scrolly);

/* Genially Scrolly · D3 data-viz types for the chart block (D3 loads only when needed).
   <div data-scrolly="chart"><script type="application/json">{"type":"treemap", …}</script></div>
   Types: treemap pack sunburst stream slope dumbbell lollipop waterfall radial multiples annotated network heatmap beeswarm ridgeline radar gantt morph globe map-flight */
(function(S){
  const {clamp, num, json, $, $$} = S.util;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const PAL = () => ['--sc-accent','--sc-accent-2','--sc-accent-3','--sc-accent-4','--sc-accent-5','--sc-accent-6'].map(css);
  const esc = s => String(s).replace(/[&<>"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const me = document.currentScript; S.base = S.base || (me && me.src ? me.src.replace(/[^/]*$/, '') : '');
  S.libs.topojson = 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js';
  const d3ready = () => window.d3 ? Promise.resolve(window.d3) : S.load(S.libs.d3).then(()=>window.d3);

  const TYPES = {};
  const header = (el, D, names, colors) => { el.insertAdjacentHTML('beforeend', `<h4 class="sc-ch-h">${esc(D.title || '')}</h4><div class="sc-ch-sub">${D.source === 'real' ? '<span class="sc-chip real">real data</span>' : D.source === 'sample' ? '<span class="sc-chip sample">sample data</span>' : ''}<span>${esc(D.note || '')}</span></div>${names && names.length > 1 ? `<div class="sc-legend">${names.map((n,i)=>`<span style="--c:${colors[i]}">${esc(n)}</span>`).join('')}</div>` : ''}`); };
  const table = (el, rows) => { if(!rows || rows.length < 2) return; el.insertAdjacentHTML('beforeend', `<details><summary>Show as a table</summary><table><thead><tr>${rows[0].map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${r.map(v=>`<td>${typeof v === 'number' ? v.toLocaleString('en') : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></details>`); };

  function render(el, c, D){ S.util.tipInit && S.util.tipInit(); const pal = PAL(), d3 = window.d3, T = TYPES[D.type]; const series = (D.series || []).map((s,i)=>({...s, color:s.color || pal[i % pal.length]}));
    const legendNames = T.legend ? T.legend(D, series) : null; header(el, D, legendNames && legendNames.map(x=>x[0]), legendNames && legendNames.map(x=>x[1]));
    const svg = d3.select(el).append('svg').attr('role','img').attr('aria-label', D.alt || D.title || D.type); table(el, T.table ? T.table(D, series) : null);
    let sts = [], w0 = 0; const k = d3.format('.3~s'), fmt = d3.format(','), pct = d3.format('.0%'), INK = css('--sc-ink'), MUTED = css('--sc-muted'), GRID = css('--sc-line'), BG = css('--sc-bg');
    const anim = (tl, o={}) => { if(!c.M){ tl.progress(1); tl.pause(); return; } const s = c.ST.create({trigger:o.pin ? el : svg.node(), start:o.pin ? 'top top' : (o.start || 'top 85%'), end:o.end || (o.pin ? '+=180%' : 'center 50%'), scrub:o.scrub ?? .6, pin:!!o.pin, animation:tl}); sts.push(s); return s; };
    const build = () => { const W = Math.max(300, Math.round(el.clientWidth - 4)); if(Math.abs(W - w0) < 40) return; w0 = W; sts.forEach(s=>{ s.animation && s.animation.kill(); s.kill(); }); sts = []; svg.selectAll('*').remove();
      const H = Math.round(T.height ? T.height(W, D, series) : clamp(W*.55, 280, 460)); svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);
      T.draw({svg, W, H, sm:W < 560, D, series, d3, anim, k, fmt, pct, INK, MUTED, GRID, BG, pal, c, el}); };
    build(); if(!T.once) c.onWidth(()=>{ build(); }); c.refresh(); }

  const rowsOf = D => D.items || (D.labels || []).map((l,i)=>[l, D.series[0].values[i]]);
  /* readable text on a filled shape (WCAG relative luminance) */
  const onColor = c => { const k = window.d3 && d3.color(String(c).trim()); if(!k) return '#fff'; const {r, g, b} = k.rgb(), L = v => { v /= 255; return v <= .03928 ? v/12.92 : ((v + .055)/1.055) ** 2.4; }; return .2126*L(r) + .7152*L(g) + .0722*L(b) > .4 ? '#121212' : '#fff'; };
  S.util.onColor = onColor;
  const colorItem = (D, pal, i, name) => (D.colors && (D.colors[name] || D.colors[i])) || pal[i % pal.length];
  const txt = (sel, s) => sel.attr('fill', css('--sc-ink')).text(s);

  TYPES.treemap = { height:W=>clamp(W*.6, 280, 480), table:D=>[['Item','Value'], ...rowsOf(D)],
    draw({svg, W, H, D, d3, anim, k, fmt, pal, BG}){ const R = rowsOf(D), tot = d3.sum(R, r=>r[1]); const root = d3.hierarchy({children:R.map(([n,v],i)=>({n, v, i}))}).sum(d=>d.v).sort((a,b)=>b.value - a.value); d3.treemap().size([W,H]).paddingInner(2).round(true)(root);
      const g = svg.selectAll('g').data(root.leaves()).join('g').attr('transform', d=>`translate(${d.x0},${d.y0})`); g.append('rect').attr('width', d=>d.x1-d.x0).attr('height', d=>d.y1-d.y0).attr('rx',4).attr('fill', d=>colorItem(D, pal, d.data.i, d.data.n)).attr('data-tip', d=>`<b>${esc(d.data.n)}</b>${fmt(d.value)} · ${Math.round(d.value/tot*100)}%`);
      g.filter(d=>d.x1-d.x0 > 90 && d.y1-d.y0 > 40).append('text').attr('x',10).attr('y',22).attr('font-size',13).attr('font-weight',700).attr('fill', d=>onColor(colorItem(D, pal, d.data.i, d.data.n))).attr('pointer-events','none').text(d=>`${d.data.n} · ${k(d.value)}`);
      anim(gsap.timeline().from(g.nodes(), {scale:0, transformOrigin:'0 0', opacity:0, stagger:.08, ease:'power2.out'})); } };
  TYPES.pack = { height:W=>clamp(W*.62, 300, 500), table:D=>[['Item','Value'], ...rowsOf(D)],
    draw({svg, W, H, D, d3, anim, fmt, pal, BG}){ const R = rowsOf(D); const root = d3.hierarchy({children:R.map(([n,v],i)=>({n, v, i}))}).sum(d=>d.v); d3.pack().size([W,H]).padding(5)(root);
      const g = svg.selectAll('g').data(root.leaves()).join('g').attr('transform', d=>`translate(${d.x},${d.y})`); g.append('circle').attr('r', d=>d.r).attr('fill', d=>colorItem(D, pal, d.data.i, d.data.n)).attr('stroke', BG).attr('stroke-width',2).attr('data-tip', d=>`<b>${esc(d.data.n)}</b>${fmt(d.value)}`);
      g.filter(d=>d.r > 34).append('text').attr('text-anchor','middle').attr('dy','.35em').attr('font-size', d=>Math.min(14, d.r/4.4)).attr('font-weight',700).attr('fill', d=>onColor(colorItem(D, pal, d.data.i, d.data.n))).attr('pointer-events','none').text(d=>d.data.n.split(' ')[0]);
      anim(gsap.timeline().from(g.nodes(), {scale:0, transformOrigin:'50% 50%', stagger:.07, ease:'back.out(1.8)'})); } };
  TYPES.sunburst = { height:W=>clamp(W*.7, 300, 520), table:(D,s)=>[['Series', ...D.labels], ...s.map(x=>[x.name, ...x.values])],
    draw({svg, W, H, D, series, d3, anim, k, fmt, INK, MUTED}){ const R = Math.min(W, H)/2 - 6; const root = d3.hierarchy({children:series.map(s=>({n:s.name, color:s.color, children:s.values.map((v,i)=>({n:D.labels[i], v, p:s.name, color:s.color, j:i}))}))}).sum(d=>d.v || 0).sort((a,b)=>b.value - a.value); d3.partition().size([2*Math.PI, R])(root);
      const nodes = root.descendants().filter(d=>d.depth), arc = d3.arc().startAngle(d=>d.x0).endAngle(d=>d.x1).innerRadius(d=>d.depth === 1 ? R*.32 : R*.66).outerRadius(d=>d.depth === 1 ? R*.64 : R).padAngle(.006).cornerRadius(3), g = svg.append('g').attr('transform', `translate(${W/2},${H/2})`);
      const paths = g.selectAll('path').data(nodes).join('path').attr('fill', d=>d.data.color).attr('fill-opacity', d=>d.depth === 1 ? 1 : .5 + (d.data.j || 0)*.1).attr('data-tip', d=>d.depth === 1 ? `<b>${esc(d.data.n)}</b>${fmt(d.value)}` : `<b>${esc(d.data.p)} · ${esc(d.data.n)}</b>${fmt(d.value)}`);
      g.append('text').attr('text-anchor','middle').attr('dy','-.1em').attr('font-size',26).attr('font-weight',800).attr('fill',INK).text(D.center || k(root.value)); g.append('text').attr('text-anchor','middle').attr('dy','1.4em').attr('font-size',12).attr('fill',MUTED).text(D.centerLabel || '');
      const o = {p:0}, draw = () => paths.attr('d', d=>{ const th = 2*Math.PI*(d.depth === 1 ? clamp(o.p*1.6) : clamp(o.p*1.6 - .6)); return th <= d.x0 ? null : arc({...d, x1:Math.min(d.x1, th)}); }); draw(); anim(gsap.timeline().to(o, {p:1, ease:'none', onUpdate:draw}), {end:'bottom 45%'}); } };
  TYPES.stream = { legend:(D,s)=>s.map(x=>[x.name, x.color]), height:W=>clamp(W*.5, 260, 380), table:(D,s)=>[['', ...s.map(x=>x.name)], ...D.labels.map((l,i)=>[l, ...s.map(x=>x.values[i])])],
    draw({svg, W, H, D, series, d3, anim, k, BG}){ const rows = D.labels.map((q,i)=>Object.fromEntries([['q',q], ...series.map(s=>[s.name, s.values[i]])])), keys = series.map(s=>s.name), col = Object.fromEntries(series.map(s=>[s.name, s.color]));
      const st = d3.stack().keys(keys).offset(d3.stackOffsetWiggle).order(d3.stackOrderInsideOut)(rows), x = d3.scalePoint(D.labels, [20, W-20]), y = d3.scaleLinear([d3.min(st, s=>d3.min(s, d=>d[0])), d3.max(st, s=>d3.max(s, d=>d[1]))], [H-30, 6]);
      const id = 'sc' + Math.random().toString(36).slice(2,7), cr = svg.append('clipPath').attr('id', id).append('rect').attr('height', H).attr('width', 0);
      svg.append('g').attr('clip-path', `url(#${id})`).selectAll('path').data(st).join('path').attr('fill', d=>col[d.key]).attr('stroke', BG).attr('stroke-width',1.5).attr('d', d3.area().x(d=>x(d.data.q)).y0(d=>y(d[0])).y1(d=>y(d[1])).curve(d3.curveBasis)).attr('data-tip', d=>`<b>${esc(d.key)}</b>${d.map((p,i)=>`${esc(D.labels[i])}: ${k(p.data[d.key])}`).join('<br>')}`);
      svg.append('g').selectAll('text').data(D.labels).join('text').attr('class','ax').attr('x', d=>x(d)).attr('y', H-8).attr('text-anchor', (d,i)=>i === 0 ? 'start' : i === D.labels.length-1 ? 'end' : 'middle').text(d=>d);
      anim(gsap.timeline().to(cr.node(), {attr:{width:W}, ease:'none'}), {end:'bottom 50%'}); } };
  TYPES.slope = { height:W=>clamp(W*.62, 320, 460), table:(D,s)=>{ const a = D.from ?? 0, b = D.to ?? D.labels.length-1; return [['', D.labels[a], D.labels[b]], ...s.map(x=>[x.name, x.values[a], x.values[b]])]; },
    draw({svg, W, H, sm, D, series, d3, anim, k, pct, BG, GRID, INK}){ const a = D.from ?? 0, b = D.to ?? D.labels.length-1, L = sm ? 64 : 110, Rr = W - (sm ? 128 : 190), all = series.flatMap(s=>[s.values[a], s.values[b]]), y = (D.log ? d3.scaleLog : d3.scaleLinear)([D.log ? d3.min(all)*.8 : 0, d3.max(all)*1.1], [H-24, 24]);
      [[L, D.labels[a]], [Rr, D.labels[b]]].forEach(([x,t])=>{ svg.append('line').attr('x1',x).attr('x2',x).attr('y1',18).attr('y2',H-18).attr('stroke',GRID); svg.append('text').attr('class','ax').attr('x',x).attr('y',10).attr('text-anchor','middle').text(t); });
      const de = arr => { arr.sort((p,q)=>p.y - q.y); for(let i=1;i<arr.length;i++) if(arr[i].y - arr[i-1].y < 16) arr[i].y = arr[i-1].y + 16; return arr; };
      const lines = svg.append('g').selectAll('line').data(series).join('line').attr('x1',L).attr('x2',Rr).attr('y1',d=>y(d.values[a])).attr('y2',d=>y(d.values[b])).attr('stroke',d=>d.color).attr('stroke-width',2.5).attr('stroke-linecap','round');
      const dots = svg.append('g').selectAll('circle').data(series.flatMap(s=>[[s,L,s.values[a],D.labels[a]],[s,Rr,s.values[b],D.labels[b]]])).join('circle').attr('cx',d=>d[1]).attr('cy',d=>y(d[2])).attr('r',5).attr('fill',d=>d[0].color).attr('stroke',BG).attr('stroke-width',2).attr('data-tip',d=>`<b>${esc(d[0].name)}</b>${esc(d[3])}: ${d[2].toLocaleString('en')}`);
      const lab = svg.append('g').selectAll('text').data(de(series.map(s=>({s, y:y(s.values[b])})))).join('text').attr('x',Rr + 10).attr('y',d=>d.y + 4).attr('font-size',12).attr('fill',INK).text(d=>`${sm ? d.s.name.split(' ')[0] : d.s.name} ${k(d.s.values[b])} (${d.s.values[a] ? pct(d.s.values[b]/d.s.values[a] - 1) : ''})`);
      const len = Math.hypot(Rr - L, H); lines.attr('stroke-dasharray', len).attr('stroke-dashoffset', len);
      anim(gsap.timeline().to(lines.nodes(), {attr:{'stroke-dashoffset':0}, stagger:.1, ease:'none'}).from(dots.nodes(), {attr:{r:0}, stagger:.04}, 0).from(lab.nodes(), {opacity:0, x:-8, stagger:.04}, .4)); } };
  TYPES.dumbbell = { height:(W,D,s)=>s.length*44 + 40, table:(D,s)=>{ const a = D.from ?? 0, b = D.to ?? D.labels.length-1; return [['', D.labels[a], D.labels[b]], ...s.map(x=>[x.name, x.values[a], x.values[b]])]; },
    draw({svg, W, H, sm, D, series, d3, anim, k, pct, BG, GRID, INK, MUTED}){ const a = D.from ?? 0, b = D.to ?? D.labels.length-1, L = sm ? 96 : 150, x = d3.scaleLinear([0, d3.max(series.flatMap(s=>[s.values[a], s.values[b]]))*1.08], [L, W - 50]);
      x.ticks(4).forEach(t=>{ svg.append('line').attr('x1',x(t)).attr('x2',x(t)).attr('y1',8).attr('y2',H-22).attr('stroke',GRID); svg.append('text').attr('class','ax').attr('x',x(t)).attr('y',H-6).attr('text-anchor','middle').text(k(t)); });
      const g = svg.selectAll('g.r').data(series).join('g').attr('class','r').attr('transform',(d,i)=>`translate(0,${24 + i*44})`); g.append('text').attr('x',L-12).attr('y',4).attr('text-anchor','end').attr('font-size',12.5).attr('fill',INK).text(d=>sm ? d.name.split(' ')[0] : d.name);
      const bars = g.append('line').attr('x1',d=>x(d.values[a])).attr('x2',d=>x(d.values[a])).attr('stroke',d=>d.color).attr('stroke-opacity',.5).attr('stroke-width',6).attr('stroke-linecap','round');
      g.append('circle').attr('cx',d=>x(d.values[a])).attr('r',7).attr('fill','none').attr('stroke',d=>d.color).attr('stroke-width',2.5).attr('data-tip',d=>`<b>${esc(d.name)}</b>${esc(D.labels[a])}: ${d.values[a].toLocaleString('en')}`);
      const ends = g.append('circle').attr('cx',d=>x(d.values[a])).attr('r',7).attr('fill',d=>d.color).attr('stroke',BG).attr('stroke-width',2).attr('data-tip',d=>`<b>${esc(d.name)}</b>${esc(D.labels[b])}: ${d.values[b].toLocaleString('en')}`);
      const lab = g.append('text').attr('y',4).attr('font-size',12).attr('fill',MUTED).attr('opacity',0).text(d=>d.values[a] ? pct(d.values[b]/d.values[a] - 1) : ''); lab.attr('text-anchor', 'start').attr('x', d=>Math.max(x(d.values[a]), x(d.values[b])) + 14);
      const tl = gsap.timeline(); ends.nodes().forEach((n,i)=>{ const d = series[i]; tl.to(n, {attr:{cx:x(d.values[b])}, ease:'power2.inOut'}, i*.08).to(bars.nodes()[i], {attr:{x2:x(d.values[b])}, ease:'power2.inOut'}, i*.08).to(lab.nodes()[i], {opacity:1, duration:.3}, i*.08 + .7); }); anim(tl); } };
  TYPES.lollipop = { height:(W,D)=>rowsOf(D).length*34 + 20, table:D=>[['Item','Value'], ...rowsOf(D)],
    draw({svg, W, H, sm, D, d3, anim, k, pal, INK, MUTED}){ const R = rowsOf(D).slice().sort((p,q)=>q[1] - p[1]), L = sm ? 118 : 160, x = d3.scaleLinear([0, d3.max(R, r=>r[1])*1.05], [L, W - 56]);
      const g = svg.selectAll('g').data(R).join('g').attr('transform',(d,i)=>`translate(0,${18 + i*34})`); g.append('text').attr('x',L-12).attr('y',4).attr('text-anchor','end').attr('font-size',12.5).attr('fill',INK).text(d=>d[0]);
      const stems = g.append('line').attr('x1',L).attr('x2',d=>x(d[1])).attr('stroke',(d,i)=>colorItem(D, pal, i, d[0])).attr('stroke-width',2);
      const heads = g.append('circle').attr('cx',d=>x(d[1])).attr('r',7).attr('fill',(d,i)=>colorItem(D, pal, i, d[0])).attr('data-tip',d=>`<b>${esc(d[0])}</b>${d[1].toLocaleString('en')}`); const vals = g.append('text').attr('x',d=>x(d[1]) + 12).attr('y',4).attr('font-size',12).attr('fill',MUTED).text(d=>k(d[1]));
      anim(gsap.timeline().from(stems.nodes(), {attr:{x2:L}, stagger:.06, ease:'power2.out'}).from(heads.nodes(), {attr:{r:0, cx:L}, stagger:.06, ease:'power2.out'}, 0).from(vals.nodes(), {opacity:0, stagger:.06}, .4)); } };
  TYPES.waterfall = { height:W=>clamp(W*.5, 300, 380), table:(D,s)=>[['', s[0].name], ...D.labels.map((l,i)=>[l, s[0].values[i]])],
    draw({svg, W, H, sm, D, series, d3, anim, k, fmt, GRID, MUTED, INK}){ const v = series[0].values, steps = v.map((x,i)=>({l:D.labels[i], s:i ? v[i-1] : 0, e:x, t:i ? (x >= v[i-1] ? 'up' : 'down') : 'start'}));
      const xb = d3.scaleBand(D.labels, [44, W-8]).padding(.25), y = d3.scaleLinear([0, d3.max(v)*1.1], [H-26, 10]); y.ticks(4).forEach(t=>{ svg.append('line').attr('x1',44).attr('x2',W-8).attr('y1',y(t)).attr('y2',y(t)).attr('stroke',GRID); svg.append('text').attr('class','ax').attr('x',38).attr('y',y(t)+4).attr('text-anchor','end').text(k(t)); });
      const col = t => t === 'start' ? css('--sc-accent') : t === 'up' ? css('--sc-accent-2') : css('--sc-accent-3');
      const bars = svg.selectAll('rect.b').data(steps).join('rect').attr('class','b').attr('x',d=>xb(d.l)).attr('width',xb.bandwidth()).attr('rx',3).attr('fill',d=>col(d.t)).attr('y',d=>y(Math.max(d.s, d.e))).attr('height',d=>Math.max(2, Math.abs(y(d.s) - y(d.e)))).attr('data-tip',d=>`<b>${esc(d.l)}</b>${fmt(d.e)}${d.t === 'start' ? '' : ` (${d.e - d.s > 0 ? '+' : ''}${fmt(d.e - d.s)})`}`);
      svg.selectAll('text.l').data(steps).join('text').attr('class','ax').attr('x',d=>xb(d.l) + xb.bandwidth()/2).attr('y',H-8).attr('text-anchor','middle').text((d,i)=>sm && i % 2 ? '' : d.l);
      anim(gsap.timeline().from(bars.nodes(), {opacity:0, y:-20, stagger:.08, ease:'power2.out'})); } };
  TYPES.radial = { height:W=>clamp(W*.7, 300, 480), table:(D,s)=>[['', s[0].name], ...D.labels.map((l,i)=>[l, s[0].values[i]])],
    draw({svg, W, H, D, series, d3, anim, k, fmt, GRID, INK, pal}){ const v = series[0].values, R = Math.min(W, H)/2 - 30, r0 = R*.32, g = svg.append('g').attr('transform', `translate(${W/2},${H/2})`), a = d3.scaleBand(D.labels, [0, 2*Math.PI]).padding(.12), r = d3.scaleRadial([0, d3.max(v)*1.05], [r0, R]);
      r.ticks(3).forEach(t=>{ g.append('circle').attr('r', r(t)).attr('fill','none').attr('stroke',GRID); g.append('text').attr('class','ax').attr('y', -r(t) - 3).attr('text-anchor','middle').text(k(t)); });
      const arc = d3.arc().innerRadius(r0).startAngle(d=>a(d[0])).endAngle(d=>a(d[0]) + a.bandwidth()).padAngle(.01).cornerRadius(3), mx = d3.max(v), mn = d3.min(v), rows = D.labels.map((l,i)=>[l, v[i]]);
      const ps = g.selectAll('path').data(rows).join('path').attr('fill',d=>d[1] === mx ? pal[1] : d[1] === mn ? pal[2] : pal[0]).attr('data-tip',d=>`<b>${esc(d[0])}</b>${fmt(d[1])}`);
      const o = {p:0}, draw = () => ps.attr('d', (d,i)=>arc.outerRadius(r0 + (r(d[1]) - r0)*clamp(o.p*1.6 - i*.05))(d)); draw();
      g.selectAll('text.w').data(D.labels).join('text').attr('class','ax').attr('text-anchor','middle').attr('transform', d=>{ const an = a(d) + a.bandwidth()/2 - Math.PI/2; return `translate(${Math.cos(an)*(R+16)},${Math.sin(an)*(R+16) + 4})`; }).text(d=>d);
      anim(gsap.timeline().to(o, {p:1, ease:'none', onUpdate:draw}), {end:'bottom 50%'}); } };
  TYPES.multiples = { height:(W,D,s)=>{ const cols = W < 560 ? 2 : 3; return Math.ceil(s.length/cols)*160; }, table:(D,s)=>[['', ...D.labels], ...s.map(x=>[x.name, ...x.values])],
    draw({svg, W, H, sm, D, series, d3, anim, k, fmt, INK, MUTED}){ const cols = sm ? 2 : 3, cw = W/cols, chh = 160, lines = [];
      series.forEach((s,i)=>{ const g = svg.append('g').attr('transform', `translate(${(i%cols)*cw},${Math.floor(i/cols)*chh})`); g.append('rect').attr('x',4).attr('y',4).attr('width',cw-8).attr('height',chh-8).attr('rx',14).attr('fill',css('--sc-surface-2'));
        g.append('text').attr('x',18).attr('y',28).attr('font-size',13).attr('font-weight',700).attr('fill',INK).text(s.name); const x = d3.scalePoint(D.labels, [22, cw-26]), y = d3.scaleLinear([0, d3.max(s.values)], [chh-30, 46]);
        const p = g.append('path').attr('d', d3.line().x((d,j)=>x(D.labels[j])).y(d=>y(d)).curve(d3.curveMonotoneX)(s.values)).attr('fill','none').attr('stroke',s.color).attr('stroke-width',2.5).attr('stroke-linecap','round'); lines.push(p.node());
        s.values.forEach((v,j)=>g.append('circle').attr('cx',x(D.labels[j])).attr('cy',y(v)).attr('r',9).attr('fill','transparent').attr('data-tip',`<b>${esc(s.name)} · ${esc(D.labels[j])}</b>${fmt(v)}`));
        g.append('text').attr('class','ax').attr('x',22).attr('y',chh-14).text(D.labels[0]); g.append('text').attr('class','ax').attr('x',cw-26).attr('y',chh-14).attr('text-anchor','end').text(D.labels[D.labels.length-1]); });
      lines.forEach(l=>{ const L = l.getTotalLength(); l.setAttribute('stroke-dasharray', L); l.setAttribute('stroke-dashoffset', L); }); anim(gsap.timeline().to(lines, {attr:{'stroke-dashoffset':0}, stagger:.12, ease:'none'})); } };
  TYPES.annotated = { height:W=>clamp(W*.55, 300, 440), table:(D,s)=>[['', s[0].name], ...D.labels.map((l,i)=>[l, s[0].values[i]])],
    draw({svg, W, H, sm, D, series, d3, anim, k, fmt, GRID, MUTED, INK, pal, BG}){ const v = series[0].values, L = 46, x = d3.scalePoint(D.labels, [L, W-16]), y = d3.scaleLinear([d3.min(v)*.85, d3.max(v)*1.1], [H-28, 20]);
      y.ticks(5).forEach(t=>{ svg.append('line').attr('x1',L).attr('x2',W-16).attr('y1',y(t)).attr('y2',y(t)).attr('stroke',GRID); svg.append('text').attr('class','ax').attr('x',L-6).attr('y',y(t)+4).attr('text-anchor','end').text(k(t)); });
      svg.selectAll('text.x').data(D.labels).join('text').attr('class','ax').attr('x',d=>x(d)).attr('y',H-8).attr('text-anchor','middle').text((d,i)=>sm && i % 2 ? '' : d);
      const cid = 'sc' + Math.random().toString(36).slice(2,7), cr = svg.append('clipPath').attr('id', cid).append('rect').attr('height', H).attr('width', 0);
      svg.append('path').attr('clip-path', `url(#${cid})`).attr('d', d3.area().x((d,i)=>x(D.labels[i])).y0(H-28).y1(d=>y(d)).curve(d3.curveMonotoneX)(v)).attr('fill', pal[0]).attr('opacity', .28);
      const line = svg.append('path').attr('d', d3.line().x((d,i)=>x(D.labels[i])).y(d=>y(d)).curve(d3.curveMonotoneX)(v)).attr('fill','none').attr('stroke',pal[1]).attr('stroke-width',2.5), dot = svg.append('circle').attr('r',6).attr('fill',pal[1]).attr('stroke',BG).attr('stroke-width',2);
      const notes = (D.notes || []).filter((n,i)=>!sm || i < 3).map(([i,t,dir=-1])=>{ const g = svg.append('g').attr('opacity',0), px = x(D.labels[i]), py = y(v[i]), ty = py + dir*46; g.append('line').attr('x1',px).attr('x2',px).attr('y1',py + dir*8).attr('y2',ty - dir*12).attr('stroke',MUTED); g.append('text').attr('x',px).attr('y',ty).attr('text-anchor', px > W*.7 ? 'end' : px < W*.3 ? 'start' : 'middle').attr('font-size', sm ? 11.5 : 13).attr('font-weight',600).attr('fill',INK).text(t); return {g:g.node(), at:i/Math.max(1, D.labels.length-1)}; });
      svg.selectAll('circle.h').data(v).join('circle').attr('class','h').attr('cx',(d,i)=>x(D.labels[i])).attr('cy',d=>y(d)).attr('r',12).attr('fill','transparent').attr('data-tip',(d,i)=>`<b>${esc(D.labels[i])}</b>${fmt(d)}`);
      const Ln = line.node().getTotalLength(); line.attr('stroke-dasharray', Ln).attr('stroke-dashoffset', Ln); const o = {p:0}, upd = () => { line.attr('stroke-dashoffset', Ln*(1 - o.p)); const pt = line.node().getPointAtLength(Ln*o.p); dot.attr('cx', pt.x).attr('cy', pt.y); cr.attr('width', pt.x); notes.forEach(n=>n.g.setAttribute('opacity', o.p >= n.at - .04 ? 1 : 0)); };
      upd(); anim(gsap.timeline().to(o, {p:1, ease:'none', onUpdate:upd}), {pin:true, end:'+=180%', scrub:.5}); } };
  TYPES.network = { height:W=>clamp(W*.7, 360, 560), table:D=>[['From','To','Weight'], ...(D.links || []).map(l=>[l.source, l.target, l.value || 1])],
    draw({svg, W, H, sm, D, d3, anim, INK, BG, pal, MUTED}){ const N = (D.nodes || []).map(n=>({...n})), Lk = (D.links || []).map(l=>({...l})), groups = [...new Set(N.map(n=>n.group))], r = d=>Math.max(6, Math.sqrt(d.size || 1)*5);
      const sim = d3.forceSimulation(N).force('link', d3.forceLink(Lk).id(d=>d.id).distance(sm ? 70 : Math.min(190, W*.13)).strength(.2)).force('charge', d3.forceManyBody().strength(sm ? -160 : -Math.min(520, W*.3))).force('x', d3.forceX(W/2).strength(.06)).force('y', d3.forceY(H/2).strength(.09)).force('col', d3.forceCollide(d=>r(d) + 14)).stop(); for(let i=0;i<320;i++) sim.tick(); N.forEach(d=>{ d.x = clamp(d.x, 40, W-40); d.y = clamp(d.y, 20, H-20); });
      const lk = svg.append('g').selectAll('line').data(Lk).join('line').attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y).attr('stroke',MUTED).attr('stroke-opacity',.4).attr('stroke-width',d=>Math.min(5, .8 + (d.value || 1)*.5));
      const nd = svg.append('g').selectAll('g').data(N).join('g').attr('transform',d=>`translate(${d.x},${d.y})`); nd.append('circle').attr('r',r).attr('fill',d=>pal[groups.indexOf(d.group) % pal.length]).attr('stroke',BG).attr('stroke-width',2).attr('data-tip',d=>`<b>${esc(d.id)}</b>${esc(d.group || '')}`);
      nd.append('text').attr('y',d=>-r(d) - 5).attr('text-anchor','middle').attr('font-size',11.5).attr('fill',INK).attr('pointer-events','none').text(d=>d.id);
      anim(gsap.timeline().from(nd.nodes(), {scale:0, transformOrigin:'50% 50%', stagger:{each:.02, from:'random'}, ease:'back.out(2)'}).from(lk.nodes(), {opacity:0, stagger:.004}, .2)); } };
  TYPES.heatmap = { height:(W,D)=>clamp(W*.42, 200, 320), table:D=>[['', ...D.cols], ...D.rows.map((r,i)=>[r, ...D.values[i]])],
    draw({svg, W, H, D, d3, anim, pal}){ const L = 44, cw = (W - L)/D.cols.length, ch = (H - 24)/D.rows.length, flat = D.rows.flatMap((r,i)=>D.cols.map((cc,j)=>({r, cc, i, j, v:D.values[i][j]}))), col = d3.scaleSequential(d3.interpolateLab(css('--sc-surface-2'), pal[3] || pal[0])).domain([0, d3.max(flat, d=>d.v)]);
      const cells = svg.selectAll('rect').data(flat).join('rect').attr('x',d=>L + d.j*cw + 1).attr('y',d=>d.i*ch + 1).attr('width',cw - 2).attr('height',ch - 2).attr('rx',2).attr('fill',d=>col(d.v)).attr('data-tip',d=>`<b>${esc(d.r)} · ${esc(d.cc)}</b>${d.v}`);
      svg.selectAll('text.r').data(D.rows).join('text').attr('class','ax').attr('x',L-6).attr('y',(d,i)=>i*ch + ch/2 + 4).attr('text-anchor','end').text(d=>d);
      D.cols.forEach((cc,j)=>{ if(D.cols.length > 12 && j % Math.ceil(D.cols.length/6)) return; svg.append('text').attr('class','ax').attr('x',L + j*cw + cw/2).attr('y',H-6).attr('text-anchor','middle').text(cc); });
      anim(gsap.timeline().from(cells.nodes(), {opacity:0, scale:.3, transformOrigin:'50% 50%', stagger:i=>(flat[i].j + flat[i].i*2)*.02, ease:'power2.out'})); } };
  TYPES.beeswarm = { legend:D=>(D.groups || []).map((g,i)=>[g, PAL()[i % 6]]), height:W=>clamp(W*.45, 260, 340), table:D=>[['Group','Value'], ...(D.points || []).map(p=>[D.groups[p[0]], p[1]])],
    draw({svg, W, H, sm, D, d3, anim, pal, BG, GRID}){ const pts = (D.points || []).map(p=>({g:p[0], v:p[1]})), x = d3.scaleLinear([D.min ?? d3.min(pts, p=>p.v), D.max ?? d3.max(pts, p=>p.v)], [20, W-20]), band = d3.scaleBand(D.groups.map((g,i)=>i), [16, H-30]).padding(.1);
      pts.forEach(d=>{ d.x = x(d.v); d.y = band(d.g) + band.bandwidth()/2; }); const sim = d3.forceSimulation(pts).force('x', d3.forceX(d=>x(d.v)).strength(1)).force('y', d3.forceY(d=>band(d.g) + band.bandwidth()/2).strength(.08)).force('c', d3.forceCollide(sm ? 4.2 : 5.2)).stop(); for(let i=0;i<200;i++) sim.tick();
      x.ticks(5).forEach(t=>{ svg.append('line').attr('x1',x(t)).attr('x2',x(t)).attr('y1',10).attr('y2',H-26).attr('stroke',GRID); svg.append('text').attr('class','ax').attr('x',x(t)).attr('y',H-8).attr('text-anchor','middle').text(t + (D.unit || '')); });
      const dots = svg.selectAll('circle').data(pts).join('circle').attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r', sm ? 3.4 : 4.4).attr('fill',d=>pal[d.g % pal.length]).attr('stroke',BG).attr('stroke-width',1).attr('data-tip',d=>`<b>${esc(D.groups[d.g])}</b>${Math.round(d.v*10)/10}${D.unit || ''}`);
      anim(gsap.timeline().from(dots.nodes(), {attr:{cy:-20}, opacity:0, stagger:{each:.006, from:'random'}, ease:'bounce.out'})); } };
  TYPES.ridgeline = { height:(W,D,s)=>clamp(70 + s.length*55, 260, 460), table:(D,s)=>[['Series','Values'], ...s.map(x=>[x.name, x.values.join(' ')])],
    draw({svg, W, H, sm, D, series, d3, anim, BG, INK}){ const all = series.flatMap(s=>s.values), x = d3.scaleLinear([D.min ?? d3.min(all), D.max ?? d3.max(all)], [sm ? 100 : 140, W-14]), step = (H - 40)/(series.length + .9), hgt = step*1.45, bw = (x.domain()[1] - x.domain()[0])/14;
      const kde = vals => d3.range(x.domain()[0], x.domain()[1] + bw/4, (x.domain()[1] - x.domain()[0])/80).map(t=>[t, d3.mean(vals, v=>Math.exp(-.5*((t - v)/bw)**2))]);
      const areas = series.map((s,i)=>{ const base = 10 + (i + 1.6)*step, pts = kde(s.values), mx = d3.max(pts, p=>p[1]) || 1; svg.append('text').attr('x',x.range()[0] - 10).attr('y',base - 2).attr('text-anchor','end').attr('font-size',12.5).attr('fill',INK).text(s.name);
        return {n:svg.append('path').attr('d', d3.area().x(p=>x(p[0])).y0(base).y1(p=>base - p[1]/mx*hgt).curve(d3.curveBasis)(pts)).attr('fill',s.color).attr('fill-opacity',.85).attr('stroke',BG).attr('stroke-width',1.5).attr('data-tip',`<b>${esc(s.name)}</b>median ${d3.median(s.values)}${D.unit || ''}`).node(), base}; });
      x.ticks(8).forEach(t=>svg.append('text').attr('class','ax').attr('x',x(t)).attr('y',H-6).attr('text-anchor','middle').text(t + (D.unit || '')));
      const tl = gsap.timeline(); areas.forEach((a,i)=>tl.from(a.n, {scaleY:0, svgOrigin:`0 ${a.base}`, ease:'power2.out', duration:.6}, i*.12)); anim(tl); } };
  TYPES.radar = { height:W=>clamp(W*.62, 320, 480), table:(D,s)=>[['', ...s.map(x=>x.name)], ...D.labels.map((l,i)=>[l, ...s.map(x=>x.values[i])])],
    draw({svg, W, H, sm, D, series, d3, anim, GRID, INK, BG}){ const AX = D.labels, R = Math.min(W, H)/2 - (sm ? 54 : 70), cx = W/2, cy = H/2 + 6, ang = i => -Math.PI/2 + i*2*Math.PI/AX.length, max = D.max || d3.max(series.flatMap(s=>s.values)), rs = d3.scaleLinear([0, max], [0, R]);
      [.2,.4,.6,.8,1].forEach(f=>svg.append('polygon').attr('points', AX.map((a,i)=>[cx + Math.cos(ang(i))*R*f, cy + Math.sin(ang(i))*R*f].join(',')).join(' ')).attr('fill','none').attr('stroke',GRID));
      AX.forEach((a,i)=>{ svg.append('line').attr('x1',cx).attr('y1',cy).attr('x2',cx + Math.cos(ang(i))*R).attr('y2',cy + Math.sin(ang(i))*R).attr('stroke',GRID); svg.append('text').attr('x',cx + Math.cos(ang(i))*(R + 14)).attr('y',cy + Math.sin(ang(i))*(R + 14) + 4).attr('text-anchor', Math.abs(Math.cos(ang(i))) < .2 ? 'middle' : Math.cos(ang(i)) > 0 ? 'start' : 'end').attr('font-size',12).attr('fill',INK).text(a); });
      const poly = svg.append('polygon').attr('fill-opacity',.35).attr('stroke-width',2.5), title = svg.append('text').attr('x',8).attr('y',22).attr('font-size',18).attr('font-weight',800).attr('fill',INK), vtx = svg.append('g').selectAll('circle').data(AX).join('circle').attr('r',4.5).attr('stroke',BG).attr('stroke-width',1.5);
      const o = {p:0}, draw = () => { const f = o.p*(series.length - 1), i0 = Math.min(Math.max(0, series.length - 2), Math.floor(f)), t = d3.easeCubicInOut(f - i0), A = series[i0], Bs = series[i0 + 1] || A, vals = A.values.map((v,i)=>v + (Bs.values[i] - v)*t), col = d3.interpolateRgb(A.color, Bs.color)(t), pts = vals.map((v,i)=>[cx + Math.cos(ang(i))*rs(v), cy + Math.sin(ang(i))*rs(v)]);
        poly.attr('points', pts.map(p=>p.join(',')).join(' ')).attr('fill',col).attr('stroke',col); vtx.attr('cx',(d,i)=>pts[i][0]).attr('cy',(d,i)=>pts[i][1]).attr('fill',col).attr('data-tip',(d,i)=>`<b>${esc(series[Math.round(f)].name)} · ${esc(d)}</b>${Math.round(vals[i]*10)/10}`); title.text(series[Math.round(f)].name); };
      draw(); anim(gsap.timeline().to(o, {p:1, ease:'none', onUpdate:draw}), {pin:series.length > 1, end:'+=160%', scrub:.5}); } };
  TYPES.gantt = { height:(W,D)=>(D.tasks || []).length*36 + 46, table:D=>[['Task','Start','End'], ...(D.tasks || []).map(t=>[t[0], t[1], t[2]])],
    draw({svg, W, H, sm, D, d3, anim, GRID, INK, pal}){ const T = D.tasks || [], L = sm ? 112 : 160, end = d3.max(T, t=>t[2]), x = d3.scaleLinear([0, end], [L, W-10]), unit = D.unit || 'day';
      x.ticks(5).forEach(d=>{ svg.append('line').attr('x1',x(d)).attr('x2',x(d)).attr('y1',6).attr('y2',H-26).attr('stroke',GRID); svg.append('text').attr('class','ax').attr('x',x(d)).attr('y',H-8).attr('text-anchor','middle').text(`${unit} ${d}`); });
      const g = svg.selectAll('g.t').data(T).join('g').attr('class','t').attr('transform',(d,i)=>`translate(0,${14 + i*36})`); g.append('text').attr('x',L-10).attr('y',14).attr('text-anchor','end').attr('font-size',12.5).attr('fill',INK).text(d=>d[0]);
      const bars = g.append('rect').attr('x',d=>x(d[1])).attr('y',2).attr('height',20).attr('rx',4).attr('width',d=>x(d[2]) - x(d[1])).attr('fill',(d,i)=>d[3] || pal[i % pal.length]).attr('data-tip',d=>`<b>${esc(d[0])}</b>${unit} ${d[1]} to ${d[2]}`);
      const ticks = g.append('text').attr('x',d=>x(d[2]) + 6).attr('y',17).attr('font-size',13).attr('fill',pal[1]).text('✓').attr('opacity',0), today = svg.append('g'); today.append('line').attr('y1',0).attr('y2',H-24).attr('stroke',INK).attr('stroke-width',2); today.append('text').attr('y',H-28).attr('x',4).attr('font-size',11).attr('fill',INK).text(D.todayLabel || 'today');
      const o = {d:0}, upd = () => { today.attr('transform', `translate(${x(o.d)},0)`); ticks.attr('opacity', d=>o.d >= d[2] ? 1 : 0); bars.attr('fill-opacity', d=>o.d >= d[2] ? .45 : 1); }; upd();
      anim(gsap.timeline().from(bars.nodes(), {attr:{width:0}, stagger:.08, duration:.4, ease:'power2.out'}).to(o, {d:end, duration:1.6, ease:'none', onUpdate:upd}, .2), {end:'bottom 30%'}); } };
  /* morph: one dataset, three shapes (stacked area → grouped bars → 100% share), pinned, three stages */
  TYPES.morph = { legend:(D,s)=>s.map(x=>[x.name, x.color]), height:W=>clamp(W*.55, 300, 440), table:(D,s)=>[['', ...s.map(x=>x.name)], ...D.labels.map((l,i)=>[l, ...s.map(x=>x.values[i])])],
    draw({svg, W, H, D, series, d3, anim, k, pct, GRID, INK}){ const Q = D.labels, rows = Q.map((q,i)=>Object.fromEntries([['q',q], ...series.map(s=>[s.name, s.values[i]])])), keys = series.map(s=>s.name), col = Object.fromEntries(series.map(s=>[s.name, s.color])), m = {t:16, r:12, b:30, l:50};
      const x = d3.scalePoint(Q, [m.l, W-m.r]), xb = d3.scaleBand(Q, [m.l-20, W-m.r+20]).padding(.18), xs = d3.scaleBand(keys, [0, xb.bandwidth()]).padding(.08), sA = d3.stack().keys(keys)(rows), sP = d3.stack().keys(keys).offset(d3.stackOffsetExpand)(rows);
      const yA = d3.scaleLinear([0, d3.max(sA[sA.length-1], d=>d[1])*1.05], [H-m.b, m.t]), yB = d3.scaleLinear([0, d3.max(series.flatMap(s=>s.values))*1.05], [H-m.b, m.t]), yP = d3.scaleLinear([0,1], [H-m.b, m.t]);
      const gy = svg.append('g'), gA = svg.append('g'), gB = svg.append('g'), area = y => d3.area().x(d=>x(d.data.q)).y0(d=>y(d[0])).y1(d=>y(d[1])).curve(d3.curveMonotoneX);
      svg.append('g').selectAll('text').data(Q).join('text').attr('class','ax').attr('x',d=>x(d)).attr('y',H-8).attr('text-anchor','middle').text(d=>d);
      const paths = gA.selectAll('path').data(sA).join('path').attr('fill',d=>col[d.key]).attr('fill-opacity',.92).attr('d', area(yA)).attr('data-tip', d=>`<b>${esc(d.key)}</b>`);
      const bars = gB.selectAll('g').data(series).join('g').attr('fill',d=>d.color).selectAll('rect').data(d=>d.values.map((v,i)=>({k:d.name, q:Q[i], v}))).join('rect').attr('x',d=>xb(d.q) + xs(d.k)).attr('width',xs.bandwidth()).attr('rx',2).attr('y',H-m.b).attr('height',0).attr('data-tip',d=>`<b>${esc(d.k)} · ${esc(d.q)}</b>${d.v.toLocaleString('en')}`);
      const axis = (y, f) => { gy.selectAll('*').remove(); y.ticks(4).forEach(t=>{ gy.append('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',y(t)).attr('y2',y(t)).attr('stroke',GRID); gy.append('text').attr('class','ax').attr('x',m.l-6).attr('y',y(t)+4).attr('text-anchor','end').text(f(t)); }); };
      let cur = -1; const set = s => { if(s === cur) return; cur = s; const dur = 700; if(s !== 1){ const y = s === 0 ? yA : yP; axis(y, s === 0 ? k : pct); paths.data(s === 0 ? sA : sP).transition().duration(dur).attr('d', area(y)); gA.transition().duration(dur).attr('opacity',1); bars.transition().duration(dur*.6).attr('y',H-m.b).attr('height',0); }
        else { axis(yB, k); gA.transition().duration(dur*.6).attr('opacity',0); bars.transition().duration(dur).delay((d,i)=>i*12).attr('y',d=>yB(d.v)).attr('height',d=>H-m.b-yB(d.v)); } };
      set(0); const o = {p:0}; anim(gsap.timeline().to(o, {p:1, ease:'none', onUpdate:()=>set(Math.min(2, Math.floor(o.p*3)))}), {pin:true, end:'+=200%', scrub:true}); } };
  /* globe & map-flight: stops [[name, lon, lat, text]] */
  const land = async () => { if(!window.topojson) await S.load(S.libs.topojson); const t = await (await fetch(S.landUrl || (S.base + 'data/land-110m.json'))).json(); return topojson.feature(t, t.objects.land); };
  TYPES.globe = { once:true, height:W=>Math.min(W, 560),
    async draw({svg, W, H, D, d3, anim, INK, pal, c, el}){ let L; try { L = await land(); } catch(e){ svg.append('text').attr('x',10).attr('y',20).attr('fill',INK).text('Map data could not load.'); return; } const stops = D.stops || [], s = Math.min(W, H)/2 - 10, proj = d3.geoOrthographic().scale(s).translate([W/2, H/2]).clipAngle(90), path = d3.geoPath(proj);
      svg.append('path').datum({type:'Sphere'}).attr('fill',css('--sc-surface-2')).attr('stroke',css('--sc-line')); svg.append('path').datum(d3.geoGraticule10()).attr('fill','none').attr('stroke',css('--sc-line')); svg.append('path').datum(L).attr('fill',pal[0]);
      const route = svg.append('path').attr('fill','none').attr('stroke',pal[1]).attr('stroke-width',3).attr('stroke-linecap','round').attr('class','sc-route'), pins = svg.append('g').selectAll('circle').data(stops).join('circle').attr('r',7).attr('fill',pal[2]).attr('stroke','#fff').attr('stroke-width',2);
      const cap = d3.select(el).append('p').attr('class','sc-meta').attr('aria-live','polite').style('text-align','center');
      const draw = p => { const f = p*(stops.length-1), i0 = Math.min(stops.length-2, Math.floor(f)), t = f - i0, ip = d3.geoInterpolate([stops[i0][1], stops[i0][2]], [stops[i0+1][1], stops[i0+1][2]]), ce = ip(d3.easeCubicInOut(t)); proj.rotate([-ce[0], -ce[1]*.8]); svg.selectAll('path:not(.sc-route)').attr('d', path);
        const co = []; for(let si=0; si<=i0; si++){ const g = d3.geoInterpolate([stops[si][1], stops[si][2]], [stops[si+1][1], stops[si+1][2]]), lim = si < i0 ? 1 : d3.easeCubicInOut(t); for(let u=0;u<=24;u++) co.push(g(u/24*lim)); } route.attr('d', path({type:'LineString', coordinates:co}));
        pins.each(function(d){ const pt = proj([d[1], d[2]]), vis = d3.geoDistance([d[1], d[2]], [-proj.rotate()[0], -proj.rotate()[1]]) < Math.PI/2; d3.select(this).attr('cx',pt[0]).attr('cy',pt[1]).attr('opacity', vis ? 1 : 0); }); const kk = Math.round(f); cap.text(`${stops[kk][0]}${stops[kk][3] ? ' · ' + stops[kk][3] : ''}`); };
      draw(c.M ? 0 : 1); if(c.M){ c.ST.create({trigger:el, pin:true, start:'top top', end:'+=' + (stops.length*80) + '%', scrub:.6, onUpdate:st=>draw(st.progress)}); c.refresh(); } } };
  TYPES['map-flight'] = { once:true, height:W=>clamp(W*.56, 300, 560),
    async draw({svg, W, H, D, d3, INK, pal, c, el}){ let L; try { L = await land(); } catch(e){ svg.append('text').attr('x',10).attr('y',20).attr('fill',INK).text('Map data could not load.'); return; } const stops = D.stops || [], MW = 2304, proj = d3.geoEquirectangular().scale(MW/(2*Math.PI)).translate([MW/2, 78*MW/360]), P = stops.map(s=>proj([s[1], s[2]]));
      const g = svg.append('g'); g.append('path').attr('d', d3.geoPath(proj)(L)).attr('fill', css('--sc-surface-2')).attr('stroke', css('--sc-line'));
      const segs = P.slice(1).map((b,i)=>{ const a = P[i], lift = i % 2 ? -100 : 150; return g.append('path').attr('d', `M${a[0]} ${a[1]} Q${(a[0]+b[0])/2} ${(a[1]+b[1])/2 - lift} ${b[0]} ${b[1]}`).attr('fill','none').attr('stroke',pal[1]).attr('stroke-width',3).attr('stroke-linecap','round').node(); });
      P.forEach((p,i)=>{ g.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',7).attr('fill',pal[2]).attr('stroke','#fff').attr('stroke-width',2); g.append('text').attr('x',p[0] + 12).attr('y',p[1] - 10).attr('font-size',16).attr('font-weight',700).attr('fill',INK).text(stops[i][0]); });
      const plane = g.append('path').attr('d','M-14 0 L10 -3 L14 0 L10 3 Z M-2 -1 L-6 -11 L-2 -11 L5 -1 Z M-2 1 L-6 11 L-2 11 L5 1 Z').attr('fill',INK).attr('opacity',0);
      const view = i => { let sc, x, y; if(i < 0 || i >= P.length){ sc = Math.min(W/MW, H/(MW*.42))*.96; x = MW/2; y = MW*.21; } else { [x,y] = P[i]; sc = (D.zoom || 2.2)*(W/1280); } return {x:W/2 - x*sc, y:H/2 - y*sc, s:sc}; };
      const cam = view(0), apply = () => g.attr('transform', `translate(${cam.x},${cam.y}) scale(${cam.s})`); apply(); if(!c.M){ Object.assign(cam, view(-1)); apply(); return; }
      segs.forEach(sg=>{ const l = sg.getTotalLength(); sg.setAttribute('stroke-dasharray', l); sg.setAttribute('stroke-dashoffset', l); });
      const tl = gsap.timeline({scrollTrigger:{trigger:el, pin:true, start:'top top', end:'+=' + (stops.length*80) + '%', scrub:.6}});
      segs.forEach((sg,i)=>{ const l = sg.getTotalLength(), o = {p:0}; tl.to(cam, {...view(i+1), duration:1, ease:'power1.inOut', onUpdate:apply}, i).to(o, {p:1, duration:1, ease:'none', onUpdate:()=>{ sg.setAttribute('stroke-dashoffset', l*(1 - o.p)); const pt = sg.getPointAtLength(l*o.p), pt2 = sg.getPointAtLength(Math.min(l, l*o.p + 2)); plane.attr('opacity',1).attr('transform', `translate(${pt.x},${pt.y}) rotate(${Math.atan2(pt2.y - pt.y, pt2.x - pt.x)*180/Math.PI})`); }}, i); });
      tl.to(cam, {...view(-1), duration:1, ease:'power2.inOut', onUpdate:apply}, segs.length).to(plane.node(), {opacity:0, duration:.2}, segs.length + .6); c.refresh(); } };

  /* wire into the chart block */
  const base = S.blocks.chart && S.blocks.chart.fn;
  S.block('chart', (el, c) => { const D = json(el); if(D && TYPES[D.type]){ el.classList.add('sc-viz'); c.near(el, ()=>d3ready().then(()=>render(el, c, D)).catch(()=>{ el.insertAdjacentHTML('beforeend', '<p>This chart needs D3, which could not load.</p>'); }), '600px'); return; } if(base) base(el, c); }, {category:'data'});
  S.viz = TYPES;
})(window.Scrolly);

/* Genially Scrolly · WebGL/Three.js, animation formats (Lottie, Theatre.js), physics (Matter.js), film labels */
(function(S){
  const {clamp, num, json, $, $$, ease} = S.util, B = S.block;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const pal = () => ['--sc-accent','--sc-accent-2','--sc-accent-3','--sc-accent-4','--sc-accent-5','--sc-accent-6'].map(css).map(x=>x || '#888');
  S.libs.lottie = 'https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js';
  S.libs.matter = 'https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js';
  S.libs.theatre = 'https://cdn.jsdelivr.net/npm/@theatre/core@0.7.2/+esm';
  const three = () => S._three || (S._three = import(S.libs.three));
  const stage = el => { el.classList.add('sc-gl'); let cv = $(':scope > canvas', el); if(!cv){ cv = document.createElement('canvas'); el.prepend(cv); } cv.setAttribute('aria-label', el.dataset.alt || 'Interactive 3D scene'); return cv; };
  const fail = (el, msg) => el.insertAdjacentHTML('beforeend', `<p class="sc-glfail">${msg || '3D could not start in this browser. The rest of the page still works.'}</p>`);
  const renderer = (T, cv) => { const r = new T.WebGLRenderer({canvas:cv, antialias:true}); r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.outputColorSpace = T.SRGBColorSpace; return r; };
  const fit = (r, cam, el) => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); if(cam.isPerspectiveCamera){ const a = w/h, f0 = cam.userData.fov0 || (cam.userData.fov0 = cam.fov); cam.aspect = a; /* portrait screens: keep the horizontal field of view of a 1.2:1 frame so scenes are not cropped */ cam.fov = a < 1.2 ? Math.min(100, 2*Math.atan(Math.tan(f0*Math.PI/360)*1.2/a)*180/Math.PI) : f0; cam.updateProjectionMatrix(); } };
  const label = (T, txt, bg, fg) => { const c = document.createElement('canvas'); c.width = 512; c.height = 320; const x = c.getContext('2d'); x.fillStyle = bg; x.beginPath(); x.roundRect(0,0,512,320,40); x.fill(); x.fillStyle = fg; x.font = `800 52px ${css('--sc-font-display') || 'sans-serif'}`; x.textBaseline = 'bottom'; x.fillText(txt, 36, 290); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; };
  const onLight = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h); if(!m) return false; const n = parseInt(m[1],16); return (0.299*(n>>16) + 0.587*((n>>8)&255) + 0.114*(n&255))/255 > .6; };
  const loop = (c, el, draw) => { const v = c.visible(el); let dirty = true; const mark = () => dirty = true; gsap.ticker.add(t=>{ if(v.on && (dirty || el.__live)){ draw(t); dirty = false; } }); return mark; };

  /* world3d: fly a camera through floating cards. data-words="Quiz,Game,…" */
  B('world3d', (el, c) => { const cv = stage(el); c.near(el, async ()=>{ let T; try { T = await three(); } catch(e){ fail(el); return; } try {
    const r = renderer(T, cv), scene = new T.Scene(), bg = css('--sc-bg') || '#0C0A14'; scene.background = new T.Color(bg); scene.fog = new T.Fog(bg, 8, 34); const cam = new T.PerspectiveCamera(60, 1, .1, 100);
    const pts = []; for(let i=0;i<9;i++) pts.push(new T.Vector3(Math.sin(i*.9)*4, Math.cos(i*.7)*1.6, -i*6)); const curve = new T.CatmullRomCurve3(pts), P = pal(), words = (el.dataset.words || 'Quiz,Escape room,Presentation,Infographic,Game,Course,Video,Report').split(',');
    const geo = new T.PlaneGeometry(2.4, 1.5), cards = []; for(let i=0;i<30;i++){ const bgc = P[i % P.length], m = new T.Mesh(geo, new T.MeshBasicMaterial({map:label(T, words[i % words.length].trim(), bgc, onLight(bgc) ? '#121212' : '#ffffff'), transparent:true, side:T.DoubleSide})); const p = curve.getPointAt((i + .5)/30), side = i % 2 ? 1 : -1; m.position.set(p.x + side*(2.2 + Math.random()*1.6), p.y + (Math.random()-.5)*3, p.z - Math.random()*2); m.rotation.y = -side*.5; scene.add(m); cards.push(m); }
    const sg = new T.BufferGeometry(), sp = new Float32Array(1500*3); for(let i=0;i<sp.length;i+=3){ sp[i] = (Math.random()-.5)*40; sp[i+1] = (Math.random()-.5)*24; sp[i+2] = -Math.random()*60 + 6; } sg.setAttribute('position', new T.BufferAttribute(sp, 3)); scene.add(new T.Points(sg, new T.PointsMaterial({color:P[1], size:.05})));
    let prog = c.M ? 0 : .3; const mark = loop(c, el, ()=>{ const p = clamp(prog, 0, .985), a = curve.getPointAt(p), b = curve.getPointAt(Math.min(1, p + .015)); cam.position.copy(a); cam.lookAt(b); r.render(scene, cam); });
    fit(r, cam, el); c.onWidth(()=>{ fit(r, cam, el); mark(); }); if(c.M){ c.ST.create({trigger:el, pin:true, start:'top top', end:'+=' + (el.dataset.length || '300%'), scrub:.6, onUpdate:s=>{ prog = s.progress; mark(); }}); c.refresh(); }
  } catch(e){ fail(el); } }); }, {category:'3d'});

  /* object3d: a 3D cursor, a sphere and a ring turn and split apart with scroll */
  B('object3d', (el, c) => { const cv = stage(el); c.near(el, async ()=>{ let T; try { T = await three(); } catch(e){ fail(el); return; } try {
    const r = renderer(T, cv), scene = new T.Scene(), P = pal(); scene.background = new T.Color(css('--sc-surface') || '#121212'); const cam = new T.PerspectiveCamera(40, 1, .1, 100); cam.position.set(0, 0, 9);
    scene.add(new T.HemisphereLight('#ffffff', '#3B1E99', 1.6)); const dl = new T.DirectionalLight('#ffffff', 2.4); dl.position.set(3, 4, 5); scene.add(dl);
    const sh = new T.Shape(); [[0,0],[0,3.4],[.9,2.6],[1.5,4],[2.1,3.7],[1.5,2.4],[2.7,2.4]].forEach(([x,y],i)=>i ? sh.lineTo(x, -y) : sh.moveTo(x, -y)); sh.closePath(); const cg = new T.ExtrudeGeometry(sh, {depth:.6, bevelEnabled:true, bevelSize:.08, bevelThickness:.08, bevelSegments:3}); cg.center();
    const cursor = new T.Mesh(cg, new T.MeshStandardMaterial({color:P[0], roughness:.35})), dot = new T.Mesh(new T.SphereGeometry(.7, 48, 32), new T.MeshStandardMaterial({color:P[1], roughness:.3})), ring = new T.Mesh(new T.TorusGeometry(1.25, .07, 16, 96), new T.MeshStandardMaterial({color:P[2], roughness:.4})), g = new T.Group(); g.add(cursor, dot, ring); scene.add(g);
    let prog = .5; const mark = loop(c, el, ()=>{ const p = prog, s = Math.sin(p*Math.PI); g.rotation.y = (p - .5)*Math.PI*2.2; g.rotation.x = (p - .5)*.8; cursor.position.set(-s*1.6, s*.4, 0); cursor.rotation.z = s*.4; dot.position.set(s*1.9, -s*.6, s*.5); ring.position.copy(dot.position); ring.rotation.x = p*Math.PI*2; r.render(scene, cam); });
    fit(r, cam, el); c.onWidth(()=>{ fit(r, cam, el); mark(); }); if(c.M) c.ST.create({trigger:el, start:'top bottom', end:'bottom top', scrub:.5, onUpdate:s=>{ prog = s.progress; mark(); }});
  } catch(e){ fail(el); } }); }, {category:'3d'});

  /* distort: an image ripples around the pointer and splits colours with scroll speed. data-src="image.jpg" */
  B('distort', (el, c) => { const cv = stage(el); c.near(el, async ()=>{ let T; try { T = await three(); } catch(e){ fail(el); return; } try {
    const r = renderer(T, cv), scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), U = {uTex:{value:null}, uMouse:{value:new T.Vector2(.5,.5)}, uHover:{value:0}, uVel:{value:0}, uTime:{value:0}, uImgA:{value:1.6}, uBoxA:{value:1.6}};
    const tex = new T.TextureLoader().load(el.dataset.src, ()=>{ U.uImgA.value = tex.image.width/tex.image.height; }); tex.colorSpace = T.SRGBColorSpace; U.uTex.value = tex;
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({uniforms:U, vertexShader:'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader:`precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uMouse; uniform float uHover, uVel, uTime, uImgA, uBoxA;
        vec2 cover(vec2 uv){ vec2 s = uBoxA > uImgA ? vec2(1., uImgA/uBoxA) : vec2(uBoxA/uImgA, 1.); return (uv - .5)*s + .5; }
        void main(){ vec2 uv = vUv; vec2 d = uv - uMouse; d.x *= uBoxA; float dist = length(d); uv += normalize(d + 1e-5)*sin(dist*38. - uTime*5.)*.012*uHover*smoothstep(.45, 0., dist); uv += (uMouse - vUv)*.08*uHover*smoothstep(.3, 0., dist);
          float sh = uVel*.03; vec2 c = cover(uv); gl_FragColor = vec4(texture2D(uTex, c + vec2(sh, 0.)).r, texture2D(uTex, c).g, texture2D(uTex, c - vec2(sh, 0.)).b, 1.); }`})));
    const mx = {x:.5, y:.5, h:0}; const resize = () => { fit(r, cam, el); U.uBoxA.value = el.clientWidth/el.clientHeight; }; resize(); c.onWidth(resize);
    el.addEventListener('pointermove', e=>{ const b = el.getBoundingClientRect(); mx.x = (e.clientX - b.left)/b.width; mx.y = 1 - (e.clientY - b.top)/b.height; }); el.addEventListener('pointerenter', ()=>gsap.to(mx, {h:1, duration:.6})); el.addEventListener('pointerleave', ()=>gsap.to(mx, {h:0, duration:.8}));
    el.__live = c.M; loop(c, el, t=>{ U.uMouse.value.x += (mx.x - U.uMouse.value.x)*.12; U.uMouse.value.y += (mx.y - U.uMouse.value.y)*.12; U.uHover.value = c.M ? mx.h : 0; U.uVel.value += ((c.M ? clamp(Math.abs(c.vel)/3000) : 0) - U.uVel.value)*.15; U.uTime.value = t; r.render(scene, cam); });
  } catch(e){ fail(el); } }); }, {category:'3d'});

  /* bars3d: 3D columns of a series with a camera move. JSON {labels, values, title, source} */
  B('bars3d', (el, c) => { const D = json(el) || {labels:[], values:[]}; const cv = stage(el); const read = document.createElement('div'); read.className = 'sc-readout'; read.innerHTML = `<b>0</b><span>${D.title || ''}</span>`; el.appendChild(read);
    if(D.source) el.insertAdjacentHTML('beforeend', `<span class="sc-chip ${D.source === 'real' ? 'real' : 'sample'}" style="position:absolute;left:12px;top:12px;z-index:3">${D.source} data</span>`);
    c.near(el, async ()=>{ let T; try { T = await three(); } catch(e){ fail(el); return; } try {
    const r = renderer(T, cv), scene = new T.Scene(), P = pal(); scene.background = new T.Color(css('--sc-bg') || '#121212'); const cam = new T.PerspectiveCamera(38, 1, .1, 100);
    scene.add(new T.HemisphereLight('#ffffff', '#221C35', 1.4)); const dl = new T.DirectionalLight('#ffffff', 2.2); dl.position.set(-4, 10, 6); scene.add(dl); const fl = new T.Mesh(new T.PlaneGeometry(30, 14), new T.MeshStandardMaterial({color:css('--sc-surface-2') || '#221C35', roughness:.9})); fl.rotation.x = -Math.PI/2; scene.add(fl); const gr = new T.GridHelper(24, 24, P[3], P[3]); gr.material.opacity = .2; gr.material.transparent = true; gr.position.y = .01; scene.add(gr);
    const n = D.values.length, max = Math.max(...D.values)*1.05, hi = D.values.indexOf(Math.max(...D.values)), lo = D.values.indexOf(Math.min(...D.values));
    const bars = D.values.map((v,i)=>{ const m = new T.Mesh(new T.BoxGeometry(.7, 1, .7), new T.MeshStandardMaterial({color:i === hi ? P[1] : i === lo ? P[2] : P[0], roughness:.35})); m.position.set((i - (n-1)/2)*1.05, 0, 0); m.userData = {h:v/max*5, v}; m.scale.y = .001; scene.add(m); return m; });
    let prog = c.M ? 0 : 1, last = -1; const f = new Intl.NumberFormat('en'); const mark = loop(c, el, ()=>{ const p = prog, ang = -.15 + p*1.1; cam.position.set(Math.sin(ang)*(15 - p*3), 2.5 + p*7, Math.cos(ang)*(15 - p*3)); cam.lookAt(0, 1.6 - p*.6, 0);
      bars.forEach((b,i)=>{ const t = ease(clamp(p*1.6 - i*.06)); b.scale.y = Math.max(.001, t*b.userData.h); b.position.y = b.scale.y/2; }); const i = Math.min(n-1, Math.floor(clamp(p*1.6/(1 + (n-1)*.06))*n)); const sb = bars[i]; if(sb){ $('b', read).textContent = f.format(Math.round(sb.userData.v*clamp(sb.scale.y/sb.userData.h))); if(i !== last){ last = i; $('span', read).textContent = `${D.title || ''} · ${D.labels[i] || ''}`; } } r.render(scene, cam); });
    fit(r, cam, el); c.onWidth(()=>{ fit(r, cam, el); mark(); }); if(c.M){ c.ST.create({trigger:el, pin:true, start:'top top', end:'+=250%', scrub:.6, onUpdate:s=>{ prog = s.progress; mark(); }}); c.refresh(); }
  } catch(e){ fail(el); } }); }, {category:'3d'});

  /* layers3d: a slide splits into its layers in 3D. Children: <img> layers back to front with alt = label (PNG with transparency for upper layers) */
  B('layers3d', (el, c) => { const imgs = $$(':scope > img', el); imgs.forEach(im=>im.style.display = 'none'); const cv = stage(el), labels = document.createElement('div'); labels.className = 'sc-glabels'; el.appendChild(labels);
    c.near(el, async ()=>{ let T; try { T = await three(); } catch(e){ fail(el); return; } try {
    const r = renderer(T, cv), scene = new T.Scene(); scene.background = new T.Color(css('--sc-bg') || '#0C0A14'); const cam = new T.PerspectiveCamera(40, 1, .1, 100), loader = new T.TextureLoader(), plane = new T.PlaneGeometry(4.8, 2.7);
    const meshes = imgs.map((im,i)=>{ const t = loader.load(im.currentSrc || im.src, ()=>mark()); t.colorSpace = T.SRGBColorSpace; const m = new T.Mesh(plane, new T.MeshBasicMaterial({map:t, transparent:i > 0, side:T.DoubleSide, depthWrite:i === 0})); m.renderOrder = i; const e = new T.LineSegments(new T.EdgesGeometry(plane), new T.LineBasicMaterial({color:css('--sc-muted') || '#ccc', transparent:true, opacity:0})); m.add(e); m.userData.e = e; scene.add(m); return m; });
    labels.innerHTML = imgs.map(im=>`<span>${im.alt || ''}</span>`).join(''); const tags = $$('span', labels), v3 = new T.Vector3(); let prog = c.M ? 0 : 1;
    const mark = loop(c, el, ()=>{ const p = ease(prog), mid = (meshes.length - 1)/2; meshes.forEach((m,i)=>{ m.position.z = (i - mid)*p*1.15; m.userData.e.material.opacity = p*.6; }); cam.position.set(Math.sin(p*.95)*8.5, p*2.2, Math.cos(p*.95)*8.5 - p*.5); cam.lookAt(0,0,0); r.render(scene, cam);
      const w = el.clientWidth, h = el.clientHeight; meshes.forEach((m,i)=>{ v3.set([-2.4, 2.4, 0][i % 3], [1.35, 1.35, -1.35][i % 3], m.position.z).project(cam); tags[i].style.left = ((v3.x + 1)/2*w) + 'px'; tags[i].style.top = ((1 - v3.y)/2*h - 14) + 'px'; tags[i].style.opacity = p > .25 ? 1 : 0; }); });
    fit(r, cam, el); c.onWidth(()=>{ fit(r, cam, el); mark(); }); if(c.M){ c.ST.create({trigger:el, pin:true, start:'top top', end:'+=250%', scrub:.6, onUpdate:s=>{ prog = s.progress; mark(); }}); c.refresh(); }
  } catch(e){ fail(el); } }); }, {category:'3d'});

  /* lottie: scroll picks the frame. data-src="anim.json" (or JSON child). Without either, a built-in demo plays. */
  B('lottie', (el, c) => { el.classList.add('sc-lottie'); const box = document.createElement('div'); box.className = 'sc-lt'; box.setAttribute('role','img'); box.setAttribute('aria-label', el.dataset.alt || 'Animation'); el.prepend(box); const hud = document.createElement('span'); hud.className = 'sc-hud'; el.appendChild(hud);
    c.near(el, async ()=>{ try { if(!window.lottie) await S.load(S.libs.lottie); } catch(e){ box.textContent = 'Lottie could not load.'; return; }
      let data = json(el); if(!data && el.dataset.src){ try { data = await (await fetch(el.dataset.src)).json(); } catch(e){} } if(!data) data = S.lottieDemo();
      const anim = lottie.loadAnimation({container:box, renderer:'svg', loop:false, autoplay:false, animationData:data}), N = () => Math.max(1, anim.totalFrames - 1);
      const set = p => { const f = Math.round(p*N()); anim.goToAndStop(f, true); hud.textContent = `${f} / ${Math.round(anim.totalFrames)}`; };
      anim.addEventListener('DOMLoaded', ()=>{ set(c.M ? 0 : 1); if(c.M){ c.ST.create({trigger:el, pin:true, start:'top top', end:'+=' + (el.dataset.length || '200%'), scrub:true, onUpdate:s=>set(s.progress)}); c.refresh(); } }); }); }, {category:'animation'});
  /* the built-in demo: a cursor clicks a button, a window opens, a check draws, a score bar fills */
  S.lottieDemo = () => { const st = v => ({a:0, k:v}), kf = fr => ({a:1, k:fr.map(([t,s],i)=>i < fr.length-1 ? {t, s, i:{x:[.3],y:[1]}, o:{x:[.7],y:[0]}} : {t, s})}), tr = (o={}) => ({ty:'tr', p:o.p || st([0,0]), a:st([0,0]), s:o.s || st([100,100]), r:st(0), o:st(100), sk:st(0), sa:st(0)});
    const P = pal(), col = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h) || [0,'888888']; const n = parseInt(m[1],16); return [(n>>16)/255, ((n>>8)&255)/255, (n&255)/255, 1]; }, fill = h => ({ty:'fl', c:st(col(h)), o:st(100), r:1}), stroke = (h,w) => ({ty:'st', c:st(col(h)), o:st(100), w:st(w), lc:2, lj:2});
    const rect = (s, r, p) => ({ty:'rc', d:1, s, p:p || st([0,0]), r:st(r)}), path = (v, cl) => ({ty:'sh', d:1, ks:st({c:cl, v, i:v.map(()=>[0,0]), o:v.map(()=>[0,0])})}), grp = (it, t) => ({ty:'gr', it:[...it, tr(t)]});
    const layer = (ind, shapes, ks={}) => ({ddd:0, ind, ty:4, sr:1, ks:{o:ks.o || st(100), r:st(0), p:ks.p || st([200,200,0]), a:st([0,0,0]), s:ks.s || st([100,100,100])}, ao:0, shapes, ip:0, op:121, st:0, bm:0});
    return {v:'5.7.4', fr:30, ip:0, op:120, w:400, h:400, ddd:0, assets:[], layers:[
      layer(1, [grp([path([[0,0],[0,34],[9,26],[15,40],[21,37],[15,24],[27,24]], true), stroke('#121212', 2.5), fill('#F9F8FC')])], {p:kf([[0,[330,370,0]],[26,[196,236,0]],[44,[196,236,0]],[66,[318,346,0]],[120,[318,346,0]]]), s:kf([[26,[100,100,100]],[30,[82,82,100]],[34,[100,100,100]],[120,[100,100,100]]])}),
      layer(2, [grp([path([[-34,0],[-10,24],[36,-24]], false), {ty:'tm', s:st(0), e:kf([[46,[0]],[74,[100]],[120,[100]]]), o:st(0), m:1}, stroke(P[1], 14)])], {p:st([200,186,0]), o:kf([[0,[0]],[44,[0]],[46,[100]],[120,[100]]])}),
      layer(3, [grp([rect(kf([[70,[0,16]],[112,[220,16]],[120,[220,16]]]), 8, kf([[70,[-110,0]],[112,[0,0]],[120,[0,0]]])), fill(P[2])]), grp([rect(st([220,16]), 8), fill('#393645')])], {p:st([200,290,0]), o:kf([[0,[0]],[60,[0]],[68,[100]],[120,[100]]])}),
      layer(4, [grp([rect(st([132,48]), 24), fill(P[0])], {s:kf([[26,[100,100]],[30,[88,88]],[36,[100,100]],[120,[100,100]]])})], {p:st([200,240,0]), o:kf([[0,[0]],[14,[0]],[20,[100]],[36,[100]],[46,[0]],[120,[0]]])}),
      layer(5, [grp([rect(st([300,250]), 26), fill('#2A2540')]), grp([rect(st([300,34]), 0, st([0,-108])), fill(P[0])])], {p:st([200,210,0]), s:kf([[0,[60,60,100]],[18,[100,100,100]],[120,[100,100,100]]]), o:kf([[0,[0]],[10,[100]],[120,[100]]])})]}; };

  /* theatre: keyframes authored as a Theatre.js sequence; scroll sets the position. Children = actors; JSON {length, keys:{actorIndex:{x:[[t,v]],y,r,s}}}. Falls back to GSAP. */
  B('theatre', (el, c) => { const actors = [...el.children].filter(k=>k.tagName !== 'SCRIPT'), D = json(el) || {}, LEN = D.length || 6; el.classList.add('sc-theatre'); actors.forEach(a=>a.classList.add('sc-actor'));
    const keys = D.keys || {0:{x:[[0,-260],[1.5,0],[3,0],[4.5,240],[6,0]], y:[[0,0],[1.5,-60],[3,60],[4.5,0],[6,0]], r:[[0,-20],[3,8],[6,0]], s:[[0,.6],[1.5,1],[3,1.2],[6,1]]}, 1:{x:[[0,260],[1.5,140],[3,-160],[4.5,-120],[6,0]], y:[[0,-140],[3,120],[6,0]], r:[[0,0],[6,360]], s:[[0,1],[3,1.4],[6,.7]]}};
    const tl = document.createElement('div'); tl.className = 'sc-tl'; tl.innerHTML = '<i></i>'; el.appendChild(tl); const head = $('i', tl), status = document.createElement('span'); status.className = 'sc-hud'; status.style.cssText += ';left:12px;top:12px;right:auto;bottom:auto'; el.appendChild(status);
    [...new Set(Object.values(keys).flatMap(o=>Object.values(o).flat().map(k=>k[0])))].forEach(t=>{ const d = document.createElement('span'); d.style.left = (t/LEN*100) + '%'; tl.appendChild(d); });
    const apply = (a, v) => { if(a) a.style.transform = `translate(${v.x || 0}px, ${v.y || 0}px) rotate(${v.r || 0}deg) scale(${v.s ?? 1})`; };
    const fallback = () => { const tls = Object.entries(keys).map(([i,K])=>{ const t = gsap.timeline({paused:true}), px = {x:0, y:0, r:0, s:1}; for(const prop of Object.keys(K)){ const f = K[prop]; px[prop] = f[0][1]; for(let j=1;j<f.length;j++) t.to(px, {[prop]:f[j][1], duration:f[j][0] - f[j-1][0], ease:'power2.inOut', onUpdate:()=>apply(actors[i], px)}, f[j-1][0]); } apply(actors[i], px); return t; }); return p => tls.forEach(t=>t.progress(p)); };
    c.near(el, async ()=>{ let setP;
      try { const core = await import(S.libs.theatre), api = core.getProject ? core : (core.default || core), tracksByObject = {};
        for(const [i,K] of Object.entries(keys)){ const trackIdByPropPath = {}, trackData = {}; for(const [p,f] of Object.entries(K)){ const id = `a${i}_${p}`; trackIdByPropPath[JSON.stringify([p])] = id; trackData[id] = {type:'BasicKeyframedTrack', __debugName:id, keyframes:f.map(([t,v],j)=>({id:`${id}${j}`, position:t, connectedRight:true, handles:[.5,1,.5,0], type:'bezier', value:v}))}; } tracksByObject['a' + i] = {trackIdByPropPath, trackData}; }
        const project = api.getProject('scrolly-' + (el.id || Math.random().toString(36).slice(2,7)), {state:{sheetsById:{Scene:{staticOverrides:{byObject:{}}, sequence:{type:'PositionalSequence', length:LEN, subUnitsPerUnit:30, tracksByObject}}}, definitionVersion:'0.4.0', revisionHistory:[]}}); await project.ready;
        const sheet = project.sheet('Scene'), t = api.types; Object.keys(keys).forEach(i=>sheet.object('a' + i, {x:t.number(0), y:t.number(0), r:t.number(0), s:t.number(1)}).onValuesChange(v=>apply(actors[i], v)));
        setP = p => { sheet.sequence.position = p*LEN; }; status.textContent = 'Theatre.js'; } catch(e){ setP = fallback(); status.textContent = 'GSAP fallback'; }
      const set = p => { setP(p); head.style.left = (p*100) + '%'; status.dataset.t = (p*LEN).toFixed(1); };
      set(c.M ? 0 : 1); if(c.M){ c.ST.create({trigger:el, pin:true, start:'top top', end:'+=' + (el.dataset.length || '250%'), scrub:.5, onUpdate:s=>set(s.progress)}); c.refresh(); } }); }, {category:'animation'});

  /* physics: labelled shapes drop in, can be dragged, clicked to add; scroll speed shakes them. data-labels="Quiz,Game,…" */
  B('physics', (el, c) => { el.classList.add('sc-physics'); const cv = document.createElement('canvas'); cv.setAttribute('aria-label', el.dataset.alt || 'Shapes falling into a box'); el.prepend(cv);
    c.near(el, async ()=>{ try { if(!window.Matter) await S.load(S.libs.matter); } catch(e){ el.insertAdjacentHTML('beforeend', '<p class="sc-glfail">The physics engine could not load.</p>'); return; }
      const {Engine, Bodies, Composite, Body, Mouse, MouseConstraint, Query} = Matter, eng = Engine.create(), x = cv.getContext('2d'), dpr = Math.min(devicePixelRatio, 2), P = pal(), labels = (el.dataset.labels || 'Quiz,Game,Escape room,Slides,Infographic,Course').split(',').map(s=>s.trim()); let W = 0, H = 0, walls = [];
      const size = () => { W = el.clientWidth; H = el.clientHeight; cv.width = W*dpr; cv.height = H*dpr; walls.forEach(w=>Composite.remove(eng.world, w)); walls = [Bodies.rectangle(W/2, H+30, W*2, 60, {isStatic:true}), Bodies.rectangle(-30, H/2, 60, H*3, {isStatic:true}), Bodies.rectangle(W+30, H/2, 60, H*3, {isStatic:true})]; Composite.add(eng.world, walls); }; size(); c.onWidth(size);
      let n = 0; const add = (px, py) => { const lab = labels[n % labels.length], bg = P[n % P.length], round = ++n % 3 === 0, w = Math.min(170, 60 + lab.length*11); const b = round ? Bodies.circle(px, py, 38, {restitution:.5, friction:.1}) : Bodies.rectangle(px, py, w, 52, {chamfer:{radius:18}, restitution:.4, friction:.2}); b.plugin = {lab:round ? lab[0] : lab, bg, fg:onLight(bg) ? '#121212' : '#fff', w:round ? 76 : w, round}; Body.setAngle(b, (Math.random()-.5)*.8); Composite.add(eng.world, b); const all = Composite.allBodies(eng.world).filter(o=>!o.isStatic); if(all.length > 60) Composite.remove(eng.world, all[0]); };
      new IntersectionObserver((es, io)=>{ if(es[0].isIntersecting){ io.disconnect(); for(let i=0;i<num(el.dataset.count, 16);i++) setTimeout(()=>add(40 + Math.random()*(W - 80), -60 - Math.random()*200), c.M ? i*120 : 0); } }, {threshold:.35}).observe(el);
      if(matchMedia('(pointer:fine)').matches){ const mouse = Mouse.create(cv); mouse.pixelRatio = 1; ['mousewheel','DOMMouseScroll','wheel'].forEach(ev=>cv.removeEventListener(ev, mouse.mousewheel)); Composite.add(eng.world, MouseConstraint.create(eng, {mouse, constraint:{stiffness:.2, render:{visible:false}}})); }
      el.addEventListener('click', e=>{ const r = el.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; if(!Query.point(Composite.allBodies(eng.world).filter(b=>!b.isStatic), {x:px, y:py}).length) add(px, Math.max(20, py)); });
      const v = c.visible(el); gsap.ticker.add(()=>{ if(!v.on) return; const sp = c.M ? c.vel : 0; if(Math.abs(sp) > 1400) Composite.allBodies(eng.world).forEach(b=>{ if(!b.isStatic && Math.random() < .2) Body.applyForce(b, b.position, {x:(Math.random()-.5)*.02*b.mass, y:-Math.sign(sp)*.03*b.mass}); }); Engine.update(eng, 1000/60);
        x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,W,H); Composite.allBodies(eng.world).forEach(b=>{ if(b.isStatic || !b.plugin.bg) return; const p = b.plugin; x.save(); x.translate(b.position.x, b.position.y); x.rotate(b.angle); x.fillStyle = p.bg; x.beginPath(); p.round ? x.arc(0,0,38,0,Math.PI*2) : x.roundRect(-p.w/2, -26, p.w, 52, 18); x.fill(); x.fillStyle = p.fg; x.font = `700 ${p.round ? 26 : 16}px ${css('--sc-font-body') || 'sans-serif'}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(p.lab, 0, 1); x.restore(); }); }); }); }, {category:'physics'});

  /* film-labels: video-scrub + HTML labels that follow points in the film. data-anchors="anchors.json" ([frame][label] = [x, y, visibility] in 0–1), data-labels="A,B,C" */
  B('film-labels', (el, c) => { el.dataset.scrolly = 'video-scrub'; const names = (el.dataset.labels || '').split(',').map(s=>s.trim()).filter(Boolean), wrap = document.createElement('div'); wrap.className = 'sc-vlabels'; el.appendChild(wrap);
    const labs = names.map((n,k)=>{ const d = document.createElement('div'); d.className = 'sc-vlabel'; d.style.setProperty('--lift', (k % 2 ? 34 : 70) + 'px'); d.innerHTML = `<i></i><b>${n}</b>`; wrap.appendChild(d); return d; }); let A = [];
    if(el.dataset.anchors) c.near(el, ()=>fetch(el.dataset.anchors).then(r=>r.json()).then(j=>{ A = j; }).catch(()=>{}), '900px');
    const W0 = num(el.dataset.srcWidth, 1280), H0 = num(el.dataset.srcHeight, 800), dur = num(el.dataset.duration, 6);
    el.addEventListener('scrolly:time', e=>{ const fr = A[Math.round(clamp(e.detail.t/dur)*(A.length - 1))]; if(!fr) return; const sw = el.clientWidth, sh = el.clientHeight, s = Math.max(sw/W0, sh/H0), ox = (sw - W0*s)/2, oy = (sh - H0*s)/2;
      labs.forEach((d,k)=>{ const a = fr[k]; if(!a) return; d.style.transform = `translate(${(ox + a[0]*W0*s).toFixed(1)}px,${(oy + a[1]*H0*s).toFixed(1)}px)`; d.style.opacity = clamp(((a[2] ?? 1) - .55)/.35).toFixed(3); }); });
    S.blocks['video-scrub'].fn(el, c); }, {category:'media'});
})(window.Scrolly);
