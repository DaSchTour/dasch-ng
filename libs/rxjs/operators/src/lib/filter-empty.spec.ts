import { from } from 'rxjs';

import { filterEmpty } from './filter-empty';

describe('filterEmpty()', () => {
  it('filter null and undefined, call next for other values', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from([{ po: 1 }, null, undefined, { po: 2 }, { po: 3 }, { po: 4 }])
      .pipe(filterEmpty())
      .subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(4);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('filter not filter normal values', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from([{ po: 1 }, { po: 2 }])
      .pipe(filterEmpty())
      .subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('filter null and undefined', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from([null, undefined]).pipe(filterEmpty()).subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(0);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('filter {}', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from([{ po: 1 }, {}, { po: 2 }])
      .pipe(filterEmpty())
      .subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('filter {} but not object with content', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from([{ po: 1 }, {}, { po: 2 }, { foo: 'bar' }])
      .pipe(filterEmpty())
      .subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('filter []', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from([[1, 3, 4], [], [4, 6, 7]])
      .pipe(filterEmpty())
      .subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('filter [] but not array with content', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from([[1, 3, 4], [], [2], [3, 4]])
      .pipe(filterEmpty())
      .subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('filter empty string but not string with content', () => {
    const observerSpy = {
      next: jest.fn(),
      complete: jest.fn(),
    };
    from(['one', '', null, 'two', 'three']).pipe(filterEmpty()).subscribe(observerSpy);
    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });
});
