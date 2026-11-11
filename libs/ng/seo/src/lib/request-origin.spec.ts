import { requestOrigin } from './request-origin';

const options = { allowedHosts: ['example.com', 'localhost:4000'] };

describe('requestOrigin', () => {
  it('builds the origin from Host and X-Forwarded-Proto', () => {
    expect(requestOrigin({ host: 'example.com', 'x-forwarded-proto': 'http' }, options)).toBe('http://example.com');
  });

  it('defaults to https and supports host with port', () => {
    expect(requestOrigin({ host: 'localhost:4000' }, options)).toBe('https://localhost:4000');
  });

  it('takes the first value of a proxy chain', () => {
    expect(requestOrigin({ host: 'example.com', 'x-forwarded-proto': 'https, http' }, options)).toBe('https://example.com');
  });

  it('matches case-insensitively and returns the normalized host', () => {
    expect(requestOrigin({ host: 'EXAMPLE.com' }, options)).toBe('https://example.com');
  });

  it('works with Fetch API headers', () => {
    expect(requestOrigin(new Headers({ host: 'example.com' }), options)).toBe('https://example.com');
  });

  it.each(['evil.com', 'example.com.evil.com', 'evil.com/example.com', 'example.com@evil.com', 'example.com:8080', 'evil.com#example.com', 'sub.example.com'])(
    'never returns an origin for host %s',
    (host) => {
      expect(requestOrigin({ host }, options)).toBeNull();
    },
  );

  it('rejects hosts with control characters, spaces or userinfo even if listed', () => {
    const lax = { allowedHosts: ['example.com\r\nX-Evil: 1', 'a b', 'user@example.com', 'example.com/path'] };
    expect(requestOrigin({ host: 'example.com\r\nX-Evil: 1' }, lax)).toBeNull();
    expect(requestOrigin({ host: 'a b' }, lax)).toBeNull();
    expect(requestOrigin({ host: 'user@example.com' }, lax)).toBeNull();
    expect(requestOrigin({ host: 'example.com/path' }, lax)).toBeNull();
  });

  it('returns null for a missing, empty or repeated Host header', () => {
    expect(requestOrigin({}, options)).toBeNull();
    expect(requestOrigin({ host: '' }, options)).toBeNull();
    expect(requestOrigin({ host: ['example.com', 'evil.com'] }, options)).toBeNull();
  });

  it('does not treat allow list entries as patterns and returns null for an empty list', () => {
    expect(requestOrigin({ host: 'sub.example.com' }, { allowedHosts: ['*.example.com'] })).toBeNull();
    expect(requestOrigin({ host: 'example.com' }, { allowedHosts: [] })).toBeNull();
  });

  it.each(['javascript', 'ftp', 'https://evil.com', 'file'])('returns null for protocol %s', (proto) => {
    expect(requestOrigin({ host: 'example.com', 'x-forwarded-proto': proto }, options)).toBeNull();
  });
});
