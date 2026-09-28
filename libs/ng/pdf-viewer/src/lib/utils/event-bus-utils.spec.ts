import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { createEventBus } from './event-bus-utils';

/** Minimal stand-in for pdf.js' EventBus (on/off/dispatch), which rxjs' fromEvent supports. */
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

  listenerCount() {
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
  }
}

function captureEvent<T extends Event>(target: EventTarget, name: string): T[] {
  const events: T[] = [];
  target.addEventListener(name, (event) => events.push(event as T));
  return events;
}

describe('createEventBus', () => {
  let destroy$: Subject<void>;
  let eventBus: FakeEventBus;
  let container: HTMLElement;

  beforeEach(() => {
    destroy$ = new Subject<void>();
    eventBus = createEventBus({ EventBus: FakeEventBus }, destroy$) as unknown as FakeEventBus;
    container = document.createElement('div');
  });

  afterEach(() => destroy$.next());

  it('should create an event bus from the given pdf.js viewer module', () => {
    expect(eventBus).toBeInstanceOf(FakeEventBus);
  });

  it('should forward documentload to the window', () => {
    const events = captureEvent<CustomEvent>(window, 'documentload');

    eventBus.dispatch('documentload', {});

    expect(events).toHaveLength(1);
  });

  it('should forward pagerendered to the page div', () => {
    const div = document.createElement('div');
    const events = captureEvent<CustomEvent>(div, 'pagerendered');

    eventBus.dispatch('pagerendered', { pageNumber: 2, cssTransform: true, source: { div } });

    expect(events[0].detail).toEqual({ pageNumber: 2, cssTransform: true });
  });

  it('should forward textlayerrendered to the text layer and tolerate a missing one', () => {
    const textLayerDiv = document.createElement('div');
    const events = captureEvent<CustomEvent>(textLayerDiv, 'textlayerrendered');

    eventBus.dispatch('textlayerrendered', { pageNumber: 3, source: { textLayerDiv } });
    eventBus.dispatch('textlayerrendered', { pageNumber: 4, source: {} });

    expect(events.map((event) => event.detail)).toEqual([{ pageNumber: 3 }]);
  });

  it('should forward pagechanging with the page number', () => {
    const events = captureEvent<Event & { pageNumber?: number }>(container, 'pagechanging');

    eventBus.dispatch('pagechanging', { pageNumber: 5, source: { container } });

    expect(events[0].pageNumber).toBe(5);
  });

  it.each([
    ['pagesinit', {}, null],
    ['pagesloaded', { pagesCount: 7 }, { pagesCount: 7 }],
    ['attachmentsloaded', { attachmentsCount: 2 }, { attachmentsCount: 2 }],
    ['outlineloaded', { outlineCount: 4 }, { outlineCount: 4 }],
  ])('should forward %s to the container', (name, payload, detail) => {
    const events = captureEvent<CustomEvent>(container, name);

    eventBus.dispatch(name, { ...payload, source: { container } });

    expect(events[0].detail).toEqual(detail);
  });

  it('should forward scalechange with scale and preset value', () => {
    const events = captureEvent<Event & { scale?: number; presetValue?: string }>(container, 'scalechange');

    eventBus.dispatch('scalechange', { scale: 1.5, presetValue: 'page-fit', source: { container } });

    expect(events[0].scale).toBe(1.5);
    expect(events[0].presetValue).toBe('page-fit');
  });

  it('should forward updateviewarea with the location', () => {
    const events = captureEvent<Event & { location?: unknown }>(container, 'updateviewarea');
    const location = { pageNumber: 1 };

    eventBus.dispatch('updateviewarea', { location, source: { container } });

    expect(events[0].location).toBe(location);
  });

  it('should forward find events to the window unless they originate from it', () => {
    const events = captureEvent<CustomEvent>(window, 'findagain');
    const payload = { type: 'again', query: 'pdf', phraseSearch: true, caseSensitive: false, highlightAll: true, findPrevious: false };

    eventBus.dispatch('find', { ...payload, source: container });
    eventBus.dispatch('find', { ...payload, source: window });

    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ query: 'pdf', phraseSearch: true, caseSensitive: false, highlightAll: true, findPrevious: false });
  });

  it('should forward sidebarviewchanged to the outer container', () => {
    const outerContainer = document.createElement('div');
    const events = captureEvent<CustomEvent>(outerContainer, 'sidebarviewchanged');

    eventBus.dispatch('sidebarviewchanged', { view: 1, source: { outerContainer } });

    expect(events[0].detail).toEqual({ view: 1 });
  });

  it.each([
    ['pagemode', { mode: 'thumbs' }],
    ['namedaction', { action: 'Print' }],
  ])('should forward %s to the viewer container', (name, detail) => {
    const events = captureEvent<CustomEvent>(container, name);

    eventBus.dispatch(name, { ...detail, source: { pdfViewer: { container } } });

    expect(events[0].detail).toEqual(detail);
  });

  it('should forward presentationmodechanged to the window', () => {
    const events = captureEvent<CustomEvent>(window, 'presentationmodechanged');

    eventBus.dispatch('presentationmodechanged', { active: true, switchInProgress: false });

    expect(events[0].detail).toEqual({ active: true, switchInProgress: false });
  });

  it('should stop forwarding once destroyed', () => {
    const listener = vi.fn();
    window.addEventListener('documentload', listener);

    destroy$.next();
    eventBus.dispatch('documentload', {});

    expect(listener).not.toHaveBeenCalled();
    expect(eventBus.listenerCount()).toBe(0);
    window.removeEventListener('documentload', listener);
  });
});
