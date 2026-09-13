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

### Worker setup

`pdf.js` runs the actual PDF parsing in a Web Worker. The worker needs to be reachable at runtime. The library does **not** bundle the worker file — `pdfjs-dist` ships it as part of its npm package, and your application decides how to serve it.

#### Default — jsDelivr CDN (zero config)

If you do nothing, `PdfViewerComponent` configures `GlobalWorkerOptions.workerSrc` to:

```text
https://cdn.jsdelivr.net/npm/pdfjs-dist@<version>/legacy/build/pdf.worker.min.mjs
```

This works out of the box and is convenient for prototypes, but means each visitor's browser issues a third-party request to jsDelivr. For production apps that care about GDPR, offline support, or stable version pinning, self-host the worker instead.

#### Self-host the worker (recommended for production) {#self-host}

Step 1 — copy the worker file into your application build via your Angular app's `angular.json` assets array:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              {
                "glob": "pdf.worker.min.mjs",
                "input": "node_modules/pdfjs-dist/legacy/build",
                "output": "assets/pdfjs"
              }
            ]
          }
        }
      }
    }
  }
}
```

(If you're on the new `@angular/build:application` builder, the `assets` array has the same shape.)

Step 2 — point the component at that URL **before** the first `PdfViewerComponent` is instantiated. The simplest place is `main.ts`, right before `bootstrapApplication(...)`:

```typescript
// main.ts
(window as any).pdfWorkerSrc = '/assets/pdfjs/pdf.worker.min.mjs';

bootstrapApplication(AppComponent, { providers: [...] });
```

Or in `index.html` before Angular boots:

```html
<script>
  window.pdfWorkerSrc = '/assets/pdfjs/pdf.worker.min.mjs';
</script>
```

Now the worker is served from your own origin. No third-party requests, no CDN dependency, version is whatever you have installed in `node_modules/pdfjs-dist`.

#### Version-pinned override

If you need to support multiple pdfjs versions side-by-side (rare), use the version-keyed property:

```typescript
(window as any)['pdfWorkerSrc5.6.205'] = '/assets/pdfjs/pdf.worker-5.6.205.min.mjs';
```

The component reads `pdfWorkerSrc<currentPdfJsVersion>` first, then falls back to plain `pdfWorkerSrc`, then to the CDN.

#### Why isn't the worker shipped inside `@dasch-ng/pdf-viewer`?

`pdfjs-dist` is already declared as a `dependency` of `@dasch-ng/pdf-viewer`, so the worker file is always present in your `node_modules` tree. Re-shipping it inside our package would mean storing the same binary twice and forcing a fixed pdfjs version on consumers. The asset-copy approach above gives you control over the version and the deployment path.

## Examples

### Render a PDF from a remote URL

```typescript
import { Component, signal } from '@angular/core';
import { PdfViewerComponent } from '@dasch-ng/pdf-viewer';

@Component({
  selector: 'app-remote-pdf',
  imports: [PdfViewerComponent],
  template: ` <pdf-viewer [src]="pdfSrc()" [render-text]="true" [original-size]="false" style="display: block; width: 100%; height: 600px;" /> `,
})
export class RemotePdfComponent {
  pdfSrc = signal('https://dasch.ng/demos/pdf-viewer/assets/pdf-test.pdf');
}
```

### Render a local file picked by the user

```typescript
import { Component, signal } from '@angular/core';
import { PdfViewerComponent, PDFSource } from '@dasch-ng/pdf-viewer';

@Component({
  selector: 'app-local-pdf',
  imports: [PdfViewerComponent],
  template: `
    <input type="file" accept="application/pdf" (change)="onFile($event)" />
    @if (pdfSrc()) {
      <pdf-viewer [src]="pdfSrc()!" style="display:block; width:100%; height:600px;" />
    }
  `,
})
export class LocalPdfComponent {
  pdfSrc = signal<string | Uint8Array | PDFSource | null>(null);

  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.pdfSrc.set(e.target?.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  }
}
```

### React to load completion and progress

```typescript
import { Component, signal } from '@angular/core';
import { PdfViewerComponent, PDFDocumentProxy, PDFProgressData } from '@dasch-ng/pdf-viewer';

@Component({
  selector: 'app-pdf-events',
  imports: [PdfViewerComponent],
  template: `
    <pdf-viewer
      [src]="'/assets/sample.pdf'"
      (after-load-complete)="onLoaded($event)"
      (on-progress)="onProgress($event)"
      style="display:block; width:100%; height:600px;"
    />
    <p>Pages: {{ numPages() ?? '…' }} — Loaded: {{ progress() }}%</p>
  `,
})
export class PdfEventsComponent {
  numPages = signal<number | null>(null);
  progress = signal(0);

  onLoaded(pdf: PDFDocumentProxy) {
    this.numPages.set(pdf.numPages);
  }

  onProgress(data: PDFProgressData) {
    if (data.total) this.progress.set(Math.round((data.loaded / data.total) * 100));
  }
}
```

### Bind page navigation to a signal

```typescript
import { Component, signal } from '@angular/core';
import { PdfViewerComponent } from '@dasch-ng/pdf-viewer';

@Component({
  selector: 'app-pdf-paginated',
  imports: [PdfViewerComponent],
  template: `
    <button (click)="page.set(page() - 1)">Prev</button>
    <button (click)="page.set(page() + 1)">Next</button>
    <pdf-viewer [src]="'/assets/sample.pdf'" [page]="page()" [show-all]="false" style="display:block; width:100%; height:600px;" />
  `,
})
export class PdfPaginatedComponent {
  page = signal(1);
}
```

A working playground combining all of the above is available at the [live demo](/demos/pdf-viewer/).

## Credits

This library is a fork of [`ng2-pdf-viewer`](https://github.com/VadimDez/ng2-pdf-viewer) by **Vadym Yatsyuk** ([@VadimDez](https://github.com/VadimDez)) and its many contributors.

The Angular 21 / pdfjs-dist 5 / signals upgrade was contributed by **Luqman-Ud-Din Muhammad** in [VadimDez/ng2-pdf-viewer#1228](https://github.com/VadimDez/ng2-pdf-viewer/pull/1228).

Full upstream git history was preserved when importing this library into the monorepo.

## License

[MIT](https://github.com/dasch-ng/dasch-ng/blob/main/libs/ng/pdf-viewer/LICENSE.md)
