# Resize Observer

Angular wrapper for the native ResizeObserver API with RxJS integration, making it easy to observe element size changes reactively.

## Installation

```bash
npm install @dasch-ng/resize-observer
```

## Features

- **Angular Integration**: Seamlessly integrates ResizeObserver with Angular's lifecycle
- **Directive API**: Simple `observeResize` directive for declarative size observation
- **RxJS Integration**: Observable-based API for reactive programming patterns
- **Service API**: Injectable service for programmatic element resize observation
- **Type-safe**: Full TypeScript support with proper ResizeObserver typings
- **Automatic Cleanup**: Observers are automatically disconnected when components are destroyed
- **Performance**: Efficient observation with automatic unobserve on observable completion

## ObserveResizeDirective

Directive for observing element size changes on the host element.

**Use case:** Declaratively observe element resizes in templates without manual observer setup.

### Example

```typescript
import { Component } from '@angular/core';
import { ObserveResizeDirective } from '@dasch-ng/resize-observer';

@Component({
  selector: 'app-resizable-panel',
  imports: [ObserveResizeDirective],
  template: `
    <div class="resizable-panel" (entries)="onResize($event)">
      <p>Width: {{ width }}px</p>
      <p>Height: {{ height }}px</p>
    </div>
  `,
  styles: [
    `
      .resizable-panel {
        resize: both;
        overflow: auto;
        border: 1px solid #ccc;
        padding: 20px;
        min-width: 200px;
        min-height: 100px;
      }
    `,
  ],
})
export class ResizablePanelComponent {
  width = 0;
  height = 0;

  onResize(entry: ResizeObserverEntry) {
    const size = entry.contentBoxSize[0];
    this.width = Math.round(size.inlineSize);
    this.height = Math.round(size.blockSize);
  }
}
```

**Output:**

- `entries`: Emits when the element is resized

[View API Documentation →](../api/@dasch-ng/resize-observer/classes/ObserveResizeDirective.html)

---

## ResizeObserverService

Service for programmatic element resize observation with RxJS integration.

**Use case:** Observe element size changes programmatically with full control over observation options.

### Example

```typescript
import { Component, ElementRef, inject, viewChild, effect } from '@angular/core';
import { ResizeObserverService } from '@dasch-ng/resize-observer';

@Component({
  selector: 'app-chart-container',
  template: `
    <div #container class="chart-container">
      <canvas #canvas></canvas>
    </div>
  `,
})
export class ChartContainerComponent {
  private resizeObserver = inject(ResizeObserverService);

  containerElement = viewChild.required<ElementRef>('container');
  canvasElement = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => {
      const container = this.containerElement().nativeElement;
      const canvas = this.canvasElement().nativeElement;

      this.resizeObserver.observe(container, { box: 'border-box' }).subscribe((entry) => {
        const size = entry.borderBoxSize[0];
        canvas.width = size.inlineSize;
        canvas.height = size.blockSize;
        this.redrawChart();
      });
    });
  }

  redrawChart() {
    // Redraw chart with new dimensions
  }
}
```

**Methods:**

- `observe(element, options?)`: Start observing an element for size changes (returns Observable)
- `unobserve(element)`: Stop observing a specific element

**Parameters:**

- `element`: HTMLElement to observe
- `options`: ResizeObserverOptions configuration object

[View API Documentation →](../api/@dasch-ng/resize-observer/classes/ResizeObserverService.html)

---

## ResizeObserverOptions

Configure how the element is observed:

| Option | Type                                                          | Description                |
| ------ | ------------------------------------------------------------- | -------------------------- |
| `box`  | `'content-box' \| 'border-box' \| 'device-pixel-content-box'` | Which box model to observe |

### Box Model Types

- **content-box** (default): Size of the content area (excluding padding and border)
- **border-box**: Size including padding and border
- **device-pixel-content-box**: Size in device pixels (for high DPI displays)

### Example Configuration

```typescript
// Observe border box (includes padding and border)
this.resizeObserver.observe(element, { box: 'border-box' }).subscribe((entry) => {
  const size = entry.borderBoxSize[0];
  console.log(`Width: ${size.inlineSize}, Height: ${size.blockSize}`);
});
```

---

## ResizeObserverEntry

Each resize event provides a `ResizeObserverEntry` with the following properties:

| Property                    | Type                   | Description                                       |
| --------------------------- | ---------------------- | ------------------------------------------------- |
| `target`                    | `Element`              | The observed element                              |
| `contentRect`               | `DOMRectReadOnly`      | Content rectangle (legacy, use box sizes instead) |
| `contentBoxSize`            | `ResizeObserverSize[]` | Content box dimensions                            |
| `borderBoxSize`             | `ResizeObserverSize[]` | Border box dimensions                             |
| `devicePixelContentBoxSize` | `ResizeObserverSize[]` | Device pixel dimensions                           |

### ResizeObserverSize

| Property     | Type     | Description                |
| ------------ | -------- | -------------------------- |
| `inlineSize` | `number` | Width in the writing mode  |
| `blockSize`  | `number` | Height in the writing mode |

---

## Common Patterns

### Responsive Canvas

```typescript
import { Component, inject, viewChild, ElementRef, effect } from '@angular/core';
import { ResizeObserverService } from '@dasch-ng/resize-observer';

@Component({
  selector: 'app-responsive-canvas',
  template: `
    <div #wrapper class="canvas-wrapper">
      <canvas #canvas></canvas>
    </div>
  `,
  styles: [
    `
      .canvas-wrapper {
        width: 100%;
        height: 400px;
      }
      canvas {
        display: block;
      }
    `,
  ],
})
export class ResponsiveCanvasComponent {
  private resizeObserver = inject(ResizeObserverService);

  wrapperElement = viewChild.required<ElementRef>('wrapper');
  canvasElement = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => {
      const wrapper = this.wrapperElement().nativeElement;
      const canvas = this.canvasElement().nativeElement;
      const ctx = canvas.getContext('2d')!;

      this.resizeObserver.observe(wrapper).subscribe((entry) => {
        const size = entry.contentBoxSize[0];

        // Update canvas size
        canvas.width = size.inlineSize;
        canvas.height = size.blockSize;

        // Redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    });
  }
}
```

### Adaptive Layout

```typescript
import { Component, signal } from '@angular/core';
import { ObserveResizeDirective } from '@dasch-ng/resize-observer';

@Component({
  selector: 'app-adaptive-layout',
  imports: [ObserveResizeDirective],
  template: `
    <div class="container" (entries)="onResize($event)" [class.compact]="isCompact()">
      @if (isCompact()) {
        <div class="mobile-layout">
          <p>Mobile view</p>
        </div>
      } @else {
        <div class="desktop-layout">
          <aside>Sidebar</aside>
          <main>Main content</main>
        </div>
      }
    </div>
  `,
})
export class AdaptiveLayoutComponent {
  isCompact = signal(false);

  onResize(entry: ResizeObserverEntry) {
    const width = entry.contentBoxSize[0].inlineSize;
    this.isCompact.set(width < 768);
  }
}
```

### Dynamic Grid Columns

```typescript
import { Component, signal } from '@angular/core';
import { ObserveResizeDirective } from '@dasch-ng/resize-observer';

@Component({
  selector: 'app-dynamic-grid',
  imports: [ObserveResizeDirective],
  template: `
    <div class="grid" (entries)="onResize($event)" [style.grid-template-columns]="'repeat(' + columns() + ', 1fr)'">
      @for (item of items; track item) {
        <div class="grid-item">{{ item }}</div>
      }
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        gap: 16px;
      }
      .grid-item {
        padding: 20px;
        background: #f0f0f0;
        text-align: center;
      }
    `,
  ],
})
export class DynamicGridComponent {
  columns = signal(4);
  items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

  onResize(entry: ResizeObserverEntry) {
    const width = entry.contentBoxSize[0].inlineSize;

    if (width < 480) {
      this.columns.set(1);
    } else if (width < 768) {
      this.columns.set(2);
    } else if (width < 1024) {
      this.columns.set(3);
    } else {
      this.columns.set(4);
    }
  }
}
```

### Container Query Alternative

```typescript
import { Component, signal } from '@angular/core';
import { ObserveResizeDirective } from '@dasch-ng/resize-observer';

@Component({
  selector: 'app-card',
  imports: [ObserveResizeDirective],
  template: `
    <div class="card" (entries)="onResize($event)" [class.card-horizontal]="isWide()" [class.card-vertical]="!isWide()">
      <img [src]="imageUrl" alt="Card image" />
      <div class="card-content">
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
      }
      .card-horizontal {
        display: flex;
        flex-direction: row;
      }
      .card-vertical {
        display: flex;
        flex-direction: column;
      }
      img {
        width: 100%;
        max-width: 200px;
        object-fit: cover;
      }
      .card-content {
        padding: 16px;
      }
    `,
  ],
})
export class CardComponent {
  isWide = signal(false);

  imageUrl = 'https://via.placeholder.com/200';
  title = 'Card Title';
  description = 'This card adapts its layout based on its container width.';

  onResize(entry: ResizeObserverEntry) {
    const width = entry.contentBoxSize[0].inlineSize;
    this.isWide.set(width > 400);
  }
}
```

### Text Truncation

```typescript
import { Component, signal, viewChild, ElementRef, effect } from '@angular/core';
import { ResizeObserverService } from '@dasch-ng/resize-observer';

@Component({
  selector: 'app-truncated-text',
  template: `
    <div #container class="text-container">
      <p [class.truncated]="shouldTruncate()">
        {{ longText }}
      </p>
      @if (shouldTruncate()) {
        <button (click)="expand()">Read more</button>
      }
    </div>
  `,
  styles: [
    `
      .text-container {
        max-width: 600px;
      }
      .truncated {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
    `,
  ],
})
export class TruncatedTextComponent {
  private resizeObserver = inject(ResizeObserverService);

  containerElement = viewChild.required<ElementRef>('container');
  shouldTruncate = signal(false);

  longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...';

  constructor() {
    effect(() => {
      const container = this.containerElement().nativeElement;

      this.resizeObserver.observe(container).subscribe((entry) => {
        const width = entry.contentBoxSize[0].inlineSize;
        this.shouldTruncate.set(width < 400);
      });
    });
  }

  expand() {
    this.shouldTruncate.set(false);
  }
}
```

---

## API Reference

For complete API documentation with all parameters and return types, see the [API Reference](../api/@dasch-ng/resize-observer/).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/resize-observer).

## Contributing

Found a bug or want to contribute? Check out the [contributing guidelines](https://github.com/DaSchTour/dasch-ng/blob/main/CONTRIBUTING.md).
