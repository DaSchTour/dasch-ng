import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Event, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter } from 'rxjs';
import { isNavigationCancel, isNavigationEnd, isNavigationError, isNavigationStart, isResolveEnd, navigationEnd } from './router-events';

@Component({ selector: 'test-page', template: '' })
class PageComponent {}

describe('router event guards', () => {
  const events: Event[] = [];

  async function setup(routes: Parameters<typeof provideRouter>[0]) {
    events.length = 0;
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const router = TestBed.inject(Router);
    router.events.subscribe((event) => events.push(event));
    return { router, harness: await RouterTestingHarness.create() };
  }

  it('recognizes start, resolve end and end of a successful navigation', async () => {
    const { harness } = await setup([{ path: 'a', component: PageComponent }]);
    events.length = 0;

    await harness.navigateByUrl('/a');

    expect(events.filter(isNavigationStart)).toHaveLength(1);
    expect(events.filter(isResolveEnd)).toHaveLength(1);
    expect(events.filter(isNavigationEnd)).toHaveLength(1);
    expect(events.filter(isNavigationCancel)).toHaveLength(0);
    expect(events.filter(isNavigationError)).toHaveLength(0);
  });

  it('recognizes a cancelled navigation', async () => {
    const { harness } = await setup([{ path: 'a', component: PageComponent, canActivate: [() => false] }]);
    events.length = 0;

    await harness.navigateByUrl('/a');

    expect(events.filter(isNavigationCancel)).toHaveLength(1);
    expect(events.filter(isNavigationEnd)).toHaveLength(0);
  });

  it('recognizes a navigation error', async () => {
    const { harness } = await setup([
      {
        path: 'a',
        component: PageComponent,
        canActivate: [
          () => {
            throw new Error('boom');
          },
        ],
      },
    ]);
    events.length = 0;

    await expect(harness.navigateByUrl('/a')).rejects.toThrow('boom');

    expect(events.filter(isNavigationError)).toHaveLength(1);
  });

  it('narrows the type inside filter()', async () => {
    const { router, harness } = await setup([{ path: 'a', component: PageComponent }]);
    const urls: string[] = [];
    router.events.pipe(filter(isNavigationEnd)).subscribe((event) => urls.push(event.urlAfterRedirects));

    await harness.navigateByUrl('/a');

    expect(urls).toEqual(['/a']);
  });

  it('navigationEnd() holds the last NavigationEnd', async () => {
    const { harness } = await setup([
      { path: 'a', component: PageComponent },
      { path: 'b', component: PageComponent },
    ]);
    const last = TestBed.runInInjectionContext(() => navigationEnd());

    await harness.navigateByUrl('/a');
    await harness.navigateByUrl('/b');

    expect(last()?.urlAfterRedirects).toBe('/b');
  });

  it('navigationEnd() is null before a navigation has ended', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    expect(TestBed.runInInjectionContext(() => navigationEnd())()).toBeNull();
  });
});
