/**
 * Serialize/deserialize helpers for common filter shapes, for use with {@link bindQuerySignal}.
 * They give ranges a short, readable URL form instead of one parameter per field.
 */

export interface MinMaxRange {
  min?: number;
  max?: number;
}

/** `{ min: 5, max: 100 }` to `"5-100"`; a missing bound leaves its side empty (`"5-"`, `"-100"`). */
export function serializeMinMaxRange(value: MinMaxRange | null | undefined): string | null {
  if (!value || (value.min == null && value.max == null)) {
    return null;
  }
  return `${value.min ?? ''}-${value.max ?? ''}`;
}

/** `"5-100"` to `{ min: 5, max: 100 }`; empty or non-numeric sides become `undefined`. */
export function deserializeMinMaxRange(raw: string): MinMaxRange {
  const [minPart, maxPart] = raw.split('-');
  return { min: toFiniteNumber(minPart), max: toFiniteNumber(maxPart) };
}

export interface QueryDateRange {
  start?: Date | null;
  end?: Date | null;
}

/** `{ start, end }` to `"2026-01-01,2026-02-15"` (local calendar dates, comma-separated). */
export function serializeDateRange(value: QueryDateRange | null | undefined): string | null {
  if (!value || (!value.start && !value.end)) {
    return null;
  }
  return `${toIsoDate(value.start)},${toIsoDate(value.end)}`;
}

/** `"2026-01-01,2026-02-15"` to `{ start, end }` as local dates; invalid sides become `null`. */
export function deserializeDateRange(raw: string): QueryDateRange {
  const [startPart, endPart] = raw.split(',');
  return { start: fromIsoDate(startPart), end: fromIsoDate(endPart) };
}

function toFiniteNumber(raw: string | undefined): number | undefined {
  if (!raw) {
    return undefined;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

/** Local calendar date (`yyyy-MM-dd`); `toISOString()` would shift the day across UTC. */
function toIsoDate(date: Date | null | undefined): string {
  if (!date) {
    return '';
  }
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromIsoDate(raw: string | undefined): Date | null {
  if (!raw) {
    return null;
  }
  const [year, month, day] = raw.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
}
