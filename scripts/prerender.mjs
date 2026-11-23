import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { render, renderHead, routes, themeVariables, site, sitemap } from '../.ssr/entry-server.js';
const output = resolve('dist');
const template = await readFile(join(output, 'index.html'), 'utf8');
for (const path of [...routes(), '/404']) {
  const directory = path === '/' || path === '/404' ? output : join(output, path.slice(1));
  await mkdir(directory, { recursive: true });
  const html = template.replace('<html lang="en">', `<html lang="en" data-route="${path}" style='${themeVariables()}'>`).replace('<!--seo-->', renderHead(path)).replace('<!--app-->', render(path)).replace(/href="https:\/\/fonts.googleapis.com\/css[^\"]*"/, `href="${site.theme.fonts.stylesheet}"`);
  await writeFile(join(directory, path === '/404' ? '404.html' : 'index.html'), html.replace(/(<meta name="theme-color" content=")[^"]*("\/?>)/, `$1${site.theme.colors.background}$2`));
}
await writeFile(join(output, 'sitemap.xml'), sitemap());
await writeFile(join(output, 'robots.txt'), site.seo.indexable ? `User-agent: *\nAllow: /\nSitemap: ${site.seo.siteUrl}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
console.log(`Prerendered ${routes().length} routes and a 404 page. Placeholder template indexing is ${site.seo.indexable ? 'enabled' : 'disabled'}.`);
