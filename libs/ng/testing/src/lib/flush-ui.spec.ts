import { Component, effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { flushUI } from './flush-ui';

@Component({ selector: 'lib-flush-host', template: '{{ count() }} / {{ mirrored() }}' })
class HostComponent {
  readonly count = signal(0);
  readonly mirrored = signal(-1);

  constructor() {
    effect(() => this.mirrored.set(this.count()));
  }
}

describe('flushUI', () => {
  it('renders signal changes and effect results', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.count.set(2);
    await flushUI(fixture);
    expect(fixture.nativeElement.textContent).toBe('2 / 2');
  });

  it('settles even when a timer keeps the app busy', async () => {
    const timer = setTimeout(() => undefined, 60_000);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.count.set(1);
    await flushUI(fixture);
    clearTimeout(timer);
    expect(fixture.nativeElement.textContent).toBe('1 / 1');
  });
});
