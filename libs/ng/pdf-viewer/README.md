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

The pdf.js worker defaults to a jsDelivr CDN URL matching the bundled `pdfjs-dist` version. To self-host or override:

```typescript
// global override
(window as any).pdfWorkerSrc = '/assets/pdf.worker.min.mjs';

// version-pinned override
(window as any)['pdfWorkerSrc5.6.205'] = '/assets/pdf.worker-5.6.205.min.mjs';
```

## Credits

Fork of [`ng2-pdf-viewer`](https://github.com/VadimDez/ng2-pdf-viewer) by **Vadym Yatsyuk** ([@VadimDez](https://github.com/VadimDez)) and its many contributors. The Angular 21 / pdfjs-dist 5 / signals upgrade was contributed by **Luqman-Ud-Din Muhammad** in [VadimDez/ng2-pdf-viewer#1228](https://github.com/VadimDez/ng2-pdf-viewer/pull/1228). Full upstream git history is preserved in this monorepo.

## License

[MIT](./LICENSE.md)
