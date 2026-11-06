import { inject, LOCALE_ID } from '@angular/core';

type Formatter = object;
const caches = new WeakMap<object, Map<string, Formatter>>();

/**
 * Returns a cached `Intl` formatter. Creating one is far slower than formatting, and pipes
 * run on every change detection for impure inputs, so each locale/options pair is built once.
 */
export function cachedFormatter<T extends Formatter, O>(Ctor: new (locales: string, options: O) => T, locale: string, options?: O): T {
  let cache = caches.get(Ctor);
  if (!cache) {
    cache = new Map();
    caches.set(Ctor, cache);
  }
  const key = `${locale}|${JSON.stringify(options ?? {})}`;
  let formatter = cache.get(key) as T | undefined;
  if (!formatter) {
    formatter = new Ctor(locale, options as O);
    cache.set(key, formatter);
  }
  return formatter;
}

/** Base for all Intl pipes: resolves the locale from the argument or `LOCALE_ID`. */
export abstract class IntlPipeBase {
  private readonly localeId = inject(LOCALE_ID);

  protected locale(locale?: string): string {
    return locale ?? this.localeId;
  }
}

/** Accepts the inputs Angular's DatePipe accepts and returns `null` for missing or invalid dates. */
export function toDate(value: Date | number | string | null | undefined): Date | null {
  if (value == null || value === '') {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
