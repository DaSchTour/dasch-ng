import { Observable, OperatorFunction, pipe, UnaryFunction, filter } from 'rxjs';
import { isEmpty } from '@fxts/core';

/**
 * Filters out empty values using `@fxts/core`'s `isEmpty` function.
 *
 * This removes empty strings, arrays, objects, Maps, and Sets, as well as `null` and `undefined`.
 * Uses the `isEmpty` function from @fxts/core to determine if a value should be filtered out.
 *
 * @template T - The type of values emitted by the source observable
 * @returns An operator function that filters out empty values
 *
 * @example
 * ```typescript
 * import { of } from 'rxjs';
 * import { filterEmpty } from '@dasch-ng/rxjs-operators';
 *
 * of('hello', '', 'world', null, undefined, [], {})
 *   .pipe(filterEmpty())
 *   .subscribe(console.log);
 * // Output: 'hello', 'world'
 * ```
 */
export function filterEmpty<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
  return pipe(filter((x) => !isEmpty(x)) as OperatorFunction<T | null | undefined, T>);
}
