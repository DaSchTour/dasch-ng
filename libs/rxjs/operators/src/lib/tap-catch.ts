import { pipe, ObservableInput, tap, catchError, Observable } from 'rxjs';

export function tapCatch<T, O extends ObservableInput<R>, R = any>({
  next,
  error,
}: {
  next: (value: T) => void;
  error: (error: unknown, caught: Observable<T>) => O;
}) {
  return pipe(tap({ next }), catchError(error));
}
