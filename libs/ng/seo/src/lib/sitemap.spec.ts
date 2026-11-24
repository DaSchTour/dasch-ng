import { buildRobotsTxt, buildSitemap, buildSitemapIndex, escapeXml } from './sitemap';

describe('escapeXml', () => {
  it('escapes the five XML characters and drops control characters', () => {
    expect(escapeXml(`<a href="x">Tom & 'Jerry'</a>\u0000\u0008`)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;');
  });
});

describe('buildSitemap', () => {
  it('builds a plain sitemap without optional namespaces', () => {
    const xml = buildSitemap([{ loc: 'https://example.com/a', lastmod: new Date('2026-01-02T03:04:05Z'), changefreq: 'weekly', priority: 0.5 }]);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://example.com/a</loc><lastmod>2026-01-02T03:04:05.000Z</lastmod><changefreq>weekly</changefreq><priority>0.5</priority>');
    expect(xml).not.toContain('xmlns:xhtml');
    expect(xml).not.toContain('xmlns:video');
  });

  it('writes hreflang alternates', () => {
    const xml = buildSitemap([
      {
        loc: 'https://example.com/en',
        alternates: [
          { hreflang: 'en', href: 'https://example.com/en' },
          { hreflang: 'de', href: 'https://example.com/de' },
          { hreflang: 'x-default', href: 'https://example.com/en' },
        ],
      },
    ]);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="de" href="https://example.com/de"/>');
    expect(xml).toContain('hreflang="x-default"');
  });

  it('writes the video extension', () => {
    const xml = buildSitemap([
      {
        loc: 'https://example.com/v',
        video: [{ thumbnailUrl: 'https://example.com/t.jpg', title: 'A & B', description: 'd', contentUrl: 'https://example.com/v.mp4', duration: 12.4 }],
      },
    ]);
    expect(xml).toContain('xmlns:video=');
    expect(xml).toContain('<video:title>A &amp; B</video:title>');
    expect(xml).toContain('<video:duration>12</video:duration>');
  });

  it('escapes URLs and text so values cannot add markup', () => {
    const xml = buildSitemap([{ loc: 'https://example.com/?a=1&b=<x>' }]);
    expect(xml).toContain('<loc>https://example.com/?a=1&amp;b=&lt;x&gt;</loc>');
    const hostile = buildSitemap([{ loc: 'https://example.com/', alternates: [{ hreflang: '"/><evil/>', href: 'https://example.com/' }] }]);
    expect(hostile).not.toContain('<evil/>');
  });

  it.each(['javascript:alert(1)', 'data:text/html,x', '/relative', 'not a url', 'ftp://example.com/'])('rejects loc %s', (loc) => {
    expect(() => buildSitemap([{ loc }])).toThrow();
  });

  it('rejects unsafe alternates and video URLs', () => {
    expect(() => buildSitemap([{ loc: 'https://example.com/', alternates: [{ hreflang: 'de', href: 'javascript:1' }] }])).toThrow();
    expect(() => buildSitemap([{ loc: 'https://example.com/', video: [{ thumbnailUrl: 'https://e.com/t', title: 't', description: 'd' }] }])).toThrow(
      /contentUrl or playerUrl/,
    );
  });

  it('rejects out-of-range priority and oversized sitemaps', () => {
    expect(() => buildSitemap([{ loc: 'https://example.com/', priority: 2 }])).toThrow();
    expect(() => buildSitemap(Array.from({ length: 50_001 }, () => ({ loc: 'https://example.com/' })))).toThrow(/50000/);
  });
});

describe('buildSitemapIndex', () => {
  it('lists sitemaps', () => {
    const xml = buildSitemapIndex([{ loc: 'https://example.com/s1.xml', lastmod: '2026-01-01' }]);
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<sitemap><loc>https://example.com/s1.xml</loc><lastmod>2026-01-01</lastmod></sitemap>');
  });

  it('rejects non-http locations', () => {
    expect(() => buildSitemapIndex([{ loc: 'javascript:1' }])).toThrow();
  });
});

describe('buildRobotsTxt', () => {
  it('allows everything by default', () => {
    expect(buildRobotsTxt()).toBe('User-agent: *\nAllow: /\n');
  });

  it('writes rules and sitemaps', () => {
    expect(
      buildRobotsTxt({
        rules: [
          { userAgent: '*', disallow: ['/admin'] },
          { userAgent: 'Bot', allow: ['/x'] },
        ],
        sitemaps: ['https://example.com/sitemap.xml'],
      }),
    ).toBe('User-agent: *\nDisallow: /admin\n\nUser-agent: Bot\nAllow: /x\n\nSitemap: https://example.com/sitemap.xml\n');
  });

  it('rejects line breaks that would inject directives', () => {
    expect(() => buildRobotsTxt({ rules: [{ userAgent: '*', disallow: ['/a\nAllow: /'] }] })).toThrow();
    expect(() => buildRobotsTxt({ rules: [{ userAgent: '*\r\nDisallow: /' }] })).toThrow();
    expect(() => buildRobotsTxt({ sitemaps: ['https://example.com/s.xml\nSitemap: https://evil.test/'] })).toThrow();
  });
});
