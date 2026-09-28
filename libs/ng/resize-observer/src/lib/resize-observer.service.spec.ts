import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ResizeObserverService } from './resize-observer.service';

class FakeResizeObserver {
  static instance: FakeResizeObserver;
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();

  constructor(readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instance = this;
  }

  trigger(targets: Element[]) {
    const entries = targets.map((target) => ({ target }) as ResizeObserverEntry);
    this.callback(entries, this as unknown as ResizeObserver);
  }
}

describe('ResizeObserverService', () => {
  let service: ResizeObserverService;
  let element: HTMLElement;

  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    service = TestBed.inject(ResizeObserverService);
    element = document.createElement('div');
  });

  afterEach(() => vi.unstubAllGlobals());

  it('should observe the element with the given options', () => {
    service.observe(element, { box: 'border-box' });

    expect(FakeResizeObserver.instance.observe).toHaveBeenCalledWith(element, { box: 'border-box' });
  });

  it('should only emit entries that target the observed element', () => {
    const other = document.createElement('div');
    const entries: ResizeObserverEntry[] = [];
    const subscription = service.observe(element).subscribe((entry) => entries.push(entry));

    FakeResizeObserver.instance.trigger([other]);
    FakeResizeObserver.instance.trigger([other, element]);

    expect(entries).toHaveLength(1);
    expect(entries[0].target).toBe(element);
    subscription.unsubscribe();
  });

  it('should stop observing the element when the subscription ends', () => {
    const subscription = service.observe(element).subscribe();

    subscription.unsubscribe();

    expect(FakeResizeObserver.instance.unobserve).toHaveBeenCalledWith(element);
  });

  it('should unobserve an element on request', () => {
    service.unobserve(element);

    expect(FakeResizeObserver.instance.unobserve).toHaveBeenCalledWith(element);
  });
});
