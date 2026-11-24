import { inject } from '@angular/core';
import { AbstractControl, NgForm } from '@angular/forms';
import type { FieldTree } from '@angular/forms/signals';
import { CanDeactivateFn } from '@angular/router';
import { UNSAVED_CHANGES_CONFIRM } from './unsaved-changes-confirm';

/**
 * A component the guard can ask. `hasUnsavedChanges` may be a method or a signal.
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Route guard for `canDeactivate`. Lets the navigation pass when the component
 * has no unsaved changes, otherwise asks via {@link UNSAVED_CHANGES_CONFIRM}.
 *
 * @example
 * { path: 'edit', component: EditComponent, canDeactivate: [unsavedChangesGuard] }
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  component.hasUnsavedChanges() ? inject(UNSAVED_CHANGES_CONFIRM)() : true;

/**
 * Adapter for `hasUnsavedChanges`: reads the dirty state of a template-driven
 * form (`NgForm`), a reactive `FormGroup`/`FormControl`, or a signal form field.
 * Dirty stays true after saving until you reset the form.
 *
 * @example
 * hasUnsavedChanges = () => formHasUnsavedChanges(this.form);
 */
export function formHasUnsavedChanges(form: NgForm | AbstractControl | FieldTree<unknown>): boolean {
  return typeof form === 'function' ? form().dirty() : !!form.dirty;
}
