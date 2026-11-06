import { MiddleTruncatePipe } from './middle-truncate.pipe';

/**
 * The pipe only decides WHERE a name may be cut. Whether the cut is visible is
 * CSS: the head carries `truncate` and shrinks, the tail never does. So every
 * case asserts that head + tail still reconstructs the original name, and that
 * the tail keeps the part that tells two files apart.
 */
describe('MiddleTruncatePipe', () => {
  const pipe = new MiddleTruncatePipe();

  it('keeps the distinguishing end of a filename in the tail', () => {
    const result = pipe.transform('20260901_Concert_Hamburg_Cam3_0042.mov');

    expect(result.tail).toBe('_Cam3_0042.mov');
    expect(result.head).toBe('20260901_Concert_Hamburg');
  });

  it('reconstructs the original name from head and tail', () => {
    const name = '20260901_Concert_Hamburg_Cam3_0042.mov';

    const result = pipe.transform(name);

    expect(result.head + result.tail).toBe(name);
  });

  it('cuts at a delimiter rather than mid-token', () => {
    const result = pipe.transform('projekt_hamburg_sommerfest_final.mp4');

    expect(result.tail.startsWith('_')).toBe(true);
  });

  it('falls back to the minimum tail when the window holds no delimiter', () => {
    const result = pipe.transform('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

    expect(result.tail).toHaveLength(6);
    expect(result.head).toHaveLength(24);
  });

  it('never cuts more than the maximum tail', () => {
    const result = pipe.transform('a_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.mov');

    expect(result.tail.length).toBeLessThanOrEqual(16);
  });

  it('leaves a name at or below the minimum tail whole', () => {
    const result = pipe.transform('a.mov');

    expect(result.head).toBe('');
    expect(result.tail).toBe('a.mov');
  });

  it('handles an empty name without throwing', () => {
    const result = pipe.transform('');

    expect(result).toEqual({ head: '', tail: '' });
  });

  /**
   * `slice` cuts at a UTF-16 code unit, which is smaller than a character in three ways
   * that all occur in real filenames: an emoji is a surrogate pair, an accent may be its
   * own code point (macOS stores filenames NFD-decomposed, so `München` from a Finder
   * upload is `n` + U+0308), and a family emoji is several code points joined by ZWJ.
   * Cutting inside any of those leaves a fragment that renders as U+FFFD or as a stray
   * combining mark. `head + tail` still equals the input in every case, so no DOM test
   * comparing the joined text can see it.
   */
  it('never cuts an emoji in half', () => {
    const result = pipe.transform('Sommerfest🎉🎉🎉🎉🎉🎉abc');

    const lastOfHead = result.head.charCodeAt(result.head.length - 1);
    const firstOfTail = result.tail.charCodeAt(0);
    expect(lastOfHead >= 0xd800 && lastOfHead <= 0xdbff).toBe(false);
    expect(firstOfTail >= 0xdc00 && firstOfTail <= 0xdfff).toBe(false);
  });

  it('still reconstructs the name exactly when it dodges a surrogate pair', () => {
    const name = 'Sommerfest🎉🎉🎉🎉🎉🎉abc';

    const result = pipe.transform(name);

    expect(result.head + result.tail).toBe(name);
  });

  it('never separates a combining accent from its base letter', () => {
    // NFD, the form macOS writes: 'é' is 'e' + U+0301. A cut between them leaves a bare
    // 'e' on the head and a floating accent on the tail.
    const result = pipe.transform('ABCDEFGHIJKLMNOPQRSTUVwxyéfghij');

    expect(result.tail.charCodeAt(0)).not.toBe(0x0301);
    expect(result.head.endsWith('e')).toBe(false);
  });

  it('never splits a ZWJ emoji sequence', () => {
    const result = pipe.transform('TeamfotoXY\u{1F468}‍\u{1F469}‍\u{1F467}end');

    expect(result.tail.charCodeAt(0)).not.toBe(0x200d);
  });

  // Holds for clusters shorter than the tail budget. A longer one is covered below, where
  // cluster integrity wins over the bound.
  it('keeps the tail within bounds for a cluster shorter than the budget', () => {
    const result = pipe.transform('TeamfotoXY\u{1F468}‍\u{1F469}‍\u{1F467}end');

    expect(result.tail.length).toBeGreaterThanOrEqual(6);
    expect(result.tail.length).toBeLessThanOrEqual(16);
  });

  /**
   * A grapheme cluster has no length limit, so the cut can land inside one that is longer
   * than the whole tail budget. Snapping backwards then walks all the way to index 0 and
   * puts the entire name in the tail, which is not middle truncation any more: the head is
   * what shrinks, so an empty head means nothing is displayed on the left at all.
   */
  it('never leaves the head empty when a long cluster spans the cut', () => {
    // A family emoji is 11 code units, so the very first cluster reaches past the cut.
    const result = pipe.transform('\u{1F468}‍\u{1F469}‍\u{1F467}ab');

    expect(result.head).not.toBe('');
  });

  it('never leaves the head empty for a long combining-mark run', () => {
    const result = pipe.transform(`A${'́'.repeat(40)}abc`);

    expect(result.head).not.toBe('');
  });

  it('keeps every grapheme intact even when the cluster is longer than the tail budget', () => {
    // Family with skin-tone modifiers: 19 code units, wider than MAX_TAIL.
    const name = 'abcdefgh\u{1F468}\u{1F3FB}‍\u{1F469}\u{1F3FD}‍\u{1F467}\u{1F3FC}‍\u{1F466}\u{1F3FE}xy';

    const result = pipe.transform(name);

    expect(result.head + result.tail).toBe(name);
    // The bound yields to cluster integrity; what must never happen is a split cluster.
    expect(result.tail.charCodeAt(0)).not.toBe(0x200d);
    expect(result.head).not.toBe('');
  });

  it('does not lose a name made only of whitespace', () => {
    const name = '          ';

    const result = pipe.transform(name);

    expect(result.head + result.tail).toBe(name);
  });

  it('handles a name made only of delimiters', () => {
    const name = '____________________';

    const result = pipe.transform(name);

    expect(result.head + result.tail).toBe(name);
    expect(result.tail.length).toBeGreaterThanOrEqual(6);
    expect(result.tail.length).toBeLessThanOrEqual(16);
  });
});
