import {
  Observable,
  OperatorFunction,
  pipe,
  UnaryFunction,
  filter,
} from 'rxjs';
import { isEmpty } from '@fxts/core';

export function filterEmpty<T>(): UnaryFunction<
  Observable<T | null | undefined>,
  Observable<T>
> {
  return pipe(
    filter((x) => !isEmpty(x)) as OperatorFunction<T | null | undefined, T>
  );
}
