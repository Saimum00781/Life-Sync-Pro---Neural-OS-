import sharp from 'sharp';
import fs from 'fs';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad-tl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00ff7f" />
      <stop offset="100%" stop-color="#00cc66" />
    </linearGradient>
    <linearGradient id="grad-bl" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#008080" />
      <stop offset="100%" stop-color="#00b3b3" />
    </linearGradient>
    <linearGradient id="grad-br" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#87ceeb" />
      <stop offset="100%" stop-color="#4682b4" />
    </linearGradient>
    <linearGradient id="grad-tr" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00ffff" />
      <stop offset="100%" stop-color="#00cccc" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.4" />
    </filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="512" height="512" rx="112" fill="#1e293b"/>
  
  <g transform="translate(256, 256)" fill="none" stroke-width="48" stroke-linecap="round" filter="url(#shadow)">
    <path d="M 0 -140 A 140 140 0 0 0 -140 0" stroke="url(#grad-tl)" />
    <path d="M -140 0 A 140 140 0 0 0 0 140" stroke="url(#grad-bl)" />
    <path d="M 0 140 A 140 140 0 0 0 140 0" stroke="url(#grad-br)" />
    <path d="M 140 0 A 140 140 0 0 0 0 -140" stroke="url(#grad-tr)" />
  </g>

  <g transform="translate(256, 256)" fill="none" stroke-width="48" stroke-linecap="round" filter="url(#shadow)">
    <path d="M 0 -140 A 140 140 0 0 0 -99 -99" stroke="url(#grad-tl)" />
    <path d="M -140 0 A 140 140 0 0 0 -99 99" stroke="url(#grad-bl)" />
    <path d="M 0 140 A 140 140 0 0 0 99 99" stroke="url(#grad-br)" />
    <path d="M 140 0 A 140 140 0 0 0 99 -99" stroke="url(#grad-tr)" />
  </g>

  <g filter="url(#glow)">
    <circle cx="256" cy="256" r="16" fill="#39ff14" />
    <path d="M 256 256 L 256 160" stroke="#39ff14" stroke-width="20" stroke-linecap="round" />
    <path d="M 256 256 L 336 256" stroke="#39ff14" stroke-width="20" stroke-linecap="round" />
  </g>
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
