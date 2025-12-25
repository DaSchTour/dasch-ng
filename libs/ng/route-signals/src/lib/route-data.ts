import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { filterNil } from '@dasch-ng/rxjs-operators';
import { map } from 'rxjs';

/**
 * Creates a signal that tracks a route data property.
 *
 * This utility function extracts a data property from the current ActivatedRoute
 * and returns a signal that updates when the route data changes. Route data is
 * typically configured in the route configuration and can be used to pass static
 * data to components.
 *
 * @template T - The type of the data property
 * @param key - The name of the data property to track
 * @returns A signal containing the route data value
 * @throws Error if the data property is not present in the current route
 *
 * @example
 * ```typescript
 * // In route configuration:
 * // {
 * //   path: 'admin',
 * //   component: AdminComponent,
 * //   data: { title: 'Admin Dashboard', role: 'admin' }
 * // }
 *
 * // In a component
 * export class AdminComponent {
 *   private readonly title = routeData<string>('title');
 *   private readonly role = routeData<string>('role');
 *
 *   constructor() {
 *     console.log(this.title()); // "Admin Dashboard"
 *     console.log(this.role());  // "admin"
 *   }
 * }
 * ```
 */
export const routeData = <T>(key: string) => {
  const route = inject(ActivatedRoute);
  const initialValue = route.snapshot.data[key] as T;
  if (initialValue == null) {
    throw new Error(`Route data property "${key}" is not in route.`);
  }
  return toSignal(
    route.data.pipe(
      map((data) => data[key] as T | undefined),
      filterNil(),
      map((data) => data as T),
    ),
    { initialValue },
  );
};
