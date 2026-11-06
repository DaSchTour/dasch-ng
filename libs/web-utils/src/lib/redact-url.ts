/**
 * Query parameters that commonly carry secrets: OAuth/OIDC redirect parameters, tokens and
 * client secrets of payment redirects.
 */
export const SECRET_URL_PARAMS: readonly string[] = [
  'code',
  'state',
  'session_state',
  'iss',
  'token',
  'access_token',
  'id_token',
  'refresh_token',
  'client_secret',
  'payment_intent_client_secret',
  'setup_intent_client_secret',
];

export interface RedactUrlOptions {
  /** Query parameters to remove. Default {@link SECRET_URL_PARAMS}. */
  params?: readonly string[];
  /** Keep the fragment. Default `false`, because OAuth implicit flows put tokens there. */
  keepHash?: boolean;
}

/**
 * Removes secret query parameters and the fragment from an absolute http(s) URL, e.g.
 * before sending page URLs to analytics or logs. Other strings are returned unchanged.
 *
 * @example
 * ```typescript
 * redactUrl('https://example.com/callback?code=abc&lang=de#access_token=x');
 * // 'https://example.com/callback?lang=de'
 * redactUrl(url, { params: [...SECRET_URL_PARAMS, 'email'] });
 * ```
 */
export function redactUrl(value: string, options: RedactUrlOptions = {}): string {
  if (!/^https?:\/\//i.test(value)) {
    return value;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return value;
  }
  for (const param of options.params ?? SECRET_URL_PARAMS) {
    url.searchParams.delete(param);
  }
  if (!options.keepHash) {
    url.hash = '';
  }
  return url.toString();
}
