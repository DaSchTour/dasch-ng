import { Pipe, PipeTransform } from '@angular/core';
import { cachedFormatter, IntlPipeBase } from './formatter-cache';

/**
 * Turns a code into its localized name with `Intl.DisplayNames`: a region (`DE`), language
 * (`de-AT`), currency (`EUR`), script (`Latn`), calendar or date-time field. Region codes
 * may be lowercase. Unknown or malformed codes return the code itself.
 *
 * @example
 * ```html
 * {{ address.country | intlDisplayName }}                   <!-- Germany -->
 * {{ 'de-AT' | intlDisplayName: 'language' }}               <!-- Austrian German -->
 * {{ 'EUR' | intlDisplayName: 'currency' : 'de' }}          <!-- Euro -->
 * ```
 */
@Pipe({ name: 'intlDisplayName' })
export class IntlDisplayNamePipe extends IntlPipeBase implements PipeTransform {
  transform(code: string | null | undefined, type: Intl.DisplayNamesType = 'region', locale?: string): string {
    if (!code) {
      return '';
    }
    try {
      const names = cachedFormatter(Intl.DisplayNames, this.locale(locale), { type, fallback: 'code' });
      return names.of(type === 'region' ? code.toUpperCase() : code) ?? code;
    } catch {
      // RangeError for malformed codes such as 'D3' or '-'.
      return code;
    }
  }
}
