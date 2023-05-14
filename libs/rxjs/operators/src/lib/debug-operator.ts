import { Observable, dematerialize, map, materialize } from 'rxjs';

export function debug<T>(label?: string): (source: Observable<T>) => Observable<T> {
  return function debugOperatorFunction(source: Observable<T>) {
    return source.pipe(
      materialize(),
      map((next) => {
        console.log(label, next);
        return next;
      }),
      dematerialize(),
    );
  };
}
