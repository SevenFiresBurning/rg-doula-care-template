import { test, expect } from '@playwright/test';
import { site, routes, enabledServices } from '../src/config';
import AxeBuilder from '@axe-core/playwright';
test('all routes, art slots, headings, metadata, and responsive widths', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of routes()) {
    await page.goto(route);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/\| Doula Care Website Template$/);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /^https:\/\//);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/.*social-preview\.png$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(json!)['@context']).toBe('https://schema.org');
  }
  expect(errors).toEqual([]);
});
test('services, navigation, anchors, and FAQ', async ({ page }, info) => {
  await page.goto('/services');
  await expect(page.locator('.service-detail')).toHaveCount(enabledServices().length);
  for (const service of enabledServices()) await expect(page.locator(`#${service.id} h2`)).toHaveText(service.title);
  await page.goto('/');
  await page.getByRole('link', { name: site.cta.secondary, exact: true }).first().click();
  await expect(page).toHaveURL(/\/services$/);
  await page.getByRole('link', { name: site.services[1].title, exact: true }).first().click();
  await expect(page).toHaveURL(/#postpartum$/);
  await page.goto('/faq');
  const first = page.locator('details').first();
  await first.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('open', '');
  await expect(first.locator('.faq-answer')).toBeVisible();
  if (info.project.name !== 'desktop') {
    const menu = page.locator('.menu-toggle');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  }
});
test('accessible labels, semantics, and contrast', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/about', '/services', '/resources', '/faq', '/contact']) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })), route).toEqual([]);
    if (route === '/') expect(await page.locator('.closing h2').evaluate(element => getComputedStyle(element).color)).toBe(await page.locator('body').evaluate(element => getComputedStyle(element).color));
    if (route === '/faq') {
      await page.locator('details').first().locator('summary').click();
      const expanded = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(expanded.violations.map(item => item.id)).toEqual([]);
    }
  }
});
test('resources filter and detail navigation', async ({ page }) => {
  await page.goto('/resources');
  await expect(page.locator('.resource-card')).toHaveCount(site.resources.length);
  await page.getByRole('button', { name: 'Postpartum', exact: true }).click();
  await expect(page.locator('.resource-card')).toHaveCount(1);
  await page.getByRole('link', { name: site.ui.readResource }).click();
  await expect(page.locator('.notice')).toContainText('Unpublished');
});
test('consultation validation, demo state, and phone preference', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: site.cta.submit }).click();
  await expect(page.locator('input[name=name]')).toBeFocused();
  await page.getByLabel('Name', { exact: true }).fill('Template test');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByLabel('Preferred contact method').selectOption('phone');
  await page.getByRole('button', { name: site.cta.submit }).click();
  await expect(page.locator('input[name=phone]')).toBeFocused();
  await page.locator('input[name=phone]').fill('5550100100');
  await page.getByRole('button', { name: site.cta.submit }).click();
  await expect(page.getByRole('status')).toHaveText(site.form.demoSuccess);
});
test('configured endpoint success and failure', async ({ page }) => {
  await page.goto('/contact');
  await page.evaluate(async () => {
    // Use the exact live module URL, including Vite's development revision query.
    const moduleUrl = performance.getEntriesByType('resource').map(entry => entry.name).find(url => new URL(url).pathname === '/src/config.ts');
    if (!moduleUrl) throw new Error('Live configuration module not found');
    const { site } = await import(moduleUrl);
    site.form.endpoint = '/test-consultation';
  });
  await page.route('**/test-consultation', route => route.fulfill({ status: 500, body: '{}' }));
  await page.getByLabel('Name', { exact: true }).fill('Template test');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByRole('button', { name: site.cta.submit }).click();
  await expect(page.getByRole('alert')).toHaveText(site.form.error);
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Template test');
  await page.route('**/test-consultation', route => route.fulfill({ status: 200, body: '{}' }));
  await page.getByRole('button', { name: site.cta.submit }).click();
  await expect(page.getByRole('status')).toHaveText(site.form.success);
});
test('reduced motion and narrow screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('/');
  expect(await page.locator('.hero-copy').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('faith-sensitive presentation can be turned off', async ({ page }) => {
  await page.route('**/src/config.ts*', async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/faithTone:\s*true/, 'faithTone: false');
    await route.fulfill({ response, body });
  });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(site.hero.headline);
  await expect(page.locator('.reflection-section')).toHaveCount(0);
  await expect(page.locator('.quote-block')).toHaveCount(0);
  await page.goto('/about');
  await expect(page.locator('.faith-bio')).toHaveCount(0);
  await page.goto('/faq');
  await expect(page.locator('details')).toHaveCount(site.faq.length);
  await page.goto('/contact');
  await expect(page.locator('.contact-page > div > .lede')).toHaveText(site.contact.text);
});
