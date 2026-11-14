export interface FuzzySearchOptions<T> {
  /** Properties to search in. Required for objects, ignored for plain strings. */
  keys?: ReadonlyArray<keyof T & string>;
}

/** Lowercases and removes accents, so `Café` and `cafe` compare equal. */
function fold(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

/** Whether `query` appears in `text` with at most one typo (one letter added, missing or wrong). */
function containsWithOneTypo(text: string, query: string): boolean {
  let previous = new Array<number>(text.length + 1).fill(0);
  for (let i = 1; i <= query.length; i++) {
    const current = [i];
    for (let j = 1; j <= text.length; j++) {
      current[j] = Math.min(previous[j - 1] + (query[i - 1] === text[j - 1] ? 0 : 1), previous[j] + 1, current[j - 1] + 1);
    }
    previous = current;
  }
  return Math.min(...previous) <= 1;
}

/** 0 = exact, 1 = contains, 2 = contains with one typo, `Infinity` = no match. */
function scoreText(text: string, query: string): number {
  if (text === query) return 0;
  if (text.includes(query)) return 1;
  // shortcut: queries under 3 letters get no typo tolerance (nearly everything would match), revisit if short queries need it.
  return query.length >= 3 && containsWithOneTypo(text, query) ? 2 : Infinity;
}

/**
 * Filters `items` by a case- and diacritic-insensitive "contains" match that also accepts one
 * typo. Exact matches come first, then plain matches, then typo matches; items with the same
 * rank keep their original order. An empty query returns all items.
 *
 * @example
 * ```typescript
 * fuzzySearch('cafe', ['Tea', 'Café', 'Cafeteria']);          // ['Café', 'Cafeteria']
 * fuzzySearch('Zuerich', ['Zürich', 'Bern']);                  // ['Zürich'] (one typo)
 * fuzzySearch('ann', users, { keys: ['firstName', 'email'] });
 * ```
 */
export function fuzzySearch<T>(query: string, items: readonly T[], options: FuzzySearchOptions<T> = {}): T[] {
  const needle = fold(query);
  if (!needle) return [...items];
  const { keys = [] } = options;

  return items
    .map((item) => {
      const texts = typeof item === 'object' && item !== null ? keys.map((key) => item[key]) : [item];
      return { item, score: Math.min(...texts.map((text) => scoreText(fold(text), needle))) };
    })
    .filter(({ score }) => score !== Infinity)
    .sort((a, b) => a.score - b.score) // Array.prototype.sort is stable
    .map(({ item }) => item);
}
