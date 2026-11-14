import { Directionality } from '@angular/cdk/bidi';
import {
  afterNextRender,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  inputBinding,
  model,
  OnInit,
  outputBinding,
  signal,
} from '@angular/core';

import { attachResizeHandle, directionSign, remInPx } from './resize-handle.component';

/**
 * Keeps the widths of the columns of a table. Put it on the `<table>` (or any container of the
 * header cells) and mark the header cells with `daschUiResizableColumn`.
 *
 * Widths are in `rem`. The model holds the width of every column that was set, so it can be saved
 * and restored: `[(daschUiResizableColumns)]="widths"`. Values present when the directive starts are
 * the defaults that `reset()` goes back to.
 *
 * Needs `table-layout: fixed` on a `<table>`, so the header cells decide the column widths. Columns
 * without a width (or marked as fillers) share the remaining space.
 *
 * @example
 * ```html
 * <table style="table-layout: fixed; width: 100%" [(daschUiResizableColumns)]="widths" #cols="daschUiResizableColumns">
 *   <thead>
 *     <tr>
 *       <th daschUiResizableColumn="name" daschUiResizableColumnLabel="Resize name column">Name</th>
 *       <th daschUiResizableColumn="email">Email</th>
 *       <th daschUiResizableColumn="rest" daschUiResizableColumnFiller></th>
 *     </tr>
 *   </thead>
 * </table>
 * <button (click)="cols.reset()">Reset widths</button>
 * ```
 */
@Directive({
  selector: '[daschUiResizableColumns]',
  exportAs: 'daschUiResizableColumns',
})
export class ResizableColumnsDirective implements OnInit {
  /** Width in rem per column name. Columns that are not listed have their natural width. */

  readonly widths = model<Record<string, number>>({}, { alias: 'daschUiResizableColumns' });
  /** Smallest width in rem for all columns. Default `4`. */
  readonly min = input(4, { alias: 'daschUiResizableColumnsMin' });

  private defaults: Record<string, number> = {};

  ngOnInit(): void {
    this.defaults = { ...this.widths() };
  }

  /** Sets the width of one column in rem. */
  setWidth(name: string, rem: number): void {
    this.widths.update((widths) => ({ ...widths, [name]: rem }));
  }

  /** Goes back to the widths the directive started with, or the natural width of one column. */
  reset(name?: string): void {
    if (name === undefined) {
      this.widths.set({ ...this.defaults });
      return;
    }
    this.widths.update((widths) => {
      const next = { ...widths };
      if (name in this.defaults) next[name] = this.defaults[name];
      else delete next[name];
      return next;
    });
  }
}

/**
 * Header cell with a drag handle at its end edge. The handle is a `role="separator"` that works
 * with the pointer and the keyboard: arrow keys change the width by 1rem (5rem with Shift), `Home`
 * sets the minimum width, double click resets the column. Give it an accessible name with
 * `daschUiResizableColumnLabel`.
 *
 * Style the handle with the CSS custom properties `--dasch-ui-resize-handle-size`, `-color`,
 * `-active-color` and `-focus-color`. Must be used inside `daschUiResizableColumns`.
 */
@Directive({
  selector: '[daschUiResizableColumn]',
  host: {
    '[style.width.rem]': 'width()',
    '[style.min-width.rem]': 'effectiveMin()',
  },
})
export class ResizableColumnDirective {
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;
  private readonly columns = inject(ResizableColumnsDirective);
  private readonly directionality = inject(Directionality);
  private readonly measured = signal(0);
  private startWidth = 0;

  /** Name of the column, the key in `widths`. */

  readonly name = input.required<string>({ alias: 'daschUiResizableColumn' });
  /** A filler column has no handle and no fixed width, it takes what the other columns leave. Read once. */
  readonly filler = input(false, { alias: 'daschUiResizableColumnFiller', transform: booleanAttribute });
  /** Smallest width in rem, overrides the one of `daschUiResizableColumns`. */
  readonly min = input<number | undefined>(undefined, { alias: 'daschUiResizableColumnMin' });
  /** Accessible name of the handle. */
  readonly label = input<string | null>(null, { alias: 'daschUiResizableColumnLabel' });

  /** Width in rem, `undefined` while the column has its natural width. */
  readonly width = computed(() => (this.filler() ? undefined : this.columns.widths()[this.name()]));
  protected readonly effectiveMin = computed(() => (this.filler() ? undefined : (this.min() ?? this.columns.min())));

  constructor() {
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (this.filler()) return;
      if (getComputedStyle(this.element).position === 'static') this.element.style.position = 'relative';
      this.measure();
      const handle = attachResizeHandle(injector, this.element, [
        inputBinding('value', () => this.width() ?? this.measured()),
        inputBinding('min', () => this.effectiveMin() ?? null),
        inputBinding('label', this.label),
        inputBinding('direction', () => directionSign(this.directionality)),
        outputBinding('dragStart', () => {
          this.measure();
          this.startWidth = this.width() ?? this.measured();
        }),
        outputBinding<number>('dragMove', (px) => this.resizeTo(this.startWidth + px / remInPx())),
        outputBinding<number>('nudge', (steps) => {
          this.measure();
          this.resizeTo((this.width() ?? this.measured()) + steps);
        }),
        outputBinding<'min' | 'max'>('jump', (to) => to === 'min' && this.resizeTo(0)),
        outputBinding('restore', () => this.columns.reset(this.name())),
      ]);
      destroyRef.onDestroy(() => handle.destroy());
    });
  }

  private measure() {
    this.measured.set(this.element.getBoundingClientRect().width / remInPx());
  }

  private resizeTo(rem: number) {
    this.columns.setWidth(this.name(), Math.max(this.effectiveMin() ?? 0, rem));
  }
}
