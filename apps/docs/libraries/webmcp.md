# WebMCP

Offer your Angular app's functions as tools to AI agents through [WebMCP](https://github.com/webmachinelearning/webmcp), a browser proposal that lets a web page tell agents what it can do.

::: warning Early proposal
WebMCP is a draft of the W3C Web Machine Learning Community Group and still changes. The types in this library follow the draft of 2026-11-10 (`index.bs`, revision `aa1b51c`). In that draft the entry point is `document.modelContext`, and a tool's result is any JSON-serializable value (failures are rejected promises). `navigator.modelContext`, used by earlier previews, is used as a fallback. Nothing was checked against other revisions.
:::

## Installation

```bash
npm install @dasch-ng/webmcp
```

## Features

- **Provider API**: `provideWebMcpTools()` registers tools at startup
- **Automatic cleanup**: tools are unregistered when the injector is destroyed
- **Safe by default**: does nothing on the server or in browsers without WebMCP
- **Duplicate guard**: a tool name that is already registered is skipped with a console warning
- **No dependencies** besides `@angular/core` and `@angular/common`

## provideWebMcpTools

The factory runs once at startup in an injection context, so it can call `inject()`. You can use the provider several times, also in route providers: the tools of a route are removed when its injector is destroyed.

```typescript
import { inject } from '@angular/core';
import { provideWebMcpTools, toolError, toolResult } from '@dasch-ng/webmcp';

export const appConfig: ApplicationConfig = {
  providers: [
    provideWebMcpTools(() => {
      const orders = inject(OrderService);
      return [
        {
          name: 'order_status',
          description: 'Returns the status of an order',
          inputSchema: {
            type: 'object',
            properties: { id: { type: 'string' } },
            required: ['id'],
          },
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
};
```

**Tool fields** (`WebMcpTool`): `name` (letters, digits, `_`, `-`, `.`, up to 128 characters), `description`, `execute`, and optionally `title`, `inputSchema`, `outputSchema` and `annotations` (`readOnlyHint`, `untrustedContentHint`, `consequentialHint`, `debugging`).

**When registration is skipped:** on the server, when neither `document.modelContext` nor `navigator.modelContext` exists (the factory is not called then), and for a name that is already taken. A registration the browser rejects (for example an invalid name) is logged as a warning and does not break app startup.

## toolResult and toolError

```typescript
execute: async () => toolResult({ count: 3 });
execute: async () => {
  throw toolError('Something went wrong');
};
```

In the current draft the browser turns the resolved value into JSON and treats a rejected promise as a failed call. So `toolResult` returns its argument unchanged and `toolError` creates an `Error` that you throw. The helpers keep tool code readable and give one place to change if the draft's result format changes. Data must be JSON serializable.

## Security

Agents read tool descriptions and results as trusted text. Do not put user-written content into descriptions, and mark tools that return such content with `annotations.untrustedContentHint`.

## API Reference

See the [TypeDoc API reference](/api/@dasch-ng/webmcp/README).

## License

MIT
