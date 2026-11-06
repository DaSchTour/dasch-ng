import { Pipe, PipeTransform } from '@angular/core';
import { cachedFormatter, IntlPipeBase } from './formatter-cache';

/**
 * Messages per plural category (`zero`, `one`, `two`, `few`, `many`, `other`) or exact
 * value (`=0`, `=1`, …). `other` is required. `#` is replaced with the formatted count.
 */
export type IntlPluralForms = Partial<Record<Intl.LDMLPluralRule | `=${number}`, string>> & { other: string };

/**
 * Picks the message for a count with `Intl.PluralRules`, so languages with more than two
 * forms (Polish, Arabic, …) work too. Exact matches like `=0` win over categories.
 *
 * @example
 * ```html
 * {{ files.length | intlPlural: { '=0': 'No files', one: '# file', other: '# files' } }}
 * {{ count | intlPlural: { one: '# plik', few: '# pliki', many: '# plików', other: '# pliku' } : undefined : 'pl' }}
 * {{ place | intlPlural: { one: '#st', two: '#nd', few: '#rd', other: '#th' } : { type: 'ordinal' } }}
 * ```
 */
@Pipe({ name: 'intlPlural' })
export class IntlPluralPipe extends IntlPipeBase implements PipeTransform {
  transform(count: number | null | undefined, forms: IntlPluralForms, options?: Intl.PluralRulesOptions, locale?: string): string {
    if (count == null || Number.isNaN(count)) {
      return '';
    }
    const resolved = this.locale(locale);
    const category = cachedFormatter(Intl.PluralRules, resolved, options).select(count);
    const message = forms[`=${count}`] ?? forms[category] ?? forms.other;
    return message.replaceAll('#', cachedFormatter(Intl.NumberFormat, resolved).format(count));
  }
}
