import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FileDropDirective } from './file-drop.directive';

@Component({
  imports: [FileDropDirective],
  template: `<div fileDrop [accept]="accept()" (filesDropped)="dropped.push($event)"><span>child</span></div>`,
})
class HostComponent {
  accept = signal('');
  dropped: File[][] = [];
}

function dragEvent(type: string, files: File[] | null, init: EventInit & { relatedTarget?: EventTarget | null } = {}) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { types: files ? ['Files'] : ['text/plain'], files } });
  Object.defineProperty(event, 'relatedTarget', { value: init.relatedTarget ?? null });
  return event;
}

describe('FileDropDirective', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const zone = fixture.nativeElement.querySelector('div') as HTMLElement;
    return { fixture, zone };
  }
  const png = new File(['a'], 'a.PNG', { type: 'image/png' });
  const pdf = new File(['b'], 'b.pdf', { type: 'application/pdf' });

  it('sets data-drag-over while files are dragged over and clears it on leave', () => {
    const { fixture, zone } = setup();
    const over = dragEvent('dragover', [png]);
    zone.dispatchEvent(over);
    fixture.detectChanges();
    expect(over.defaultPrevented).toBe(true);
    expect(zone.hasAttribute('data-drag-over')).toBe(true);

    zone.dispatchEvent(dragEvent('dragleave', [png], { relatedTarget: zone.querySelector('span') }));
    fixture.detectChanges();
    expect(zone.hasAttribute('data-drag-over')).toBe(true); // moved into a child

    zone.dispatchEvent(dragEvent('dragleave', [png]));
    fixture.detectChanges();
    expect(zone.hasAttribute('data-drag-over')).toBe(false);
  });

  it('ignores drags that carry no files', () => {
    const { fixture, zone } = setup();
    const over = dragEvent('dragover', null);
    zone.dispatchEvent(over);
    fixture.detectChanges();
    expect(over.defaultPrevented).toBe(false);
    expect(zone.hasAttribute('data-drag-over')).toBe(false);
  });

  it('emits dropped files and resets the state', () => {
    const { fixture, zone } = setup();
    zone.dispatchEvent(dragEvent('dragenter', [png]));
    zone.dispatchEvent(dragEvent('drop', [png, pdf]));
    fixture.detectChanges();
    expect(fixture.componentInstance.dropped).toEqual([[png, pdf]]);
    expect(zone.hasAttribute('data-drag-over')).toBe(false);
  });

  it('filters by extension, MIME type and wildcard (case-insensitive)', () => {
    const { fixture, zone } = setup();
    fixture.componentInstance.accept.set('.png, application/pdf');
    fixture.detectChanges();
    zone.dispatchEvent(dragEvent('drop', [png, pdf, new File(['c'], 'c.txt', { type: 'text/plain' })]));
    expect(fixture.componentInstance.dropped).toEqual([[png, pdf]]);

    fixture.componentInstance.accept.set('image/*');
    fixture.detectChanges();
    zone.dispatchEvent(dragEvent('drop', [png, pdf]));
    expect(fixture.componentInstance.dropped[1]).toEqual([png]);
  });

  it('emits nothing when no file matches', () => {
    const { fixture, zone } = setup();
    fixture.componentInstance.accept.set('video/*');
    fixture.detectChanges();
    zone.dispatchEvent(dragEvent('drop', [png]));
    expect(fixture.componentInstance.dropped).toEqual([]);
  });
});
