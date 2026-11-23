import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { site, routes, render, renderHead, themeVariables } from '../.ssr/entry-server.js';
for (const path of routes()) {
  const html = await readFile(join('dist', path.slice(1), 'index.html'), 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${path}: single H1`);
  assert.ok(html.includes('data-site-seo'), `${path}: prerendered metadata`);
  assert.ok(html.includes('noindex,nofollow'), `${path}: placeholders not indexed`);
  assert.ok(!html.includes('Testimonial space'), `${path}: no empty production testimonials`);
  const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1];
  assert.equal(JSON.parse(json)['@context'], 'https://schema.org');
  for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = match[1].replace(/\/$/, '') || '/';
    if (/\.[a-z0-9]+$/i.test(href)) await stat(join('dist', href.slice(1)));
    else assert.ok(routes().includes(href), `${path}: valid internal link ${href}`);
  }
}
assert.ok((await stat('dist/social-preview.png')).size > 1000, 'PNG social preview exists');
// Faith-sensitive elements are optional, and empty quotes make no claims.
assert.ok(render('/').includes(site.faith.hero.headline.split(site.faith.hero.emphasis)[0]));
assert.ok(render('/').includes('reflection-section'));
assert.ok(!render('/').includes('quote-block'));
assert.ok(render('/faq').includes(site.faith.faq.question));
site.faith.quote.enabled = true;
assert.ok(render('/').includes('quote-block'));
assert.ok(render('/').includes('[Add a client-selected quotation'));
site.faithTone = false;
assert.ok(!render('/').includes('reflection-section'));
assert.ok(!render('/').includes('quote-block'));
assert.ok(!render('/faq').includes(site.faith.faq.question));
assert.ok(!render('/about').includes(site.faith.bio.replace(/’/g, '&#x27;')));
assert.ok(!render('/contact').includes(site.faith.contact));
site.seo.enableFAQSchema = true;
assert.ok(!renderHead('/faq').includes(site.faith.faq.question));
site.faithTone = true;
assert.ok(renderHead('/faq').includes(site.faith.faq.question));
site.faith.quote.enabled = false;
// Exercise the configuration boundary with changed identity and no services.
site.brand.name = '[Rebrand test]';
site.brand.practitioner = '[Practitioner test]';
site.services.forEach(service => { service.enabled = false; });
site.theme.colors.olive = '#123456';
assert.ok(render('/').includes('[Rebrand test]'));
assert.ok(!render('/services').includes('class="service-detail'));
assert.ok(!render('/contact').includes('<option value="birth"'));
assert.ok(themeVariables().includes('--olive:#123456'));
site.seo.enableBusinessSchema = true;
site.seo.enableFAQSchema = true;
assert.ok(renderHead('/about').includes('ProfessionalService'));
assert.ok(renderHead('/about').includes('Person'));
assert.ok(renderHead('/faq').includes('FAQPage'));
site.resources[0].published = true;
assert.ok(renderHead(`/resources/${site.resources[0].slug}`).includes('Article'));
console.log(`Verified ${routes().length} prerendered routes, internal links, metadata, JSON-LD, production testimonial omission, social PNG, and rebranding/service toggles.`);
