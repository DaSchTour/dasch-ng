/** Sitemap protocol limit per file; split into several files and use {@link buildSitemapIndex} beyond it. */
const MAX_URLS = 50_000;

/** An alternate language version of a page, written as `<xhtml:link rel="alternate">`. */
export interface SitemapAlternate {
  /** Language tag such as `de`, `en-GB` or `x-default`. */
  hreflang: string;
  /** Absolute http(s) URL of the alternate page. */
  href: string;
}

/** Video sitemap extension data for one page. */
export interface SitemapVideo {
  thumbnailUrl: string;
  title: string;
  description: string;
  /** Direct media file URL. Either this or `playerUrl` is required by the protocol. */
  contentUrl?: string;
  playerUrl?: string;
  /** Length in seconds. */
  duration?: number;
  publicationDate?: string | Date;
}

export interface SitemapEntry {
  /** Absolute http(s) URL. */
  loc: string;
  lastmod?: string | Date;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** 0.0 to 1.0 */
  priority?: number;
  alternates?: SitemapAlternate[];
  video?: SitemapVideo[];
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string | Date;
}

/** A group of `robots.txt` rules for one user agent. */
export interface RobotsRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
}

export interface RobotsTxtOptions {
  /** Defaults to a single rule that allows everything for all crawlers. */
  rules?: RobotsRule[];
  /** Absolute sitemap URLs. */
  sitemaps?: string[];
}

/**
 * Escapes text for XML content and attribute values. XML 1.0 forbids most control characters,
 * so those are removed instead of escaped.
 */
export function escapeXml(value: string): string {
  return (
    value
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  );
}

function url(value: string, what: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${what} must be an absolute URL, got "${value}"`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`${what} must use http or https, got "${value}"`);
  }
  return escapeXml(value);
}

function date(value: string | Date): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error('Invalid Date in sitemap');
    return value.toISOString();
  }
  return escapeXml(value);
}

function tag(name: string, value: string | number | undefined, render: (v: string) => string = escapeXml): string {
  return value === undefined ? '' : `<${name}>${render(String(value))}</${name}>`;
}

function videoXml(v: SitemapVideo): string {
  if (!v.contentUrl && !v.playerUrl) {
    throw new Error('A sitemap video needs contentUrl or playerUrl');
  }
  return (
    '<video:video>' +
    tag('video:thumbnail_loc', v.thumbnailUrl, (s) => url(s, 'video thumbnailUrl')) +
    tag('video:title', v.title) +
    tag('video:description', v.description) +
    tag('video:content_loc', v.contentUrl, (s) => url(s, 'video contentUrl')) +
    tag('video:player_loc', v.playerUrl, (s) => url(s, 'video playerUrl')) +
    tag('video:duration', v.duration === undefined ? undefined : Math.round(v.duration)) +
    tag('video:publication_date', v.publicationDate === undefined ? undefined : date(v.publicationDate), (s) => s) +
    '</video:video>'
  );
}

/**
 * Builds a sitemap XML document. The `xhtml` and `video` namespaces are only declared when used.
 * Every URL is validated (absolute, http or https) and every value is XML-escaped.
 *
 * @throws Error for invalid URLs, a video without media URL, or more than 50,000 entries.
 */
export function buildSitemap(entries: readonly SitemapEntry[]): string {
  if (entries.length > MAX_URLS) {
    throw new Error(`A sitemap holds at most ${MAX_URLS} URLs, got ${entries.length}`);
  }
  const hasAlternates = entries.some((e) => e.alternates?.length);
  const hasVideo = entries.some((e) => e.video?.length);
  const ns =
    ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' +
    (hasAlternates ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : '') +
    (hasVideo ? ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"' : '');
  const urls = entries.map((e) => {
    if (e.priority !== undefined && !(e.priority >= 0 && e.priority <= 1)) {
      throw new Error(`Sitemap priority must be between 0 and 1, got ${e.priority}`);
    }
    return (
      '<url>' +
      tag('loc', e.loc, (s) => url(s, 'loc')) +
      tag('lastmod', e.lastmod === undefined ? undefined : date(e.lastmod), (s) => s) +
      tag('changefreq', e.changefreq) +
      tag('priority', e.priority?.toFixed(1)) +
      (e.alternates ?? []).map((a) => `<xhtml:link rel="alternate" hreflang="${escapeXml(a.hreflang)}" href="${url(a.href, 'alternate href')}"/>`).join('') +
      (e.video ?? []).map(videoXml).join('') +
      '</url>'
    );
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset${ns}>${urls.join('')}</urlset>\n`;
}

/** Builds a sitemap index XML document that points to several sitemap files. */
export function buildSitemapIndex(entries: readonly SitemapIndexEntry[]): string {
  if (entries.length > MAX_URLS) {
    throw new Error(`A sitemap index holds at most ${MAX_URLS} sitemaps, got ${entries.length}`);
  }
  const items = entries.map(
    (e) =>
      '<sitemap>' + tag('loc', e.loc, (s) => url(s, 'loc')) + tag('lastmod', e.lastmod === undefined ? undefined : date(e.lastmod), (s) => s) + '</sitemap>',
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items.join('')}</sitemapindex>\n`;
}

function line(name: string, value: string): string {
  if (/[\r\n]/.test(value)) throw new Error(`robots.txt value for ${name} must not contain line breaks`);
  return `${name}: ${value}`;
}

/**
 * Builds a `robots.txt` body.
 *
 * @throws Error when any value contains a line break (it would inject extra directives).
 */
export function buildRobotsTxt(options: RobotsTxtOptions = {}): string {
  const rules = options.rules ?? [{ userAgent: '*', allow: ['/'] }];
  const groups = rules.map((r) =>
    [line('User-agent', r.userAgent), ...(r.allow ?? []).map((p) => line('Allow', p)), ...(r.disallow ?? []).map((p) => line('Disallow', p))].join('\n'),
  );
  const sitemaps = (options.sitemaps ?? []).map((s) => {
    url(s, 'sitemap');
    return line('Sitemap', s);
  });
  return [groups.join('\n\n'), sitemaps.join('\n')].filter(Boolean).join('\n\n') + '\n';
}
