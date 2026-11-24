import { describe, it, expect } from 'vitest';
import { fuzzySearch } from './fuzzy-search';

describe('fuzzySearch()', () => {
  it('ignores case and diacritics in both directions', () => {
    expect(fuzzySearch('CAFE', ['Café', 'Tea'])).toEqual(['Café']);
    expect(fuzzySearch('café', ['Cafe', 'Tea'])).toEqual(['Cafe']);
  });

  it('ranks exact before contains before typo, keeping order within a rank', () => {
    const items = ['Zürich West', 'Zurch', 'Zürich', 'Bern', 'Zürich Ost'];
    expect(fuzzySearch('zurich', items)).toEqual(['Zürich', 'Zürich West', 'Zürich Ost', 'Zurch']);
  });

  it('tolerates one missing, extra or wrong letter but not two', () => {
    expect(fuzzySearch('berln', ['Berlin'])).toEqual(['Berlin']);
    expect(fuzzySearch('berrlin', ['Berlin'])).toEqual(['Berlin']);
    expect(fuzzySearch('berlon', ['Berlin'])).toEqual(['Berlin']);
    expect(fuzzySearch('berxxn', ['Berlin'])).toEqual([]);
  });

  it('gives no typo tolerance to very short queries', () => {
    expect(fuzzySearch('ax', ['ab'])).toEqual([]);
  });

  it('searches the given keys of objects and takes the best one', () => {
    const users = [
      { name: 'Anna', mail: 'x@example.com' },
      { name: 'Bob', mail: 'anna@example.com' },
      { name: 'Carl', mail: 'c@example.com' },
    ];
    expect(fuzzySearch('anna', users, { keys: ['name', 'mail'] })).toEqual([users[0], users[1]]);
    expect(fuzzySearch('anna', users, { keys: ['mail'] })).toEqual([users[1]]);
  });

  it('ignores missing and non-string values', () => {
    const rows = [{ a: undefined, n: 42 }];
    expect(fuzzySearch('42', rows, { keys: ['a', 'n'] })).toEqual(rows);
  });

  it('returns all items for an empty query and nothing for no match', () => {
    expect(fuzzySearch('  ', ['a', 'b'])).toEqual(['a', 'b']);
    expect(fuzzySearch('zzzz', ['a', 'b'])).toEqual([]);
  });

  it('does not change the input', () => {
    const items = ['b', 'a'];
    fuzzySearch('a', items);
    expect(items).toEqual(['b', 'a']);
  });
});
