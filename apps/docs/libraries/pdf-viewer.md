# PDF Viewer

Angular standalone component for rendering PDF documents with [pdf.js](https://mozilla.github.io/pdf.js/). Drop-in replacement for [`ng2-pdf-viewer`](https://github.com/VadimDez/ng2-pdf-viewer) updated for Angular 21+, the signals API, zoneless change detection, and pdfjs-dist 5.

## Live Demo

Try the component in your browser: [Open Demo →](/demos/pdf-viewer/)

## Installation

```bash
npm install @dasch-ng/pdf-viewer
```

or with bun:

```bash
bun add @dasch-ng/pdf-viewer
```

## Features

- 📦 **Standalone component** - No NgModule, just import where needed
- 🎯 **Signals API** - All inputs/outputs as Angular signals (Angular 21+)
- 🪶 **Zoneless ready** - Works with `provideZonelessChangeDetection()`
- 🔍 **Drop-in compatible** - Matches the `ng2-pdf-viewer` template API
- 🎨 **Configurable** - Page, zoom, rotation, text rendering, link targets, fit-to-page
- 📡 **Events** - Load progress, page render, page change, errors
- 🌐 **CDN worker** - PDF worker auto-loaded from jsDelivr (overridable)

## Basic Usage

```typescript
import { Component } from '@angular/core';
import { PdfViewerComponent } from '@dasch-ng/pdf-viewer';

@Component({
  selector: 'app-pdf',
  imports: [PdfViewerComponent],
  template: ` <pdf-viewer [src]="'/assets/sample.pdf'" [render-text]="true" [original-size]="false" style="width: 100%; height: 600px;" /> `,
})
export class PdfComponent {}
```

## Migration from `ng2-pdf-viewer`

Only the package name changes. Template API (selector, attributes, events) is preserved.

```diff
- import { PdfViewerComponent } from 'ng2-pdf-viewer';
+ import { PdfViewerComponent } from '@dasch-ng/pdf-viewer';
```

## API Reference

See the generated [API reference](/api/@dasch-ng/pdf-viewer/) for the complete list of inputs, outputs, and types.

### Inputs (selected)

| Input                  | Type                                               | Default        | Description                                           |
| ---------------------- | -------------------------------------------------- | -------------- | ----------------------------------------------------- |
| `src`                  | `string \| Uint8Array \| PDFSource`                | —              | PDF source (URL, byte array, or pdf.js source object) |
| `page`                 | `number`                                           | `1`            | Current page number (1-based)                         |
| `zoom`                 | `number`                                           | `1`            | Zoom factor (must be > 0)                             |
| `zoom-scale`           | `'page-width' \| 'page-fit' \| 'page-height'`      | `'page-width'` | Zoom scaling mode                                     |
| `rotation`             | `number`                                           | `0`            | Rotation in degrees (multiples of 90)                 |
| `original-size`        | `boolean`                                          | `true`         | Render at original size, no auto-fit                  |
| `show-all`             | `boolean`                                          | `true`         | Show all pages vs. single page                        |
| `stick-to-page`        | `boolean`                                          | `false`        | Snap navigation to page boundaries                    |
| `render-text`          | `boolean`                                          | `true`         | Render selectable text layer                          |
| `render-text-mode`     | `RenderTextMode`                                   | `ENABLED`      | Text rendering mode                                   |
| `external-link-target` | `'blank' \| 'none' \| 'self' \| 'parent' \| 'top'` | `'blank'`      | Target for external links                             |
| `autoresize`           | `boolean`                                          | `true`         | Re-render on container resize                         |
| `fit-to-page`          | `boolean`                                          | `false`        | Fit page to viewport                                  |
| `show-borders`         | `boolean`                                          | `false`        | Show page borders                                     |
| `c-maps-url`           | `string`                                           | jsDelivr CDN   | CMaps URL for non-Latin fonts                         |

### Outputs

| Output                | Payload            | Description                          |
| --------------------- | ------------------ | ------------------------------------ |
| `after-load-complete` | `PDFDocumentProxy` | Fired when document finishes loading |
| `pages-initialized`   | `CustomEvent`      | Pages initialized in the viewer      |
| `page-rendered`       | `CustomEvent`      | Single page rendered                 |
| `text-layer-rendered` | `CustomEvent`      | Text layer rendered                  |
| `error`               | `unknown`          | Load or render error                 |
| `on-progress`         | `PDFProgressData`  | Download progress updates            |
| `pageChange`          | `number`           | Current page changed                 |

### Worker Customization

By default the component loads `pdf.worker.min.mjs` from jsDelivr matching the bundled `pdfjs-dist` version. Override globally before component instantiation:

```ts
(window as any).pdfWorkerSrc = '/assets/pdf.worker.min.mjs';
// Or version-pinned:
(window as any)['pdfWorkerSrc5.6.205'] = '/assets/pdf.worker-5.6.205.min.mjs';
```

## Credits

This library is a fork of [`ng2-pdf-viewer`](https://github.com/VadimDez/ng2-pdf-viewer) by **Vadym Yatsyuk** ([@VadimDez](https://github.com/VadimDez)) and its many contributors.

The Angular 21 / pdfjs-dist 5 / signals upgrade was contributed by **Luqman-Ud-Din Muhammad** in [VadimDez/ng2-pdf-viewer#1228](https://github.com/VadimDez/ng2-pdf-viewer/pull/1228).

Full upstream git history was preserved when importing this library into the monorepo.

## License

[MIT](https://github.com/dasch-ng/dasch-ng/blob/main/libs/ng/pdf-viewer/LICENSE.md)
