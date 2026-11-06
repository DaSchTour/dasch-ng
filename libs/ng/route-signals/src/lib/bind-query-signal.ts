import { inject, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, debounceTime, distinctUntilChanged, EMPTY, map } from 'rxjs';

/** Collapses bursts of signal writes (typing, several filters at once) into one navigation. */
const QUERY_SIGNAL_DEBOUNCE_MS = 50;

export interface BindQuerySignalOptions<T> {
  /** The writable signal whose value is mirrored into the URL. */
  signal: WritableSignal<T>;
  /** Query parameter name used in the URL. */
  param: string;
  /**
   * The value considered "unset". A value that serializes like `defaultValue` removes the
   * parameter from the URL instead of writing it out.
   */
  defaultValue: T;
  /**
   * Value to URL string. Defaults to `String(value)`, with `null`/`undefined` removing the
   * parameter. Return `null` to remove the parameter for other values too.
   */
  serialize?: (value: T) => string | null;
  /** URL string to value. Defaults to returning the raw string; override for numbers, dates, objects. */
  deserialize?: (raw: string) => T;
}

/**
 * Links a writable signal to a URL query parameter.
 *
 * - On creation, the signal is set once from the current route snapshot. This is a plain
 *   `set()`, so opening a deep link never triggers a navigation.
 * - Later signal changes are written to the URL with `router.navigate([], { replaceUrl: true,
 *   queryParamsHandling: 'merge' })`, debounced by 50 ms.
 * - No navigation happens when the URL already holds the serialized value, or while another
 *   navigation is in flight, so the binding never cancels a navigation started elsewhere.
 *
 * The URL is only read on creation. To follow later URL changes (back/forward), read the
 * parameter with {@link routeQueryParam} as well.
 *
 * Must be called in an injection context, for example a component field initializer or constructor.
 *
 * @example
 * ```typescript
 * export class AssetListComponent {
 *   readonly search = signal('');
 *   readonly page = signal(1);
 *
 *   constructor() {
 *     bindQuerySignal({ signal: this.search, param: 'q', defaultValue: '' });
 *     bindQuerySignal({ signal: this.page, param: 'page', defaultValue: 1, deserialize: Number });
 *   }
 * }
 * ```
 */
export function bindQuerySignal<T>(options: BindQuerySignalOptions<T>): void {
  const router = inject(Router);
  const route = inject(ActivatedRoute);

  const {
    signal: boundSignal,
    param,
    defaultValue,
    serialize = (value: T) => (value == null ? null : String(value)),
    deserialize = (raw: string) => raw as unknown as T,
  } = options;

  const raw = route.snapshot.queryParamMap.get(param);
  if (raw != null) {
    boundSignal.set(deserialize(raw));
  }

  const serializedDefault = serialize(defaultValue);

  toObservable(boundSignal)
    .pipe(
      debounceTime(QUERY_SIGNAL_DEBOUNCE_MS),
      map((value) => {
        const serialized = serialize(value);
        return serialized === serializedDefault ? null : serialized;
      }),
      distinctUntilChanged(),
      concatMap((serialized) => {
        if (router.parseUrl(router.url).queryParamMap.get(param) === serialized || router.currentNavigation()) {
          return EMPTY;
        }
        return router.navigate([], {
          relativeTo: route,
          replaceUrl: true,
          queryParamsHandling: 'merge',
          queryParams: { [param]: serialized },
        });
      }),
      takeUntilDestroyed(),
    )
    .subscribe();
}
