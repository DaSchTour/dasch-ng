import { computed, effect, Signal, signal, untracked } from '@angular/core';

/** One batch of a cursor-paged list. */
export interface CursorPage<T> {
  items: readonly T[];
  /** Cursor for the following batch, `null` or `undefined` on the last one. */
  nextCursor?: string | null;
}

/** Options for {@link CursorLoadMore}. */
export interface CursorLoadMoreOptions<T> {
  /** Latest batch, for example `() => resource.value()`. `undefined` while nothing is loaded. */
  page: () => CursorPage<T> | undefined;
  /** Whether a request is running, for example `() => resource.isLoading()`. */
  loading: () => boolean;
  /** Starts over from the first batch whenever the returned value changes (search term, filters). */
  resetOn?: () => unknown;
}

/**
 * Collects cursor-paged batches into one list. Works with `resource()` and `httpResource()`: request the
 * batch for {@link CursorLoadMore.cursor} and hand the result in through `page` and `loading`.
 *
 * Batches are stored per cursor, so a reloaded or repeated batch replaces itself instead of adding
 * duplicates. Needs an injection context.
 *
 * @example
 * readonly query = signal('');
 * readonly users = httpResource<CursorPage<User>>(() => ({
 *   url: '/api/users',
 *   params: { q: this.query(), cursor: this.paging.cursor() ?? '' },
 * }));
 * readonly paging = new CursorLoadMore<User>({
 *   page: () => this.users.value(),
 *   loading: () => this.users.isLoading(),
 *   resetOn: this.query,
 * });
 * // template: @for (user of paging.items(); ...) and a button calling paging.loadMore()
 */
export class CursorLoadMore<T> {
  readonly #batches = signal<ReadonlyMap<string | undefined, readonly T[]>>(new Map());
  readonly #next = signal<string | null | undefined>(undefined);
  readonly #cursor = signal<string | undefined>(undefined);
  readonly #resets = signal(0);
  readonly #loading: () => boolean;

  /** Cursor of the batch to request, `undefined` for the first one. */
  readonly cursor: Signal<string | undefined> = this.#cursor.asReadonly();
  /** All collected items in order. */
  readonly items: Signal<T[]> = computed(() => [...this.#batches().values()].flat());
  /** `true` when a following batch exists and nothing is loading. */
  readonly canLoadMore: Signal<boolean> = computed(() => this.#next() != null && !this.#loading());

  constructor(options: CursorLoadMoreOptions<T>) {
    const { page, resetOn } = options;
    this.#loading = options.loading;
    let lastKey: unknown = resetOn?.();

    effect(() => {
      const key = resetOn?.();
      const current = page();
      const busy = this.#loading();
      this.#resets();
      untracked(() => {
        if (!Object.is(key, lastKey)) {
          lastKey = key;
          this.reset();
        }
        if (busy || !current) return;
        const cursor = this.#cursor();
        this.#batches.update((batches) => new Map(batches).set(cursor, current.items));
        this.#next.set(current.nextCursor);
      });
    });
  }

  /** Requests the next batch. Does nothing while loading or on the last batch. */
  loadMore(): void {
    const next = this.#next();
    if (next != null && !this.#loading()) this.#cursor.set(next);
  }

  /** Drops everything collected so far and starts again from the first batch. */
  reset(): void {
    this.#batches.set(new Map());
    this.#next.set(undefined);
    this.#cursor.set(undefined);
    this.#resets.update((n) => n + 1);
  }
}
