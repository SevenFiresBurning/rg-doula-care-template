import { useEffect, useRef, useState, type FormEvent } from 'react';
import { site, enabledServices, consultationHref, heroCopy, activeFAQs, type ArtSlot, type Service, type Resource } from './config';

export function Brand() {
  return <a className="brand" href="/">{site.brand.logo ? <img src={site.brand.logo} alt={site.brand.logoAlt || site.brand.name}/> : <><span className="brand-name">{site.brand.name}</span><span className="brand-tagline">{site.brand.tagline}</span></>}</a>;
}
export function Header({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => { const handle = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) { setOpen(false); button.current?.focus(); } }; document.addEventListener('keydown', handle); return () => document.removeEventListener('keydown', handle); }, [open]);
  return <><a className="skip-link" href="#main">{site.ui.skip}</a><header className="site-header"><div className="shell header-inner"><Brand/><button ref={button} className="menu-toggle" aria-expanded={open} aria-controls="main-nav" aria-label={open ? site.ui.menuClose : site.ui.menuOpen} onClick={() => setOpen(!open)}><span/><span/></button><nav id="main-nav" className={open ? 'navigation is-open' : 'navigation'} aria-label={site.ui.mainNavigation}>{site.navigation.map(item => <a key={item.href} href={item.href} aria-current={path === item.href || (item.href === '/resources' && path.startsWith('/resources/')) ? 'page' : undefined}>{item.label}</a>)}<a className="button header-cta" href={consultationHref()}>{site.cta.primary}</a></nav></div></header></>;
}
export function ImageArtSlot({ image, className = '', eager = false }: { image: ArtSlot; className?: string; eager?: boolean }) {
  return <figure className={`image-slot tone-${image.tone} ${className}`}>
    {image.src ? <img src={image.src} srcSet={image.srcSet || undefined} sizes="(max-width: 700px) 100vw, 50vw" alt={image.alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" style={{ objectPosition: image.position || 'center' }}/> : <><div className="abstract-art" aria-hidden="true"><span className="art-orbit"/><span className="art-arch"/><span className="art-disc"/><span className="art-line"/></div><figcaption className="slot-caption">{image.label}</figcaption></>}
  </figure>;
}
export function Hero() {
  const hero = heroCopy();
  const emphasis = hero.emphasis;
  const canEmphasize = emphasis && hero.headline.endsWith(emphasis);
  return <div className="hero-stage"><section className="hero shell"><div className="hero-copy"><p className="eyebrow">{hero.eyebrow}</p><h1>{canEmphasize ? <>{hero.headline.slice(0, -emphasis.length)}<em>{emphasis}</em></> : hero.headline}</h1><p className="lede">{hero.description}</p><div className="actions"><a className="button" href={consultationHref()}>{site.cta.primary}</a><a className="text-link" href="/services">{site.cta.secondary}</a></div><p className="hero-note"><span aria-hidden="true" className="small-sun"/>{hero.note}</p></div><div className="hero-visual"><ImageArtSlot image={site.images.hero} eager/><div className="hero-card"><p>{hero.artTitle}</p><span>{hero.artCaption}</span></div><span className="visual-line" aria-hidden="true"/></div></section></div>;
}
export function ReflectiveValues() {
  const reflection = site.faith.reflection;
  if (!site.faithTone || !reflection.enabled) return null;
  return <section className="reflection-section"><div className="shell"><div className="reflection-intro"><p className="eyebrow">{reflection.eyebrow}</p><h2>{reflection.title}</h2><p className="lede">{reflection.introduction}</p></div><div className="reflection-values">{reflection.values.map(value => <article key={value.title}><h3>{value.title}</h3><p>{value.text}</p></article>)}</div></div></section>;
}
export function QuoteBlock({ quote }: { quote: typeof site.faith.quote }) {
  if (!quote.enabled || !quote.text.trim()) return null;
  return <section className={`quote-block quote-${quote.kind}`}><figure className="shell"><p className="eyebrow">{quote.eyebrow}</p><blockquote>{quote.text}</blockquote>{quote.attribution && <figcaption>{quote.attribution}</figcaption>}</figure></section>;
}
export function ValuePillars() {
  return <section className="pillars shell" aria-label={site.hero.note}>{site.pillars.map(pillar => <article key={pillar.title}><span className="pillar-mark" aria-hidden="true"/><div><h2>{pillar.title}</h2><p>{pillar.text}</p></div></article>)}</section>;
}
export function ServiceCard({ service }: { service: Service }) {
  return <article className={`service-card${service.featured ? ' featured' : ''}`}><a className="card-art-link" href={`/services#${service.id}`} tabIndex={-1} aria-hidden="true"><ImageArtSlot image={service.image}/></a><div className="service-card-body"><h3><a href={`/services#${service.id}`}>{service.title}</a></h3><p>{service.summary}</p><a className="text-link" href={`/services#${service.id}`}>{service.cta}</a></div></article>;
}
export function ServiceGrid({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const services = enabledServices().filter(service => !featuredOnly || service.featured);
  return <div className="service-grid">{services.length ? services.map(service => <ServiceCard key={service.id} service={service}/>) : <p>{site.ui.emptyServices}</p>}</div>;
}
export function CredentialsList() {
  return <div className="credentials"><h3>{site.bio.trainingTitle}</h3>{site.brand.credentials.length ? <ul>{site.brand.credentials.map(item => <li key={item}>{item}</li>)}</ul> : <p className="placeholder-copy">{site.bio.trainingPlaceholder}</p>}</div>;
}
export function PractitionerBio({ full = false }: { full?: boolean }) {
  return <section className="bio-section shell split"><div className="bio-visual"><ImageArtSlot image={site.images.portrait} className="portrait"/><p className="image-footnote">{site.bio.imageCaption}</p></div><div className="bio-copy"><p className="eyebrow">{site.bio.eyebrow}</p>{full ? <h1>{site.bio.title}</h1> : <h2>{site.bio.title}</h2>}<p className="practitioner-name">{site.brand.practitioner}</p><p className="lede placeholder-copy">{site.bio.introduction}</p><p className="placeholder-copy">{site.bio.philosophy}</p>{site.faithTone && site.faith.bio && <p className="faith-bio placeholder-copy">{site.faith.bio}</p>}<CredentialsList/>{!full && <a className="text-link" href="/about">{site.cta.about}</a>}</div></section>;
}
export function ServiceDetail({ service, compact = false, index = 0 }: { service: Service; compact?: boolean; index?: number }) {
  return <section id={service.id} className={`service-detail shell split${index % 2 ? ' reverse' : ''}`}><ImageArtSlot image={service.image}/><div><p className="eyebrow">{site.brand.tagline}</p><h2>{service.title}</h2><p className="lede">{service.summary}</p><h3 className="small-heading">{site.serviceLabels.includes}</h3><ul className="check-list">{service.includes.map(item => <li key={item}>{item}</li>)}</ul>{!compact && <><h3 className="small-heading">{site.serviceLabels.audience}</h3><p>{service.audience}</p>{service.packageNote && <p className="notice">{service.packageNote}</p>}</>}<a className="text-link" href={consultationHref()}>{site.cta.primary}</a></div></section>;
}
export function ProcessSteps() {
  return <section className="process-section"><div className="shell"><div className="section-intro centered"><p className="eyebrow">{site.headings.processEyebrow}</p><h2>{site.headings.process}</h2></div><ol className="process-grid">{site.process.map((step, index) => <li key={step.title}><span className="step-number">{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol></div></section>;
}
export function TestimonialSection() {
  const testimonials = site.testimonials.filter(item => item.consentConfirmed);
  if (!testimonials.length) return import.meta.env.DEV && site.showEmptyTestimonialsInDevelopment ? <section className="shell testimonial-placeholder"><p>{site.headings.testimonialEmpty}</p></section> : null;
  return <section className="shell testimonials"><h2>{site.headings.testimonial}</h2><div className="testimonial-grid">{testimonials.map(item => <figure key={item.attribution}>{item.image && <ImageArtSlot image={item.image}/>}<blockquote>{item.quote}</blockquote><figcaption>{item.attribution}</figcaption></figure>)}</div></section>;
}
export function FAQAccordion({ limit }: { limit?: number }) {
  return <div className="faq-list">{activeFAQs().slice(0, limit).map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true" className="faq-toggle"/></summary><div className="faq-answer"><p>{item.answer}</p></div></details>)}</div>;
}
export function ConsultationCTA() {
  return <section className="closing"><div className="shell closing-inner"><p className="eyebrow">{site.closing.eyebrow}</p><h2>{site.closing.title}</h2><p>{site.closing.text}</p><a className="button light-button" href={consultationHref()}>{site.cta.primary}</a><div className="closing-ring" aria-hidden="true"/></div></section>;
}
export function ConsultationForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [preference, setPreference] = useState('email');
  const status = useRef<HTMLParagraphElement>(null);
  const busy = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (String(data.get(site.form.honeypot) || '').trim()) return;
    if (!site.form.endpoint) { setState('success'); return; }
    busy.current = true; setState('sending');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(site.form.endpoint, { method: site.form.method, headers: { 'Content-Type': 'application/json', ...(site.form.csrfToken ? { 'X-CSRF-Token': site.form.csrfToken } : {}) }, body: JSON.stringify(Object.fromEntries(data)), signal: controller.signal });
      if (!response.ok) throw new Error('Submission failed');
      form.reset(); setPreference('email'); setState('success');
    } catch { setState('error'); }
    finally { window.clearTimeout(timeout); busy.current = false; }
  }
  useEffect(() => { if (state === 'success' || state === 'error') status.current?.focus(); }, [state]);
  const labels = site.form.labels;
  return <form className="consultation-form" onSubmit={submit} aria-busy={state === 'sending'} aria-describedby="form-context form-privacy"><h2>{site.contact.formTitle}</h2><p id="form-context" className="form-context">{site.form.endpoint ? site.contact.availability : site.contact.demoNote}</p><div className="form-grid">
    <label>{labels.name}<input name="name" autoComplete="name" required maxLength={120}/></label>
    <label>{labels.email}<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
    <label>{labels.phone} {preference !== 'phone' && <span>({site.form.optional})</span>}<input name="phone" type="tel" autoComplete="tel" required={preference === 'phone'} maxLength={50}/></label>
    <label>{labels.dueDate} <span>({site.form.optional})</span><input name="dueDate" type="date"/></label>
    <label>{labels.interest}<select name="interest" defaultValue=""><option value="">{site.form.notSure}</option>{enabledServices().map(service => <option key={service.id} value={service.id}>{service.title}</option>)}</select></label>
    <label>{labels.preference}<select name="preference" value={preference} onChange={event => setPreference(event.target.value)}><option value="email">{site.form.emailOption}</option><option value="phone">{site.form.phoneOption}</option></select></label>
    <label className="wide">{labels.message} <span>({site.form.optional})</span><textarea name="message" rows={5} maxLength={4000}/></label>
    <div className="honeypot" aria-hidden="true"><label>Website<input name={site.form.honeypot} tabIndex={-1} autoComplete="off"/></label></div>
  </div><p className="small-copy" id="form-privacy">{site.contact.privacy}</p><button type="submit" className="button" disabled={state === 'sending'}>{state === 'sending' ? site.form.sending : site.cta.submit}</button><p ref={status} className={`form-status ${state}`} role={state === 'error' ? 'alert' : 'status'} tabIndex={-1}>{state === 'success' ? (site.form.endpoint ? site.form.success : site.form.demoSuccess) : state === 'error' ? site.form.error : ''}</p></form>;
}
export function ResourceCard({ resource }: { resource: Resource }) {
  return <article className="resource-card"><a className="card-art-link" href={`/resources/${resource.slug}`} tabIndex={-1} aria-hidden="true"><ImageArtSlot image={resource.image}/></a><p className="eyebrow">{resource.category}</p><h2><a href={`/resources/${resource.slug}`}>{resource.title}</a></h2><p>{resource.description}</p><a className="text-link" href={`/resources/${resource.slug}`}>{site.ui.readResource}</a>{!resource.published && <span className="starter-label">{site.ui.starterResource}</span>}</article>;
}
export function SocialLinks() {
  return <>{site.brand.socials.filter(item => item.url).map(item => <a key={item.label} href={item.url} rel="me">{item.label}</a>)}</>;
}
export function Footer() {
  return <footer className="footer"><div className="shell footer-grid"><div><Brand/><p>{site.footer.note}</p><p className="small-copy">{site.brand.serviceArea}</p></div><div><h2>{site.footer.navigationTitle}</h2>{site.navigation.filter(item => item.href !== '/').map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</div><div><h2>{site.footer.contactTitle}</h2><a href={consultationHref()}>{site.cta.primary}</a>{site.brand.email && <a href={`mailto:${site.brand.email}`}>{site.brand.email}</a>}{site.brand.phone && <a href={`tel:${site.brand.phone.replace(/[^+\d]/g, '')}`}>{site.brand.phone}</a>}<SocialLinks/></div></div><div className="shell footer-bottom"><p>{site.footer.disclaimer}</p><p>{site.footer.credit}</p></div></footer>;
}
