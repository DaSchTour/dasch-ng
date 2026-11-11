# Web Utils

Utility functions for common web development tasks. This library provides helpers for SVG conversion, file downloads, file handling, URL slugs and URL redaction that work in any modern browser environment, without framework dependencies.

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

---

### parseContentDisposition

Parses a `Content-Disposition` header (RFC 6266): quoted values with escapes, unquoted tokens and `filename*=UTF-8''…`, which wins over `filename`. Returns `{ type, filename?, parameters }` or `null` for an empty header.

**Use case:** Name a file downloaded with `fetch` the way the server suggests.

#### Example

```typescript
import { download, parseContentDisposition } from '@dasch-ng/web-utils';

const response = await fetch('/api/reports/42');
const { filename } = parseContentDisposition(response.headers.get('Content-Disposition')) ?? {};
await download(await response.blob(), filename ?? 'report');

parseContentDisposition(`attachment; filename*=UTF-8''%E2%82%AC%20rates.pdf`)?.filename; // '€ rates.pdf'
```

The file name is not sanitized; strip path separators before using it as a path.

[View API Documentation →](../api/@dasch-ng/web-utils/README)

---

### fileTypeOf

Classifies a file name or `File` by extension as `'video'`, `'image'`, `'audio'`, `'document'`, `'spreadsheet'` or `'archive'`, or `null`. The patterns are exported as `FILE_TYPE_PATTERNS`.

**Use case:** Pick an icon or a preview for an upload list. The extension says nothing about the content, so it is no security check.

#### Example

```typescript
import { fileTypeOf } from '@dasch-ng/web-utils';

fileTypeOf('Interview_Take3.MOV'); // 'video'
fileTypeOf(input.files[0]); // e.g. 'image'
fileTypeOf('notes'); // null
```

[View API Documentation →](../api/@dasch-ng/web-utils/README)

---

### fuzzySearch

Filters a list with a case- and diacritic-insensitive "contains" match that also accepts one typo (queries under 3 letters get no typo tolerance). Exact matches come first, then plain matches, then typo matches; the original order is kept within each group. An empty query returns all items.

**Use case:** Search boxes over small, in-memory lists. For large lists or ranking by relevance, use a dedicated search library.

#### Example

```typescript
import { fuzzySearch } from '@dasch-ng/web-utils';

fuzzySearch('cafe', ['Tea', 'Café', 'Cafeteria']); // ['Café', 'Cafeteria']
fuzzySearch('Zuerich', ['Zürich', 'Bern']); // ['Zürich'] (one typo)
fuzzySearch('ann', users, { keys: ['firstName', 'email'] }); // objects: search the given properties
```

[View API Documentation →](../api/@dasch-ng/web-utils/README)

---

### toSlug

Turns text into a URL slug of `[a-z0-9-]`: lowercased, accents removed, German umlauts written out (`ü` → `ue`), separators collapsed, cut at a word boundary. NFC and NFD spellings give the same slug.

**Options:** `maxLength` (default `80`), `fallback` (used when no Latin letters or digits are left), `expandUmlauts` (default `true`).

#### Example

```typescript
import { toSlug } from '@dasch-ng/web-utils';

toSlug('Grüne Wälder über Köln'); // 'gruene-waelder-ueber-koeln'
toSlug('Café au Łódź'); // 'cafe-au-lodz'
toSlug('Grün', { expandUmlauts: false }); // 'grun'
toSlug('東京', { fallback: 'item-42' }); // 'item-42'
```

[View API Documentation →](../api/@dasch-ng/web-utils/README)

---

### redactUrl

Removes secret query parameters (OAuth `code`/`state`, tokens, client secrets; exported as `SECRET_URL_PARAMS`) and the fragment from an absolute http(s) URL. Other strings come back unchanged.

**Use case:** Clean page URLs before they go to analytics, error tracking or logs.

#### Example

```typescript
import { redactUrl, SECRET_URL_PARAMS } from '@dasch-ng/web-utils';

redactUrl('https://example.com/callback?code=abc&lang=de#access_token=x');
// 'https://example.com/callback?lang=de'

redactUrl(url, { params: [...SECRET_URL_PARAMS, 'email'], keepHash: true });
```

[View API Documentation →](../api/@dasch-ng/web-utils/README)

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
