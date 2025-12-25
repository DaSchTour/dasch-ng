import { inject } from '@angular/core';
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
 * a signal that updates when the query parameter changes.
 *
 * @param key - The name of the query parameter to track
 * @returns A signal containing the decoded query parameter value
 * @throws Error if the query parameter is not present in the current route
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
 * ```
 */
export const routeQueryParam = (key: string) => {
  const route = inject(ActivatedRoute);
  let initialValue = route.snapshot.queryParamMap.get(key);
  if (initialValue == null) {
    throw new Error(`Query parameter "${key}" is not in route.`);
  } else {
    initialValue = safeDecodeURIComponent(initialValue);
  }
  return toSignal(
    route.queryParamMap.pipe(
      map((params) => params.get(key)),
      filterNil(),
      map((param) => safeDecodeURIComponent(param)),
    ),
    { initialValue },
  );
};
