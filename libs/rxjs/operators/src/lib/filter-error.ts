import { filter, Observable, OperatorFunction } from 'rxjs';

/**
 * Filters values to only allow Error instances, with proper TypeScript type narrowing.
 *
 * This operator removes all non-Error values from the observable stream and narrows
 * the type to `Error`, ensuring type safety in TypeScript. Useful for error handling
 * and filtering error streams.
 *
 * @returns An operator function that filters to only Error instances
 *
 * @example
 * ```typescript
 * import { of } from 'rxjs';
 * import { filterError } from '@dasch-ng/rxjs-operators';
 *
 * of(new Error('fail'), 'success', new TypeError('type error'), 42)
 *   .pipe(filterError())
 *   .subscribe(console.log);
 * // Output: Error('fail'), TypeError('type error')
 * ```
 */
export function filterError() {
  return (source$: Observable<unknown>): Observable<Error> => source$.pipe(filter((x) => x instanceof Error) as OperatorFunction<unknown, Error>);
}
