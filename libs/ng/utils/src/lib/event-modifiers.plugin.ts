import { DOCUMENT, inject, Injectable, Provider } from '@angular/core';
import { EVENT_MANAGER_PLUGINS, EventManagerPlugin } from '@angular/platform-browser';

const MODIFIERS = new Set(['prevent', 'stop', 'self']);

/**
 * Adds Vue-style modifiers to template event bindings:
 *
 * - `.prevent` calls `event.preventDefault()`
 * - `.stop` calls `event.stopPropagation()`
 * - `.self` only runs the handler when the event was dispatched on the element itself
 *
 * Modifiers combine and work with other plugins, for example `(click.stop.prevent)` or
 * `(keydown.enter.prevent)`. Register it once with {@link provideEventModifiers}.
 */
@Injectable()
export class EventModifiersPlugin extends EventManagerPlugin {
  constructor() {
    super(inject(DOCUMENT));
  }

  override supports(eventName: string): boolean {
    return eventName.split('.').some((part, index) => index > 0 && MODIFIERS.has(part));
  }

  override addEventListener(element: HTMLElement, eventName: string, handler: (event: Event) => void): () => void {
    const [name, ...parts] = eventName.split('.');
    const modifiers = new Set(parts.filter((part) => MODIFIERS.has(part)));
    const bareEvent = [name, ...parts.filter((part) => !MODIFIERS.has(part))].join('.');

    return this.manager.addEventListener(element, bareEvent, (event: Event) => {
      if (modifiers.has('self') && event.target !== element) {
        return;
      }
      if (modifiers.has('prevent')) {
        event.preventDefault();
      }
      if (modifiers.has('stop')) {
        event.stopPropagation();
      }
      handler(event);
    }) as () => void;
  }
}

/** Registers {@link EventModifiersPlugin} for the application. */
export function provideEventModifiers(): Provider {
  return { provide: EVENT_MANAGER_PLUGINS, useClass: EventModifiersPlugin, multi: true };
}
