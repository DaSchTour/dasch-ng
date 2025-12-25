# Decorators

A collection of useful TypeScript decorators for enhancing your Angular and TypeScript applications with logging, performance measurement, memoization, and reactive property observation.

## Installation

```bash
npm install @dasch-ng/decorators
```

or with bun:

```bash
bun add @dasch-ng/decorators
```

## Features

- 📝 **@logGroup** - Group console logs for method execution
- ⏱️ **@measure** - Measure method execution time
- 💾 **@memoize** - Cache method results for performance optimization
- 🔄 **@Observe** - Create reactive Observable streams from property changes
- 🚀 **Async Support** - All decorators work with both sync and async methods

## Available Decorators

### @logGroup

Groups console logs for a method execution, making debugging easier by organizing log output.

**Basic Usage:**

```typescript
import { logGroup } from '@dasch-ng/decorators';

class UserService {
  @logGroup
  loadUser(id: string) {
    console.log('Fetching user data...');
    console.log('User ID:', id);
    return { id, name: 'John Doe' };
  }
}

const service = new UserService();
service.loadUser('123');
// Console output:
// ▼ UserService.loadUser
//   Fetching user data...
//   User ID: 123
```

**With Async Methods:**

```typescript
class ApiService {
  @logGroup
  async fetchData(endpoint: string) {
    console.log('Starting request...');
    const response = await fetch(endpoint);
    console.log('Request complete');
    return response.json();
  }
}
```

### @measure

Measures the execution time of a method and logs it to the console. Perfect for identifying performance bottlenecks.

**Basic Usage:**

```typescript
import { measure } from '@dasch-ng/decorators';

class DataProcessor {
  @measure
  processLargeDataset(data: any[]) {
    return data.map((item) => item * 2);
  }
}

const processor = new DataProcessor();
processor.processLargeDataset([1, 2, 3, 4, 5]);
// Console output: Call to DataProcessor.processLargeDataset took 0.42 milliseconds.
```

**With Async Methods:**

```typescript
class DatabaseService {
  @measure
  async queryDatabase(query: string) {
    const result = await this.db.execute(query);
    return result;
  }
}
// Console output: Call to DatabaseService.queryDatabase took 142.35 milliseconds.
```

### @memoize

Caches method results based on input parameters, preventing redundant computations for the same inputs.

**Basic Usage:**

```typescript
import { memoize } from '@dasch-ng/decorators';

class Calculator {
  @memoize()
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}

const calc = new Calculator();
calc.fibonacci(40); // First call: ~1000ms
calc.fibonacci(40); // Subsequent calls: <1ms (cached)
```

**Use Cases:**

- Expensive computations
- API response caching
- Complex data transformations
- Recursive functions

**Note:** This decorator uses [@fxts/core's memoize function](https://github.com/marpple/FxTS) under the hood.

### @Observe

Creates a reactive Observable stream from property changes. Particularly useful with Angular `@Input()` properties.

**Basic Usage:**

```typescript
import { Component, Input } from '@angular/core';
import { Observe } from '@dasch-ng/decorators';
import { Observable } from 'rxjs';

@Component({
  selector: 'user-profile',
  template: `
    <div>Current User ID: {{ userId }}</div>
    <div>User ID Stream: {{ userId$ | async }}</div>
  `,
})
export class UserProfileComponent {
  @Input() userId: number;
  @Observe('userId') userId$: Observable<number>;
}
```

**With RxJS Operators:**

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { Observe } from '@dasch-ng/decorators';
import { Observable } from 'rxjs';
import { debounceTime, filter, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'search-box',
  template: `<input [(ngModel)]="searchTerm" />`,
})
export class SearchBoxComponent implements OnInit {
  @Input() searchTerm: string;
  @Observe('searchTerm') searchTerm$: Observable<string>;

  ngOnInit() {
    this.searchTerm$
      .pipe(
        filter((term) => term.length > 2),
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe((term) => this.performSearch(term));
  }

  performSearch(term: string) {
    console.log('Searching for:', term);
  }
}
```

**Use Cases:**

- Converting `@Input()` properties to Observables
- Reactive form controls
- State change detection
- Real-time data synchronization

## Combining Decorators

Decorators can be combined to leverage multiple features:

```typescript
import { logGroup, measure, memoize } from '@dasch-ng/decorators';

class ComplexService {
  @logGroup
  @measure
  @memoize()
  complexCalculation(input: number) {
    console.log('Performing complex calculation...');
    // ... expensive computation
    return input * Math.random();
  }
}
```

## API Reference

For complete API documentation, see the [TypeDoc API Reference](/api/@dasch-ng/decorators/README).

## Browser Compatibility

All decorators work in modern browsers that support:

- ES6 Decorators
- Proxy objects (for `@memoize`)
- Performance API (for `@measure`)

## Source & Credits

This library is inspired by [helpful-decorators](https://github.com/NetanelBasal/helpful-decorators) by Netanel Basal. We've adapted and extended these concepts for modern TypeScript and Angular applications with enhanced type safety and additional features.

## License

MIT License - see [LICENSE](https://github.com/dasch-ng/dasch-ng/blob/main/LICENSE) for details.

## Further Reading

- [TypeScript Decorators Documentation](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Angular Reactive Programming](https://angular.dev/guide/signals)
- [@fxts/core Documentation](https://fxts.dev/)
