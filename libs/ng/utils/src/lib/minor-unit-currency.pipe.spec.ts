import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinorUnitCurrencyPipe } from './minor-unit-currency.pipe';

describe('MinorUnitCurrencyPipe', () => {
  const create = (locale = 'en-US') => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [MinorUnitCurrencyPipe, { provide: LOCALE_ID, useValue: locale }] });
    return TestBed.inject(MinorUnitCurrencyPipe);
  };
  // Intl uses a narrow no-break space in some locales; compare on normalized spaces.
  const normalize = (value: string | null) => value?.replace(/\s/g, ' ');

  it('divides by the fraction digits of the currency', () => {
    const pipe = create();
    expect(pipe.transform(1299, 'EUR')).toBe('€12.99');
    expect(pipe.transform(1299, 'JPY')).toBe('¥1,299');
    expect(normalize(pipe.transform(12345, 'KWD'))).toBe('KWD 12.345');
  });

  it('uses LOCALE_ID and an optional locale argument', () => {
    const pipe = create('de-DE');
    expect(normalize(pipe.transform(1299, 'EUR'))).toBe('12,99 €');
    expect(pipe.transform(1299, 'EUR', 'en-US')).toBe('€12.99');
  });

  it('handles zero and negative amounts', () => {
    const pipe = create();
    expect(pipe.transform(0, 'USD')).toBe('$0.00');
    expect(pipe.transform(-250, 'USD')).toBe('-$2.50');
  });

  it('returns null for a missing amount or currency', () => {
    const pipe = create();
    expect(pipe.transform(null, 'EUR')).toBeNull();
    expect(pipe.transform(undefined, 'EUR')).toBeNull();
    expect(pipe.transform(Number.NaN, 'EUR')).toBeNull();
    expect(pipe.transform(100, '')).toBeNull();
  });
});
