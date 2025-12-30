# API Reference

Complete API documentation for all libraries in the dasch.ng monorepo, automatically generated from TypeScript/JSDoc comments.

## Angular Libraries

### [Gravatar](api/@dasch-ng/gravatar/README)

Generate Gravatar hashes and URLs for Angular applications.

**Main exports:**

- `GravatarService` - Service for generating Gravatar URLs
- `GravatarDirective` - Directive for adding Gravatar images
- `hashEmail()` - Function to hash email addresses

[View full documentation →](api/@dasch-ng/gravatar/README)

---

### [JSON Viewer](api/@dasch-ng/json-viewer/README)

Interactive JSON viewer component with syntax highlighting and circular reference detection.

**Main exports:**

- `JsonViewerComponent` - Standalone component for displaying JSON data
- `Segment` - Interface representing a key-value pair in the tree
- `SegmentType` - Type alias for different value types

**Key features:**

- 🌲 Interactive tree view with expand/collapse
- 🎨 Type-specific syntax highlighting
- 🔄 Automatic circular reference detection
- 📦 Standalone component (no module required)
- 🚀 Signal-based inputs for optimal performance

[View full documentation →](api/@dasch-ng/json-viewer/README)

---

### [NG Utils](api/@dasch-ng/utils/README)

Angular utilities including pipes, directives, and helper functions.

**Main exports:**

- `IsNullPipe`, `IsNilPipe`, `IsUndefinedPipe` - Type-checking pipes
- `ReversePipe` - Reverse arrays
- Helper functions for Angular applications

[View full documentation →](api/@dasch-ng/utils/README)

---

### [Material Right Sheet](api/@dasch-ng/material-right-sheet/README)

Angular Material right-side sheet component.

**Main exports:**

- `MatRightSheet` - Service to open right-side sheets
- `MatRightSheetRef` - Reference to an opened sheet
- `MatRightSheetConfig` - Configuration options

[View full documentation →](api/@dasch-ng/material-right-sheet/README)

---

### [Mutation Observer](api/@dasch-ng/mutation-observer/README)

Angular wrapper for the MutationObserver API.

**Main exports:**

- `MutationObserverService` - Service for observing DOM mutations
- `ObserveMutationDirective` - Directive for mutation observation

[View full documentation →](api/@dasch-ng/mutation-observer/README)

---

### [Resize Observer](api/@dasch-ng/resize-observer/README)

Angular wrapper for the ResizeObserver API.

**Main exports:**

- `ResizeObserverService` - Service for observing element resizing

[View full documentation →](api/@dasch-ng/resize-observer/README)

---

### [Validators](api/@dasch-ng/validators/README)

Form validators for Angular applications.

**Main exports:**

- Various form validation functions
- Custom validators for common scenarios

[View full documentation →](api/@dasch-ng/validators/README)

## TypeScript Libraries

### [Decorators](api/@dasch-ng/decorators/README)

Useful TypeScript decorators for common patterns.

**Main exports:**

- `@Debounce()` - Debounce method calls
- `@Memoize()` - Cache function results
- `@LogGroup()`, `@Measure()` - Logging and performance measurement

[View full documentation →](api/@dasch-ng/decorators/README)

---

### [RxJS Operators](api/@dasch-ng/rxjs-operators/README)

Custom RxJS operators for reactive programming.

**Main exports:**

- `filterNil()` - Filter out null/undefined values
- `filterEmpty()` - Filter out empty strings
- `tapCatch()` - Combine tap and catchError
- `debugOperator()` - Debug observable streams

[View full documentation →](api/@dasch-ng/rxjs-operators/README)

---

### [Web Utils](api/@dasch-ng/web-utils/README)

Web utilities for SVG conversion, downloads, and file handling.

**Main exports:**

- `convertSvgToImage()` - Convert SVG strings to raster images (PNG/JPEG)
- `download()` - Trigger browser downloads for files
- `createFileArray()` - Normalize File/FileList to array

[View full documentation →](api/@dasch-ng/web-utils/README)

## How to Read the API Documentation

Each module's documentation includes:

- **Functions**: Full function signatures with parameter types and return types
- **Classes**: All public methods and properties
- **Interfaces**: TypeScript interface definitions
- **Type Aliases**: Custom type definitions
- **Examples**: Usage examples from JSDoc comments

## Documentation Format

The API documentation is generated using [TypeDoc](https://typedoc.org/) from TypeScript source code and JSDoc comments. All public APIs include:

- **@param** - Parameter descriptions and types
- **@returns** - Return type descriptions
- **@example** - Usage examples
- **@template** - Generic type parameters

## Contributing to Documentation

To improve the API documentation:

1. Add or update JSDoc comments in the source code
2. Include `@param`, `@returns`, and `@example` tags
3. Run `npx typedoc` to regenerate the docs
4. Verify the output in `apps/docs/api/`

Example JSDoc comment:

````typescript
/**
 * Filters out null and undefined values from the stream.
 *
 * @template T - The type of values emitted by the source observable
 * @returns An operator function that filters out null and undefined values
 *
 * @example
 * ```typescript
 * of(1, null, 2, undefined, 3)
 *   .pipe(filterNil())
 *   .subscribe(console.log);
 * // Output: 1, 2, 3
 * ```
 */
export function filterNil<T>() {
  // implementation
}
````

## Related Resources

- [Getting Started Guide](/guide/getting-started)
- [Library Documentation](/libraries/rxjs-operators)
- [GitHub Repository](https://github.com/DaSchTour/dasch-ng)
