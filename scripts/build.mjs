// Builds packages/runtime/dist/scrolly.js and scrolly.css from src (no dependencies).
import {readFileSync, writeFileSync, mkdirSync, copyFileSync} from 'node:fs';
import {dirname, join} from 'node:path'; import {fileURLToPath} from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..'), src = join(root, 'packages/runtime/src'), dist = join(root, 'packages/runtime/dist');
mkdirSync(join(dist, 'data'), {recursive:true}); copyFileSync(join(root, 'packages/runtime/data/land-110m.json'), join(dist, 'data/land-110m.json'));
const js = ['core.js','blocks-motion.js','blocks-data.js','blocks-more.js','blocks-ui.js','blocks-viz.js','blocks-3d.js'].map(f=>readFileSync(join(src, f), 'utf8')).join('\n');
writeFileSync(join(dist, 'scrolly.js'), js); copyFileSync(join(src, 'scrolly.css'), join(dist, 'scrolly.css'));
const blocks = [...js.matchAll(/\bB\('([a-z0-9-]+)'/g)].map(m=>m[1]);
writeFileSync(join(dist, 'blocks.json'), JSON.stringify(blocks, null, 2));
console.log(`scrolly.js ${(js.length/1024).toFixed(1)} KB · ${blocks.length} blocks: ${blocks.join(', ')}`);
// minified copies (optional: needs the esbuild dev dependency)
try { const {transformSync} = await import('esbuild');
  const mj = transformSync(js, {minify:true, legalComments:'inline', target:'es2019'}).code; writeFileSync(join(dist, 'scrolly.min.js'), mj);
  const mc = transformSync(readFileSync(join(src, 'scrolly.css'), 'utf8'), {loader:'css', minify:true}).code; writeFileSync(join(dist, 'scrolly.min.css'), mc);
  console.log(`scrolly.min.js ${(mj.length/1024).toFixed(1)} KB · scrolly.min.css ${(mc.length/1024).toFixed(1)} KB`); } catch(e){ console.log('(no esbuild: skipped minified files)', e.message); }
