# API Reference

Complete API documentation for all libraries in the dasch-ng monorepo, automatically generated from TypeScript/JSDoc comments.

## Angular Libraries

### [Gravatar](gravatar/src/README)

Generate Gravatar hashes and URLs for Angular applications.

**Main exports:**

- `GravatarService` - Service for generating Gravatar URLs
- `GravatarDirective` - Directive for adding Gravatar images
- `hashEmail()` - Function to hash email addresses

[View full documentation →](gravatar/src/README)

---

### [NG Utils](ng/utils/src/README)

Angular utilities including pipes, directives, and helper functions.

**Main exports:**

- `IsNullPipe`, `IsNilPipe`, `IsUndefinedPipe` - Type-checking pipes
- `ReversePipe` - Reverse arrays
- Helper functions for Angular applications

[View full documentation →](ng/utils/src/README)

---

### [Material Right Sheet](material/right-sheet/src/README)

Angular Material right-side sheet component.

**Main exports:**

- `MatRightSheet` - Service to open right-side sheets
- `MatRightSheetRef` - Reference to an opened sheet
- `MatRightSheetConfig` - Configuration options

[View full documentation →](material/right-sheet/src/README)

---

### [Mutation Observer](ng/mutation-observer/src/README)

Angular wrapper for the MutationObserver API.

**Main exports:**

- `MutationObserverService` - Service for observing DOM mutations
- `ObserveMutationDirective` - Directive for mutation observation

[View full documentation →](ng/mutation-observer/src/README)

---

### [Resize Observer](ng/resize-observer/src/README)

Angular wrapper for the ResizeObserver API.

**Main exports:**

- `ResizeObserverService` - Service for observing element resizing

[View full documentation →](ng/resize-observer/src/README)

---

### [Validators](validators/src/README)

Form validators for Angular applications.

**Main exports:**

- Various form validation functions
- Custom validators for common scenarios

[View full documentation →](validators/src/README)

## TypeScript Libraries

### [Decorators](decorators/src/README)

Useful TypeScript decorators for common patterns.

**Main exports:**

- `@Debounce()` - Debounce method calls
- `@Memoize()` - Cache function results
- `@LogGroup()`, `@Measure()` - Logging and performance measurement

[View full documentation →](decorators/src/README)

---

### [RxJS Operators](rxjs/operators/src/README)

Custom RxJS operators for reactive programming.

**Main exports:**

- `filterNil()` - Filter out null/undefined values
- `filterEmpty()` - Filter out empty strings
- `tapCatch()` - Combine tap and catchError
- `debugOperator()` - Debug observable streams

[View full documentation →](rxjs/operators/src/README)

---

### [Sharp Operators](sharp/operators/src/README)

Image processing operators built on Sharp.

**Main exports:**

- Image transformation operators
- Sharp-based utilities

[View full documentation →](sharp/operators/src/README)

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
