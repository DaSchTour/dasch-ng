import { from } from 'rxjs';
import { filterError } from './filter-error';

describe('filterError()', () => {
  it('should filter out non-error values', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    const error1 = new Error('error 1');
    const error2 = new Error('error 2');

    from([error1, 'string', 42, true, null, undefined, error2]).pipe(filterError()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, error1);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, error2);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should pass through only Error instances', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    const error1 = new Error('test 1');
    const error2 = new Error('test 2');
    const error3 = new Error('test 3');

    from([error1, error2, error3]).pipe(filterError()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle different Error types', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    const error = new Error('generic error');
    const typeError = new TypeError('type error');
    const rangeError = new RangeError('range error');
    const referenceError = new ReferenceError('reference error');

    from([error, 'string', typeError, 123, rangeError, referenceError]).pipe(filterError()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(4);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, error);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, typeError);
    expect(observerSpy.next).toHaveBeenNthCalledWith(3, rangeError);
    expect(observerSpy.next).toHaveBeenNthCalledWith(4, referenceError);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should filter out objects that look like errors', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    const realError = new Error('real error');
    const fakeError = { message: 'fake error', stack: 'stack trace' };

    from([realError, fakeError, 'string']).pipe(filterError()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(1);
    expect(observerSpy.next).toHaveBeenCalledWith(realError);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle custom Error subclasses', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    class CustomError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'CustomError';
      }
    }

    const customError = new CustomError('custom error');
    const standardError = new Error('standard error');

    from([customError, 'test', standardError]).pipe(filterError()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, customError);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, standardError);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle stream with no errors', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    from(['string', 123, true, null, { key: 'value' }])
      .pipe(filterError())
      .subscribe(observerSpy);

    expect(observerSpy.next).not.toHaveBeenCalled();
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should collect error values correctly', () => {
    const errors: Error[] = [];
    const error1 = new Error('error 1');
    const error2 = new TypeError('error 2');

    from([error1, 'test', 123, error2])
      .pipe(filterError())
      .subscribe((error) => errors.push(error));

    expect(errors).toHaveLength(2);
    expect(errors[0]).toBe(error1);
    expect(errors[1]).toBe(error2);
  });

  it('should preserve error properties', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    const error = new Error('test error');
    error.stack = 'custom stack';

    from([error]).pipe(filterError()).subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledTimes(1);
    const receivedError = observerSpy.next.mock.calls[0][0];
    expect(receivedError.message).toBe('test error');
    expect(receivedError.stack).toBe('custom stack');
  });
});
