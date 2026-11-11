const ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

/**
 * Serializes data for embedding inside `<script type="application/ld+json">`.
 *
 * `<`, `>`, `&`, U+2028 and U+2029 are written as `\uXXXX` escapes, so the result is still valid JSON
 * but can never contain `</script>` or an HTML comment opener, whatever the data holds.
 *
 * @example
 * serializeJsonLd({ name: '</script><script>alert(1)</script>' });
 */
export function serializeJsonLd(data: unknown): string {
  // JSON.stringify returns undefined for undefined, functions and symbols.
  const json = JSON.stringify(data) ?? 'null';
  return json.replace(/[<>&\u2028\u2029]/g, (c) => ESCAPES[c]);
}

/**
 * Formats milliseconds as an ISO 8601 duration as used by schema.org (`PT1H2M3.5S`).
 * Hours are not rolled over into days. Sub-millisecond precision is dropped.
 *
 * @throws RangeError for negative, infinite or NaN input.
 */
export function isoDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new RangeError(`isoDuration expects a finite, non-negative number, got ${ms}`);
  }
  const total = Math.floor(ms);
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = (total % 60_000) / 1000;
  const showSeconds = seconds > 0 || (hours === 0 && minutes === 0);
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${showSeconds ? `${seconds}S` : ''}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (isPlainObject(value) && Object.keys(value).length === 0)
  );
}

function compactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(compactValue).filter((v) => !isEmpty(v));
  if (isPlainObject(value)) return compact(value);
  return value;
}

/**
 * Removes `null`, `undefined`, empty strings, empty arrays and empty objects, recursively.
 * `0` and `false` are kept. Class instances (such as `Date`) are left untouched.
 */
export function compact<T extends Record<string, unknown>>(object: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(object)) {
    const cleaned = compactValue(value);
    if (!isEmpty(cleaned)) result[key] = cleaned;
  }
  return result as Partial<T>;
}
