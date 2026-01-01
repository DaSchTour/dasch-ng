# Libraries Overview

Welcome to the dasch.ng library collection! This monorepo contains a curated set of Angular and TypeScript utilities designed to enhance your development workflow.

## Angular Libraries

Angular-specific libraries that integrate seamlessly with your Angular applications.

### [Gravatar](/libraries/gravatar)

Generate Gravatar URLs and integrate Gravatar images into your Angular application.

**Key Features:**

- Multiple APIs (directive, pipe, service)
- Automatic email hashing
- Customizable size and fallback images
- Fetch Gravatar profile data

**Installation:** `npm install @dasch-ng/gravatar`

---

### [JSON Viewer](/libraries/json-viewer)

Interactive JSON viewer component for Angular applications with syntax highlighting and collapsible nodes.

**Key Features:**

- Syntax highlighting
- Collapsible/expandable nodes
- Copy to clipboard
- Search functionality

**Installation:** `npm install @dasch-ng/json-viewer`

---

### [Material Right Sheet](/libraries/material-right-sheet)

Angular Material extension providing a right-side sheet component, similar to MatBottomSheet.

**Key Features:**

- Material Design integration
- Flexible positioning from right
- Custom theming support
- Type-safe with generics

**Installation:** `npm install @dasch-ng/material-right-sheet`

---

### [Mutation Observer](/libraries/mutation-observer)

Angular wrapper for the MutationObserver API with RxJS integration.

**Key Features:**

- Directive and service API
- RxJS Observable integration
- Automatic cleanup
- Type-safe mutations

**Installation:** `npm install @dasch-ng/mutation-observer`

---

### [NG Utils](/libraries/ng-utils)

Collection of Angular pipes, directives, and helper functions for common tasks.

**Key Features:**

- Utility pipes
- Provider helpers
- Common utilities
- Standalone components

**Installation:** `npm install @dasch-ng/utils`

---

### [Resize Observer](/libraries/resize-observer)

Angular wrapper for the ResizeObserver API with RxJS integration.

**Key Features:**

- Directive and service API
- RxJS Observable integration
- Automatic cleanup
- Box model options

**Installation:** `npm install @dasch-ng/resize-observer`

---

### [Route Signals](/libraries/route-signals)

Angular route state as signals for reactive routing.

**Key Features:**

- Route parameters as signals
- Query parameters as signals
- Route data as signals
- Reactive routing patterns

**Installation:** `npm install @dasch-ng/route-signals`

---

### [Validators](/libraries/validators)

Collection of reusable Angular form validators for common validation scenarios.

**Key Features:**

- Hex color validation
- Number validation
- Native number validation
- Template and reactive forms support

**Installation:** `npm install @dasch-ng/validators`

---

## TypeScript Libraries

Framework-agnostic TypeScript utilities that work anywhere.

### [Decorators](/libraries/decorators)

Useful TypeScript decorators for common patterns like debouncing, memoization, and logging.

**Key Features:**

- Method decorators
- Property decorators
- Class decorators
- Performance measurement

**Installation:** `npm install @dasch-ng/decorators`

---

### [RxJS Operators](/libraries/rxjs-operators)

Custom RxJS operators for reactive programming with specialized stream transformations.

**Key Features:**

- Filter operators (filterNil, filterEmpty, filterString)
- Error handling (filterError, tapCatch)
- Debugging utilities (debugOperator)
- Type-safe transformations

**Installation:** `npm install @dasch-ng/rxjs-operators`

---

### [Web Utils](/libraries/web-utils)

Browser utilities for SVG conversion, file downloads, and file handling.

**Key Features:**

- SVG manipulation
- File download utilities
- File handling helpers
- Browser APIs wrapper

**Installation:** `npm install @dasch-ng/web-utils`

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

## Documentation

Each library has:

- **User Guide**: Comprehensive documentation with examples and use cases
- **API Reference**: Complete TypeDoc-generated API documentation
- **Source Code**: Available on GitHub

## Contributing

Contributions are welcome! Please check our [contributing guidelines](https://github.com/DaSchTour/dasch-ng/blob/main/CONTRIBUTING.md).

## License

All libraries are released under the MIT License.
