import { DOCUMENT } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SEO_ORIGIN, SeoHeadSync, SeoRouteData, provideSeoHead } from './seo-head';

@Component({ selector: 'lib-test-page', template: '' })
class PageComponent {}

const route = (path: string, seo?: SeoRouteData) => ({ path, component: PageComponent, data: seo ? { seo } : {} });

async function setup(origin: string | null) {
  TestBed.configureTestingModule({
    providers: [
      { provide: SEO_ORIGIN, useValue: origin },
      provideRouter([
        route('plain'),
        route('hidden', { noindex: true }),
        route('custom', { canonical: '/de/custom', locale: 'de_DE' }),
        route('products/:id', {
          alternates: { en: '/en/products', de: '/de/produkte', fr: 'https://fr.example.com/produits' },
          xDefault: 'en',
          locale: 'en_GB',
        }),
        route('evil', { canonical: 'javascript:alert(1)', alternates: { de: 'javascript:alert(1)' } }),
      ]),
      provideSeoHead(),
    ],
  });
  const doc = TestBed.inject(DOCUMENT);
  const harness = await RouterTestingHarness.create();
  const q = (selector: string) => doc.head.querySelector(selector);
  const all = (selector: string) => Array.from(doc.head.querySelectorAll(selector));
  return { harness, q, all, doc };
}

describe('SeoHeadSync', () => {
  afterEach(() => {
    document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"], meta[name="robots"], meta[property^="og:"]').forEach((e) => e.remove());
  });

  it('writes canonical and og:url from the current path, without query and fragment', async () => {
    const { harness, q } = await setup('https://example.com/');
    await harness.navigateByUrl('/plain?utm=1#top');
    expect(q('link[rel="canonical"]')?.getAttribute('href')).toBe('https://example.com/plain');
    expect(q('meta[property="og:url"]')?.getAttribute('content')).toBe('https://example.com/plain');
    expect(q('meta[name="robots"]')).toBeNull();
  });

  it('uses canonical and locale from route data', async () => {
    const { harness, q } = await setup('https://example.com');
    await harness.navigateByUrl('/custom');
    expect(q('link[rel="canonical"]')?.getAttribute('href')).toBe('https://example.com/de/custom');
    expect(q('meta[property="og:locale"]')?.getAttribute('content')).toBe('de_DE');
  });

  it('writes hreflang alternates with x-default and replaces them on navigation', async () => {
    const { harness, all, q } = await setup('https://example.com');
    await harness.navigateByUrl('/products/1');
    const hrefs = Object.fromEntries(all('link[rel="alternate"][hreflang]').map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]));
    expect(hrefs).toEqual({
      en: 'https://example.com/en/products',
      de: 'https://example.com/de/produkte',
      fr: 'https://fr.example.com/produits',
      'x-default': 'https://example.com/en/products',
    });
    await harness.navigateByUrl('/products/2');
    expect(all('link[rel="alternate"][hreflang]')).toHaveLength(4);
    await harness.navigateByUrl('/plain');
    expect(all('link[rel="alternate"][hreflang]')).toHaveLength(0);
    expect(q('meta[property="og:locale"]')).toBeNull();
  });

  it('adds noindex from route data and removes it again', async () => {
    const { harness, q } = await setup('https://example.com');
    await harness.navigateByUrl('/hidden');
    expect(q('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
    await harness.navigateByUrl('/plain');
    expect(q('meta[name="robots"]')).toBeNull();
  });

  it('keeps one canonical link across navigations', async () => {
    const { harness, all } = await setup('https://example.com');
    await harness.navigateByUrl('/plain');
    await harness.navigateByUrl('/custom');
    expect(all('link[rel="canonical"]')).toHaveLength(1);
  });

  it('leaves URL tags untouched while no origin is known, but still handles noindex', async () => {
    const { harness, q } = await setup(null);
    await harness.navigateByUrl('/hidden');
    expect(q('link[rel="canonical"]')).toBeNull();
    expect(q('meta[property="og:url"]')).toBeNull();
    expect(q('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });

  it('ignores an origin that is not http(s)', async () => {
    const { harness, q } = await setup('javascript:alert(1)');
    await harness.navigateByUrl('/plain');
    expect(q('link[rel="canonical"]')).toBeNull();
  });

  it('never writes non-http URLs from route data', async () => {
    const { harness, q, all } = await setup('https://example.com');
    await harness.navigateByUrl('/evil');
    expect(q('link[rel="canonical"]')).toBeNull();
    expect(all('link[rel="alternate"][hreflang]')).toHaveLength(0);
  });

  it('can be called directly without provideSeoHead', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: SEO_ORIGIN, useValue: 'https://example.com' }, provideRouter([route('p', { noindex: true })])] });
    const harness = await RouterTestingHarness.create('/p');
    TestBed.inject(SeoHeadSync).sync();
    expect(harness.routeNativeElement).toBeTruthy();
    expect(TestBed.inject(DOCUMENT).head.querySelector('meta[name="robots"]')).not.toBeNull();
  });
});
