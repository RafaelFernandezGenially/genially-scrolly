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
