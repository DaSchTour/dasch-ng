# RxJS Operators

Custom RxJS operators for reactive programming. These operators extend RxJS with additional functionality for common patterns like filtering, error handling, and debugging.

## Installation

```bash
npm install @dasch-ng/rxjs-operators
```

## Available Operators

### filterNil

Filters out `null` and `undefined` values from the stream with proper TypeScript type narrowing.

**Use case:** Clean data streams by removing nil values while maintaining type safety.

#### Example

```typescript
import { of } from 'rxjs';
import { filterNil } from '@dasch-ng/rxjs-operators';

of(1, null, 2, undefined, 3).pipe(filterNil()).subscribe(console.log);
// Output: 1, 2, 3
```

[View API Documentation →](../api/modules/filterNil.html)

---

### filterEmpty

Filters out empty strings from the stream.

**Use case:** Remove empty strings from user input or form values.

#### Example

```typescript
import { of } from 'rxjs';
import { filterEmpty } from '@dasch-ng/rxjs-operators';

of('hello', '', 'world', '  ', 'foo').pipe(filterEmpty()).subscribe(console.log);
// Output: 'hello', 'world', 'foo'
```

[View API Documentation →](../api/modules/filterEmpty.html)

---

### filterError

Filters out error values from the stream, only allowing successful emissions.

**Use case:** Handle errors gracefully in observable chains without terminating the stream.

#### Example

```typescript
import { of, throwError } from 'rxjs';
import { filterError } from '@dasch-ng/rxjs-operators';

of(1, 2, 3)
  .pipe(
    mergeMap((x) => (x === 2 ? throwError(() => new Error('Error!')) : of(x))),
    filterError(),
  )
  .subscribe(console.log);
// Output: 1, 3 (error is filtered out)
```

[View API Documentation →](../api/modules/filterError.html)

---

### tapCatch

Combines `tap` and `catchError` operators into a single convenient operator.

**Use case:** Execute side effects on successful emissions and handle errors in one operation.

#### Example

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

[View API Documentation →](../api/modules/tapCatch.html)

---

### debugOperator

Debug operator for logging observable emissions, errors, and completions.

**Use case:** Debugging observable streams during development.

#### Example

```typescript
import { of } from 'rxjs';
import { debugOperator } from '@dasch-ng/rxjs-operators';

of(1, 2, 3).pipe(debugOperator('MyStream')).subscribe();
// Console output:
// [MyStream] Next: 1
// [MyStream] Next: 2
// [MyStream] Next: 3
// [MyStream] Complete
```

[View API Documentation →](../api/modules/debugOperator.html)

---

### filterString

Filters out non-string values and optionally empty strings.

**Use case:** Ensure only valid string values pass through the stream.

#### Example

```typescript
import { of } from 'rxjs';
import { filterString } from '@dasch-ng/rxjs-operators';

of('hello', 123, 'world', null, '', 'foo').pipe(filterString()).subscribe(console.log);
// Output: 'hello', 'world', 'foo'
```

[View API Documentation →](../api/modules/filterString.html)

## Common Patterns

### Combining Operators

RxJS operators can be combined in powerful ways:

```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterNil, tapCatch } from '@dasch-ng/rxjs-operators';

const userInput$ = of('  hello  ', null, '  world  ', undefined);

userInput$
  .pipe(
    filterNil(), // Remove null/undefined
    map((s) => s.trim()), // Trim whitespace
    tapCatch({
      next: (value) => console.log('Processing:', value),
      error: (err) => of(''),
    }),
  )
  .subscribe((result) => {
    console.log('Result:', result);
  });
```

### Error Handling

Use `tapCatch` for graceful error handling with logging:

```typescript
import { tapCatch } from '@dasch-ng/rxjs-operators';
import { of } from 'rxjs';

apiCall$
  .pipe(
    tapCatch({
      next: (data) => {
        analytics.track('api_success', data);
      },
      error: (err) => {
        logger.error('API call failed', err);
        return of({ data: [], error: err.message });
      },
    }),
  )
  .subscribe(handleResponse);
```

### Stream Debugging

Use `debugOperator` to understand complex observable chains:

```typescript
import { debugOperator } from '@dasch-ng/rxjs-operators';

complexObservable$
  .pipe(debugOperator('Before Map'), map(transformData), debugOperator('After Map'), filter(isValid), debugOperator('After Filter'))
  .subscribe();
```

## Type Safety

All operators are fully typed and provide proper TypeScript inference:

```typescript
import { of } from 'rxjs';
import { filterNil } from '@dasch-ng/rxjs-operators';

const numbers$: Observable<number | null> = of(1, null, 2);

const filtered$ = numbers$.pipe(filterNil());
// Type is now Observable<number> (null is removed from type)

filtered$.subscribe((num) => {
  // num is number, not number | null
  console.log(num.toFixed(2)); // No TypeScript error
});
```

## API Reference

For complete API documentation with all parameters and return types, see the [API Reference](../api/).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/rxjs/operators).

## Contributing

Found a bug or want to contribute? Check out the [contributing guidelines](https://github.com/DaSchTour/dasch-ng/blob/main/CONTRIBUTING.md).
