import { site, enabledServices, routes, activeFAQs } from './config';
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const absoluteUrl = (path: string) => new URL(path.replace(/^\//, ''), `${site.seo.siteUrl.replace(/\/$/, '')}/`).href;
export function renderHead(path: string) {
  const resource = path.startsWith('/resources/') ? site.resources.find(item => path === `/resources/${item.slug}`) : undefined;
  const meta = site.pageMeta[path as keyof typeof site.pageMeta];
  const title = `${resource?.title || meta?.title || 'Page not found'} | ${site.seo.title}`;
  const description = resource?.description || meta?.description || site.seo.description;
  const canonical = absoluteUrl(path === '/' ? '/' : `${path}/`);
  const indexable = site.seo.indexable && !!(meta || resource) && (!resource || resource.published);
  const graph: Record<string, unknown>[] = [{ '@type': 'WebSite', '@id': absoluteUrl('/#website'), name: site.seo.title, url: absoluteUrl('/'), description: site.seo.description }];
  if (path !== '/' && (meta || resource)) graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: site.ui.homepage, item: absoluteUrl('/') }, ...(resource ? [{ '@type': 'ListItem', position: 2, name: site.pageMeta['/resources'].title, item: absoluteUrl('/resources/') }] : []), { '@type': 'ListItem', position: resource ? 3 : 2, name: resource?.title || meta.title, item: canonical }] });
  // Only emit identity and claims after a real client has supplied and reviewed them.
  if (site.seo.enableBusinessSchema) {
    const provider = absoluteUrl('/#practice');
    graph.push({ '@type': 'ProfessionalService', '@id': provider, name: site.brand.name, url: absoluteUrl('/'), areaServed: site.brand.serviceArea, ...(site.brand.email ? { email: site.brand.email } : {}), ...(site.brand.phone ? { telephone: site.brand.phone } : {}), sameAs: site.brand.socials.map(item => item.url) });
    graph.push({ '@type': 'Person', '@id': absoluteUrl('/#practitioner'), name: site.brand.practitioner, jobTitle: 'Doula', hasCredential: site.brand.credentials.map(name => ({ '@type': 'EducationalOccupationalCredential', name })), worksFor: { '@id': provider } });
    if (path === '/services') enabledServices().forEach(service => graph.push({ '@type': 'Service', name: service.title, description: service.summary, serviceType: service.title, provider: { '@id': provider }, areaServed: site.brand.serviceArea, url: absoluteUrl(`/services/#${service.id}`) }));
  }
  if (site.seo.enableFAQSchema && (path === '/faq' || path === '/')) graph.push({ '@type': 'FAQPage', mainEntity: activeFAQs().slice(0, path === '/' ? 4 : undefined).map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) });
  if (resource?.published) graph.push({ '@type': 'Article', headline: resource.title, description: resource.description, mainEntityOfPage: canonical, ...(resource.date ? { datePublished: resource.date } : {}), ...(site.seo.enableBusinessSchema ? { author: { '@id': absoluteUrl('/#practitioner') } } : {}), ...(resource.image.src ? { image: absoluteUrl(resource.image.src) } : {}) });
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return `<title data-site-seo>${escape(title)}</title><meta name="description" content="${escape(description)}"/><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,nofollow'}"/><link rel="canonical" href="${escape(canonical)}"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:image" content="${escape(absoluteUrl(site.seo.image))}"/><meta property="og:image:alt" content="${escape(site.seo.imageAlt)}"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta property="og:url" content="${escape(canonical)}"/><meta property="og:type" content="${resource?.published ? 'article' : 'website'}"/><meta property="og:locale" content="${escape(site.seo.locale)}"/><meta name="twitter:card" content="summary_large_image"/><script type="application/ld+json">${json}</script>`;
}
export function sitemap() { return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${site.seo.indexable ? routes().filter(path => !path.startsWith('/resources/') || site.resources.some(item => item.published && path === `/resources/${item.slug}`)).map(path => `<url><loc>${escape(absoluteUrl(path === '/' ? '/' : `${path}/`))}</loc></url>`).join('') : ''}</urlset>`; }
