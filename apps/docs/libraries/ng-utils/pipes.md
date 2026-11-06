# Pipes

All pipes in `@dasch-ng/utils` are standalone and can be imported directly into your components. They provide type-safe transformations for common operations.

[← Back to NG Utils overview](/libraries/ng-utils)

## Installation

```bash
npm install @dasch-ng/utils
```

or with bun:

```bash
bun add @dasch-ng/utils
```

## Overview

The library includes over 15 standalone pipes organized into the following categories:

- **Array Manipulation**: Transform and reorder arrays
- **Collection Utilities**: Work with iterables and collections
- **Object Utilities**: Extract and transform object properties
- **Type Checking**: Runtime type guards for templates
- **Formatting**: Format values for display
- **Text**: Truncate and highlight text
- **Symbol Utilities**: Work with JavaScript symbols

## Array Manipulation Pipes

### ReversePipe

Reverses the order of elements in an array.

**Usage:**

```typescript
import { ReversePipe } from '@dasch-ng/utils';

@Component({
  imports: [ReversePipe],
  template: `
    @for (item of items | reverse; track item) {
      <div>{{ item }}</div>
    }
  `
})
```

**Example:**

```typescript
items = ['a', 'b', 'c'];
// Template output: 'c', 'b', 'a'
```

### JoinPipe

Joins array elements into a string with a separator.

**Usage:**

```typescript
import { JoinPipe } from '@dasch-ng/utils';

@Component({
  imports: [JoinPipe],
  template: `
    <p>{{ tags | join:', ' }}</p>
  `
})
```

**Example:**

```typescript
tags = ['angular', 'typescript', 'nx'];
// Output: "angular, typescript, nx"
```

### NthPipe

Returns the nth element from an array (supports negative indices).

**Usage:**

```typescript
import { NthPipe } from '@dasch-ng/utils';

@Component({
  imports: [NthPipe],
  template: `
    <p>First: {{ items | nth:0 }}</p>
    <p>Last: {{ items | nth:-1 }}</p>
  `
})
```

**Example:**

```typescript
items = ['a', 'b', 'c'];
// nth:0 → 'a'
// nth:-1 → 'c'
```

### SortByPipe

Sorts an array by a specified property or function.

**Usage:**

```typescript
import { SortByPipe } from '@dasch-ng/utils';

@Component({
  imports: [SortByPipe],
  template: `
    @for (user of users | sortBy:'name'; track user.name) {
      <div>{{ user.name }}</div>
    }
  `
})
```

**Example:**

```typescript
users = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 35 },
];
// Sorted by name: Alice, Bob, Charlie
```

## Collection Utilities

### SizePipe

Returns the size/length of a collection (arrays, strings, Maps, Sets).

**Usage:**

```typescript
import { SizePipe } from '@dasch-ng/utils';

@Component({
  imports: [SizePipe],
  template: `
    <p>Items: {{ items | size }}</p>
    <p>Text length: {{ text | size }}</p>
  `
})
```

**Example:**

```typescript
items = [1, 2, 3]; // size: 3
text = 'hello'; // size: 5
mySet = new Set([1, 2, 3]); // size: 3
```

### IncludesPipe

Checks if a collection includes a value.

**Usage:**

```typescript
import { IncludesPipe } from '@dasch-ng/utils';

@Component({
  imports: [IncludesPipe],
  template: `
    @if (roles | includes:'admin') {
      <p>Admin panel</p>
    }
  `
})
```

**Example:**

```typescript
roles = ['user', 'editor', 'admin'];
// roles | includes:'admin' → true
// roles | includes:'superadmin' → false
```

### IncludedInPipe

Checks if a value is included in a collection (inverse of includes).

**Usage:**

```typescript
import { IncludedInPipe } from '@dasch-ng/utils';

@Component({
  imports: [IncludedInPipe],
  template: `
    @if (currentRole | includedIn:allowedRoles) {
      <p>Authorized</p>
    }
  `
})
```

**Example:**

```typescript
currentRole = 'admin';
allowedRoles = ['admin', 'editor'];
// 'admin' | includedIn:allowedRoles → true
```

## Object Utilities

### PropPipe

Extracts a property value from an object (supports nested paths).

**Usage:**

```typescript
import { PropPipe } from '@dasch-ng/utils';

@Component({
  imports: [PropPipe],
  template: `
    <p>{{ user | prop:'name' }}</p>
    <p>{{ user | prop:'address.city' }}</p>
  `
})
```

**Example:**

```typescript
user = {
  name: 'John',
  address: {
    city: 'Berlin',
  },
};
// user | prop:'name' → 'John'
// user | prop:'address.city' → 'Berlin'
```

## Type Checking Pipes

### IsNilPipe

Checks if a value is `null` or `undefined`.

**Usage:**

```typescript
import { IsNilPipe } from '@dasch-ng/utils';

@Component({
  imports: [IsNilPipe],
  template: `
    @if (data | isNil) {
      <div>No data available</div>
    }
  `
})
```

**Example:**

```typescript
null | isNil; // → true
undefined | isNil; // → true
0 | isNil; // → false
'' | isNil; // → false
```

### IsNullPipe

Checks if a value is strictly `null`.

**Usage:**

```typescript
import { IsNullPipe } from '@dasch-ng/utils';

@Component({
  imports: [IsNullPipe],
  template: `
    @if (value | isNull) {
      <div>Value is null</div>
    }
  `
})
```

**Example:**

```typescript
null | isNull; // → true
undefined | isNull; // → false
```

### IsUndefinedPipe

Checks if a value is strictly `undefined`.

**Usage:**

```typescript
import { IsUndefinedPipe } from '@dasch-ng/utils';

@Component({
  imports: [IsUndefinedPipe],
  template: `
    @if (value | isUndefined) {
      <div>Value is undefined</div>
    }
  `
})
```

**Example:**

```typescript
undefined | isUndefined; // → true
null | isUndefined; // → false
```

### IsEmptyPipe

Checks if a collection or value is empty.

**Usage:**

```typescript
import { IsEmptyPipe } from '@dasch-ng/utils';

@Component({
  imports: [IsEmptyPipe],
  template: `
    @if (items | isEmpty) {
      <div>No items</div>
    }
  `
})
```

**Example:**

```typescript
[] | isEmpty          // → true
'' | isEmpty          // → true
{} | isEmpty          // → true
[1, 2] | isEmpty      // → false
```

### NotPipe

Negates a boolean value.

**Usage:**

```typescript
import { NotPipe } from '@dasch-ng/utils';

@Component({
  imports: [NotPipe],
  template: `
    @if (isHidden | not) {
      <div>Content visible</div>
    }
  `
})
```

**Example:**

```typescript
true | not; // → false
false | not; // → true
```

## Formatting Pipes

### DecimalBytesPipe

Formats byte values into human-readable sizes (KB, MB, GB, etc.).

**Usage:**

```typescript
import { DecimalBytesPipe } from '@dasch-ng/utils';

@Component({
  imports: [DecimalBytesPipe],
  template: `
    <p>File size: {{ fileSize | decimalBytes }}</p>
    <p>With precision: {{ fileSize | decimalBytes:3 }}</p>
  `
})
```

**Example:**

```typescript
1024 | decimalBytes       // → "1.02 KB"
1536000 | decimalBytes    // → "1.54 MB"
1536000 | decimalBytes:3  // → "1.536 MB"
0 | decimalBytes          // → "0 B"
```

### BinaryBytesPipe

The base-1024 counterpart to `decimalBytes`, with IEC units (`KiB`, `MiB`, `GiB`, …). Use it where sizes follow memory or file-system conventions. Same behaviour for `0`, precision and invalid input as `decimalBytes`.

```typescript
1024 | binaryBytes; // → "1 KiB"
1536 | binaryBytes; // → "1.5 KiB"
1000000 | binaryBytes; // → "976.56 KiB"
10485760 | binaryBytes; // → "10 MiB"
```

### MinorUnitCurrencyPipe

Formats an amount given in the currency's minor unit, as payment providers and many APIs return it. The fraction digits come from the currency, so it is correct for EUR (2), JPY (0) and KWD (3). Uses `LOCALE_ID` or an optional locale argument; returns `null` for a missing amount or currency.

```typescript
import { MinorUnitCurrencyPipe } from '@dasch-ng/utils';

@Component({
  imports: [MinorUnitCurrencyPipe],
  template: `<p>Total: {{ order.totalCents | minorUnitCurrency: order.currency }}</p>`,
})
```

```typescript
1299 | minorUnitCurrency:'EUR'           // → "€12.99"
1299 | minorUnitCurrency:'JPY'           // → "¥1,299"
1299 | minorUnitCurrency:'EUR':'de-DE'   // → "12,99 €"
```

### DisplayNamePipe

Localized names for codes via `Intl.DisplayNames`. `type` is `'region'` (default), `'language'`, `'currency'`, `'script'`, `'calendar'` or `'dateTimeField'`. Unknown or malformed codes return the code itself.

```typescript
import { DisplayNamePipe } from '@dasch-ng/utils';

@Component({
  imports: [DisplayNamePipe],
  template: `<p>{{ address.country | displayName }}</p>`,
})
```

```typescript
'DE' | displayName                       // → "Germany" (LOCALE_ID en-US)
'de-AT' | displayName:'language'         // → "Austrian German"
'EUR' | displayName:'currency':'de'      // → "Euro"
'XY' | displayName                       // → "XY"
```

## Text Pipes

### TruncateTextPipe

Shortens text to at most `limit` characters (default 160) plus `…`, cutting at the last space before the limit. If that space is in the first half, it cuts at the limit.

```typescript
import { TruncateTextPipe } from '@dasch-ng/utils';

@Component({
  imports: [TruncateTextPipe],
  template: `<p>{{ description | truncateText: 120 }}</p>`,
})
```

```typescript
'The quick brown fox jumps' | truncateText:18  // → "The quick brown…"
'short' | truncateText:18                      // → "short"
```

### MiddleTruncatePipe

Splits a string into `{ head, tail }` so the ellipsis lands in the middle and the end stays visible, for example the take number and extension of a filename. The cut goes to a delimiter (`_`, `-`, `.`, space) within the last 16 characters, otherwise the tail is 6 characters. Graphemes (emoji, accents) are never split.

```typescript
import { MiddleTruncatePipe } from '@dasch-ng/utils';

@Component({
  imports: [MiddleTruncatePipe],
  template: `
    @let name = file.name | middleTruncate;
    <span class="name" [title]="file.name">
      <span class="head">{{ name.head }}</span><span class="tail">{{ name.tail }}</span>
    </span>
  `,
  styles: `
    .name { display: flex; min-width: 0; }
    .head { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tail { flex-shrink: 0; white-space: pre; }
  `,
})
```

```typescript
'20260901_Concert_Hamburg_Cam3_0042.mov' | middleTruncate;
// → { head: '20260901_Concert_Hamburg', tail: '_Cam3_0042.mov' }
// renders as "20260901_Conc…_Cam3_0042.mov" in a narrow column
```

### HighlightPipe

Splits text into `{ text, match }` segments for a search term (case-insensitive, matched literally). The template renders the matches, so there is no `innerHTML` and nothing to sanitize.

```typescript
import { HighlightPipe } from '@dasch-ng/utils';

@Component({
  imports: [HighlightPipe],
  template: `
    @for (part of label | highlight: query(); track $index) {
      @if (part.match) {<mark>{{ part.text }}</mark>} @else {{{ part.text }}}
    }
  `,
})
```

```typescript
'Stadium light' | highlight:'stad'
// → [{ text: 'Stad', match: true }, { text: 'ium light', match: false }]
```

## Symbol Utilities

### SymbolKeyForPipe

Returns the global symbol key for a symbol.

**Usage:**

```typescript
import { SymbolKeyForPipe } from '@dasch-ng/utils';

@Component({
  imports: [SymbolKeyForPipe],
  template: `
    <p>Symbol key: {{ mySymbol | symbolKeyFor }}</p>
  `
})
```

**Example:**

```typescript
const mySymbol = Symbol.for('app.config');
mySymbol | symbolKeyFor; // → 'app.config'
```

## Common Patterns

### Chaining Pipes

Pipes can be chained together for complex transformations:

```typescript
import { ReversePipe, JoinPipe } from '@dasch-ng/utils';

@Component({
  imports: [ReversePipe, JoinPipe],
  template: ` <p>{{ items | reverse | join: ', ' }}</p> `,
})
export class ExampleComponent {
  items = ['a', 'b', 'c'];
  // Output: "c, b, a"
}
```

### Conditional Rendering

Type checking pipes work great with `@if`:

```typescript
import { IsNilPipe, IsEmptyPipe } from '@dasch-ng/utils';

@Component({
  imports: [IsNilPipe, IsEmptyPipe],
  template: `
    @if (data | isNil) {
      <div>Loading...</div>
    }
    @if (items | isEmpty) {
      <div>No items found</div>
    }
  `
})
```

### Working with Objects

Extract and display nested properties:

```typescript
import { PropPipe } from '@dasch-ng/utils';

@Component({
  imports: [PropPipe],
  template: `
    @for (user of users; track user) {
      <div>
        <h3>{{ user | prop:'profile.name' }}</h3>
        <p>{{ user | prop:'profile.email' }}</p>
      </div>
    }
  `
})
```

## Module Support

While all pipes are provided as standalone components, a legacy `NgUtilsModule` is also available that exports all pipes:

```typescript
import { NgUtilsModule } from '@dasch-ng/utils';

@NgModule({
  imports: [NgUtilsModule],
})
export class LegacyModule {}
```

**Recommended:** Use standalone pipes directly for better tree-shaking and modern Angular patterns.

## API Reference

Complete TypeDoc API documentation: [dasch.ng/api/@dasch-ng/utils](https://dasch.ng/api/@dasch-ng/utils/README)

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/utils).
