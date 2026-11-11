import { Component, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Data, Params, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { nestedRouteData, nestedRouteParams } from './nested-route';

@Component({ selector: 'test-shell', template: '' })
class ShellComponent {
  readonly data = nestedRouteData();
  readonly title = nestedRouteData<string>('title');
  readonly params = nestedRouteParams();
}

@Component({ selector: 'test-page', template: '' })
class PageComponent {}

async function setup(url: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        {
          path: 'orgs/:orgId',
          component: ShellComponent,
          data: { section: 'Orgs', title: 'Org' },
          children: [
            { path: '', component: PageComponent, data: { title: 'Overview' } },
            { path: 'projects/:projectId', component: PageComponent, data: { page: 'project' } },
            { path: 'plain', component: PageComponent },
          ],
        },
      ]),
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return harness;
}

describe('nestedRouteData / nestedRouteParams', () => {
  it('merges data from the root to the deepest child, child wins', async () => {
    const harness = await setup('/orgs/7');
    const shell = harness.routeDebugElement?.componentInstance as ShellComponent;

    expect(shell.data()).toEqual({ section: 'Orgs', title: 'Overview' });
    expect(shell.title()).toBe('Overview');
  });

  it('merges params of all levels', async () => {
    const harness = await setup('/orgs/7/projects/42');
    const shell = harness.routeDebugElement?.componentInstance as ShellComponent;

    expect(shell.params()).toEqual({ orgId: '7', projectId: '42' });
    expect(shell.data()).toEqual({ section: 'Orgs', title: 'Org', page: 'project' });
  });

  it('updates after navigation', async () => {
    const harness = await setup('/orgs/7');
    const shell = harness.routeDebugElement?.componentInstance as ShellComponent;

    await harness.navigateByUrl('/orgs/8/projects/1');

    expect(shell.params()).toEqual({ orgId: '8', projectId: '1' });
    expect(shell.title()).toBe('Org');
  });

  it('returns undefined for a key no active route sets', async () => {
    const harness = await setup('/orgs/7/plain');
    const shell = harness.routeDebugElement?.componentInstance as ShellComponent;
    const missing: Signal<number | undefined> = TestBed.runInInjectionContext(() => nestedRouteData<number>('nope'));

    expect(missing()).toBeUndefined();
    expect(shell.data() satisfies Data).toEqual({ section: 'Orgs', title: 'Org' });
    expect(shell.params() satisfies Params).toEqual({ orgId: '7' });
  });
});
