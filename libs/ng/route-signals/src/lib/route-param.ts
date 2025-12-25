import { inject } from '@angular/core';
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
 * a signal that updates when the route parameter changes.
 *
 * @param key - The name of the route parameter to track
 * @returns A signal containing the decoded route parameter value
 * @throws Error if the route parameter is not present in the current route
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
 * ```
 */
export const routeParam = (key: string) => {
  const route = inject(ActivatedRoute);
  let initialValue = route.snapshot.paramMap.get(key);
  if (initialValue == null) {
    throw new Error(`${key} is not in route.`);
  } else {
    initialValue = safeDecodeURIComponent(initialValue);
  }
  return toSignal(
    route.paramMap.pipe(
      map((params) => params.get(key)),
      filterNil(),
      map((param) => safeDecodeURIComponent(param)),
    ),
    { initialValue },
  );
};
