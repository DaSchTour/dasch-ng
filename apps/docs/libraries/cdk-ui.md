# CDK UI

Unstyled UI building blocks on the Angular CDK, for apps that use the CDK but not Angular Material.

## Installation

```bash
npm install @dasch-ng/cdk-ui
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/cdk`, `rxjs`.

## Features

- Everything is unstyled apart from a small structural stylesheet. Styling goes through CSS custom properties.
- Selector prefix `daschUi` (attributes) and `dasch-ui` (elements), so nothing clashes with the CDK's own `cdk` prefix.

## Breakpoints

Named media queries as signals, built on the CDK `BreakpointObserver`.

```ts
import { injectActiveBreakpoint, injectBreakpoint, provideBreakpoints } from '@dasch-ng/cdk-ui';

// optional: replace the defaults (the map is not merged with them)
bootstrapApplication(App, {
  providers: [provideBreakpoints({ mobile: '(max-width: 767.98px)', desktop: '(min-width: 768px)' })],
});

@Component({
  template: `@if (mobile()) {
    <app-menu-button />
  }`,
})
export class Header {
  protected readonly mobile = injectBreakpoint('mobile'); // Signal<boolean>
  protected readonly size = injectActiveBreakpoint(); // Signal<string | null>, e.g. 'desktop'
}
```

- Defaults (close to the Bootstrap grid, no overlap): `xs` below 576px, `sm` 576 to 767px, `md` 768 to 991px, `lg` 992 to 1199px, `xl` from 1200px.
- Both functions must be called in an injection context.
- `injectBreakpoint()` throws for a name that is not configured.
- `injectActiveBreakpoint()` returns the first matching name in the order of the map, or `null` if none matches. Use non-overlapping queries if you want a single answer.
- On the server there is no `matchMedia`: `injectBreakpoint()` is `false` and `injectActiveBreakpoint()` is `null`. Render the mobile-first layout by default and let the client correct it, or avoid layout decisions that depend on the width during SSR.

## Tooltip

`daschUiTooltip` shows a tooltip on the CDK Overlay. No Angular Material needed.

```ts
import { TooltipDirective } from '@dasch-ng/cdk-ui';

@Component({
  imports: [TooltipDirective],
  template: `
    <button daschUiTooltip="Save changes">Save</button>

    <button [daschUiTooltip]="help" [daschUiTooltipPosition]="['end', 'start']" [daschUiTooltipShowDelay]="0">?</button>
    <ng-template #help>Press <kbd>Ctrl</kbd> + <kbd>S</kbd></ng-template>
  `,
})
export class Toolbar {}
```

| Input                     | Default                             | Description                                                                                                                  |
| ------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `daschUiTooltip`          | -                                   | Text or `TemplateRef`. An empty string, `null` or `undefined` shows nothing.                                                 |
| `daschUiTooltipPosition`  | `['top', 'bottom', 'start', 'end']` | One side or a list of preferred sides. The next one is used if it does not fit. `start` and `end` follow the text direction. |
| `daschUiTooltipShowDelay` | `300`                               | Milliseconds before the tooltip appears.                                                                                     |
| `daschUiTooltipHideDelay` | `0`                                 | Milliseconds before the tooltip disappears.                                                                                  |
| `daschUiTooltipDisabled`  | `false`                             | Turns the tooltip off.                                                                                                       |

Behaviour:

- Shows on hover and on keyboard focus. Focus caused by a mouse click does not show it.
- Hides on mouse leave, blur, `Escape` and when anything on the page scrolls.
- The overlay has `role="tooltip"`. While it is shown, the host gets `aria-describedby` pointing to it (an existing value is kept and restored).
- The tooltip does not take pointer events, so it disappears as soon as the pointer leaves the host.
- `show()`, `hide()`, `scheduleShow()` and `scheduleHide()` are available through `exportAs: 'daschUiTooltip'`.

### Styling

Only a structural stylesheet is included (size limit, spacing, wrapping). Colors and sizes come from CSS custom properties. Set them on `:root` or any ancestor of the overlay container:

```css
:root {
  --dasch-ui-tooltip-background: #1f2937;
  --dasch-ui-tooltip-color: #fff;
  --dasch-ui-tooltip-font-size: 0.8125rem;
  --dasch-ui-tooltip-padding: 0.25rem 0.5rem;
  --dasch-ui-tooltip-radius: 0.25rem;
  --dasch-ui-tooltip-max-width: 20rem;
  --dasch-ui-tooltip-gap: 0.5rem; /* distance to the host */
}
```

### Tooltip only when the text is cut off

Pair it with the `daschNgOverflow` directive from `@dasch-ng/utils`. The two libraries do not depend on each other, the template connects them:

```html
<span class="ellipsis" daschNgOverflow #o="daschNgOverflow" [daschUiTooltip]="o.overflowing() ? file.name : ''"> {{ file.name }} </span>
```

## Toasts

`Toasts` is a service that shows short messages on the CDK Overlay.

```ts
import { provideToasts, Toasts } from '@dasch-ng/cdk-ui';

// optional defaults
bootstrapApplication(App, {
  providers: [provideToasts({ position: 'top-end', maxVisible: 4, duration: 6000 })],
});

@Component({ template: `<button (click)="remove()">Delete</button>` })
export class Files {
  private readonly toasts = inject(Toasts);

  remove() {
    const ref = this.toasts.show({
      message: 'File deleted',
      type: 'success',
      action: { label: 'Undo', handler: () => this.restore() },
    });
    ref.afterDismissed.subscribe((reason) => console.log(reason)); // 'timeout' | 'action' | 'dismissed'
  }
}
```

### Options of `show()`

| Option     | Default           | Description                                                                              |
| ---------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `message`  | -                 | Text, or a `TemplateRef` for custom content (the context `$implicit` is the `ToastRef`). |
| `type`     | `'info'`          | `'info'`, `'success'`, `'warning'` or `'error'`.                                         |
| `duration` | configured (5000) | Milliseconds. `0` keeps the toast until it is dismissed.                                 |
| `action`   | -                 | `{ label, handler? }`. A button that runs `handler` and dismisses the toast.             |

`show()` returns a `ToastRef` with `dismiss()` and `afterDismissed`. The observable emits the reason once (`'timeout'`, `'action'` or `'dismissed'`) and completes. `Toasts.dismissAll()` removes everything.

### Configuration

`provideToasts()` takes `maxVisible` (default 3), `position` (default `'bottom-end'`; also `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`) and `duration` (default 5000). Omitted values keep their default.

### Behaviour

- Only `maxVisible` toasts are on screen. The others wait in a queue (`Toasts.waiting()`) and their timer starts when they appear.
- The timer stops while a toast is hovered or has keyboard focus, and continues with the remaining time afterwards.
- `Toasts.visible()` is a signal with the toasts on screen.
- Accessibility: `error` toasts use `role="alert"` (read out immediately), all others `role="status"` (read out politely). Both are live regions. There is no built-in close button, because the library has no texts of its own. For toasts with `duration: 0` add an `action` such as `{ label: 'Close' }`, or a button in a custom template that calls `ref.dismiss()`.
- Nothing is shown on the server, and no timers are started there.

### Custom content

```html
<ng-template #custom let-ref>
  <strong>Upload finished</strong>
  <a routerLink="/files">Show files</a>
  <button (click)="ref.dismiss()">Close</button>
</ng-template>
```

```ts
this.toasts.show({ message: this.custom(), duration: 0 });
```

### Styling

The default look is a plain box with a colored edge per type. Change it with CSS custom properties (set them on `:root`):

```css
:root {
  --dasch-ui-toast-background: #1f2937;
  --dasch-ui-toast-color: #fff;
  --dasch-ui-toast-padding: 0.75rem 1rem;
  --dasch-ui-toast-radius: 0.375rem;
  --dasch-ui-toast-shadow: 0 0.25rem 0.75rem rgb(0 0 0 / 0.25);
  --dasch-ui-toast-min-width: 16rem;
  --dasch-ui-toast-max-width: 28rem;
  --dasch-ui-toast-gap: 0.5rem; /* between toasts */
  --dasch-ui-toast-margin: 1rem; /* to the viewport edge */
  --dasch-ui-toast-info-accent: #2563eb;
  --dasch-ui-toast-success-accent: #16a34a;
  --dasch-ui-toast-warning-accent: #d97706;
  --dasch-ui-toast-error-accent: #dc2626;
}
```

For full control, target the classes `.dasch-ui-toast`, `.dasch-ui-toast-message`, `.dasch-ui-toast-action` and the attribute `[data-type]` in your global styles.

## Table helpers

Selection, resizable columns and a resizable panel. They work with the CDK table, a plain `<table>` or any other markup.

### Selection

`provideSelectionModel<T>()` provides a CDK `SelectionModel<T>`. Put it in the `providers` of the component that owns the table, so each table has its own selection.

```ts
import { injectSelectionModel, provideSelectionModel, SelectAllCheckboxDirective, SelectRowCheckboxDirective } from '@dasch-ng/cdk-ui';

@Component({
  imports: [SelectAllCheckboxDirective, SelectRowCheckboxDirective],
  providers: [provideSelectionModel<User>()],
  template: `
    <input type="checkbox" [daschUiSelectAll]="users()" aria-label="Select all users" />
    @for (user of users(); track user.id) {
      <input type="checkbox" [daschUiSelectRow]="user" [attr.aria-label]="'Select ' + user.name" />
    }
    <p>{{ selection.selected.length }} selected</p>
  `,
})
export class UserTable {
  protected readonly users = input.required<User[]>();
  protected readonly selection = injectSelectionModel<User>();
}
```

- `provideSelectionModel<T>({ multiple, initiallySelected, compareWith })`: `multiple` defaults to `true`. Use `compareWith` when rows are re-created as new objects (for example after a reload).
- `[daschUiSelectAll]="rows"` goes on an `<input type="checkbox">`. It is checked when all of `rows` are selected and indeterminate when only some are. It only touches the rows you bind, so bind the current page to select a page. It needs multiple selection and throws otherwise.
- `[daschUiSelectRow]="row"` goes on an `<input type="checkbox">`, with single and multiple selection.
- `selectionSignal(model)` turns the model into a signal of the selected values (call it in an injection context). The `SelectionModel` itself is not signal based, the directives listen to its `changed` stream.
- Both directives use native checkboxes, so keyboard and screen reader support comes from the browser. Always add an `aria-label` or a `<label>`, the library has no texts of its own.

### Resizable columns

Put `daschUiResizableColumns` on the table and `daschUiResizableColumn="<name>"` on the header cells. Every header cell gets a drag handle at its end edge.

```html
<table style="table-layout: fixed; width: 100%" [(daschUiResizableColumns)]="widths" #cols="daschUiResizableColumns">
  <thead>
    <tr>
      <th daschUiResizableColumn="name" daschUiResizableColumnLabel="Resize name column">Name</th>
      <th daschUiResizableColumn="email" [daschUiResizableColumnMin]="8" daschUiResizableColumnLabel="Resize email column">Email</th>
      <th daschUiResizableColumn="rest" daschUiResizableColumnFiller></th>
    </tr>
  </thead>
  ...
</table>
<button (click)="cols.reset()">Reset widths</button>
```

```ts
protected readonly widths = signal<Record<string, number>>({ name: 12 }); // rem
```

- Widths are in `rem`. The model `[(daschUiResizableColumns)]` holds the width of every column that was set, so you can save it (for example in local storage) and pass it back in. Columns that are not in the map have their natural width until the user resizes them.
- Values present at the start are the defaults. `cols.reset()` goes back to them, `cols.reset('name')` resets one column. A double click on a handle resets that column.
- Minimum width: `[daschUiResizableColumnsMin]` on the table (default `4`), `[daschUiResizableColumnMin]` on a header cell.
- A filler column (`daschUiResizableColumnFiller`) has no handle and no fixed width. It takes the space that the other columns leave, several fillers share it. Without a filler, the extra space of a `table-layout: fixed` table is spread over all columns.
- The widths go on the header cells, so a `<table>` needs `table-layout: fixed`. For a flex based table, read `widths()` and apply it to the cells yourself.
- Keyboard: the handle is focusable (`role="separator"`). Arrow keys change the width by 1rem, `Shift` + arrow by 5rem, `Home` sets the minimum width. Give it a name with `daschUiResizableColumnLabel`.
- Right-to-left layouts are supported through the CDK `Directionality`.

### Resizable panel

```html
<aside
  [(daschUiResizablePanel)]="sidebarWidth"
  daschUiResizablePanelLabel="Resize sidebar"
  [daschUiResizablePanelMin]="10"
  [daschUiResizablePanelMaxShare]="0.4"
  daschUiResizablePanelSide="start"
>
  ...
</aside>
```

| Input                           | Default | Description                                                          |
| ------------------------------- | ------- | -------------------------------------------------------------------- |
| `[(daschUiResizablePanel)]`     | `20`    | Width in rem, a two-way `model()`.                                   |
| `daschUiResizablePanelMin`      | `8`     | Smallest width in rem.                                               |
| `daschUiResizablePanelMaxShare` | `0.5`   | Largest width as share of the viewport width (`0` to `1`).           |
| `daschUiResizablePanelSide`     | `start` | Side of the page the panel is on. The handle sits on the inner edge. |
| `daschUiResizablePanelLabel`    | -       | Accessible name of the handle.                                       |

- The applied width is always kept between the limits. If the window gets smaller, the panel shrinks, but the model is only written when the user resizes.
- Keyboard: arrow keys change the width by 1rem, `Shift` + arrow by 5rem, `Home` and `End` jump to the limits.
- The panel gets `position: relative` if it has none.

### Styling the handle

The handle is transparent until it is hovered, focused or dragged. Change it with CSS custom properties:

```css
:root {
  --dasch-ui-resize-handle-size: 0.5rem;
  --dasch-ui-resize-handle-color: transparent;
  --dasch-ui-resize-handle-active-color: rgb(37 99 235 / 0.5);
  --dasch-ui-resize-handle-focus-color: currentColor;
}
```

## API Reference

See the [API reference](/api/@dasch-ng/cdk-ui/README).

## License

MIT
