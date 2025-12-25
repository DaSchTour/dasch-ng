import { of, throwError } from 'rxjs';
import { debug } from './debug-operator';

describe('debug()', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log next notifications without label', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    of(1, 2, 3).pipe(debug()).subscribe(observerSpy);

    expect(consoleLogSpy).toHaveBeenCalledTimes(4); // 3 next + 1 complete
    expect(observerSpy.next).toHaveBeenCalledWith(1);
    expect(observerSpy.next).toHaveBeenCalledWith(2);
    expect(observerSpy.next).toHaveBeenCalledWith(3);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should log next notifications with label', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    of(1, 2, 3).pipe(debug('test-stream')).subscribe(observerSpy);

    expect(consoleLogSpy).toHaveBeenCalledTimes(4); // 3 next + 1 complete
    expect(consoleLogSpy.mock.calls[0][0]).toBe('test-stream');
    expect(consoleLogSpy.mock.calls[1][0]).toBe('test-stream');
    expect(consoleLogSpy.mock.calls[2][0]).toBe('test-stream');
    expect(consoleLogSpy.mock.calls[3][0]).toBe('test-stream');
    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should log error notifications', () => {
    const observerSpy = {
      next: vi.fn(),
      error: vi.fn(),
    };

    const error = new Error('test error');
    throwError(() => error)
      .pipe(debug('error-stream'))
      .subscribe(observerSpy);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy.mock.calls[0][0]).toBe('error-stream');
    expect(observerSpy.error).toHaveBeenCalledWith(error);
    expect(observerSpy.next).not.toHaveBeenCalled();
  });

  it('should log complete notifications', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    of().pipe(debug('empty-stream')).subscribe(observerSpy);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1); // just complete
    expect(consoleLogSpy.mock.calls[0][0]).toBe('empty-stream');
    expect(observerSpy.next).not.toHaveBeenCalled();
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should pass through values unchanged', () => {
    const values: number[] = [];
    of(1, 2, 3)
      .pipe(debug())
      .subscribe((value) => values.push(value));

    expect(values).toEqual([1, 2, 3]);
  });

  it('should handle complex values', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    const complexValues = [{ id: 1, name: 'test' }, [1, 2, 3], 'string', null, undefined];

    of(...complexValues)
      .pipe(debug('complex'))
      .subscribe(observerSpy);

    expect(consoleLogSpy).toHaveBeenCalledTimes(6); // 5 next + 1 complete
    expect(observerSpy.next).toHaveBeenCalledTimes(5);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should log notifications in correct order', () => {
    of(1, 2, 3).pipe(debug('ordered')).subscribe();

    expect(consoleLogSpy).toHaveBeenCalledTimes(4);
    // Check that notifications contain 'N' for next values
    expect(consoleLogSpy.mock.calls[0][1]).toMatchObject({ kind: 'N', value: 1 });
    expect(consoleLogSpy.mock.calls[1][1]).toMatchObject({ kind: 'N', value: 2 });
    expect(consoleLogSpy.mock.calls[2][1]).toMatchObject({ kind: 'N', value: 3 });
    expect(consoleLogSpy.mock.calls[3][1]).toMatchObject({ kind: 'C' });
  });
});
