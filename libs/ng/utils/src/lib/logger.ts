import { ErrorHandler, inject, Injectable, InjectionToken, isDevMode, Provider } from '@angular/core';

/** Severity of a log entry, lowest first. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

/** Receives log entries, e.g. to forward them to an error tracker. Provide it with `multi: true` under {@link LOG_SINK}. */
export interface LogSink {
  /** Called for every entry at or above the minimum level. */
  capture(level: LogLevel, message: string, context?: unknown): void;
  /** Called for errors passed to {@link Logger.captureException}. */
  captureException?(error: unknown): void;
}

/** Multi-provider token for {@link LogSink}s. */
export const LOG_SINK = new InjectionToken<LogSink[]>('LOG_SINK');

/** Options for {@link provideLogger}. */
export interface LoggerConfig {
  /** Entries below this level are dropped. Default: `'debug'`. */
  minLevel?: LogLevel;
  /** Print to the browser console. Default: only in development mode. */
  console?: boolean;
}

/** Holds the {@link LoggerConfig}. Use {@link provideLogger} to set it. */
export const LOGGER_CONFIG = new InjectionToken<LoggerConfig>('LOGGER_CONFIG', {
  providedIn: 'root',
  factory: () => ({}),
});

/** Sets the {@link LoggerConfig}. */
export function provideLogger(config: LoggerConfig): Provider {
  return { provide: LOGGER_CONFIG, useValue: config };
}

/**
 * Logger with levels and a minimum level. Entries go to every {@link LOG_SINK} and, in development
 * mode (or when `console: true`), to the browser console. A sink that throws never breaks the app.
 *
 * @example
 * ```ts
 * providers: [provideLogger({ minLevel: 'info' }), { provide: LOG_SINK, useClass: MySink, multi: true }]
 * inject(Logger).warn('Quota almost used', { used: 95 });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class Logger {
  private readonly config = inject(LOGGER_CONFIG);
  private readonly sinks = inject(LOG_SINK, { optional: true }) ?? [];

  debug(message: string, context?: unknown): void {
    this.log('debug', message, context);
  }
  info(message: string, context?: unknown): void {
    this.log('info', message, context);
  }
  warn(message: string, context?: unknown): void {
    this.log('warn', message, context);
  }
  error(message: string, context?: unknown): void {
    this.log('error', message, context);
  }

  /** Reports an error to the sinks (and the console, see {@link LoggerConfig.console}). Never filtered by level. */
  captureException(error: unknown): void {
    if (this.toConsole) console.error(error);
    this.each((sink) => sink.captureException?.(error));
  }

  private get toConsole(): boolean {
    return this.config.console ?? isDevMode();
  }

  private log(level: LogLevel, message: string, context?: unknown): void {
    if (LEVELS.indexOf(level) < LEVELS.indexOf(this.config.minLevel ?? 'debug')) return;
    if (this.toConsole) console[level === 'debug' ? 'log' : level](...(context === undefined ? [message] : [message, context]));
    this.each((sink) => sink.capture(level, message, context));
  }

  private each(call: (sink: LogSink) => void): void {
    for (const sink of this.sinks) {
      try {
        call(sink);
      } catch {
        // A broken sink must not break the app or loop back through the ErrorHandler.
      }
    }
  }
}

class LoggerErrorHandler implements ErrorHandler {
  private readonly logger = inject(Logger);
  handleError(error: unknown): void {
    this.logger.captureException(error);
  }
}

/** Replaces Angular's `ErrorHandler` so uncaught errors go through the {@link Logger}. */
export function provideLoggerErrorHandler(): Provider {
  return { provide: ErrorHandler, useClass: LoggerErrorHandler };
}
