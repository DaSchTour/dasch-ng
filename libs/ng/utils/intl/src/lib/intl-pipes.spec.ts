import { LOCALE_ID, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IntlBytesPipe } from './intl-bytes.pipe';
import { IntlCurrencyPipe } from './intl-currency.pipe';
import { IntlDatePipe, IntlDateRangePipe } from './intl-date.pipe';
import { IntlDisplayNamePipe } from './intl-display-name.pipe';
import { IntlDurationPipe, splitMilliseconds } from './intl-duration.pipe';
import { IntlListPipe } from './intl-list.pipe';
import { IntlCanonicalLocalePipe, IntlLocalizedPipe } from './intl-localized.pipe';
import { IntlNumberPipe } from './intl-number.pipe';
import { IntlPluralPipe } from './intl-plural.pipe';
import { IntlRelativeTimePipe } from './intl-relative-time.pipe';

function create<T>(pipe: Type<T>, locale = 'en-US'): T {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [pipe, { provide: LOCALE_ID, useValue: locale }] });
  return TestBed.inject(pipe);
}
// Intl uses (narrow) no-break spaces in several locales.
const n = (value: string | null) => value?.replace(/[\s\u202f]/g, ' ') ?? value;
const UTC = { timeZone: 'UTC' } as const;
const day = new Date(Date.UTC(2026, 10, 6, 14, 30));

describe('IntlNumberPipe', () => {
  it('formats with LOCALE_ID, options and a locale argument', () => {
    expect(create(IntlNumberPipe).transform(1234.5)).toBe('1,234.5');
    expect(create(IntlNumberPipe, 'de-DE').transform(1234.5)).toBe('1.234,5');
    expect(create(IntlNumberPipe).transform(0.256, { style: 'percent' })).toBe('26%');
    expect(create(IntlNumberPipe).transform(1_500_000, { notation: 'compact' }, 'en')).toBe('1.5M');
  });

  it('returns null for missing input', () => {
    expect(create(IntlNumberPipe).transform(null)).toBeNull();
    expect(create(IntlNumberPipe).transform(Number.NaN)).toBeNull();
  });
});

describe('IntlCurrencyPipe', () => {
  it('formats major units by default', () => {
    expect(create(IntlCurrencyPipe).transform(12.99, 'EUR')).toBe('€12.99');
    expect(n(create(IntlCurrencyPipe, 'de-DE').transform(12.99, 'EUR'))).toBe('12,99 €');
  });

  it('converts minor units with the digits of the currency', () => {
    const pipe = create(IntlCurrencyPipe);
    expect(pipe.transform(1299, 'EUR', { minorUnits: true })).toBe('€12.99');
    expect(pipe.transform(1299, 'JPY', { minorUnits: true })).toBe('¥1,299');
    expect(n(pipe.transform(12345, 'KWD', { minorUnits: true }))).toBe('KWD 12.345');
    expect(pipe.transform(1299, 'EUR', { minorUnits: true, maximumFractionDigits: 0 })).toBe('€13');
  });

  it('returns null for a missing amount or currency', () => {
    const pipe = create(IntlCurrencyPipe);
    expect(pipe.transform(null, 'EUR')).toBeNull();
    expect(pipe.transform(1, '')).toBeNull();
  });
});

describe('IntlDatePipe', () => {
  it('formats presets and options', () => {
    const pipe = create(IntlDatePipe);
    expect(pipe.transform(day, { dateStyle: 'medium', ...UTC })).toBe('Nov 6, 2026');
    expect(pipe.transform(day.toISOString(), { dateStyle: 'short', timeStyle: 'short', ...UTC })).toBe(n('11/6/26, 2:30 PM'));
    expect(create(IntlDatePipe, 'de-DE').transform(day.getTime(), { dateStyle: 'long', ...UTC })).toBe('6. November 2026');
    expect(pipe.transform(day, 'long')).toMatch(/2026/);
  });

  it('returns null for missing or invalid dates', () => {
    const pipe = create(IntlDatePipe);
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform('')).toBeNull();
    expect(pipe.transform('not a date')).toBeNull();
  });
});

describe('IntlDateRangePipe', () => {
  it('collapses repeated parts', () => {
    const start = new Date(Date.UTC(2026, 10, 3));
    const end = new Date(Date.UTC(2026, 10, 7));
    expect(n(create(IntlDateRangePipe).transform([start, end], { dateStyle: 'medium', ...UTC }))).toBe('Nov 3 – 7, 2026');
    expect(n(create(IntlDateRangePipe, 'de-DE').transform([start, end], { dateStyle: 'long', ...UTC }))).toBe('3.–7. November 2026');
  });

  it('returns null when a bound is missing', () => {
    expect(create(IntlDateRangePipe).transform([day, null])).toBeNull();
    expect(create(IntlDateRangePipe).transform(null)).toBeNull();
  });
});

describe('IntlRelativeTimePipe', () => {
  const now = day.getTime();
  const pipe = () => create(IntlRelativeTimePipe);

  it('chooses the unit automatically', () => {
    expect(pipe().transform(now - 30_000, { now })).toBe('30 seconds ago');
    expect(pipe().transform(now - 5 * 60_000, { now })).toBe('5 minutes ago');
    expect(pipe().transform(now + 3 * 3_600_000, { now })).toBe('in 3 hours');
    expect(pipe().transform(now - 24 * 3_600_000, { now })).toBe('yesterday');
    expect(pipe().transform(now + 14 * 24 * 3_600_000, { now })).toBe('in 2 weeks');
    expect(pipe().transform(now - 400 * 24 * 3_600_000, { now })).toBe('last year');
    expect(pipe().transform(now, { now })).toBe('now');
  });

  it('passes format options and locale', () => {
    expect(pipe().transform(now - 24 * 3_600_000, { now, numeric: 'always' })).toBe('1 day ago');
    expect(create(IntlRelativeTimePipe, 'de-DE').transform(now + 3 * 24 * 3_600_000, { now })).toBe('in 3 Tagen');
  });

  it('returns null for invalid input', () => {
    expect(pipe().transform('nope')).toBeNull();
  });
});

describe('IntlListPipe', () => {
  it('joins localized lists', () => {
    expect(create(IntlListPipe).transform(['Alice', 'Bob', 'Carol'])).toBe('Alice, Bob, and Carol');
    expect(create(IntlListPipe, 'de-DE').transform(['MP4', 'MOV', 'MXF'], { type: 'disjunction' })).toBe('MP4, MOV oder MXF');
    expect(create(IntlListPipe).transform(new Set(['a']))).toBe('a');
    expect(create(IntlListPipe).transform(null)).toBe('');
  });
});

describe('IntlPluralPipe', () => {
  const files = { '=0': 'No files', one: '# file', other: '# files' } as const;

  it('picks exact matches, then categories, and formats #', () => {
    const pipe = create(IntlPluralPipe);
    expect(pipe.transform(0, files)).toBe('No files');
    expect(pipe.transform(1, files)).toBe('1 file');
    expect(pipe.transform(1234, files)).toBe('1,234 files');
    expect(pipe.transform(null, files)).toBe('');
  });

  it('supports languages with more categories and ordinals', () => {
    const polish = { one: '# plik', few: '# pliki', many: '# plików', other: '# pliku' };
    const pipe = create(IntlPluralPipe, 'pl');
    expect(pipe.transform(1, polish)).toBe('1 plik');
    expect(pipe.transform(3, polish)).toBe('3 pliki');
    expect(pipe.transform(5, polish)).toBe('5 plików');
    const ordinal = { one: '#st', two: '#nd', few: '#rd', other: '#th' };
    expect(create(IntlPluralPipe).transform(22, ordinal, { type: 'ordinal' })).toBe('22nd');
  });
});

describe('IntlDisplayNamePipe', () => {
  it('names regions, languages and currencies', () => {
    expect(create(IntlDisplayNamePipe).transform('de')).toBe('Germany');
    expect(create(IntlDisplayNamePipe, 'de-DE').transform('DE')).toBe('Deutschland');
    expect(create(IntlDisplayNamePipe).transform('de-AT', 'language')).toBe('Austrian German');
    expect(create(IntlDisplayNamePipe).transform('EUR', 'currency', 'de')).toBe('Euro');
  });

  it('falls back to the code', () => {
    expect(create(IntlDisplayNamePipe).transform('XY')).toBe('XY');
    expect(create(IntlDisplayNamePipe).transform('D3')).toBe('D3');
    expect(create(IntlDisplayNamePipe).transform(null)).toBe('');
  });
});

describe('IntlDurationPipe', () => {
  it('formats duration objects and milliseconds', () => {
    const pipe = create(IntlDurationPipe);
    expect(pipe.transform({ hours: 1, minutes: 5 })).toBe('1 hr, 5 min');
    expect(pipe.transform(134_000, { style: 'digital' })).toBe('0:02:14');
    expect(create(IntlDurationPipe, 'de-DE').transform(90_000, { style: 'long' })).toBe('1 Minute, 30 Sekunden');
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('splits milliseconds without mixing signs', () => {
    expect(splitMilliseconds(3_723_004)).toEqual({ hours: 1, minutes: 2, seconds: 3, milliseconds: 4 });
    expect(splitMilliseconds(-61_000)).toEqual({ hours: 0, minutes: -1, seconds: -1, milliseconds: 0 });
  });
});

describe('IntlLocalizedPipe', () => {
  const titles = { de: 'Hallo', en: 'Hello', 'fr-CA': 'Bonjour' };

  it('picks the exact locale, then its language', () => {
    expect(create(IntlLocalizedPipe, 'de').transform(titles)).toBe('Hallo');
    expect(create(IntlLocalizedPipe, 'de-AT').transform(titles)).toBe('Hallo');
    expect(create(IntlLocalizedPipe, 'fr-FR').transform(titles)).toBe('Bonjour');
    expect(create(IntlLocalizedPipe, 'en').transform({ 'EN-us': 'Hi' })).toBe('Hi');
  });

  it('falls back to the fallback locales, then the first non-empty value', () => {
    expect(create(IntlLocalizedPipe, 'pl').transform(titles)).toBe('Hello');
    expect(create(IntlLocalizedPipe, 'pl').transform(titles, { fallback: ['de'] })).toBe('Hallo');
    expect(create(IntlLocalizedPipe, 'pl').transform({ it: '', es: 'Hola' })).toBe('Hola');
    expect(create(IntlLocalizedPipe, 'pl').transform(titles, { locale: 'en' })).toBe('Hello');
  });

  it('skips empty values and returns null when nothing is set', () => {
    expect(create(IntlLocalizedPipe, 'de').transform({ de: '', en: 'Hello' })).toBe('Hello');
    expect(create(IntlLocalizedPipe, 'de').transform({ de: '' })).toBeNull();
    expect(create(IntlLocalizedPipe, 'de').transform(null)).toBeNull();
  });
});

describe('IntlCanonicalLocalePipe', () => {
  const pipe = new IntlCanonicalLocalePipe();

  it('normalizes language tags', () => {
    expect(pipe.transform('de-de')).toBe('de-DE');
    expect(pipe.transform('EN_us')).toBe('en-US');
    expect(pipe.transform('zh-hant-tw')).toBe('zh-Hant-TW');
  });

  it('returns invalid tags unchanged', () => {
    expect(pipe.transform('not a tag')).toBe('not a tag');
    expect(pipe.transform(null)).toBe('');
  });
});

describe('IntlBytesPipe', () => {
  it('formats number and unit with the locale', () => {
    expect(create(IntlBytesPipe).transform(1_600_000_000)).toBe('1.6 GB');
    expect(n(create(IntlBytesPipe, 'de-DE').transform(1_600_000_000))).toBe('1,6 GB');
    expect(n(create(IntlBytesPipe).transform(1_600_000_000, {}, 'fr'))).toBe('1,6 Go');
    expect(create(IntlBytesPipe).transform(512)).toBe('512 byte');
    expect(create(IntlBytesPipe).transform(0)).toBe('0 byte');
  });

  it('divides by 1024 with base 1024 and keeps SI labels', () => {
    expect(create(IntlBytesPipe).transform(1_717_986_918, { base: 1024 })).toBe('1.6 GB');
    expect(create(IntlBytesPipe).transform(1024, { base: 1024 })).toBe('1 kB');
    expect(create(IntlBytesPipe).transform(1000, { base: 1024 })).toBe('1,000 byte');
  });

  it('passes number options and caps at petabyte', () => {
    expect(create(IntlBytesPipe).transform(1536, { maximumFractionDigits: 2 })).toBe('1.54 kB');
    expect(create(IntlBytesPipe).transform(1536, { unitDisplay: 'long' })).toBe('1.5 kilobytes');
    expect(create(IntlBytesPipe).transform(2e18)).toBe('2,000 PB');
  });

  it('returns an empty string for missing, invalid or negative input', () => {
    const pipe = create(IntlBytesPipe);
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(Number.NaN)).toBe('');
    expect(pipe.transform(-1)).toBe('');
  });
});
