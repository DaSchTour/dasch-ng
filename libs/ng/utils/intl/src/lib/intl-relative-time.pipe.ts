import { Pipe, PipeTransform } from '@angular/core';
import { cachedFormatter, IntlPipeBase, toDate } from './formatter-cache';

export interface IntlRelativeTimeOptions extends Intl.RelativeTimeFormatOptions {
  /** Reference point, default the current time. Pass a signal value to refresh the output. */
  now?: Date | number;
}

const SECOND = 1000;
const UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 3600 * SECOND],
  ['month', 30 * 24 * 3600 * SECOND],
  ['week', 7 * 24 * 3600 * SECOND],
  ['day', 24 * 3600 * SECOND],
  ['hour', 3600 * SECOND],
  ['minute', 60 * SECOND],
  ['second', SECOND],
];

/**
 * Formats the distance from now to a date with `Intl.RelativeTimeFormat`, choosing the unit
 * automatically: `3 minutes ago`, `in 2 days`, `yesterday` (`numeric: 'auto'` is the default).
 *
 * The pipe is pure, so the text only changes when the input changes. To keep it current,
 * pass a ticking `now`, e.g. from a signal updated every minute.
 *
 * @example
 * ```html
 * {{ comment.createdAt | intlRelativeTime }}                    <!-- 5 minutes ago -->
 * {{ comment.createdAt | intlRelativeTime: { now: now() } }}
 * {{ deadline | intlRelativeTime: { style: 'short' } : 'de-DE' }} <!-- in 3 Tagen -->
 * ```
 */
@Pipe({ name: 'intlRelativeTime' })
export class IntlRelativeTimePipe extends IntlPipeBase implements PipeTransform {
  transform(value: Date | number | string | null | undefined, options: IntlRelativeTimeOptions = {}, locale?: string): string | null {
    const date = toDate(value);
    if (!date) {
      return null;
    }
    const { now = Date.now(), ...formatOptions } = options;
    const diff = date.getTime() - (now instanceof Date ? now.getTime() : now);
    const [unit, size] = UNITS.find(([, ms]) => Math.abs(diff) >= ms) ?? ['second', SECOND];
    return cachedFormatter(Intl.RelativeTimeFormat, this.locale(locale), { numeric: 'auto', ...formatOptions }).format(Math.round(diff / size), unit);
  }
}
