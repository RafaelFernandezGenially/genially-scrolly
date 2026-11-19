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
