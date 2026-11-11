import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { IntersectionObserverService } from './intersection-observer.service';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  trigger(...isIntersecting: boolean[]) {
    const entries = isIntersecting.map((value) => ({ isIntersecting: value }) as IntersectionObserverEntry);
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

describe('IntersectionObserverService', () => {
  const element = document.createElement('div');

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('should observe the element with the given options', () => {
    const options = { rootMargin: '10px', threshold: [0, 1] };
    TestBed.inject(IntersectionObserverService).observe(element, options).subscribe();

    const [observer] = FakeIntersectionObserver.instances;
    expect(observer.options).toEqual(options);
    expect(observer.observe).toHaveBeenCalledWith(element);
  });

  it('should not create an observer before subscribing', () => {
    TestBed.inject(IntersectionObserverService).observe(element);

    expect(FakeIntersectionObserver.instances).toHaveLength(0);
  });

  it('should emit every entry of a batch', () => {
    const states: boolean[] = [];
    TestBed.inject(IntersectionObserverService)
      .observe(element)
      .subscribe((entry) => states.push(entry.isIntersecting));

    FakeIntersectionObserver.instances[0].trigger(true, false);

    expect(states).toEqual([true, false]);
  });

  it('should disconnect when the subscription ends', () => {
    const subscription = TestBed.inject(IntersectionObserverService).observe(element).subscribe();

    subscription.unsubscribe();

    expect(FakeIntersectionObserver.instances[0].disconnect).toHaveBeenCalled();
  });

  it('should complete without an observer on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const complete = vi.fn();
    const next = vi.fn();

    TestBed.inject(IntersectionObserverService).observe(element).subscribe({ next, complete });

    expect(FakeIntersectionObserver.instances).toHaveLength(0);
    expect(next).not.toHaveBeenCalled();
    expect(complete).toHaveBeenCalled();
  });
});
