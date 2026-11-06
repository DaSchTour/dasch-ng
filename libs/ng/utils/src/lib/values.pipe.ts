import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns the values of a `Map`, a `Set` or a plain object as an array, in insertion order.
 * Unlike Angular's `keyvalue` pipe it does not sort and does not wrap entries.
 *
 * @example
 * ```html
 * @for (user of usersById | values; track user.id) { … }
 * ```
 */
@Pipe({ name: 'values' })
export class ValuesPipe implements PipeTransform {
  transform<T>(value: ReadonlyMap<unknown, T> | ReadonlySet<T> | Record<PropertyKey, T> | null | undefined): T[] {
    if (value == null) {
      return [];
    }
    if (value instanceof Map || value instanceof Set) {
      return Array.from(value.values() as Iterable<T>);
    }
    return Object.values(value as Record<PropertyKey, T>);
  }
}
