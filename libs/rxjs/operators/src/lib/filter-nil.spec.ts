import { from } from 'rxjs';

import { filterNil } from './filter-nil';

describe('filterNil()', () => {
  it('filter null and undefined, call next for other values', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from([1, null, undefined, 2, 3, 4])
      .pipe(filterNil())
      .subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(4);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('filter not filter normal values', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from([1, 2]).pipe(filterNil()).subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('filter null and undefined', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from([null, undefined]).pipe(filterNil()).subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(0);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });
});
