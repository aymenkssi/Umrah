// 2) Builds the Play Store images (1080x1920 screenshots with a caption, 1024x500 feature graphics)
//    from the raw screens. Fonts: npm pack @fontsource/figtree @fontsource/noto-kufi-arabic into
//    play-store/build/fonts/<package>/ (see the paths below). Output: play-store/build/out/.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const D = __dirname + '/../build';
const F = D + '/fonts/';
const font = (fam, file, w) => `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(F + file).toString('base64')}) format('woff2');}`;
const faces = [
  font('Figtree', 'fontsource-figtree-5.3.0/package/files/figtree-latin-800-normal.woff2', 800),
  font('Figtree', 'fontsource-figtree-5.3.0/package/files/figtree-latin-500-normal.woff2', 500),
  font('Kufi', 'fontsource-noto-kufi-arabic-5.3.0/package/files/noto-kufi-arabic-arabic-800-normal.woff2', 800),
  font('Kufi', 'fontsource-noto-kufi-arabic-5.3.0/package/files/noto-kufi-arabic-arabic-700-normal.woff2', 700),
].join('');
const star = `<svg viewBox="0 0 100 100" width="900" height="900" style="position:absolute;opacity:.07">
  <g fill="none" stroke="#F1D77A" stroke-width="2"><rect x="20" y="20" width="60" height="60"/><rect x="20" y="20" width="60" height="60" transform="rotate(45 50 50)"/></g></svg>`;
const base = `*{margin:0;box-sizing:border-box}body{width:W;height:H;overflow:hidden;position:relative;
  background:radial-gradient(120% 80% at 50% 20%,#16875E,#0A4F37);font-family:Figtree,Kufi,sans-serif;color:#fff}`;

const CAPTIONS = {
  fr: ['Votre compagnon pour la Omra et le Hajj', 'Les invocations de chaque étape', 'Le Hajj jour par jour, du 8 au 13 Dhoul Hijja',
    "Compteur de tours pour le Tawaf et le Sa'i", 'Horaires de prière et rappels', 'Des invocations pour chaque moment', 'Une checklist pour ne rien oublier'],
  en: ['Your companion for Umrah and Hajj', "The du'as of every step", 'Hajj day by day, 8 to 13 Dhul Hijjah',
    "Lap counter for Tawaf and Sa'i", 'Prayer times and reminders', "Du'as for every moment", 'A checklist so you forget nothing'],
  ar: ['رفيقك في العمرة والحج', 'أدعية كل مرحلة', 'الحج يوماً بيوم من ٨ إلى ١٣ ذي الحجة',
    'عدّاد أشواط الطواف والسعي', 'أوقات الصلاة والتنبيهات', 'أدعية مأثورة لكل موقف', 'قائمة تجهيز حتى لا تنسى شيئاً'],
};
const NAMES = ['1-home', '2-hajj-dua', '3-hajj-steps', '4-counter', '5-prayers', '6-duas', '7-checklist'];
const FEATURE = {
  fr: ['Compagnon de la Omra et du Hajj', 'Guide pas à pas · Invocations · Prières · Qibla'],
  en: ['Umrah & Hajj Companion', "Step-by-step guide · Du'as · Prayer times · Qibla"],
  ar: ['رفيق العمرة والحج', 'دليل خطوة بخطوة · أدعية · الصلاة · القبلة'],
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const lang of ['fr', 'en', 'ar']) {
    const dir = `${D}/out/screenshots-${lang}`;
    fs.mkdirSync(dir, { recursive: true });
    const rtl = lang === 'ar';
    for (let i = 0; i < NAMES.length; i++) {
      const img = 'data:image/png;base64,' + fs.readFileSync(`${D}/raw/${lang}-${NAMES[i]}.png`).toString('base64');
      await p.setViewportSize({ width: 1080, height: 1920 });
      await p.setContent(`<html dir="${rtl ? 'rtl' : 'ltr'}"><style>${faces}${base.replace('W', '1080px').replace('H', '1920px')}
        .cap{position:absolute;top:120px;left:80px;right:80px;text-align:center;font-weight:800;font-size:${rtl ? 76 : 80}px;line-height:1.2;text-wrap:balance}
        .phone{position:absolute;left:125px;top:420px;width:830px;border-radius:70px;background:#101412;padding:18px;box-shadow:0 30px 80px rgba(0,0,0,.35)}
        .phone img{display:block;width:100%;border-radius:54px}
      </style><body>${star.replace('position:absolute', 'position:absolute;left:90px;top:520px')}
        <div class="cap">${CAPTIONS[lang][i]}</div><div class="phone"><img src="${img}"></div></body></html>`, { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      await p.screenshot({ path: `${dir}/${String(i + 1).padStart(2, '0')}-${NAMES[i].slice(2)}.png` });
    }
    // Feature graphic 1024x500
    await p.setViewportSize({ width: 1024, height: 500 });
    await p.setContent(`<html dir="${rtl ? 'rtl' : 'ltr'}"><style>${faces}${base.replace('W', '1024px').replace('H', '500px')}
      .wrap{position:absolute;inset:0;display:flex;align-items:center;gap:56px;padding:0 72px}
      .icon{width:260px;height:260px;border-radius:58px;box-shadow:0 20px 50px rgba(0,0,0,.35);flex:none}
      h1{font-weight:800;font-size:${rtl ? 60 : 54}px;line-height:1.2;text-wrap:balance;${rtl ? 'white-space:nowrap' : ''}}
      p{margin-top:18px;font-weight:${rtl ? 700 : 500};font-size:${rtl ? 23 : 27}px;color:#F1D77A;line-height:1.5}
    </style><body>${star.replace('position:absolute', 'position:absolute;right:-250px;top:-200px')}
      <div class="wrap"><img class="icon" src="data:image/png;base64,${fs.readFileSync(__dirname + '/../images/icon-512.png').toString('base64')}"><div><h1>${FEATURE[lang][0]}</h1><p>${FEATURE[lang][1]}</p></div></div></body></html>`, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${D}/out/feature-graphic-${lang}.png` });
  }
  await b.close();
})();
