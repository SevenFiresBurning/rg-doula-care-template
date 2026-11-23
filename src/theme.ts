import { site } from './config';
export function themeVariables() {
  const art = Object.entries(site.theme.art).flatMap(([tone, palette]) => Object.entries(palette).map(([key, value]) => [`art-${tone}-${key}`, value]));
  return [...Object.entries({ ...site.theme.colors, ...site.theme.layout, headingFont: site.theme.fonts.heading, bodyFont: site.theme.fonts.body }), ...art].map(([key, value]) => `--${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}:${value}`).join(';');
}
export function applyTheme() {
  document.documentElement.style.cssText = themeVariables();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', site.theme.colors.background);
  const link = document.querySelector<HTMLLinkElement>('link[href*="fonts.googleapis.com/css"]');
  if (link) link.href = site.theme.fonts.stylesheet;
}
