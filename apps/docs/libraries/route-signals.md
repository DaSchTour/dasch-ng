# Route Signals

Angular utilities for tracking route state as signals. Convert route parameters, query parameters, and route data to reactive signals with automatic type inference and URL decoding.

## Installation

```bash
npm install @dasch-ng/route-signals
```

or with bun:

```bash
bun add @dasch-ng/route-signals
```

## Features

- 🎯 **Type-Safe** - Full TypeScript support with generic types for route data
- 🔄 **Reactive** - Automatically updates when route changes
- 🔓 **Auto URL Decoding** - Automatic decoding of URL-encoded parameters
- 🚀 **Modern Angular** - Built with Angular's `inject()` and signals API
- ✨ **Simple API** - Three intuitive functions for all route tracking needs
- 🛡️ **Error Handling** - Clear error messages when parameters are missing

## Basic Usage

All functions use Angular's dependency injection and must be called within an injection context (constructor, field initializer, or `runInInjectionContext`).

### Route Parameters

Track URL parameters defined in your route configuration:

```typescript
import { Component } from '@angular/core';
import { routeParam } from '@dasch-ng/route-signals';

@Component({
  selector: 'app-user-detail',
  template: `
    <h1>User: {{ userId() }}</h1>
    <p>Tab: {{ tab() }}</p>
  `,
})
export class UserDetailComponent {
  // Route: /users/:userId/tab/:tab
  private readonly userId = routeParam('userId');
  private readonly tab = routeParam('tab');

  constructor() {
    console.log(this.userId()); // "123"
    console.log(this.tab()); // "profile"
  }
}
```

### Query Parameters

Track URL query parameters with automatic decoding:

```typescript
import { Component } from '@angular/core';
import { routeQueryParam } from '@dasch-ng/route-signals';

@Component({
  selector: 'app-search',
  template: `
    <h2>Search Results</h2>
    <p>Query: {{ searchQuery() }}</p>
    <p>Filter: {{ filter() }}</p>
  `,
})
export class SearchComponent {
  // URL: /search?q=hello%20world&filter=active
  private readonly searchQuery = routeQueryParam('q');
  private readonly filter = routeQueryParam('filter');

  constructor() {
    console.log(this.searchQuery()); // "hello world" (decoded)
    console.log(this.filter()); // "active"
  }
}
```

### Route Data

Track typed route data configured in your route definitions:

```typescript
import { Component } from '@angular/core';
import { routeData } from '@dasch-ng/route-signals';

// In route configuration:
// {
//   path: 'admin',
//   component: AdminComponent,
//   data: { title: 'Admin Dashboard', role: 'admin' }
// }

@Component({
  selector: 'app-admin',
  template: `
    <h1>{{ title() }}</h1>
    <p>Required role: {{ role() }}</p>
  `,
})
export class AdminComponent {
  private readonly title = routeData<string>('title');
  private readonly role = routeData<string>('role');

  constructor() {
    console.log(this.title()); // "Admin Dashboard"
    console.log(this.role()); // "admin"
  }
}
```

## API

### routeParam

Creates a signal that tracks a URL-encoded route parameter and automatically decodes it.

**Signature:**

```typescript
function routeParam(key: string): Signal<string>
```

**Parameters:**

| Parameter | Type     | Description                           |
| --------- | -------- | ------------------------------------- |
| `key`     | `string` | The name of the route parameter       |

**Returns:** `Signal<string>` - A signal containing the decoded parameter value

**Throws:** Error if the route parameter is not present

**Example:**

```typescript
// Route: /products/:category/:productId
export class ProductComponent {
  private readonly category = routeParam('category');
  private readonly productId = routeParam('productId');

  ngOnInit() {
    // If URL is /products/electronics/laptop%20pro
    console.log(this.category()); // "electronics"
    console.log(this.productId()); // "laptop pro" (decoded)
  }
}
```

### routeQueryParam

Creates a signal that tracks a URL-encoded query parameter and automatically decodes it.

**Signature:**

```typescript
function routeQueryParam(key: string): Signal<string>
```

**Parameters:**

| Parameter | Type     | Description                       |
| --------- | -------- | --------------------------------- |
| `key`     | `string` | The name of the query parameter   |

**Returns:** `Signal<string>` - A signal containing the decoded query parameter value

**Throws:** Error if the query parameter is not present

**Example:**

```typescript
// URL: /search?q=angular%20signals&sort=relevance
export class SearchComponent {
  private readonly query = routeQueryParam('q');
  private readonly sort = routeQueryParam('sort');

  ngOnInit() {
    console.log(this.query()); // "angular signals" (decoded)
    console.log(this.sort()); // "relevance"
  }
}
```

### routeData

Creates a signal that tracks a typed route data property.

**Signature:**

```typescript
function routeData<T>(key: string): Signal<T>
```

**Type Parameters:**

| Parameter | Description                               |
| --------- | ----------------------------------------- |
| `T`       | The type of the data property             |

**Parameters:**

| Parameter | Type     | Description                       |
| --------- | -------- | --------------------------------- |
| `key`     | `string` | The name of the data property     |

**Returns:** `Signal<T>` - A signal containing the route data value

**Throws:** Error if the data property is not present

**Example:**

```typescript
// Route configuration:
// {
//   path: 'settings',
//   component: SettingsComponent,
//   data: {
//     breadcrumb: 'Settings',
//     permissions: ['admin', 'user'],
//     config: { theme: 'dark', lang: 'en' }
//   }
// }

export class SettingsComponent {
  private readonly breadcrumb = routeData<string>('breadcrumb');
  private readonly permissions = routeData<string[]>('permissions');
  private readonly config = routeData<{ theme: string; lang: string }>('config');

  ngOnInit() {
    console.log(this.breadcrumb()); // "Settings"
    console.log(this.permissions()); // ["admin", "user"]
    console.log(this.config()); // { theme: "dark", lang: "en" }
  }
}
```

## Common Use Cases

### Page Titles from Route Data

Set page titles based on route configuration:

```typescript
import { Component, effect } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { routeData } from '@dasch-ng/route-signals';

@Component({
  selector: 'app-page',
  template: `<h1>{{ pageTitle() }}</h1>`,
})
export class PageComponent {
  private readonly pageTitle = routeData<string>('title');

  constructor(private titleService: Title) {
    effect(() => {
      this.titleService.setTitle(this.pageTitle());
    });
  }
}
```

### Building Breadcrumbs

Create breadcrumb navigation from route data:

```typescript
import { Component } from '@angular/core';
import { routeData } from '@dasch-ng/route-signals';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-page',
  template: `
    <nav>
      @for (crumb of breadcrumbs(); track crumb.url) {
        <a [href]="crumb.url">{{ crumb.label }}</a>
        <span>/</span>
      }
    </nav>
  `,
})
export class PageComponent {
  breadcrumbs = routeData<Breadcrumb[]>('breadcrumbs');
}
```

### Dynamic Filters with Query Parameters

Build filter interfaces from URL query parameters:

```typescript
import { Component, computed } from '@angular/core';
import { routeQueryParam } from '@dasch-ng/route-signals';

@Component({
  selector: 'app-product-list',
  template: `
    <p>Category: {{ category() }}</p>
    <p>Search: {{ search() }}</p>
    <p>Active Filters: {{ activeFilters() }}</p>
  `,
})
export class ProductListComponent {
  // URL: /products?category=electronics&search=laptop&sort=price
  category = routeQueryParam('category');
  search = routeQueryParam('search');
  sort = routeQueryParam('sort');

  activeFilters = computed(() => {
    return {
      category: this.category(),
      search: this.search(),
      sort: this.sort(),
    };
  });
}
```

### Master-Detail Navigation

Navigate between items using route parameters:

```typescript
import { Component, effect } from '@angular/core';
import { routeParam } from '@dasch-ng/route-signals';
import { DataService } from './data.service';

@Component({
  selector: 'app-item-detail',
  template: `
    @if (item(); as item) {
      <h2>{{ item.name }}</h2>
      <p>{{ item.description }}</p>
    }
  `,
})
export class ItemDetailComponent {
  private readonly itemId = routeParam('id');
  item = signal(null);

  constructor(private dataService: DataService) {
    effect(() => {
      const id = this.itemId();
      this.dataService.getItem(id).subscribe((data) => {
        this.item.set(data);
      });
    });
  }
}
```

## URL Encoding Handling

All parameter functions automatically decode URL-encoded values:

```typescript
// URL: /search?q=hello%20world&tags=angular%2Breact
export class SearchComponent {
  query = routeQueryParam('q'); // "hello world"
  tags = routeQueryParam('tags'); // "angular+react"
}

// Route: /user/:name where name is "John%20Doe"
export class UserComponent {
  userName = routeParam('name'); // "John Doe"
}
```

## Error Handling

All functions throw descriptive errors when parameters are missing:

```typescript
try {
  const missingParam = routeParam('nonexistent');
} catch (error) {
  console.error(error.message);
  // "Route parameter 'nonexistent' is not in route."
}

try {
  const missingQuery = routeQueryParam('missing');
} catch (error) {
  console.error(error.message);
  // "Query parameter 'missing' is not in route."
}

try {
  const missingData = routeData<string>('nothere');
} catch (error) {
  console.error(error.message);
  // "Route data property 'nothere' is not in route."
}
```

## Type Safety

The library provides full TypeScript support with proper type inference:

```typescript
// Type inference for routeData
const stringData = routeData<string>('title'); // Signal<string>
const numberData = routeData<number>('count'); // Signal<number>
const arrayData = routeData<string[]>('tags'); // Signal<string[]>
const objectData = routeData<{ id: number }>('user'); // Signal<{ id: number }>

// Parameters are always strings
const param = routeParam('id'); // Signal<string>
const query = routeQueryParam('search'); // Signal<string>
```

## Integration with Angular Router

These utilities work seamlessly with Angular's Router:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'products/:category',
    component: ProductListComponent,
    data: {
      title: 'Products',
      breadcrumb: 'Browse Products',
    },
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    data: {
      title: 'Product Details',
    },
  },
];
```

Then in your components:

```typescript
export class ProductListComponent {
  // Automatically tracks :category parameter
  category = routeParam('category');

  // Automatically tracks route data
  title = routeData<string>('title');
  breadcrumb = routeData<string>('breadcrumb');
}
```

## API Reference

For complete API documentation including all types and interfaces, see the [Route Signals API Reference](../api/@dasch-ng/route-signals/README).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/route-signals).

## License

MIT
