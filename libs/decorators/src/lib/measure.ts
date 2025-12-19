import { isAsyncFunction } from './utils';

export function measure(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;
  let name: string;
  if (target && target.constructor && target.constructor.name) {
    name = target.constructor.name;
  } else if (target && target.name) {
    name = target.name;
  }

  if (isAsyncFunction(originalMethod)) {
    descriptor.value = async function (...args: any): Promise<any> {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      console.debug(`Call to ${name}.${propertyKey} took ${(end - start).toFixed(2)} milliseconds.`);
      return result;
    };
  } else {
    descriptor.value = function (...args: any) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();
      console.debug(`Call to ${name}.${propertyKey} took ${(end - start).toFixed(2)} milliseconds.`);
      return result;
    };
  }
  return descriptor;
}
