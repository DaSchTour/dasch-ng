import { SelectionModel } from '@angular/cdk/collections';
import { computed, Directive, inject, InjectionToken, input, Provider, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/** Options for `provideSelectionModel()`. */
export interface SelectionModelOptions<T> {
  /** Allow more than one selected value. Default `true`. */
  multiple?: boolean;
  /** Values that are selected from the start. */
  initiallySelected?: T[];
  /** Compares two values, for rows that are re-created as new objects. Default is `===`. */
  compareWith?: (a: T, b: T) => boolean;
}

/** Token for the CDK `SelectionModel` shared by a table and its checkboxes. */
export const SELECTION_MODEL = new InjectionToken<SelectionModel<unknown>>('DASCH_UI_SELECTION_MODEL');

/**
 * Provides a CDK `SelectionModel<T>`. Add it to the `providers` of the component that owns the
 * table, so every table gets its own selection.
 *
 * @example
 * ```ts
 * @Component({ providers: [provideSelectionModel<User>()] })
 * export class UserTable {
 *   protected readonly selection = injectSelectionModel<User>();
 * }
 * ```
 */
export function provideSelectionModel<T>(options: SelectionModelOptions<T> = {}): Provider {
  return {
    provide: SELECTION_MODEL,
    useFactory: () => new SelectionModel<T>(options.multiple ?? true, options.initiallySelected, true, options.compareWith),
  };
}

/** Injects the `SelectionModel` that `provideSelectionModel()` created. */
export function injectSelectionModel<T>(): SelectionModel<T> {
  return inject(SELECTION_MODEL) as SelectionModel<T>;
}

/**
 * Signal with the selected values of a model. Updates on every change of the model. Must be called
 * in an injection context.
 */
export function selectionSignal<T>(model: SelectionModel<T>): Signal<readonly T[]> {
  return toSignal(model.changed.pipe(map(() => model.selected)), { initialValue: model.selected });
}

/**
 * Select-all checkbox for a table header. Put it on an `<input type="checkbox">` and bind the rows
 * it controls (all rows, or the rows of the current page). It is checked when all of these rows
 * are selected, indeterminate when only some are. Needs `provideSelectionModel()` with multiple
 * selection. Give the checkbox an accessible name with `aria-label` or a `<label>`.
 *
 * @example
 * ```html
 * <input type="checkbox" [daschUiSelectAll]="users()" aria-label="Select all" />
 * ```
 */
@Directive({
  selector: 'input[type=checkbox][daschUiSelectAll]',
  exportAs: 'daschUiSelectAll',
  host: {
    '[checked]': 'all()',
    '[indeterminate]': 'some() && !all()',
    '(change)': 'toggle($event)',
  },
})
export class SelectAllCheckboxDirective<T = unknown> {
  private readonly model = injectSelectionModel<T>();
  private readonly selected = selectionSignal(this.model);

  /** The rows this checkbox controls. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- the alias is the directive selector
  readonly rows = input.required<readonly T[]>({ alias: 'daschUiSelectAll' });

  /** `true` if there are rows and all are selected. */
  readonly all = computed(() => {
    this.selected();
    const rows = this.rows();
    return rows.length > 0 && rows.every((row) => this.model.isSelected(row));
  });
  /** `true` if at least one row is selected. */
  readonly some = computed(() => {
    this.selected();
    return this.rows().some((row) => this.model.isSelected(row));
  });

  constructor() {
    if (!this.model.isMultipleSelection()) {
      throw new Error('daschUiSelectAll needs a selection model with multiple selection.');
    }
  }

  protected toggle(event: Event) {
    const rows = this.rows();
    if ((event.target as HTMLInputElement).checked) this.model.select(...rows);
    else this.model.deselect(...rows);
  }
}

/**
 * Checkbox for one table row. Put it on an `<input type="checkbox">` and bind the row value.
 * Works with single and multiple selection. Give the checkbox an accessible name with `aria-label`
 * or a `<label>`.
 *
 * @example
 * ```html
 * <input type="checkbox" [daschUiSelectRow]="user" [attr.aria-label]="'Select ' + user.name" />
 * ```
 */
@Directive({
  selector: 'input[type=checkbox][daschUiSelectRow]',
  exportAs: 'daschUiSelectRow',
  host: {
    '[checked]': 'selected()',
    '(change)': 'toggle($event)',
  },
})
export class SelectRowCheckboxDirective<T = unknown> {
  private readonly model = injectSelectionModel<T>();
  private readonly all = selectionSignal(this.model);

  /** The row value. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- the alias is the directive selector
  readonly row = input.required<T>({ alias: 'daschUiSelectRow' });

  /** `true` while the row is selected. */
  readonly selected = computed(() => {
    this.all();
    return this.model.isSelected(this.row());
  });

  protected toggle(event: Event) {
    if ((event.target as HTMLInputElement).checked) this.model.select(this.row());
    else this.model.deselect(this.row());
  }
}
