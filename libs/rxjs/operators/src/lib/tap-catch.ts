import { pipe, ObservableInput, tap, catchError, Observable } from 'rxjs';

/**
 * Combines the `tap` and `catchError` operators into a single convenient operator.
 *
 * This operator is useful for executing side effects on successful emissions and handling
 * errors in a single operation. It first applies a tap operation for side effects, then
 * catches any errors that occur.
 *
 * @template T - The type of values emitted by the source observable
 * @template O - The type of ObservableInput returned by the error handler
 * @template R - The type of values emitted by the error handler's observable
 * @param options - Configuration object
 * @param options.next - A function to execute for each emitted value (side effect)
 * @param options.error - An error handler function that returns an ObservableInput
 * @returns An operator function that performs side effects and catches errors
 *
 * @example
 * ```typescript
 * import { of, throwError } from 'rxjs';
 * import { tapCatch } from '@dasch-ng/rxjs-operators';
 *
 * throwError(() => new Error('Oops!'))
 *   .pipe(
 *     tapCatch({
 *       next: (value) => console.log('Got value:', value),
 *       error: (err, caught) => {
 *         console.error('Error occurred:', err);
 *         return of('fallback value');
 *       }
 *     })
 *   )
 *   .subscribe(console.log);
 * // Console output:
 * // Error occurred: Error: Oops!
 * // fallback value
 * ```
 */
export function tapCatch<T, O extends ObservableInput<R>, R = any>({
  next,
  error,
}: {
  next: (value: T) => void;
  error: (error: unknown, caught: Observable<T>) => O;
}) {
  return pipe(tap({ next }), catchError(error));
}
