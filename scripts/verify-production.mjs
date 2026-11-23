import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { routes } from '../.ssr/entry-server.js';
const browser = await chromium.launch();
try {
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && /hydrat|React error|matching/i.test(message.text())) errors.push(message.text()); });
    for (const route of routes()) {
      const response = await page.goto(`http://127.0.0.1:5189${route}/`.replace(/\/\/$/, '/'));
      assert.equal(response.status(), 200, route);
      assert.equal(await page.locator('main h1').count(), 1, route);
      assert.ok((await page.title()).includes('Doula Care Website Template'));
      assert.equal(await page.locator('.testimonial-placeholder').count(), 0);
      assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex,nofollow');
    }
    assert.deepEqual(errors, [], 'No production/hydration errors');
    if (javaScriptEnabled) {
      await page.goto('http://127.0.0.1:5189/contact/');
      await page.getByLabel('Name', { exact: true }).fill('Template test');
      await page.getByLabel('Email', { exact: true }).fill('test@example.com');
      await page.getByRole('button', { name: 'Request a Consultation' }).click();
      assert.ok((await page.getByRole('status').textContent()).includes('nothing was sent or stored'));
      await page.goto('http://127.0.0.1:5189/not-a-page');
      assert.equal(await page.locator('main h1').textContent(), 'A little off the path.');
      assert.ok((await page.title()).includes('Page not found'));
      assert.deepEqual(errors, [], 'No errors on not-found fallback');
    }
    await context.close();
  }
  const screenshotPage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await screenshotPage.goto('http://127.0.0.1:5189/');
  await screenshotPage.evaluate(() => document.fonts.ready);
  await screenshotPage.screenshot({ path: 'qa/screenshots/desktop-preview.png' });
  console.log('Production verified: 12 routes with and without JavaScript, metadata, no empty reviews, no hydration errors, and working demo form.');
} finally { await browser.close(); }
