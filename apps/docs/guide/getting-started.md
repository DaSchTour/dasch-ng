# Getting Started

Welcome to dasch.ng! This guide will help you get started with using the libraries from the dasch-ng monorepo in your projects.

## Installation

All libraries are published to npm under the `@dasch-ng` scope. You can install them individually based on your needs:

### Angular Libraries

```bash
# Gravatar hash generation
npm install @dasch-ng/gravatar

# Angular utilities (pipes, directives, helpers)
npm install @dasch-ng/ng-utils

# Angular Material right-side sheet
npm install @dasch-ng/material-right-sheet

# MutationObserver wrapper
npm install @dasch-ng/mutation-observer

# ResizeObserver wrapper
npm install @dasch-ng/resize-observer

# Form validators
npm install @dasch-ng/validators
```

### TypeScript Libraries

```bash
# TypeScript decorators
npm install @dasch-ng/decorators

# Custom RxJS operators
npm install @dasch-ng/rxjs-operators

# Sharp image processing operators
npm install @dasch-ng/sharp-operators
```

## Usage

Each library has its own documentation page with detailed usage examples. Here's a quick overview:

### Angular Pipes Example

```typescript
import { IsNullPipe } from '@dasch-ng/ng-utils';

@Component({
  standalone: true,
  imports: [IsNullPipe],
  template: ` <div *ngIf="user$ | async | isNull">No user loaded</div> `,
})
export class MyComponent {
  user$ = this.userService.currentUser$;
}
```

### Decorator Example

```typescript
import { Debounce } from '@dasch-ng/decorators';

export class SearchComponent {
  @Debounce(300)
  onSearch(query: string) {
    // This method will be debounced by 300ms
    this.searchService.search(query);
  }
}
```

### RxJS Operator Example

```typescript
import { tapCatch } from '@dasch-ng/rxjs-operators';
import { of } from 'rxjs';

const stream$ = someObservable$.pipe(
  tapCatch((error) => {
    console.error('Error occurred:', error);
    return of(null); // fallback value
  }),
);
```

## Development Setup

If you want to contribute or develop locally:

```bash
# Clone the repository
git clone https://github.com/DaSchTour/dasch-ng.git
cd dasch-ng

# Install dependencies
npm install

# Build all libraries
nx run-many -t build

# Run tests
nx run-many -t test

# Lint and format
nx run-many -t lint --fix
nx format:write
```

## Next Steps

- Browse the [Libraries](/libraries/rxjs-operators) to find utilities for your project
- Check the [API Reference](/api/) for detailed documentation
- Read about the [Architecture](/guide/architecture) of the monorepo

## Support

- <i class="fa-slab fa-bug"></i> [Report Issues](https://github.com/DaSchTour/dasch-ng/issues)
- <i class="fa-slab fa-comment"></i> [Discussions](https://github.com/DaSchTour/dasch-ng/discussions)
- <i class="fa-slab fa-book-open"></i> [Documentation](https://dasch.ng)
