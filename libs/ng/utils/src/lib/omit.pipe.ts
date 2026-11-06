import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns a shallow copy of an object without the given keys.
 *
 * @example
 * ```html
 * <pre>{{ user | omit: 'password' : 'token' | json }}</pre>
 * ```
 */
@Pipe({ name: 'omit' })
export class OmitPipe implements PipeTransform {
  transform<T extends object, K extends keyof T>(value: T, ...keys: K[]): Omit<T, K>;
  transform<T extends object, K extends keyof T>(value: T | null | undefined, ...keys: K[]): Omit<T, K> | null;
  transform<T extends object, K extends keyof T>(value: T | null | undefined, ...keys: K[]): Omit<T, K> | null {
    if (value == null) {
      return null;
    }
    const copy = { ...value };
    for (const key of keys) {
      delete copy[key];
    }
    return copy;
  }
}
