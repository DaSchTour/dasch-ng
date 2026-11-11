import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, InjectionToken, Provider, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/** Named media queries, e.g. `{ mobile: '(max-width: 767.98px)' }`. Order matters for `injectActiveBreakpoint()`. */
export type BreakpointMap = Record<string, string>;

/**
 * Default breakpoints, close to the Bootstrap grid. The ranges do not overlap, so exactly one
 * name is active at any width.
 */
export const DEFAULT_BREAKPOINTS: BreakpointMap = {
  xs: '(max-width: 575.98px)',
  sm: '(min-width: 576px) and (max-width: 767.98px)',
  md: '(min-width: 768px) and (max-width: 991.98px)',
  lg: '(min-width: 992px) and (max-width: 1199.98px)',
  xl: '(min-width: 1200px)',
};

/** Holds the breakpoints used by `injectBreakpoint()` and `injectActiveBreakpoint()`. Defaults to `DEFAULT_BREAKPOINTS`. */
export const BREAKPOINTS = new InjectionToken<BreakpointMap>('DASCH_UI_BREAKPOINTS', {
  providedIn: 'root',
  factory: () => DEFAULT_BREAKPOINTS,
});

/**
 * Replaces the default breakpoints. The map is not merged with the defaults.
 *
 * @example
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideBreakpoints({ mobile: '(max-width: 767.98px)', desktop: '(min-width: 768px)' })],
 * });
 * ```
 */
export function provideBreakpoints(breakpoints: BreakpointMap): Provider {
  return { provide: BREAKPOINTS, useValue: breakpoints };
}

/**
 * Signal that is `true` while the named breakpoint matches. Must be called in an injection context.
 *
 * On the server (no `matchMedia`) the value is `false`. Throws if `name` is not a configured breakpoint.
 *
 * @example
 * ```ts
 * protected readonly mobile = injectBreakpoint('mobile');
 * ```
 */
export function injectBreakpoint(name: string): Signal<boolean> {
  const query = inject(BREAKPOINTS)[name];
  if (query === undefined) {
    throw new Error(`Unknown breakpoint "${name}". Configure it with provideBreakpoints().`);
  }
  const observer = inject(BreakpointObserver);
  return toSignal(observer.observe(query).pipe(map((state) => state.matches)), { initialValue: observer.isMatched(query) });
}

/**
 * Signal with the name of the first configured breakpoint that matches, or `null` if none does
 * (always `null` on the server). With overlapping queries the order of the map decides. Must be
 * called in an injection context.
 *
 * @example
 * ```ts
 * protected readonly size = injectActiveBreakpoint(); // 'md'
 * ```
 */
export function injectActiveBreakpoint<K extends string = string>(): Signal<K | null> {
  const entries = Object.entries(inject(BREAKPOINTS));
  const observer = inject(BreakpointObserver);
  const active = (matches: (query: string) => boolean) => (entries.find(([, query]) => matches(query))?.[0] as K | undefined) ?? null;
  return toSignal(observer.observe(entries.map(([, query]) => query)).pipe(map((state) => active((query) => state.breakpoints[query]))), {
    initialValue: active((query) => observer.isMatched(query)),
  });
}
