# Files

File handling for Angular: download files through `HttpClient`, drop zones and a form control for file inputs. It wraps the framework-free helpers of [`@dasch-ng/web-utils`](/libraries/web-utils) (`download`, `parseContentDisposition`).

## Installation

```bash
npm install @dasch-ng/files
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/forms`, `@dasch-ng/web-utils`, `rxjs`.

## Features

- Download through `HttpClient`, so interceptors (for example auth headers) apply
- File name from `Content-Disposition`, with the last URL segment as fallback
- HTML error pages are reported as errors instead of being saved
- Drop zone with drag-over state and `accept` filter
- File input form control for reactive and template-driven forms
- Standalone, signal inputs and outputs

## FileDownloadService

```typescript
import { FileDownloadService } from '@dasch-ng/files';

export class ReportComponent {
  private readonly files = inject(FileDownloadService);

  save() {
    this.files.download('/api/report').subscribe({
      next: (filename) => console.log('saved', filename),
      error: (error) => console.error(error), // HttpErrorResponse or UnexpectedHtmlResponseError
    });
  }
}
```

The name is taken from the optional second argument, then from `Content-Disposition`, then from the last URL segment (`download` if there is none). Path separators are removed from names sent by the server. A response with `text/html` content that is not marked `attachment` fails with `UnexpectedHtmlResponseError`.

[View API Documentation →](../api/@dasch-ng/files/classes/FileDownloadService.html)

## fileDownload directive

```html
<a href="/api/report" fileDownload (fileDownloaded)="saved($event)" (fileDownloadError)="failed($event)">Report</a>
```

| Input / output        | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `fileDownload`        | URL, defaults to the `href` of the anchor                   |
| `fileDownloadName`    | File name that wins over the server's                       |
| `(fileDownloaded)`    | Emits the saved file name                                   |
| `(fileDownloadError)` | Emits the error                                             |
| `downloading()`       | Signal, `true` while running (also `aria-busy` on the link) |

## Security

`FileDownloadService` and `[fileDownload]` send requests through `HttpClient`, so an auth interceptor may attach credentials. Therefore only `http(s)` URLs on the page's own origin are downloaded. Other URLs fail with `DisallowedDownloadUrlError`; the directive does not intercept such links and the browser follows them normally. To allow more origins, provide `FILE_DOWNLOAD_ALLOWED_ORIGINS`:

```typescript
providers: [{ provide: FILE_DOWNLOAD_ALLOWED_ORIGINS, useValue: ['https://cdn.example.com'] }];
```

## fileDrop directive

```html
<div fileDrop accept="image/*,.pdf" (filesDropped)="upload($event)">Drop files here</div>
```

```css
[fileDrop][data-drag-over] {
  outline: 2px dashed currentColor;
}
```

`accept` uses the syntax of the native `accept` attribute (extensions, MIME types, `image/*`). Files that do not match are removed; nothing is emitted when none match. `dragOver()` is also available through `#zone="fileDrop"`.

## fileSelect directive

```html
<input type="file" fileSelect [formControl]="avatar" /> <input type="file" multiple fileSelect [(ngModel)]="attachments" />
```

The value is `File | null`, or `File[]` when the input has `multiple`. Browsers do not allow setting the files of an input from code, so writing `null` or `[]` resets the input and other values are not shown by it.

Signal forms are not supported: their `FormValueControl` contract needs a value the input cannot show.

[View API Documentation →](../api/@dasch-ng/files/classes/FileSelectDirective.html)

## API Reference

See the [API Reference](../api/@dasch-ng/files/). Source code on [GitHub](https://github.com/DaSchTour/dasch-ng/tree/main/libs/ng/files).
