import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { injectSelectionModel, provideSelectionModel, SelectAllCheckboxDirective, SelectRowCheckboxDirective } from './selection';

interface Row {
  id: number;
}

const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];

@Component({
  imports: [SelectAllCheckboxDirective, SelectRowCheckboxDirective],
  providers: [provideSelectionModel<Row>()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input type="checkbox" id="all" [daschUiSelectAll]="rows()" aria-label="all" />
    @for (row of rows(); track row.id) {
      <input type="checkbox" class="row" [daschUiSelectRow]="row" />
    }
  `,
})
class TableComponent {
  readonly rows = signal<Row[]>(rows);
  readonly selection = injectSelectionModel<Row>();
}

describe('selection', () => {
  let fixture: ComponentFixture<TableComponent>;
  const all = () => fixture.nativeElement.querySelector('#all') as HTMLInputElement;
  const boxes = () => Array.from<HTMLInputElement>(fixture.nativeElement.querySelectorAll('.row'));
  const checked = () => boxes().map((box) => box.checked);
  const click = async (box: HTMLInputElement) => {
    box.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  async function create() {
    fixture = TestBed.createComponent(TableComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('selects and deselects a row with its checkbox', async () => {
    await create();
    await click(boxes()[1]);
    expect(fixture.componentInstance.selection.selected).toEqual([rows[1]]);
    expect(checked()).toEqual([false, true, false]);

    await click(boxes()[1]);
    expect(fixture.componentInstance.selection.selected).toEqual([]);
  });

  it('reflects changes of the model made elsewhere', async () => {
    await create();
    fixture.componentInstance.selection.select(rows[0], rows[2]);
    fixture.detectChanges();
    expect(checked()).toEqual([true, false, true]);
  });

  it('shows the select-all state: empty, indeterminate, all', async () => {
    await create();
    expect([all().checked, all().indeterminate]).toEqual([false, false]);

    await click(boxes()[0]);
    expect([all().checked, all().indeterminate]).toEqual([false, true]);

    await click(boxes()[1]);
    await click(boxes()[2]);
    expect([all().checked, all().indeterminate]).toEqual([true, false]);
  });

  it('select-all selects every row, and a second click clears them', async () => {
    await create();
    await click(all());
    expect(checked()).toEqual([true, true, true]);

    await click(all());
    expect(checked()).toEqual([false, false, false]);
  });

  it('a click on an indeterminate select-all selects the rest', async () => {
    await create();
    await click(boxes()[0]);
    await click(all());
    expect(checked()).toEqual([true, true, true]);
  });

  it('select-all only touches its own rows, e.g. the current page', async () => {
    await create();
    const outside = { id: 99 };
    fixture.componentInstance.selection.select(outside);
    await click(all());
    await click(all());

    expect(fixture.componentInstance.selection.selected).toEqual([outside]);
  });

  it('is not checked for an empty row list', async () => {
    await create();
    fixture.componentInstance.rows.set([]);
    fixture.detectChanges();
    expect([all().checked, all().indeterminate]).toEqual([false, false]);
  });

  it('works with rows that are re-created, using compareWith', async () => {
    @Component({
      imports: [SelectRowCheckboxDirective],
      providers: [provideSelectionModel<Row>({ compareWith: (a, b) => a.id === b.id, initiallySelected: [{ id: 2 }] })],
      template: `<input type="checkbox" [daschUiSelectRow]="{ id: 2 }" />`,
    })
    class Fresh {}
    const fresh = TestBed.createComponent(Fresh);
    fresh.detectChanges();
    expect(fresh.nativeElement.querySelector('input').checked).toBe(true);
  });

  it('with single selection a new row replaces the old one', async () => {
    @Component({
      imports: [SelectRowCheckboxDirective],
      providers: [provideSelectionModel<Row>({ multiple: false })],
      template: `
        @for (row of rows; track row.id) {
          <input type="checkbox" class="row" [daschUiSelectRow]="row" />
        }
      `,
    })
    class Single {
      readonly rows = rows;
      readonly selection = injectSelectionModel<Row>();
    }
    const single = TestBed.createComponent(Single);
    single.detectChanges();
    const inputs = Array.from<HTMLInputElement>(single.nativeElement.querySelectorAll('.row'));
    inputs[0].click();
    single.detectChanges();
    inputs[1].click();
    single.detectChanges();

    expect(single.componentInstance.selection.selected).toEqual([rows[1]]);
    expect(inputs.map((input) => input.checked)).toEqual([false, true, false]);
  });

  it('select-all rejects a single selection model', () => {
    @Component({
      imports: [SelectAllCheckboxDirective],
      providers: [provideSelectionModel<Row>({ multiple: false })],
      template: `<input type="checkbox" [daschUiSelectAll]="[]" />`,
    })
    class Single {}
    expect(() => TestBed.createComponent(Single)).toThrow(/multiple selection/);
  });
});
