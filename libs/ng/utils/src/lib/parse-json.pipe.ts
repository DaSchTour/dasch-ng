import { Pipe, PipeTransform } from '@angular/core';

/**
 * Parses a JSON string and returns `null` instead of throwing for invalid JSON or non-string
 * input. The type argument only documents the expected shape; the result is not validated.
 *
 * @example
 * ```html
 * @let settings = row.settingsJson | parseJson;
 * @if (settings) { <pre>{{ settings | json }}</pre> }
 * ```
 */
@Pipe({ name: 'parseJson' })
export class ParseJsonPipe implements PipeTransform {
  transform<T = unknown>(value: unknown): T | null {
    if (typeof value !== 'string') {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
}
