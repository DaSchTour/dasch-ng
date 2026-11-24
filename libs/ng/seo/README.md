# @dasch-ng/seo

SEO and server-side rendering helpers: JSON-LD, sitemaps, `robots.txt`, request origin with host validation, security headers, and Angular services that keep the document head in line with the active route.

## Installation

```bash
npm install @dasch-ng/seo
```

The main entry point `@dasch-ng/seo` has no Angular imports and works in plain Node, edge workers and any framework. The Angular services live in `@dasch-ng/seo/angular` (needs `@angular/core`, `@angular/common`, `@angular/router`).

## Framework-free usage

```typescript
import { buildSecurityHeaders, buildSitemap, requestOrigin, serializeJsonLd } from '@dasch-ng/seo';

// Safe to put inside <script type="application/ld+json">
const json = serializeJsonLd({ '@type': 'Product', name: '</script>' });

// Origin only for hosts you allow, otherwise null
const origin = requestOrigin(req.headers, { allowedHosts: ['example.com'] });

const xml = buildSitemap([{ loc: 'https://example.com/', alternates: [{ hreflang: 'de', href: 'https://example.com/de' }] }]);

const headers = buildSecurityHeaders({ extraSources: { 'img-src': ['https://cdn.example.com'] }, reportOnly: true });
```

## Angular usage

```typescript
import { JsonLd, provideSeoHead, SEO_ORIGIN } from '@dasch-ng/seo/angular';

bootstrapApplication(App, {
  providers: [provideRouter(routes), { provide: SEO_ORIGIN, useValue: 'https://example.com' }, provideSeoHead()],
});

// routes: { path: 'about', component: About, data: { seo: { noindex: false, alternates: { en: '/en/about', de: '/de/about' }, xDefault: 'en' } } }
inject(JsonLd).set('organization', { '@context': 'https://schema.org', '@type': 'Organization', name: 'Acme' });
```

## Documentation

Full guide and API reference: [dasch.ng/libraries/seo](https://dasch.ng/libraries/seo)

## License

MIT
