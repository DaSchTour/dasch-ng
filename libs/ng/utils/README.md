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

**Note:** The published package name is `@dasch-ng/utils` (not `@dasch-ng/ng-utils`).

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

**Object Utilities:**

- `prop` - Extract property from object

**Type Checking:**

- `isNil` - Check for null or undefined
- `isNull` - Check for null
- `isUndefined` - Check for undefined
- `isEmpty` - Check if value is empty

**Formatting:**

- `decimalBytes` - Format bytes to human-readable sizes

**Symbol Utilities:**

- `symbolKeyFor` - Get key for global symbol

### Functions

**Dependency Injection Helpers:**

- `provideValue` - Create value providers with cleaner syntax
- `provideFactory` - Create factory providers with type safety

**Resource Utilities:**

- `resourceValueGuard` - Safe value extraction from Angular Resources

## Documentation

Full documentation is available at [dasch.ng](https://dasch.ng/libraries/ng-utils)

## API Reference

TypeDoc API documentation: [dasch.ng/api/@dasch-ng/utils](https://dasch.ng/api/@dasch-ng/utils/README)

## License

MIT

## Running unit tests

Run `nx test ng-utils` to execute the unit tests.
