# @dasch-ng/route-signals

[![npm version](https://img.shields.io/npm/v/@dasch-ng/route-signals.svg)](https://www.npmjs.com/package/@dasch-ng/route-signals)

Angular utilities for working with route parameters, query parameters, and route data as signals, plus writing signals back into query parameters.

## Features

- 🎯 **Type-safe signals** - Get route state with full TypeScript support
- 🔄 **Automatic updates** - Signals update when route changes
- 🔐 **URL decoding** - Automatically decodes URL-encoded values
- 🛡️ **Error handling** - Safe decoding with fallback for malformed URLs
- ⚡ **Zero dependencies** - Only depends on Angular and RxJS
- 📦 **Tree-shakeable** - Import only what you need

## Installation

```bash
npm install @dasch-ng/route-signals
```

## Usage

### Route Parameters

Track URL path parameters as signals:

```typescript
import { Component } from '@angular/core';
import { routeParam } from '@dasch-ng/route-signals';

@Component({
  selector: 'app-user-detail',
  template: `
    <h1>User: {{ userId() }}</h1>
    <p>Group: {{ groupId() }}</p>
  `,
})
export class UserDetailComponent {
  // Route: /users/:userId/groups/:groupId
  readonly userId = routeParam('userId');
  readonly groupId = routeParam('groupId');

  constructor() {
    // URL: /users/john-doe/groups/admin
    console.log(this.userId()); // "john-doe"
    console.log(this.groupId()); // "admin"

    // Automatically decodes URL-encoded values
    // URL: /users/john%20doe/groups/team%20alpha
    console.log(this.userId()); // "john doe"
    console.log(this.groupId()); // "team alpha"
  }
}
```

### Query Parameters

Track URL query parameters as signals:

```typescript
import { Component } from '@angular/core';
import { routeQueryParam } from '@dasch-ng/route-signals';

@Component({
  selector: 'app-search',
  template: `
    <h1>Search: {{ query() }}</h1>
    <p>Filter: {{ filter() }}</p>
    <p>Sort: {{ sort() }}</p>
  `,
})
export class SearchComponent {
  // URL: /search?q=angular&filter=tutorials&sort=recent
  readonly query = routeQueryParam('q');
  readonly filter = routeQueryParam('filter');
  readonly sort = routeQueryParam('sort');

  constructor() {
    console.log(this.query()); // "angular"
    console.log(this.filter()); // "tutorials"
    console.log(this.sort()); // "recent"

    // Automatically decodes URL-encoded values
    // URL: /search?q=angular%20signals&filter=a%2Fb
    console.log(this.query()); // "angular signals"
    console.log(this.filter()); // "a/b"
  }
}
```

### Route Data

Track route data properties as signals:

```typescript
import { Component } from '@angular/core';
import { routeData } from '@dasch-ng/route-signals';

// In route configuration:
const routes = [
  {
    path: 'admin',
    component: AdminComponent,
    data: { title: 'Admin Dashboard', role: 'admin' },
  },
];

@Component({
  selector: 'app-admin',
  template: `
    <h1>{{ title() }}</h1>
    <p>Required role: {{ role() }}</p>
  `,
})
export class AdminComponent {
  readonly title = routeData<string>('title');
  readonly role = routeData<string>('role');

  constructor() {
    console.log(this.title()); // "Admin Dashboard"
    console.log(this.role()); // "admin"
  }
}
```

### With Resolvers

Route data works seamlessly with Angular resolvers:

```typescript
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from './user.service';

// Resolver
const userResolver = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const userId = route.paramMap.get('id');
  return userService.getUser(userId);
};

// Route configuration
const routes = [
  {
    path: 'user/:id',
    component: UserDetailComponent,
    resolve: { user: userResolver },
    // Re-run resolver when params change
    runGuardsAndResolvers: 'paramsChange',
  },
];

// Component
@Component({
  selector: 'app-user-detail',
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
  `,
})
export class UserDetailComponent {
  readonly user = routeData<User>('user');

  // Signal automatically updates when resolver re-runs
}
```

## API

### `routeParam(key: string): Signal<string>`

Creates a signal that tracks a URL-encoded route parameter.

- **Parameters:**
  - `key`: The name of the route parameter to track
- **Returns:** A signal containing the decoded parameter value
- **Throws:** Error if the parameter is not present in the current route

### `routeQueryParam(key: string): Signal<string>`

Creates a signal that tracks a URL-encoded query parameter.

- **Parameters:**
  - `key`: The name of the query parameter to track
- **Returns:** A signal containing the decoded query parameter value
- **Throws:** Error if the query parameter is not present in the current route

### `routeData<T>(key: string): Signal<T>`

Creates a signal that tracks a route data property.

- **Type Parameters:**
  - `T`: The type of the data property
- **Parameters:**
  - `key`: The name of the data property to track
- **Returns:** A signal containing the route data value
- **Throws:** Error if the data property is not present in the current route

### `bindQuerySignal<T>(options: BindQuerySignalOptions<T>): void`

Writes a `WritableSignal` into a query parameter. The signal is set once from the URL on creation; later changes update the URL (debounced, `replaceUrl`, other parameters kept). A value that serializes like `defaultValue` removes the parameter.

- **Options:** `signal`, `param`, `defaultValue`, optional `serialize(value) => string | null` and `deserialize(raw) => T`
- The URL is only read on creation. Combine with `routeQueryParam` to follow back/forward navigation.

```typescript
export class AssetListComponent {
  readonly search = signal('');
  readonly size = signal<MinMaxRange | null>(null);

  constructor() {
    bindQuerySignal({ signal: this.search, param: 'q', defaultValue: '' });
    bindQuerySignal({
      signal: this.size,
      param: 'size',
      defaultValue: null,
      serialize: serializeMinMaxRange,
      deserialize: deserializeMinMaxRange,
    });
  }
}
```

### Query parameter codecs

Ready-made `serialize`/`deserialize` pairs for `bindQuerySignal`:

- `serializeMinMaxRange` / `deserializeMinMaxRange`: `{ min: 5, max: 100 }` ⇄ `5-100` (open sides: `5-`, `-100`)
- `serializeDateRange` / `deserializeDateRange`: `{ start, end }` ⇄ `2026-01-01,2026-02-15` (local calendar dates)

### `querySort(options?)` and `defaultSortGuard(defaultSort, names?)`

`querySort` is a writable signal `{ property, direction } | null` bound to the query parameters `sort` and `dir` (names configurable), with `toggle(property)` and `reset()`. Options: `property`, `direction`, `default`, `resetParams` (parameters removed when the sort changes, e.g. `['page']`). `defaultSortGuard` redirects to the default sort when the parameters are missing and keeps other parameters.

```typescript
readonly sort = querySort({ default: { property: 'name', direction: 'asc' }, resetParams: ['page'] });
// { path: 'assets', component: AssetListComponent, canActivate: [defaultSortGuard({ property: 'name', direction: 'asc' })] }
```

### `nestedRouteData<T>(key?)` and `nestedRouteParams()`

Data and params merged from the root route to the deepest active child (child wins), updated on `NavigationEnd`. With a `key`, `nestedRouteData` returns that single value (`undefined` when no active route sets it).

```typescript
readonly title = nestedRouteData<string>('title');
readonly params = nestedRouteParams(); // { orgId: '7', projectId: '42' }
```

### Router event guards

`isNavigationStart`, `isNavigationEnd`, `isNavigationCancel`, `isNavigationError` and `isResolveEnd` are type guards for `filter()`:

```typescript
router.events.pipe(filter(isNavigationEnd)).subscribe((event) => console.log(event.urlAfterRedirects));
```

`navigationEnd(): Signal<NavigationEnd | null>` holds the last finished navigation.

## URL Decoding

All functions automatically decode URL-encoded values using a safe decoder that:

- Decodes standard URL encoding (e.g., `%20` → space)
- Handles special characters (e.g., `%2F` → `/`, `%3D` → `=`)
- Decodes Unicode characters (e.g., `%E2%9C%93` → `✓`)
- Safely handles malformed encoding (logs warning and returns original string)

## Error Handling

All functions throw an error if the requested parameter/data is not present in the route. This helps catch configuration errors early:

```typescript
// If route doesn't have an 'id' parameter
const userId = routeParam('id'); // ❌ Throws: "id is not in route."

// If route doesn't have a 'search' query parameter
const search = routeQueryParam('search'); // ❌ Throws: "Query parameter "search" is not in route."

// If route data doesn't have a 'title' property
const title = routeData('title'); // ❌ Throws: "Route data property "title" is not in route."
```

## Requirements

- Angular 19.0.0 or higher
- RxJS 7.5.0 or higher

## License

MIT © [Daniel Schuba](https://github.com/DaSchTour)

## Links

- [Documentation](https://dasch.ng/libraries/route-signals.html)
- [API Reference](https://dasch.ng/api/@dasch-ng/route-signals/)
- [GitHub](https://github.com/DaSchTour/dasch-ng)
- [Issues](https://github.com/DaSchTour/dasch-ng/issues)
