import { afterNextRender, DestroyRef, Directive, ElementRef, inject, output, signal } from '@angular/core';

/**
 * Tracks whether the content of an element is cut off, horizontally (`text-overflow: ellipsis`)
 * or vertically (`line-clamp`, fixed height). Typical use: show a tooltip or a "more" toggle
 * only when the text does not fit.
 *
 * Re-checks when the element is resized or its text changes. Sets `data-overflowing` on the
 * host while content is cut off, so styles can react without a class binding. Runs only in the
 * browser, after the first render.
 *
 * @example
 * ```html
 * <span class="ellipsis" daschNgOverflow #name="daschNgOverflow" [title]="name.overflowing() ? file.name : ''">
 *   {{ file.name }}
 * </span>
 *
 * <p class="clamp-3" daschNgOverflow (overflowChange)="showMore.set($event)">{{ description }}</p>
 * ```
 */
@Directive({
  selector: '[daschNgOverflow]',
  exportAs: 'daschNgOverflow',
  host: { '[attr.data-overflowing]': 'overflowing() ? "" : null' },
})
export class OverflowDirective {
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;
  private readonly state = signal(false);
  private frame = 0;

  /** `true` while the content is larger than the element. */
  readonly overflowing = this.state.asReadonly();
  /** Emits when `overflowing` changes. */
  readonly overflowChange = output<boolean>();

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const schedule = () => {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.check());
      };
      const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
      const mutation = new MutationObserver(schedule);
      resize?.observe(this.element);
      mutation.observe(this.element, { characterData: true, childList: true, subtree: true });
      this.check();
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(this.frame);
        resize?.disconnect();
        mutation.disconnect();
      });
    });
  }

  /** Measures again, e.g. after a font has loaded. */
  check(): void {
    const { scrollWidth, clientWidth, scrollHeight, clientHeight } = this.element;
    const overflowing = scrollWidth > clientWidth || scrollHeight > clientHeight;
    if (overflowing !== this.state()) {
      this.state.set(overflowing);
      this.overflowChange.emit(overflowing);
    }
  }
}
