/** Directive name to extra sources, for example `{ 'img-src': ['https://cdn.example.com'] }`. */
export type CspSources = Record<string, readonly string[]>;

export interface ContentSecurityPolicyOptions {
  /** Sources added to the defaults per directive. A directive that has no default is created. */
  extraSources?: CspSources;
  /** Where browsers send violation reports (`report-uri`): an absolute http(s) URL or a path. */
  reportUri?: string;
  /** Adds `upgrade-insecure-requests`. Default `true`. */
  upgradeInsecureRequests?: boolean;
}

export interface SecurityHeadersOptions extends ContentSecurityPolicyOptions {
  /** Sends `Content-Security-Policy-Report-Only` instead of enforcing the policy. */
  reportOnly?: boolean;
  /** `Strict-Transport-Security` max-age in seconds. Default two years, `false` omits the header. */
  hstsMaxAge?: number | false;
  /** Default `strict-origin-when-cross-origin`. */
  referrerPolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
}

/** Restrictive defaults. Add what your app really loads through `extraSources`. */
const DEFAULT_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
  'frame-ancestors': ["'self'"],
  'form-action': ["'self'"],
  'img-src': ["'self'", 'data:'],
};

const DIRECTIVE_NAME = /^[a-z][a-z0-9-]*$/;

function checkSource(value: string, directive: string): string {
  // ';' starts a new directive, ',' a new policy, whitespace a new source, control chars end the header.
  // eslint-disable-next-line no-control-regex
  if (value === '' || /[;,\s\u0000-\u001F\u007F]/.test(value)) {
    throw new Error(`Invalid source for ${directive}: ${JSON.stringify(value)} (empty, or contains ";", "," or whitespace)`);
  }
  return value;
}

/**
 * Builds a `Content-Security-Policy` header value.
 *
 * Every directive name and source is validated, so values from configuration or user input cannot add directives,
 * policies or header lines.
 *
 * @throws Error for an empty source or one containing `;`, `,`, whitespace or control characters
 *   (including line breaks), or an invalid directive name.
 */
export function buildContentSecurityPolicy(options: ContentSecurityPolicyOptions = {}): string {
  const directives = new Map<string, string[]>(Object.entries(DEFAULT_DIRECTIVES).map(([k, v]) => [k, [...v]]));
  for (const [name, sources] of Object.entries(options.extraSources ?? {})) {
    if (!DIRECTIVE_NAME.test(name)) throw new Error(`Invalid CSP directive name: ${JSON.stringify(name)}`);
    const list = directives.get(name) ?? [];
    for (const source of sources) {
      const checked = checkSource(source, name);
      // 'none' is only valid on its own: any other source replaces it.
      if (!list.includes(checked)) list.push(checked);
    }
    directives.set(name, list.length > 1 ? list.filter((s) => s !== "'none'") : list);
  }
  const parts = [...directives].map(([name, sources]) => [name, ...sources].join(' '));
  if (options.reportUri !== undefined) {
    parts.push(`report-uri ${checkSource(options.reportUri, 'report-uri')}`);
  }
  if (options.upgradeInsecureRequests !== false) parts.push('upgrade-insecure-requests');
  return parts.join('; ');
}

/**
 * Builds a set of security response headers: CSP (enforcing or report-only), `X-Content-Type-Options`,
 * `Referrer-Policy` and `Strict-Transport-Security`.
 *
 * @returns Header name to value. Apply with `res.setHeader` or `new Headers(...)`.
 */
export function buildSecurityHeaders(options: SecurityHeadersOptions = {}): Record<string, string> {
  const headers: Record<string, string> = {
    [options.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy']: buildContentSecurityPolicy(options),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': options.referrerPolicy ?? 'strict-origin-when-cross-origin',
  };
  const maxAge = options.hstsMaxAge ?? 63_072_000;
  if (maxAge !== false) {
    if (!Number.isInteger(maxAge) || maxAge < 0) throw new RangeError(`hstsMaxAge must be a non-negative integer, got ${maxAge}`);
    headers['Strict-Transport-Security'] = `max-age=${maxAge}; includeSubDomains`;
  }
  return headers;
}
