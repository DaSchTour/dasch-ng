import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OmitPipe } from './omit.pipe';
import { ParseJsonPipe } from './parse-json.pipe';
import { UpperFirstPipe } from './upper-first.pipe';
import { ValuesPipe } from './values.pipe';
import { WithoutPipe } from './without.pipe';

describe('OmitPipe', () => {
  const pipe = new OmitPipe();

  it('removes keys without changing the input', () => {
    const user = { name: 'Ada', password: 'x', token: 'y' };
    expect(pipe.transform(user, 'password', 'token')).toEqual({ name: 'Ada' });
    expect(user).toEqual({ name: 'Ada', password: 'x', token: 'y' });
  });

  it('returns null for nullish input', () => {
    expect(pipe.transform(null as { a?: number } | null, 'a')).toBeNull();
  });
});

describe('WithoutPipe', () => {
  const pipe = new WithoutPipe();

  it('removes the given values', () => {
    expect(pipe.transform([1, 2, 3, 2], 2)).toEqual([1, 3]);
    expect(pipe.transform(new Set(['a', 'b', 'c']), 'a', 'c')).toEqual(['b']);
    expect(pipe.transform([1, 2], ...[])).toEqual([1, 2]);
  });

  it('returns an empty array for nullish input', () => {
    expect(pipe.transform(null, 1)).toEqual([]);
  });
});

describe('ValuesPipe', () => {
  const pipe = new ValuesPipe();

  it('returns values of maps, sets and objects in insertion order', () => {
    expect(
      pipe.transform(
        new Map([
          ['b', 2],
          ['a', 1],
        ]),
      ),
    ).toEqual([2, 1]);
    expect(pipe.transform(new Set(['x', 'y']))).toEqual(['x', 'y']);
    expect(pipe.transform({ b: 2, a: 1 })).toEqual([2, 1]);
    expect(pipe.transform(undefined)).toEqual([]);
  });
});

describe('ParseJsonPipe', () => {
  const pipe = new ParseJsonPipe();

  it('parses valid JSON', () => {
    expect(pipe.transform('{"a":[1,2]}')).toEqual({ a: [1, 2] });
    expect(pipe.transform('false')).toBe(false);
  });

  it('returns null for invalid JSON and non-strings', () => {
    expect(pipe.transform('{a:1}')).toBeNull();
    expect(pipe.transform('')).toBeNull();
    expect(pipe.transform(42)).toBeNull();
    expect(pipe.transform(null)).toBeNull();
  });
});

describe('UpperFirstPipe', () => {
  const create = (locale = 'en-US') => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [UpperFirstPipe, { provide: LOCALE_ID, useValue: locale }] });
    return TestBed.inject(UpperFirstPipe);
  };

  it('uppercases only the first character', () => {
    expect(create().transform('hello World')).toBe('Hello World');
    expect(create().transform('ärger')).toBe('Ärger');
    expect(create().transform('')).toBe('');
    expect(create().transform(null)).toBe('');
  });

  it('follows locale rules', () => {
    expect(create('tr').transform('istanbul')).toBe('İstanbul');
    expect(create().transform('istanbul', 'tr')).toBe('İstanbul');
    expect(create().transform('istanbul')).toBe('Istanbul');
  });

  it('keeps a leading surrogate pair intact', () => {
    expect(create().transform('𝒶bc')).toBe('𝒶bc');
  });
});
