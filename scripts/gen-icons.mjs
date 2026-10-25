/**
 * PWA Icon Generation Script
 * Generates responsive standard, maskable, and Apple Touch PWA icons
 * from the base SVG vector asset using Sharp image processing.
 */

import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(resolve(root, 'public/icon.svg'));
const outDir = resolve(root, 'public/icons');
mkdirSync(outDir, { recursive: true });

const bg = '#22332b';

// Standard icons: scale the artwork with a little breathing room.
const sizes = [192, 512];
for (const size of sizes) {
  await sharp(svg, { density: 400 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(outDir, `pwa-${size}.png`));
}

// Maskable: artwork shrunk to the safe zone (~80%) on a full-bleed background.
const maskable = 512;
await sharp({ create: { width: maskable, height: maskable, channels: 4, background: bg } })
  .composite([
    {
      input: await sharp(svg, { density: 400 })
        .resize(Math.round(maskable * 0.7), Math.round(maskable * 0.7), {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer(),
      gravity: 'center',
    },
  ])
  .png()
  .toFile(resolve(outDir, 'maskable-512.png'));

// Apple touch icon (opaque background, iOS does not like transparency).
await sharp({ create: { width: 180, height: 180, channels: 4, background: bg } })
  .composite([
    {
      input: await sharp(svg, { density: 400 })
        .resize(140, 140, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
      gravity: 'center',
    },
  ])
  .png()
  .toFile(resolve(outDir, 'apple-touch-icon.png'));

console.log('Icons written to public/icons/');
