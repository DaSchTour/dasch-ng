import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IsActiveMatchOptions, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { RouterLinkActiveFor } from './router-link-active-for';

@Component({ selector: 'test-page', template: '' })
class PageComponent {}

@Component({
  selector: 'test-host',
  imports: [RouterLinkActiveFor],
  template: `<a
    id="item"
    class="base"
    #item="routerLinkActiveFor"
    [routerLinkActiveFor]="urls()"
    [routerLinkActiveForClass]="classes()"
    [routerLinkActiveForOptions]="options()"
    >{{ item.isActive() }}</a
  >`,
})
class HostComponent {
  readonly urls = signal<string | string[]>(['/a', '/b']);
  readonly classes = signal<string | string[]>('active');
  readonly options = signal<{ exact: boolean } | IsActiveMatchOptions>({ exact: false });
}

async function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'a', component: PageComponent },
        { path: 'a/child', component: PageComponent },
        { path: 'b', component: PageComponent },
        { path: 'c', component: PageComponent },
      ]),
    ],
  });
  const harness = await RouterTestingHarness.create();
  const fixture = TestBed.createComponent(HostComponent);
  const item = fixture.nativeElement.querySelector('#item') as HTMLElement;
  const navigate = async (url: string) => {
    await harness.navigateByUrl(url);
    fixture.detectChanges();
  };
  fixture.detectChanges();
  return { fixture, item, navigate };
}

describe('RouterLinkActiveFor', () => {
  it('sets the class when any listed URL is active and keeps other classes', async () => {
    const { item, navigate } = await setup();

    await navigate('/a');
    expect(item.classList.contains('active')).toBe(true);
    expect(item.classList.contains('base')).toBe(true);

    await navigate('/b');
    expect(item.classList.contains('active')).toBe(true);

    await navigate('/c');
    expect(item.classList.contains('active')).toBe(false);
    expect(item.classList.contains('base')).toBe(true);
  });

  it('exposes isActive as a signal', async () => {
    const { item, navigate } = await setup();

    await navigate('/c');
    expect(item.textContent).toBe('false');

    await navigate('/b');
    expect(item.textContent).toBe('true');
  });

  it('matches child routes by default', async () => {
    const { item, navigate } = await setup();

    await navigate('/a/child');

    expect(item.classList.contains('active')).toBe(true);
  });

  it('does not match child routes with exact: true', async () => {
    const { fixture, item, navigate } = await setup();
    fixture.componentInstance.options.set({ exact: true });

    await navigate('/a/child');
    expect(item.classList.contains('active')).toBe(false);

    await navigate('/a');
    expect(item.classList.contains('active')).toBe(true);
  });

  it('accepts IsActiveMatchOptions', async () => {
    const { fixture, item, navigate } = await setup();
    fixture.componentInstance.options.set({
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });

    await navigate('/a?x=1');

    expect(item.classList.contains('active')).toBe(true);
  });

  it('accepts a single URL and several class names', async () => {
    const { fixture, item, navigate } = await setup();
    fixture.componentInstance.urls.set('/c');
    fixture.componentInstance.classes.set(['on', 'highlight']);

    await navigate('/c');

    expect(item.classList.contains('on')).toBe(true);
    expect(item.classList.contains('highlight')).toBe(true);
  });

  it('sets no class when no class name is given', async () => {
    const { fixture, item, navigate } = await setup();
    fixture.componentInstance.classes.set('');

    await navigate('/a');

    expect(item.className).toBe('base');
    expect(item.textContent).toBe('true');
  });
});
