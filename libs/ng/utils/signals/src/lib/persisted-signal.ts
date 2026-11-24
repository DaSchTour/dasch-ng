import { DestroyRef, inject, signal, WritableSignal } from '@angular/core';

/** Options for {@link persistedSignal}. */
export interface PersistedSignalOptions<T> {
  /** Web Storage to use, default `'local'`. */
  storage?: 'local' | 'session';
  /** Converts the value to a string, default `JSON.stringify`. */
  serialize?: (value: T) => string;
  /** Converts a stored string back, default `JSON.parse`. Throwing falls back to the default value. */
  deserialize?: (raw: string) => T;
  /**
   * Also follow changes made in other tabs (`storage` event).
   * Needs an injection context, the listener is removed when the context is destroyed.
   */
  sync?: boolean;
}

function getStorage(kind: 'local' | 'session'): Storage | undefined {
  try {
    return kind === 'local' ? globalThis.localStorage : globalThis.sessionStorage;
  } catch {
    return undefined; // server, or storage blocked by the browser
  }
}

/**
 * A writable signal that is mirrored to `localStorage` or `sessionStorage`.
 *
 * Missing, corrupt or unreadable values fall back to `defaultValue`. Without Web Storage (server-side
 * rendering, blocked storage, full quota) it behaves like a plain signal.
 *
 * @example
 * const pageSize = persistedSignal('page-size', 25);
 * pageSize.set(50); // stored under "page-size"
 */
export function persistedSignal<T>(key: string, defaultValue: T, options: PersistedSignalOptions<T> = {}): WritableSignal<T> {
  const { storage = 'local', serialize = JSON.stringify, deserialize = JSON.parse, sync = false } = options;
  const store = getStorage(storage);

  const read = (raw: string | null): T => {
    if (raw === null) return defaultValue;
    try {
      return deserialize(raw);
    } catch {
      return defaultValue;
    }
  };

  let initial: string | null = null;
  try {
    initial = store?.getItem(key) ?? null;
  } catch {
    // blocked storage: start with the default
  }

  const state = signal<T>(read(initial));
  const set = state.set.bind(state);

  state.set = (value: T) => {
    set(value);
    try {
      store?.setItem(key, serialize(value));
    } catch {
      // quota exceeded or unserializable value: keep the in-memory value
    }
  };
  state.update = (fn: (value: T) => T) => state.set(fn(state()));

  if (sync && store) {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea === store && (event.key === key || event.key === null)) set(read(event.newValue));
    };
    globalThis.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => globalThis.removeEventListener('storage', onStorage));
  }

  return state;
}

/** Options for {@link recentItems}. */
export interface RecentItemsOptions {
  /** Maximum number of entries kept, default `10`. */
  max?: number;
  /** Web Storage to use, default `'local'`. */
  storage?: 'local' | 'session';
}

/**
 * A most-recent-first list (for example recent searches), persisted with {@link persistedSignal}.
 * Adding an entry again moves it to the front. Entries are compared by their JSON form.
 */
export function recentItems<T>(key: string, options: RecentItemsOptions = {}) {
  const { max = 10, storage } = options;
  const list = persistedSignal<T[]>(key, [], { storage });
  return {
    /** Entries, newest first. */
    items: list.asReadonly(),
    /** Adds an entry to the front and drops the oldest ones beyond `max`. */
    add: (item: T) => {
      const id = JSON.stringify(item);
      list.update((items) => [item, ...items.filter((i) => JSON.stringify(i) !== id)].slice(0, max));
    },
    /** Removes all entries. */
    clear: () => list.set([]),
  };
}
