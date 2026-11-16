// Prüft alle internen Links und Asset-Verweise im Build: npm run build && npm run check:links
import { readdir, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const dist = 'dist';
const base = (process.env.SITE_BASE || '').replace(/\/$/, '');
const walk = async (dir) =>
  (await Promise.all((await readdir(dir, { withFileTypes: true })).map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : join(dir, e.name))))).flat();

const files = (await walk(dist)).filter((f) => f.endsWith('.html'));
const exists = async (p) => access(p).then(() => true, () => false);
let broken = 0;
let total = 0;

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)(#[^"]*)?"/g)];
  const srcsets = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => [null, s.trim().split(' ')[0]]));
  for (const [, path, hash] of [...refs, ...srcsets]) {
    if (!path || !path.startsWith('/') || path.startsWith('//')) continue;
    total++;
    if (base && !path.startsWith(base)) { broken++; console.log(`NO BASE ${file}: ${path}`); continue; }
    const target = join(dist, decodeURI(base ? path.slice(base.length) : path));
    const candidate = path.endsWith('/') ? join(target, 'index.html') : target;
    if (!(await exists(candidate))) {
      broken++;
      console.log(`BROKEN ${file}: ${path}`);
      continue;
    }
    if (hash && hash.length > 1 && candidate.endsWith('.html')) {
      const doc = await readFile(candidate, 'utf8');
      if (!doc.includes(`id="${hash.slice(1)}"`)) {
        broken++;
        console.log(`MISSING ANCHOR ${file}: ${path}${hash}`);
      }
    }
  }
}
console.log(`${files.length} Seiten, ${total} interne Verweise geprüft, ${broken} defekt`);
process.exit(broken ? 1 : 0);
