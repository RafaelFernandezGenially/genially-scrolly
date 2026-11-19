// Builds registry/registry.json + registry/blocks/<name>.html + registry/effects/<id>.html
// from blocks.src.mjs, blocks-extra.src.mjs, effects.src.mjs and the Lab reference.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path'; import {fileURLToPath} from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const effects = (await import(join(root, 'registry/effects.src.mjs'))).default;
const base = (await import(join(root, 'registry/blocks.src.mjs'))).default;
const extra = (await import(join(root, 'registry/blocks-extra.src.mjs'))).default
  .map(b => ({...b, snippet: b.snippet || (effects.find(e => e.block === b.name) || {}).snippet}));
const blocks = [...base, ...extra];
const lab = JSON.parse(readFileSync(join(root, 'registry/lab-reference.json'), 'utf8'));
const LAB_URL = 'https://claude.ai/artifact/5WUUjtSuaiCftcwstWEFsy';
const built = new Set(JSON.parse(readFileSync(join(root, 'packages/runtime/dist/blocks.json'), 'utf8')).map(b => b.name || b));

// sanity: every block is in the runtime, every effect maps to a block, every Lab effect is covered
const errs = [];
blocks.forEach(b => { if(!built.has(b.name)) errs.push(`block ${b.name} is not in the runtime build`); if(!b.snippet) errs.push(`block ${b.name} has no snippet`); });
effects.forEach(e => { if(!e.block.startsWith('init') && !blocks.some(b => b.name === e.block)) errs.push(`effect ${e.id} uses unknown block ${e.block}`); });
lab.forEach(f => { if(!effects.some(e => e.id === f.id)) errs.push(`Lab effect ${f.id} (${f.title}) has no snippet`); });
const dupe = blocks.map(b => b.name).filter((n, i, a) => a.indexOf(n) !== i); if(dupe.length) errs.push('duplicate blocks: ' + dupe.join(', '));
if(errs.length){ console.error(errs.join('\n')); process.exit(1); }

const byId = Object.fromEntries(lab.map(f => [f.id, f]));
const effectList = effects.map(e => { const f = byId[e.id] || {}; return {id:e.id, name:e.name, category:e.category, title:e.title, block:e.block, description:f.description || '', libraries:f.tags ? f.tags.Library : [], level:f.level, ld:f.ld || undefined, note:e.note, demo:`${LAB_URL}#${e.id}`, snippet:e.snippet}; });
mkdirSync(join(root, 'registry/blocks'), {recursive:true}); mkdirSync(join(root, 'registry/effects'), {recursive:true});
blocks.forEach(b => writeFileSync(join(root, 'registry/blocks', b.name + '.html'), `<!-- ${b.title} · data-scrolly="${b.name}" -->\n${b.snippet}\n`));
effectList.forEach(e => writeFileSync(join(root, 'registry/effects', e.name + '.html'), `<!-- ${e.id} · ${e.title} · block: ${e.block}${e.note ? ' · ' + e.note : ''} -->\n${e.snippet}\n`));
const reference = lab.map(f => ({id:f.id, title:f.title, category:f.category, description:f.description, tools:f.chips, demo:`${LAB_URL}#${f.id}`, code:f.code}));
const reg = {name:'genially-scrolly', version:pkg.version, lab:LAB_URL,
  blocks:blocks.map(b => ({...b, pin:!!b.pin, effects:effectList.filter(e => e.block === b.name).map(e => e.name)})),
  effects:effectList.map(({snippet, ...e}) => e), reference};
writeFileSync(join(root, 'registry/registry.json'), JSON.stringify(reg, null, 1));
console.log(`registry: ${blocks.length} blocks · ${effectList.length} effects (all ${lab.length} Lab effects covered) · ${reference.length} reference sources`);
