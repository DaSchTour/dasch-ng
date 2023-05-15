import { filter, Observable, OperatorFunction } from 'rxjs';
import { isNil } from '@fxts/core';

export function filterNil<T>() {
  return (source$: Observable<T>): Observable<NonNullable<T>> =>
    source$.pipe(
      filter((x) => !isNil(x)) as OperatorFunction<T, NonNullable<T>>
    );
}
