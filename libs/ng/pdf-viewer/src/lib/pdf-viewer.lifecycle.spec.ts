import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';

const pdfjs = vi.hoisted(() => {
  class FakeEventBus {
    private readonly listeners = new Map<string, Set<(event: unknown) => void>>();

    on(name: string, listener: (event: unknown) => void) {
      if (!this.listeners.has(name)) {
        this.listeners.set(name, new Set());
      }
      this.listeners.get(name)!.add(listener);
    }

    off(name: string, listener: (event: unknown) => void) {
      this.listeners.get(name)?.delete(listener);
    }

    dispatch(name: string, event: unknown) {
      this.listeners.get(name)?.forEach((listener) => listener(event));
    }
  }

  const viewers: FakeViewer[] = [];

  class FakeViewer {
    readonly setDocument = vi.fn();
    readonly scrollPageIntoView = vi.fn();
    currentScale = 1;
    currentPageNumber = 1;
    pagesRotation = 0;
    _currentPageNumber = 1;
    _pages: unknown[] = [{}];
    firstPagePromise = Promise.resolve();

    constructor(readonly options: Record<string, unknown>) {
      viewers.push(this);
    }
  }

  class FakeSinglePageViewer extends FakeViewer {}

  class FakeLinkService {
    readonly setDocument = vi.fn();
    readonly setViewer = vi.fn();

    constructor(readonly options: Record<string, unknown>) {}
  }

  class FakeFindController {
    readonly setDocument = vi.fn();

    constructor(readonly options: Record<string, unknown>) {}
  }

  return {
    FakeEventBus,
    FakeViewer,
    FakeSinglePageViewer,
    FakeLinkService,
    FakeFindController,
    viewers,
    getDocument: vi.fn(),
  };
});

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: pdfjs.getDocument,
  version: '5.7.284',
  AnnotationEditorType: { DISABLE: 0 },
}));

vi.mock('pdfjs-dist/web/pdf_viewer.mjs', () => ({
  EventBus: pdfjs.FakeEventBus,
  PDFFindController: pdfjs.FakeFindController,
  PDFLinkService: pdfjs.FakeLinkService,
  PDFViewer: pdfjs.FakeViewer,
  PDFSinglePageViewer: pdfjs.FakeSinglePageViewer,
  GenericL10n: class {},
  LinkTarget: { NONE: 0, SELF: 1, BLANK: 2, PARENT: 3, TOP: 4 },
}));

import { PdfViewerComponent, RenderTextMode } from './pdf-viewer.component';

type FakeViewer = InstanceType<typeof pdfjs.FakeViewer>;

function createPage(pageNumber = 1) {
  return {
    pageNumber,
    rotate: 0,
    getViewport: ({ scale }: { scale: number }) => ({ width: 100 * scale, height: 200 * scale }),
  };
}

function createPdf(numPages = 5) {
  return {
    numPages,
    destroy: vi.fn(),
    getPage: vi.fn((pageNumber: number) => Promise.resolve(createPage(pageNumber))),
  };
}

function createLoadingTask(result: Promise<unknown>) {
  return {
    promise: result,
    destroyed: false,
    destroy: vi.fn(),
    onProgress: undefined as undefined | ((data: unknown) => void),
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('PdfViewerComponent lifecycle', () => {
  let fixture: ComponentFixture<PdfViewerComponent>;
  let component: PdfViewerComponent;
  let pdf: ReturnType<typeof createPdf>;
  let loadingTask: ReturnType<typeof createLoadingTask>;

  const viewer = (): FakeViewer => (component as any).pdfViewer;
  const container = (): HTMLDivElement => component.pdfViewerContainer().nativeElement;

  function setContainerSize(width: number, height: number) {
    vi.spyOn(container(), 'clientWidth', 'get').mockReturnValue(width);
    vi.spyOn(container(), 'clientHeight', 'get').mockReturnValue(height);
  }

  /** Renders the component and makes its container "visible", which triggers initialization and loading. */
  async function render(inputs: Record<string, unknown> = {}, setup?: (instance: PdfViewerComponent) => void) {
    fixture = TestBed.createComponent(PdfViewerComponent);
    component = fixture.componentInstance;
    setup?.(component);
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    fixture.detectChanges();

    Object.defineProperty(container(), 'offsetParent', { configurable: true, get: () => document.body });
    // OnPush: in a real app the parent view runs the view hooks; here the fixture has to be marked for check.
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await flush();
    await flush();
  }

  beforeEach(async () => {
    pdfjs.viewers.length = 0;
    pdf = createPdf();
    loadingTask = createLoadingTask(Promise.resolve(pdf));
    pdfjs.getDocument.mockReset();
    pdfjs.getDocument.mockImplementation(() => loadingTask);

    await TestBed.configureTestingModule({
      imports: [PdfViewerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  describe('static helpers and inputs', () => {
    it.each([
      ['blank', 2],
      ['none', 0],
      ['self', 1],
      ['parent', 3],
      ['top', 4],
      ['unknown', null],
    ])('should map link target %s', (type, expected) => {
      expect(PdfViewerComponent.getLinkTarget(type)).toBe(expected);
    });

    it('should sanitize page, zoom and rotation inputs', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture = TestBed.createComponent(PdfViewerComponent);
      component = fixture.componentInstance;

      fixture.componentRef.setInput('page', '3');
      fixture.componentRef.setInput('zoom', 2);
      fixture.componentRef.setInput('rotation', 180);
      expect([component.page(), component.zoom(), component.rotation()]).toEqual([3, 2, 180]);

      fixture.componentRef.setInput('page', 'abc');
      fixture.componentRef.setInput('zoom', -1);
      fixture.componentRef.setInput('rotation', 45);
      expect([component.page(), component.zoom(), component.rotation()]).toEqual([1, 1, 0]);
      expect(warn).toHaveBeenCalledTimes(2);
    });

    it('should pass byte arrays as data to pdf.js', () => {
      fixture = TestBed.createComponent(PdfViewerComponent);
      component = fixture.componentInstance;
      const data = new Uint8Array([1, 2, 3]);
      fixture.componentRef.setInput('src', data);

      expect((component as any).getDocumentParams()).toMatchObject({ data, cMapPacked: true, isEvalSupported: false });
    });
  });

  describe('visibility', () => {
    it('should not initialize or load while the container is hidden', async () => {
      fixture = TestBed.createComponent(PdfViewerComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('src', 'test.pdf');
      fixture.detectChanges();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await flush();

      expect(pdfjs.getDocument).not.toHaveBeenCalled();
      expect(pdfjs.viewers).toHaveLength(0);
    });

    it('should initialize and load the document once the container becomes visible', async () => {
      const loaded = vi.fn();

      await render({ src: 'test.pdf' }, (instance) => instance.afterLoadComplete.subscribe(loaded));

      expect(pdfjs.getDocument).toHaveBeenCalledWith(expect.objectContaining({ url: 'test.pdf' }));
      expect(loaded).toHaveBeenCalledWith(pdf);
      expect(viewer().setDocument).toHaveBeenCalledWith(pdf);
      expect((component as any).pdfLinkService.setDocument).toHaveBeenCalledWith(pdf, null);
      expect((component as any).pdfFindController.setDocument).toHaveBeenCalledWith(pdf);
    });

    it('should notice when the container becomes hidden again', async () => {
      await render();
      (component as any).isInitialized = false;
      Object.defineProperty(container(), 'offsetParent', { configurable: true, get: () => null });

      component.ngAfterViewChecked();

      expect((component as any).isVisible).toBe(false);
    });
  });

  describe('loading', () => {
    it('should configure the viewer from the inputs', async () => {
      await render({ src: 'test.pdf', 'show-borders': true, 'render-text': false, 'external-link-target': 'self' });

      expect(viewer()).toBeInstanceOf(pdfjs.FakeViewer);
      expect(viewer().options).toMatchObject({ removePageBorders: false, textLayerMode: RenderTextMode.DISABLED });
      expect((component as any).pdfLinkService.options).toMatchObject({ externalLinkTarget: 1 });
    });

    it('should use the single page viewer when not all pages are shown', async () => {
      await render({ src: 'test.pdf', 'show-all': false });

      expect(viewer()).toBeInstanceOf(pdfjs.FakeSinglePageViewer);
    });

    it('should emit loading progress', async () => {
      const progress = vi.fn();
      loadingTask = createLoadingTask(new Promise(() => undefined));

      await render({ src: 'test.pdf' }, (instance) => instance.onProgress.subscribe(progress));
      loadingTask.onProgress?.({ loaded: 1, total: 2 });

      expect(progress).toHaveBeenCalledWith({ loaded: 1, total: 2 });
    });

    it('should emit load errors and allow retrying the same source', async () => {
      const error = new Error('broken');
      loadingTask = createLoadingTask(Promise.reject(error));
      const onError = vi.fn();

      await render({ src: 'broken.pdf' }, (instance) => instance.onError.subscribe(onError));

      expect(onError).toHaveBeenCalledWith(error);
      expect((component as any).lastLoaded).toBeNull();

      loadingTask = createLoadingTask(Promise.resolve(pdf));
      component.ngOnChanges({ src: {} } as any);
      expect(pdfjs.getDocument).toHaveBeenCalledTimes(2);
    });

    it('should not reload a source that is already loaded', async () => {
      await render({ src: 'test.pdf' });

      component.ngOnChanges({ src: {} } as any);

      expect(pdfjs.getDocument).toHaveBeenCalledTimes(1);
    });

    it('should ignore an empty source', async () => {
      await render();

      expect(pdfjs.getDocument).not.toHaveBeenCalled();
    });
  });

  describe('updates', () => {
    it('should scroll to a changed page and clamp pages out of range', async () => {
      const pageChange = vi.fn();
      await render({ src: 'test.pdf' });
      component.pageChange.subscribe(pageChange);

      fixture.componentRef.setInput('page', 3);
      component.ngOnChanges({ page: {} } as any);
      expect(viewer().scrollPageIntoView).toHaveBeenCalledWith({ pageNumber: 3 });

      fixture.componentRef.setInput('page', 99);
      component.ngOnChanges({ page: {} } as any);
      expect(pageChange).toHaveBeenCalledWith(5);
      expect(viewer().scrollPageIntoView).toHaveBeenLastCalledWith({ pageNumber: 5 });
    });

    it('should rebuild the viewer when text rendering or page mode changes', async () => {
      await render({ src: 'test.pdf' });
      const previous = viewer();

      fixture.componentRef.setInput('render-text', false);
      component.ngOnChanges({ renderText: {} } as any);

      expect(viewer()).not.toBe(previous);
      expect(previous.setDocument).toHaveBeenLastCalledWith(null);
      expect(viewer().setDocument).toHaveBeenCalledWith(pdf);
    });

    it('should keep the original size by default', async () => {
      await render({ src: 'test.pdf', zoom: 1.5 });

      expect(viewer().currentScale).toBe(1.5);
    });

    it.each([
      ['page-width', 2],
      ['page-height', 1.5],
      ['page-fit', 1.5],
    ])('should scale to %s when not in original size', async (zoomScale, ratio) => {
      await render({ 'original-size': false, 'zoom-scale': zoomScale });
      setContainerSize(200, 300);
      fixture.componentRef.setInput('src', 'test.pdf');
      component.ngOnChanges({ src: {} } as any);
      await flush();
      await flush();

      expect(viewer().currentScale).toBeCloseTo(ratio / PdfViewerComponent.CSS_UNITS);
    });

    it('should subtract the borders when scaling', async () => {
      await render({ 'show-borders': true });
      setContainerSize(118, 300);

      expect((component as any).getScale(100, 200)).toBeCloseTo(1 / PdfViewerComponent.CSS_UNITS);
    });

    it('should scale down pages that do not fit when fit-to-page is enabled', async () => {
      await render({ 'fit-to-page': true });
      setContainerSize(50, 300);
      fixture.componentRef.setInput('src', 'test.pdf');
      component.ngOnChanges({ src: {} } as any);
      await flush();
      await flush();

      expect(viewer().currentScale).toBeCloseTo(0.5 / PdfViewerComponent.CSS_UNITS);
    });

    it('should apply the rotation once the first page is available', async () => {
      await render({ src: 'test.pdf', rotation: 90 });

      expect(viewer().pagesRotation).toBe(90);
    });

    it('should jump to the requested page when sticking to pages', async () => {
      await render({ src: 'test.pdf', page: 4, 'stick-to-page': true });

      expect(viewer().currentPageNumber).toBe(4);
    });

    it('should wait for the pages to be initialized before sizing the first time', async () => {
      const initialized = vi.fn();
      loadingTask = createLoadingTask(new Promise(() => undefined));

      await render({ src: 'test.pdf', zoom: 2 }, (instance) => instance.pageInitialized.subscribe(initialized));
      // Simulate the first load: pdf.js has not created any page views yet.
      viewer()._pages = [];
      (component as any)._pdf = pdf;
      (component as any).update();
      await flush();
      expect(viewer().currentScale).toBe(1);

      (component as any).eventBus.dispatch('pagesinit', { source: { container: container() } });
      await flush();

      expect(initialized).toHaveBeenCalled();
      expect(viewer().currentScale).toBe(2);
    });
  });

  describe('events', () => {
    it('should forward rendered pages and text layers', async () => {
      const pageRendered = vi.fn();
      const textLayerRendered = vi.fn();
      await render();
      component.pageRendered.subscribe(pageRendered);
      component.textLayerRendered.subscribe(textLayerRendered);
      const eventBus = (component as any).eventBus;

      eventBus.dispatch('pagerendered', { pageNumber: 1, source: { div: document.createElement('div') } });
      eventBus.dispatch('textlayerrendered', { pageNumber: 1, source: {} });

      expect(pageRendered).toHaveBeenCalled();
      expect(textLayerRendered).toHaveBeenCalled();
    });

    it('should debounce page changes caused by scrolling', async () => {
      const pageChange = vi.fn();
      await render();
      component.pageChange.subscribe(pageChange);
      const eventBus = (component as any).eventBus;

      eventBus.dispatch('pagechanging', { pageNumber: 2, source: { container: container() } });
      eventBus.dispatch('pagechanging', { pageNumber: 3, source: { container: container() } });
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(pageChange).toHaveBeenCalledTimes(1);
      expect(pageChange).toHaveBeenCalledWith(3);
    });

    it('should resize the document when the window is resized', async () => {
      await render({ src: 'test.pdf' });
      const updateSize = vi.spyOn(component, 'updateSize');

      window.dispatchEvent(new Event('resize'));
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(updateSize).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('should release the document and pending loading task', async () => {
      await render({ src: 'test.pdf' });
      const pending = createLoadingTask(new Promise(() => undefined));
      (component as any).loadingTask = pending;

      component.clear();

      expect(pending.destroy).toHaveBeenCalled();
      expect(pdf.destroy).toHaveBeenCalled();
      expect(viewer().setDocument).toHaveBeenLastCalledWith(null);
      expect((component as any).pdfLinkService.setDocument).toHaveBeenLastCalledWith(null, null);
      expect((component as any).pdfFindController.setDocument).toHaveBeenLastCalledWith(null);
    });

    it('should clean up on destroy', async () => {
      await render({ src: 'test.pdf' });

      fixture.destroy();

      expect(pdf.destroy).toHaveBeenCalled();
      expect((component as any).loadingTask).toBeNull();
    });
  });
});
