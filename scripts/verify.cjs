// scrolly verify <dir>: opens the page in Chromium (Playwright), desktop 1280x800 and phone 390x844,
// scrolls through it, screenshots every block, and reports console errors, failed blocks and overflow.
// Needs: npm i -D playwright && npx playwright install chromium   (already present in Claude's sandbox)
const http = require('http'), fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || '.'), out = path.join(dir, '.scrolly/verify');
let chromium; try { ({chromium} = require('playwright')); } catch(e){ console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium'); process.exit(2); }
const types = {'.html':'text/html; charset=utf-8', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.mp4':'video/mp4', '.webm':'video/webm', '.svg':'image/svg+xml'};
const srv = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p.endsWith('/')) p += 'index.html'; const f = path.join(dir, p); if(!f.startsWith(dir) || !fs.existsSync(f)){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type':types[path.extname(f)] || 'application/octet-stream'}); r.end(fs.readFileSync(f)); });
srv.listen(0, async ()=>{
  const url = `http://127.0.0.1:${srv.address().port}/index.html`; fs.mkdirSync(out, {recursive:true}); const report = [];
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  for(const [W,H,tag] of [[1280,800,'desktop'],[390,844,'phone']]){
    const p = await b.newPage({viewport:{width:W, height:H}}); const errs = [];
    p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{ if(m.type() === 'error' && !(process.env.SCROLLY_CDN_MAP && /net::ERR_FAILED/.test(m.text()))) errs.push(m.text()); });
    // offline sandboxes: route external CDNs to local copies when SCROLLY_CDN_MAP points to a JSON {urlPrefix: localDir}
    if(process.env.SCROLLY_CDN_MAP){ const map = JSON.parse(fs.readFileSync(process.env.SCROLLY_CDN_MAP, 'utf8')); await p.route(/^https?:/, r=>{ const u = r.request().url(); const k = Object.keys(map).find(x=>u.startsWith(x)); if(k){ const f = path.join(map[k], u.slice(k.length).split('?')[0]); return fs.existsSync(f) ? r.fulfill({path:f, headers:{'access-control-allow-origin':'*'}}) : r.abort(); } return u.startsWith('http://127.0.0.1') ? r.continue() : r.abort(); }); }
    await p.goto(url); await p.waitForTimeout(1500);
    const total = await p.evaluate(()=>document.documentElement.scrollHeight); for(let y=0;y<total;y+=H*.8){ await p.evaluate(v=>scrollTo(0,v), y); await p.waitForTimeout(40); } await p.waitForTimeout(1200);
    const info = await p.evaluate(()=>({blocks:[...document.querySelectorAll('[data-scrolly]')].map(e=>e.dataset.scrolly), failed:[...document.querySelectorAll('.sc-failed')].map(e=>e.dataset.scrolly), overflow:document.documentElement.scrollWidth > innerWidth + 1, mark:!!document.querySelector('.sc-watermark'), pins:window.ScrollTrigger ? ScrollTrigger.getAll().filter(s=>s.pin).length : 0}));
    const n = info.blocks.length;
    for(let i=0;i<n;i++){ const y = await p.evaluate(i=>{ const el = document.querySelectorAll('[data-scrolly]')[i]; const st = window.ScrollTrigger && ScrollTrigger.getAll().find(s=>s.pin === el); if(st) return st.start + (st.end - st.start)*.6; const r = el.getBoundingClientRect(); return r.top + scrollY - innerHeight*.2; }, i);
      await p.evaluate(v=>scrollTo(0,v), y); await p.waitForTimeout(700); await p.screenshot({path:path.join(out, `${tag}-${String(i).padStart(2,'0')}-${info.blocks[i]}.jpg`), type:'jpeg', quality:60}); }
    report.push(`## ${tag} ${W}×${H}\n- blocks: ${n} (${info.pins} pinned)\n- failed blocks: ${info.failed.join(', ') || 'none'}\n- horizontal overflow: ${info.overflow ? 'YES, fix it' : 'no'}\n- Genially Scrolly mark: ${info.mark ? 'present' : 'absent (only allowed with a licence)'}\n- console errors: ${errs.length ? '\n  - ' + [...new Set(errs)].slice(0,12).join('\n  - ') : 'none'}\n`);
    await p.close(); }
  await b.close(); srv.close();
  fs.writeFileSync(path.join(out, 'REPORT.md'), `# Verify report\n\n${report.join('\n')}\nScreenshots: ${out}\nLook at every screenshot: the checks above catch errors, not ugly layouts.\n`);
  console.log(fs.readFileSync(path.join(out, 'REPORT.md'), 'utf8'));
});
