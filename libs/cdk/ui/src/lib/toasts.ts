import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  Provider,
  signal,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';

/** Kind of a toast. `error` is announced assertively (`role="alert"`), all others politely (`role="status"`). */
export type ToastType = 'info' | 'success' | 'warning' | 'error';

/** Why a toast went away. */
export type ToastDismissReason = 'dismissed' | 'timeout' | 'action';

/** Corner or edge of the viewport where toasts are stacked. `start` and `end` follow the text direction. */
export type ToastPosition = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

/** Button inside a toast. Clicking it runs `handler` and dismisses the toast with reason `action`. */
export interface ToastAction {
  /** Text of the button. */
  label: string;
  /** Called when the button is clicked. */
  handler?: () => void;
}

/** Template context for custom toast content. `$implicit` is the ref of the toast. */
export interface ToastTemplateContext {
  $implicit: ToastRef;
}

/** Options for `Toasts.show()`. */
export interface ToastOptions {
  /** Text, or a template for custom content. */
  message: string | TemplateRef<ToastTemplateContext>;
  /** Default `info`. */
  type?: ToastType;
  /** Milliseconds until the toast goes away. `0` keeps it until it is dismissed. Defaults to the configured duration. */
  duration?: number;
  /** Optional button. */
  action?: ToastAction;
}

/** Handle for one toast. */
export interface ToastRef {
  /** Removes the toast (or takes it out of the queue). Does nothing if it is already gone. */
  dismiss(): void;
  /** Emits the reason once when the toast went away, then completes. Late subscribers still get it. */
  readonly afterDismissed: Observable<ToastDismissReason>;
}

/** Configuration for `provideToasts()`. */
export interface ToastsConfig {
  /** How many toasts are shown at the same time, the rest waits in a queue. Default `3`. */
  maxVisible: number;
  /** Where the stack appears. Default `bottom-end`. */
  position: ToastPosition;
  /** Default duration in milliseconds. Default `5000`. */
  duration: number;
}

/** Holds the toast defaults. */
export const TOASTS_CONFIG = new InjectionToken<ToastsConfig>('DASCH_UI_TOASTS_CONFIG', {
  providedIn: 'root',
  factory: () => ({ maxVisible: 3, position: 'bottom-end', duration: 5000 }),
});

/**
 * Changes the toast defaults. Omitted values keep their default.
 *
 * @example
 * ```ts
 * providers: [provideToasts({ position: 'top-center', maxVisible: 5, duration: 8000 })]
 * ```
 */
export function provideToasts(config: Partial<ToastsConfig>): Provider {
  return {
    provide: TOASTS_CONFIG,
    useFactory: (): ToastsConfig => ({ maxVisible: 3, position: 'bottom-end', duration: 5000, ...config }),
  };
}

/** A toast as rendered by the container. */
export interface Toast {
  readonly id: number;
  readonly type: ToastType;
  readonly role: 'status' | 'alert';
  readonly message: string | TemplateRef<ToastTemplateContext>;
  readonly action?: ToastAction;
  readonly ref: ToastRef;
}

interface ToastState extends Toast {
  duration: number;
  remaining: number;
  startedAt: number;
  timer: ReturnType<typeof setTimeout> | undefined;
  holds: Set<string>;
  dismissed: ReplaySubject<ToastDismissReason>;
}

let nextId = 0;

/**
 * Shows toasts on the CDK Overlay. Only `maxVisible` toasts are on screen, the others wait in a
 * queue and start their timer when they appear. The timer of a toast stops while it is hovered or
 * has focus. Nothing is shown on the server.
 *
 * @example
 * ```ts
 * const toasts = inject(Toasts);
 * const ref = toasts.show({ message: 'File deleted', action: { label: 'Undo', handler: () => restore() } });
 * ref.afterDismissed.subscribe((reason) => console.log(reason)); // 'action' | 'timeout' | 'dismissed'
 * ```
 */
@Injectable({ providedIn: 'root' })
export class Toasts {
  private readonly overlay = inject(Overlay);
  private readonly config = inject(TOASTS_CONFIG);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly queue = signal<ToastState[]>([]);
  private overlayRef: OverlayRef | null = null;

  /** Toasts that are on screen right now. */
  readonly visible = computed<readonly Toast[]>(() => this.queue().slice(0, this.config.maxVisible));
  /** Number of toasts that wait for a free slot. */
  readonly waiting = computed(() => Math.max(0, this.queue().length - this.config.maxVisible));

  /** Adds a toast. */
  show(options: ToastOptions): ToastRef {
    if (!this.browser) {
      return { dismiss: () => undefined, afterDismissed: EMPTY };
    }
    const dismissed = new ReplaySubject<ToastDismissReason>(1);
    const id = nextId++;
    const type = options.type ?? 'info';
    const duration = options.duration ?? this.config.duration;
    const ref: ToastRef = { dismiss: () => this.remove(id, 'dismissed'), afterDismissed: dismissed.asObservable() };
    const state: ToastState = {
      id,
      type,
      role: type === 'error' ? 'alert' : 'status',
      message: options.message,
      action: options.action,
      ref,
      duration,
      remaining: duration,
      startedAt: 0,
      timer: undefined,
      holds: new Set(),
      dismissed,
    };
    this.queue.update((queue) => [...queue, state]);
    this.sync();
    return ref;
  }

  /** Removes all toasts, including the waiting ones. */
  dismissAll(): void {
    for (const { id } of this.queue()) this.remove(id, 'dismissed');
  }

  /** @internal Stops the timer while something holds the toast (`hover` or `focus`). */
  hold(id: number, reason: string): void {
    const state = this.find(id);
    if (!state) return;
    state.holds.add(reason);
    this.stopTimer(state);
  }

  /** @internal */
  release(id: number, reason: string): void {
    const state = this.find(id);
    if (!state) return;
    state.holds.delete(reason);
    this.sync();
  }

  /** @internal */
  runAction(id: number): void {
    const state = this.find(id);
    if (!state) return;
    state.action?.handler?.();
    this.remove(id, 'action');
  }

  private find(id: number) {
    return this.queue().find((state) => state.id === id);
  }

  private remove(id: number, reason: ToastDismissReason) {
    const state = this.find(id);
    if (!state) return;
    this.stopTimer(state);
    this.queue.update((queue) => queue.filter((item) => item !== state));
    state.dismissed.next(reason);
    state.dismissed.complete();
    this.sync();
  }

  /** Starts timers of visible toasts, and creates or disposes the overlay. */
  private sync() {
    const queue = this.queue();
    if (queue.length && !this.overlayRef) {
      this.overlayRef = this.overlay.create({
        positionStrategy: this.globalPosition(),
        panelClass: 'dasch-ui-toast-panel',
        scrollStrategy: this.overlay.scrollStrategies.noop(),
      });
      this.overlayRef.attach(new ComponentPortal(ToastContainerComponent));
    } else if (!queue.length && this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    for (const state of queue.slice(0, this.config.maxVisible)) {
      if (state.duration > 0 && state.timer === undefined && state.holds.size === 0) {
        state.startedAt = Date.now();
        state.timer = setTimeout(() => this.remove(state.id, 'timeout'), state.remaining);
      }
    }
  }

  private stopTimer(state: ToastState) {
    if (state.timer === undefined) return;
    clearTimeout(state.timer);
    state.timer = undefined;
    state.remaining = Math.max(0, state.remaining - (Date.now() - state.startedAt));
  }

  private globalPosition() {
    const [vertical, horizontal] = this.config.position.split('-');
    const strategy = this.overlay.position().global();
    if (vertical === 'top') strategy.top('0');
    else strategy.bottom('0');
    if (horizontal === 'start') strategy.start('0');
    else if (horizontal === 'end') strategy.end('0');
    else strategy.centerHorizontally();
    return strategy;
  }
}

/** @internal Renders the visible toasts. Not part of the public API. */
@Component({
  selector: 'dasch-ui-toast-container',
  imports: [NgTemplateOutlet],
  template: `
    @for (toast of toasts.visible(); track toast.id) {
      <div
        class="dasch-ui-toast"
        [attr.role]="toast.role"
        [attr.data-type]="toast.type"
        (mouseenter)="toasts.hold(toast.id, 'hover')"
        (mouseleave)="toasts.release(toast.id, 'hover')"
        (focusin)="toasts.hold(toast.id, 'focus')"
        (focusout)="toasts.release(toast.id, 'focus')"
      >
        <div class="dasch-ui-toast-message">
          @if (templateOf(toast); as template) {
            <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{ $implicit: toast.ref }" />
          } @else {
            {{ toast.message }}
          }
        </div>
        @if (toast.action; as action) {
          <button type="button" class="dasch-ui-toast-action" (click)="toasts.runAction(toast.id)">{{ action.label }}</button>
        }
      </div>
    }
  `,
  styles: `
    dasch-ui-toast-container {
      display: flex;
      flex-direction: column;
      gap: var(--dasch-ui-toast-gap, 0.5rem);
      margin: var(--dasch-ui-toast-margin, 1rem);
    }
    .dasch-ui-toast-panel {
      pointer-events: none;
    }
    .dasch-ui-toast {
      --dasch-ui-toast-accent: var(--dasch-ui-toast-info-accent, #2563eb);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-sizing: border-box;
      pointer-events: auto;
      min-width: var(--dasch-ui-toast-min-width, 16rem);
      max-width: var(--dasch-ui-toast-max-width, 28rem);
      padding: var(--dasch-ui-toast-padding, 0.75rem 1rem);
      border-radius: var(--dasch-ui-toast-radius, 0.375rem);
      border-inline-start: 0.25rem solid var(--dasch-ui-toast-accent);
      background: var(--dasch-ui-toast-background, #262626);
      color: var(--dasch-ui-toast-color, #fff);
      box-shadow: var(--dasch-ui-toast-shadow, 0 0.25rem 0.75rem rgb(0 0 0 / 0.25));
    }
    .dasch-ui-toast[data-type='success'] {
      --dasch-ui-toast-accent: var(--dasch-ui-toast-success-accent, #16a34a);
    }
    .dasch-ui-toast[data-type='warning'] {
      --dasch-ui-toast-accent: var(--dasch-ui-toast-warning-accent, #d97706);
    }
    .dasch-ui-toast[data-type='error'] {
      --dasch-ui-toast-accent: var(--dasch-ui-toast-error-accent, #dc2626);
    }
    .dasch-ui-toast-message {
      flex: 1;
      overflow-wrap: anywhere;
    }
    .dasch-ui-toast-action {
      flex: none;
      font: inherit;
      color: inherit;
      background: none;
      border: 1px solid currentColor;
      border-radius: var(--dasch-ui-toast-radius, 0.375rem);
      padding: 0.125rem 0.5rem;
      cursor: pointer;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly toasts = inject(Toasts);

  protected templateOf(toast: Toast) {
    return toast.message instanceof TemplateRef ? toast.message : null;
  }
}
