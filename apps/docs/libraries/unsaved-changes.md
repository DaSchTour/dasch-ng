# Unsaved Changes

Warn before leaving a page with unsaved changes: for in-app navigation (router guard) and for closing the tab (`beforeunload`).

## Installation

```bash
npm install @dasch-ng/unsaved-changes
```

Peer dependencies: `@angular/core`, `@angular/router`, `@angular/forms`, `rxjs`.

## Features

- **Router guard**: `unsavedChangesGuard` asks before a route is left
- **Form adapters**: `formHasUnsavedChanges` for `NgForm`, `FormGroup`/`FormControl` and signal forms
- **Your own dialog**: replace the default `window.confirm` through an injection token
- **Tab close**: `[beforeUnloadWhen]` directive, safe for server-side rendering
- **No built-in texts**: the confirm message is yours to provide

## Router guard

The component exposes `hasUnsavedChanges`, either as a method or as a signal.

```typescript
import { unsavedChangesGuard } from '@dasch-ng/unsaved-changes';

export const routes: Routes = [{ path: 'edit', component: EditComponent, canDeactivate: [unsavedChangesGuard] }];
```

```typescript
@Component({ ... })
export class EditComponent {
  form = inject(FormBuilder).group({ name: '' });
  hasUnsavedChanges = () => formHasUnsavedChanges(this.form);
}
```

[View API Documentation →](../api/@dasch-ng/unsaved-changes/variables/unsavedChangesGuard.html)

## Form adapters

`formHasUnsavedChanges(form)` returns the dirty state of:

- a template-driven form (`NgForm`, for example through `viewChild(NgForm)`)
- a reactive `FormGroup`, `FormArray` or `FormControl`
- a signal form (`form(model)` from `@angular/forms/signals`)

```typescript
const model = signal({ name: '' });
readonly profile = form(model);
hasUnsavedChanges = () => formHasUnsavedChanges(this.profile);
```

Dirty means "touched by the user", and it stays true after saving. Call `markAsPristine()` (reactive forms), `resetForm()` (`NgForm`) or `profile().reset()` (signal forms) after a successful save, before navigating away.

## Confirm dialog

By default the guard calls `window.confirm`. The library contains no UI text, so set the message with `UNSAVED_CHANGES_MESSAGE`:

```typescript
providers: [{ provide: UNSAVED_CHANGES_MESSAGE, useValue: $localize`Discard your changes?` }];
```

To use your own dialog, provide `UNSAVED_CHANGES_CONFIRM`. The function may return `boolean`, `Promise<boolean>` or `Observable<boolean>` (`true` leaves the page, `false` stays) and runs in an injection context.

```typescript
providers: [
  {
    provide: UNSAVED_CHANGES_CONFIRM,
    useFactory: () => {
      const dialog = inject(MatDialog);
      return () => dialog.open(DiscardDialog).afterClosed();
    },
  },
];
```

[View API Documentation →](../api/@dasch-ng/unsaved-changes/variables/UNSAVED_CHANGES_CONFIRM.html)

## Closing the tab

`[beforeUnloadWhen]` registers a `beforeunload` handler while the value is true and removes it when the value turns false or the element is destroyed. The browser shows its own text; it cannot be changed. On the server the directive does nothing.

```typescript
@Component({
  imports: [BeforeUnloadWhenDirective],
  template: `<form [beforeUnloadWhen]="dirty()">...</form>`,
})
export class EditComponent {
  dirty = signal(false);
}
```

[View API Documentation →](../api/@dasch-ng/unsaved-changes/classes/BeforeUnloadWhenDirective.html)

## Credits / License

MIT. Source: [libs/ng/unsaved-changes](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/unsaved-changes)
