import { BehaviorSubject, Observable } from 'rxjs';

/**
 * `@Observe` is a decorator that allows to subscribe to the stream of changes
 * of another property. It can be used for `@Input` properties, but not necessarily.
 *
 * @param observedKey Key of the property to observe.
 *
 * @example
 *
 * @Component({
 *   selector: 'some-component',
 *   template: '<span>{{ foo$ | async }}</span>'
 * })
 * export class SomeComponent {
 *   @Input() foo: number;
 *   @Observe('foo') foo$: Observable<number>;
 * }
 */
export function Observe<T>(observedKey: string): PropertyDecorator {
  return (target: any, key: string | symbol): void => {
    const subjects = new WeakMap<any, BehaviorSubject<T | undefined>>();

    const getSubject = (instance: any): BehaviorSubject<T | undefined> | undefined => {
      if (!subjects.has(instance)) {
        subjects.set(instance, new BehaviorSubject<T | undefined>(undefined));
      }
      return subjects.get(instance);
    };

    Object.defineProperty(target, key, {
      get(): Observable<T | undefined> | undefined {
        return getSubject(this);
      },
    });

    Object.defineProperty(target, observedKey, {
      get(): T | undefined {
        return getSubject(this)?.getValue();
      },
      set(instanceNewValue: T): void {
        getSubject(this)?.next(instanceNewValue);
      },
    });
  };
}
