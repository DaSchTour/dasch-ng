import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns the items of an iterable that are not among the given values (`===` comparison).
 *
 * @example
 * ```html
 * @for (tag of tags | without: selectedTag; track tag) { … }
 * @for (id of ids | without: 1 : 2; track id) { … }
 * ```
 */
@Pipe({ name: 'without' })
export class WithoutPipe implements PipeTransform {
  transform<T>(items: Iterable<T> | null | undefined, ...values: T[]): T[] {
    if (!items) {
      return [];
    }
    const excluded = new Set(values);
    return Array.from(items).filter((item) => !excluded.has(item));
  }
}
