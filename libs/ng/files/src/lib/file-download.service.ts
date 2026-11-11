import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { download, parseContentDisposition } from '@dasch-ng/web-utils';
import { from, map, Observable, switchMap, throwError } from 'rxjs';

/** Error emitted when the server answers with an HTML page instead of a file. */
export class UnexpectedHtmlResponseError extends Error {
  constructor(readonly url: string) {
    super(`Expected a file from ${url} but received an HTML page`);
    this.name = 'UnexpectedHtmlResponseError';
  }
}

/**
 * Downloads a URL through `HttpClient` (so interceptors, e.g. for auth headers, apply)
 * and saves it with the browser's download mechanism.
 *
 * @example
 * ```typescript
 * inject(FileDownloadService).download('/api/report').subscribe((filename) => console.log(filename));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  private readonly http = inject(HttpClient);

  /**
   * Fetches `url` and saves the response as a file. The file name comes from `filename`,
   * else from `Content-Disposition`, else from the last URL segment.
   *
   * The returned observable emits the used file name once and completes. HTTP errors and
   * HTML responses (an error page that is not marked as attachment) are emitted as errors
   * and nothing is saved.
   */
  download(url: string, filename?: string): Observable<string> {
    return this.http.get(url, { observe: 'response', responseType: 'blob' }).pipe(
      switchMap((response) => {
        const disposition = parseContentDisposition(response.headers.get('Content-Disposition'));
        const blob = response.body as Blob;
        if (disposition?.type !== 'attachment' && blob.type.toLowerCase().startsWith('text/html')) {
          return throwError(() => new UnexpectedHtmlResponseError(url));
        }
        const name = filename ?? (disposition?.filename && baseName(disposition.filename)) ?? fileNameFromUrl(url);
        return from(download(blob, name)).pipe(map(() => name));
      }),
    );
  }
}

/** Strips path separators, as `parseContentDisposition` leaves them in. */
function baseName(name: string): string {
  return name.split(/[\\/]/).pop() ?? '';
}

function fileNameFromUrl(url: string): string {
  const path = url.split(/[?#]/)[0];
  const segment = baseName(path.replace(/[\\/]+$/, ''));
  try {
    return decodeURIComponent(segment) || 'download';
  } catch {
    return segment || 'download';
  }
}
