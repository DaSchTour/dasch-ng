import { FactoryProvider, InjectionToken, Type, ValueProvider } from '@angular/core';

export function provideValue<T>(provide: InjectionToken<T> | Type<T>, useValue: T, multi?: boolean): ValueProvider {
  return {
    provide,
    useValue,
    multi,
  };
}

export function provideFactory<T, U extends Array<any> = []>(
  provide: InjectionToken<T> | Type<T>,
  useFactory: (...args: U) => T,
  { deps, multi }: { deps?: any[]; multi?: boolean } = {},
): FactoryProvider {
  return {
    provide,
    useFactory,
    deps,
    multi,
  };
}
