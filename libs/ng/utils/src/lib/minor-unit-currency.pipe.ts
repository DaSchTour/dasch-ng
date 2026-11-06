import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

/**
 * Formats an amount given in the currency's minor unit (cents for EUR, yen for JPY, fils
 * for KWD), as payment providers and many APIs return it. The number of fraction digits
 * comes from the currency itself, so `1299 EUR` is `€12.99` and `1299 JPY` is `¥1,299`.
 *
 * Returns `null` for a missing amount or currency, like Angular's `CurrencyPipe`.
 *
 * @example
 * ```html
 * {{ order.totalCents | minorUnitCurrency: order.currency }}
 * {{ 1299 | minorUnitCurrency: 'EUR' : 'de-DE' }}  <!-- 12,99 € -->
 * ```
 */
@Pipe({ name: 'minorUnitCurrency' })
export class MinorUnitCurrencyPipe implements PipeTransform {
  private readonly localeId = inject(LOCALE_ID);

  transform(amount: number | null | undefined, currency: string | null | undefined, locale?: string): string | null {
    if (amount == null || Number.isNaN(amount) || !currency) {
      return null;
    }
    const format = new Intl.NumberFormat(locale ?? this.localeId, { style: 'currency', currency });
    const digits = format.resolvedOptions().maximumFractionDigits ?? 2;
    return format.format(amount / 10 ** digits);
  }
}
