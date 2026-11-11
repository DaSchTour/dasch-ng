import { SortByPipe } from './sort-by.pipe';

describe('SortByPipe', () => {
  const pipe = new SortByPipe();
  const items = () => [{ l: 'b' }, { l: 'A' }, { l: 'c' }];
  const labels = (v: Iterable<{ l: string }> | null | undefined) => Array.from(v ?? []).map((i) => i.l);

  it('sorts case-insensitively by the given property', () => {
    expect(labels(pipe.transform(items(), 'l'))).toEqual(['A', 'b', 'c']);
  });

  it('does not mutate the input and returns a new array', () => {
    const input = items();
    const result = pipe.transform(input, 'l');
    expect(result).not.toBe(input);
    expect(input.map((i) => i.l)).toEqual(['b', 'A', 'c']);
  });

  it('works on a frozen array', () => {
    const input = Object.freeze(items());
    expect(labels(pipe.transform(input, 'l'))).toEqual(['A', 'b', 'c']);
  });

  it('accepts non-array iterables', () => {
    expect(labels(pipe.transform(new Set(items()), 'l'))).toEqual(['A', 'b', 'c']);
  });

  it('returns nullish values and unsorted input without a prop unchanged', () => {
    const input = items();
    expect(pipe.transform(null, 'l')).toBeNull();
    expect(pipe.transform(undefined, 'l')).toBeUndefined();
    expect(pipe.transform(input)).toBe(input);
    expect(pipe.transform(input, null)).toBe(input);
  });
});
