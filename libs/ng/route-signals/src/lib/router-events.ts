import { inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, ResolveEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Type guard for `NavigationStart`, usable in `filter()`. */
export const isNavigationStart = (event: Event): event is NavigationStart => event instanceof NavigationStart;

/** Type guard for `NavigationEnd`, usable in `filter()`. */
export const isNavigationEnd = (event: Event): event is NavigationEnd => event instanceof NavigationEnd;

/** Type guard for `NavigationCancel`, usable in `filter()`. */
export const isNavigationCancel = (event: Event): event is NavigationCancel => event instanceof NavigationCancel;

/** Type guard for `NavigationError`, usable in `filter()`. */
export const isNavigationError = (event: Event): event is NavigationError => event instanceof NavigationError;

/** Type guard for `ResolveEnd`, usable in `filter()`. */
export const isResolveEnd = (event: Event): event is ResolveEnd => event instanceof ResolveEnd;

/**
 * Signal of the last `NavigationEnd` event, or `null` before the first navigation has finished.
 *
 * Must be called in an injection context.
 *
 * @example
 * ```typescript
 * router.events.pipe(filter(isNavigationEnd)).subscribe((event) => console.log(event.urlAfterRedirects));
 *
 * readonly lastNavigation = navigationEnd();
 * ```
 */
export function navigationEnd(): Signal<NavigationEnd | null> {
  return toSignal(inject(Router).events.pipe(filter(isNavigationEnd)), { initialValue: null });
}
