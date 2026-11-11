import { DestroyRef, Directive, ElementRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileDownloadService } from './file-download.service';

/**
 * Downloads the link target through {@link FileDownloadService} instead of navigating.
 * The URL is the `href` of the anchor unless `fileDownload` is set to another URL.
 * Links that the service refuses (other origins, see `FILE_DOWNLOAD_ALLOWED_ORIGINS`) are left alone
 * and navigate normally.
 *
 * @example
 * ```html
 * <a href="/api/report" fileDownload (fileDownloadError)="showError($event)">Report</a>
 * ```
 */
@Directive({
  selector: 'a[fileDownload]',
  host: {
    '(click)': 'onClick($event)',
    '[attr.aria-busy]': 'downloading() || null',
  },
})
export class FileDownloadDirective {
  private readonly service = inject(FileDownloadService);
  private readonly element = inject<ElementRef<HTMLAnchorElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  /** URL to download. Empty means the `href` of the anchor. */
  readonly fileDownload = input<string>('');
  /** File name that wins over the one the server sends. */
  readonly fileDownloadName = input<string>();
  /** Emits the saved file name. */
  readonly fileDownloaded = output<string>();
  /** Emits when the request failed or the response was an HTML page. */
  readonly fileDownloadError = output<unknown>();

  /** `true` while a download is running. */
  readonly downloading = signal(false);

  protected onClick(event: MouseEvent): void {
    const url = this.fileDownload() || this.element.getAttribute('href');
    // Not downloadable through HttpClient (e.g. cross-origin): let the browser follow the link.
    if (!url || !this.service.isAllowed(url)) {
      return;
    }
    event.preventDefault();
    if (this.downloading()) {
      return;
    }
    this.downloading.set(true);
    this.service
      .download(url, this.fileDownloadName())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (name) => this.fileDownloaded.emit(name),
        error: (error) => {
          this.downloading.set(false);
          this.fileDownloadError.emit(error);
        },
        complete: () => this.downloading.set(false),
      });
  }
}
