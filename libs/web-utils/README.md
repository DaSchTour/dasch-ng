# @dasch-ng/web-utils

A collection of utility functions for common web development tasks including SVG conversion, file downloads, and file handling.

[![npm version](https://img.shields.io/npm/v/@dasch-ng/web-utils.svg)](https://www.npmjs.com/package/@dasch-ng/web-utils)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Installation

```bash
npm install @dasch-ng/web-utils
```

## Functions

### `convertSvgToImage(svgString, format?)`

Converts an SVG string to a raster image (PNG or JPEG) using HTML5 Canvas.

**Parameters:**

- `svgString`: The SVG markup as a string
- `format` (optional): The output image format, either `'png'` or `'jpeg'`. Defaults to `'png'`

**Returns:** A Promise that resolves to a Blob containing the raster image data, or null if conversion fails

**Example:**

```typescript
import { convertSvgToImage } from '@dasch-ng/web-utils';

const svgString = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>';
const blob = await convertSvgToImage(svgString, 'png');
if (blob) {
  const url = URL.createObjectURL(blob);
  // Use the URL for download or display
}
```

---

### `download(data, filename, type?)`

Triggers a browser download for the given data with automatic cleanup of object URLs.

**Parameters:**

- `data`: The data to download, either as a string or Blob
- `filename`: The name of the file to be downloaded
- `type` (optional): MIME type for the Blob (e.g., `'text/plain'`, `'application/json'`)

**Returns:** A Promise that resolves when the download has been triggered

**Example:**

```typescript
import { download } from '@dasch-ng/web-utils';

// Download a text file
await download('Hello, World!', 'greeting.txt', 'text/plain');

// Download JSON data
const data = { name: 'John', age: 30 };
await download(JSON.stringify(data, null, 2), 'data.json', 'application/json');

// Download a Blob (e.g., an image)
const blob = await convertSvgToImage(svgString);
if (blob) {
  await download(blob, 'image.png', 'image/png');
}
```

---

### `createFileArray(files)`

Converts a single File or FileList to an array of File objects for easier processing.

**Parameters:**

- `files`: A single File object or a FileList from an input element

**Returns:** An array containing the File object(s)

**Example:**

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

// Works with both single and multiple file inputs
const singleFile = new File(['content'], 'test.txt');
const fileArray = createFileArray(singleFile); // [File]
```

## Usage Patterns

### SVG to Image Download

```typescript
import { convertSvgToImage, download } from '@dasch-ng/web-utils';

const svgElement = document.querySelector('svg');
const svgString = new XMLSerializer().serializeToString(svgElement);

const blob = await convertSvgToImage(svgString, 'png');
if (blob) {
  await download(blob, 'chart.png', 'image/png');
}
```

### Processing Multiple Files

```typescript
import { createFileArray, download } from '@dasch-ng/web-utils';

const input = document.querySelector('input[type="file"]') as HTMLInputElement;
input.addEventListener('change', async () => {
  const files = createFileArray(input.files!);

  for (const file of files) {
    const text = await file.text();
    const processed = text.toUpperCase();
    await download(processed, `processed-${file.name}`, 'text/plain');
  }
});
```

### Export Data as File

```typescript
import { download } from '@dasch-ng/web-utils';

// Export application state as JSON
function exportState(state: object) {
  const json = JSON.stringify(state, null, 2);
  return download(json, 'app-state.json', 'application/json');
}

// Export CSV data
function exportCsv(data: string[][]) {
  const csv = data.map((row) => row.join(',')).join('\n');
  return download(csv, 'data.csv', 'text/csv');
}
```

## Development

### Building

Run `nx build web-utils` to build the library.

### Running unit tests

Run `nx test web-utils` to execute the unit tests via [Vitest](https://vitest.dev/).

## License

MIT
