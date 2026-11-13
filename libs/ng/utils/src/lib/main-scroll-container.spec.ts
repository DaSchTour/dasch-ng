import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MainScrollContainer, MainScrollContainerDirective, provideMainViewportScroller } from './main-scroll-container';

@Component({
  imports: [MainScrollContainerDirective],
  template: `
    @if (show()) {
      <main daschNgMainScrollContainer><h2 id="inner">Inner</h2></main>
    }
    <h2 id="outer">Outer</h2>
  `,
})
class HostComponent {
  readonly show = signal(true);
}

describe('provideMainViewportScroller', () => {
  let windowScroll: ReturnType<typeof vi.fn>;

  function setup() {
    TestBed.configureTestingModule({ providers: [provideMainViewportScroller()] });
    windowScroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined) as never;
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    main.scrollTo = vi.fn() as never;
    return { fixture, main, scroller: TestBed.inject(ViewportScroller) };
  }

  afterEach(() => vi.restoreAllMocks());

  it('scrolls and reads the registered container', () => {
    const { main, scroller } = setup();
    main.scrollTop = 40;

    scroller.scrollToPosition([0, 120], { behavior: 'instant' });

    expect(main.scrollTo).toHaveBeenCalledWith({ behavior: 'instant', left: 0, top: 120 });
    expect(windowScroll).not.toHaveBeenCalled();
    expect(scroller.getScrollPosition()).toEqual([0, 40]);
  });

  it('scrolls to an anchor inside the container, honouring the offset', () => {
    const { main, scroller } = setup();
    vi.spyOn(main, 'getBoundingClientRect').mockReturnValue({ top: 10 } as DOMRect);
    vi.spyOn(main.querySelector('#inner') as HTMLElement, 'getBoundingClientRect').mockReturnValue({ top: 110 } as DOMRect);
    main.scrollTop = 50;
    scroller.setOffset([0, 20]);

    scroller.scrollToAnchor('inner');

    expect(main.scrollTo).toHaveBeenCalledWith({ left: 0, top: 130 });
  });

  it('finds anchors outside the container in the window', () => {
    const { scroller, main } = setup();

    scroller.scrollToAnchor('outer');

    expect(windowScroll).toHaveBeenCalledTimes(1);
    expect(main.scrollTo).not.toHaveBeenCalled();
  });

  it('ignores unknown anchors', () => {
    const { scroller } = setup();
    scroller.scrollToAnchor('missing');
    expect(windowScroll).not.toHaveBeenCalled();
  });

  it('falls back to the window once the container is gone', () => {
    const { fixture, scroller } = setup();
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    scroller.scrollToPosition([0, 5]);

    expect(windowScroll).toHaveBeenCalledWith({ left: 0, top: 5 });
  });

  it('reads the window position and sets history restoration without a container', () => {
    const { fixture, scroller } = setup();
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    vi.spyOn(window, 'scrollX', 'get').mockReturnValue(3);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(9);

    expect(scroller.getScrollPosition()).toEqual([3, 9]);
    scroller.setHistoryScrollRestoration('manual');
    expect(window.history.scrollRestoration).toBe('manual');
  });

  it('escapes anchors, falls back to element names and accepts an offset function', () => {
    const { fixture, main, scroller } = setup();
    const special = document.createElement('p');
    special.id = 'a.b:c';
    main.appendChild(special);
    const named = document.createElement('a');
    named.setAttribute('name', 'by-name');
    fixture.nativeElement.appendChild(named);
    vi.spyOn(main, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);
    vi.spyOn(special, 'getBoundingClientRect').mockReturnValue({ top: 30 } as DOMRect);
    scroller.setOffset(() => [0, 10]);

    scroller.scrollToAnchor('a.b:c');
    scroller.scrollToAnchor('by-name');

    expect(main.scrollTo).toHaveBeenCalledWith({ left: 0, top: 20 });
    expect(windowScroll).toHaveBeenCalledTimes(1);
  });

  it('does nothing without a window (server rendering)', () => {
    const target = document.createElement('div');
    const fakeDocument = { defaultView: null, getElementById: () => target, getElementsByName: () => [] };
    TestBed.configureTestingModule({ providers: [provideMainViewportScroller(), { provide: DOCUMENT, useValue: fakeDocument }] });
    const scroller = TestBed.inject(ViewportScroller);

    expect(scroller.getScrollPosition()).toEqual([0, 0]);
    expect(() => {
      scroller.scrollToPosition([0, 1]);
      scroller.scrollToAnchor('x');
      scroller.setHistoryScrollRestoration('auto');
    }).not.toThrow();
  });

  it('keeps a newer container registered when an older one is destroyed', () => {
    const { fixture } = setup();
    const newer = document.createElement('div');
    TestBed.inject(MainScrollContainer).element.set(newer);

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(TestBed.inject(MainScrollContainer).element()).toBe(newer);
  });
});
