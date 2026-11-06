import { TimeoutError } from 'rxjs';
import { pollUntil } from './poll-until';

describe('pollUntil()', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('emits an available value synchronously and completes', () => {
    const next = vi.fn();
    const complete = vi.fn();

    pollUntil(() => 'token').subscribe({ next, complete });

    expect(next).toHaveBeenCalledWith('token');
    expect(complete).toHaveBeenCalled();
  });

  it('polls until the value is ready', () => {
    let value: string | undefined = undefined;
    const next = vi.fn();
    const read = vi.fn(() => value);

    pollUntil(read, { interval: 50 }).subscribe(next);
    vi.advanceTimersByTime(120);
    expect(next).not.toHaveBeenCalled();
    expect(read).toHaveBeenCalledTimes(3);

    value = 'late';
    vi.advanceTimersByTime(50);
    expect(next).toHaveBeenCalledExactlyOnceWith('late');

    vi.advanceTimersByTime(500);
    expect(read).toHaveBeenCalledTimes(4);
  });

  it('errors with TimeoutError when the value never arrives', () => {
    const error = vi.fn();

    pollUntil(() => null, { timeout: 300 }).subscribe({ error });
    vi.advanceTimersByTime(300);

    expect(error).toHaveBeenCalledWith(expect.any(TimeoutError));
  });

  it('accepts a custom ready check and treats 0 as present by default', () => {
    const next = vi.fn();
    let count = 0;

    pollUntil(() => count++, { ready: (n) => n >= 2 }).subscribe(next);
    vi.advanceTimersByTime(300);
    expect(next).toHaveBeenCalledExactlyOnceWith(2);

    const zero = vi.fn();
    pollUntil(() => 0).subscribe(zero);
    expect(zero).toHaveBeenCalledWith(0);
  });

  it('can wait without a timeout', () => {
    const error = vi.fn();

    const subscription = pollUntil(() => undefined, { timeout: Infinity }).subscribe({ error });
    vi.advanceTimersByTime(60_000);

    expect(error).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });
});
