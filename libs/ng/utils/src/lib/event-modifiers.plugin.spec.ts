import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideEventModifiers } from './event-modifiers.plugin';

@Component({
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -- test host only counts bubbled clicks -->
    <div id="parent" (click)="parentClicks = parentClicks + 1">
      <button id="stop" (click.stop)="clicks = clicks + 1">stop</button>
      <a id="prevent" href="#x" (click.prevent)="clicks = clicks + 1">prevent</a>
      <a id="both" href="#x" (click.stop.prevent)="clicks = clicks + 1">both</a>
      <button id="self" (click.self)="clicks = clicks + 1"><span id="inner">inner</span></button>
      <input id="key" (keydown.enter.prevent)="clicks = clicks + 1" />
    </div>
  `,
})
class HostComponent {
  clicks = 0;
  parentClicks = 0;
}

function setup() {
  TestBed.configureTestingModule({ providers: [provideEventModifiers()] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
  const click = (id: string) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    el(id).dispatchEvent(event);
    return event;
  };
  return { host: fixture.componentInstance, el, click };
}

describe('EventModifiersPlugin', () => {
  it('stops propagation and still runs the handler', () => {
    const { host, click } = setup();

    const event = click('stop');

    expect(host.clicks).toBe(1);
    expect(host.parentClicks).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it('prevents the default action', () => {
    const { host, click } = setup();

    const event = click('prevent');

    expect(event.defaultPrevented).toBe(true);
    expect(host.clicks).toBe(1);
    expect(host.parentClicks).toBe(1);
  });

  it('combines modifiers', () => {
    const { host, click } = setup();

    const event = click('both');

    expect(event.defaultPrevented).toBe(true);
    expect(host.parentClicks).toBe(0);
    expect(host.clicks).toBe(1);
  });

  it('runs .self handlers only for events on the element itself', () => {
    const { host, click } = setup();

    click('inner');
    expect(host.clicks).toBe(0);

    click('self');
    expect(host.clicks).toBe(1);
  });

  it('works together with key event filters', () => {
    const { host, el } = setup();
    const other = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

    el('key').dispatchEvent(other);
    el('key').dispatchEvent(enter);

    expect(host.clicks).toBe(1);
    expect(other.defaultPrevented).toBe(false);
    expect(enter.defaultPrevented).toBe(true);
  });
});
