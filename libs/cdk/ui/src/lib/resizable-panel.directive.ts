import { Directionality } from '@angular/cdk/bidi';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { afterNextRender, computed, DestroyRef, Directive, ElementRef, inject, Injector, input, inputBinding, model, outputBinding } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { attachResizeHandle, directionSign, remInPx } from './resize-handle.component';

/**
 * Makes a side panel resizable with a drag handle on its inner edge. The width is a two-way
 * `model()` in `rem`.
 *
 * The width is kept between `daschUiResizablePanelMin` (rem) and `daschUiResizablePanelMaxShare`
 * (share of the viewport width, default `0.5`). The model is only written when the user resizes,
 * a smaller window does not change it. The handle is a `role="separator"` for pointer and keyboard:
 * arrow keys change the width by 1rem (5rem with Shift), `Home` and `End` jump to the limits.
 * Give it an accessible name with `daschUiResizablePanelLabel`.
 *
 * The panel gets `position: relative` if it is static. Style the handle with the CSS custom
 * properties `--dasch-ui-resize-handle-size`, `-color`, `-active-color` and `-focus-color`.
 *
 * @example
 * ```html
 * <aside [(daschUiResizablePanel)]="sidebarWidth" daschUiResizablePanelSide="start" daschUiResizablePanelLabel="Resize sidebar">
 *   ...
 * </aside>
 * ```
 */
@Directive({
  selector: '[daschUiResizablePanel]',
  exportAs: 'daschUiResizablePanel',
  host: { '[style.width.rem]': 'effectiveWidth()' },
})
export class ResizablePanelDirective {
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;
  private readonly directionality = inject(Directionality);
  private readonly viewport = (() => {
    const ruler = inject(ViewportRuler);
    return toSignal(ruler.change(100).pipe(map(() => ruler.getViewportSize().width)), { initialValue: ruler.getViewportSize().width });
  })();
  private startWidth = 0;

  /** Width in rem. Default `20`. */

  readonly width = model(20, { alias: 'daschUiResizablePanel' });
  /** Smallest width in rem. Default `8`. */
  readonly min = input(8, { alias: 'daschUiResizablePanelMin' });
  /** Largest width as share of the viewport width, between `0` and `1`. Default `0.5`. */
  readonly maxShare = input(0.5, { alias: 'daschUiResizablePanelMaxShare' });
  /** Side of the page the panel is on. The handle sits on the opposite edge of the panel. Default `start`. */
  readonly side = input<'start' | 'end'>('start', { alias: 'daschUiResizablePanelSide' });
  /** Accessible name of the handle. */
  readonly label = input<string | null>(null, { alias: 'daschUiResizablePanelLabel' });

  /** Largest width in rem for the current viewport, never below the minimum width. */
  readonly maxWidth = computed(() => Math.max(this.min(), (this.viewport() * this.maxShare()) / remInPx()));
  /** The width that is applied: `width` held between the limits. */
  readonly effectiveWidth = computed(() => this.clamp(this.width()));

  constructor() {
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (getComputedStyle(this.element).position === 'static') this.element.style.position = 'relative';
      const handle = attachResizeHandle(injector, this.element, [
        inputBinding('value', this.effectiveWidth),
        inputBinding('min', this.min),
        inputBinding('max', this.maxWidth),
        inputBinding('label', this.label),
        inputBinding('edge', () => (this.side() === 'start' ? 'end' : 'start')),
        // a panel on the start side grows when the handle moves towards the end, a panel on the end side the other way round
        inputBinding('direction', () => ((this.side() === 'start' ? 1 : -1) * directionSign(this.directionality)) as 1 | -1),
        outputBinding('dragStart', () => (this.startWidth = this.effectiveWidth())),
        outputBinding<number>('dragMove', (px) => this.width.set(this.clamp(this.startWidth + px / remInPx()))),
        outputBinding<number>('nudge', (steps) => this.width.set(this.clamp(this.effectiveWidth() + steps))),
        outputBinding<'min' | 'max'>('jump', (to) => this.width.set(to === 'min' ? this.min() : this.maxWidth())),
      ]);
      destroyRef.onDestroy(() => handle.destroy());
    });
  }

  private clamp(rem: number) {
    return Math.min(this.maxWidth(), Math.max(this.min(), rem));
  }
}
