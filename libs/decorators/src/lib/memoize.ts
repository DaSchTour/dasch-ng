import { memoize as _memoize } from '@fxts/core';

export function memoize() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    descriptor.value = _memoize(descriptor.value);
    return descriptor;
  };
}
