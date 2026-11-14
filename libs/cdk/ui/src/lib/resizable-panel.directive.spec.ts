import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ResizablePanelDirective } from './resizable-panel.directive';

@Component({
  imports: [ResizablePanelDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      id="panel"
      [(daschUiResizablePanel)]="width"
      [daschUiResizablePanelMin]="min()"
      [daschUiResizablePanelMaxShare]="share()"
      [daschUiResizablePanelSide]="side()"
      daschUiResizablePanelLabel="Resize panel"
    ></aside>
  `,
})
class HostComponent {
  readonly width = signal(14);
  readonly min = signal(8);
  // the browser window of the test run can be narrow
  readonly share = signal(0.9);
  readonly side = signal<'start' | 'end'>('start');
}

describe('ResizablePanelDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  const panel = () => fixture.nativeElement.querySelector('#panel') as HTMLElement;
  const handle = () => panel().querySelector<HTMLElement>('dasch-ui-resize-handle')!;
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const maxRem = () => (window.innerWidth * fixture.componentInstance.share()) / rem();
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const press = (x: number) => handle().dispatchEvent(new PointerEvent('pointerdown', { clientX: x, button: 0, bubbles: true, cancelable: true }));
  const move = (x: number) => document.dispatchEvent(new PointerEvent('pointermove', { clientX: x }));
  const release = () => document.dispatchEvent(new PointerEvent('pointerup'));
  const key = (name: string, shiftKey = false) =>
    handle().dispatchEvent(new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true, cancelable: true }));

  async function create() {
    fixture = TestBed.createComponent(HostComponent);
    await settle();
    await settle();
  }

  it('applies the width in rem and adds an accessible handle', async () => {
    await create();
    expect(panel().style.width).toBe('14rem');
    expect(handle().getAttribute('role')).toBe('separator');
    expect(handle().getAttribute('aria-label')).toBe('Resize panel');
    expect(handle().getAttribute('aria-valuenow')).toBe('14');
    expect(handle().getAttribute('aria-valuemin')).toBe('8');
    expect(Number(handle().getAttribute('aria-valuemax'))).toBeCloseTo(maxRem());
  });

  it('puts the handle on the inner edge: end for a start panel, start for an end panel', async () => {
    await create();
    expect(handle().dataset['edge']).toBe('end');
    fixture.componentInstance.side.set('end');
    await settle();
    expect(handle().dataset['edge']).toBe('start');
  });

  it('a start panel grows when the pointer moves to the right, and the model follows', async () => {
    await create();
    press(300);
    move(300 + 2 * rem());
    release();
    await settle();

    expect(fixture.componentInstance.width()).toBeCloseTo(16);
    expect(panel().style.width).toMatch(/^16(\.\d+)?rem$/);
  });

  it('an end panel grows when the pointer moves to the left', async () => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.side.set('end');
    await settle();
    await settle();

    press(300);
    move(300 - 3 * rem());
    release();
    await settle();
    expect(fixture.componentInstance.width()).toBeCloseTo(17);
  });

  it('keeps the width between the minimum and the viewport share', async () => {
    await create();
    press(300);
    move(-5000);
    release();
    await settle();
    expect(fixture.componentInstance.width()).toBe(8);

    press(300);
    move(50_000);
    release();
    await settle();
    expect(fixture.componentInstance.width()).toBeCloseTo(maxRem());
    expect(panel().getBoundingClientRect().width).toBeLessThanOrEqual(window.innerWidth * 0.9 + 1);
  });

  it('applies the limits to a width set from outside, without rewriting the model', async () => {
    await create();
    fixture.componentInstance.width.set(1);
    await settle();
    expect(panel().style.width).toBe('8rem');
    expect(fixture.componentInstance.width()).toBe(1);

    fixture.componentInstance.width.set(100_000);
    await settle();
    expect(parseFloat(panel().style.width)).toBeCloseTo(maxRem());
  });

  it('never makes the maximum smaller than the minimum', async () => {
    await create();
    fixture.componentInstance.share.set(0);
    await settle();
    expect(panel().style.width).toBe('8rem');
  });

  it('supports the keyboard: arrows, shift, Home and End', async () => {
    await create();
    key('ArrowRight');
    await settle();
    expect(fixture.componentInstance.width()).toBe(15);

    key('ArrowLeft', true);
    await settle();
    expect(fixture.componentInstance.width()).toBe(10);

    key('Home');
    await settle();
    expect(fixture.componentInstance.width()).toBe(8);

    key('End');
    await settle();
    expect(fixture.componentInstance.width()).toBeCloseTo(maxRem());
  });

  it('arrows are mirrored for a panel on the end side', async () => {
    await create();
    fixture.componentInstance.side.set('end');
    await settle();
    key('ArrowLeft');
    await settle();
    expect(fixture.componentInstance.width()).toBe(15);
  });
});
