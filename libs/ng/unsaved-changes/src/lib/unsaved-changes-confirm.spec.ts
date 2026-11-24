import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UNSAVED_CHANGES_CONFIRM, UNSAVED_CHANGES_MESSAGE } from './unsaved-changes-confirm';

describe('UNSAVED_CHANGES_CONFIRM', () => {
  it('has an empty default message', () => {
    expect(TestBed.inject(UNSAVED_CHANGES_MESSAGE)).toBe('');
  });

  it('asks window.confirm with the default message', () => {
    const spy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    expect(TestBed.inject(UNSAVED_CHANGES_CONFIRM)()).toBe(false);
    expect(spy).toHaveBeenCalledWith('');
    spy.mockRestore();
  });

  it('allows leaving when there is no window (server)', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: null } }],
    });

    expect(TestBed.inject(UNSAVED_CHANGES_CONFIRM)()).toBe(true);
  });
});
