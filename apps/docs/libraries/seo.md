# SEO

SEO and server-side rendering helpers. The main entry point is framework-free; the Angular services come in a second entry point.

## Installation

```bash
npm install @dasch-ng/seo
```

## Features

- **JSON-LD**: `serializeJsonLd` makes data safe for a `<script>` tag, plus `isoDuration` and `compact`
- **Sitemaps**: sitemap, sitemap index and `robots.txt` builders with `hreflang` alternates and video extension
- **Request origin**: public origin from `Host` and `X-Forwarded-Proto`, only for hosts you allow
- **Security headers**: Content Security Policy (enforcing or report-only) and companion headers, with header injection checks
- **Angular**: a `JsonLd` service and a head service for canonical URL, `hreflang`, `og:url`, `og:locale` and `noindex`

## Entry points

| Entry point             | Needs Angular | Content                                                 |
| ----------------------- | ------------- | ------------------------------------------------------- |
| `@dasch-ng/seo`         | No            | All helpers below                                       |
| `@dasch-ng/seo/angular` | Yes           | `JsonLd`, `SeoHeadSync`, `provideSeoHead`, `SEO_ORIGIN` |

All Angular packages are optional peer dependencies, so a plain Node server installs the library without Angular.

## JSON-LD

```typescript
import { compact, isoDuration, serializeJsonLd } from '@dasch-ng/seo';

const json = serializeJsonLd(
  compact({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: undefined, // dropped
    duration: isoDuration(3_723_000), // "PT1H2M3S"
  }),
);
```

`serializeJsonLd` writes `<`, `>`, `&`, U+2028 and U+2029 as `\uXXXX`. The output is still valid JSON, but user supplied text can never contain `</script>`.

`compact` removes `null`, `undefined`, empty strings, empty arrays and empty objects (recursively). `0` and `false` stay.

## Sitemaps and robots.txt

```typescript
import { buildRobotsTxt, buildSitemap, buildSitemapIndex } from '@dasch-ng/seo';

buildSitemap([
  {
    loc: 'https://example.com/en/film',
    lastmod: new Date(),
    alternates: [
      { hreflang: 'en', href: 'https://example.com/en/film' },
      { hreflang: 'de', href: 'https://example.com/de/film' },
      { hreflang: 'x-default', href: 'https://example.com/en/film' },
    ],
    video: [{ title: 'Film', description: 'A film', thumbnailUrl: 'https://example.com/t.jpg', contentUrl: 'https://example.com/f.mp4', duration: 120 }],
  },
]);

buildSitemapIndex([{ loc: 'https://example.com/sitemap-1.xml' }]);
buildRobotsTxt({ rules: [{ userAgent: '*', disallow: ['/admin'] }], sitemaps: ['https://example.com/sitemap.xml'] });
```

All URLs must be absolute `http` or `https`, otherwise the builder throws. Values are XML-escaped. A sitemap holds at most 50,000 URLs, so split larger sets and link them with `buildSitemapIndex`. `buildRobotsTxt` throws on line breaks, which would inject extra directives. `escapeXml` is exported for your own XML.

## Request origin

```typescript
import { requestOrigin } from '@dasch-ng/seo';

requestOrigin(req.headers, { allowedHosts: ['example.com', 'www.example.com'] });
// 'https://example.com', or null
```

The `Host` header is controlled by the client. A wrong origin in canonical links or sitemaps enables cache poisoning, so the function returns `null` unless the host is on the allow list. It also returns `null` for a missing or repeated `Host`, hosts with unusual characters, and protocols other than `http` and `https`. Allow list entries are exact matches, not patterns. The protocol defaults to `https`. Only trust `X-Forwarded-Proto` behind a proxy that sets it.

## Security headers

```typescript
import { buildContentSecurityPolicy, buildSecurityHeaders } from '@dasch-ng/seo';

buildSecurityHeaders({
  extraSources: { 'img-src': ['https://cdn.example.com'], 'script-src': ["'self'", "'nonce-abc123'"] },
  reportUri: '/csp-report',
  reportOnly: true,
});
// { 'Content-Security-Policy-Report-Only': "...", 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': ..., 'Strict-Transport-Security': ... }
```

The defaults are restrictive (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'self'`). Add what your app loads through `extraSources`. Sources and directive names that contain `;`, `,`, whitespace or control characters (including line breaks) are rejected with an error, so configuration or user input cannot add directives or headers.

## Accept header

`prefersMarkdown(accept)` is `true` when `text/markdown` is asked for explicitly with a higher quality than `text/html`. Wildcards never select Markdown.

## Angular

### JsonLd

```typescript
import { JsonLd } from '@dasch-ng/seo/angular';

const jsonLd = inject(JsonLd);
jsonLd.set('breadcrumbs', { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [] });
jsonLd.remove('breadcrumbs'); // or jsonLd.set('breadcrumbs', null)
```

One script per id, replaced on repeated calls. It only uses the injected `DOCUMENT`, so it works on the server and keeps the server-rendered tag after hydration.

### Head sync

```typescript
import { provideSeoHead, SEO_ORIGIN } from '@dasch-ng/seo/angular';

providers: [provideRouter(routes), { provide: SEO_ORIGIN, useValue: 'https://example.com' }, provideSeoHead()];
```

Per route, set `data.seo`:

```typescript
{
  path: 'products/:id',
  component: ProductPage,
  data: {
    seo: {
      alternates: { en: '/en/products', de: '/de/produkte' },
      xDefault: 'en', // also written as hreflang="x-default"
      locale: 'en_GB', // og:locale
      // canonical: '/en/products', // default is the current path without query and fragment
      // noindex: true,
    },
  },
}
```

After every navigation the head gets `link rel="canonical"`, `og:url`, `og:locale`, `hreflang` alternates and, with `noindex`, `<meta name="robots" content="noindex">`. Tags are replaced, never duplicated. Only `http` and `https` URLs are written.

`SEO_ORIGIN` defaults to `null`. While it is `null`, the URL based tags are left untouched (so a client without an origin does not erase server-rendered ones); `noindex` and `og:locale` still work. In an SSR app derive it from the request with the allow list:

```typescript
{
  provide: SEO_ORIGIN,
  useFactory: () => requestOrigin(inject(REQUEST)?.headers ?? {}, { allowedHosts: ['example.com'] }),
}
```

## Not included

- `htmlToMarkdown`: a correct converter is not small and the library takes no dependencies.

## API Reference

- [API reference](/api/@dasch-ng/seo/README)
- [Source code](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/seo)

## License

MIT
