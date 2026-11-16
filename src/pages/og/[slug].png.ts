import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { projects } from '../../data/site';
import { dicts, type Lang } from '../../i18n';

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFile(require.resolve(`@fontsource/${pkg}/files/${file}`));

type Card = { title: string; kicker: string; lang: Lang };
const pages: Record<string, Card> = {};
for (const lang of ['de', 'uk'] as Lang[]) {
  const d = dicts[lang];
  const prefix = lang === 'uk' ? 'uk-' : '';
  for (const [slug, card] of Object.entries(d.og)) pages[prefix + slug] = { ...card, lang };
  for (const p of projects) pages[prefix + p.slug] = { title: d.projects.items[p.slug].title, kicker: d.projects.items[p.slug].kind, lang };
}

export function getStaticPaths() {
  return Object.keys(pages).map((slug) => ({ params: { slug } }));
}

const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ params }) => {
  const page = pages[params.slug!];
  const [barlow, oswaldCyr, oswaldLat, ptSans, ptSansCyr] = await Promise.all([
    font('barlow-condensed', 'barlow-condensed-latin-600-normal.woff'),
    font('oswald', 'oswald-cyrillic-600-normal.woff'),
    font('oswald', 'oswald-latin-600-normal.woff'),
    font('pt-sans', 'pt-sans-latin-700-normal.woff'),
    font('pt-sans', 'pt-sans-cyrillic-700-normal.woff'),
  ]);
  const display = page.lang === 'uk' ? 'Oswald' : 'Barlow';
  const city = page.lang === 'uk' ? dicts.uk.city : dicts.de.city;

  const tree = el(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 64,
      backgroundColor: '#111',
      backgroundImage: 'radial-gradient(circle at 88% 30%, #ffa64d 0%, #ff8000 16%, #994d00 38%, #3d1f00 58%, #111 78%)',
      color: '#fff',
    },
    [
      el('div', { display: 'flex', alignItems: 'center', fontFamily: 'PT Sans', fontSize: 30 }, [
        el('div', { width: 14, height: 14, borderRadius: 7, backgroundColor: '#ff8000', marginRight: 16 }),
        page.kicker,
      ]),
      el(
        'div',
        { display: 'flex', fontFamily: display, fontSize: page.title.length > 40 ? 92 : 116, lineHeight: 0.95, letterSpacing: -2, maxWidth: 860 },
        page.title,
      ),
      el('div', { display: 'flex', fontFamily: 'PT Sans', fontSize: 28, color: '#e6e6e6' }, `alieksandrov-digital.de · ${city}`),
    ],
  );

  const svg = await satori(tree as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Barlow', data: barlow, weight: 600, style: 'normal' },
      { name: 'Oswald', data: oswaldCyr, weight: 600, style: 'normal' },
      { name: 'Oswald', data: oswaldLat, weight: 600, style: 'normal' },
      { name: 'PT Sans', data: ptSans, weight: 700, style: 'normal' },
      { name: 'PT Sans', data: ptSansCyr, weight: 700, style: 'normal' },
    ],
  });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true, colours: 128 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
