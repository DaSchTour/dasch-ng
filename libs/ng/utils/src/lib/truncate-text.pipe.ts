import { Pipe, PipeTransform } from '@angular/core';

/**
 * Shortens text to at most `limit` characters plus `…`, cutting at the last space before
 * the limit. If that space lies in the first half, it cuts at the limit instead, so a long
 * first word does not leave almost nothing.
 *
 * @example
 * ```html
 * <p>{{ description | truncateText: 120 }}</p>
 * ```
 */
@Pipe({ name: 'truncateText' })
export class TruncateTextPipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 160): string {
    if (!value || value.length <= limit) {
      return value ?? '';
    }
    const lastSpace = value.lastIndexOf(' ', limit);
    const cut = lastSpace > limit / 2 ? lastSpace : limit;
    return `${value.slice(0, cut).trimEnd()}…`;
  }
}
