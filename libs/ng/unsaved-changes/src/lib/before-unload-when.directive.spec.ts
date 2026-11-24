import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BeforeUnloadWhenDirective } from './before-unload-when.directive';

@Component({
  imports: [BeforeUnloadWhenDirective],
  template: '<div [beforeUnloadWhen]="dirty()"></div>',
})
class HostComponent {
  readonly dirty = signal(false);
}

function fireBeforeUnload() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

describe('BeforeUnloadWhenDirective', () => {
  it('prevents unload only while the input is true', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fireBeforeUnload()).toBe(false);

    fixture.componentInstance.dirty.set(true);
    fixture.detectChanges();
    expect(fireBeforeUnload()).toBe(true);

    fixture.componentInstance.dirty.set(false);
    fixture.detectChanges();
    expect(fireBeforeUnload()).toBe(false);
  });

  it('removes the handler on destroy', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.dirty.set(true);
    fixture.detectChanges();
    expect(fireBeforeUnload()).toBe(true);

    fixture.destroy();
    expect(fireBeforeUnload()).toBe(false);
  });
});
