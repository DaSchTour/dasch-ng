import { Pipe, PipeTransform } from '@angular/core';
import { cachedFormatter, IntlPipeBase } from './formatter-cache';

export interface IntlCurrencyOptions extends Omit<Intl.NumberFormatOptions, 'style' | 'currency'> {
  /**
   * The amount is given in the currency's minor unit (cents, as payment providers return it).
   * The fraction digits come from the currency: EUR 2, JPY 0, KWD 3.
   */
  minorUnits?: boolean;
}

/**
 * Formats a currency amount with `Intl.NumberFormat`.
 *
 * @example
 * ```html
 * {{ 12.99 | intlCurrency: 'EUR' }}                          <!-- €12.99 -->
 * {{ order.totalCents | intlCurrency: 'EUR' : { minorUnits: true } }}
 * {{ 1299 | intlCurrency: 'JPY' : { minorUnits: true } }}    <!-- ¥1,299 -->
 * {{ 12.99 | intlCurrency: 'EUR' : { currencyDisplay: 'code' } : 'de-DE' }} <!-- 12,99 EUR -->
 * ```
 */
@Pipe({ name: 'intlCurrency' })
export class IntlCurrencyPipe extends IntlPipeBase implements PipeTransform {
  transform(amount: number | null | undefined, currency: string | null | undefined, options: IntlCurrencyOptions = {}, locale?: string): string | null {
    if (amount == null || Number.isNaN(amount) || !currency) {
      return null;
    }
    const { minorUnits, ...formatOptions } = options;
    const format = cachedFormatter(Intl.NumberFormat, this.locale(locale), {
      ...formatOptions,
      style: 'currency',
      currency,
    });
    if (!minorUnits) {
      return format.format(amount);
    }
    // The currency's own digits, not the caller's maximumFractionDigits.
    const digits = cachedFormatter(Intl.NumberFormat, 'en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
    return format.format(amount / 10 ** (digits ?? 2));
  }
}
