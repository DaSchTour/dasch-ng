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

Over 25 standalone pipes for common operations:

- **Array Manipulation**: `reverse`, `join`, `nth`, `sortBy`
- **Collection Utilities**: `size`, `includes`, `includedIn`, `without`, `values`
- **Object Utilities**: `prop`, `omit`, `parseJson`
- **Type Checking**: `isNil`, `isNull`, `isUndefined`, `isEmpty`
- **Formatting**: `decimalBytes`, `binaryBytes`
- **Text**: `truncateText`, `middleTruncate`, `highlight`, `upperFirst`
- **Symbol Utilities**: `symbolKeyFor`

[→ View all pipes documentation](/libraries/ng-utils/pipes)

### Intl Pipes

`@dasch-ng/utils/intl` adds pipes on top of the browser's `Intl` APIs, without `registerLocaleData()`: `intlNumber`, `intlCurrency` (also for amounts in cents), `intlDate`, `intlDateRange`, `intlRelativeTime`, `intlList`, `intlPlural`, `intlDisplayName`, `intlDuration`, `intlBytes` (file sizes with localized units), `intlLocalized` and `intlCanonicalLocale`.

[→ View Intl pipes documentation](/libraries/ng-utils/intl)

### Media Pipes

`@dasch-ng/utils/media` formats technical media metadata: `frameRate` (`30000/1001` → `29.97 fps`), `shutterSpeed` (`0.004` → `1/250 s`), `coordinate` (degrees, minutes, seconds with N/S/E/W) `aspectRatio` (`16x9` → `16:9`), `codecName` (`hevc` → `H.265 (HEVC)`) and `pixelFormat` (`yuv422p10le` → `4:2:2, 10 bit`).

[→ View media pipes documentation](/libraries/ng-utils/media)

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

### Event Modifiers

`provideEventModifiers()` adds Vue-style modifiers to template event bindings:

| Modifier   | Effect                                                            |
| ---------- | ----------------------------------------------------------------- |
| `.prevent` | Calls `event.preventDefault()`                                    |
| `.stop`    | Calls `event.stopPropagation()`                                   |
| `.self`    | Runs the handler only when the event target is the element itself |

Modifiers combine and work with key filters:

```typescript
// app.config.ts
import { provideEventModifiers } from '@dasch-ng/utils';

export const appConfig: ApplicationConfig = {
  providers: [provideEventModifiers()],
};
```

```html
<a routerLink="/assets/1">
  Asset
  <button (click.stop.prevent)="addToAlbum()">Add</button>
</a>

<div class="backdrop" (click.self)="close()">…</div>

<input (keydown.enter.prevent)="submit()" />
```

**When to use:** action buttons inside clickable cards or links, backdrops that close on outside clicks, and forms where Enter should not submit. It replaces `$event.stopPropagation()` calls in templates and handlers.

### Overflow Detection

`OverflowDirective` (`[daschNgOverflow]`) tracks whether an element's content is cut off, horizontally (`text-overflow: ellipsis`) or vertically (`line-clamp`, fixed height). It re-checks on resize and text changes, exposes `overflowing()` and `(overflowChange)`, and sets `data-overflowing` on the host. It runs only in the browser, after the first render.

```html
<!-- tooltip only when the name is truncated -->
<span class="ellipsis" daschNgOverflow #name="daschNgOverflow" [title]="name.overflowing() ? file.name : ''"> {{ file.name }} </span>

<!-- "more" toggle for clamped text -->
<p class="clamp-3" daschNgOverflow (overflowChange)="showMore.set($event)">{{ description }}</p>
```

```css
[data-overflowing] {
  mask-image: linear-gradient(to bottom, black 70%, transparent);
}
```

Call `check()` to measure again after changes the observers cannot see, e.g. a web font that finished loading.

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
