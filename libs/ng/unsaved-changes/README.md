# @dasch-ng/unsaved-changes

Warn before leaving a page with unsaved changes: for in-app navigation (router guard) and for closing the tab (`beforeunload`).

## Installation

```bash
npm install @dasch-ng/unsaved-changes
```

## Basic Usage

```typescript
import { Component, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BeforeUnloadWhenDirective, formHasUnsavedChanges, unsavedChangesGuard } from '@dasch-ng/unsaved-changes';

// Route: { path: 'edit', component: EditComponent, canDeactivate: [unsavedChangesGuard] }

@Component({
  imports: [BeforeUnloadWhenDirective],
  template: `<form [formGroup]="form" [beforeUnloadWhen]="hasUnsavedChanges()">...</form>`,
})
export class EditComponent {
  form = inject(FormBuilder).group({ name: '' });
  hasUnsavedChanges = () => formHasUnsavedChanges(this.form);
}
```

- `unsavedChangesGuard`: `CanDeactivateFn` for components with `hasUnsavedChanges(): boolean` (method or signal).
- `formHasUnsavedChanges(form)`: dirty state of an `NgForm`, a `FormGroup`/`FormControl` or a signal form.
- `UNSAVED_CHANGES_CONFIRM`: provide a function returning `boolean | Promise<boolean> | Observable<boolean>` to use your own dialog. Default: `window.confirm`.
- `UNSAVED_CHANGES_MESSAGE`: text for the default `window.confirm` (no text is built in).
- `[beforeUnloadWhen]`: asks the browser before the tab is closed while the value is true.

Full documentation: [dasch.ng/libraries/unsaved-changes](https://dasch.ng/libraries/unsaved-changes)

## License

MIT
