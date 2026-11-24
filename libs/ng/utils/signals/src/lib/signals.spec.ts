import { Injector, resource, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CursorLoadMore, CursorPage } from './cursor-load-more';
import { persistedSignal, recentItems } from './persisted-signal';

describe('persistedSignal', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('uses the default, writes through and restores', () => {
    const a = persistedSignal('k', { n: 1 });
    expect(a()).toEqual({ n: 1 });
    a.set({ n: 2 });
    a.update((v) => ({ n: v.n + 1 }));
    expect(localStorage.getItem('k')).toBe('{"n":3}');
    expect(persistedSignal('k', { n: 0 })()).toEqual({ n: 3 });
  });

  it('falls back to the default for corrupt values', () => {
    localStorage.setItem('k', '{oops');
    expect(persistedSignal('k', 5)()).toBe(5);
  });

  it('supports sessionStorage and custom serializers', () => {
    const s = persistedSignal('d', new Date(0), {
      storage: 'session',
      serialize: (d) => String(d.getTime()),
      deserialize: (raw) => new Date(Number(raw)),
    });
    s.set(new Date(5000));
    expect(sessionStorage.getItem('d')).toBe('5000');
    expect(localStorage.getItem('d')).toBeNull();
  });

  it('keeps working when storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const s = persistedSignal('k', 1);
    s.set(2);
    expect(s()).toBe(2);
    vi.restoreAllMocks();
  });

  it('follows other tabs when sync is on and stops after destroy', () => {
    const injector = Injector.create({ providers: [], parent: TestBed.inject(Injector) });
    const s = runInInjectionContext(injector, () => persistedSignal('k', 0, { sync: true }));
    const fire = (key: string | null, newValue: string | null) =>
      window.dispatchEvent(new StorageEvent('storage', { key, newValue, storageArea: localStorage }));
    fire('k', '7');
    expect(s()).toBe(7);
    fire('other', '9');
    expect(s()).toBe(7);
    fire('k', null);
    expect(s()).toBe(0);
    (injector as unknown as { destroy(): void }).destroy();
    fire('k', '3');
    expect(s()).toBe(0);
  });
});

describe('recentItems', () => {
  beforeEach(() => localStorage.clear());

  it('keeps newest first, moves repeats to the front and caps at max', () => {
    const r = recentItems<string>('r', { max: 3 });
    ['a', 'b', 'c', 'a', 'd'].forEach(r.add);
    expect(r.items()).toEqual(['d', 'a', 'c']);
    expect(JSON.parse(localStorage.getItem('r')!)).toEqual(['d', 'a', 'c']);
    r.clear();
    expect(r.items()).toEqual([]);
  });
});

describe('CursorLoadMore', () => {
  const pages: Record<string, CursorPage<number>> = {
    first: { items: [1, 2], nextCursor: 'c2' },
    c2: { items: [3, 4], nextCursor: 'c3' },
    c3: { items: [5], nextCursor: null },
  };

  function setup() {
    const query = signal('x');
    const calls: (string | undefined)[] = [];
    let paging!: CursorLoadMore<number>;
    let res!: ReturnType<typeof makeResource>;
    const makeResource = () =>
      resource({
        params: () => ({ q: query(), cursor: paging.cursor() }),
        loader: async ({ params }) => {
          calls.push(params.cursor);
          return pages[params.cursor ?? 'first'];
        },
      });
    TestBed.runInInjectionContext(() => {
      // the resource reads paging.cursor lazily, so paging can be created right after it
      res = makeResource();
      paging = new CursorLoadMore<number>({ page: () => res.value(), loading: () => res.isLoading(), resetOn: query });
    });
    const settle = async () => {
      TestBed.tick();
      await new Promise((r) => setTimeout(r));
      TestBed.tick();
    };
    return { query, paging, res, calls, settle };
  }

  it('collects batches, ignores reloads and stops on the last page', async () => {
    const { paging, res, settle } = setup();
    await settle();
    expect(paging.items()).toEqual([1, 2]);
    expect(paging.canLoadMore()).toBe(true);

    paging.loadMore();
    await settle();
    expect(paging.items()).toEqual([1, 2, 3, 4]);

    res.reload();
    await settle();
    expect(paging.items()).toEqual([1, 2, 3, 4]);

    paging.loadMore();
    await settle();
    expect(paging.items()).toEqual([1, 2, 3, 4, 5]);
    expect(paging.canLoadMore()).toBe(false);
    paging.loadMore();
    expect(paging.cursor()).toBe('c3');
  });

  it('starts over when resetOn changes and on reset()', async () => {
    const { paging, query, settle } = setup();
    await settle();
    paging.loadMore();
    await settle();
    expect(paging.items().length).toBe(4);

    query.set('y');
    await settle();
    expect(paging.cursor()).toBeUndefined();
    expect(paging.items()).toEqual([1, 2]);

    paging.reset();
    await settle();
    expect(paging.items()).toEqual([1, 2]);
  });

  it('does not load more while loading', async () => {
    const { paging, settle } = setup();
    expect(paging.canLoadMore()).toBe(false);
    await settle();
    paging.loadMore();
    TestBed.tick();
    expect(paging.canLoadMore()).toBe(false);
    paging.loadMore();
    expect(paging.cursor()).toBe('c2');
  });
});
