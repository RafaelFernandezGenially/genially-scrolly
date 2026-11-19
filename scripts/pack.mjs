// Prepares the npm packages: bundles the kit (runtime, registry, templates, styles, skills, verify script)
// into packages/cli/kit so `npx genially-scrolly` works outside the repo, copies the licence and README,
// then runs `npm pack` for both packages into ./dist-npm.
import {cpSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';
import {execSync} from 'node:child_process';
import {dirname, join} from 'node:path'; import {fileURLToPath} from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..'), kit = join(root, 'packages/cli/kit');
if(existsSync(kit)) rmSync(kit, {recursive:true});
for(const d of ['registry', 'templates', 'styles', 'skills', 'packages/runtime/dist']) cpSync(join(root, d), join(kit, d), {recursive:true});
mkdirSync(join(kit, 'scripts'), {recursive:true}); copyFileSync(join(root, 'scripts/verify.cjs'), join(kit, 'scripts/verify.cjs'));
rmSync(join(kit, 'registry/lab-reference.json'), {force:true});
for(const p of ['packages/cli', 'packages/runtime']){ copyFileSync(join(root, 'LICENSE.md'), join(root, p, 'LICENSE.md')); }
copyFileSync(join(root, 'README.md'), join(root, 'packages/cli/README.md'));
mkdirSync(join(root, 'dist-npm'), {recursive:true});
for(const [p, d] of [['packages/runtime', 'runtime'], ['packages/cli', 'cli']]){ mkdirSync(join(root, 'dist-npm', d), {recursive:true}); console.log(d + ': ' + execSync(`npm pack --pack-destination ${join(root, 'dist-npm', d)}`, {cwd:join(root, p)}).toString().trim().split('\n').pop()); }
