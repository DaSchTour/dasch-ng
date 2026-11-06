import { Pipe, PipeTransform } from '@angular/core';
import { cachedFormatter, IntlPipeBase } from './formatter-cache';

/**
 * Formats a number with `Intl.NumberFormat`: grouping, decimals, `percent`, `compact`
 * notation or units. No locale data registration needed.
 *
 * @example
 * ```html
 * {{ 1234.5 | intlNumber }}                                         <!-- 1,234.5 -->
 * {{ 0.256 | intlNumber: { style: 'percent' } }}                    <!-- 26% -->
 * {{ 1500000 | intlNumber: { notation: 'compact' } }}               <!-- 1.5M -->
 * {{ 12 | intlNumber: { style: 'unit', unit: 'kilometer-per-hour' } }} <!-- 12 km/h -->
 * ```
 */
@Pipe({ name: 'intlNumber' })
export class IntlNumberPipe extends IntlPipeBase implements PipeTransform {
  transform(value: number | bigint | null | undefined, options?: Intl.NumberFormatOptions, locale?: string): string | null {
    if (value == null || (typeof value === 'number' && Number.isNaN(value))) {
      return null;
    }
    return cachedFormatter(Intl.NumberFormat, this.locale(locale), options).format(value);
  }
}
