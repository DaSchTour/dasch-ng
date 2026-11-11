import { Directionality } from '@angular/cdk/bidi';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ResizableColumnDirective, ResizableColumnsDirective } from './resizable-columns';

@Component({
  imports: [ResizableColumnsDirective, ResizableColumnDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table style="table-layout: fixed; width: 100%" [(daschUiResizableColumns)]="widths" [daschUiResizableColumnsMin]="min()" #cols="daschUiResizableColumns">
      <thead>
        <tr>
          <th id="name" daschUiResizableColumn="name" daschUiResizableColumnLabel="Resize name">Name</th>
          <th id="email" daschUiResizableColumn="email" [daschUiResizableColumnMin]="6">Email</th>
          <th id="rest" daschUiResizableColumn="rest" daschUiResizableColumnFiller></th>
        </tr>
      </thead>
    </table>
    <button id="reset" (click)="cols.reset()">reset</button>
  `,
})
class TableComponent {
  readonly widths = signal<Record<string, number>>({ name: 10 });
  readonly min = signal(4);
}

describe('resizable columns', () => {
  let fixture: ComponentFixture<TableComponent>;
  const th = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
  const handle = (id: string) => th(id).querySelector<HTMLElement>('dasch-ui-resize-handle');
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const move = (x: number) => document.dispatchEvent(new PointerEvent('pointermove', { clientX: x }));
  const press = (el: HTMLElement, x = 100) => el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, button: 0, bubbles: true, cancelable: true }));
  const release = () => document.dispatchEvent(new PointerEvent('pointerup'));
  const key = (el: HTMLElement, name: string, shiftKey = false) =>
    el.dispatchEvent(new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true, cancelable: true }));

  async function create() {
    fixture = TestBed.createComponent(TableComponent);
    await settle();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await settle();
  }

  it('applies the widths in rem and adds a handle to every column but the filler', async () => {
    await create();
    expect(th('name').style.width).toBe('10rem');
    expect(th('email').style.width).toBe('');
    expect(handle('name')).not.toBeNull();
    expect(handle('email')).not.toBeNull();
    expect(handle('rest')).toBeNull();
    expect(th('rest').style.width).toBe('');
  });

  it('makes the handle an accessible separator', async () => {
    await create();
    const el = handle('name')!;
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
    expect(el.getAttribute('aria-label')).toBe('Resize name');
    expect(el.getAttribute('aria-valuenow')).toBe('10');
    expect(el.getAttribute('aria-valuemin')).toBe('4');
    expect(el.tabIndex).toBe(0);
  });

  it('resizes by dragging, writes the width back and follows the pointer in rem', async () => {
    await create();
    press(handle('name')!, 100);
    move(132); // 32px = 2rem at the default root font size
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBeCloseTo(10 + 32 / parseFloat(getComputedStyle(document.documentElement).fontSize));
    expect(th('name').style.width).toMatch(/rem$/);

    release();
    move(500);
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBeLessThan(15); // no change after pointerup
  });

  it('never goes below the minimum width, and a column can have its own minimum', async () => {
    await create();
    press(handle('name')!, 500);
    move(-5000);
    release();
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBe(4);

    press(handle('email')!, 500);
    move(-5000);
    release();
    await settle();
    expect(fixture.componentInstance.widths()['email']).toBe(6);
    expect(th('email').style.minWidth).toBe('6rem');
  });

  it('starts a column without width from its measured size', async () => {
    await create();
    const before = th('email').getBoundingClientRect().width;
    press(handle('email')!, 0);
    move(16);
    await settle();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    expect(fixture.componentInstance.widths()['email']).toBeCloseTo(Math.max(6, (before + 16) / rem), 1);
    release();
  });

  it('supports the keyboard: arrows, shift for a large step, Home for the minimum', async () => {
    await create();
    const el = handle('name')!;
    key(el, 'ArrowRight');
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBe(11);

    key(el, 'ArrowLeft');
    key(el, 'ArrowLeft');
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBe(9);

    key(el, 'ArrowRight', true);
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBe(14);

    key(el, 'Home');
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBe(4);
    expect(el.getAttribute('aria-valuenow')).toBe('4');

    key(el, 'ArrowLeft');
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBe(4);
  });

  it('ignores other keys and modified arrows', async () => {
    await create();
    const el = handle('name')!;
    expect(key(el, 'a')).toBe(true); // not prevented
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true, bubbles: true }));
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBe(10);
  });

  it('reset() goes back to the initial widths, double click resets one column', async () => {
    await create();
    key(handle('name')!, 'ArrowRight');
    key(handle('email')!, 'ArrowRight');
    await settle();
    expect(Object.keys(fixture.componentInstance.widths()).sort()).toEqual(['email', 'name']);

    handle('name')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBe(10);
    expect(fixture.componentInstance.widths()['email']).toBeDefined();

    fixture.nativeElement.querySelector('#reset').click();
    await settle();
    expect(fixture.componentInstance.widths()).toEqual({ name: 10 });
    expect(th('email').style.width).toBe('');
  });

  it('mirrors drag and arrow keys in right-to-left layouts', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: Directionality, useValue: { valueSignal: signal('rtl'), value: 'rtl' } }] });
    await create();
    expect(handle('name')!.dataset['edge']).toBe('end'); // CSS logical properties put it on the left in RTL
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

    press(handle('name')!, 300);
    move(300 - 2 * rem);
    release();
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBeCloseTo(12);

    key(handle('name')!, 'ArrowLeft');
    await settle();
    expect(fixture.componentInstance.widths()['name']).toBeCloseTo(13);
  });

  it('removes the handles with the table', async () => {
    await create();
    fixture.destroy();
    expect(document.querySelector('dasch-ui-resize-handle')).toBeNull();
  });
});
