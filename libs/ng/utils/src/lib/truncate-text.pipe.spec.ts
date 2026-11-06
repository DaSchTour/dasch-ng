import { TruncateTextPipe } from './truncate-text.pipe';

describe('TruncateTextPipe', () => {
  const pipe = new TruncateTextPipe();

  it('returns short text unchanged', () => {
    expect(pipe.transform('short text', 20)).toBe('short text');
    expect(pipe.transform('exactly ten', 11)).toBe('exactly ten');
  });

  it('cuts at the last space before the limit', () => {
    expect(pipe.transform('The quick brown fox jumps', 18)).toBe('The quick brown…');
  });

  it('never exceeds the limit before the ellipsis', () => {
    const result = pipe.transform('word '.repeat(100), 37);
    expect(result.length).toBeLessThanOrEqual(38);
    expect(result.endsWith('…')).toBe(true);
  });

  it('cuts hard when the only space is in the first half', () => {
    expect(pipe.transform('a verylongwordwithoutanyspaces', 10)).toBe('a verylong…');
  });

  it('defaults to 160 characters', () => {
    expect(pipe.transform('x'.repeat(200))).toBe(`${'x'.repeat(160)}…`);
  });

  it('returns an empty string for nullish input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
