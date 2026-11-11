import { compact, isoDuration, serializeJsonLd } from './json-ld';

describe('serializeJsonLd', () => {
  it('cannot be used to close the script tag', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>', note: '<!-- x -->' });
    expect(out).not.toMatch(/[<>]/);
    expect(out).not.toContain('</script');
  });

  it('escapes ampersands and line separators', () => {
    const out = serializeJsonLd({ a: 'Tom & Jerry', b: '\u2028\u2029' });
    expect(out).not.toContain('&');
    expect(out).not.toMatch(/[\u2028\u2029]/);
  });

  it('round-trips through JSON.parse', () => {
    const data = { '@type': 'Thing', name: '</script> & <b>\u2028', list: [1, null, 'x'] };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it('escapes hostile keys too', () => {
    expect(serializeJsonLd({ '</script>': 1 })).not.toContain('<');
  });

  it('returns valid JSON for undefined', () => {
    expect(serializeJsonLd(undefined)).toBe('null');
  });
});

describe('isoDuration', () => {
  it.each([
    [0, 'PT0S'],
    [1500, 'PT1.5S'],
    [60_000, 'PT1M'],
    [61_000, 'PT1M1S'],
    [3_600_000, 'PT1H'],
    [3_723_000, 'PT1H2M3S'],
    [90_000_000, 'PT25H'],
    [999.9, 'PT0.999S'],
  ])('%d ms is %s', (ms, expected) => {
    expect(isoDuration(ms)).toBe(expected);
  });

  it.each([-1, NaN, Infinity])('rejects %s', (ms) => {
    expect(() => isoDuration(ms)).toThrow(RangeError);
  });
});

describe('compact', () => {
  it('drops null, undefined and empty values recursively but keeps 0 and false', () => {
    expect(
      compact({
        a: null,
        b: undefined,
        c: '',
        d: [],
        e: {},
        f: 0,
        g: false,
        h: { i: null, j: 'x', k: { l: '' } },
        m: [null, 'y', {}, { n: undefined }],
      }),
    ).toEqual({ f: 0, g: false, h: { j: 'x' }, m: ['y'] });
  });

  it('keeps class instances such as Date', () => {
    const date = new Date(0);
    expect(compact({ date })).toEqual({ date });
  });
});
