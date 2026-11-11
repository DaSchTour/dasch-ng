/**
 * Created by vadimdez on 21/06/16.
 */
/* eslint-disable @angular-eslint/no-input-rename, @angular-eslint/no-output-rename, @angular-eslint/no-output-on-prefix, @angular-eslint/no-output-native -- legacy ng2-pdf-viewer API surface preserved for drop-in compatibility */
import {
  Component,
  ElementRef,
  OnChanges,
  SimpleChanges,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  NgZone,
  inject,
  output,
  viewChild,
  input,
  booleanAttribute,
  ChangeDetectionStrategy,
} from '@angular/core';
import { from, fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import * as PDFJS from 'pdfjs-dist';
import * as PDFJSViewer from 'pdfjs-dist/web/pdf_viewer.mjs';

import { createEventBus } from './utils/event-bus-utils';
import { assign, isSSR } from './utils/helpers';

import type { PDFSource, PDFPageProxy, PDFProgressData, PDFDocumentProxy, PDFDocumentLoadingTask, PDFViewerOptions, ZoomScale } from './typings';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

// @ts-expect-error Polyfill check — withResolvers is missing in older runtimes
if (typeof Promise.withResolvers === 'undefined' && typeof globalThis !== 'undefined') {
  // @ts-expect-error Polyfill assignment — withResolvers may not exist on the target Promise
  globalThis.Promise.withResolvers = () => {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

/** Text layer mode, used with the `renderTextMode` input (template alias `render-text-mode`). */
export enum RenderTextMode {
  /** No text layer is rendered, so text cannot be selected. */
  DISABLED,
  /** Renders a text layer so text can be selected and searched. */
  ENABLED,
  /** Renders an enhanced text layer (pdf.js text layer mode 2), which also supports interactive content such as form fields. */
  ENHANCED,
}

function validRotation(value: number): number {
  if (typeof value !== 'number' || value % 90 !== 0) {
    console.warn('Invalid pages rotation angle.');
    return 0;
  }
  return value;
}

function validZoom(value: number): number {
  if (typeof value !== 'number' || value <= 0) {
    console.warn('Invalid zoom value; must be a positive number.');
    return 1;
  }
  return value;
}

function pageTransform(value: unknown): number {
  const n = parseInt(value as string, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * Displays a PDF document using pdf.js. All pages are shown in a scrollable list by default, or a single page with `show-all` set to `false`.
 * Inputs and outputs keep the kebab-case names of the ng2-pdf-viewer API in templates; the alias is noted on each member.
 *
 * @example
 * ```html
 * <pdf-viewer [src]="'/assets/sample.pdf'" [page]="page" (pageChange)="page = $event" [zoom]="1.2" (after-load-complete)="onLoaded($event)"></pdf-viewer>
 * ```
 */
@Component({
  selector: 'pdf-viewer',
  template: `
    <div #pdfViewerContainer class="ng2-pdf-viewer-container">
      <div class="pdfViewer"></div>
    </div>
  `,
  // Explicit so the behaviour is the same on Angular 21, where the default is still Eager.
  // The template has no bindings (pdf.js renders imperatively), so OnPush only skips needless checks.
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnChanges, OnInit, OnDestroy, AfterViewChecked {
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private ngZone = inject(NgZone);

  /** Ratio between CSS pixels (96 dpi) and PDF points (72 dpi). */
  static CSS_UNITS = 96.0 / 72.0;
  /** Page border width in CSS pixels, taken into account when sizing pages while `show-borders` is on. */
  static BORDER_WIDTH = 9;

  private _page = 1;

  readonly pdfViewerContainer = viewChild.required<ElementRef<HTMLDivElement>>('pdfViewerContainer');

  public eventBus!: PDFJSViewer.EventBus;
  public pdfLinkService!: PDFJSViewer.PDFLinkService;
  public pdfFindController!: PDFJSViewer.PDFFindController;
  public pdfViewer!: PDFJSViewer.PDFViewer | PDFJSViewer.PDFSinglePageViewer;

  private isVisible = false;

  private static readonly DEFAULT_C_MAPS_URL = typeof PDFJS !== 'undefined' ? `https://unpkg.com/pdfjs-dist@${(PDFJS as any).version}/cmaps/` : undefined;
  private _imageResourcesPath = typeof PDFJS !== 'undefined' ? `https://unpkg.com/pdfjs-dist@${(PDFJS as any).version}/web/images/` : undefined;
  private _pdf: PDFDocumentProxy | undefined;
  private lastLoaded!: string | Uint8Array | PDFSource | null;
  private _latestScrolledPage!: number;

  private pageScrollTimeout: number | null = null;
  private isInitialized = false;
  private loadingTask?: PDFDocumentLoadingTask | null;
  private destroy$ = new Subject<void>();

  /** Emits the loaded pdf.js document once it has been parsed. Template alias: `after-load-complete`. */
  readonly afterLoadComplete = output<PDFDocumentProxy>({ alias: 'after-load-complete' });
  /** Emits when a page has been rendered. Template alias: `page-rendered`. */
  readonly pageRendered = output<CustomEvent>({ alias: 'page-rendered' });
  /** Emits when the pages have been initialized, before they are rendered. Template alias: `pages-initialized` (note the plural; the field name is `pageInitialized`). */
  readonly pageInitialized = output<CustomEvent>({ alias: 'pages-initialized' });
  /** Emits when the text layer of a page has been rendered. Template alias: `text-layer-rendered`. */
  readonly textLayerRendered = output<CustomEvent>({ alias: 'text-layer-rendered' });
  /** Emits when loading the document fails. Template alias: `error`. */
  readonly onError = output<any>({ alias: 'error' });
  /** Emits loading progress while the document is downloaded. Template alias: `on-progress`. */
  readonly onProgress = output<PDFProgressData>({ alias: 'on-progress' });
  /** Emits the page number when the viewer corrects `page` to a valid value, or when the user scrolls to another page. Together with the `page` input it supports `[(page)]`. */
  readonly pageChange = output<number>();
  /** The PDF to show: a URL, binary data, or a pdf.js document parameters object (see `PDFSource`). Changing it loads the new document. */
  readonly src = input<string | Uint8Array | PDFSource>();
  /** Page number to show, starting at 1. Values that cannot be parsed or are below 1 become 1, and values above the page count are clamped (reported through `pageChange`). Defaults to `1`. */
  readonly page = input(1, { transform: pageTransform });
  /** Base URL of the pdf.js character maps (CMaps), needed for some CJK or legacy fonts. Template alias: `c-maps-url`. Defaults to the pdfjs-dist version on unpkg. */
  readonly cMapsUrl = input(PdfViewerComponent.DEFAULT_C_MAPS_URL, { alias: 'c-maps-url' });
  /** Whether to render the text layer, which makes text selectable and searchable. Template alias: `render-text`. Defaults to `true`. */
  readonly renderText = input(true, { alias: 'render-text' });
  /** Text layer mode used when `render-text` is on, see `RenderTextMode`. Template alias: `render-text-mode`. Defaults to `RenderTextMode.ENABLED`. */
  readonly renderTextMode = input(RenderTextMode.ENABLED, { alias: 'render-text-mode' });
  /** Whether pages are shown at their original size. When `false`, pages are scaled to the container width according to `zoom-scale`. Template alias: `original-size`. Defaults to `true`. */
  readonly originalSize = input(true, { alias: 'original-size' });
  /** Whether to show all pages in a scrollable list (`true`) or only the current page (`false`). Template alias: `show-all`. Defaults to `true`. */
  readonly showAll = input(true, { alias: 'show-all' });
  /** Whether the viewer keeps the page given by `page` in view after zooming or resizing. Template alias: `stick-to-page`. Defaults to `false`. */
  readonly stickToPage = input(false, { alias: 'stick-to-page' });
  /** How pages are scaled to the container when `original-size` is `false`: `'page-width'`, `'page-height'` or `'page-fit'` (see `ZoomScale`). The `zoom` factor is applied on top. Template alias: `zoom-scale`. Defaults to `'page-width'`. */
  readonly zoomScale = input<ZoomScale>('page-width', { alias: 'zoom-scale' });

  /** Zoom factor, `1` meaning 100 percent. Values that are not a positive number log a warning and fall back to `1`. */
  readonly zoom = input(1, { transform: validZoom });
  /** Rotation of all pages in degrees, a multiple of 90. Other values log a warning and fall back to `0`. Defaults to `0`. */
  readonly rotation = input(0, { transform: validRotation });
  /** Where links to external URLs open: `'blank'`, `'none'`, `'self'`, `'parent'` or `'top'` (see `getLinkTarget`). Template alias: `external-link-target`. Defaults to `'blank'`. */
  readonly externalLinkTarget = input('blank', { alias: 'external-link-target' });

  /** Whether the pages are resized when the container or window size changes. Accepts a boolean attribute. Defaults to `true`. */
  readonly autoresize = input(true, { transform: booleanAttribute });
  /** Whether pages wider than the container are scaled down to fit it, even with `original-size` on. Accepts a boolean attribute. Template alias: `fit-to-page`. Defaults to `false`. */
  readonly fitToPage = input(false, { alias: 'fit-to-page', transform: booleanAttribute });
  /** Whether to draw a border around each page. Accepts a boolean attribute. Template alias: `show-borders`. Defaults to `false`. */
  readonly showBorders = input(false, { alias: 'show-borders', transform: booleanAttribute });

  /**
   * Maps a link target name to the matching pdf.js `LinkTarget` value.
   *
   * @param type One of `'blank'`, `'none'`, `'self'`, `'parent'` or `'top'`.
   * @returns The pdf.js link target, or `null` for an unknown name.
   */
  static getLinkTarget(type: string) {
    switch (type) {
      case 'blank':
        return (PDFJSViewer as any).LinkTarget.BLANK;
      case 'none':
        return (PDFJSViewer as any).LinkTarget.NONE;
      case 'self':
        return (PDFJSViewer as any).LinkTarget.SELF;
      case 'parent':
        return (PDFJSViewer as any).LinkTarget.PARENT;
      case 'top':
        return (PDFJSViewer as any).LinkTarget.TOP;
    }

    return null;
  }

  constructor() {
    if (isSSR()) {
      return;
    }

    let pdfWorkerSrc: string;

    const pdfJsVersion: string = (PDFJS as any).version;
    const versionSpecificPdfWorkerUrl: string = (window as any)[`pdfWorkerSrc${pdfJsVersion}`];

    if (versionSpecificPdfWorkerUrl) {
      pdfWorkerSrc = versionSpecificPdfWorkerUrl;
    } else if (
      Object.prototype.hasOwnProperty.call(window, 'pdfWorkerSrc') &&
      typeof (window as any).pdfWorkerSrc === 'string' &&
      (window as any).pdfWorkerSrc
    ) {
      pdfWorkerSrc = (window as any).pdfWorkerSrc;
    } else {
      pdfWorkerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfJsVersion}/legacy/build/pdf.worker.min.mjs`;
    }

    assign(GlobalWorkerOptions, 'workerSrc', pdfWorkerSrc);
  }

  ngAfterViewChecked(): void {
    if (this.isInitialized) {
      return;
    }

    const offset = this.pdfViewerContainer().nativeElement.offsetParent;

    if (this.isVisible === true && offset == null) {
      this.isVisible = false;
      return;
    }

    if (this.isVisible === false && offset != null) {
      this.isVisible = true;

      setTimeout(() => {
        this.initialize();
        this.ngOnChanges({ src: this.src(), page: this.page() } as any);
      });
    }
  }

  ngOnInit() {
    this.initialize();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.clear();
    this.destroy$.next();
    this.loadingTask = null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (isSSR() || !this.isVisible) {
      return;
    }

    if ('src' in changes) {
      this.loadPDF();
    } else if (this._pdf) {
      if ('renderText' in changes || 'showAll' in changes) {
        this.setupViewer();
        this.resetPdfDocument();
      }
      if ('page' in changes) {
        this.handlePageChange();
      }

      this.update();
    }
  }

  private handlePageChange(): void {
    const requested = this.page();
    const clamped = this.getValidPageNumber(requested);
    if (clamped !== this._page) {
      this._page = clamped;
      if (clamped !== requested) {
        this.pageChange.emit(clamped);
      }
      if (clamped !== this._latestScrolledPage) {
        this.pdfViewer.scrollPageIntoView({ pageNumber: clamped });
      }
    }
  }

  public updateSize() {
    from(this._pdf!.getPage(this.pdfViewer.currentPageNumber))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page: PDFPageProxy) => {
          const rotation = this.rotation() + page.rotate;
          const viewportWidth =
            page.getViewport({
              scale: this.zoom(),
              rotation,
            }).width * PdfViewerComponent.CSS_UNITS;
          let scale = this.zoom();
          let stickToPage = true;

          // Scale the document when it shouldn't be in original size or doesn't fit into the viewport
          if (!this.originalSize() || (this.fitToPage() && viewportWidth > this.pdfViewerContainer().nativeElement.clientWidth)) {
            const viewPort = page.getViewport({ scale: 1, rotation });
            scale = this.getScale(viewPort.width, viewPort.height);
            stickToPage = !this.stickToPage();
          }

          this.pdfViewer.currentScale = scale;
          if (stickToPage && page.pageNumber !== this._latestScrolledPage)
            this.pdfViewer.scrollPageIntoView({ pageNumber: page.pageNumber, ignoreDestinationZoom: true });
        },
      });
  }

  public clear() {
    if (this.loadingTask && !this.loadingTask.destroyed) {
      this.loadingTask.destroy();
    }

    if (this._pdf) {
      this._latestScrolledPage = 0;
      this._pdf = undefined;
    }

    if (this.pdfViewer) this.pdfViewer.setDocument(null as any);
    if (this.pdfLinkService) this.pdfLinkService.setDocument(null, null);
    if (this.pdfFindController) this.pdfFindController.setDocument(null as any);
  }

  private getPDFLinkServiceConfig() {
    const linkTarget = PdfViewerComponent.getLinkTarget(this.externalLinkTarget());

    if (linkTarget) {
      return { externalLinkTarget: linkTarget };
    }

    return {};
  }

  private initEventBus() {
    this.eventBus = createEventBus(PDFJSViewer, this.destroy$);

    fromEvent<CustomEvent>(this.eventBus, 'pagerendered')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.pageRendered.emit(event);
      });

    fromEvent<CustomEvent>(this.eventBus, 'pagesinit')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.pageInitialized.emit(event);
      });

    fromEvent(this.eventBus, 'pagechanging')
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ pageNumber }: any) => {
        if (this.pageScrollTimeout) {
          clearTimeout(this.pageScrollTimeout);
        }

        this.pageScrollTimeout = window.setTimeout(() => {
          this._latestScrolledPage = pageNumber;
          this.pageChange.emit(pageNumber);
        }, 100);
      });

    fromEvent<CustomEvent>(this.eventBus, 'textlayerrendered')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.textLayerRendered.emit(event);
      });
  }

  private initPDFServices() {
    this.pdfLinkService = new PDFJSViewer.PDFLinkService({
      eventBus: this.eventBus,
      ...this.getPDFLinkServiceConfig(),
    });
    this.pdfFindController = new PDFJSViewer.PDFFindController({
      eventBus: this.eventBus,
      linkService: this.pdfLinkService,
    });
  }

  private getPDFOptions(): PDFViewerOptions {
    return {
      eventBus: this.eventBus,
      container: this.element.nativeElement.querySelector('div')!,
      removePageBorders: !this.showBorders(),
      linkService: this.pdfLinkService,
      textLayerMode: this.renderText() ? this.renderTextMode() : RenderTextMode.DISABLED,
      findController: this.pdfFindController,
      l10n: new PDFJSViewer.GenericL10n('en'),
      imageResourcesPath: this._imageResourcesPath,
      annotationEditorMode: PDFJS.AnnotationEditorType.DISABLE,
    };
  }

  private setupViewer() {
    if (this.pdfViewer) {
      this.pdfViewer.setDocument(null as any);
    }

    this.initPDFServices();

    if (this.showAll()) {
      this.pdfViewer = new PDFJSViewer.PDFViewer(this.getPDFOptions());
    } else {
      this.pdfViewer = new PDFJSViewer.PDFSinglePageViewer(this.getPDFOptions());
    }
    this.pdfLinkService.setViewer(this.pdfViewer);

    this.pdfViewer._currentPageNumber = this._page;
  }

  private getValidPageNumber(page: number): number {
    if (page < 1) {
      return 1;
    }

    if (page > this._pdf!.numPages) {
      return this._pdf!.numPages;
    }

    return page;
  }

  private getDocumentParams() {
    const srcType = typeof this.src();

    if (!this.cMapsUrl()) {
      return this.src();
    }

    const params: any = {
      cMapUrl: this.cMapsUrl(),
      cMapPacked: true,
      enableXfa: true,
    };
    params.isEvalSupported = false; // http://cve.org/CVERecord?id=CVE-2024-4367

    if (srcType === 'string') {
      params.url = this.src();
    } else if (srcType === 'object') {
      if ((this.src() as any).byteLength !== undefined) {
        params.data = this.src();
      } else {
        Object.assign(params, this.src());
      }
    }

    return params;
  }

  private loadPDF() {
    const srcValue = this.src();
    if (!srcValue) {
      return;
    }

    if (this.lastLoaded === srcValue) {
      this.update();
      return;
    }

    this.clear();

    this.setupViewer();

    this.loadingTask = getDocument(this.getDocumentParams());

    this.loadingTask!.onProgress = (progressData: PDFProgressData) => {
      this.onProgress.emit(progressData);
    };

    const src = srcValue;

    from(this.loadingTask!.promise as Promise<PDFDocumentProxy>)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdf) => {
          this._pdf = pdf;
          this.lastLoaded = src;

          this.afterLoadComplete.emit(pdf);
          this.resetPdfDocument();

          this.update();
        },
        error: (error) => {
          this.lastLoaded = null;
          this.onError.emit(error);
        },
      });
  }

  private update() {
    this.render();
  }

  private render() {
    const clamped = this.getValidPageNumber(this.page());
    if (clamped !== this._page) {
      this._page = clamped;
      this.pageChange.emit(clamped);
    }

    if (this.rotation() !== 0 || this.pdfViewer.pagesRotation !== this.rotation()) {
      // wait until at least the first page is available.
      this.pdfViewer.firstPagePromise?.then(() => (this.pdfViewer.pagesRotation = this.rotation()));
    }

    if (this.stickToPage()) {
      setTimeout(() => {
        if (this.pdfViewer.currentPageNumber !== this._page) {
          this.pdfViewer.currentPageNumber = this._page;
        }
      });
    }

    if (!this.pdfViewer._pages?.length) {
      // the first time we wait until pages init
      const sub = this.pageInitialized.subscribe(() => {
        this.updateSize();
        sub.unsubscribe();
      });
    } else {
      this.updateSize();
    }
  }

  private getScale(viewportWidth: number, viewportHeight: number) {
    const borderSize = this.showBorders() ? 2 * PdfViewerComponent.BORDER_WIDTH : 0;
    const pdfContainerWidth = this.pdfViewerContainer().nativeElement.clientWidth - borderSize;
    const pdfContainerHeight = this.pdfViewerContainer().nativeElement.clientHeight - borderSize;

    if (pdfContainerHeight === 0 || viewportHeight === 0 || pdfContainerWidth === 0 || viewportWidth === 0) {
      return 1;
    }

    let ratio: number;
    switch (this.zoomScale()) {
      case 'page-fit':
        ratio = Math.min(pdfContainerHeight / viewportHeight, pdfContainerWidth / viewportWidth);
        break;
      case 'page-height':
        ratio = pdfContainerHeight / viewportHeight;
        break;
      case 'page-width':
      default:
        ratio = pdfContainerWidth / viewportWidth;
        break;
    }

    return (this.zoom() * ratio) / PdfViewerComponent.CSS_UNITS;
  }

  private resetPdfDocument() {
    this.pdfLinkService.setDocument(this._pdf, null);
    this.pdfFindController.setDocument(this._pdf!);
    this.pdfViewer.setDocument(this._pdf!);
  }

  private initialize(): void {
    if (isSSR() || !this.isVisible) {
      return;
    }

    this.isInitialized = true;
    this.initEventBus();
    this.setupViewer();
  }

  private setupResizeListener(): void {
    if (isSSR()) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(100),
          filter(() => this.autoresize() && !!this._pdf),
          takeUntil(this.destroy$),
        )
        .subscribe(() => {
          this.updateSize();
        });
    });
  }
}
