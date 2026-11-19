#!/usr/bin/env node
// Genially Scrolly CLI · zero dependencies · Node 18+
// npx genially-scrolly <command>   (alias: scrolly)
import {readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync, statSync, cpSync} from 'node:fs';
import {join, dirname, resolve, extname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {spawnSync} from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
// inside the npm package the kit is bundled in ../kit; in the repo it is the repo root
const KIT = existsSync(resolve(HERE, '../kit/registry/registry.json')) ? resolve(HERE, '../kit') : resolve(HERE, '../../..');
const VERSION = '0.2.0';
const C = {b:s=>`\x1b[1m${s}\x1b[0m`, g:s=>`\x1b[32m${s}\x1b[0m`, y:s=>`\x1b[33m${s}\x1b[0m`, r:s=>`\x1b[31m${s}\x1b[0m`, d:s=>`\x1b[2m${s}\x1b[0m`, m:s=>`\x1b[35m${s}\x1b[0m`};
const args = process.argv.slice(2), cmd = args[0] || 'help';
const flag = (n, d) => { const i = args.indexOf('--' + n); if(i < 0) return d; const v = args[i+1]; return (!v || v.startsWith('--')) ? true : v; };
const pos = args.filter((a,i)=>i > 0 && !a.startsWith('--') && !(args[i-1] || '').startsWith('--'));
const readJSON = p => JSON.parse(readFileSync(p, 'utf8'));
const presets = () => readJSON(join(KIT, 'styles/presets.json'));
const fonts = () => readJSON(join(KIT, 'styles/fonts.json'));
const registry = () => readJSON(join(KIT, 'registry/registry.json'));
const LIBS = {gsap:'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/', lenis:'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js'};

function page({title, theme, body, plugins=[], description=''}){
  const p = presets()[theme] ? theme : 'genially';
  const scripts = ['gsap','ScrollTrigger','ScrollToPlugin', ...new Set(plugins)].map(n=>`<script src="${LIBS.gsap}${n}.min.js"></script>`).join('\n');
  return `<!doctype html>
<html lang="en" data-sc-theme="${p}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description.replace(/"/g,'&quot;')}">
<meta name="generator" content="Genially Scrolly ${VERSION}">
<link rel="stylesheet" href="${fonts()[p]}" data-sc-fonts>
<link rel="stylesheet" href="vendor/scrolly/scrolly.css">
<link rel="stylesheet" href="vendor/scrolly/presets.css">
<link rel="stylesheet" href="styles.css">
</head>
<body>
${body}
${scripts}
<script src="vendor/scrolly/scrolly.js"></script>
<script>
  // Licence: leave null for free, non-commercial use (the "Made with Genially Scrolly" mark stays on).
  // Commercial use needs a licence key; Pro features also need the Genially connection (see LICENSE.md).
  Scrolly.init({license: null, chapters: true, progress: true});
</script>
</body>
</html>
`;
}
const vendor = dir => { const v = join(dir, 'vendor/scrolly'); mkdirSync(v, {recursive:true}); for(const f of ['scrolly.js','scrolly.css']) copyFileSync(join(KIT, 'packages/runtime/dist', f), join(v, f)); mkdirSync(join(v, 'data'), {recursive:true}); copyFileSync(join(KIT, 'packages/runtime/dist/data/land-110m.json'), join(v, 'data/land-110m.json')); copyFileSync(join(KIT, 'styles/presets.css'), join(v, 'presets.css')); };

const commands = {
  help(){ console.log(`${C.m(C.b('Genially Scrolly'))} ${VERSION} · scrollytelling for humans and agents

${C.b('Create')}
  init <dir> [--template story|course|report|launch] [--theme <preset>] [--title "…"]
  add <block> [--to index.html]     insert a block snippet before </main> (or print it)
  theme <preset> [--in index.html]  switch the style preset
${C.b('Explore')}
  catalog [--effects] [--search q] [--category c] [--reference] [--json]
  themes                            the style presets and their moods
  templates                         starter templates
${C.b('Check & ship')}
  lint [file]                       structure, accessibility, performance, licence rules
  preview [dir] [--port 5173]       local server
  verify [dir]                      desktop + phone screenshots and console errors (needs Playwright)
  build [dir] [--out dist]          copy a ready-to-host folder
${C.b('Licence & Pro')}
  license [status|activate <key>]   commercial licence (hypothetical service in this release)
  pro                               what a licence unlocks
${C.b('Agents')}
  skills update [--global]          install the /geniallyscrolly skills into .claude/skills
`); },

  init(){ const dir = resolve(pos[0] || 'my-scrolly'), tpl = flag('template', 'story'), theme = flag('theme', 'genially'), title = flag('title', 'Your title here');
    const tdir = join(KIT, 'templates', tpl); if(!existsSync(tdir)){ console.error(C.r(`No template "${tpl}". Try: ${readdirSync(join(KIT,'templates')).join(', ')}`)); process.exit(1); }
    if(existsSync(join(dir, 'index.html')) && !flag('force')){ console.error(C.r(`${dir}/index.html exists. Use --force to overwrite.`)); process.exit(1); }
    if(!presets()[theme]) console.warn(C.y(`Unknown theme "${theme}", using genially. See: scrolly themes`));
    mkdirSync(join(dir, 'assets'), {recursive:true}); vendor(dir);
    const meta = readJSON(join(tdir, 'template.json')); const short = String(title).split(/\s+/).slice(0,2).join(' ').toUpperCase().slice(0, 14);
    const fill = s => s.replace(/\{\{(\w+)\}\}/g, (m, k)=>({TITLE:title, SHORT:short, KICKER:'A Genially Scrolly story', SUBTITLE:'One sentence that says what this is and why it matters.', BIG_STATEMENT:'Write the one idea you want people to remember, in about twenty words.', BIG_NUMBER_A:'19', BIG_NUMBER_O:'0', BIG_NUMBER_B:'+', BIG_NUMBER_LABEL:'The number that matters', WORD1:'One', WORD2:'Two', WORD3:'Three', CTA_TITLE:'What happens next', CTA:'Get started'}[k] ?? m));
    writeFileSync(join(dir, 'index.html'), page({title, theme, body:fill(readFileSync(join(tdir, 'body.html'), 'utf8')), plugins:meta.plugins, description:meta.description}));
    writeFileSync(join(dir, 'styles.css'), `/* Your overrides. Change tokens here to tweak the "${theme}" preset, e.g.\n:root[data-sc-theme] { --sc-accent: #6C29FF; }\n*/\n`);
    writeFileSync(join(dir, 'scrolly.json'), JSON.stringify({template:tpl, theme, title, license:null, version:VERSION}, null, 2) + '\n');
    if(!existsSync(join(dir, 'BRIEF.md'))) writeFileSync(join(dir, 'BRIEF.md'), readFileSync(join(KIT, 'skills/geniallyscrolly/templates/BRIEF.md'), 'utf8'));
    if(!existsSync(join(dir, 'STORYBOARD.md'))) writeFileSync(join(dir, 'STORYBOARD.md'), readFileSync(join(KIT, 'skills/geniallyscrolly/templates/STORYBOARD.md'), 'utf8'));
    console.log(`${C.g('✓')} Created ${C.b(relative(process.cwd(), dir) || '.')} from the ${C.b(tpl)} template with the ${C.b(theme)} style.
  Blocks in it: ${meta.blocks.join(', ')}
  Next: ${C.b('npx genially-scrolly preview ' + (relative(process.cwd(), dir) || '.'))}  ·  ${C.b('npx genially-scrolly lint')}
  ${C.d('Free for non-commercial use with the "Made with Genially Scrolly" mark. Commercial use needs a licence: npx genially-scrolly pro')}`); },

  add(){ const name = pos[0]; const reg = registry(); const b = reg.blocks.find(x=>x.name === name), e = reg.effects.find(x=>x.name === name || x.id === name);
    if(!b && !e){ const q = String(name || '').toLowerCase(); const near = [...reg.blocks.map(x=>[x.name, x.title]), ...reg.effects.map(x=>[x.name, x.title])].filter(([n, t])=>q && (n.includes(q) || t.toLowerCase().includes(q))).map(x=>x[0]); console.error(C.r(`No block or effect "${name}".`) + (near.length ? ` Did you mean: ${[...new Set(near)].join(', ')}?` : ' Run: scrolly catalog  or  scrolly catalog --effects')); process.exit(1); }
    const snippet = b ? b.snippet : readFileSync(join(KIT, 'registry/effects', e.name + '.html'), 'utf8').replace(/^<!--.*?-->\n/, '').trim();
    const blk = b || reg.blocks.find(x=>x.name === e.block) || {}; const title = b ? b.title : e.title;
    const to = flag('to'); const snip = `\n<!-- ${title} -->\n${snippet}\n`;
    if(!to || to === true){ console.log(snip); if(blk.params) console.log(C.d(`block ${blk.name} · params: ${JSON.stringify(blk.params)}`)); if(e && e.note) console.log(C.y(e.note)); return; }
    const html = readFileSync(to, 'utf8'); if(!html.includes('</main>')){ console.error(C.r('No </main> in ' + to)); process.exit(1); }
    if(/assets\//.test(snippet)) console.log(C.y('The snippet uses sample pictures from assets/: replace them with yours (or copy examples/kitchen-sink/assets).'));
    writeFileSync(to, html.replace('</main>', `<section class="sc-section sc-wrap">${snip}</section>\n</main>`)); console.log(`${C.g('✓')} Added ${C.b(name)} to ${to}. ${blk.pin ? C.y('It pins the page: keep pinned blocks to about one per screenful.') : ''}${e && e.note ? '\n  ' + C.y(e.note) : ''}`); },

  catalog(){ const reg = registry(), q = String(flag('search', '') || '').toLowerCase(), cat = String(flag('category', '') || '').toLowerCase();
    const list = flag('reference') ? reg.reference.map(r=>({name:r.id, category:r.category, title:r.title, description:r.description, extra:'source code + demo'})) : flag('effects') ? reg.effects.map(x=>({name:x.name, category:x.category, title:x.title, description:x.description, extra:`→ ${x.block}`})) : reg.blocks.map(b=>({name:b.name, category:b.category, title:b.title, description:b.description, extra:b.pin ? 'pins' : ''}));
    const f = list.filter(x=>(!q || (x.name + x.title + x.description).toLowerCase().includes(q)) && (!cat || x.category.toLowerCase().includes(cat)));
    if(flag('json')){ console.log(JSON.stringify(f, null, 2)); return; }
    let last = ''; f.forEach(x=>{ if(x.category !== last){ last = x.category; console.log('\n' + C.m(C.b(x.category))); } console.log(`  ${C.b(x.name.padEnd(26))} ${x.title} ${C.d(x.extra)}`); });
    console.log(`\n${f.length} ${flag('reference') ? 'Lab sources (live demos: ' + reg.lab + ')' : flag('effects') ? 'effects (one per Scroll Lab effect)' : 'blocks · ' + reg.effects.length + ' ready effects: scrolly catalog --effects'} · add one: scrolly add <name> --to index.html`); },

  themes(){ for(const [k,v] of Object.entries(presets())) console.log(`${C.b(k.padEnd(26))} ${v.label.padEnd(18)} ${C.d(v.mood.join(', '))}`); },
  templates(){ for(const t of readdirSync(join(KIT, 'templates'))){ const m = readJSON(join(KIT, 'templates', t, 'template.json')); console.log(`${C.b(t.padEnd(8))} ${m.label}\n         ${C.d(m.description)}`); } },

  theme(){ const name = pos[0], file = flag('in', 'index.html'); if(!presets()[name]){ console.error(C.r('Unknown preset. Run: scrolly themes')); process.exit(1); }
    let h = readFileSync(file, 'utf8'); h = h.replace(/data-sc-theme="[^"]*"/, `data-sc-theme="${name}"`).replace(/<link rel="stylesheet" href="[^"]*" data-sc-fonts>/, `<link rel="stylesheet" href="${fonts()[name]}" data-sc-fonts>`); writeFileSync(file, h);
    try { const cfg = readJSON('scrolly.json'); cfg.theme = name; writeFileSync('scrolly.json', JSON.stringify(cfg, null, 2) + '\n'); } catch(e){}
    console.log(`${C.g('✓')} Style is now ${C.b(name)}.`); },

  lint(){ const file = resolve(pos[0] || 'index.html'); if(!existsSync(file)){ console.error(C.r('No ' + file)); process.exit(1); }
    const h = readFileSync(file, 'utf8'), reg = registry(), names = new Set(reg.blocks.map(b=>b.name)), out = []; const E = (m)=>out.push(['error', m]), W = (m)=>out.push(['warn', m]), I = (m)=>out.push(['info', m]);
    if(!/<html[^>]*\blang=/.test(h)) W('Add a lang attribute to <html>.');
    if(!/name="viewport"/.test(h)) E('Missing <meta name="viewport">: the page will not fit phones.');
    const used = [...h.matchAll(/data-scrolly="([^"]+)"/g)].map(m=>m[1]); used.filter(n=>!names.has(n)).forEach(n=>E(`Unknown block "${n}". Run: scrolly catalog`));
    const iG = h.search(/gsap@[\d.]+\/dist\/gsap\.min\.js/), iST = h.search(/ScrollTrigger\.min\.js/), iS = h.search(/scrolly(\.min)?\.js/);
    if(iG < 0 || iST < 0) E('gsap and ScrollTrigger must be loaded (pinned versions from cdn.jsdelivr.net).'); else if(iS > -1 && (iS < iG || iS < iST)) E('Load gsap and ScrollTrigger before scrolly.js.');
    if(!/Scrolly\.init\(|data-auto/.test(h)) E('Call Scrolly.init() after scrolly.js (or add data-auto to its script tag).');
    [...h.matchAll(/src="(https?:[^"]+)"/g)].forEach(m=>{ if(/@(latest|\d+)\//.test(m[1]) || (/jsdelivr|unpkg/.test(m[1]) && !/@\d+\.\d+\.\d+/.test(m[1]))) W(`Pin an exact version: ${m[1]}`); });
    [...h.matchAll(/<img\b[^>]*>/g)].forEach(m=>{ if(!/\balt=/.test(m[0])) E(`Image without alt text: ${m[0].slice(0, 80)}`); });
    const pins = used.filter(n=>{ const b = reg.blocks.find(x=>x.name === n); return b && b.pin; }).length + (h.match(/data-scrolly="counter"[^>]*data-pin/g) || []).length;
    if(pins > 8) W(`${pins} pinned blocks. Each pin adds a stretch of scroll; above ~8 the page feels long. Consider steps or plain sections for some.`); else I(`${pins} pinned blocks.`);
    [...h.matchAll(/<script type="application\/json">([\s\S]*?)<\/script>/g)].forEach((m,i)=>{ try { const j = JSON.parse(m[1]); if(j && j.type && !j.source) W(`Chart "${j.title || i}" has no "source": mark it "real" or "sample".`); } catch(e){ E(`Invalid JSON in data block #${i+1}: ${e.message}`); } });
    const steps = [...h.matchAll(/data-step="([^"]+)"/g)].map(m=>m[1]), shows = new Set([...h.matchAll(/data-show="([^"]+)"/g)].flatMap(m=>m[1].split(/\s+/))); steps.filter(s=>!shows.has(s)).forEach(s=>W(`Step "${s}" has no graphic layer with data-show="${s}".`));
    if(/\.sc-watermark[^{]*\{[^}]*(display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0)/.test(h + (existsSync(join(dirname(file), 'styles.css')) ? readFileSync(join(dirname(file), 'styles.css'), 'utf8') : '')))
      E('The "Made with Genially Scrolly" mark is hidden. Removing it needs a commercial licence (scrolly pro); it is removed automatically once a valid licence is connected.');
    if(/<h1\b/.test(h) === false) W('No <h1>: give the page one main heading.');
    if(/autoplay/.test(h) && !/muted/.test(h)) W('Autoplaying media must be muted.');
    try { for(const f of readdirSync(join(dirname(file), 'assets'))){ const s = statSync(join(dirname(file), 'assets', f)); if(s.isFile() && s.size > 10*1024*1024) W(`assets/${f} is ${(s.size/1048576).toFixed(1)} MB: compress it (video: ffmpeg -crf 28, images: WebP).`); } } catch(e){}
    const n = {error:0, warn:0}; out.forEach(([k,m])=>{ if(k !== 'info') n[k]++; console.log(`${k === 'error' ? C.r('✗ error') : k === 'warn' ? C.y('! warn ') : C.d('· info ')} ${m}`); });
    console.log(`\n${used.length} blocks · ${n.error} errors · ${n.warn} warnings`); if(n.error) process.exit(1); },

  preview(){ const dir = resolve(pos[0] || '.'), port = +flag('port', 5173); const types = {'.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.mp4':'video/mp4', '.webm':'video/webm', '.woff2':'font/woff2'};
    createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p.endsWith('/')) p += 'index.html'; const f = join(dir, p); if(!f.startsWith(dir) || !existsSync(f)){ r.writeHead(404); r.end('not found'); return; } r.writeHead(200, {'content-type':types[extname(f)] || 'application/octet-stream'}); r.end(readFileSync(f)); })
      .listen(port, ()=>console.log(`${C.g('●')} Preview on ${C.b(`http://localhost:${port}/`)}  ${C.d('(add ?calm to see the reduced-motion version)')}`)); },

  verify(){ const dir = resolve(pos[0] || '.'), r = spawnSync(process.execPath, [join(KIT, 'scripts/verify.cjs'), dir], {stdio:'inherit'}); process.exit(r.status || 0); },

  build(){ const dir = resolve(pos[0] || '.'), out = resolve(flag('out', join(dir, 'dist'))); mkdirSync(out, {recursive:true});
    for(const f of readdirSync(dir)){ if(['dist','node_modules','.scrolly'].includes(f) || f.endsWith('.md')) continue; cpSync(join(dir, f), join(out, f), {recursive:true}); }
    console.log(`${C.g('✓')} Ready to host: ${out}  ${C.d('(any static host; inside claude.ai publish index.html with the other files as an Artifact)')}`); },

  license(){ const sub = pos[0] || 'status'; let cfg = {}; try { cfg = readJSON('scrolly.json'); } catch(e){}
    if(sub === 'activate'){ const key = pos[1]; if(!/^gsl_(live|test)_[A-Za-z0-9]{20,}$/.test(key || '')){ console.error(C.r('A licence key looks like gsl_live_… (from your Genially account).')); process.exit(1); }
      cfg.license = key; writeFileSync('scrolly.json', JSON.stringify(cfg, null, 2) + '\n'); try { const f = 'index.html'; writeFileSync(f, readFileSync(f, 'utf8').replace(/license:\s*(null|'[^']*')/, `license: '${key}'`)); } catch(e){}
      console.log(`${C.y('!')} Key saved. ${C.b('The Genially licensing service is not connected in this release')}, so Pro features stay off and the mark stays on until Genially opens it. Nothing else to do on your side.`); return; }
    console.log(`${C.b('Licence')}: ${cfg.license ? 'key saved (not verified: service not connected)' : 'none · free, non-commercial use'}\n${C.d('Commercial use, removing the mark, analytics and Genially APIs need a licence. See: scrolly pro')}`); },

  pro(){ console.log(`${C.m(C.b('Genially Scrolly Pro'))} ${C.d('(licensing service is hypothetical in this release)')}
  ${C.b('Free')}         non-commercial use · every block · the "Made with Genially Scrolly" mark stays on
  ${C.b('Creator')}      commercial use for one person · no mark · Genially analytics (scroll depth, completions, quiz scores)
  ${C.b('Team')}         everything in Creator for organisations · Genially APIs: AI image generation in your style, asset library, publish to Genially
  ${C.b('Enterprise')}   SSO, LMS/xAPI export of learning results, custom terms, priority support
How it will work: buy a licence in your Genially account → copy the key → ${C.b('scrolly license activate gsl_live_…')} → the runtime verifies it with Genially and unlocks the features.
Read LICENSE.md for the exact terms.`); },

  skills(){ if(pos[0] !== 'update'){ console.log('Usage: scrolly skills update [--global]'); return; } const dest = flag('global') ? join(process.env.HOME || '.', '.claude/skills') : resolve('.claude/skills'); mkdirSync(dest, {recursive:true});
    for(const s of readdirSync(join(KIT, 'skills'))){ cpSync(join(KIT, 'skills', s), join(dest, s), {recursive:true}); console.log(`${C.g('✓')} /${s} → ${join(dest, s)}`); } }
};
(commands[cmd] || commands.help)();
