import { Pipe, PipeTransform } from '@angular/core';
import { IntlPipeBase } from './formatter-cache';

export interface IntlLocalizedOptions {
  /** Locales to try after the active one, in order. Default `['en']`. */
  fallback?: readonly string[];
  /** Locale to resolve for instead of `LOCALE_ID`. */
  locale?: string;
}

/**
 * Picks the value for the active locale from a `{ [locale]: value }` map, as CMS entries
 * or API labels often carry them. Tries, in order: the exact locale (`de-AT`), its
 * language (`de`), any key with the same language (`de-DE`), the fallback locales
 * (default `en`), then the first non-empty value. Returns `null` when nothing is set.
 * Keys are compared case-insensitively.
 *
 * @example
 * ```html
 * {{ product.title | intlLocalized }}
 * {{ label | intlLocalized: { fallback: ['de', 'en'] } }}
 * ```
 */
@Pipe({ name: 'intlLocalized' })
export class IntlLocalizedPipe extends IntlPipeBase implements PipeTransform {
  transform<T>(values: Readonly<Record<string, T>> | null | undefined, options: IntlLocalizedOptions = {}): T | null {
    if (!values) {
      return null;
    }
    const entries = Object.entries(values).filter(([, value]) => value != null && value !== '');
    const find = (predicate: (key: string) => boolean) => entries.find(([key]) => predicate(key.toLowerCase()))?.[1];
    const language = (tag: string) => tag.toLowerCase().split(/[-_]/)[0];

    for (const tag of [this.locale(options.locale), ...(options.fallback ?? ['en'])]) {
      const lower = tag.toLowerCase();
      const value = find((key) => key === lower) ?? find((key) => key === language(tag)) ?? find((key) => language(key) === language(tag));
      if (value !== undefined) {
        return value;
      }
    }
    return entries[0]?.[1] ?? null;
  }
}

/**
 * Normalizes a BCP 47 language tag with `Intl.getCanonicalLocales`: `de-de` → `de-DE`,
 * `zh-hant-tw` → `zh-Hant-TW`. Invalid tags return the input unchanged.
 *
 * @example
 * ```html
 * <span [lang]="asset.language | intlCanonicalLocale">{{ asset.title }}</span>
 * ```
 */
@Pipe({ name: 'intlCanonicalLocale' })
export class IntlCanonicalLocalePipe implements PipeTransform {
  transform(tag: string | null | undefined): string {
    if (!tag) {
      return '';
    }
    try {
      return Intl.getCanonicalLocales(tag.replace(/_/g, '-'))[0] ?? tag;
    } catch {
      return tag;
    }
  }
}
