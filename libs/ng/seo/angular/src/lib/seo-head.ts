import { DOCUMENT } from '@angular/common';
import { DestroyRef, EnvironmentProviders, Injectable, InjectionToken, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Route `data` key read by {@link SeoHeadSync}. */
export const SEO_ROUTE_DATA_KEY = 'seo';

/** SEO settings for a route, set as `data: { seo: { ... } }`. */
export interface SeoRouteData {
  /** Adds `<meta name="robots" content="noindex">`. */
  noindex?: boolean;
  /** Canonical path or absolute URL. Defaults to the current path without query string and fragment. */
  canonical?: string;
  /** Alternate language versions: `hreflang` to path or absolute URL. */
  alternates?: Record<string, string>;
  /** Key of `alternates` that is also written as `x-default`. */
  xDefault?: string;
  /** Value of `og:locale`, for example `de_DE`. */
  locale?: string;
}

/**
 * Public origin of the app (`https://example.com`), without trailing slash. Needed for canonical, alternate and
 * `og:url` tags. While it is `null`, those tags are left untouched.
 *
 * In an SSR app provide it from the request, with a host allow list:
 * `{ provide: SEO_ORIGIN, useFactory: () => requestOrigin(inject(REQUEST)!.headers, { allowedHosts }) }`.
 * In the browser, `{ provide: SEO_ORIGIN, useFactory: () => location.origin }` is enough.
 */
export const SEO_ORIGIN = new InjectionToken<string | null>('SEO_ORIGIN', { providedIn: 'root', factory: () => null });

function isHttpOrigin(origin: string): boolean {
  try {
    const { protocol } = new URL(origin);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Keeps head tags in line with the active route: canonical URL, `hreflang` alternates (with `x-default`),
 * `og:url`, `og:locale` and a `noindex` robots tag. Tags it writes are replaced on every call, never duplicated.
 *
 * Register it with {@link provideSeoHead} or call {@link SeoHeadSync.sync} yourself.
 */
@Injectable({ providedIn: 'root' })
export class SeoHeadSync {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly origin = inject(SEO_ORIGIN);

  /** Reads the route data of the current router state and updates the head. */
  sync(): void {
    const data = this.routeData();
    this.setMeta('name', 'robots', data.noindex ? 'noindex' : null);
    this.setMeta('property', 'og:locale', data.locale ?? null);

    if (!this.origin || !isHttpOrigin(this.origin)) return;
    const base = this.origin.replace(/\/+$/, '');
    const canonical = this.resolve(base, data.canonical ?? this.router.url.split(/[?#]/)[0]);
    this.setLink('canonical', canonical);
    this.setMeta('property', 'og:url', canonical);

    const alternates = Object.entries(data.alternates ?? {}).map(([hreflang, target]) => [hreflang, this.resolve(base, target)] as const);
    const xDefault = data.xDefault ? data.alternates?.[data.xDefault] : undefined;
    if (xDefault) alternates.push(['x-default', this.resolve(base, xDefault)]);
    this.setAlternates(alternates.filter((a): a is readonly [string, string] => a[1] !== null));
  }

  private routeData(): SeoRouteData {
    let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return (route.data[SEO_ROUTE_DATA_KEY] as SeoRouteData | undefined) ?? {};
  }

  /** Resolves a path against the origin. Only http(s) results are accepted. */
  private resolve(base: string, target: string): string | null {
    try {
      const url = new URL(target, `${base}/`);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  }

  private setMeta(attribute: 'name' | 'property', key: string, content: string | null): void {
    const head = this.document.head;
    const existing = head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (content === null) {
      existing?.remove();
      return;
    }
    const meta = existing ?? this.document.createElement('meta');
    meta.setAttribute(attribute, key);
    meta.setAttribute('content', content);
    if (!existing) head.appendChild(meta);
  }

  private setLink(rel: 'canonical', href: string | null): void {
    const head = this.document.head;
    const existing = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (href === null) {
      existing?.remove();
      return;
    }
    const link = existing ?? this.document.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    if (!existing) head.appendChild(link);
  }

  private setAlternates(alternates: readonly (readonly [string, string])[]): void {
    const head = this.document.head;
    head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    for (const [hreflang, href] of alternates) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      head.appendChild(link);
    }
  }
}

/**
 * Runs {@link SeoHeadSync.sync} after every completed navigation.
 *
 * @example
 * bootstrapApplication(App, { providers: [provideRouter(routes), provideSeoHead()] });
 */
export function provideSeoHead(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const sync = inject(SeoHeadSync);
      const subscription = inject(Router)
        .events.pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe(() => sync.sync());
      inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
    }),
  ]);
}
