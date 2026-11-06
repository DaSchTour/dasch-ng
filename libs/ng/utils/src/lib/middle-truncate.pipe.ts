import { Pipe, PipeTransform } from '@angular/core';

/** A string split for middle truncation. The head shrinks in CSS; the tail never does. */
export interface MiddleTruncated {
  head: string;
  tail: string;
}

const DELIMITERS = new Set(['_', '-', '.', ' ']);
/** Built once: a Segmenter per call would run for every item of a long list. */
const GRAPHEMES = new Intl.Segmenter();
const MIN_TAIL = 6;
const MAX_TAIL = 16;

/**
 * Splits a string so that its end survives truncation, e.g. a filename whose take number
 * or extension tells it apart from its neighbours.
 *
 * Render the head with `text-overflow: ellipsis` and let it shrink; keep the tail at full
 * width. The ellipsis then lands in the middle without measuring text:
 *
 * ```html
 * @let name = file.name | middleTruncate;
 * <span class="name" [title]="file.name">
 *   <span class="head">{{ name.head }}</span><span class="tail">{{ name.tail }}</span>
 * </span>
 * ```
 * ```css
 * .name { display: flex; min-width: 0; }
 * .head { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
 * .tail { flex-shrink: 0; white-space: pre; }
 * ```
 *
 * The cut goes to a delimiter (`_ - . space`) within the last 16 characters, preferring
 * the longest tail, so no token is cut in half. Without a delimiter the tail is 6
 * characters. Cuts never split a grapheme (emoji, combining accents, ZWJ sequences).
 */
@Pipe({ name: 'middleTruncate' })
export class MiddleTruncatePipe implements PipeTransform {
  transform(value: string | null | undefined): MiddleTruncated {
    if (!value) {
      return { head: '', tail: '' };
    }
    if (value.length <= MIN_TAIL) {
      return { head: '', tail: value };
    }

    const windowStart = Math.max(0, value.length - MAX_TAIL);
    const windowEnd = value.length - MIN_TAIL;

    for (let index = windowStart; index <= windowEnd; index++) {
      if (DELIMITERS.has(value[index])) {
        return { head: value.slice(0, index), tail: value.slice(index) };
      }
    }

    return splitAtGrapheme(value, windowEnd);
  }
}

/**
 * Splits at the grapheme boundary at or before `index`. `slice` counts UTF-16 code units,
 * so a plain cut could split a surrogate pair, a decomposed accent or a ZWJ emoji.
 *
 * If that boundary is 0 (one long cluster spans the cut), the cut moves forward to the next
 * boundary so the head is not empty. The tail length is then a target, not a guarantee.
 * Delimiters need no such check: they are ASCII, and ASCII is always its own grapheme.
 */
function splitAtGrapheme(value: string, index: number): MiddleTruncated {
  let cut = 0;
  let firstAfter = value.length;
  for (const { index: start } of GRAPHEMES.segment(value)) {
    if (start > index) {
      firstAfter = start;
      break;
    }
    cut = start;
  }
  if (cut === 0) {
    cut = firstAfter;
  }
  return { head: value.slice(0, cut), tail: value.slice(cut) };
}
