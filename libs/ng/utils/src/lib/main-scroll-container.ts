import { DOCUMENT, ViewportScroller } from '@angular/common';
import { DestroyRef, Directive, ElementRef, inject, Injectable, Provider, signal } from '@angular/core';

/** Holds the element registered with {@link MainScrollContainerDirective}. */
@Injectable({ providedIn: 'root' })
export class MainScrollContainer {
  /** The registered element, `null` while there is none. */
  readonly element = signal<HTMLElement | null>(null);
}

/**
 * Registers its element as the main scroll area, so {@link provideMainViewportScroller} scrolls it
 * instead of the window. Use it once, on the element with `overflow: auto`.
 *
 * @example
 * ```html
 * <main daschNgMainScrollContainer><router-outlet /></main>
 * ```
 */
@Directive({ selector: '[daschNgMainScrollContainer]' })
export class MainScrollContainerDirective {
  constructor() {
    const registry = inject(MainScrollContainer);
    const element: HTMLElement = inject(ElementRef).nativeElement;
    registry.element.set(element);
    inject(DestroyRef).onDestroy(() => {
      if (registry.element() === element) registry.element.set(null);
    });
  }
}

@Injectable()
class MainViewportScroller extends ViewportScroller {
  private readonly container = inject(MainScrollContainer);
  private readonly document = inject(DOCUMENT);
  private offset: () => [number, number] = () => [0, 0];

  setOffset(offset: [number, number] | (() => [number, number])): void {
    this.offset = Array.isArray(offset) ? () => offset : offset;
  }

  getScrollPosition(): [number, number] {
    const el = this.container.element();
    if (el) return [el.scrollLeft, el.scrollTop];
    const win = this.document.defaultView;
    return win ? [win.scrollX, win.scrollY] : [0, 0];
  }

  scrollToPosition(position: [number, number], options?: ScrollOptions): void {
    const target = this.container.element() ?? this.document.defaultView;
    target?.scrollTo({ ...options, left: position[0], top: position[1] });
  }

  scrollToAnchor(anchor: string, options?: ScrollOptions): void {
    const container = this.container.element();
    const target =
      container?.querySelector<HTMLElement>(`#${CSS.escape(anchor)}`) ??
      this.document.getElementById(anchor) ??
      (this.document.getElementsByName(anchor)[0] as HTMLElement | undefined);
    if (!target) return;
    const [left, offsetTop] = this.offset();
    if (container?.contains(target)) {
      const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - offsetTop;
      container.scrollTo({ ...options, left, top });
    } else {
      const win = this.document.defaultView;
      win?.scrollTo({ ...options, left, top: target.getBoundingClientRect().top + win.scrollY - offsetTop });
    }
  }

  setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void {
    const history = this.document.defaultView?.history;
    if (history) history.scrollRestoration = scrollRestoration;
  }
}

/**
 * Provides a `ViewportScroller` that scrolls the element registered with
 * {@link MainScrollContainerDirective} and falls back to the window. With it,
 * `withInMemoryScrolling({ scrollPositionRestoration, anchorScrolling })` works for a scrolling inner area.
 */
export function provideMainViewportScroller(): Provider {
  return { provide: ViewportScroller, useClass: MainViewportScroller };
}
