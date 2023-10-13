import { filter, Observable, OperatorFunction } from 'rxjs';
import { isNil, isString } from '@fxts/core';

export function filterError() {
  return (source$: Observable<unknown>): Observable<Error> =>
    source$.pipe(
      filter((x) => x instanceof Error) as OperatorFunction<unknown, Error>
    );
}
