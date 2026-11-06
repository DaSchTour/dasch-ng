import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverflowDirective } from './overflow.directive';

@Component({
  imports: [OverflowDirective],
  template: `<span daschNgOverflow #o="daschNgOverflow" (overflowChange)="changes.push($event)">{{ text() }}</span>`,
})
class HostComponent {
  readonly text = signal('short');
  readonly changes: boolean[] = [];
}

/** jsdom has no layout: fake the sizes the directive reads. */
function setSize(el: HTMLElement, size: { scrollWidth: number; clientWidth: number; scrollHeight?: number; clientHeight?: number }) {
  for (const [key, value] of Object.entries({ scrollHeight: 10, clientHeight: 10, ...size })) {
    Object.defineProperty(el, key, { configurable: true, value });
  }
}

describe('OverflowDirective', () => {
  let resizeCallbacks: Array<() => void>;

  beforeEach(() => {
    resizeCallbacks = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resizeCallbacks.push(callback);
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  async function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    setSize(span, { scrollWidth: 50, clientWidth: 100 });
    fixture.detectChanges();
    await fixture.whenStable();
    const directive = fixture.debugElement.children[0].injector.get(OverflowDirective);
    return { fixture, span, directive };
  }

  it('starts without overflow when the content fits', async () => {
    const { span, directive, fixture } = await setup();

    expect(directive.overflowing()).toBe(false);
    expect(span.hasAttribute('data-overflowing')).toBe(false);
    expect(fixture.componentInstance.changes).toEqual([]);
  });

  it('reports horizontal overflow after a resize', async () => {
    const { span, directive, fixture } = await setup();

    setSize(span, { scrollWidth: 150, clientWidth: 100 });
    resizeCallbacks.forEach((callback) => callback());
    fixture.detectChanges();

    expect(directive.overflowing()).toBe(true);
    expect(span.hasAttribute('data-overflowing')).toBe(true);
    expect(fixture.componentInstance.changes).toEqual([true]);
  });

  it('reports vertical overflow and goes back when the content fits again', async () => {
    const { span, directive, fixture } = await setup();

    setSize(span, { scrollWidth: 50, clientWidth: 100, scrollHeight: 60, clientHeight: 40 });
    directive.check();
    setSize(span, { scrollWidth: 50, clientWidth: 100 });
    directive.check();
    directive.check();

    expect(directive.overflowing()).toBe(false);
    expect(fixture.componentInstance.changes).toEqual([true, false]);
  });

  it('re-checks when the text changes', async () => {
    const { span, directive, fixture } = await setup();

    setSize(span, { scrollWidth: 300, clientWidth: 100 });
    fixture.componentInstance.text.set('a much longer text that does not fit');
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));

    expect(directive.overflowing()).toBe(true);
  });
});
