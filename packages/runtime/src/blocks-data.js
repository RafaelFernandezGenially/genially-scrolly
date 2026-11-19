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
