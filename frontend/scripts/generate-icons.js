// Draws the app icons (Kaaba on an eight-pointed star) and writes them to assets/.
// Run from the frontend folder with Playwright available: node scripts/generate-icons.js
const { chromium } = require('playwright');

// Artwork on a 1024 grid, centred on (512, 512).
function art() {
  // Rub el hizb: two squares, one rotated 45 degrees.
  const s = 300; // half side
  const sq = `M${512 - s},${512 - s} h${2 * s} v${2 * s} h${-2 * s} Z`;
  // Isometric Kaaba
  const cx = 512, top = 318, w = 205, h = 118, H = 262; // half width, iso rise, wall height
  const T = [cx, top], R = [cx + w, top + h], B = [cx, top + 2 * h], L = [cx - w, top + h];
  const p = (a) => a.map((q) => q.join(',')).join(' ');
  const band = (y0, y1, left) => left
    ? p([[L[0], L[1] + y0], [B[0], B[1] + y0], [B[0], B[1] + y1], [L[0], L[1] + y1]])
    : p([[B[0], B[1] + y0], [R[0], R[1] + y0], [R[0], R[1] + y1], [B[0], B[1] + y1]]);
  // Door on the left face: parallelogram following the slope.
  const t = (x) => h / w * (x - L[0]); // rise along left face from L
  const dx0 = cx - 120, dx1 = cx - 62;
  const door = p([[dx0, L[1] + t(dx0) + 120], [dx1, L[1] + t(dx1) + 120], [dx1, L[1] + t(dx1) + 225], [dx0, L[1] + t(dx0) + 225]]);
  return `
    <defs>
      <radialGradient id="bg" cx="50%" cy="42%" r="70%">
        <stop offset="0" stop-color="#16875E"/><stop offset="1" stop-color="#0A4F37"/>
      </radialGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F1D77A"/><stop offset="1" stop-color="#C99A2E"/>
      </linearGradient>
    </defs>
    <g fill="#0E6B4A" fill-opacity="0.6">
      <path d="${sq}"/><path d="${sq}" transform="rotate(45 512 512)"/>
    </g>
    <g fill="none" stroke="url(#gold)" stroke-width="20" stroke-linejoin="round">
      <path d="${sq}"/><path d="${sq}" transform="rotate(45 512 512)"/>
      <circle cx="512" cy="512" r="238" stroke-width="6" stroke-opacity="0.5"/>
    </g>
    <g>
      <polygon points="${p([T, R, B, L])}" fill="#3A3F3B"/>
      <polygon points="${p([L, B, [B[0], B[1] + H], [L[0], L[1] + H]])}" fill="#1E2220"/>
      <polygon points="${p([B, R, [R[0], R[1] + H], [B[0], B[1] + H]])}" fill="#121513"/>
      <polygon points="${band(48, 84, true)}" fill="url(#gold)"/>
      <polygon points="${band(48, 84, false)}" fill="#B8892A"/>
      <polygon points="${door}" fill="url(#gold)"/>
      <polyline points="${p([L, B, R])}" fill="none" stroke="#4A504B" stroke-width="3"/>
    </g>`;
}

const svg = (size, { bg, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  ${bg ? '<rect width="1024" height="1024" fill="url(#bg)"/>' : ''}
  <g transform="translate(512 ${512 + (bg ? 0 : 0)}) scale(${scale}) translate(-512 -512)">${art()}</g>
</svg>`;

// The adaptive icon keeps the artwork inside Android's safe zone (66 % circle).
const outputs = [
  ['assets/images/icon.png', 1024, { bg: true, scale: 0.92 }],
  ['assets/store/play-store-512.png', 512, { bg: true, scale: 0.92 }],
  ['assets/images/adaptive-icon.png', 1024, { bg: false, scale: 0.74 }],
  ['assets/images/splash-icon.png', 1024, { bg: false, scale: 0.95 }],
  ['assets/images/favicon.png', 196, { bg: true, scale: 0.95 }],
];

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage();
  for (const [name, size, opts] of outputs) {
    await page.setViewportSize({ width: size, height: size });
    // The artwork references #bg even without the background rect: keep defs, no rect.
    await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${svg(size, opts)}`);
    await page.locator('svg').screenshot({ path: name, omitBackground: true });
  }
  await b.close();
})();
