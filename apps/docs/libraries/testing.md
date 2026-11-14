# Testing

Helpers for Angular tests that run with Vitest: a DOM snapshot serializer, `flushUI` for zoneless tests and stubs for browser APIs that jsdom does not provide.

## Installation

```bash
npm install --save-dev @dasch-ng/testing
```

Peer dependencies: `@angular/core` and `vitest`.

## Features

- **DOM snapshot serializer**: stable snapshots without Angular internals and generated ids
- **`flushUI`**: settle a fixture in zoneless tests without `whenStable()` hangs
- **jsdom stubs**: `matchMedia`, `IntersectionObserver`, `ResizeObserver`, `TextEncoder`

## Setup

Call the helpers once in a test setup file:

```typescript
import { expect } from 'vitest';
import { installJsdomStubs, ngDomSnapshotSerializer } from '@dasch-ng/testing';

installJsdomStubs();
expect.addSnapshotSerializer(ngDomSnapshotSerializer);
```

## ngDomSnapshotSerializer

Serializes DOM elements for `toMatchSnapshot()` and `toMatchInlineSnapshot()`. It removes:

- `ng-reflect-*`, `_nghost-*` and `_ngcontent-*` attributes
- Material and CDK generated ids such as `mat-input-3` or `cdk-overlay-1`, and their references in `for`, `aria-labelledby`, `aria-describedby`, `aria-controls` and `aria-owns`

Hand-written ids are kept. The element under test is not changed, a clone is serialized.

**Use case:** snapshots that do not break when a Material component gets another generated id or when Angular adds debug attributes.

```typescript
expect(fixture.nativeElement).toMatchSnapshot();
```

## flushUI

```typescript
function flushUI(fixture: ComponentFixture<unknown>): Promise<void>;
```

Runs change detection, flushes effects with `TestBed.tick()`, waits one microtask and renders again. It does not call `fixture.whenStable()`, which can hang when a timer or request keeps the app busy.

```typescript
fixture.componentInstance.count.set(2);
await flushUI(fixture);
expect(fixture.nativeElement.textContent).toContain('2');
```

## jsdom stubs

| Function                            | Adds                                          |
| ----------------------------------- | --------------------------------------------- |
| `installMatchMediaStub()`           | `window.matchMedia`, never matches            |
| `installIntersectionObserverStub()` | `IntersectionObserver`, never reports entries |
| `installResizeObserverStub()`       | `ResizeObserver`, never reports entries       |
| `installTextEncoderStub()`          | `TextEncoder` (`encode` only)                 |
| `installJsdomStubs()`               | all of the above                              |

Each stub is installed only if the API is missing, so real implementations are never replaced.

## Not included

- Playwright helpers (for example a CSP helper) would need a Playwright peer dependency.
- No `ActivatedRoute` stubs: use `provideRouter` with `RouterTestingHarness`.

## API Reference

See the [full API documentation](/api/@dasch-ng/testing/README).

## License

MIT
