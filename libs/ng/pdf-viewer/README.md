# @dasch-ng/pdf-viewer

Angular standalone component for rendering PDF documents with [pdf.js](https://mozilla.github.io/pdf.js/). Drop-in replacement for [`ng2-pdf-viewer`](https://github.com/VadimDez/ng2-pdf-viewer) updated for Angular 21+, the signals API, zoneless change detection, and `pdfjs-dist` 5.

📚 **Full documentation:** [dasch.ng/libraries/pdf-viewer](https://dasch.ng/libraries/pdf-viewer)
🎮 **Live demo:** [dasch.ng/demos/pdf-viewer/](https://dasch.ng/demos/pdf-viewer/)
🔗 **API reference:** [dasch.ng/api/@dasch-ng/pdf-viewer/](https://dasch.ng/api/@dasch-ng/pdf-viewer/)

## Install

```bash
npm install @dasch-ng/pdf-viewer
# or
bun add @dasch-ng/pdf-viewer
```

## Quick start

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

Only the package name changes. Template API (selector, attributes, events) is preserved:

```diff
- import { PdfViewerComponent } from 'ng2-pdf-viewer';
+ import { PdfViewerComponent } from '@dasch-ng/pdf-viewer';
```

If you are migrating from the v10 `PdfViewerModule`, switch to the standalone `PdfViewerComponent`:

```diff
- import { PdfViewerModule } from 'ng2-pdf-viewer';
+ import { PdfViewerComponent } from '@dasch-ng/pdf-viewer';
```

## Worker location

`pdf.js` parses PDFs in a Web Worker. The worker file is shipped by `pdfjs-dist` (which is a transitive dependency of this library) — it is **not** bundled into `@dasch-ng/pdf-viewer` itself.

**Default (zero config):** the component loads the worker from `https://cdn.jsdelivr.net/npm/pdfjs-dist@<version>/legacy/build/pdf.worker.min.mjs`. Fine for prototyping but a third-party request — for GDPR/offline-friendly production, self-host instead.

**Self-host (recommended for production):**

1. Add the worker file to your app's `angular.json` `assets`:

   ```json
   {
     "glob": "pdf.worker.min.mjs",
     "input": "node_modules/pdfjs-dist/legacy/build",
     "output": "assets/pdfjs"
   }
   ```

2. Point the component at it before bootstrap, e.g. in `main.ts`:

   ```typescript
   (window as any).pdfWorkerSrc = '/assets/pdfjs/pdf.worker.min.mjs';
   bootstrapApplication(AppComponent, { providers: [...] });
   ```

See the [docs site](https://dasch.ng/libraries/pdf-viewer#self-host) for the version-pinned override variant and the full rationale.

## Credits

Fork of [`ng2-pdf-viewer`](https://github.com/VadimDez/ng2-pdf-viewer) by **Vadym Yatsyuk** ([@VadimDez](https://github.com/VadimDez)) and its many contributors. The Angular 21 / pdfjs-dist 5 / signals upgrade was contributed by **Luqman-Ud-Din Muhammad** in [VadimDez/ng2-pdf-viewer#1228](https://github.com/VadimDez/ng2-pdf-viewer/pull/1228). Full upstream git history is preserved in this monorepo.

## License

[MIT](./LICENSE.md)
