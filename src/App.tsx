import { useState } from 'react';
import { site, enabledServices } from './config';
import { Header, Hero, ValuePillars, ServiceGrid, PractitionerBio, ServiceDetail, ProcessSteps, TestimonialSection, FAQAccordion, ConsultationCTA, ConsultationForm, ImageArtSlot, ResourceCard, Footer, ReflectiveValues, QuoteBlock, Link } from './components';

function Home() {
  return <><Hero/><ValuePillars/><section className="shell section services-overview"><div className="section-heading"><div><p className="eyebrow">{site.headings.servicesEyebrow}</p><h2>{site.headings.services}</h2></div><Link className="text-link" href="/services">{site.cta.secondary}</Link></div><ServiceGrid featuredOnly/></section><div className="sage-section"><PractitionerBio/></div><ReflectiveValues/>{site.faithTone && <QuoteBlock quote={site.faith.quote}/>} {enabledServices().filter(service => service.homeDetail).map((service, index) => <ServiceDetail service={service} key={service.id} compact index={index}/>)}<div className="shell editorial-strip"><ImageArtSlot image={site.images.editorial}/><p>{site.hero.note}</p></div><ProcessSteps/><TestimonialSection/><section className="shell section faq-section"><div><p className="eyebrow">{site.headings.faqEyebrow}</p><h2>{site.headings.faq}</h2><Link className="text-link" href="/faq">{site.navigation.find(item => item.href === '/faq')?.label}</Link></div><FAQAccordion limit={4}/></section><ConsultationCTA/></>;
}
function About() {
  return <><PractitionerBio full/><section className="shell section about-story split"><div><p className="eyebrow">{site.bio.eyebrow}</p><h2>{site.bio.storyTitle}</h2><p className="placeholder-copy">{site.bio.story}</p><h2 className="secondary-heading">{site.bio.philosophyTitle}</h2><p className="placeholder-copy">{site.bio.philosophy}</p></div><ImageArtSlot image={site.images.about}/></section><section className="sage-section"><div className="shell section area-block"><p className="eyebrow">{site.contact.areaLabel}</p><h2>{site.bio.areaTitle}</h2><p className="lede">{site.brand.serviceArea}</p><p>{site.bio.areaDescription}</p></div></section><ValuePillars/><ReflectiveValues/>{site.faithTone && <QuoteBlock quote={site.faith.quote}/>}<ConsultationCTA/></>;
}
function Services() {
  return <><section className="shell page-heading"><p className="eyebrow">{site.headings.servicesEyebrow}</p><h1>{site.headings.services}</h1><p className="lede">{site.headings.servicesDescription}</p><nav className="jump-links" aria-label={site.pageMeta['/services'].title}>{enabledServices().map(service => <Link key={service.id} href={`#${service.id}`}>{service.title}</Link>)}</nav><p className="small-copy">{site.serviceLabels.note}</p></section>{enabledServices().length ? enabledServices().map((service, index) => <ServiceDetail key={service.id} service={service} index={index}/>) : <p className="shell">{site.ui.emptyServices}</p>}<aside className="shell scope-note"><p>{site.serviceLabels.scope}</p></aside><ProcessSteps/><ConsultationCTA/></>;
}
function Resources() {
  const [category, setCategory] = useState('');
  const resources = site.resources.filter(resource => !category || resource.category === category);
  return <><section className="shell page-heading"><p className="eyebrow">{site.headings.resourcesEyebrow}</p><h1>{site.headings.resources}</h1><p className="lede">{site.headings.resourcesDescription}</p></section><section className="shell resource-library"><div className="filters" aria-label={site.pageMeta['/resources'].title}>{['', ...site.resourceCategories].map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item || site.ui.allResources}</button>)}</div><div className="resource-grid" aria-live="polite">{resources.length ? resources.map(resource => <ResourceCard key={resource.slug} resource={resource}/>) : <p>{site.ui.noResources}</p>}</div></section><ConsultationCTA/></>;
}
function ResourcePage({ slug }: { slug: string }) {
  const resource = site.resources.find(item => item.slug === slug);
  if (!resource) return <NotFound/>;
  return <><article className="shell article-page"><Link className="text-link" href="/resources">{site.ui.resourceBack}</Link><p className="eyebrow">{resource.category}</p><h1>{resource.title}</h1><p className="lede">{resource.description}</p>{!resource.published && <p className="notice">{site.ui.resourceNotice}</p>}<ImageArtSlot image={resource.image}/><div className="article-body">{resource.body.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}</div></article><ConsultationCTA/></>;
}
function FAQ() {
  return <><section className="shell page-heading centered"><p className="eyebrow">{site.headings.faqEyebrow}</p><h1>{site.headings.faq}</h1></section><section className="shell dedicated-faq"><FAQAccordion/></section><ConsultationCTA/></>;
}
function Contact() {
  return <section className="shell contact-page"><div><p className="eyebrow">{site.contact.eyebrow}</p><h1>{site.contact.title}</h1><p className="lede">{site.faithTone ? site.faith.contact : site.contact.text}</p><div className="contact-details"><h2>{site.contact.areaLabel}</h2><p>{site.brand.serviceArea}</p>{(site.brand.phone || site.brand.email) && <><h2>{site.contact.directLabel}</h2>{site.brand.email && <p><Link href={`mailto:${site.brand.email}`}>{site.brand.email}</Link></p>}{site.brand.phone && <p><Link href={`tel:${site.brand.phone.replace(/[^+\d]/g, '')}`}>{site.brand.phone}</Link></p>}</>}<p className="placeholder-copy">{site.contact.availability}</p></div><ImageArtSlot image={site.images.about} className="contact-art"/></div><ConsultationForm/></section>;
}
function NotFound() { return <section className="shell page-heading not-found"><p className="eyebrow">404</p><h1>{site.ui.notFoundTitle}</h1><p className="lede">{site.ui.notFoundText}</p><Link className="button" href="/">{site.ui.backHome}</Link></section>; }
export default function App({ path }: { path: string }) {
  let page;
  switch (path) { case '/': page = <Home/>; break; case '/about': page = <About/>; break; case '/services': page = <Services/>; break; case '/resources': page = <Resources/>; break; case '/faq': page = <FAQ/>; break; case '/contact': page = <Contact/>; break; default: page = path.startsWith('/resources/') ? <ResourcePage slug={path.slice(11)}/> : <NotFound/>; }
  return <><Header path={path}/><main id="main" tabIndex={-1}>{page}</main><Footer/></>;
}
