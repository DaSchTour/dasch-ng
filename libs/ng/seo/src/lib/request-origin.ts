/** Request headers as a plain object (Node) or a `Headers`-like object with `get` (Fetch API). */
export type RequestHeaders = Record<string, string | string[] | undefined> | { get(name: string): string | null };

export interface RequestOriginOptions {
  /**
   * Hosts this app is served on, for example `['example.com', 'www.example.com', 'localhost:4000']`.
   * Compared case-insensitively against the full `Host` value (including the port, if present).
   * Entries are never treated as patterns.
   */
  allowedHosts: readonly string[];
}

// Host name (letters, digits, dots, hyphens) with an optional port. No userinfo, paths, spaces or IPv6 brackets.
const HOST = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?$/;

function header(headers: RequestHeaders, name: string): string | undefined {
  if ('get' in headers && typeof headers.get === 'function') return headers.get(name) ?? undefined;
  const value = (headers as Record<string, string | string[] | undefined>)[name];
  // A repeated header is ambiguous: treat it as missing instead of picking one.
  return typeof value === 'string' ? value : undefined;
}

/**
 * Derives the public origin (`https://example.com`) of a request from `Host` and `X-Forwarded-Proto`.
 *
 * This is a trust boundary: the `Host` header is attacker controlled, and a wrong origin ends up in canonical
 * links, sitemaps and OpenGraph tags (host header injection, cache poisoning). The origin is therefore only
 * returned when the host is in `allowedHosts`. Everything else yields `null`:
 * a missing or repeated `Host`, a host with unusual characters, a host that is not allowed, or a protocol
 * other than `http` or `https`. The protocol defaults to `https` when the proxy sends none.
 *
 * Only put `X-Forwarded-Proto` behind a proxy you control that overwrites the header.
 *
 * @example
 * requestOrigin(req.headers, { allowedHosts: ['example.com'] }); // 'https://example.com' or null
 */
export function requestOrigin(headers: RequestHeaders, options: RequestOriginOptions): string | null {
  const host = header(headers, 'host')?.trim().toLowerCase();
  if (!host || !HOST.test(host)) return null;
  if (!options.allowedHosts.some((allowed) => allowed.toLowerCase() === host)) return null;

  // A proxy chain may append values ("https, http"): the first one is the client-facing hop.
  const proto = (header(headers, 'x-forwarded-proto')?.split(',')[0].trim().toLowerCase() || 'https').trim();
  if (proto !== 'http' && proto !== 'https') return null;
  return `${proto}://${host}`;
}
