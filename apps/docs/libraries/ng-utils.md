# NG Utils

A collection of useful Angular utilities including standalone pipes, dependency injection helpers, and type guards. Built with modern Angular patterns and full TypeScript support.

## Installation

Install the package via npm:

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

## What's Included

### Pipes

Over 15 standalone pipes for common operations:

- **Array Manipulation**: `reverse`, `join`, `nth`, `sortBy`
- **Collection Utilities**: `size`, `includes`, `includedIn`
- **Object Utilities**: `prop`
- **Type Checking**: `isNil`, `isNull`, `isUndefined`, `isEmpty`
- **Formatting**: `decimalBytes`
- **Symbol Utilities**: `symbolKeyFor`

[→ View all pipes documentation](/libraries/ng-utils/pipes)

### Dependency Injection Helpers

Type-safe provider functions for Angular DI:

- `provideValue` - Create type-safe value providers
- `provideFactory` - Create type-safe factory providers
- `provideClass` - Create type-safe class providers
- `provideExisting` - Create type-safe existing providers (aliases)
- `provideType` - Create type-safe constructor providers

[→ View provider helpers documentation](/libraries/ng-utils/provide-helpers)

### Resource Utilities

- `resourceValueGuard` - Safe value extraction from Angular Resources

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

    @for (item of items | reverse; track item) {
      <div>{{ item }}</div>
    }
    <!-- Displays items in reverse order -->

    @if (data | isNil) {
      <div>No data available</div>
    }
  `,
})
export class ExampleComponent {
  items = ['a', 'b', 'c'];
  data: string | null = null;
}
```

## Peer Dependencies

This library requires:

- **Angular**: 16.x, 17.x, 18.x, 19.x, 20.x, or 21.x
- **@fxts/core**: 0.20.0 or higher

## Module Support

While all pipes are provided as standalone components, a legacy `NgUtilsModule` is also available:

```typescript
import { NgUtilsModule } from '@dasch-ng/utils';

@NgModule({
  imports: [NgUtilsModule],
})
export class LegacyModule {}
```

**Recommended:** Use standalone pipes directly for better tree-shaking and modern Angular patterns.

## API Reference

TypeDoc API documentation: [dasch.ng/api/@dasch-ng/utils](https://dasch.ng/api/@dasch-ng/utils/README)

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/utils).

## License

MIT
