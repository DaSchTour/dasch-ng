import { first, interval as every, map, Observable, startWith, timeout } from 'rxjs';

export interface PollUntilOptions<T> {
  /** Milliseconds between reads. Default `100`. */
  interval?: number;
  /** Milliseconds until the observable errors with rxjs' `TimeoutError`. Default `10000`; `Infinity` waits forever. */
  timeout?: number;
  /** When a value counts as ready. Default: not `null`, `undefined`, `''` or `false`. */
  ready?: (value: T) => boolean;
}

const isPresent = (value: unknown) => value != null && value !== '' && value !== false;

/**
 * Reads a value repeatedly until it is ready, then emits it once and completes. The first
 * read happens immediately, so an already available value is emitted synchronously.
 *
 * Useful when something is initialised outside your control, e.g. an auth token or a
 * third-party script global, and requests must wait for it.
 *
 * @example
 * ```typescript
 * import { pollUntil } from '@dasch-ng/rxjs-operators';
 *
 * pollUntil(() => auth.token, { timeout: 5000 })
 *   .pipe(switchMap((token) => http.get(url, { headers: { Authorization: `Bearer ${token}` } })))
 *   .subscribe();
 *
 * pollUntil(() => window.someSdk, { interval: 250 }).subscribe((sdk) => sdk.init());
 * ```
 */
export function pollUntil<T>(read: () => T, options: PollUntilOptions<T> = {}): Observable<NonNullable<T>> {
  const { interval = 100, timeout: timeoutMs = 10_000, ready = isPresent } = options;
  const polled = every(interval).pipe(
    startWith(-1),
    map(() => read()),
    first((value) => ready(value)),
    map((value) => value as NonNullable<T>),
  );
  return Number.isFinite(timeoutMs) ? polled.pipe(timeout(timeoutMs)) : polled;
}
