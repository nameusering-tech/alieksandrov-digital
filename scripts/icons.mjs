// Erzeugt das Favicon-Set aus public/favicon.svg: node scripts/icons.mjs
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const svg = await readFile('public/favicon.svg');
const png = (size) => sharp(svg, { density: 600 }).resize(size, size).png().toBuffer();

await writeFile('public/apple-touch-icon.png', await png(180));
await writeFile('public/icon-192.png', await png(192));
await writeFile('public/icon-512.png', await png(512));

// favicon.ico mit eingebettetem 32px-PNG
const p32 = await png(32);
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6);
head.writeUInt8(32, 7);
head.writeUInt16LE(1, 10);
head.writeUInt16LE(32, 12);
head.writeUInt32LE(p32.length, 14);
head.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([head, p32]));
console.log('icons ok');
