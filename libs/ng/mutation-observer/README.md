# @dasch-ng/mutation-observer

Angular wrapper for the MutationObserver API with RxJS integration.

## Installation

```bash
npm install @dasch-ng/mutation-observer
```

## Features

- **Angular Integration**: Seamlessly integrates MutationObserver with Angular's lifecycle
- **Directive-based API**: Easy-to-use `observeMutation` directive for template-driven observation
- **RxJS Integration**: Observable-based API for reactive programming patterns
- **Service API**: Injectable service for programmatic DOM mutation observation
- **Type-safe**: Full TypeScript support with proper typings

## Basic Usage

### Using the Directive

```typescript
import { ObserveMutationDirective } from '@dasch-ng/mutation-observer';

@Component({
  selector: 'app-example',
  imports: [ObserveMutationDirective],
  template: `
    <div (observeMutation)="onMutation($event)" [mutationObserverOptions]="{ childList: true, subtree: true }">
      <!-- Content to observe -->
    </div>
  `,
})
export class ExampleComponent {
  onMutation(mutations: MutationRecord[]) {
    console.log('DOM mutations detected:', mutations);
  }
}
```

### Using the Service

```typescript
import { MutationObserverService } from '@dasch-ng/mutation-observer';

@Component({
  selector: 'app-example',
  template: `<div #target>Content</div>`,
})
export class ExampleComponent {
  @ViewChild('target', { read: ElementRef }) target!: ElementRef;

  constructor(private mutationObserver: MutationObserverService) {}

  ngAfterViewInit() {
    this.mutationObserver
      .observe(this.target.nativeElement, {
        childList: true,
        attributes: true,
      })
      .subscribe((mutations) => {
        console.log('Mutations:', mutations);
      });
  }
}
```

## API Reference

See the [full API documentation](https://dasch.ng/api/@dasch-ng/mutation-observer/) for detailed information.

## Running Tests

```bash
nx test mutation-observer
```

## License

MIT
