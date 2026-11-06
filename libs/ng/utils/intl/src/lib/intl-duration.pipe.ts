import { Pipe, PipeTransform } from '@angular/core';
import { cachedFormatter, IntlPipeBase } from './formatter-cache';

/** A duration split into units, as `Intl.DurationFormat` takes it. */
export interface IntlDurationValue {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/** Splits milliseconds into hours, minutes, seconds and milliseconds. */
export function splitMilliseconds(ms: number): IntlDurationValue {
  const sign = ms < 0 ? -1 : 1;
  let rest = Math.round(Math.abs(ms));
  const hours = Math.floor(rest / 3_600_000);
  rest -= hours * 3_600_000;
  const minutes = Math.floor(rest / 60_000);
  rest -= minutes * 60_000;
  const seconds = Math.floor(rest / 1000);
  // `|| 0` turns -0 into 0, which DurationFormat would reject as a mixed sign.
  return {
    hours: sign * hours || 0,
    minutes: sign * minutes || 0,
    seconds: sign * seconds || 0,
    milliseconds: sign * (rest - seconds * 1000) || 0,
  };
}

/**
 * Formats a duration with `Intl.DurationFormat`. Takes either a duration object or a number
 * of milliseconds (split into hours, minutes, seconds). Use `style: 'digital'` for a timecode.
 *
 * Needs Chrome 129, Safari 16.4 or Firefox 136 or later. Older browsers get a plain
 * `1 hours 5 minutes` style fallback.
 *
 * @example
 * ```html
 * {{ { hours: 1, minutes: 5 } | intlDuration }}                  <!-- 1 hr, 5 min -->
 * {{ clip.durationMs | intlDuration: { style: 'digital' } }}     <!-- 0:02:14 -->
 * {{ 90_000 | intlDuration: { style: 'long' } : 'de-DE' }}       <!-- 1 Minute, 30 Sekunden -->
 * ```
 */
@Pipe({ name: 'intlDuration' })
export class IntlDurationPipe extends IntlPipeBase implements PipeTransform {
  transform(value: IntlDurationValue | number | null | undefined, options?: Intl.DurationFormatOptions, locale?: string): string | null {
    if (value == null || (typeof value === 'number' && !Number.isFinite(value))) {
      return null;
    }
    const duration = typeof value === 'number' ? splitMilliseconds(value) : value;
    if (typeof Intl.DurationFormat === 'undefined') {
      // shortcut: unlocalized fallback for browsers without DurationFormat; drop once they are gone.
      return Object.entries(duration)
        .filter(([, amount]) => amount)
        .map(([unit, amount]) => `${amount} ${unit}`)
        .join(' ');
    }
    return cachedFormatter(Intl.DurationFormat, this.locale(locale), options).format(duration);
  }
}
