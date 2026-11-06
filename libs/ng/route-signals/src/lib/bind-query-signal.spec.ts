import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { bindQuerySignal } from './bind-query-signal';
import { deserializeMinMaxRange, MinMaxRange, serializeMinMaxRange } from './query-param-codecs';

@Component({ selector: 'test-list', template: '' })
class ListComponent {
  readonly search = signal('');
  readonly count = signal<MinMaxRange | null>(null);

  constructor() {
    bindQuerySignal({ signal: this.search, param: 'q', defaultValue: '' });
    bindQuerySignal({
      signal: this.count,
      param: 'count',
      defaultValue: null,
      serialize: serializeMinMaxRange,
      deserialize: deserializeMinMaxRange,
    });
  }
}

const wait = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

async function setup(url: string) {
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: 'list', component: ListComponent }])],
  });
  const harness = await RouterTestingHarness.create(url);
  const component = harness.routeDebugElement?.componentInstance as ListComponent;
  const router = TestBed.inject(Router);
  return { harness, component, router };
}

describe('bindQuerySignal', () => {
  it('seeds the signal from the URL on creation', async () => {
    const { component } = await setup('/list?q=foo&count=5-100');

    expect(component.search()).toBe('foo');
    expect(component.count()).toEqual({ min: 5, max: 100 });
  });

  it('does not navigate on creation when the URL already holds the value', async () => {
    const { router } = await setup('/list?q=foo');
    const navigate = vi.spyOn(router, 'navigate');

    await wait();

    expect(navigate).not.toHaveBeenCalled();
  });

  it('writes signal changes into the URL and keeps other params', async () => {
    const { component, router } = await setup('/list?other=1');

    component.search.set('bar');
    component.count.set({ min: 5 });
    TestBed.tick();
    await wait();

    expect(router.url).toBe('/list?other=1&q=bar&count=5-');
  });

  it('removes the param when the signal returns to its default value', async () => {
    const { component, router } = await setup('/list?q=bar');

    component.search.set('');
    TestBed.tick();
    await wait();

    expect(router.url).toBe('/list');
  });

  it('collapses a burst of writes into one navigation', async () => {
    const { component, router } = await setup('/list');
    const navigate = vi.spyOn(router, 'navigate');

    component.search.set('b');
    TestBed.tick();
    await wait(10);
    component.search.set('ba');
    TestBed.tick();
    await wait(10);
    component.search.set('bar');
    TestBed.tick();
    await wait();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(router.url).toBe('/list?q=bar');
  });

  it('does not navigate while another navigation is in flight', async () => {
    const { component, router } = await setup('/list');
    vi.spyOn(router, 'currentNavigation').mockReturnValue({} as ReturnType<Router['currentNavigation']>);
    const navigate = vi.spyOn(router, 'navigate');

    component.search.set('bar');
    TestBed.tick();
    await wait();

    expect(navigate).not.toHaveBeenCalled();
  });
});
