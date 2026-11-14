import { computed, inject, Signal } from '@angular/core';
import { ActivatedRouteSnapshot, Data, Params, Router } from '@angular/router';
import { navigationEnd } from './router-events';

/** Active route snapshots from the root to the deepest primary child. */
function activeChain(router: Router): ActivatedRouteSnapshot[] {
  const chain: ActivatedRouteSnapshot[] = [];
  let snapshot: ActivatedRouteSnapshot | null = router.routerState.snapshot.root;
  while (snapshot) {
    chain.push(snapshot);
    snapshot = snapshot.firstChild;
  }
  return chain;
}

function mergedFromRouteTree<T extends object>(pick: (snapshot: ActivatedRouteSnapshot) => T): Signal<T> {
  const router = inject(Router);
  const lastNavigation = navigationEnd();
  return computed(() => {
    lastNavigation();
    return Object.assign({}, ...activeChain(router).map(pick)) as T;
  });
}

/**
 * Route data merged from the root route down to the deepest active child route.
 * On equal keys the child wins. Updates after every `NavigationEnd`.
 *
 * With a `key`, the signal holds that single value, or `undefined` when no active route sets it.
 *
 * Must be called in an injection context.
 *
 * @example
 * ```typescript
 * // Routes: { path: 'admin', data: { section: 'Admin' }, children: [{ path: 'users', data: { title: 'Users' } }] }
 * const data = nestedRouteData<{ section: string; title: string }>(); // { section: 'Admin', title: 'Users' }
 * const title = nestedRouteData<string>('title'); // 'Users'
 * ```
 */
export function nestedRouteData<T = Data>(): Signal<T>;
export function nestedRouteData<T>(key: string): Signal<T | undefined>;
export function nestedRouteData(key?: string): Signal<unknown> {
  const data = mergedFromRouteTree<Data>((snapshot) => snapshot.data);
  return key === undefined ? data : computed(() => data()[key]);
}

/**
 * Route params merged from the root route down to the deepest active child route.
 * On equal names the child wins. Updates after every `NavigationEnd`.
 *
 * Must be called in an injection context.
 *
 * @example
 * ```typescript
 * // URL /orgs/7/projects/42 with routes 'orgs/:orgId' > 'projects/:projectId'
 * const params = nestedRouteParams(); // { orgId: '7', projectId: '42' }
 * ```
 */
export function nestedRouteParams(): Signal<Params> {
  return mergedFromRouteTree<Params>((snapshot) => snapshot.params);
}
