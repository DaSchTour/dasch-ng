import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

/**
 * Uppercases the first character with the rules of `LOCALE_ID` (or the given locale) and
 * leaves the rest unchanged. For "capitalize", combine it with `lowercase`.
 *
 * @example
 * ```html
 * {{ 'hello world' | upperFirst }}               <!-- Hello world -->
 * {{ 'HELLO' | lowercase | upperFirst }}         <!-- Hello -->
 * {{ 'istanbul' | upperFirst: 'tr' }}            <!-- İstanbul -->
 * ```
 */
@Pipe({ name: 'upperFirst' })
export class UpperFirstPipe implements PipeTransform {
  private readonly localeId = inject(LOCALE_ID);

  transform(value: string | null | undefined, locale?: string): string {
    if (!value) {
      return '';
    }
    // Code point, not code unit, so a leading surrogate pair stays intact.
    const first = String.fromCodePoint(value.codePointAt(0) ?? 0);
    return first.toLocaleUpperCase(locale ?? this.localeId) + value.slice(first.length);
  }
}
