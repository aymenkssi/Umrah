// 1) Captures the raw app screens (fr, en, ar) from the web version of the app.
//    Start the app first: cd frontend && npx expo start --web --port 8094
//    Then: node play-store/scripts/capture-screens.js  (needs Playwright)
const { chromium } = require('playwright');
const BASE = 'http://localhost:8094';
const out = __dirname + '/../build/raw/';
require('fs').mkdirSync(out, { recursive: true });
const T = {
  fr: { tap: 'Appuyez à la fin de chaque tour', arafat: "La station à 'Arafat", duas: 'Invocations de cette étape' },
  en: { tap: 'Tap at the end of each round', arafat: 'Standing at Arafat', duas: "Du'as of this step" },
  ar: { tap: 'اضغط عند نهاية كل شوط', arafat: 'الوقوف بعرفة', duas: 'أدعية هذه المرحلة' },
};
(async () => {
  const b = await chromium.launch();
  for (const lang of ['fr', 'en', 'ar']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 3, locale: lang,
      geolocation: { latitude: 21.4225, longitude: 39.8262 }, permissions: ['geolocation'], timezoneId: 'Asia/Riyadh' });
    await ctx.addInitScript((l) => { localStorage.setItem('app_language', l); localStorage.setItem('theme_preference', 'light'); }, lang);
    await ctx.route('https://pelerinage.creationapp.academy/**', (r) => r.abort());
    const p = await ctx.newPage();
    const go = async (path) => { await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 120000 }); await p.waitForTimeout(900); };
    const snap = async (name) => p.screenshot({ path: `${out}${lang}-${name}.png` });
    const scroller = () => p.evaluate(() => [...document.querySelectorAll('div')].filter((d) => d.scrollHeight > d.clientHeight + 50 && ['auto','scroll'].includes(getComputedStyle(d).overflowY)));

    await go('/home'); await snap('1-home');

    await go('/guide?rite=hajj');
    await p.getByText(T[lang].arafat, { exact: true }).click(); await p.waitForTimeout(500);
    await p.getByText(T[lang].duas, { exact: true }).evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await p.evaluate(() => { for (const d of document.querySelectorAll('div')) if (d.scrollTop > 0) d.scrollTop -= 36; });
    await p.waitForTimeout(400); await snap('2-hajj-dua');

    await go('/guide?rite=hajj'); await snap('3-hajj-steps');

    await go('/counter?kind=tawaf');
    const tap = p.getByText(T[lang].tap, { exact: true });
    for (let i = 0; i < 3; i++) { await tap.click(); await p.waitForTimeout(250); }
    await p.waitForTimeout(500); await snap('4-counter');

    await go('/prayer-times'); await p.waitForTimeout(1500); await snap('5-prayers');
    await go('/duas'); await snap('6-duas');
    await go('/checklist'); await snap('7-checklist');
    await ctx.close();
  }
  await b.close();
})();
