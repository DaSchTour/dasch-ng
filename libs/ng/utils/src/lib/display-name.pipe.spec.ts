import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DisplayNamePipe } from './display-name.pipe';

describe('DisplayNamePipe', () => {
  const create = (locale = 'en-US') => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [DisplayNamePipe, { provide: LOCALE_ID, useValue: locale }] });
    return TestBed.inject(DisplayNamePipe);
  };

  it('names regions by default, in LOCALE_ID', () => {
    expect(create().transform('DE')).toBe('Germany');
    expect(create('de-DE').transform('DE')).toBe('Deutschland');
  });

  it('accepts lowercase region codes', () => {
    expect(create().transform('pl')).toBe('Poland');
  });

  it('names languages, currencies and scripts', () => {
    const pipe = create();
    expect(pipe.transform('de', 'language')).toBe('German');
    expect(pipe.transform('EUR', 'currency')).toBe('Euro');
    expect(pipe.transform('Latn', 'script')).toBe('Latin');
  });

  it('uses an optional locale argument', () => {
    expect(create().transform('FR', 'region', 'de')).toBe('Frankreich');
  });

  it('returns the code for unknown or malformed codes and empty for nullish', () => {
    const pipe = create();
    expect(pipe.transform('XY')).toBe('XY');
    expect(pipe.transform('D3')).toBe('D3');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
