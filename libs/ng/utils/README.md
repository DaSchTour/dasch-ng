# @dasch-ng/utils

A collection of useful Angular utilities including standalone pipes, dependency injection helpers, and type guards. Built with modern Angular patterns and full TypeScript support.

[![npm version](https://img.shields.io/npm/v/@dasch-ng/utils.svg)](https://www.npmjs.com/package/@dasch-ng/utils)

## Installation

```bash
npm install @dasch-ng/utils
```

or with bun:

```bash
bun add @dasch-ng/utils
```

## Features

- 🔧 **Standalone Pipes** - Ready-to-use pipes for common operations
- 🎯 **Type-Safe** - Full TypeScript support with proper type inference
- 📦 **Tree-Shakeable** - Import only what you need
- 🚀 **Modern Angular** - Built for Angular 16+ with standalone components
- 🔄 **FxTS Integration** - Leverages [@fxts/core](https://fxts.dev) for functional utilities
- 💉 **DI Helpers** - Simplified dependency injection patterns

## Quick Start

```typescript
import { Component } from '@angular/core';
import { DecimalBytesPipe, ReversePipe, IsNilPipe } from '@dasch-ng/utils';

@Component({
  selector: 'app-example',
  imports: [DecimalBytesPipe, ReversePipe, IsNilPipe],
  template: `
    <p>File size: {{ 1536000 | decimalBytes }}</p>
    <!-- Output: "1.54 MB" -->

    <div *ngFor="let item of items | reverse">
      {{ item }}
    </div>
    <!-- Displays items in reverse order -->

    <div *ngIf="data | isNil">No data available</div>
  `,
})
export class ExampleComponent {
  items = ['a', 'b', 'c'];
  data: string | null = null;
}
```

## Available Utilities

### Pipes

**Array Manipulation:**

- `reverse` - Reverse arrays without mutation
- `join` - Join array elements with separator
- `nth` - Get nth element from iterable
- `sortBy` - Sort by property (case-insensitive)

**Collection Utilities:**

- `size` - Get size of any iterable
- `includes` - Check if array includes value
- `includedIn` - Check if value is in array
- `without` - Remove values from an array
- `values` - Values of a Map, Set or object, in insertion order

**Object Utilities:**

- `prop` - Extract property from object
- `omit` - Copy an object without some keys
- `parseJson` - Parse JSON, `null` instead of an exception

**Type Checking:**

- `isNil` - Check for null or undefined
- `isNull` - Check for null
- `isUndefined` - Check for undefined
- `isEmpty` - Check if value is empty

**Formatting:**

- `decimalBytes` - Format bytes to human-readable sizes
- `binaryBytes` - Format bytes with base 1024 (KiB, MiB)

**Text:**

- `truncateText` - Shorten text at a word boundary
- `middleTruncate` - Split a string for an ellipsis in the middle
- `highlight` - Split text into matching segments for a search term
- `upperFirst` - Uppercase the first character, locale-aware

**Symbol Utilities:**

- `symbolKeyFor` - Get key for global symbol

**Intl Pipes** (`@dasch-ng/utils/intl`, no `registerLocaleData()` needed):

- `intlNumber`, `intlCurrency` (with `minorUnits` for cents), `intlDate`, `intlDateRange`, `intlRelativeTime`, `intlList`, `intlPlural`, `intlDisplayName`, `intlDuration`, `intlBytes`, `intlLocalized`, `intlCanonicalLocale`

```typescript
import { IntlCurrencyPipe, IntlRelativeTimePipe } from '@dasch-ng/utils/intl';
```

**Media Pipes** (`@dasch-ng/utils/media`):

- `frameRate`, `shutterSpeed`, `coordinate`, `aspectRatio`, `codecName`, `pixelFormat`

### Functions

**Dependency Injection Helpers:**

- `provideValue` - Create type-safe value providers
- `provideFactory` - Create type-safe factory providers
- `provideClass` - Create type-safe class providers
- `provideExisting` - Create type-safe existing providers (aliases)
- `provideType` - Create type-safe constructor providers

**Resource Utilities:**

- `resourceValueGuard` - Safe value extraction from Angular Resources

**Event Modifiers:**

- `provideEventModifiers` - `(click.stop)`, `(click.prevent)`, `(click.self)` and combinations like `(click.stop.prevent)` in templates

**Overflow Detection:**

- `OverflowDirective` (`[daschNgOverflow]`) - Tells whether text is cut off by ellipsis or line clamp, e.g. to show a tooltip only then

**Logging:**

- `Logger`, `LOG_SINK`, `provideLogger()`, `provideLoggerErrorHandler()` - Levels with a minimum level, pluggable sinks for error tracking, no console output in production unless configured

**Test IDs:**

- `TestIdDirective` (`[daschNgTestId]`), `provideTestIdContext()`, `provideTestIdConfig()` - Stable `data-test-id` attributes built from nested context, e.g. `checkout-address-submit-0`; attribute name configurable, can be switched off

## Documentation

Full documentation is available at [dasch.ng](https://dasch.ng/libraries/ng-utils)

## API Reference

TypeDoc API documentation: [dasch.ng/api/@dasch-ng/utils](https://dasch.ng/api/@dasch-ng/utils/README)

## License

MIT

## Running unit tests

Run `nx test ng-utils` to execute the unit tests.
