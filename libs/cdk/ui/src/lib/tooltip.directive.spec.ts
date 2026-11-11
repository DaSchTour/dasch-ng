import { ChangeDetectionStrategy, Component, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TooltipPosition } from './tooltip.directive';
import { TooltipDirective } from './tooltip.directive';

@Component({
  imports: [TooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      id="host"
      style="position: fixed; top: 0; left: 200px"
      [daschUiTooltip]="content()"
      [daschUiTooltipPosition]="position()"
      [daschUiTooltipShowDelay]="showDelay()"
      [daschUiTooltipHideDelay]="hideDelay()"
      [daschUiTooltipDisabled]="disabled()"
      aria-describedby="existing"
    >
      Host
    </button>
    <ng-template #tpl><b class="rich">Rich</b> content</ng-template>
  `,
})
class HostComponent {
  readonly content = signal<string | TemplateRef<unknown> | null>('Hello');
  readonly position = signal<TooltipPosition | TooltipPosition[]>(['top', 'bottom']);
  readonly showDelay = signal(300);
  readonly hideDelay = signal(0);
  readonly disabled = signal(false);
  readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HTMLButtonElement;
  const tooltip = () => document.querySelector<HTMLElement>('[role="tooltip"]');
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.nativeElement.querySelector('#host');
    await settle();
  });

  afterEach(() => vi.useRealTimers());

  it('shows after the delay on hover and hides on mouse leave', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    host.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(299);
    expect(tooltip()).toBeNull();
    vi.advanceTimersByTime(1);
    await settle();

    expect(tooltip()?.textContent?.trim()).toBe('Hello');
    host.dispatchEvent(new MouseEvent('mouseleave'));
    expect(tooltip()).toBeNull();
  });

  it('does not show when the pointer leaves before the delay is over', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    host.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(100);
    host.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1000);
    expect(tooltip()).toBeNull();
  });

  it('waits for the hide delay and keeps the tooltip when the pointer comes back', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    fixture.componentInstance.showDelay.set(0);
    fixture.componentInstance.hideDelay.set(200);
    await settle();

    host.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip()).not.toBeNull();
    host.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(100);
    expect(tooltip()).not.toBeNull();
    host.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(500);
    expect(tooltip()).not.toBeNull();
    host.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(200);
    expect(tooltip()).toBeNull();
  });

  it('links host and tooltip with aria-describedby and restores the old value on hide', async () => {
    fixture.componentInstance.showDelay.set(0);
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));

    const el = tooltip()!;
    expect(el.id).toMatch(/^dasch-ui-tooltip-\d+$/);
    expect(host.getAttribute('aria-describedby')).toBe(`existing ${el.id}`);
    host.dispatchEvent(new MouseEvent('mouseleave'));
    expect(host.getAttribute('aria-describedby')).toBe('existing');
  });

  it('shows on keyboard focus, hides on blur, but ignores focus caused by a mouse click', async () => {
    fixture.componentInstance.showDelay.set(0);
    await settle();

    document.dispatchEvent(new MouseEvent('mousedown', { buttons: 1, detail: 1 }));
    host.focus();
    expect(tooltip()).toBeNull();
    host.blur();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    host.focus();
    expect(tooltip()?.textContent?.trim()).toBe('Hello');
    host.blur();
    expect(tooltip()).toBeNull();
  });

  it('hides on Escape, but not on other keys', async () => {
    fixture.componentInstance.showDelay.set(0);
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(tooltip()).not.toBeNull();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(tooltip()).toBeNull();
  });

  it('hides when any ancestor scrolls', async () => {
    fixture.componentInstance.showDelay.set(0);
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip()).not.toBeNull();

    // scroll events do not bubble, so this also covers scroll containers inside the page
    fixture.nativeElement.dispatchEvent(new Event('scroll'));
    expect(tooltip()).toBeNull();
  });

  it('renders a template', async () => {
    fixture.componentInstance.showDelay.set(0);
    fixture.componentInstance.content.set(fixture.componentInstance.tpl());
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));
    await settle();

    expect(tooltip()?.querySelector('.rich')?.textContent).toBe('Rich');
  });

  it('updates the text while it is shown', async () => {
    fixture.componentInstance.showDelay.set(0);
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.componentInstance.content.set('Changed');
    await settle();

    expect(tooltip()?.textContent?.trim()).toBe('Changed');
  });

  it('shows nothing for empty content and hides when the content becomes empty', async () => {
    fixture.componentInstance.showDelay.set(0);
    fixture.componentInstance.content.set('');
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip()).toBeNull();

    fixture.componentInstance.content.set('Back');
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip()).not.toBeNull();
    fixture.componentInstance.content.set(null);
    await settle();
    expect(tooltip()).toBeNull();
    expect(host.getAttribute('aria-describedby')).toBe('existing');
  });

  it('can be disabled', async () => {
    fixture.componentInstance.showDelay.set(0);
    fixture.componentInstance.disabled.set(true);
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip()).toBeNull();
  });

  it('falls back to the next position when the preferred one does not fit', async () => {
    fixture.componentInstance.showDelay.set(0);
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // the host sits at the top edge of the viewport: `top` does not fit, so `bottom` is used
    expect(tooltip()!.getBoundingClientRect().top).toBeGreaterThanOrEqual(host.getBoundingClientRect().bottom);
  });

  it('uses the preferred position when it fits', async () => {
    fixture.componentInstance.showDelay.set(0);
    fixture.componentInstance.position.set('end');
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(tooltip()!.getBoundingClientRect().left).toBeGreaterThanOrEqual(host.getBoundingClientRect().right);
  });

  it('cleans up when the host is destroyed', async () => {
    fixture.componentInstance.showDelay.set(0);
    await settle();
    host.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.destroy();
    expect(tooltip()).toBeNull();
  });
});
