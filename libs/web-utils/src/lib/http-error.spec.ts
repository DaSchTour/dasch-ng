import { describe, it, expect } from 'vitest';
import { classifyHttpError, hasHttpStatus, HttpStatus } from './http-error';

describe('classifyHttpError()', () => {
  it.each([
    [404, 'not-found'],
    [403, 'forbidden'],
    [401, 'unauthorized'],
    [500, 'server'],
    [503, 'server'],
    [0, 'network'],
    [400, 'unknown'],
    [429, 'unknown'],
  ])('maps status %i to %s', (status, kind) => {
    expect(classifyHttpError({ status })).toBe(kind);
  });

  it('reads ofetch style errors', () => {
    expect(classifyHttpError({ statusCode: 404 })).toBe('not-found');
    expect(classifyHttpError({ response: { status: 403 } })).toBe('forbidden');
    expect(classifyHttpError({ name: 'FetchError', message: 'fetch failed' })).toBe('network');
  });

  it('reads a fetch Response', () => {
    expect(classifyHttpError(new Response(null, { status: 401 }))).toBe('unauthorized');
  });

  it('treats a TypeError from fetch as network', () => {
    expect(classifyHttpError(new TypeError('Failed to fetch'))).toBe('network');
  });

  it('returns unknown for anything else', () => {
    expect(classifyHttpError(new Error('boom'))).toBe('unknown');
    expect(classifyHttpError(null)).toBe('unknown');
    expect(classifyHttpError('404')).toBe('unknown');
    expect(classifyHttpError({ status: '404' })).toBe('unknown');
  });
});

describe('hasHttpStatus()', () => {
  it('compares the status of any supported shape', () => {
    expect(hasHttpStatus({ status: 404 }, HttpStatus.NotFound)).toBe(true);
    expect(hasHttpStatus({ statusCode: 500 }, HttpStatus.NotFound)).toBe(false);
    expect(hasHttpStatus({ response: { status: 409 } }, HttpStatus.Conflict)).toBe(true);
    expect(hasHttpStatus(undefined, 404)).toBe(false);
  });
});
