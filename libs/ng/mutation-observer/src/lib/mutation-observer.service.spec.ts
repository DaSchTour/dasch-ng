import { TestBed } from '@angular/core/testing';

import { MutationObserverService } from './mutation-observer.service';

describe('MutationObserverService', () => {
  let service: MutationObserverService;
  let element: HTMLElement;

  beforeEach(() => {
    service = TestBed.inject(MutationObserverService);
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => element.remove());

  it('should emit mutation records of the observed element', async () => {
    const records: MutationRecord[] = [];
    const subscription = service.observe(element, { attributes: true }).subscribe((record) => records.push(record));

    element.setAttribute('data-test', 'changed');
    await new Promise((resolve) => setTimeout(resolve));

    expect(records).toHaveLength(1);
    expect(records[0].target).toBe(element);
    expect(records[0].attributeName).toBe('data-test');
    subscription.unsubscribe();
  });

  it('should only emit records that target the observed element', async () => {
    const other = document.createElement('div');
    document.body.appendChild(other);
    const records: MutationRecord[] = [];
    const subscription = service.observe(element, { attributes: true }).subscribe((record) => records.push(record));
    service.observe(other, { attributes: true });

    other.setAttribute('data-test', 'changed');
    await new Promise((resolve) => setTimeout(resolve));

    expect(records).toHaveLength(0);
    subscription.unsubscribe();
    other.remove();
  });

  it('should accept unobserve calls', () => {
    expect(() => service.unobserve(element)).not.toThrow();
  });
});
