import { DOCUMENT, inject, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/** Result of the confirm step: `true` leaves the page, `false` stays. */
export type UnsavedChangesConfirmFn = () => Observable<boolean> | Promise<boolean> | boolean;

/**
 * Text shown by the default confirm (`window.confirm`).
 * The library ships no UI text, so provide your own (translated) message.
 * Defaults to an empty string.
 */
export const UNSAVED_CHANGES_MESSAGE = new InjectionToken<string>('UNSAVED_CHANGES_MESSAGE', {
  factory: () => '',
});

/**
 * Asks the user whether to leave a page with unsaved changes.
 * The default calls `window.confirm` with {@link UNSAVED_CHANGES_MESSAGE}
 * (and allows leaving when there is no window, e.g. on the server).
 * Provide your own function to open a dialog instead.
 */
export const UNSAVED_CHANGES_CONFIRM = new InjectionToken<UnsavedChangesConfirmFn>('UNSAVED_CHANGES_CONFIRM', {
  factory: () => {
    const window = inject(DOCUMENT).defaultView;
    const message = inject(UNSAVED_CHANGES_MESSAGE);
    return () => window?.confirm(message) ?? true;
  },
});
