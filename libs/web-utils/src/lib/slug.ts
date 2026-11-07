export interface SlugOptions {
  /** Maximum length; longer slugs are cut at a word boundary. Default `80`. */
  maxLength?: number;
  /** Used when the value has no Latin letters or digits, reduced the same way. Default `''`. */
  fallback?: string;
  /** Write German umlauts and `ß` out (`ü` → `ue`) instead of dropping the accent. Default `true`. */
  expandUmlauts?: boolean;
}

const UMLAUTS: ReadonlyArray<[RegExp, string]> = [
  [/ä/g, 'ae'],
  [/ö/g, 'oe'],
  [/ü/g, 'ue'],
  [/ß/g, 'ss'],
];

/** Latin letters that Unicode decomposition does not reduce to a base letter. */
const UNDECOMPOSABLE: ReadonlyArray<[RegExp, string]> = [
  [/æ/g, 'ae'],
  [/œ/g, 'oe'],
  [/ø/g, 'o'],
  [/ł/g, 'l'],
  [/đ/g, 'd'],
  [/ð/g, 'd'],
  [/þ/g, 'th'],
  [/ı/g, 'i'],
  [/ß/g, 'ss'],
];

const replaceAll = (value: string, table: ReadonlyArray<[RegExp, string]>) =>
  table.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);

function reduce(value: string, expandUmlauts: boolean): string {
  // NFC first: the tables match precomposed characters, and macOS file names are often NFD.
  let text = value.normalize('NFC').toLowerCase();
  if (expandUmlauts) {
    text = replaceAll(text, UMLAUTS);
  }
  return replaceAll(text, UNDECOMPOSABLE)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function truncate(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) {
    return slug;
  }
  const cut = slug.slice(0, maxLength);
  const boundary = cut.lastIndexOf('-');
  return boundary > 0 ? cut.slice(0, boundary) : cut;
}

/**
 * Turns text into a URL slug of `[a-z0-9-]`: lowercased, accents removed, German umlauts
 * written out, everything else collapsed into single dashes, cut at a word boundary.
 * NFC and NFD spellings of the same text give the same slug.
 *
 * @example
 * ```typescript
 * toSlug('Grüne Wälder über Köln');                 // 'gruene-waelder-ueber-koeln'
 * toSlug('Café au Łódź');                           // 'cafe-au-lodz'
 * toSlug('Grün', { expandUmlauts: false });         // 'grun'
 * toSlug('東京', { fallback: 'item-42' });           // 'item-42'
 * ```
 */
export function toSlug(value: string | null | undefined, options: SlugOptions = {}): string {
  const { maxLength = 80, fallback = '', expandUmlauts = true } = options;
  const slug = reduce(value ?? '', expandUmlauts) || reduce(fallback, expandUmlauts);
  return truncate(slug, maxLength);
}
