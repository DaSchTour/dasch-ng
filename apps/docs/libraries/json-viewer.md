# JSON Viewer

A modern Angular JSON formatter and viewer component with interactive tree view, syntax highlighting, and circular reference detection.

## Installation

```bash
npm install @dasch-ng/json-viewer
```

or with bun:

```bash
bun add @dasch-ng/json-viewer
```

## Features

- 🌲 **Interactive Tree View** - Expand and collapse JSON nodes
- 🎨 **Syntax Highlighting** - Type-specific color coding for better readability
- 🔄 **Circular Reference Detection** - Safely handles circular references in objects
- 📦 **Standalone Component** - No module imports required
- 🎯 **Fully Typed** - Complete TypeScript support with proper type inference
- 🎨 **Customizable Theming** - Easy styling with CSS variables
- 🚀 **Modern Angular** - Built for Angular 21+ with signal-based inputs

## Basic Usage

Import the standalone component directly in your component:

```typescript
import { Component } from '@angular/core';
import { JsonViewerComponent } from '@dasch-ng/json-viewer';

@Component({
  selector: 'app-example',
  imports: [JsonViewerComponent],
  template: ` <json-viewer [json]="data" /> `,
})
export class ExampleComponent {
  data = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    hobbies: ['reading', 'coding', 'gaming'],
    address: {
      street: '123 Main St',
      city: 'Boston',
      zipCode: '02101',
    },
  };
}
```

## Configuration

### Expand All Nodes by Default

Control whether nodes are expanded or collapsed initially:

```html
<json-viewer [json]="data" [expanded]="true" />
```

### Collapse All Nodes Initially

Start with all nodes collapsed for large JSON structures:

```html
<json-viewer [json]="data" [expanded]="false" />
```

### Limit Expansion Depth

Control how deep the tree should expand automatically:

```html
<!-- Expand only top 3 levels -->
<json-viewer [json]="data" [depth]="3" />

<!-- Expand all levels (default) -->
<json-viewer [json]="data" [depth]="-1" />
```

## API

### Component Inputs

| Input      | Type      | Default  | Description                                      |
| ---------- | --------- | -------- | ------------------------------------------------ |
| `json`     | `unknown` | required | The JSON data to display                         |
| `expanded` | `boolean` | `true`   | Whether to expand all nodes by default           |
| `depth`    | `number`  | `-1`     | Maximum depth to expand (-1 for unlimited depth) |

## Theming

The component is fully customizable using CSS variables. Override these variables in your global styles or component styles:

### Example Theme

```css
json-viewer {
  --ngx-json-font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
  --ngx-json-font-size: 14px;

  /* Value colors */
  --ngx-json-string: #22863a;
  --ngx-json-number: #005cc5;
  --ngx-json-boolean: #d73a49;
  --ngx-json-date: #6f42c1;
  --ngx-json-null: #6a737d;
  --ngx-json-null-bg: #ffeef0;
  --ngx-json-undefined: #6a737d;

  /* Structure colors */
  --ngx-json-array: #24292e;
  --ngx-json-object: #24292e;
  --ngx-json-function: #6f42c1;

  /* UI colors */
  --ngx-json-key: #005cc5;
  --ngx-json-separator: #24292e;
  --ngx-json-value: #24292e;
  --ngx-json-toggler: #586069;
  --ngx-json-undefined-key: #959da5;
}
```

### Available CSS Variables

| Variable                   | Description           | Default     |
| -------------------------- | --------------------- | ----------- |
| `--ngx-json-font-family`   | Font family           | `monospace` |
| `--ngx-json-font-size`     | Font size             | `1em`       |
| `--ngx-json-string`        | String value color    | `#FF6B6B`   |
| `--ngx-json-number`        | Number value color    | `#009688`   |
| `--ngx-json-boolean`       | Boolean value color   | `#B938A4`   |
| `--ngx-json-date`          | Date value color      | `#05668D`   |
| `--ngx-json-null`          | Null value color      | `#fff`      |
| `--ngx-json-null-bg`       | Null background color | `red`       |
| `--ngx-json-undefined`     | Undefined value color | `#fff`      |
| `--ngx-json-array`         | Array label color     | `#999`      |
| `--ngx-json-object`        | Object label color    | `#999`      |
| `--ngx-json-function`      | Function value color  | `#999`      |
| `--ngx-json-key`           | Key color             | `#4E187C`   |
| `--ngx-json-separator`     | Separator color       | `#999`      |
| `--ngx-json-value`         | Default value color   | `#000`      |
| `--ngx-json-toggler`       | Expand/collapse color | `#787878`   |
| `--ngx-json-undefined-key` | Undefined key color   | `#999`      |

## Common Use Cases

### Debug API Responses

Perfect for displaying API responses during development:

```typescript
import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonViewerComponent } from '@dasch-ng/json-viewer';

@Component({
  selector: 'app-api-debug',
  imports: [JsonViewerComponent],
  template: `
    <h2>API Response</h2>
    <json-viewer [json]="response()" [depth]="2" />
  `,
})
export class ApiDebugComponent {
  response = signal(null);

  constructor(private http: HttpClient) {
    this.http.get('/api/users').subscribe((data) => {
      this.response.set(data);
    });
  }
}
```

### Display Configuration Objects

Show application configuration in a readable format:

```typescript
@Component({
  template: `
    <h3>App Configuration</h3>
    <json-viewer [json]="config" [expanded]="false" />
  `,
})
export class ConfigViewerComponent {
  config = {
    api: {
      baseUrl: 'https://api.example.com',
      timeout: 5000,
      retries: 3,
    },
    features: {
      darkMode: true,
      analytics: false,
    },
  };
}
```

### Inspect Complex State Objects

View complex state management objects from stores:

```typescript
import { Component, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { JsonViewerComponent } from '@dasch-ng/json-viewer';

@Component({
  selector: 'app-state-inspector',
  imports: [JsonViewerComponent],
  template: `
    <h2>Application State</h2>
    <json-viewer [json]="state()" [depth]="3" />
  `,
})
export class StateInspectorComponent {
  state = computed(() => this.store.selectSignal((state) => state));

  constructor(private store: Store) {}
}
```

## Type Safety

The component accepts `unknown` type for the JSON input, making it flexible for any data:

```typescript
// Works with any type
interface User {
  id: number;
  name: string;
  metadata: Record<string, unknown>;
}

@Component({
  template: `<json-viewer [json]="user" />`,
})
export class UserViewerComponent {
  user: User = {
    id: 1,
    name: 'John',
    metadata: { lastLogin: new Date() },
  };
}
```

## Handling Special Values

The component gracefully handles various JavaScript values:

```typescript
const specialValues = {
  // Primitives
  string: 'Hello World',
  number: 42,
  boolean: true,
  null: null,
  undefined: undefined,

  // Complex types
  date: new Date(),
  array: [1, 2, 3],
  object: { nested: { value: 'deep' } },
  function: () => console.log('functions are shown'),

  // Circular reference (handled safely)
  circular: {},
};

specialValues.circular = specialValues;
```

## Credits

This library is a maintained fork of [ngx-json-viewer](https://github.com/hivivo/ngx-json-viewer) by hivivo, modernized for Angular 21+ with:

- Standalone components architecture
- Signal-based inputs for better performance
- Modern TypeScript patterns
- Updated dependencies and peer dependencies
- Improved type safety

## API Reference

For complete API documentation including all types and interfaces, see the [JSON Viewer API Reference](../api/@dasch-ng/json-viewer/README).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/json-viewer).

## License

MIT
