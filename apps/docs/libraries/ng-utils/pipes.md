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
