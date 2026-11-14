import { inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, CanActivateFn, Router } from '@angular/router';
import { concatMap, debounceTime, distinctUntilChanged, EMPTY, map } from 'rxjs';

/** Collapses bursts of sort changes into one navigation. */
const QUERY_SORT_DEBOUNCE_MS = 50;

export type SortDirection = 'asc' | 'desc';

export interface Sort {
  property: string;
  direction: SortDirection;
}

export interface QuerySortParamNames {
  /** Query parameter holding the sort property. Defaults to `sort`. */
  property?: string;
  /** Query parameter holding the direction (`asc` or `desc`). Defaults to `dir`. */
  direction?: string;
}

export interface QuerySortOptions extends QuerySortParamNames {
  /** Sort used when the URL holds none, and by `reset()`. Defaults to `null` (no sort). */
  default?: Sort | null;
  /** Query parameters removed from the URL whenever the sort changes, for example a page cursor. */
  resetParams?: string[];
}

export interface QuerySort extends WritableSignal<Sort | null> {
  /** Sorts by `property` ascending; sorting by the current property again flips the direction. */
  toggle(property: string): void;
  /** Back to the default sort. */
  reset(): void;
}

function paramNames(names: QuerySortParamNames) {
  return { property: names.property ?? 'sort', direction: names.direction ?? 'dir' };
}

/**
 * Sort state kept in two query parameters (`?sort=name&dir=desc`), so it survives reloads and shared links.
 *
 * - On creation the signal is set once from the URL (plain `set()`, no navigation). Without a
 *   sort parameter it starts with `options.default`, or `null`. A direction other than `desc` is `asc`.
 * - Later changes are written with `replaceUrl` and `queryParamsHandling: 'merge'`, debounced by
 *   50 ms. `null` removes both parameters. Parameters in `resetParams` are removed on each change.
 * - Like {@link bindQuerySignal}, the URL is only read on creation, and no navigation starts while
 *   another one is in flight.
 *
 * Must be called in an injection context.
 *
 * @example
 * ```typescript
 * export class AssetListComponent {
 *   readonly sort = querySort({ default: { property: 'name', direction: 'asc' }, resetParams: ['page'] });
 * }
 * // <th (click)="sort.toggle('name')">Name</th>
 * ```
 */
export function querySort(options: QuerySortOptions = {}): QuerySort {
  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const names = paramNames(options);
  const defaultSort = options.default ?? null;
  const resetParams: Record<string, null> = {};
  for (const name of options.resetParams ?? []) {
    resetParams[name] = null;
  }

  const property = route.snapshot.queryParamMap.get(names.property);
  const direction = route.snapshot.queryParamMap.get(names.direction);
  const state = signal<Sort | null>(property ? { property, direction: direction === 'desc' ? 'desc' : 'asc' } : defaultSort);

  // The two parameters are written in one navigation, so this is not built on bindQuerySignal
  // (two bindings would race: the second one finds a navigation in flight and is dropped).
  toObservable(state)
    .pipe(
      debounceTime(QUERY_SORT_DEBOUNCE_MS),
      map((sort) => ({ property: sort?.property ?? null, direction: sort?.direction ?? null })),
      distinctUntilChanged((a, b) => a.property === b.property && a.direction === b.direction),
      concatMap((next) => {
        const current = router.parseUrl(router.url).queryParamMap;
        const unchanged = current.get(names.property) === next.property && current.get(names.direction) === next.direction;
        if (unchanged || router.currentNavigation()) {
          return EMPTY;
        }
        return router.navigate([], {
          relativeTo: route,
          replaceUrl: true,
          queryParamsHandling: 'merge',
          queryParams: { ...resetParams, [names.property]: next.property, [names.direction]: next.direction },
        });
      }),
      takeUntilDestroyed(),
    )
    .subscribe();

  return Object.assign(state, {
    toggle: (property: string) =>
      state.update((sort) => ({
        property,
        direction: sort?.property === property && sort.direction === 'asc' ? ('desc' as const) : ('asc' as const),
      })),
    reset: () => state.set(defaultSort),
  });
}

/**
 * Guard that redirects to the same URL with the default sort when the sort property parameter is
 * missing. Path, other query parameters and fragment are kept. Use the same parameter names as
 * {@link querySort} so the default sort ends up in the URL.
 *
 * @example
 * ```typescript
 * {
 *   path: 'assets',
 *   component: AssetListComponent,
 *   canActivate: [defaultSortGuard({ property: 'name', direction: 'asc' })],
 * }
 * ```
 */
export function defaultSortGuard(defaultSort: Sort, names: QuerySortParamNames = {}): CanActivateFn {
  const { property, direction } = paramNames(names);
  return (_route, state) => {
    const tree = inject(Router).parseUrl(state.url);
    if (tree.queryParamMap.has(property)) {
      return true;
    }
    tree.queryParams = { ...tree.queryParams, [property]: defaultSort.property, [direction]: defaultSort.direction };
    return tree;
  };
}
