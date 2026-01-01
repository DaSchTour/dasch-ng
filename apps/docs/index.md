---
layout: home

hero:
  name: 'dasch.ng'
  text: 'Angular & TypeScript Utilities'
  tagline: 'A collection of reusable Angular libraries and TypeScript utilities for modern web development'
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/DaSchTour/dasch-ng

features:
  - icon: <i class="fa-brands fa-angular"></i>
    title: Angular Utilities
    details: Powerful pipes, directives, and utilities for Angular applications including Gravatar support, observers, and form validators.

  - icon: <i class="fa-slab fa-bolt"></i>
    title: RxJS Operators
    details: Custom RxJS operators to enhance your reactive programming workflow with specialized stream transformations.

  - icon: <i class="fa-slab fa-at"></i>
    title: TypeScript Decorators
    details: Useful decorators for debouncing, memoization, logging, and performance measurement.

  - icon: <i class="fa-slab fa-wrench"></i>
    title: Web Utilities
    details: Browser utilities for SVG conversion, file downloads, and file handling.

  - icon: <i class="fa-slab fa-box"></i>
    title: Nx Monorepo
    details: Organized as an Nx monorepo with independent versioning and automated releases to npm.

  - icon: <i class="fa-slab fa-book"></i>
    title: Well Documented
    details: Comprehensive API documentation with TypeDoc and practical usage examples for every library.
---

## Quick Start

Install any library from the monorepo:

```bash
# Angular utilities
npm install @dasch-ng/gravatar
npm install @dasch-ng/utils
npm install @dasch-ng/material-right-sheet

# TypeScript utilities
npm install @dasch-ng/decorators
npm install @dasch-ng/rxjs-operators
npm install @dasch-ng/web-utils
```

## Libraries Overview

### Angular Libraries

- **[Gravatar](/libraries/gravatar)** - Generate Gravatar hashes and URLs
- **[JSON Viewer](/libraries/json-viewer)** - Interactive JSON viewer component for Angular
- **[Material Right Sheet](/libraries/material-right-sheet)** - Right-side sheet component for Angular Material
- **[Mutation Observer](/libraries/mutation-observer)** - Angular wrapper for MutationObserver API
- **[NG Utils](/libraries/ng-utils)** - Angular pipes, directives, and helper functions
- **[Resize Observer](/libraries/resize-observer)** - Angular wrapper for ResizeObserver API
- **[Route Signals](/libraries/route-signals)** - Angular route state as signals for reactive routing
- **[Validators](/libraries/validators)** - Form validators for Angular applications

### TypeScript Libraries

- **[Decorators](/libraries/decorators)** - Useful TypeScript decorators for common patterns
- **[RxJS Operators](/libraries/rxjs-operators)** - Custom RxJS operators for reactive programming
- **[Web Utils](/libraries/web-utils)** - Browser utilities for SVG conversion, file downloads, and file handling

## Development

This is an Nx monorepo. Common commands:

```bash
# Build all projects
nx run-many -t build

# Test all projects
nx run-many -t test

# Lint and format
nx run-many -t lint --fix
nx format:write
```

## Contributing

Contributions are welcome! Please check our [contributing guidelines](https://github.com/DaSchTour/dasch-ng/blob/main/CONTRIBUTING.md).

## License

MIT © [Daniel Schuba](https://daniel-schuba.de)
