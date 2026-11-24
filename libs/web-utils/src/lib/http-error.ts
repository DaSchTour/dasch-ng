/** Common HTTP status codes. */
export const HttpStatus = {
  Ok: 200,
  Created: 201,
  NoContent: 204,
  NotModified: 304,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  Conflict: 409,
  UnprocessableEntity: 422,
  TooManyRequests: 429,
  InternalServerError: 500,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
} as const;

export type HttpErrorKind = 'not-found' | 'forbidden' | 'unauthorized' | 'server' | 'network' | 'unknown';

const isNumber = (value: unknown): value is number => typeof value === 'number';

/**
 * Reads the HTTP status from the shapes common HTTP clients use: Angular `HttpErrorResponse` and
 * `fetch` `Response` (`status`), ofetch (`statusCode`, `status`, `response.status`).
 */
function statusOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const { status, statusCode, response } = error as Record<string, unknown>;
  const nested = typeof response === 'object' && response !== null ? (response as Record<string, unknown>)['status'] : undefined;
  return [status, statusCode, nested].find(isNumber);
}

/** Whether `error` carries the given HTTP status (any of the shapes `classifyHttpError` understands). */
export function hasHttpStatus(error: unknown, status: number): error is object {
  return statusOf(error) === status;
}

/**
 * Sorts an error from Angular `HttpClient`, `fetch` or ofetch into a kind that is useful for
 * UI and SSR decisions. Works on the shape only, so it needs no Angular or fetch import.
 * Status 0, a `TypeError` (what `fetch` throws when offline) and an ofetch error without a
 * response count as `'network'`. Other statuses (for example 400, 429) are `'unknown'`.
 *
 * @example
 * ```typescript
 * classifyHttpError(new HttpErrorResponse({ status: 404 })); // 'not-found'
 * classifyHttpError(new TypeError('Failed to fetch'));        // 'network'
 * ```
 */
export function classifyHttpError(error: unknown): HttpErrorKind {
  const status = statusOf(error);
  if (status === undefined) {
    const isFetchError = (error as { name?: unknown } | null)?.name === 'FetchError';
    return error instanceof TypeError || isFetchError ? 'network' : 'unknown';
  }
  if (status === 0) return 'network';
  if (status === HttpStatus.NotFound) return 'not-found';
  if (status === HttpStatus.Forbidden) return 'forbidden';
  if (status === HttpStatus.Unauthorized) return 'unauthorized';
  return status >= 500 ? 'server' : 'unknown';
}
