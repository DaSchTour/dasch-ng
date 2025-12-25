# Web Utils

Utility functions for common web development tasks. This library provides helpers for SVG conversion, file downloads, and file handling that work in any modern browser environment.

## Installation

```bash
npm install @dasch-ng/web-utils
```

## Available Functions

### convertSvgToImage

Converts an SVG string to a raster image (PNG or JPEG) using HTML5 Canvas.

**Use case:** Export SVG graphics (charts, diagrams, icons) as raster images for download or sharing.

**Note:** This function uses UTF-8 safe base64 encoding, so it correctly handles SVG content with international characters (e.g., Chinese, Russian, emoji).

#### Example

```typescript
import { convertSvgToImage } from '@dasch-ng/web-utils';

const svgString = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>';
const blob = await convertSvgToImage(svgString, 'png');
if (blob) {
  const url = URL.createObjectURL(blob);
  // Use the URL for download or display
}
```

[View API Documentation →](../api/@dasch-ng/web-utils/README)

---

### download

Triggers a browser download for the given data with automatic cleanup of object URLs.

**Use case:** Programmatically trigger file downloads for generated content, exports, or reports.

#### Example

```typescript
import { download } from '@dasch-ng/web-utils';

// Download a text file
await download('Hello, World!', 'greeting.txt', 'text/plain');

// Download JSON data
const data = { name: 'John', age: 30 };
await download(JSON.stringify(data, null, 2), 'data.json', 'application/json');
```

[View API Documentation →](../api/@dasch-ng/web-utils/README)

---

### createFileArray

Converts a single File or FileList to an array of File objects for easier processing.

**Use case:** Normalize file input handling to always work with arrays, regardless of single or multiple file selection.

#### Example

```typescript
import { createFileArray } from '@dasch-ng/web-utils';

// Handle file input change event
const input = document.querySelector('input[type="file"]') as HTMLInputElement;
input.addEventListener('change', (event) => {
  const files = createFileArray(input.files!);
  files.forEach((file) => {
    console.log(`File: ${file.name}, Size: ${file.size} bytes`);
  });
});
```

[View API Documentation →](../api/@dasch-ng/web-utils/README)

---

## Common Patterns

### Export SVG Chart as Image

A common pattern for exporting SVG charts or graphics to downloadable images:

```typescript
import { convertSvgToImage, download } from '@dasch-ng/web-utils';

async function exportChart(svgElement: SVGElement) {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const blob = await convertSvgToImage(svgString, 'png');

  if (blob) {
    await download(blob, 'chart.png', 'image/png');
  }
}

// Usage
const chart = document.querySelector('#myChart') as SVGElement;
exportChart(chart);
```

### Process Multiple File Uploads

Handle multiple file uploads with consistent array processing:

```typescript
import { createFileArray, download } from '@dasch-ng/web-utils';

async function processFiles(input: HTMLInputElement) {
  const files = createFileArray(input.files!);

  for (const file of files) {
    const text = await file.text();
    const processed = text.toUpperCase();
    await download(processed, `processed-${file.name}`, 'text/plain');
  }
}

// Usage with file input
const input = document.querySelector('input[type="file"]') as HTMLInputElement;
input.addEventListener('change', () => processFiles(input));
```

### Export Application Data

Export application state or data as downloadable files:

```typescript
import { download } from '@dasch-ng/web-utils';

// Export as JSON
function exportState(state: object) {
  const json = JSON.stringify(state, null, 2);
  return download(json, 'app-state.json', 'application/json');
}

// Export as CSV
function exportCsv(data: string[][]) {
  const csv = data.map((row) => row.join(',')).join('\n');
  return download(csv, 'data.csv', 'text/csv');
}

// Export as text
function exportLogs(logs: string[]) {
  const text = logs.join('\n');
  return download(text, 'logs.txt', 'text/plain');
}
```

### Combined SVG and File Workflow

Combine SVG conversion with file handling for complex workflows:

```typescript
import { convertSvgToImage, createFileArray, download } from '@dasch-ng/web-utils';

async function processSvgFiles(input: HTMLInputElement) {
  const files = createFileArray(input.files!);

  for (const file of files) {
    if (file.type === 'image/svg+xml') {
      const svgString = await file.text();
      const blob = await convertSvgToImage(svgString, 'png');

      if (blob) {
        const newName = file.name.replace('.svg', '.png');
        await download(blob, newName, 'image/png');
      }
    }
  }
}
```

## Browser Support

All functions require a modern browser with support for:

- HTML5 Canvas API
- Blob and URL.createObjectURL
- File API
- Promises and async/await

Supported browsers:

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## API Reference

For complete API documentation with all parameters and return types, see the [API Reference](../api/@dasch-ng/web-utils/README).

## Source Code

View the source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/web-utils).

## Contributing

Found a bug or want to contribute? Check out the [contributing guidelines](https://github.com/DaSchTour/dasch-ng/blob/main/CONTRIBUTING.md).
