# @dasch-ng/webmcp

Offer your Angular app's functions as tools to AI agents through [WebMCP](https://github.com/webmachinelearning/webmcp).

> WebMCP is an early browser proposal and still changes. The types follow the draft of 2026-11-10, where the entry point is `document.modelContext`. `navigator.modelContext` (used by earlier previews) is used as a fallback. The API shape was checked against that draft only.

## Installation

```bash
npm install @dasch-ng/webmcp
```

## Features

- `provideWebMcpTools()` registers tools at startup and removes them when the injector is destroyed
- Runs only in the browser and does nothing where WebMCP is missing (including the server)
- Can be used several times, for example in lazy routes
- Skips tools with a name that is already registered
- No dependencies besides Angular

## Basic Usage

```typescript
import { inject } from '@angular/core';
import { provideWebMcpTools, toolError, toolResult } from '@dasch-ng/webmcp';

bootstrapApplication(App, {
  providers: [
    provideWebMcpTools(() => {
      const orders = inject(OrderService);
      return [
        {
          name: 'order_status',
          description: 'Returns the status of an order',
          inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
          annotations: { readOnlyHint: true },
          execute: async ({ id }) => {
            const order = await orders.find(id);
            if (!order) throw toolError(`Order ${id} not found`);
            return toolResult({ id, status: order.status });
          },
        },
      ];
    }),
  ],
});
```

## API Reference

See the [full API documentation](https://dasch.ng/api/@dasch-ng/webmcp/) for detailed information.

## Running Tests

```bash
nx test webmcp
```

## License

MIT
