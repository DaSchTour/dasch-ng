import { from } from 'rxjs';
import { filterString } from './filter-string';

describe('filterString()', () => {
  it('should filter out non-string values', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from(['hello', 42, 'world', true, false, null, undefined, 'test']).pipe(filterString()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 'hello');
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 'world');
    expect(observerSpy.next).toHaveBeenNthCalledWith(3, 'test');
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should pass through only strings', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from(['one', 'two', 'three']).pipe(filterString()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should filter out numbers', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from(['test', 1, 2, 3, 'hello']).pipe(filterString()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 'test');
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 'hello');
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should filter out booleans', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from(['yes', true, false, 'no']).pipe(filterString()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 'yes');
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 'no');
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should filter out objects', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from(['string', { key: 'value' }, 'another string', [1, 2, 3]])
      .pipe(filterString())
      .subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 'string');
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 'another string');
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle empty strings', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from(['hello', '', 'world']).pipe(filterString()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 'hello');
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, '');
    expect(observerSpy.next).toHaveBeenNthCalledWith(3, 'world');
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should filter out null and undefined', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([null, undefined, 'test']).pipe(filterString()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(1);
    expect(observerSpy.next).toHaveBeenCalledWith('test');
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle stream with no strings', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from([1, 2, 3, true, false, null]).pipe(filterString()).subscribe(observerSpy);

    expect(observerSpy.next).not.toHaveBeenCalled();
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle mixed types correctly', () => {
    const values: string[] = [];
    from(['a', 1, 'b', {}, 'c', [], 'd'])
      .pipe(filterString())
      .subscribe((value) => values.push(value));

    expect(values).toEqual(['a', 'b', 'c', 'd']);
  });
});
