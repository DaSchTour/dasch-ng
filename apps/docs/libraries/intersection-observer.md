# Intersection Observer

Angular wrapper for the native IntersectionObserver API with RxJS and signals integration. Find out when an element scrolls into view.

## Installation

```bash
npm install @dasch-ng/intersection-observer
```

## Features

- **Directive API**: `observeIntersection` with `rootMargin`, `threshold`, `(intersect)` and `isIntersecting()`
- **Service API**: Observable of `IntersectionObserverEntry` for programmatic use
- **Re-check**: report the current state again (infinite-scroll sentinels)
- **Server-safe**: no observer is created on the server, the service completes without emitting
- **Automatic cleanup**: the observer is disconnected on unsubscribe or destroy

## ObserveIntersectionDirective

Reports when the host element is visible.

**Use case:** lazy loading, infinite scroll, "seen" tracking.

### Example

```typescript
import { Component, signal } from '@angular/core';
import { ObserveIntersectionDirective } from '@dasch-ng/intersection-observer';

@Component({
  selector: 'app-feed',
  imports: [ObserveIntersectionDirective],
  template: `
    @for (post of posts(); track post) {
      <article>{{ post }}</article>
    }
    <div #sentinel="observeIntersection" observeIntersection rootMargin="0px 0px 300px 0px" [recheck]="posts().length" (intersect)="loadMore()"></div>
    @if (sentinel.isIntersecting()) {
      <p>Loading...</p>
    }
  `,
})
export class FeedComponent {
  posts = signal<string[]>([]);

  loadMore() {
    this.posts.update((posts) => [...posts, `Post ${posts.length + 1}`]);
  }
}
```

**Inputs:**

| Input        | Type                 | Default | Description                                    |
| ------------ | -------------------- | ------- | ---------------------------------------------- |
| `rootMargin` | `string`             | `'0px'` | Margin around the viewport (CSS margin syntax) |
| `threshold`  | `number \| number[]` | `0`     | Visible ratio(s) at which the observer reports |
| `recheck`    | `unknown`            | -       | Any change reports the current state again     |

**Outputs:**

- `intersect`: emits the `IntersectionObserverEntry` each time the element is reported as intersecting

**Members:**

- `isIntersecting()`: signal, `true` while the element was intersecting at the last report
- `triggerRecheck()`: reports the current state again

### Why re-check?

The browser only reports when visibility changes. A sentinel at the end of a list that is still visible after new items loaded does not report again, so loading would stop. Changing `recheck` (for example to the item count) or calling `triggerRecheck()` makes the directive observe the element anew, and the browser reports the current state.

[View API Documentation →](../api/@dasch-ng/intersection-observer/classes/ObserveIntersectionDirective.html)

---

## IntersectionObserverService

**Use case:** observe an element programmatically.

```typescript
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IntersectionObserverService } from '@dasch-ng/intersection-observer';

@Component({
  selector: 'app-banner',
  template: `<div #banner>Banner</div>`,
})
export class BannerComponent {
  private intersectionObserver = inject(IntersectionObserverService);
  banner = viewChild.required<ElementRef<HTMLElement>>('banner');

  ngAfterViewInit() {
    this.intersectionObserver
      .observe(this.banner().nativeElement, { threshold: 0.5 })
      .pipe(takeUntilDestroyed())
      .subscribe((entry) => console.log(entry.isIntersecting));
  }
}
```

**Methods:**

- `observe(element, options?)`: emits entries while subscribed. The first entry is the initial state. Each subscription uses its own observer and disconnects it on unsubscribe. On the server it completes without emitting.

`options` is the native `IntersectionObserverInit` (`root`, `rootMargin`, `threshold`).

[View API Documentation →](../api/@dasch-ng/intersection-observer/classes/IntersectionObserverService.html)

---

## API Reference

For complete API documentation, see the [API Reference](../api/@dasch-ng/intersection-observer/).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/intersection-observer).
