# @dasch-ng/resize-observer

Angular wrapper for the ResizeObserver API with RxJS integration.

## Installation

```bash
npm install @dasch-ng/resize-observer
```

## Features

- **Angular Integration**: Seamlessly integrates ResizeObserver with Angular's lifecycle
- **Directive-based API**: Easy-to-use `observeResize` directive for template-driven observation
- **RxJS Integration**: Observable-based API for reactive programming patterns
- **Service API**: Injectable service for programmatic element resize observation
- **Type-safe**: Full TypeScript support with proper typings
- **Performance**: Automatic cleanup and memory management

## Basic Usage

### Using the Directive

```typescript
import { ObserveResizeDirective } from '@dasch-ng/resize-observer';

@Component({
  selector: 'app-example',
  imports: [ObserveResizeDirective],
  template: `
    <div (observeResize)="onResize($event)">
      <!-- Resizable content -->
    </div>
  `,
})
export class ExampleComponent {
  onResize(entries: ResizeObserverEntry[]) {
    console.log('Element resized:', entries);
  }
}
```

### Using the Service

```typescript
import { ResizeObserverService } from '@dasch-ng/resize-observer';

@Component({
  selector: 'app-example',
  template: `<div #target>Content</div>`,
})
export class ExampleComponent {
  @ViewChild('target', { read: ElementRef }) target!: ElementRef;

  constructor(private resizeObserver: ResizeObserverService) {}

  ngAfterViewInit() {
    this.resizeObserver.observe(this.target.nativeElement).subscribe((entries) => {
      console.log('Size changed:', entries);
    });
  }
}
```

## API Reference

See the [full API documentation](https://dasch.ng/api/@dasch-ng/resize-observer/) for detailed information.

## Running Tests

```bash
nx test resize-observer
```

## License

MIT
