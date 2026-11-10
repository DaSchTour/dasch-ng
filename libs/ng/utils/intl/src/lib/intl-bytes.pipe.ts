import { Pipe, PipeTransform } from '@angular/core';
import { cachedFormatter, IntlPipeBase } from './formatter-cache';

const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'] as const;

export interface IntlBytesOptions extends Omit<Intl.NumberFormatOptions, 'style' | 'unit'> {
  /**
   * `1000` (default) for SI sizes as storage vendors use them. `1024` divides by 1024 but keeps
   * the `kB`/`MB`/`GB` labels, the convention of most operating systems and media tools; use
   * `binaryBytes` for IEC labels (`KiB`, `MiB`).
   */
  base?: 1000 | 1024;
}

/**
 * Formats a byte count with `Intl.NumberFormat` units, so number and unit follow the locale:
 * `1.6 GB` (en), `1,6 GB` (de), `1,6 Go` (fr). Missing, invalid or negative values give `''`.
 * `maximumFractionDigits` defaults to `1`.
 *
 * Locale-aware alternative to `decimalBytes`/`binaryBytes`, which keep their output.
 *
 * @example
 * ```html
 * {{ 1600000000 | intlBytes }}                                    <!-- 1.6 GB -->
 * {{ 1717986918 | intlBytes: { base: 1024 } : 'de-DE' }}          <!-- 1,6 GB -->
 * {{ 1536 | intlBytes: { maximumFractionDigits: 2, unitDisplay: 'long' } }} <!-- 1.54 kilobytes -->
 * ```
 */
@Pipe({ name: 'intlBytes' })
export class IntlBytesPipe extends IntlPipeBase implements PipeTransform {
  transform(bytes: number | null | undefined, options: IntlBytesOptions = {}, locale?: string): string {
    if (bytes == null || !Number.isFinite(bytes) || bytes < 0) {
      return '';
    }
    const { base = 1000, ...format } = options;
    const exponent = bytes < base ? 0 : Math.min(Math.floor(Math.log(bytes) / Math.log(base)), UNITS.length - 1);
    return cachedFormatter(Intl.NumberFormat, this.locale(locale), {
      maximumFractionDigits: 1,
      ...format,
      style: 'unit',
      unit: UNITS[exponent],
    }).format(bytes / base ** exponent);
  }
}
