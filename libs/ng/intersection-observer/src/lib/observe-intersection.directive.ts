import { Directive, ElementRef, effect, inject, input, output, signal } from '@angular/core';

import { IntersectionObserverService } from './intersection-observer.service';

/**
 * Reports when the host element scrolls into view.
 *
 * `intersect` emits only while the element is visible. `isIntersecting()` follows every change.
 * For infinite-scroll sentinels that stay visible after new items loaded, change the `recheck`
 * input or call `triggerRecheck()`: the current state is reported again.
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[observeIntersection]',
  exportAs: 'observeIntersection',
  standalone: true,
})
export class ObserveIntersectionDirective {
  private readonly elementRef = inject<ElementRef<Element>>(ElementRef);
  private readonly service = inject(IntersectionObserverService);
  private readonly rechecks = signal(0);
  private readonly visible = signal(false);

  /** Margin around the viewport, CSS margin syntax such as `'0px 0px 200px 0px'`. */
  public readonly rootMargin = input('0px');
  /** Visible ratio (or ratios, 0 to 1) at which the observer reports. */
  public readonly threshold = input<number | number[]>(0);
  /** Any change of this value reports the current state again. */
  public readonly recheck = input<unknown>();

  /** Emits the entry each time the element is reported as intersecting. */
  public readonly intersect = output<IntersectionObserverEntry>();

  /** Whether the element was intersecting at the last report. */
  public readonly isIntersecting = this.visible.asReadonly();

  constructor() {
    effect((onCleanup) => {
      this.recheck();
      this.rechecks();
      const subscription = this.service
        .observe(this.elementRef.nativeElement, { rootMargin: this.rootMargin(), threshold: this.threshold() })
        .subscribe((entry) => {
          this.visible.set(entry.isIntersecting);
          if (entry.isIntersecting) {
            this.intersect.emit(entry);
          }
        });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /** Reports the current state again by observing the element anew. */
  public triggerRecheck(): void {
    this.rechecks.update((n) => n + 1);
  }
}
