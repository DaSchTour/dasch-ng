# @dasch-ng/rxjs-operators

A collection of useful RxJS operators for common data transformation and filtering patterns.

[![npm version](https://img.shields.io/npm/v/@dasch-ng/rxjs-operators.svg)](https://www.npmjs.com/package/@dasch-ng/rxjs-operators)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Installation

```bash
npm install @dasch-ng/rxjs-operators
```

### Peer Dependencies

This library requires the following peer dependencies with these version ranges:

- `rxjs` ^7.0.0
- `@fxts/core` >= 0.20.0

You can install compatible versions with:

```bash
npm install rxjs @fxts/core
```

## Operators

### `debug(label?: string)`

A debugging operator that logs all notifications (next, error, complete) from an observable stream. Useful for development and troubleshooting.

**Parameters:**

- `label` (optional): A string label to identify the stream in console output

**Example:**

```typescript
import { of } from 'rxjs';
import { debug } from '@dasch-ng/rxjs-operators';

of(1, 2, 3).pipe(debug('my-stream')).subscribe();
// Console output (RxJS Notification objects):
// my-stream Notification { kind: 'N', value: 1, error: undefined, hasValue: true }
// my-stream Notification { kind: 'N', value: 2, error: undefined, hasValue: true }
// my-stream Notification { kind: 'N', value: 3, error: undefined, hasValue: true }
// my-stream Notification { kind: 'C', value: undefined, error: undefined, hasValue: false }
```

---

### `filterNil<T>()`

Filters out `null` and `undefined` values from the stream, providing proper TypeScript type narrowing.

**Type Signature:**

```typescript
Observable<T> => Observable<NonNullable<T>>
```

**Example:**

```typescript
import { of } from 'rxjs';
import { filterNil } from '@dasch-ng/rxjs-operators';

of(1, null, 2, undefined, 3).pipe(filterNil()).subscribe(console.log);
// Output: 1, 2, 3
```

---

### `filterEmpty<T>()`

Filters out empty values using `@fxts/core`'s `isEmpty` function. This removes empty strings, arrays, objects, Maps, and Sets, as well as `null` and `undefined`.

**Type Signature:**

```typescript
Observable<T | null | undefined> => Observable<T>
```

**Example:**

```typescript
import { of } from 'rxjs';
import { filterEmpty } from '@dasch-ng/rxjs-operators';

of('hello', '', 'world', null, undefined, [], {}).pipe(filterEmpty()).subscribe(console.log);
// Output: 'hello', 'world'
```

---

### `filterString()`

Filters values to only allow strings, with proper TypeScript type narrowing.

**Type Signature:**

```typescript
Observable<unknown> => Observable<string>
```

**Example:**

```typescript
import { of } from 'rxjs';
import { filterString } from '@dasch-ng/rxjs-operators';

of('hello', 42, 'world', true, 'test').pipe(filterString()).subscribe(console.log);
// Output: 'hello', 'world', 'test'
```

---

### `filterError()`

Filters values to only allow Error instances, with proper TypeScript type narrowing.

**Type Signature:**

```typescript
Observable<unknown> => Observable<Error>
```

**Example:**

```typescript
import { of } from 'rxjs';
import { filterError } from '@dasch-ng/rxjs-operators';

of(new Error('fail'), 'success', new TypeError('type error'), 42).pipe(filterError()).subscribe(console.log);
// Output: Error('fail'), TypeError('type error')
```

---

### `tapCatch<T, O, R>({ next, error })`

Combines the `tap` and `catchError` operators into a single convenient operator. Useful for side effects on successful emissions and error handling.

**Parameters:**

- `next`: A function to execute for each emitted value (side effect)
- `error`: An error handler function that returns an ObservableInput

**Type Signature:**

```typescript
{
  next: (value: T) => void;
  error: (error: unknown, caught: Observable<T>) => ObservableInput<R>;
} => Observable<T | R>
```

**Example:**

```typescript
import { of, throwError } from 'rxjs';
import { tapCatch } from '@dasch-ng/rxjs-operators';

throwError(() => new Error('Oops!'))
  .pipe(
    tapCatch({
      next: (value) => console.log('Got value:', value),
      error: (err, caught) => {
        console.error('Error occurred:', err);
        return of('fallback value');
      },
    }),
  )
  .subscribe(console.log);
// Console output:
// Error occurred: Error: Oops!
// fallback value
```

## Usage Patterns

### Type-Safe Filtering Chain

```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterNil, filterString } from '@dasch-ng/rxjs-operators';

// Type flows correctly through the chain
of<string | null | undefined>('hello', null, 'world', undefined)
  .pipe(
    filterNil(), // Observable<string>
    map((s) => s.toUpperCase()),
  )
  .subscribe(console.log);
```

### Debugging Complex Streams

```typescript
import { interval } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { debug } from '@dasch-ng/rxjs-operators';

interval(1000)
  .pipe(
    debug('before-map'),
    map((x) => x * 2),
    debug('after-map'),
    take(3),
  )
  .subscribe();
```

### Error Handling with Side Effects

```typescript
import { ajax } from 'rxjs/ajax';
import { tapCatch } from '@dasch-ng/rxjs-operators';
import { of } from 'rxjs';

ajax
  .getJSON('/api/data')
  .pipe(
    tapCatch({
      next: (data) => console.log('Data received:', data),
      error: (err) => {
        console.error('API call failed:', err);
        return of({ fallback: true });
      },
    }),
  )
  .subscribe();
```

## Development

### Building

Run `nx build rxjs-operators` to build the library.

### Running unit tests

Run `nx test rxjs-operators` to execute the unit tests via Vitest.

## License

MIT
