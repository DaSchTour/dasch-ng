# Signal Helpers

Small helpers for signal-based state. They live in the secondary entry point `@dasch-ng/utils/signals`.

## persistedSignal

`persistedSignal(key, defaultValue, options?)` is a writable signal that is mirrored to `localStorage` or `sessionStorage`. Missing or corrupt values fall back to the default. Without Web Storage (server-side rendering, blocked storage, full quota) it behaves like a normal signal.

```typescript
import { persistedSignal } from '@dasch-ng/utils/signals';

const pageSize = persistedSignal('page-size', 25);
pageSize.set(50); // stored as "50" under "page-size"

const draft = persistedSignal('draft', '', { storage: 'session', sync: true });
```

| Option        | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| `storage`     | `'local'` (default) or `'session'`                                           |
| `serialize`   | Value to string, default `JSON.stringify`                                    |
| `deserialize` | String to value, default `JSON.parse`; throwing falls back to the default    |
| `sync`        | Follow changes from other tabs (`storage` event); needs an injection context |

## recentItems

`recentItems(key, { max?, storage? })` keeps a most-recent-first list (for example recent searches) on top of `persistedSignal`. It returns `items` (read-only signal), `add(item)` (moves repeats to the front, drops entries beyond `max`, default `10`) and `clear()`.

```typescript
const searches = recentItems<string>('recent-searches', { max: 5 });
searches.add('angular signals');
searches.items(); // ['angular signals']
```

## CursorLoadMore

`CursorLoadMore` collects cursor-paged batches into one list. It does not make requests itself and does not depend on `@angular/common/http`: you request the batch for `cursor()` with `resource()` or `httpResource()` and pass the result in. Batches are stored per cursor, so a reload or repeated batch replaces itself instead of adding duplicates. Create it in an injection context.

```typescript
import { CursorLoadMore, CursorPage } from '@dasch-ng/utils/signals';

@Component({
  template: `
    @for (user of paging.items(); track user.id) {
      <p>{{ user.name }}</p>
    }
    <button (click)="paging.loadMore()" [disabled]="!paging.canLoadMore()">More</button>
  `,
})
export class UsersComponent {
  readonly query = signal('');
  readonly users = httpResource<CursorPage<User>>(() => ({
    url: '/api/users',
    params: { q: this.query(), cursor: this.paging.cursor() ?? '' },
  }));
  readonly paging = new CursorLoadMore<User>({
    page: () => this.users.value(),
    loading: () => this.users.isLoading(),
    resetOn: this.query,
  });
}
```

A batch has the shape `{ items, nextCursor }`; `nextCursor` is `null` or missing on the last batch.

| Member          | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `items()`       | All collected items in order                                      |
| `cursor()`      | Cursor to request, `undefined` for the first batch                |
| `canLoadMore()` | A following batch exists and nothing is loading                   |
| `loadMore()`    | Moves `cursor()` to the next batch                                |
| `reset()`       | Drops collected items and starts from the first batch             |
| `resetOn`       | Option: starts over whenever the returned value changes (filters) |

[API reference](/api/@dasch-ng/utils/)
