import { DestroyRef, DOCUMENT, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { platform, ShortcutKeys } from './platform';

/** A shortcut to register with {@link KeyboardShortcuts.register}. */
export interface ShortcutDefinition extends ShortcutKeys {
  /** Runs when the shortcut is pressed. The browser default is prevented. */
  action: (event: KeyboardEvent) => void;
  /** Description for a help dialog, available through {@link KeyboardShortcuts.shortcuts}. */
  label?: string;
  /** Also fire while an input, textarea, select or contenteditable element has focus. Default `false`. */
  allowInInputs?: boolean;
}

const EDITABLE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

/**
 * App-wide keyboard shortcuts behind a single `keydown` listener on the document.
 *
 * `meta` means Cmd on macOS and Ctrl on every other platform. Modifiers must match exactly: a shortcut
 * without `shift` does not fire when Shift is held, so register `?` as `{ key: '?', shift: true }`.
 * If several shortcuts match, all of them run. On the server nothing is registered.
 */
@Injectable({ providedIn: 'root' })
export class KeyboardShortcuts {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly entries = signal<readonly ShortcutDefinition[]>([]);

  /** The registered shortcuts in registration order, for example for a help dialog. */
  readonly shortcuts = this.entries.asReadonly();

  /**
   * Registers a shortcut and returns a function that removes it again. When called in an injection
   * context (a constructor or field initializer) it is also removed automatically on destroy.
   */
  register(shortcut: ShortcutDefinition): () => void {
    if (!this.browser) {
      return () => undefined;
    }
    let destroyRef: DestroyRef | null = null;
    try {
      destroyRef = inject(DestroyRef);
    } catch {
      // Not in an injection context: the caller removes the shortcut with the returned function.
    }
    // A fresh object per call, so registering the same definition twice gives two independent entries.
    const entry = { ...shortcut };
    if (this.entries().length === 0) {
      this.document.addEventListener('keydown', this.onKeydown);
    }
    this.entries.update((list) => [...list, entry]);

    const unregister = () => {
      if (!this.entries().includes(entry)) {
        return;
      }
      this.entries.update((list) => list.filter((item) => item !== entry));
      if (this.entries().length === 0) {
        this.document.removeEventListener('keydown', this.onKeydown);
      }
    };
    destroyRef?.onDestroy(unregister);
    return unregister;
  }

  private readonly onKeydown = (event: KeyboardEvent) => {
    const inInput = event.target instanceof Element && event.target.closest(EDITABLE) !== null;
    const mac = platform() === 'mac';
    const matches = this.entries().filter(
      (entry) =>
        (entry.allowInInputs || !inInput) &&
        matchesKey(event, entry.key) &&
        event.shiftKey === !!entry.shift &&
        event.altKey === !!entry.alt &&
        (mac ? event.metaKey === !!entry.meta && !event.ctrlKey : event.ctrlKey === !!entry.meta && !event.metaKey),
    );
    if (matches.length > 0) {
      event.preventDefault();
      matches.forEach((entry) => entry.action(event));
    }
  };
}

/** With Alt held, macOS reports special characters in `event.key`, so letters and digits also match `event.code`. */
function matchesKey(event: KeyboardEvent, key: string): boolean {
  const wanted = key.toLowerCase();
  if (event.key.toLowerCase() === wanted) {
    return true;
  }
  if (!event.altKey || !/^[a-z0-9]$/.test(wanted)) {
    return false;
  }
  return event.code === (/\d/.test(wanted) ? `Digit${wanted}` : `Key${wanted.toUpperCase()}`);
}
