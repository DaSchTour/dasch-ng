# Intl Pipes

Pipes for numbers, currencies, dates, lists, plurals, names and localized values, built directly on the browser's `Intl` APIs. They live in the secondary entry point `@dasch-ng/utils/intl`.

## Why Intl pipes?

- **No locale data registration.** Angular's `DatePipe`, `CurrencyPipe` and `DecimalPipe` need `registerLocaleData()` for every locale. These pipes work with any locale the browser knows.
- **More than Angular ships:** date ranges, relative time, lists, plural rules, display names and durations.
- **Cached formatters.** Creating an `Intl` formatter is far slower than formatting, so each locale/options pair is created once and reused.

Every pipe uses `LOCALE_ID` and accepts an optional locale as its last argument. Missing or invalid input returns `null` (or an empty string for text pipes).

## Installation

```bash
npm install @dasch-ng/utils
```

```typescript
import { IntlCurrencyPipe, IntlDatePipe, IntlRelativeTimePipe } from '@dasch-ng/utils/intl';

@Component({
  imports: [IntlCurrencyPipe, IntlDatePipe, IntlRelativeTimePipe],
  template: `
    <p>{{ order.total | intlCurrency: order.currency }}</p>
    <p>{{ order.createdAt | intlDate: 'long' }} ({{ order.createdAt | intlRelativeTime }})</p>
  `,
})
export class OrderComponent {}
```

## Overview

| Pipe                  | API                               | Example                                              |
| --------------------- | --------------------------------- | ---------------------------------------------------- |
| `intlNumber`          | `Intl.NumberFormat`               | `1234.5` → `1,234.5`                                 |
| `intlCurrency`        | `Intl.NumberFormat`               | `12.99, 'EUR'` → `€12.99`                            |
| `intlDate`            | `Intl.DateTimeFormat`             | `date, 'long'` → `November 6, 2026`                  |
| `intlDateRange`       | `Intl.DateTimeFormat.formatRange` | `[start, end]` → `Nov 3 – 7, 2026`                   |
| `intlRelativeTime`    | `Intl.RelativeTimeFormat`         | `date` → `5 minutes ago`                             |
| `intlList`            | `Intl.ListFormat`                 | `['a', 'b', 'c']` → `a, b, and c`                    |
| `intlPlural`          | `Intl.PluralRules`                | `3, { one: '# file', other: '# files' }` → `3 files` |
| `intlDisplayName`     | `Intl.DisplayNames`               | `'DE'` → `Germany`                                   |
| `intlDuration`        | `Intl.DurationFormat`             | `134000, { style: 'digital' }` → `0:02:14`           |
| `intlLocalized`       | locale fallback                   | `{ de: "Hallo", en: "Hello" }` → `Hallo`             |
| `intlCanonicalLocale` | `Intl.getCanonicalLocales`        | `de-de` → `de-DE`                                    |

## intlNumber

`value | intlNumber : options? : locale?` with `Intl.NumberFormatOptions`.

```typescript
1234.5 | intlNumber                                          // → "1,234.5"
1234.5 | intlNumber : undefined : 'de-DE'                    // → "1.234,5"
0.256 | intlNumber : { style: 'percent' }                    // → "26%"
1500000 | intlNumber : { notation: 'compact' }               // → "1.5M"
12 | intlNumber : { style: 'unit', unit: 'kilometer-per-hour' } // → "12 km/h"
```

## intlCurrency

`amount | intlCurrency : currency : options? : locale?`. Set `minorUnits: true` when the amount is in cents or another minor unit, as payment providers return it. The fraction digits then come from the currency (EUR 2, JPY 0, KWD 3) instead of a fixed `/ 100`.

```typescript
12.99 | intlCurrency : 'EUR'                                   // → "€12.99"
1299 | intlCurrency : 'EUR' : { minorUnits: true }             // → "€12.99"
1299 | intlCurrency : 'JPY' : { minorUnits: true }             // → "¥1,299"
12.99 | intlCurrency : 'EUR' : { currencyDisplay: 'code' } : 'de-DE' // → "12,99 EUR"
```

## intlDate and intlDateRange

`value | intlDate : format? : locale?`. `format` is a `dateStyle` shorthand (`'short'`, `'medium'` (default), `'long'`, `'full'`) or `Intl.DateTimeFormatOptions` for times, time zones or single parts. Accepts `Date`, timestamps and ISO strings.

```typescript
createdAt | intlDate                                           // → "Nov 6, 2026"
createdAt | intlDate : 'long' : 'de-DE'                        // → "6. November 2026"
createdAt | intlDate : { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' } // → "11/6/26, 2:30 PM"
```

`[start, end] | intlDateRange : format? : locale?` leaves out repeated parts:

```typescript
[start, end] | intlDateRange                                   // → "Nov 3 – 7, 2026"
[start, end] | intlDateRange : 'long' : 'de-DE'                // → "3.–7. November 2026"
```

## intlRelativeTime

`value | intlRelativeTime : options? : locale?` picks the unit (seconds up to years) automatically. `numeric: 'auto'` is the default, so you get `yesterday` and `now` instead of `1 day ago`.

```typescript
comment.createdAt | intlRelativeTime                           // → "5 minutes ago"
deadline | intlRelativeTime : undefined : 'de-DE'              // → "in 3 Tagen"
date | intlRelativeTime : { numeric: 'always' }                // → "1 day ago"
```

The pipe is pure, so the text only changes when its input changes. Pass a ticking `now` to keep it current:

```typescript
export class CommentComponent {
  readonly now = toSignal(interval(60_000).pipe(map(() => Date.now())), { initialValue: Date.now() });
}
```

```html
{{ comment.createdAt | intlRelativeTime: { now: now() } }}
```

## intlList

`values | intlList : options? : locale?` with `type` `'conjunction'` (default), `'disjunction'` or `'unit'`.

```typescript
['Alice', 'Bob', 'Carol'] | intlList                           // → "Alice, Bob, and Carol"
['MP4', 'MOV', 'MXF'] | intlList : { type: 'disjunction' } : 'de-DE' // → "MP4, MOV oder MXF"
['3 h', '5 min'] | intlList : { type: 'unit', style: 'narrow' } // → "3 h 5 min"
```

## intlPlural

`count | intlPlural : forms : options? : locale?`. `forms` maps plural categories (`zero`, `one`, `two`, `few`, `many`, `other`) or exact values (`=0`, `=1`, …) to messages; `other` is required and `#` is replaced with the formatted count. Exact values win over categories. Because it uses `Intl.PluralRules`, languages with more than two forms work.

```typescript
files.length | intlPlural : { '=0': 'No files', one: '# file', other: '# files' }
// 0 → "No files", 1 → "1 file", 1234 → "1,234 files"

count | intlPlural : { one: '# plik', few: '# pliki', many: '# plików', other: '# pliku' } : undefined : 'pl'
// 3 → "3 pliki", 5 → "5 plików"

place | intlPlural : { one: '#st', two: '#nd', few: '#rd', other: '#th' } : { type: 'ordinal' }
// 22 → "22nd"
```

## intlDisplayName

`code | intlDisplayName : type? : locale?` with `type` `'region'` (default), `'language'`, `'currency'`, `'script'`, `'calendar'` or `'dateTimeField'`. Region codes may be lowercase; unknown or malformed codes return the code.

```typescript
'DE' | intlDisplayName                                         // → "Germany"
'de-AT' | intlDisplayName : 'language'                         // → "Austrian German"
'EUR' | intlDisplayName : 'currency' : 'de'                    // → "Euro"
'XY' | intlDisplayName                                         // → "XY"
```

## intlBytes

`bytes | intlBytes : options? : locale?` formats a file size with the byte units of `Intl.NumberFormat`, so number and unit follow the locale (`1.6 GB`, de `1,6 GB`, fr `1,6 Go`). Missing, invalid or negative values give an empty string. Options are `Intl.NumberFormatOptions` (without `style`/`unit`) plus `base`; `maximumFractionDigits` defaults to `1`.

- `base: 1000` (default): SI sizes as storage vendors state them.
- `base: 1024`: divides by 1024 but keeps the `kB`/`MB`/`GB` labels, as most operating systems and media tools show sizes. For IEC labels (`KiB`, `MiB`) use `binaryBytes`.

```typescript
1600000000 | intlBytes                                         // → "1.6 GB"
1717986918 | intlBytes : { base: 1024 } : 'de-DE'              // → "1,6 GB"
1536 | intlBytes : { maximumFractionDigits: 2 }                // → "1.54 kB"
1536 | intlBytes : { unitDisplay: 'long' }                     // → "1.5 kilobytes"
```

`decimalBytes` and `binaryBytes` in the main entry point keep their output (`toFixed`, `'Invalid Number'`) for compatibility.

## intlDuration

`value | intlDuration : options? : locale?`. `value` is a duration object (`{ hours, minutes, seconds, … }`) or a number of milliseconds, which is split into hours, minutes, seconds and milliseconds. `style` is `'short'` (default), `'long'`, `'narrow'` or `'digital'`.

```typescript
{ hours: 1, minutes: 5 } | intlDuration                        // → "1 hr, 5 min"
134000 | intlDuration : { style: 'digital' }                   // → "0:02:14"
90000 | intlDuration : { style: 'long' } : 'de-DE'             // → "1 Minute, 30 Sekunden"
```

::: warning Browser support
`Intl.DurationFormat` needs Chrome 129, Safari 16.4 or Firefox 136 or later. Older browsers get an unlocalized fallback (`1 hours 5 minutes`). The option types come from TypeScript's `es2025.intl` lib; projects on an older `lib` setting need `skipLibCheck` (the Angular default) or that lib entry.
:::

## intlLocalized

`values | intlLocalized : options?` picks the value for the active locale from a `{ [locale]: value }` map, as CMS entries or API labels carry them. Order: exact locale (`de-AT`), its language (`de`), any key with that language (`de-DE`), the `fallback` locales (default `['en']`), then the first non-empty value. Empty strings are skipped; `null` when nothing is set.

```typescript
{ de: 'Hallo', en: 'Hello' } | intlLocalized                    // LOCALE_ID de-AT → "Hallo"
{ de: 'Hallo', en: 'Hello' } | intlLocalized                    // LOCALE_ID pl → "Hello"
label | intlLocalized : { fallback: ['de', 'en'] }
label | intlLocalized : { locale: 'fr' }
```

## intlCanonicalLocale

`tag | intlCanonicalLocale` normalizes a language tag with `Intl.getCanonicalLocales`, also accepting `_` as separator. Invalid tags come back unchanged.

```typescript
'de-de' | intlCanonicalLocale; // → "de-DE"
'EN_us' | intlCanonicalLocale; // → "en-US"
'zh-hant-tw' | intlCanonicalLocale; // → "zh-Hant-TW"
```

## API Reference

TypeDoc API documentation: [dasch.ng/api/@dasch-ng/utils](https://dasch.ng/api/@dasch-ng/utils/README)
