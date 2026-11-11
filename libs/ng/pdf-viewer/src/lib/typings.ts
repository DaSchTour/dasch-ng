/** A single page of a pdf.js document. */
export type PDFPageProxy = import('pdfjs-dist/types/src/display/api').PDFPageProxy;
/** Document parameters accepted by pdf.js `getDocument`, such as `url`, `data`, `httpHeaders` or `withCredentials`. Can be passed to the `src` input. */
export type PDFSource = import('pdfjs-dist/types/src/display/api').DocumentInitParameters;
/** A loaded pdf.js document, emitted by `after-load-complete`. */
export type PDFDocumentProxy = import('pdfjs-dist/types/src/display/api').PDFDocumentProxy;
/** The pdf.js task that loads a document. */
export type PDFDocumentLoadingTask = import('pdfjs-dist/types/src/display/api').PDFDocumentLoadingTask;
/** Options of the pdf.js `PDFViewer`. */
export type PDFViewerOptions = import('pdfjs-dist/types/web/pdf_viewer').PDFViewerOptions;

/** Loading progress, emitted by `on-progress`. */
export interface PDFProgressData {
  /** Bytes loaded so far. */
  loaded: number;
  /** Total bytes, when known. */
  total: number;
}

/** How pages are scaled to the container: by `'page-height'`, `'page-width'` or to fit the whole page (`'page-fit'`). Used by the `zoom-scale` input. */
export type ZoomScale = 'page-height' | 'page-fit' | 'page-width';
