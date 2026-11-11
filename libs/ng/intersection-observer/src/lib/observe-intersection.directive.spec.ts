import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ObserveIntersectionDirective } from './observe-intersection.directive';

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

@Component({
  imports: [ObserveIntersectionDirective],
  template: `<div observeIntersection [rootMargin]="rootMargin()" [threshold]="0.5" [recheck]="items()" (intersect)="hits.push($event)"></div>`,
})
class HostComponent {
  readonly directive = viewChild.required(ObserveIntersectionDirective);
  readonly rootMargin = signal('0px');
  readonly items = signal(0);
  readonly hits: IntersectionObserverEntry[] = [];
}

describe('ObserveIntersectionDirective', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  };
  const latest = () => FakeIntersectionObserver.instances.at(-1)!;

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('should observe the host with rootMargin and threshold', async () => {
    const fixture = await setup();

    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    expect(latest().observe).toHaveBeenCalledWith(fixture.nativeElement.firstChild);
    expect(latest().options).toEqual({ rootMargin: '0px', threshold: 0.5 });
  });

  it('should emit intersect and set isIntersecting only while visible', async () => {
    const fixture = await setup();
    const { directive, hits } = fixture.componentInstance;

    expect(directive().isIntersecting()).toBe(false);

    latest().trigger(true);
    expect(directive().isIntersecting()).toBe(true);
    expect(hits).toHaveLength(1);

    latest().trigger(false);
    expect(directive().isIntersecting()).toBe(false);
    expect(hits).toHaveLength(1);
  });

  it('should observe anew when rootMargin changes', async () => {
    const fixture = await setup();
    const first = latest();

    fixture.componentInstance.rootMargin.set('100px');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(first.disconnect).toHaveBeenCalled();
    expect(FakeIntersectionObserver.instances).toHaveLength(2);
    expect(latest().options?.rootMargin).toBe('100px');
  });

  it('should report the current state again when the recheck input changes', async () => {
    const fixture = await setup();
    const first = latest();

    fixture.componentInstance.items.set(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(first.disconnect).toHaveBeenCalled();
    expect(FakeIntersectionObserver.instances).toHaveLength(2);
    latest().trigger(true);
    expect(fixture.componentInstance.hits).toHaveLength(1);
  });

  it('should report the current state again on triggerRecheck()', async () => {
    const fixture = await setup();

    fixture.componentInstance.directive().triggerRecheck();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(FakeIntersectionObserver.instances).toHaveLength(2);
  });

  it('should disconnect when destroyed', async () => {
    const fixture = await setup();

    fixture.destroy();

    expect(latest().disconnect).toHaveBeenCalled();
  });
});
