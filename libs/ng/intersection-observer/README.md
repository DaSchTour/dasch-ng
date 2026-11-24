# @dasch-ng/intersection-observer

Angular wrapper for the IntersectionObserver API with RxJS and signals integration.

## Installation

```bash
npm install @dasch-ng/intersection-observer
```

## Features

- **Directive API**: `observeIntersection` with `rootMargin`, `threshold`, an `(intersect)` output and an `isIntersecting()` signal
- **Service API**: `IntersectionObserverService.observe()` returns an Observable of entries
- **Re-check**: report the current state again, for infinite-scroll sentinels that stay visible
- **Server-safe**: no observer is created on the server
- **Automatic cleanup**: the observer is disconnected on unsubscribe or destroy

## Basic Usage

### Using the Directive

```typescript
import { ObserveIntersectionDirective } from '@dasch-ng/intersection-observer';

@Component({
  selector: 'app-list',
  imports: [ObserveIntersectionDirective],
  template: `
    @for (item of items(); track item) {
      <p>{{ item }}</p>
    }
    <div observeIntersection rootMargin="0px 0px 200px 0px" [recheck]="items().length" (intersect)="loadMore()"></div>
  `,
})
export class ListComponent {
  items = signal<string[]>([]);
  loadMore() {
    /* append items */
  }
}
```

### Using the Service

```typescript
import { IntersectionObserverService } from '@dasch-ng/intersection-observer';

this.intersectionObserver.observe(element, { threshold: 0.5 }).subscribe((entry) => {
  console.log(entry.isIntersecting, entry.intersectionRatio);
});
```

## API Reference

See the [full API documentation](https://dasch.ng/api/@dasch-ng/intersection-observer/) for detailed information.

## Running Tests

```bash
nx test intersection-observer
```

## License

MIT
