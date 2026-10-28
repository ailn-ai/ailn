// Runs every reserve reference implementation and prints one line per entry.
import { spawnSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const reserve = join(here, '..', '..', 'reserve');
const dirs = readdirSync(reserve).filter((d) => existsSync(join(reserve, d, 'reference.mjs'))).sort();
let failed = 0;
for (const d of dirs) {
  const r = spawnSync(process.execPath, [join(reserve, d, 'reference.mjs')], { encoding: 'utf8' });
  const ok = r.status === 0;
  if (!ok) { failed++; console.log(`FAIL  ${d}`); console.log(r.stdout + r.stderr); }
  else console.log(`PASS  ${d}`);
}
console.log(`\n${dirs.length - failed}/${dirs.length} reserve entries passed`);
process.exit(failed === 0 ? 0 : 1);