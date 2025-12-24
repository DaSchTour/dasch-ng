import { filter, Observable, OperatorFunction } from 'rxjs';
import { isString } from '@fxts/core';

/**
 * Filters values to only allow strings, with proper TypeScript type narrowing.
 *
 * This operator removes all non-string values from the observable stream and narrows
 * the type to `string`, ensuring type safety in TypeScript.
 *
 * @returns An operator function that filters to only string values
 *
 * @example
 * ```typescript
 * import { of } from 'rxjs';
 * import { filterString } from '@dasch-ng/rxjs-operators';
 *
 * of('hello', 42, 'world', true, 'test')
 *   .pipe(filterString())
 *   .subscribe(console.log);
 * // Output: 'hello', 'world', 'test'
 * ```
 */
export function filterString() {
  return (source$: Observable<unknown>): Observable<string> => source$.pipe(filter((x) => isString(x)) as OperatorFunction<unknown, string>);
}
