# @dasch-ng/testing

Helpers for Angular tests that run with Vitest.

## Installation

```bash
npm install --save-dev @dasch-ng/testing
```

## Features

- **DOM snapshot serializer**: removes `ng-reflect-*`, `_nghost-*` and `_ngcontent-*` attributes and generated Material/CDK ids from snapshots
- **`flushUI`**: settles a fixture in zoneless tests without `whenStable()`
- **jsdom stubs**: `matchMedia`, `IntersectionObserver`, `ResizeObserver` and `TextEncoder`, each added only where missing

## Basic Usage

Register everything once in your test setup file:

```typescript
import { expect } from 'vitest';
import { installJsdomStubs, ngDomSnapshotSerializer } from '@dasch-ng/testing';

installJsdomStubs();
expect.addSnapshotSerializer(ngDomSnapshotSerializer);
```

Use `flushUI` in tests:

```typescript
import { flushUI } from '@dasch-ng/testing';

fixture.componentInstance.count.set(2);
await flushUI(fixture);
```

## API Reference

See the [full API documentation](https://dasch.ng/api/@dasch-ng/testing/) for detailed information.

## Running Tests

```bash
nx test testing
```

## License

MIT
