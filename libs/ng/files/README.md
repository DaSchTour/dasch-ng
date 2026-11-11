# @dasch-ng/files

File handling for Angular: download files through `HttpClient`, drop zones and a form control for file inputs. Builds on `@dasch-ng/web-utils`.

## Installation

```bash
npm install @dasch-ng/files
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/forms`, `@dasch-ng/web-utils`, `rxjs`.

## Usage

```typescript
import { FileDownloadDirective, FileDropDirective, FileSelectDirective } from '@dasch-ng/files';

@Component({
  imports: [FileDownloadDirective, FileDropDirective, FileSelectDirective, ReactiveFormsModule],
  template: `
    <a href="/api/report" fileDownload (fileDownloadError)="onError($event)">Download</a>

    <div fileDrop accept="image/*,.pdf" (filesDropped)="upload($event)">Drop files here</div>

    <input type="file" multiple fileSelect [formControl]="files" />
  `,
})
export class ExampleComponent {}
```

- `FileDownloadService.download(url, filename?)`: fetches the URL, names the file from `Content-Disposition` (fallback: last URL segment) and saves it. Errors, including an HTML page instead of a file, arrive in the observable and nothing is saved.
- `[fileDownload]` on `<a>`: uses the service instead of navigating.
- `[fileDrop]`: drop zone with `data-drag-over` attribute and `dragOver()` signal, emits `File[]`, optional `accept`.
- `input[type=file][fileSelect]`: `ControlValueAccessor` with `File | null` (single) or `File[]` (`multiple`).

See the [documentation](https://dasch.ng/libraries/files) for details.

## License

MIT
