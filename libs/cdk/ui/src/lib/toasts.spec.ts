import { ApplicationRef, Component, PLATFORM_ID, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { provideToasts, ToastDismissReason, ToastRef, Toasts } from './toasts';

@Component({
  template: `<ng-template #tpl let-ref><i class="custom">Custom</i><button class="close" (click)="ref.dismiss()">x</button></ng-template>`,
})
class TemplateHostComponent {
  readonly tpl = viewChild.required<TemplateRef<{ $implicit: ToastRef }>>('tpl');
}

describe('Toasts', () => {
  let toasts: Toasts;
  let app: ApplicationRef;
  const items = () => Array.from(document.querySelectorAll<HTMLElement>('.dasch-ui-toast'));
  const texts = () => items().map((el) => el.querySelector('.dasch-ui-toast-message')!.textContent!.trim());
  const render = () => app.tick();

  function setup(config?: Parameters<typeof provideToasts>[0]) {
    TestBed.configureTestingModule({ providers: config ? [provideToasts(config)] : [] });
    toasts = TestBed.inject(Toasts);
    app = TestBed.inject(ApplicationRef);
  }

  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] }));
  afterEach(() => vi.useRealTimers());

  it('shows a message with role status and removes it after the default duration', () => {
    setup();
    const reasons: ToastDismissReason[] = [];
    toasts.show({ message: 'Saved' }).afterDismissed.subscribe((reason) => reasons.push(reason));
    render();

    expect(texts()).toEqual(['Saved']);
    expect(items()[0].getAttribute('role')).toBe('status');
    expect(items()[0].dataset['type']).toBe('info');

    vi.advanceTimersByTime(4999);
    render();
    expect(items()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    render();
    expect(items()).toHaveLength(0);
    expect(reasons).toEqual(['timeout']);
    expect(document.querySelector('dasch-ui-toast-container')).toBeNull();
  });

  it('uses role alert for errors and exposes the type', () => {
    setup();
    toasts.show({ message: 'Boom', type: 'error' });
    toasts.show({ message: 'Careful', type: 'warning' });
    render();

    expect(items().map((el) => el.getAttribute('role'))).toEqual(['alert', 'status']);
    expect(items().map((el) => el.dataset['type'])).toEqual(['error', 'warning']);
  });

  it('keeps a toast with duration 0 until it is dismissed, and dismiss() is idempotent', () => {
    setup();
    const ref = toasts.show({ message: 'Stay', duration: 0 });
    const reasons: ToastDismissReason[] = [];
    ref.afterDismissed.subscribe((reason) => reasons.push(reason));
    render();
    vi.advanceTimersByTime(60_000);
    render();
    expect(items()).toHaveLength(1);

    ref.dismiss();
    ref.dismiss();
    render();
    expect(items()).toHaveLength(0);
    expect(reasons).toEqual(['dismissed']);
  });

  it('lets late subscribers see the reason', () => {
    setup();
    const ref = toasts.show({ message: 'x' });
    ref.dismiss();
    let reason: string | undefined;
    ref.afterDismissed.subscribe((r) => (reason = r));
    expect(reason).toBe('dismissed');
  });

  it('runs the action handler and dismisses with reason action', () => {
    setup();
    const handler = vi.fn();
    const ref = toasts.show({ message: 'Deleted', action: { label: 'Undo', handler } });
    let reason: string | undefined;
    ref.afterDismissed.subscribe((r) => (reason = r));
    render();

    const button = document.querySelector<HTMLButtonElement>('.dasch-ui-toast-action')!;
    expect(button.textContent?.trim()).toBe('Undo');
    button.click();
    render();
    expect(handler).toHaveBeenCalledOnce();
    expect(reason).toBe('action');
    expect(items()).toHaveLength(0);
  });

  it('shows at most maxVisible toasts and starts the timer of a waiting toast when it appears', () => {
    setup({ maxVisible: 2, duration: 1000 });
    const first = toasts.show({ message: 'one' });
    toasts.show({ message: 'two' });
    toasts.show({ message: 'three' });
    render();
    expect(texts()).toEqual(['one', 'two']);
    expect(toasts.waiting()).toBe(1);

    vi.advanceTimersByTime(600);
    first.dismiss();
    render();
    expect(texts()).toEqual(['two', 'three']);

    vi.advanceTimersByTime(399); // 'two' has 1 ms left, 'three' started 399 ms ago
    render();
    expect(texts()).toEqual(['two', 'three']);
    vi.advanceTimersByTime(1);
    render();
    expect(texts()).toEqual(['three']);
    vi.advanceTimersByTime(600);
    render();
    expect(items()).toHaveLength(0);
  });

  it('pauses the timer while hovered and continues with the remaining time', () => {
    setup({ duration: 5000 });
    toasts.show({ message: 'Hover me' });
    render();

    vi.advanceTimersByTime(3000);
    items()[0].dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(60_000);
    render();
    expect(items()).toHaveLength(1);

    items()[0].dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1999);
    render();
    expect(items()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    render();
    expect(items()).toHaveLength(0);
  });

  it('pauses while focused and stays paused while hover or focus still holds it', () => {
    setup({ duration: 1000 });
    toasts.show({ message: 'Focus me', action: { label: 'Go' } });
    render();

    const toast = items()[0];
    toast.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    toast.dispatchEvent(new MouseEvent('mouseenter'));
    toast.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(10_000);
    render();
    expect(items()).toHaveLength(1); // focus still holds it

    toast.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    vi.advanceTimersByTime(1000);
    render();
    expect(items()).toHaveLength(0);
  });

  it('renders a template with the ref as context', () => {
    setup();
    const host = TestBed.createComponent(TemplateHostComponent);
    host.detectChanges();
    toasts.show({ message: host.componentInstance.tpl(), duration: 0 });
    render();

    expect(document.querySelector('.dasch-ui-toast .custom')?.textContent).toBe('Custom');
    document.querySelector<HTMLButtonElement>('.dasch-ui-toast .close')!.click();
    render();
    expect(items()).toHaveLength(0);
  });

  it('dismissAll() removes visible and waiting toasts', () => {
    setup({ maxVisible: 1 });
    const reasons: string[] = [];
    for (const message of ['a', 'b']) toasts.show({ message }).afterDismissed.subscribe((r) => reasons.push(r));
    render();
    toasts.dismissAll();
    render();

    expect(items()).toHaveLength(0);
    expect(reasons).toEqual(['dismissed', 'dismissed']);
    expect(toasts.visible()).toEqual([]);
  });

  it('places the stack according to the configured position', () => {
    setup({ position: 'top-start' });
    toasts.show({ message: 'Corner', duration: 0 });
    render();
    const box = items()[0].getBoundingClientRect();
    expect(box.top).toBeLessThan(40);
    expect(box.left).toBeLessThan(40);

    toasts.dismissAll();
    render();
  });

  it('defaults to the bottom end and keeps other defaults when only one option is set', () => {
    setup({ duration: 100 });
    toasts.show({ message: 'a' });
    toasts.show({ message: 'b' });
    toasts.show({ message: 'c' });
    toasts.show({ message: 'd' });
    render();
    expect(items()).toHaveLength(3); // maxVisible default
    const box = items()[0].getBoundingClientRect();
    expect(box.bottom).toBeGreaterThan(window.innerHeight - 400);
    expect(box.right).toBeGreaterThan(window.innerWidth / 2);
    toasts.dismissAll();
    render();
  });

  it('does nothing on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const ref = TestBed.inject(Toasts).show({ message: 'x' });
    TestBed.inject(ApplicationRef).tick();

    expect(items()).toHaveLength(0);
    expect(() => ref.dismiss()).not.toThrow();
  });
});
