import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Logger, LOG_SINK, LogSink, provideLogger, provideLoggerErrorHandler } from './logger';

function setup(config: Parameters<typeof provideLogger>[0] = {}, sink: Partial<LogSink> = {}) {
  const capture = vi.fn();
  const captureException = vi.fn();
  TestBed.configureTestingModule({
    providers: [provideLogger(config), { provide: LOG_SINK, useValue: { capture, captureException, ...sink }, multi: true }, provideLoggerErrorHandler()],
  });
  return { logger: TestBed.inject(Logger), capture, captureException };
}

describe('Logger', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sends entries with context to every sink', () => {
    const capture = vi.fn();
    const second = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: LOG_SINK, useValue: { capture }, multi: true },
        { provide: LOG_SINK, useValue: { capture: second }, multi: true },
      ],
    });

    TestBed.inject(Logger).warn('low', { used: 95 });

    expect(capture).toHaveBeenCalledWith('warn', 'low', { used: 95 });
    expect(second).toHaveBeenCalledWith('warn', 'low', { used: 95 });
  });

  it('drops entries below the minimum level', () => {
    const { logger, capture } = setup({ minLevel: 'warn' });

    logger.debug('a');
    logger.info('b');
    logger.warn('c');
    logger.error('d');

    expect(capture.mock.calls.map((call) => call[1])).toEqual(['c', 'd']);
  });

  it('prints to the console only when enabled', () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    setup({ console: false }).logger.info('quiet');
    expect(log).not.toHaveBeenCalled();

    TestBed.resetTestingModule();
    setup({ console: true }).logger.info('loud', 1);
    expect(log).toHaveBeenCalledWith('loud', 1);
  });

  it('survives a throwing sink', () => {
    const { logger } = setup(
      { console: false },
      {
        capture: () => {
          throw new Error('sink down');
        },
      },
    );

    expect(() => logger.error('x')).not.toThrow();
  });

  it('routes uncaught errors through the sinks', () => {
    const error = new Error('boom');
    const { captureException } = setup({ console: false });

    TestBed.inject(ErrorHandler).handleError(error);

    expect(captureException).toHaveBeenCalledWith(error);
  });

  it('works without any sink', () => {
    TestBed.configureTestingModule({ providers: [provideLogger({ console: false })] });
    expect(() => TestBed.inject(Logger).error('x')).not.toThrow();
  });
});
