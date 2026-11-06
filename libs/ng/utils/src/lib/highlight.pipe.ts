import { Pipe, PipeTransform } from '@angular/core';

/** A piece of text and whether it matched the search term. */
export interface HighlightSegment {
  text: string;
  match: boolean;
}

/**
 * Splits text into matching and non-matching segments for a search term, case-insensitively.
 * The template renders the matches, so no HTML is built from strings and nothing needs
 * sanitizing:
 *
 * ```html
 * @for (part of label | highlight: query; track $index) {
 *   @if (part.match) {<mark>{{ part.text }}</mark>} @else {{{ part.text }}}
 * }
 * ```
 *
 * The term is matched literally; regex characters in it have no special meaning.
 */
@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  transform(text: string | null | undefined, term: string | null | undefined): HighlightSegment[] {
    if (!text) {
      return [];
    }
    if (!term) {
      return [{ text, match: false }];
    }
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text
      .split(new RegExp(`(${escaped})`, 'i'))
      .map((part, index) => ({ text: part, match: index % 2 === 1 }))
      .filter((segment) => segment.text !== '');
  }
}
