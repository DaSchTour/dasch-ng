import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { defaultSortGuard, querySort } from './query-sort';

@Component({ selector: 'test-list', template: '' })
class ListComponent {
  readonly sort = querySort({ default: { property: 'name', direction: 'asc' }, resetParams: ['page'] });
}

const wait = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

async function setup(url: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'list', component: ListComponent },
        {
          path: 'guarded',
          component: ListComponent,
          canActivate: [defaultSortGuard({ property: 'date', direction: 'desc' })],
        },
        {
          path: 'custom',
          component: ListComponent,
          canActivate: [defaultSortGuard({ property: 'a', direction: 'asc' }, { property: 's', direction: 'd' })],
        },
      ]),
    ],
  });
  const harness = await RouterTestingHarness.create(url);
  const component = harness.routeDebugElement?.componentInstance as ListComponent;
  return { harness, component, router: TestBed.inject(Router) };
}

describe('querySort', () => {
  it('starts with the default when the URL has no sort', async () => {
    const { component } = await setup('/list');

    expect(component.sort()).toEqual({ property: 'name', direction: 'asc' });
  });

  it('seeds from the URL without navigating', async () => {
    const { component, router } = await setup('/list?sort=size&dir=desc');
    const navigate = vi.spyOn(router, 'navigate');

    await wait();

    expect(component.sort()).toEqual({ property: 'size', direction: 'desc' });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('treats an unknown direction as asc', async () => {
    const { component } = await setup('/list?sort=size&dir=sideways');

    expect(component.sort()).toEqual({ property: 'size', direction: 'asc' });
  });

  it('writes both params in one navigation, keeps others and resets listed ones', async () => {
    const { component, router } = await setup('/list?q=x&page=3');
    const navigate = vi.spyOn(router, 'navigate');

    component.sort.set({ property: 'size', direction: 'desc' });
    TestBed.tick();
    await wait();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(router.url).toBe('/list?q=x&sort=size&dir=desc');
  });

  it('toggle sorts ascending first, then flips the direction', async () => {
    const { component } = await setup('/list');

    component.sort.toggle('size');
    expect(component.sort()).toEqual({ property: 'size', direction: 'asc' });
    component.sort.toggle('size');
    expect(component.sort()).toEqual({ property: 'size', direction: 'desc' });
    component.sort.toggle('size');
    expect(component.sort()).toEqual({ property: 'size', direction: 'asc' });
    component.sort.toggle('name');
    expect(component.sort()).toEqual({ property: 'name', direction: 'asc' });
  });

  it('reset returns to the default and writes it to the URL', async () => {
    const { component, router } = await setup('/list?sort=size&dir=desc');

    component.sort.reset();
    TestBed.tick();
    await wait();

    expect(component.sort()).toEqual({ property: 'name', direction: 'asc' });
    expect(router.url).toBe('/list?sort=name&dir=asc');
  });

  it('removes both params when set to null', async () => {
    const { component, router } = await setup('/list?sort=size&dir=desc&q=x');

    component.sort.set(null);
    TestBed.tick();
    await wait();

    expect(router.url).toBe('/list?q=x');
  });
});

describe('defaultSortGuard', () => {
  it('redirects with the default sort and keeps other params', async () => {
    const { router } = await setup('/guarded?q=x');

    expect(router.url).toBe('/guarded?q=x&sort=date&dir=desc');
  });

  it('lets a URL with a sort through', async () => {
    const { router } = await setup('/guarded?sort=size&dir=asc');

    expect(router.url).toBe('/guarded?sort=size&dir=asc');
  });

  it('supports custom param names', async () => {
    const { router } = await setup('/custom');

    expect(router.url).toBe('/custom?s=a&d=asc');
  });
});
