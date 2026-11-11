import { Directionality } from '@angular/cdk/bidi';
import {
  ApplicationRef,
  Binding,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  createComponent,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';

/** Pixel size of 1rem in the current document. */
export function remInPx(): number {
  if (typeof getComputedStyle === 'undefined') return 16; // server
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/**
 * @internal Draggable and keyboard-operable separator, used by the resizable column and panel
 * directives. Not part of the public API.
 *
 * `direction` turns a movement to the right (positive x) into growth (`1`) or shrinking (`-1`).
 */
@Component({
  selector: 'dasch-ui-resize-handle',
  template: '',
  styles: `
    dasch-ui-resize-handle {
      position: absolute;
      top: 0;
      bottom: 0;
      z-index: 1;
      width: var(--dasch-ui-resize-handle-size, 0.5rem);
      cursor: col-resize;
      touch-action: none;
      background: var(--dasch-ui-resize-handle-color, transparent);
    }
    dasch-ui-resize-handle[data-edge='end'] {
      inset-inline-end: 0;
    }
    dasch-ui-resize-handle[data-edge='start'] {
      inset-inline-start: 0;
    }
    dasch-ui-resize-handle:hover,
    dasch-ui-resize-handle[data-dragging] {
      background: var(--dasch-ui-resize-handle-active-color, rgb(37 99 235 / 0.5));
    }
    dasch-ui-resize-handle:focus-visible {
      outline: 2px solid var(--dasch-ui-resize-handle-focus-color, currentColor);
      outline-offset: -2px;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    tabindex: '0',
    'aria-orientation': 'vertical',
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-valuemin]': 'min()',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-label]': 'label()',
    '[attr.data-edge]': 'edge()',
    '[attr.data-dragging]': 'dragging() ? "" : null',
    '(pointerdown)': 'onPointerDown($event)',
    '(keydown)': 'onKeydown($event)',
    '(dblclick)': 'restore.emit()',
  },
})
export class ResizeHandleComponent {
  /** Current size in rem, for `aria-valuenow`. */
  readonly value = input<number | null>(null);
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly label = input<string | null>(null);
  /** Edge of the host element the handle sits on. */
  readonly edge = input<'start' | 'end'>('end');
  /** `1` if moving to the right grows the element, `-1` if it shrinks it. */
  readonly direction = input<1 | -1>(1);

  /** A drag begins. The parent remembers its current size. */
  readonly dragStart = output<void>();
  /** Pointer distance in px since the drag began, positive means grow. */
  readonly dragMove = output<number>();
  /** Arrow keys: steps to grow (positive) or shrink (negative), 5 with Shift. */
  readonly nudge = output<number>();
  /** `Home` (`min`) or `End` (`max`). */
  readonly jump = output<'min' | 'max'>();
  /** Double click. */
  readonly restore = output<void>();

  protected readonly dragging = signal(false);
  private cleanup: (() => void) | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cleanup?.());
  }

  protected onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    event.preventDefault(); // no text selection while dragging
    this.cleanup?.();
    const startX = event.clientX;
    const direction = this.direction();
    const move = (e: PointerEvent) => this.dragMove.emit((e.clientX - startX) * direction);
    const end = () => {
      this.cleanup?.();
    };
    // document listeners instead of pointer capture: the drag continues outside the handle
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
    this.cleanup = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', end);
      document.removeEventListener('pointercancel', end);
      this.dragging.set(false);
      this.cleanup = null;
    };
    this.dragging.set(true);
    this.dragStart.emit();
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const steps = event.shiftKey ? 5 : 1;
    if (event.key === 'ArrowRight') this.nudge.emit(steps * this.direction());
    else if (event.key === 'ArrowLeft') this.nudge.emit(-steps * this.direction());
    else if (event.key === 'Home') this.jump.emit('min');
    else if (event.key === 'End') this.jump.emit('max');
    else return;
    event.preventDefault();
  }
}

/** @internal Adds a resize handle inside `host`. The caller destroys the returned component. */
export function attachResizeHandle(injector: Injector, host: HTMLElement, bindings: Binding[]): ComponentRef<ResizeHandleComponent> {
  const element = document.createElement('dasch-ui-resize-handle');
  host.appendChild(element);
  const ref = createComponent(ResizeHandleComponent, { hostElement: element, environmentInjector: injector.get(EnvironmentInjector), bindings });
  injector.get(ApplicationRef).attachView(ref.hostView);
  return ref;
}

/** @internal `1` for left-to-right, `-1` for right-to-left. */
export function directionSign(directionality: Directionality): 1 | -1 {
  return directionality.valueSignal() === 'rtl' ? -1 : 1;
}
