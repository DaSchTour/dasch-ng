import { filter, Observable, OperatorFunction } from 'rxjs';
import { isNil, isString } from '@fxts/core';

export function filterString() {
  return (source$: Observable<unknown>): Observable<string> => source$.pipe(filter((x) => isString(x)) as OperatorFunction<unknown, string>);
}
