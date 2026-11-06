import { deserializeDateRange, deserializeMinMaxRange, serializeDateRange, serializeMinMaxRange } from './query-param-codecs';

describe('serializeMinMaxRange / deserializeMinMaxRange', () => {
  it('serializes both bounds into a compact dash form', () => {
    expect(serializeMinMaxRange({ min: 5, max: 100 })).toBe('5-100');
  });

  it('serializes a one-sided bound, leaving the other side empty', () => {
    expect(serializeMinMaxRange({ min: 5 })).toBe('5-');
    expect(serializeMinMaxRange({ max: 100 })).toBe('-100');
  });

  it('returns null for an empty or nullish value, removing the param', () => {
    expect(serializeMinMaxRange(null)).toBeNull();
    expect(serializeMinMaxRange(undefined)).toBeNull();
    expect(serializeMinMaxRange({})).toBeNull();
  });

  it('round-trips through deserialize', () => {
    expect(deserializeMinMaxRange('5-100')).toEqual({ min: 5, max: 100 });
    expect(deserializeMinMaxRange('5-')).toEqual({ min: 5, max: undefined });
    expect(deserializeMinMaxRange('-100')).toEqual({ min: undefined, max: 100 });
  });
});

describe('serializeDateRange / deserializeDateRange', () => {
  it('serializes both bounds as comma-separated ISO calendar dates', () => {
    expect(serializeDateRange({ start: new Date(2026, 0, 1), end: new Date(2026, 1, 15) })).toBe('2026-01-01,2026-02-15');
  });

  it('serializes a one-sided bound, leaving the other side empty', () => {
    expect(serializeDateRange({ start: new Date(2026, 0, 1) })).toBe('2026-01-01,');
    expect(serializeDateRange({ end: new Date(2026, 1, 15) })).toBe(',2026-02-15');
  });

  it('returns null for an empty or nullish value, removing the param', () => {
    expect(serializeDateRange(null)).toBeNull();
    expect(serializeDateRange(undefined)).toBeNull();
    expect(serializeDateRange({ start: null, end: null })).toBeNull();
  });

  it('round-trips through deserialize as local calendar dates', () => {
    const result = deserializeDateRange('2026-01-01,2026-02-15');
    expect(result.start).toEqual(new Date(2026, 0, 1));
    expect(result.end).toEqual(new Date(2026, 1, 15));
  });

  it('deserializes a one-sided range', () => {
    expect(deserializeDateRange('2026-01-01,')).toEqual({ start: new Date(2026, 0, 1), end: null });
    expect(deserializeDateRange(',2026-02-15')).toEqual({ start: null, end: new Date(2026, 1, 15) });
  });
});

describe('invalid input', () => {
  it('ignores non-numeric range bounds', () => {
    expect(deserializeMinMaxRange('abc-10')).toEqual({ min: undefined, max: 10 });
  });

  it('ignores malformed dates', () => {
    expect(deserializeDateRange('2026-01,nope')).toEqual({ start: null, end: null });
  });
});
