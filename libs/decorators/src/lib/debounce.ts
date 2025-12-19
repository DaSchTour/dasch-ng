// TODO find alternative
import _debounce from 'lodash.debounce';

export function debounce(milliseconds = 0, options = {}): any {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const map = new WeakMap();
    const originalMethod = descriptor.value;
    descriptor.value = function (...params: Array<any>) {
      let debounced = map.get(this);
      if (!debounced) {
        debounced = _debounce(originalMethod, milliseconds, options).bind(this);
        map.set(this, debounced);
      }
      debounced(...params);
    };
    return descriptor;
  };
}
