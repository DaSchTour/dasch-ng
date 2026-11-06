import { Pipe, PipeTransform } from '@angular/core';
import { cachedFormatter, IntlPipeBase, toDate } from './formatter-cache';

/** `dateStyle` shorthands; pass `Intl.DateTimeFormatOptions` for anything else (time, time zone, parts). */
export type IntlDateFormat = 'short' | 'medium' | 'long' | 'full' | Intl.DateTimeFormatOptions;

export function toDateTimeOptions(format: IntlDateFormat): Intl.DateTimeFormatOptions {
  return typeof format === 'string' ? { dateStyle: format } : format;
}

/**
 * Formats a date with `Intl.DateTimeFormat`. Accepts a `Date`, a timestamp or an ISO string;
 * returns `null` for missing or invalid input.
 *
 * @example
 * ```html
 * {{ createdAt | intlDate }}                                       <!-- Nov 6, 2026 -->
 * {{ createdAt | intlDate: 'long' : 'de-DE' }}                     <!-- 6. November 2026 -->
 * {{ createdAt | intlDate: { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' } }}
 * ```
 */
@Pipe({ name: 'intlDate' })
export class IntlDatePipe extends IntlPipeBase implements PipeTransform {
  transform(value: Date | number | string | null | undefined, format: IntlDateFormat = 'medium', locale?: string): string | null {
    const date = toDate(value);
    return date ? cachedFormatter(Intl.DateTimeFormat, this.locale(locale), toDateTimeOptions(format)).format(date) : null;
  }
}

/**
 * Formats a date range with `Intl.DateTimeFormat.formatRange`, which leaves out repeated
 * parts: `Nov 3 – 7, 2026` instead of `Nov 3, 2026 – Nov 7, 2026`.
 *
 * @example
 * ```html
 * {{ [event.start, event.end] | intlDateRange }}
 * {{ [start, end] | intlDateRange: 'long' : 'de-DE' }}   <!-- 3.–7. November 2026 -->
 * ```
 */
@Pipe({ name: 'intlDateRange' })
export class IntlDateRangePipe extends IntlPipeBase implements PipeTransform {
  transform(
    range: readonly [Date | number | string | null | undefined, Date | number | string | null | undefined] | null | undefined,
    format: IntlDateFormat = 'medium',
    locale?: string,
  ): string | null {
    const start = toDate(range?.[0]);
    const end = toDate(range?.[1]);
    if (!start || !end) {
      return null;
    }
    return cachedFormatter(Intl.DateTimeFormat, this.locale(locale), toDateTimeOptions(format)).formatRange(start, end);
  }
}
