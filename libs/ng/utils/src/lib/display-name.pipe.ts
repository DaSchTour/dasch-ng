import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

/**
 * Turns a code into its localized name with `Intl.DisplayNames`:
 * a region (`DE`), language (`de-AT`), currency (`EUR`), script (`Latn`) or calendar.
 * Unknown or invalid codes return the code itself, so the template always shows something.
 *
 * @example
 * ```html
 * {{ address.country | displayName }}            <!-- Germany -->
 * {{ 'de-AT' | displayName: 'language' }}        <!-- Austrian German -->
 * {{ 'EUR' | displayName: 'currency' : 'de' }}   <!-- Euro -->
 * ```
 */
@Pipe({ name: 'displayName' })
export class DisplayNamePipe implements PipeTransform {
  private readonly localeId = inject(LOCALE_ID);

  transform(code: string | null | undefined, type: Intl.DisplayNamesType = 'region', locale?: string): string {
    if (!code) {
      return '';
    }
    try {
      return new Intl.DisplayNames([locale ?? this.localeId], { type, fallback: 'code' }).of(type === 'region' ? code.toUpperCase() : code) ?? code;
    } catch {
      // RangeError for malformed codes such as 'D3' or '-'.
      return code;
    }
  }
}
