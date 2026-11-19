/*! Genially Scrolly v0.2.0 · scrollytelling runtime
 *  Free for non-commercial use under the Genially Scrolly License (see LICENSE.md).
 *  Commercial use, removing the "Made with Genially Scrolly" mark, analytics and Genially APIs need a licence.
 *  Needs gsap + ScrollTrigger loaded first. Optional: SplitText, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin, Lenis. */
(function(global){
  'use strict';
  const VERSION = '0.2.0';
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
