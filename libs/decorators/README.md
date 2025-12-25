# @dasch-ng/decorators

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

## Quick Start

```typescript
import { logGroup, measure, memoize, Observe } from '@dasch-ng/decorators';
import { Observable } from 'rxjs';

class ExampleService {
  // Measure execution time
  @measure
  processData(data: any[]) {
    return data.map((item) => item * 2);
  }

  // Cache expensive calculations
  @memoize()
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  // Group console logs
  @logGroup
  async fetchUser(id: string) {
    console.log('Fetching user...');
    return { id, name: 'John Doe' };
  }
}

// Create Observable from property changes
@Component({
  selector: 'user-profile',
  template: '<div>{{ userId$ | async }}</div>',
})
export class UserProfileComponent {
  @Input() userId: number;
  @Observe('userId') userId$: Observable<number>;
}
```

## Documentation

For full documentation, examples, and API reference, visit [dasch.ng/libraries/decorators](https://dasch.ng/libraries/decorators)

## Source & Credits

This library is inspired by [helpful-decorators](https://github.com/NetanelBasal/helpful-decorators) by Netanel Basal.

## Development

### Building

```bash
nx build decorators
```

### Running Tests

```bash
nx test decorators
```

## License

MIT
