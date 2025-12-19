import { isAsyncFunction } from './utils';

export function logGroup(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;
  let name: string;
  if (target && target.constructor && target.constructor.name) {
    name = target.constructor.name;
  } else if (target && target.name) {
    name = target.name;
  }

  if (isAsyncFunction(originalMethod)) {
    descriptor.value = async function (...args: any): Promise<any> {
      console.group(`${name}.${propertyKey}`);
      const result = await originalMethod.apply(this, args);
      console.groupEnd();
      return result;
    };
  } else {
    descriptor.value = function (...args: any) {
      console.group(`${name}.${propertyKey}`);
      const result = originalMethod.apply(this, args);
      console.groupEnd();
      return result;
    };
  }
  return descriptor;
}
