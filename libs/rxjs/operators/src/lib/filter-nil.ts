import { filter, Observable, OperatorFunction } from 'rxjs';
import { isNil } from '@fxts/core';

/**
 * Filters out `null` and `undefined` values from the stream, providing proper TypeScript type narrowing.
 *
 * This operator removes all nil values (null and undefined) from the observable stream and narrows
 * the type to `NonNullable<T>`, ensuring type safety in TypeScript.
 *
 * @template T - The type of values emitted by the source observable
 * @returns An operator function that filters out null and undefined values
 *
 * @example
 * ```typescript
 * import { of } from 'rxjs';
 * import { filterNil } from '@dasch-ng/rxjs-operators';
 *
 * of(1, null, 2, undefined, 3)
 *   .pipe(filterNil())
 *   .subscribe(console.log);
 * // Output: 1, 2, 3
 * ```
 */
export function filterNil<T>() {
  return (source$: Observable<T>): Observable<NonNullable<T>> => source$.pipe(filter((x) => !isNil(x)) as OperatorFunction<T, NonNullable<T>>);
}
