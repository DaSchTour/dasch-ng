import { Pipe, PipeTransform } from '@angular/core';
import { cachedFormatter, IntlPipeBase } from './formatter-cache';

/**
 * Joins strings as a localized list with `Intl.ListFormat`: `a, b, and c` or `a, b oder c`.
 *
 * @example
 * ```html
 * {{ ['Alice', 'Bob', 'Carol'] | intlList }}                          <!-- Alice, Bob, and Carol -->
 * {{ formats | intlList: { type: 'disjunction' } : 'de-DE' }}         <!-- MP4, MOV oder MXF -->
 * {{ ['3 h', '5 min'] | intlList: { type: 'unit', style: 'narrow' } }} <!-- 3 h 5 min -->
 * ```
 */
@Pipe({ name: 'intlList' })
export class IntlListPipe extends IntlPipeBase implements PipeTransform {
  transform(values: Iterable<string> | null | undefined, options?: Intl.ListFormatOptions, locale?: string): string {
    if (!values) {
      return '';
    }
    return cachedFormatter(Intl.ListFormat, this.locale(locale), options).format(values);
  }
}
