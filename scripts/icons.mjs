// Erzeugt das Favicon-Set aus scripts/favicon-source.png (Logo der alten Seite, transparenter Hintergrund, 512 px):
// npm run icons
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const src = 'scripts/favicon-source.png';
const png = (size) =>
  sharp(src).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9, palette: true }).toBuffer();

await writeFile('public/favicon-32.png', await png(32));
await writeFile('public/apple-touch-icon.png', await png(180));
await writeFile('public/icon-192.png', await png(192));
await writeFile('public/icon-512.png', await png(512));

// favicon.ico mit eingebettetem 32px-PNG (für Browser, die /favicon.ico direkt abfragen)
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
