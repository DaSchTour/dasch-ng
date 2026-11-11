import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { download, parseContentDisposition } from '@dasch-ng/web-utils';
import { from, map, Observable, switchMap, throwError } from 'rxjs';

/** Error emitted when the server answers with an HTML page instead of a file. */
export class UnexpectedHtmlResponseError extends Error {
  constructor(readonly url: string) {
    super(`Expected a file from ${url} but received an HTML page`);
    this.name = 'UnexpectedHtmlResponseError';
  }
}

/** Error emitted for URLs that are not downloaded through `HttpClient` (other protocol, foreign origin). */
export class DisallowedDownloadUrlError extends Error {
  constructor(
    readonly url: string,
    reason: string,
  ) {
    super(`Refusing to download ${url}: ${reason}`);
    this.name = 'DisallowedDownloadUrlError';
  }
}

/**
 * Extra origins (for example `https://cdn.example.com`) that may be downloaded through
 * `HttpClient`. Empty by default, so only same-origin URLs are sent through the HTTP stack
 * (and its interceptors, which may add credentials).
 */
export const FILE_DOWNLOAD_ALLOWED_ORIGINS = new InjectionToken<readonly string[]>('FILE_DOWNLOAD_ALLOWED_ORIGINS', {
  factory: () => [],
});

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
  private readonly document = inject(DOCUMENT);
  private readonly allowedOrigins = inject(FILE_DOWNLOAD_ALLOWED_ORIGINS);

  /**
   * `true` for `http(s)` URLs on the document's origin or on an origin from
   * `FILE_DOWNLOAD_ALLOWED_ORIGINS`. Relative URLs resolve against the document.
   */
  isAllowed(url: string): boolean {
    return this.disallowedReason(url) === null;
  }

  private disallowedReason(url: string): string | null {
    let parsed: URL;
    try {
      parsed = new URL(url, this.document.baseURI);
    } catch {
      return 'not a valid URL';
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'only http and https URLs are supported';
    }
    if (parsed.origin !== this.document.location.origin && !this.allowedOrigins.includes(parsed.origin)) {
      return 'cross-origin URL (see FILE_DOWNLOAD_ALLOWED_ORIGINS)';
    }
    return null;
  }

  /**
   * Fetches `url` and saves the response as a file. The file name comes from `filename`,
   * else from `Content-Disposition`, else from the last URL segment.
   *
   * The returned observable emits the used file name once and completes. HTTP errors,
   * disallowed URLs (`DisallowedDownloadUrlError`) and HTML responses (an error page that is not marked as attachment) are emitted as errors
   * and nothing is saved.
   */
  download(url: string, filename?: string): Observable<string> {
    const reason = this.disallowedReason(url);
    if (reason) {
      return throwError(() => new DisallowedDownloadUrlError(url, reason));
    }
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
