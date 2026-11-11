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

## API Reference

See the [API reference](/api/@dasch-ng/cdk-ui/README).

## License

MIT
