import { from } from 'rxjs';
import { filterNumber } from './filter-number';

describe('filterNumber()', () => {
  it('should filter out non-number values', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from(['hello', 42, 'world', 3.14, true, false, null, undefined, 123]).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 42);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 3.14);
    expect(observerSpy.next).toHaveBeenNthCalledWith(3, 123);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should pass through only numbers', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([1, 2, 3]).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should filter out strings', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([42, 'test', '123', 99, 'hello']).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 42);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 99);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should filter out booleans', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([1, true, false, 2]).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 1);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 2);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should filter out objects', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([42, { key: 'value' }, 99, [1, 2, 3]])
      .pipe(filterNumber())
      .subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 42);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 99);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle zero', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([1, 0, -1]).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 1);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 0);
    expect(observerSpy.next).toHaveBeenNthCalledWith(3, -1);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle negative numbers', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([42, -99, 0, -3.14]).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(4);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 42);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, -99);
    expect(observerSpy.next).toHaveBeenNthCalledWith(3, 0);
    expect(observerSpy.next).toHaveBeenNthCalledWith(4, -3.14);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle floating point numbers', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([1.5, 'test', 2.7, true, 3.14159]).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 1.5);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 2.7);
    expect(observerSpy.next).toHaveBeenNthCalledWith(3, 3.14159);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle NaN', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([1, NaN, 2]).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 1);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, NaN);
    expect(observerSpy.next).toHaveBeenNthCalledWith(3, 2);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle Infinity', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([1, Infinity, -Infinity, 2]).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(4);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 1);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, Infinity);
    expect(observerSpy.next).toHaveBeenNthCalledWith(3, -Infinity);
    expect(observerSpy.next).toHaveBeenNthCalledWith(4, 2);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should filter out null and undefined', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([null, undefined, 42]).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(1);
    expect(observerSpy.next).toHaveBeenCalledWith(42);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle stream with no numbers', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from(['a', 'b', 'c', true, false, null]).pipe(filterNumber()).subscribe(observerSpy);

    expect(observerSpy.next).not.toHaveBeenCalled();
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle mixed types correctly', () => {
    const values: number[] = [];
    from(['a', 1, 'b', {}, 2.5, [], 3])
      .pipe(filterNumber())
      .subscribe((value) => values.push(value));

    expect(values).toEqual([1, 2.5, 3]);
  });
});
