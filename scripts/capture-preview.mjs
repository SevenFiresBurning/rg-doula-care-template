import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5188';
const browser = await chromium.launch();
await mkdir('qa/screenshots', { recursive: true });
try {
  const social = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await social.goto(`${base}/social-preview.svg`);
  await social.screenshot({ path: resolve('public/social-preview.png') });
  await social.close();
  for (const [name, width, height] of [['desktop', 1440, 1000], ['tablet', 820, 1180], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    for (const path of ['/', '/about', '/contact']) {
      await page.goto(`${base}${path}`);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `qa/screenshots/${name}-${path === '/' ? 'home' : path.slice(1)}.png`, fullPage: true });
    }
    await page.close();
  }
  console.log('Saved social-preview.png and nine responsive screenshots.');
} finally { await browser.close(); }
