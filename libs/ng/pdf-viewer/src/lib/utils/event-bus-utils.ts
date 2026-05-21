import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import type { EventBus } from 'pdfjs-dist/web/pdf_viewer.mjs';

export function createEventBus(pdfJsViewer: any, destroy$: Subject<void>) {
  const globalEventBus: EventBus = new pdfJsViewer.EventBus();
  attachDOMEventsToEventBus(globalEventBus, destroy$);
  return globalEventBus;
}

function attachDOMEventsToEventBus(eventBus: EventBus, destroy$: Subject<void>): void {
  fromEvent(eventBus, 'documentload')
    .pipe(takeUntil(destroy$))
    .subscribe(() => {
      window.dispatchEvent(new CustomEvent('documentload', { bubbles: true, cancelable: true, detail: {} }));
    });

  fromEvent(eventBus, 'pagerendered')
    .pipe(takeUntil(destroy$))
    .subscribe(({ pageNumber, cssTransform, source }: any) => {
      source.div.dispatchEvent(new CustomEvent('pagerendered', { bubbles: true, cancelable: true, detail: { pageNumber, cssTransform } }));
    });

  fromEvent(eventBus, 'textlayerrendered')
    .pipe(takeUntil(destroy$))
    .subscribe(({ pageNumber, source }: any) => {
      source.textLayerDiv?.dispatchEvent(new CustomEvent('textlayerrendered', { bubbles: true, cancelable: true, detail: { pageNumber } }));
    });

  fromEvent(eventBus, 'pagechanging')
    .pipe(takeUntil(destroy$))
    .subscribe(({ pageNumber, source }: any) => {
      const event = new Event('pagechanging', { bubbles: true, cancelable: true }) as Event & { pageNumber?: number };
      event.pageNumber = pageNumber;
      source.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'pagesinit')
    .pipe(takeUntil(destroy$))
    .subscribe(({ source }: any) => {
      source.container.dispatchEvent(new CustomEvent('pagesinit', { bubbles: true, cancelable: true, detail: null }));
    });

  fromEvent(eventBus, 'pagesloaded')
    .pipe(takeUntil(destroy$))
    .subscribe(({ pagesCount, source }: any) => {
      source.container.dispatchEvent(new CustomEvent('pagesloaded', { bubbles: true, cancelable: true, detail: { pagesCount } }));
    });

  fromEvent(eventBus, 'scalechange')
    .pipe(takeUntil(destroy$))
    .subscribe(({ scale, presetValue, source }: any) => {
      const event = new Event('scalechange', { bubbles: true, cancelable: true }) as Event & { scale?: number; presetValue?: string };
      event.scale = scale;
      event.presetValue = presetValue;
      source.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'updateviewarea')
    .pipe(takeUntil(destroy$))
    .subscribe(({ location, source }: any) => {
      const event = new Event('updateviewarea', { bubbles: true, cancelable: true }) as Event & { location?: unknown };
      event.location = location;
      source.container.dispatchEvent(event);
    });

  fromEvent(eventBus, 'find')
    .pipe(takeUntil(destroy$))
    .subscribe(({ source, type, query, phraseSearch, caseSensitive, highlightAll, findPrevious }: any) => {
      if (source === window) {
        return; // event comes from FirefoxCom, no need to replicate
      }
      window.dispatchEvent(
        new CustomEvent('find' + type, {
          bubbles: true,
          cancelable: true,
          detail: { query, phraseSearch, caseSensitive, highlightAll, findPrevious },
        }),
      );
    });

  fromEvent(eventBus, 'attachmentsloaded')
    .pipe(takeUntil(destroy$))
    .subscribe(({ attachmentsCount, source }: any) => {
      source.container.dispatchEvent(new CustomEvent('attachmentsloaded', { bubbles: true, cancelable: true, detail: { attachmentsCount } }));
    });

  fromEvent(eventBus, 'sidebarviewchanged')
    .pipe(takeUntil(destroy$))
    .subscribe(({ view, source }: any) => {
      source.outerContainer.dispatchEvent(new CustomEvent('sidebarviewchanged', { bubbles: true, cancelable: true, detail: { view } }));
    });

  fromEvent(eventBus, 'pagemode')
    .pipe(takeUntil(destroy$))
    .subscribe(({ mode, source }: any) => {
      source.pdfViewer.container.dispatchEvent(new CustomEvent('pagemode', { bubbles: true, cancelable: true, detail: { mode } }));
    });

  fromEvent(eventBus, 'namedaction')
    .pipe(takeUntil(destroy$))
    .subscribe(({ action, source }: any) => {
      source.pdfViewer.container.dispatchEvent(new CustomEvent('namedaction', { bubbles: true, cancelable: true, detail: { action } }));
    });

  fromEvent(eventBus, 'presentationmodechanged')
    .pipe(takeUntil(destroy$))
    .subscribe(({ active, switchInProgress }: any) => {
      window.dispatchEvent(new CustomEvent('presentationmodechanged', { bubbles: true, cancelable: true, detail: { active, switchInProgress } }));
    });

  fromEvent(eventBus, 'outlineloaded')
    .pipe(takeUntil(destroy$))
    .subscribe(({ outlineCount, source }: any) => {
      source.container.dispatchEvent(new CustomEvent('outlineloaded', { bubbles: true, cancelable: true, detail: { outlineCount } }));
    });
}
