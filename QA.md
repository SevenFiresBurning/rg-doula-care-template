# Verification results

Verified locally on November 23, 2026. The latest neutral-template brief is the implementation source of truth.

## Passed

- TypeScript and production Vite build.
- Prerendering of all 12 routes plus a not-found page.
- 24 Chromium browser tests at desktop (1440×1000), tablet (820×1180), and mobile (390×844) sizes; additional narrow-screen and reduced-motion checks at 320px. The revised suite includes turning faith-sensitive content off on every screen profile.
- Six main pages scanned with axe-core for WCAG 2 A/AA and WCAG 2.1 AA rules on each screen profile, with no detected violations. These automated checks do not replace a full manual accessibility audit.
- Main and resource-detail routes, one H1 per page, canonical URLs, titles, descriptions, OG image URLs, and valid JSON-LD.
- Data-driven service count, service anchors, homepage CTAs, mobile navigation, Escape-to-close with focus return, and keyboard-operated FAQ expansion.
- Resource category filtering and article-detail navigation.
- Native form validation, conditional phone requirement, default no-send/no-storage demo confirmation, and mocked endpoint HTTP success/error handling. No real inquiry was sent.
- Internal links resolve to configured routes or existing built assets.
- Rebranding through config, removing all enabled services, removing those services from consultation options, and changing a theme color without editing components.
- Schema switches for Person, ProfessionalService, Service, FAQPage, and Article; business/FAQ identity claims are disabled in the shipped config. WebSite/BreadcrumbList remain available.
- Empty testimonials omitted from production HTML; no fabricated reviews, credentials, names, locations, prices, or outcome claims.
- Production pages work with JavaScript enabled and disabled; no React hydration errors detected. The interactive production form works in explicit demo mode.
- Production social-preview PNG exists at 1200×630; editable SVG source included.
- Visual review of desktop home, mobile home/contact, and tablet About screenshots. Fixed narrow-grid intrinsic-width overflow, darkened clay text for contrast, protected placeholder captions with a solid background, and made small-screen forms/cards use a single column.

## Artifacts

- `qa/screenshots/desktop-preview.png`: production homepage above the fold.
- `qa/screenshots/{desktop,tablet,mobile}-{home,about,contact}.png`: full-page layout captures.
- `public/social-preview.svg` and `public/social-preview.png`: customizable social card.
- `scripts/verify-build.mjs`: production HTML, links, metadata, and configuration checks.
- `scripts/verify-production.mjs`: production browser and no-JavaScript checks; run against `npm run preview -- --port 5189`.

## Intentional integration boundaries

The dark visual revision preserves the route and service architecture. `faithTone` controls the alternate intro/contact copy, optional About placeholder, reflective values, quote slot, and additional FAQ; both on/off states were checked. The empty quote slot is disabled by default. No verse, personal testimony, or specific denomination was inserted. Dark surfaces and light reading surfaces use centrally configured colors; the social card was refreshed to match.

The form endpoint and booking URL are unset, testimonials and credentials are empty, identity/location remain bracketed placeholders, and resources are unpublished starter content. The reserved canonical domain is `https://your-domain.example`. Robots and page metadata prevent indexing until configured for a real client.

No real endpoint delivery, scheduling service, public host, real-device Safari/Firefox behavior, manual screen-reader audit, or Lighthouse lab score is claimed. This repository provides template source; hosting and deployment are not configured.
