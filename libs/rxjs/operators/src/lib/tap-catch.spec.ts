import { of, throwError } from 'rxjs';
import { tapCatch } from './tap-catch';

describe('tapCatch()', () => {
  it('should execute next callback for successful emissions', () => {
    const nextSpy = vi.fn();
    const errorSpy = vi.fn();
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    of(1, 2, 3)
      .pipe(
        tapCatch({
          next: nextSpy,
          error: errorSpy,
        }),
      )
      .subscribe(observerSpy);

    expect(nextSpy).toHaveBeenCalledTimes(3);
    expect(nextSpy).toHaveBeenNthCalledWith(1, 1);
    expect(nextSpy).toHaveBeenNthCalledWith(2, 2);
    expect(nextSpy).toHaveBeenNthCalledWith(3, 3);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should execute error callback when an error occurs', () => {
    const nextSpy = vi.fn();
    const errorSpy = vi.fn((err) => of('fallback'));
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    const error = new Error('test error');

    throwError(() => error)
      .pipe(
        tapCatch({
          next: nextSpy,
          error: errorSpy,
        }),
      )
      .subscribe(observerSpy);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toBe(error);
    expect(observerSpy.next).toHaveBeenCalledWith('fallback');
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should pass through values unchanged', () => {
    const values: number[] = [];
    const nextSpy = vi.fn();

    of(1, 2, 3)
      .pipe(
        tapCatch({
          next: nextSpy,
          error: () => of(0),
        }),
      )
      .subscribe((value) => values.push(value));

    expect(values).toEqual([1, 2, 3]);
  });

  it('should provide caught observable to error handler', () => {
    const errorSpy = vi.fn((err, caught) => caught);
    const observerSpy = {
      next: vi.fn(),
      error: vi.fn(),
    };

    let callCount = 0;
    throwError(() => new Error('test'))
      .pipe(
        tapCatch({
          next: () => {
            // Empty handler for testing error path
          },
          error: (err, caught) => {
            callCount++;
            if (callCount > 3) {
              return of('stopped');
            }
            return caught;
          },
        }),
      )
      .subscribe(observerSpy);

    expect(callCount).toBe(4);
    expect(observerSpy.next).toHaveBeenCalledWith('stopped');
  });

  it('should handle multiple errors in sequence', () => {
    const nextSpy = vi.fn();
    const errorSpy = vi.fn(() => of('recovered'));
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    throwError(() => new Error('error'))
      .pipe(
        tapCatch({
          next: nextSpy,
          error: errorSpy,
        }),
      )
      .subscribe(observerSpy);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(observerSpy.next).toHaveBeenCalledWith('recovered');
  });

  it('should execute side effects in next without affecting stream', () => {
    let sideEffectValue = 0;
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    of(1, 2, 3)
      .pipe(
        tapCatch({
          next: (value) => {
            sideEffectValue += value;
          },
          error: () => of(0),
        }),
      )
      .subscribe(observerSpy);

    expect(sideEffectValue).toBe(6);
    expect(observerSpy.next).toHaveBeenCalledTimes(3);
    expect(observerSpy.next).toHaveBeenNthCalledWith(1, 1);
    expect(observerSpy.next).toHaveBeenNthCalledWith(2, 2);
    expect(observerSpy.next).toHaveBeenNthCalledWith(3, 3);
  });

  it('should handle complex recovery logic', () => {
    const nextSpy = vi.fn();
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    throwError(() => new Error('API failed'))
      .pipe(
        tapCatch({
          next: nextSpy,
          error: (err) => {
            if (err instanceof Error && err.message === 'API failed') {
              return of('default value');
            }
            return throwError(() => err);
          },
        }),
      )
      .subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledWith('default value');
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should handle empty observable', () => {
    const nextSpy = vi.fn();
    const errorSpy = vi.fn();
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    of()
      .pipe(
        tapCatch({
          next: nextSpy,
          error: errorSpy,
        }),
      )
      .subscribe(observerSpy);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(observerSpy.next).not.toHaveBeenCalled();
    expect(observerSpy.complete).toHaveBeenCalledTimes(1);
  });

  it('should preserve error type in error handler', () => {
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
    };

    const typeError = new TypeError('type error');

    throwError(() => typeError)
      .pipe(
        tapCatch({
          next: () => {
            // Empty handler for testing error path
          },
          error: (err) => {
            expect(err).toBeInstanceOf(TypeError);
            expect(err).toBe(typeError);
            return of('handled');
          },
        }),
      )
      .subscribe(observerSpy);

    expect(observerSpy.next).toHaveBeenCalledWith('handled');
  });

  it('should combine tap side effects with catchError recovery', () => {
    const logs: string[] = [];
    const observerSpy = {
      next: vi.fn(),
      complete: vi.fn(),
      error: vi.fn(),
    };

    of(1, 2)
      .pipe(
        tapCatch({
          next: (value) => logs.push(`value: ${value}`),
          error: (err) => {
            logs.push(`error: ${err.message}`);
            return of(999);
          },
        }),
      )
      .subscribe(observerSpy);

    expect(logs).toEqual(['value: 1', 'value: 2']);
    expect(observerSpy.next).toHaveBeenCalledTimes(2);
    expect(observerSpy.error).not.toHaveBeenCalled();
  });
});
