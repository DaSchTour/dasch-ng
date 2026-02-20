import { inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { filterNil } from '@dasch-ng/rxjs-operators';
import { map } from 'rxjs';
import { safeDecodeURIComponent } from './safe-decode';

/**
 * Creates a signal that tracks a URL-encoded route parameter and automatically decodes it.
 *
 * This utility function extracts a route parameter from the current ActivatedRoute,
 * automatically decodes URL-encoded values (e.g., spaces encoded as %20), and returns
 * a signal that updates when the route parameter changes. If the parameter is not present
 * and no fallback is provided, an error is thrown.
 *
 * @param key - The name of the route parameter to track
 * @param fallback - Optional fallback value to use when the parameter is not present.
 *                   If provided, the signal will return this value when the parameter
 *                   is missing from the route. If not provided, an error is thrown
 *                   when the parameter is not present.
 * @returns A signal containing the decoded route parameter value
 * @throws Error if the route parameter is not present and no fallback is provided
 *
 * @example
 * ```typescript
 * // In a component
 * export class MyComponent {
 *   // Route: /domains/:domainId/groups/:groupId
 *   private readonly domainId = routeParam('domainId');
 *   private readonly groupId = routeParam('groupId');
 *
 *   constructor() {
 *     // If URL is /domains/my-domain/groups/a%20b
 *     console.log(this.domainId()); // "my-domain"
 *     console.log(this.groupId());  // "a b" (decoded from "a%20b")
 *   }
 * }
 *
 * // With fallback value for optional parameters
 * export class FilterComponent {
 *   // Route: /list/:category
 *   private readonly category = routeParam('category', 'all');
 *
 *   constructor() {
 *     // If URL is /list/electronics
 *     console.log(this.category()); // "electronics"
 *
 *     // If navigated to a route without :category, signal returns fallback
 *     console.log(this.category()); // "all"
 *   }
 * }
 * ```
 */
export function routeParam(key: string): Signal<string>;
export function routeParam(key: string, fallback: string): Signal<string>;
export function routeParam(key: string, fallback?: string): Signal<string> {
  const route = inject(ActivatedRoute);
  let initialValue = route.snapshot.paramMap.get(key) ?? fallback;
  if (initialValue == null) {
    throw new Error(`Route parameter "${key}" is not in route.`);
  } else {
    initialValue = safeDecodeURIComponent(initialValue);
  }
  return toSignal(
    route.paramMap.pipe(
      map((params) => params.get(key) ?? fallback),
      filterNil(),
      map((param) => safeDecodeURIComponent(param)),
    ),
    { initialValue },
  );
}
