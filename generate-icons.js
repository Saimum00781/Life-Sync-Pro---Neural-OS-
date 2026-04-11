import sharp from 'sharp';
import fs from 'fs';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <path d="M256 120 L376 256 L256 392 L136 256 Z" fill="none" stroke="url(#accent)" stroke-width="24" stroke-linejoin="round"/>
  <path d="M256 176 L312 256 L256 336 L200 256 Z" fill="url(#accent)" />
</svg>`;

fs.writeFileSync('public/icon.svg', svgContent);

async function generateIcons() {
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');
    
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile('public/icon-512.png');
    
  console.log('Icons generated successfully!');
}

generateIcons();
