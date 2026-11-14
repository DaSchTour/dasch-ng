import { computed, Directive, inject, input } from '@angular/core';
import { IsActiveMatchOptions, Router } from '@angular/router';
import { navigationEnd } from './router-events';

const EXACT: IsActiveMatchOptions = { paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored' };
const SUBSET: IsActiveMatchOptions = {
  paths: 'subset',
  queryParams: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
};

/**
 * Like `routerLinkActive`, but for an element that stands for several routes. Sets the class
 * names when any of the given URLs is active.
 *
 * Matching works like `routerLinkActiveOptions`: `{ exact: true }` or `IsActiveMatchOptions`.
 * The default is a prefix match (`/a` is active for `/a/b`). There is no default class name.
 *
 * @example
 * ```html
 * <a routerLink="/settings" [routerLinkActiveFor]="['/settings', '/account']" routerLinkActiveForClass="active">
 *   Settings
 * </a>
 * ```
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[routerLinkActiveFor]',
  exportAs: 'routerLinkActiveFor',
  host: { '[class]': 'activeClasses()' },
})
export class RouterLinkActiveFor {
  private readonly router = inject(Router);
  private readonly lastNavigation = navigationEnd();

  /** URLs for which the element counts as active. */
  readonly routerLinkActiveFor = input.required<string | string[]>();
  /** Class names (space-separated or array) set while active. */
  readonly routerLinkActiveForClass = input<string | string[]>('');
  /** Matching mode, same shape as `routerLinkActiveOptions`. */
  readonly routerLinkActiveForOptions = input<{ exact: boolean } | IsActiveMatchOptions>({ exact: false });

  /** `true` while any of the URLs is active. Updates after every `NavigationEnd`. */
  readonly isActive = computed(() => {
    this.lastNavigation();
    const options = this.routerLinkActiveForOptions();
    const match = 'exact' in options ? (options.exact ? EXACT : SUBSET) : options;
    const urls = this.routerLinkActiveFor();
    return (Array.isArray(urls) ? urls : [urls]).some((url) => this.router.isActive(url, match));
  });

  protected readonly activeClasses = computed(() => {
    const classes = this.routerLinkActiveForClass();
    return this.isActive() ? (Array.isArray(classes) ? classes.join(' ') : classes) : '';
  });
}
