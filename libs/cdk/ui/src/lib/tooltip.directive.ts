import { FocusMonitor } from '@angular/cdk/a11y';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, DestroyRef, Directive, effect, ElementRef, inject, input, TemplateRef, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TooltipContainerComponent } from './tooltip-container.component';

/** Side of the host element on which the tooltip appears. `start` and `end` follow the text direction. */
export type TooltipPosition = 'top' | 'bottom' | 'start' | 'end';

const POSITIONS: Record<TooltipPosition, ConnectedPosition> = {
  top: { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
  bottom: { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
  start: { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' },
  end: { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
};

let nextId = 0;

/**
 * Tooltip on the CDK Overlay. The content is a string or a `TemplateRef`; an empty string, `null`
 * or `undefined` means "no tooltip".
 *
 * - Shows on hover and on keyboard focus (not after a mouse click), hides on mouse leave, blur,
 *   `Escape` and scroll.
 * - The overlay has `role="tooltip"` and, while shown, the host gets `aria-describedby`
 *   (appended to an existing value).
 * - Unstyled apart from a small structural stylesheet. Style it with the CSS custom properties
 *   `--dasch-ui-tooltip-background`, `-color`, `-font-size`, `-padding`, `-radius`, `-max-width`
 *   and `-gap`.
 *
 * @example
 * ```html
 * <button daschUiTooltip="Save changes">Save</button>
 *
 * <button [daschUiTooltip]="help" [daschUiTooltipPosition]="['end', 'start']" [daschUiTooltipShowDelay]="0">?</button>
 * <ng-template #help>Press <kbd>Ctrl</kbd>+<kbd>S</kbd></ng-template>
 * ```
 */
@Directive({
  selector: '[daschUiTooltip]',
  exportAs: 'daschUiTooltip',
  host: {
    '(mouseenter)': 'scheduleShow()',
    '(mouseleave)': 'scheduleHide()',
  },
})
export class TooltipDirective {
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;
  private readonly overlay = inject(Overlay);
  private readonly focusMonitor = inject(FocusMonitor);
  private overlayRef: OverlayRef | null = null;
  private componentRef: ComponentRef<TooltipContainerComponent> | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private describedByBefore: string | null = null;
  private readonly id = `dasch-ui-tooltip-${nextId++}`;
  private readonly hideOnScroll = () => this.hide();

  /** Text or template to show. Empty or nullish values disable the tooltip. */
  readonly content = input<string | TemplateRef<unknown> | null | undefined>(undefined, { alias: 'daschUiTooltip' });
  /** Preferred sides in order. The next one is used when the tooltip does not fit. */
  readonly position = input<TooltipPosition | TooltipPosition[]>(['top', 'bottom', 'start', 'end'], { alias: 'daschUiTooltipPosition' });
  /** Delay in milliseconds before the tooltip appears. */
  readonly showDelay = input(300, { alias: 'daschUiTooltipShowDelay' });
  /** Delay in milliseconds before the tooltip disappears. */
  readonly hideDelay = input(0, { alias: 'daschUiTooltipHideDelay' });
  /** Turns the tooltip off without removing the content. */
  readonly disabled = input(false, { alias: 'daschUiTooltipDisabled' });

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.focusMonitor
      .monitor(this.element)
      .pipe(takeUntilDestroyed())
      .subscribe((origin) => (origin === 'keyboard' || origin === 'program' ? this.scheduleShow() : origin === null ? this.scheduleHide() : null));
    destroyRef.onDestroy(() => {
      this.focusMonitor.stopMonitoring(this.element);
      this.hide();
    });
    effect(() => {
      const content = this.content();
      const available = !!content && !this.disabled();
      untracked(() => (available ? this.componentRef?.setInput('content', content) : this.hide()));
    });
  }

  /** Shows the tooltip after `showDelay`. */
  scheduleShow(): void {
    this.clearTimer();
    if (this.overlayRef?.hasAttached()) return;
    const delay = this.showDelay();
    if (delay > 0) {
      this.timer = setTimeout(() => this.show(), delay);
    } else {
      this.show();
    }
  }

  /** Hides the tooltip after `hideDelay`. */
  scheduleHide(): void {
    this.clearTimer();
    const delay = this.hideDelay();
    if (delay > 0) {
      this.timer = setTimeout(() => this.hide(), delay);
    } else {
      this.hide();
    }
  }

  /** Shows the tooltip immediately, unless there is no content or the tooltip is disabled. */
  show(): void {
    this.clearTimer();
    const content = this.content();
    if (!content || this.disabled()) return;
    if (!this.overlayRef) {
      const sides = [this.position()].flat();
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(this.element)
          .withPositions(sides.map((side) => POSITIONS[side]))
          .withPush(false),
        scrollStrategy: this.overlay.scrollStrategies.noop(),
      });
      // completes when the overlay is disposed
      this.overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
          this.hide();
        }
      });
      document.addEventListener('scroll', this.hideOnScroll, { capture: true, passive: true });
      this.describedByBefore = this.element.getAttribute('aria-describedby');
      this.element.setAttribute('aria-describedby', [this.describedByBefore, this.id].filter(Boolean).join(' '));
      this.componentRef = this.overlayRef.attach(new ComponentPortal(TooltipContainerComponent));
      this.componentRef.setInput('id', this.id);
    }
    this.componentRef?.setInput('content', content);
  }

  /** Hides the tooltip immediately. */
  hide(): void {
    this.clearTimer();
    if (!this.overlayRef) return;
    document.removeEventListener('scroll', this.hideOnScroll, { capture: true });
    this.overlayRef.dispose();
    this.overlayRef = null;
    this.componentRef = null;
    if (this.describedByBefore === null) {
      this.element.removeAttribute('aria-describedby');
    } else {
      this.element.setAttribute('aria-describedby', this.describedByBefore);
    }
  }

  private clearTimer() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }
}
