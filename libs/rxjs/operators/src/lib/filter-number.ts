import { filter, Observable, OperatorFunction } from 'rxjs';
import { isNumber } from '@fxts/core';

/**
 * Filters values to only allow numbers, with proper TypeScript type narrowing.
 *
 * This operator removes all non-number values from the observable stream and narrows
 * the type to `number`, ensuring type safety in TypeScript. Note that NaN is considered
 * a number type in TypeScript and will pass through this filter.
 *
 * @returns An operator function that filters to only number values
 *
 * @example
 * ```typescript
 * import { of } from 'rxjs';
 * import { filterNumber } from '@dasch-ng/rxjs-operators';
 *
 * of('hello', 42, 'world', 3.14, true, 123)
 *   .pipe(filterNumber())
 *   .subscribe(console.log);
 * // Output: 42, 3.14, 123
 * ```
 */
export function filterNumber() {
  return (source$: Observable<unknown>): Observable<number> => source$.pipe(filter((x) => isNumber(x)) as OperatorFunction<unknown, number>);
}
