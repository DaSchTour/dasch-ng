import { DOCUMENT, Directive, effect, inject, input } from '@angular/core';

/**
 * While `beforeUnloadWhen` is true, asks the browser to confirm closing or
 * reloading the tab. The browser shows its own text. Does nothing on the server.
 *
 * @example
 * <form [beforeUnloadWhen]="dirty()">...</form>
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[beforeUnloadWhen]',
})
export class BeforeUnloadWhenDirective {
  /** Whether closing the tab should ask for confirmation. */
  readonly beforeUnloadWhen = input.required<boolean>();

  constructor() {
    const window = inject(DOCUMENT).defaultView;
    effect((onCleanup) => {
      if (!window || !this.beforeUnloadWhen()) return;
      const handler = (event: BeforeUnloadEvent) => event.preventDefault();
      window.addEventListener('beforeunload', handler);
      onCleanup(() => window.removeEventListener('beforeunload', handler));
    });
  }
}
