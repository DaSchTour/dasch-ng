# @dasch-ng/cdk-ui

Unstyled UI building blocks on the Angular CDK, for apps that use the CDK but not Angular Material.

## Installation

```bash
npm install @dasch-ng/cdk-ui
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/cdk`, `rxjs`.

## Features

- Everything is unstyled apart from a small structural stylesheet. Styling goes through CSS custom properties.
- Selector prefix `daschUi` (attributes) and `dasch-ui` (elements).

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

Full documentation: <https://dasch.ng/libraries/cdk-ui>
