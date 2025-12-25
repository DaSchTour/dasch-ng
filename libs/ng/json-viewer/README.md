# @dasch-ng/json-viewer

JSON formatter and viewer for Angular

> **Note:** This library is a maintained fork of [hivivo/ngx-json-viewer](https://github.com/hivivo/ngx-json-viewer), updated for modern Angular versions with standalone components and signal-based inputs.

## Features

- 🌲 Interactive tree view for JSON data
- 🎨 Type-specific syntax highlighting
- 🔄 Circular reference detection
- 📦 Standalone component (no module required)
- 🎯 Fully typed with TypeScript
- 🎨 Customizable theming with CSS variables
- 🚀 Modern Angular (v21+) with signals

## Installation

```bash
npm install @dasch-ng/json-viewer
```

or

```bash
bun add @dasch-ng/json-viewer
```

## Usage

### Basic Usage

Since this is a standalone component, you can import it directly in your component:

```typescript
import { Component } from '@angular/core';
import { JsonViewerComponent } from '@dasch-ng/json-viewer';

@Component({
  selector: 'app-root',
  imports: [JsonViewerComponent],
  template: ` <json-viewer [json]="data" /> `,
})
export class AppComponent {
  data = {
    name: 'John Doe',
    age: 30,
    hobbies: ['reading', 'coding'],
  };
}
```

### Configuration Options

#### Collapse all nodes initially

```html
<json-viewer [json]="data" [expanded]="false" />
```

#### Limit expansion depth

```html
<json-viewer [json]="data" [depth]="3" />
```

### API

| Input      | Type      | Default  | Description                                |
| ---------- | --------- | -------- | ------------------------------------------ |
| `json`     | `unknown` | required | The JSON data to display                   |
| `expanded` | `boolean` | `true`   | Whether to expand all nodes by default     |
| `depth`    | `number`  | `-1`     | Maximum depth to expand (-1 for unlimited) |

## Theming

Customize the appearance using CSS variables. You can override these in your global styles or component styles:

```css
json-viewer {
  --ngx-json-font-family: 'Monaco', 'Courier New', monospace;
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

| Variable                   | Description                | Default     |
| -------------------------- | -------------------------- | ----------- |
| `--ngx-json-font-family`   | Font family                | `monospace` |
| `--ngx-json-font-size`     | Font size                  | `1em`       |
| `--ngx-json-string`        | String value color         | `#FF6B6B`   |
| `--ngx-json-number`        | Number value color         | `#009688`   |
| `--ngx-json-boolean`       | Boolean value color        | `#B938A4`   |
| `--ngx-json-date`          | Date value color           | `#05668D`   |
| `--ngx-json-null`          | Null value color           | `#fff`      |
| `--ngx-json-null-bg`       | Null background color      | `red`       |
| `--ngx-json-undefined`     | Undefined value color      | `#fff`      |
| `--ngx-json-array`         | Array label color          | `#999`      |
| `--ngx-json-object`        | Object label color         | `#999`      |
| `--ngx-json-function`      | Function value color       | `#999`      |
| `--ngx-json-key`           | Key color                  | `#4E187C`   |
| `--ngx-json-separator`     | Separator color            | `#999`      |
| `--ngx-json-value`         | Default value color        | `#000`      |
| `--ngx-json-toggler`       | Expand/collapse icon color | `#787878`   |
| `--ngx-json-undefined-key` | Undefined key color        | `#999`      |

## Credits

This library is based on [ngx-json-viewer](https://github.com/hivivo/ngx-json-viewer) by hivivo, modernized for Angular 21+ with:

- Standalone components
- Signal-based inputs
- Modern TypeScript patterns
- Updated dependencies

## License

MIT
