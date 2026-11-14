import { buildContentSecurityPolicy, buildSecurityHeaders } from './security-headers';

describe('buildContentSecurityPolicy', () => {
  it('has restrictive defaults', () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('adds extra sources to defaults and creates new directives', () => {
    const csp = buildContentSecurityPolicy({
      extraSources: { 'img-src': ['https://cdn.example.com'], 'script-src': ["'self'", "'nonce-abc123'"] },
      reportUri: '/csp-report',
    });
    expect(csp).toContain("img-src 'self' data: https://cdn.example.com");
    expect(csp).toContain("script-src 'self' 'nonce-abc123'");
    expect(csp).toContain('report-uri /csp-report');
  });

  it("drops 'none' when real sources are added", () => {
    expect(buildContentSecurityPolicy({ extraSources: { 'object-src': ['https://plugins.example.com'] } })).toContain(
      'object-src https://plugins.example.com;',
    );
  });

  it('can omit upgrade-insecure-requests', () => {
    expect(buildContentSecurityPolicy({ upgradeInsecureRequests: false })).not.toContain('upgrade-insecure-requests');
  });

  it.each([
    ['semicolon', "https://a.test; script-src 'unsafe-inline'"],
    ['comma', 'https://a.test, https://b.test'],
    ['LF', 'https://a.test\nX-Evil: 1'],
    ['CR LF', 'https://a.test\r\nSet-Cookie: x=1'],
    ['space', 'https://a.test https://b.test'],
    ['empty', ''],
    ['NUL', 'https://a.test\u0000'],
  ])('rejects a source with %s', (_label, source) => {
    expect(() => buildContentSecurityPolicy({ extraSources: { 'img-src': [source] } })).toThrow(/Invalid source/);
  });

  it('rejects hostile directive names and report URIs', () => {
    expect(() => buildContentSecurityPolicy({ extraSources: { "img-src 'unsafe-inline'; x": ['a'] } })).toThrow(/directive name/);
    expect(() => buildContentSecurityPolicy({ extraSources: { 'img-src\n': ['a'] } })).toThrow(/directive name/);
    expect(() => buildContentSecurityPolicy({ reportUri: '/r; script-src *' })).toThrow(/Invalid source/);
  });
});

describe('buildSecurityHeaders', () => {
  it('returns enforcing CSP and the fixed headers', () => {
    const headers = buildSecurityHeaders();
    expect(Object.keys(headers)).toEqual(['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Strict-Transport-Security']);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains');
  });

  it('uses the report-only header name in report-only mode', () => {
    const headers = buildSecurityHeaders({ reportOnly: true, reportUri: '/r' });
    expect(headers['Content-Security-Policy-Report-Only']).toContain('report-uri /r');
    expect(headers['Content-Security-Policy']).toBeUndefined();
  });

  it('can omit or tune HSTS and validates its value', () => {
    expect(buildSecurityHeaders({ hstsMaxAge: false })['Strict-Transport-Security']).toBeUndefined();
    expect(buildSecurityHeaders({ hstsMaxAge: 60 })['Strict-Transport-Security']).toBe('max-age=60; includeSubDomains');
    expect(() => buildSecurityHeaders({ hstsMaxAge: -1 })).toThrow(RangeError);
    expect(() => buildSecurityHeaders({ hstsMaxAge: 1.5 })).toThrow(RangeError);
  });

  it('propagates source validation', () => {
    expect(() => buildSecurityHeaders({ extraSources: { 'img-src': ['a\nb'] } })).toThrow();
  });
});
