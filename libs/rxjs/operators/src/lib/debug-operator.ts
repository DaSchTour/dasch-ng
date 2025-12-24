import { Observable, dematerialize, map, materialize } from 'rxjs';

/**
 * A debugging operator that logs all notifications (next, error, complete) from an observable stream.
 * Useful for development and troubleshooting.
 *
 * @template T - The type of values emitted by the source observable
 * @param label - Optional string label to identify the stream in console output
 * @returns An operator function that logs all notifications and passes them through unchanged
 *
 * @example
 * ```typescript
 * import { of } from 'rxjs';
 * import { debug } from '@dasch-ng/rxjs-operators';
 *
 * of(1, 2, 3)
 *   .pipe(debug('my-stream'))
 *   .subscribe();
 * // Console output:
 * // my-stream { kind: 'N', value: 1 }
 * // my-stream { kind: 'N', value: 2 }
 * // my-stream { kind: 'N', value: 3 }
 * // my-stream { kind: 'C' }
 * ```
 */
export function debug<T>(label?: string): (source: Observable<T>) => Observable<T> {
  return function debugOperatorFunction(source: Observable<T>) {
    return source.pipe(
      materialize(),
      map((next) => {
        console.log(label, next);
        return next;
      }),
      dematerialize(),
    );
  };
}
