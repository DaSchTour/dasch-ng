import { inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { filterNil } from '@dasch-ng/rxjs-operators';
import { map } from 'rxjs';
import { safeDecodeURIComponent } from './safe-decode';

/**
 * Creates a signal that tracks a URL-encoded query parameter and automatically decodes it.
 *
 * This utility function extracts a query parameter from the current ActivatedRoute,
 * automatically decodes URL-encoded values (e.g., spaces encoded as %20), and returns
 * a signal that updates when the query parameter changes. If the parameter is not present
 * and no fallback is provided, an error is thrown.
 *
 * @param key - The name of the query parameter to track
 * @param fallback - Optional fallback value to use when the parameter is not present.
 *                   If provided, the signal will return this value when the parameter
 *                   is missing from the route. If not provided, an error is thrown
 *                   when the parameter is not present.
 * @returns A signal containing the decoded query parameter value
 * @throws Error if the query parameter is not present and no fallback is provided
 *
 * @example
 * ```typescript
 * // In a component
 * export class SearchComponent {
 *   // URL: /search?q=hello%20world&filter=active
 *   private readonly searchQuery = routeQueryParam('q');
 *   private readonly filter = routeQueryParam('filter');
 *
 *   constructor() {
 *     console.log(this.searchQuery()); // "hello world" (decoded from "hello%20world")
 *     console.log(this.filter());      // "active"
 *   }
 * }
 *
 * // With fallback value for optional parameters
 * export class ProductListComponent {
 *   // URL: /products?sort=price&order=asc
 *   private readonly sort = routeQueryParam('sort', 'name');
 *   private readonly order = routeQueryParam('order', 'asc');
 *
 *   constructor() {
 *     // If URL is /products?sort=price
 *     console.log(this.sort());  // "price"
 *     console.log(this.order()); // "asc" (fallback value)
 *
 *     // If navigated to /products (no query params), signals return fallback values
 *     console.log(this.sort());  // "name"
 *     console.log(this.order()); // "asc"
 *   }
 * }
 * ```
 */
export function routeQueryParam(key: string): Signal<string>;
export function routeQueryParam(key: string, fallback: string): Signal<string>;
export function routeQueryParam(key: string, fallback?: string): Signal<string> {
  const route = inject(ActivatedRoute);
  let initialValue = route.snapshot.queryParamMap.get(key) ?? fallback;
  if (initialValue == null) {
    throw new Error(`Query parameter "${key}" is not in route.`);
  } else {
    initialValue = safeDecodeURIComponent(initialValue);
  }
  return toSignal(
    route.queryParamMap.pipe(
      map((params) => params.get(key) ?? fallback),
      filterNil(),
      map((param) => safeDecodeURIComponent(param)),
    ),
    { initialValue },
  );
}
