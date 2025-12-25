# NG Utils

A collection of useful Angular utilities including standalone pipes, dependency injection helpers, and type guards. Built with modern Angular patterns and full TypeScript support.

## Installation

Install the package via npm:

```bash
npm install @dasch-ng/utils
```

or with bun:

```bash
bun add @dasch-ng/utils
```

The published package name is `@dasch-ng/utils` (not `@dasch-ng/ng-utils`).

## Features

- 🔧 **Standalone Pipes** - Ready-to-use pipes for common operations
- 🎯 **Type-Safe** - Full TypeScript support with proper type inference
- 📦 **Tree-Shakeable** - Import only what you need
- 🚀 **Modern Angular** - Built for Angular 16+ with standalone components
- 🔄 **FxTS Integration** - Leverages [@fxts/core](https://fxts.dev) for functional utilities
- 💉 **DI Helpers** - Simplified dependency injection patterns

## Pipes

All pipes are standalone and can be imported directly into your components.

### Array Manipulation

#### `reverse`

Reverses an array without mutating the original.

**Use case:** Display lists in reverse order (newest first, alphabetically reversed, etc.)

```typescript
import { ReversePipe } from '@dasch-ng/utils';

@Component({
  imports: [ReversePipe],
  template: `
    <div *ngFor="let item of items | reverse">
      {{ item }}
    </div>
  `,
})
export class MyComponent {
  items = ['a', 'b', 'c'];
  // Template displays: c, b, a
}
```

[View API Documentation →](../api/@dasch-ng/utils/README)

---

#### `join`

Joins array elements into a string with a customizable separator.

**Use case:** Display comma-separated lists, format tags, combine values.

```typescript
import { JoinPipe } from '@dasch-ng/utils';

@Component({
  imports: [JoinPipe],
  template: `
    <p>Tags: {{ tags | join: ', ' }}</p>
    <p>Path: {{ pathSegments | join: '/' }}</p>
  `,
})
export class MyComponent {
  tags = ['angular', 'typescript', 'rxjs'];
  // Output: "angular, typescript, rxjs"

  pathSegments = ['home', 'user', 'profile'];
  // Output: "home/user/profile"
}
```

**Parameters:**

- `separator` (optional): String to use between elements. Default: `', '`

[View API Documentation →](../api/@dasch-ng/utils/README)

---

#### `nth`

Gets the nth element from an iterable.

**Use case:** Access specific array positions, pick elements by index.

```typescript
import { NthPipe } from '@dasch-ng/utils';

@Component({
  imports: [NthPipe],
  template: `
    <p>First: {{ items | nth: 0 }}</p>
    <p>Third: {{ items | nth: 2 }}</p>
    <p>Last: {{ items | nth: -1 }}</p>
  `,
})
export class MyComponent {
  items = ['one', 'two', 'three', 'four'];
  // First: "one"
  // Third: "three"
  // Last: "four"
}
```

**Parameters:**

- `n`: Index to retrieve (supports negative indices from end)

[View API Documentation →](../api/@dasch-ng/utils/README)

---

#### `sortBy`

Sorts an iterable by a property name (case-insensitive).

**Use case:** Sort lists of objects alphabetically by property.

```typescript
import { SortByPipe } from '@dasch-ng/utils';

@Component({
  imports: [SortByPipe],
  template: ` <div *ngFor="let user of users | sortBy: 'name'">{{ user.name }} - {{ user.age }}</div> `,
})
export class MyComponent {
  users = [
    { name: 'Charlie', age: 30 },
    { name: 'alice', age: 25 },
    { name: 'Bob', age: 35 },
  ];
  // Template displays alphabetically: alice, Bob, Charlie
}
```

**Parameters:**

- `prop` (optional): Property name to sort by. Case-insensitive sorting.

[View API Documentation →](../api/@dasch-ng/utils/README)

---

### Collection Utilities

#### `size`

Gets the size of any iterable (arrays, sets, maps, strings, etc.).

**Use case:** Display counts, check collection lengths.

```typescript
import { SizePipe } from '@dasch-ng/utils';

@Component({
  imports: [SizePipe],
  template: `
    <p>Items count: {{ items | size }}</p>
    <p>Characters: {{ text | size }}</p>
    <p>Map entries: {{ map | size }}</p>
  `,
})
export class MyComponent {
  items = [1, 2, 3, 4, 5]; // 5
  text = 'Hello'; // 5
  map = new Map([
    ['a', 1],
    ['b', 2],
  ]); // 2
}
```

**Returns:** Number of elements, or `-1` if value is `null`/`undefined`

[View API Documentation →](../api/@dasch-ng/utils/README)

---

#### `includes`

Checks if an array includes a specific value.

**Use case:** Conditional rendering based on array membership.

```typescript
import { IncludesPipe } from '@dasch-ng/utils';

@Component({
  imports: [IncludesPipe],
  template: `
    <button [disabled]="roles | includes: 'admin'">Admin Only</button>
    <span *ngIf="tags | includes: 'featured'">⭐ Featured</span>
  `,
})
export class MyComponent {
  roles = ['user', 'editor'];
  tags = ['new', 'featured', 'popular'];
}
```

[View API Documentation →](../api/@dasch-ng/utils/README)

---

#### `includedIn`

Checks if a value is included in an array (reverse of `includes`).

**Use case:** Check if current selection is in available options.

```typescript
import { IncludedInPipe } from '@dasch-ng/utils';

@Component({
  imports: [IncludedInPipe],
  template: ` <span *ngIf="currentRole | includedIn: adminRoles"> Admin Access </span> `,
})
export class MyComponent {
  currentRole = 'superadmin';
  adminRoles = ['admin', 'superadmin', 'moderator'];
  // Displays "Admin Access"
}
```

[View API Documentation →](../api/@dasch-ng/utils/README)

---

### Object Utilities

#### `prop`

Extracts a property value from an object.

**Use case:** Access nested properties, simplify template expressions.

```typescript
import { PropPipe } from '@dasch-ng/utils';

@Component({
  imports: [PropPipe],
  template: `
    <p>Name: {{ user | prop: 'name' }}</p>
    <p>Email: {{ user | prop: 'email' }}</p>
  `,
})
export class MyComponent {
  user = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
  };
}
```

[View API Documentation →](../api/@dasch-ng/utils/README)

---

### Type Checking

#### `isNil`

Checks if a value is `null` or `undefined`.

**Use case:** Conditional rendering, null checks in templates.

```typescript
import { IsNilPipe } from '@dasch-ng/utils';

@Component({
  imports: [IsNilPipe],
  template: `
    <div *ngIf="data | isNil">
      <p>No data available</p>
    </div>
    <div *ngIf="!(data | isNil)">
      <p>Data loaded: {{ data }}</p>
    </div>
  `,
})
export class MyComponent {
  data: string | null = null;
}
```

[View API Documentation →](../api/@dasch-ng/utils/README)

---

#### `isNull`

Checks if a value is strictly `null`.

**Use case:** Distinguish `null` from `undefined`.

```typescript
import { IsNullPipe } from '@dasch-ng/utils';

@Component({
  imports: [IsNullPipe],
  template: ` <span *ngIf="value | isNull">Value is null</span> `,
})
export class MyComponent {
  value: string | null = null; // true
  other: string | undefined = undefined; // false
}
```

[View API Documentation →](../api/@dasch-ng/utils/README)

---

#### `isUndefined`

Checks if a value is `undefined`.

**Use case:** Check for uninitialized values.

```typescript
import { IsUndefinedPipe } from '@dasch-ng/utils';

@Component({
  imports: [IsUndefinedPipe],
  template: ` <span *ngIf="value | isUndefined">Not initialized</span> `,
})
export class MyComponent {
  value: string | undefined = undefined; // true
}
```

[View API Documentation →](../api/@dasch-ng/utils/README)

---

#### `isEmpty`

Checks if a value is empty (empty string, array, object, etc.).

**Use case:** Validate user input, check for empty collections.

```typescript
import { IsEmptyPipe } from '@dasch-ng/utils';

@Component({
  imports: [IsEmptyPipe],
  template: `
    <p *ngIf="items | isEmpty">No items to display</p>
    <button [disabled]="searchTerm | isEmpty">Search</button>
  `,
})
export class MyComponent {
  items: any[] = [];
  searchTerm = '';
}
```

[View API Documentation →](../api/@dasch-ng/utils/README)

---

### Formatting

#### `decimalBytes`

Formats byte values into human-readable sizes (KB, MB, GB, etc.).

**Use case:** Display file sizes, memory usage, data transfer amounts.

```typescript
import { DecimalBytesPipe } from '@dasch-ng/utils';

@Component({
  imports: [DecimalBytesPipe],
  template: `
    <p>File size: {{ fileSize | decimalBytes }}</p>
    <p>Download: {{ downloadSize | decimalBytes: 1 }}</p>
  `,
})
export class MyComponent {
  fileSize = 1536000; // "1.54 MB"
  downloadSize = 524288000; // "524.3 MB"
}
```

**Parameters:**

- `precision` (optional): Decimal places to show. Default: `2`

**Output format:** Uses decimal (1000-based) units:

- B (Bytes)
- KB (Kilobytes)
- MB (Megabytes)
- GB (Gigabytes)
- TB (Terabytes)
- PB, EB, ZB, YB

[View API Documentation →](../api/@dasch-ng/utils/README)

---

### Symbol Utilities

#### `symbolKeyFor`

Gets the key for a global symbol.

**Use case:** Debug symbol-based registries, display symbol identifiers.

```typescript
import { SymbolKeyForPipe } from '@dasch-ng/utils';

@Component({
  imports: [SymbolKeyForPipe],
  template: ` <p>Symbol key: {{ mySymbol | symbolKeyFor }}</p> `,
})
export class MyComponent {
  mySymbol = Symbol.for('app.config');
  // Output: "app.config"
}
```

[View API Documentation →](../api/@dasch-ng/utils/README)

---

## Utility Functions

### Dependency Injection Helpers

#### `provideValue`

Creates a value provider with a cleaner syntax.

**Use case:** Simplify DI configuration, provide constants and configuration objects.

```typescript
import { provideValue } from '@dasch-ng/utils';
import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL');

@Component({
  providers: [provideValue(API_URL, 'https://api.example.com')],
})
export class AppComponent {}
```

**Parameters:**

- `provide`: Injection token or class
- `useValue`: Value to provide
- `multi` (optional): Enable multi-provider

[View API Documentation →](../api/@dasch-ng/utils/README)

---

#### `provideFactory`

Creates a factory provider with type-safe dependency injection.

**Use case:** Create providers that depend on other services, lazy initialization.

```typescript
import { provideFactory } from '@dasch-ng/utils';
import { HttpClient } from '@angular/common/http';

export const DATA_SERVICE = new InjectionToken<DataService>('DATA_SERVICE');

@Component({
  providers: [provideFactory(DATA_SERVICE, (http: HttpClient) => new DataService(http), { deps: [HttpClient] })],
})
export class AppComponent {}
```

**Parameters:**

- `provide`: Injection token or class
- `useFactory`: Factory function
- `options.deps` (optional): Dependencies to inject
- `options.multi` (optional): Enable multi-provider

[View API Documentation →](../api/@dasch-ng/utils/README)

---

### Resource Utilities

#### `resourceValueGuard`

Type guard for Angular Resource API that safely extracts values.

**Use case:** Safe access to resource values with null fallback.

```typescript
import { resource } from '@angular/core';
import { resourceValueGuard } from '@dasch-ng/utils';

@Component({
  template: ` <div>{{ userData() }}</div> `,
})
export class UserComponent {
  private userResource = resource({
    loader: () => fetch('/api/user').then((r) => r.json()),
  });

  // Safe value extraction: returns null if resource hasn't loaded
  userData = computed(() => resourceValueGuard(this.userResource.resource));
}
```

**Returns:** Resource value if available, otherwise `null`

[View API Documentation →](../api/@dasch-ng/utils/README)

---

## Common Patterns

### Combining Pipes

Pipes can be chained for powerful transformations:

```typescript
import { ReversePipe, JoinPipe, SortByPipe } from '@dasch-ng/utils';

@Component({
  imports: [ReversePipe, JoinPipe, SortByPipe],
  template: `
    <!-- Sort users by name, reverse order, display as comma-separated list -->
    <p>Recent users: {{ users | sortBy: 'name' | reverse | join: ', ' }}</p>
  `,
})
export class RecentUsersComponent {
  users = [
    { name: 'Charlie', joined: '2024-01-15' },
    { name: 'Alice', joined: '2024-01-20' },
    { name: 'Bob', joined: '2024-01-18' },
  ];
  // Output: "Charlie, Bob, Alice" (sorted alphabetically, then reversed)
}
```

### Conditional Rendering

Use type-checking pipes for clean conditional logic:

```typescript
import { IsNilPipe, IsEmptyPipe } from '@dasch-ng/utils';

@Component({
  imports: [IsNilPipe, IsEmptyPipe],
  template: `
    <div *ngIf="!(data | isNil) && !(data | isEmpty)">
      <app-data-display [data]="data" />
    </div>

    <div *ngIf="(data | isNil) || (data | isEmpty)">
      <p>No data to display</p>
    </div>
  `,
})
export class DataViewComponent {
  data: string[] | null = null;
}
```

### File Size Display

Format and display file information:

```typescript
import { DecimalBytesPipe, IsNilPipe } from '@dasch-ng/utils';

@Component({
  imports: [DecimalBytesPipe, IsNilPipe],
  template: `
    <div *ngFor="let file of files">
      <span>{{ file.name }}</span>
      <span *ngIf="!(file.size | isNil)"> ({{ file.size | decimalBytes: 1 }}) </span>
    </div>
  `,
})
export class FileListComponent {
  files = [
    { name: 'document.pdf', size: 2048576 }, // "2.0 MB"
    { name: 'image.jpg', size: 524288 }, // "524.3 KB"
    { name: 'archive.zip', size: 104857600 }, // "104.9 MB"
  ];
}
```

### Safe Property Access

Access object properties safely in templates:

```typescript
import { PropPipe, IsNilPipe } from '@dasch-ng/utils';

@Component({
  imports: [PropPipe, IsNilPipe],
  template: `
    <div *ngIf="!(config | isNil)">
      <p>API URL: {{ config | prop: 'apiUrl' }}</p>
      <p>Timeout: {{ config | prop: 'timeout' }}ms</p>
    </div>
  `,
})
export class ConfigComponent {
  config: { apiUrl: string; timeout: number } | null = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
  };
}
```

### Advanced DI Configuration

Create complex provider configurations:

```typescript
import { provideFactory, provideValue } from '@dasch-ng/utils';
import { InjectionToken } from '@angular/core';

export const CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
export const LOGGER = new InjectionToken<Logger>('LOGGER');

interface AppConfig {
  apiUrl: string;
  debug: boolean;
}

class Logger {
  constructor(private config: AppConfig) {}

  log(message: string) {
    if (this.config.debug) {
      console.log(message);
    }
  }
}

export const appProviders = [
  provideValue(CONFIG, {
    apiUrl: 'https://api.example.com',
    debug: true,
  }),
  provideFactory(LOGGER, (config: AppConfig) => new Logger(config), { deps: [CONFIG] }),
];

@Component({
  providers: [appProviders],
})
export class AppComponent {}
```

## Type Safety

All utilities are fully typed with proper TypeScript inference:

```typescript
import { PropPipe, NthPipe, IsNilPipe } from '@dasch-ng/utils';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  imports: [PropPipe, NthPipe, IsNilPipe],
  template: `
    <!-- TypeScript knows these are typed correctly -->
    <p>{{ user | prop: 'name' }}</p>
    <!-- string -->
    <p>{{ users | nth: 0 }}</p>
    <!-- User | undefined -->
    <p>{{ value | isNil }}</p>
    <!-- boolean -->
  `,
})
export class TypeSafeComponent {
  user: User = { id: 1, name: 'John', email: 'john@example.com' };
  users: User[] = [this.user];
  value: string | null = null;
}
```

## FxTS Integration

Many pipes leverage [@fxts/core](https://fxts.dev), a powerful functional programming library:

```typescript
// These pipes use FxTS under the hood:
import {
  IsNilPipe, // Uses fxts isNil()
  IsNullPipe, // Uses fxts isNull()
  IsUndefinedPipe, // Uses fxts isUndefined()
  IsEmptyPipe, // Uses fxts isEmpty()
  NthPipe, // Uses fxts nth()
  SortByPipe, // Uses fxts sortBy()
  SizePipe, // Uses fxts size()
  PropPipe, // Uses fxts prop()
} from '@dasch-ng/utils';
```

This ensures consistent behavior with functional programming patterns and excellent performance.

## Peer Dependencies

This library requires:

- **Angular**: 16.x, 17.x, 18.x, 19.x, 20.x, or 21.x
- **@fxts/core**: 0.20.0 or higher

## Module Support

While all pipes are provided as standalone components, a legacy `NgUtilsModule` is also available:

```typescript
import { NgUtilsModule } from '@dasch-ng/utils';

@NgModule({
  imports: [NgUtilsModule],
})
export class LegacyModule {}
```

**Recommended:** Use standalone pipes directly for better tree-shaking and modern Angular patterns.

## API Reference

For complete API documentation including all types and interfaces, see the [NG Utils API Reference](../api/@dasch-ng/utils/README).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/utils).

## License

MIT
