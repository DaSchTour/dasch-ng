import { prefersMarkdown } from './markdown';

describe('prefersMarkdown', () => {
  it.each([
    ['text/markdown', true],
    ['text/markdown, text/html;q=0.8', true],
    ['TEXT/Markdown;q=0.9, text/html;q=0.5', true],
    ['text/html, text/markdown', false],
    ['text/html,application/xhtml+xml,*/*;q=0.8', false],
    ['*/*', false],
    ['text/markdown;q=0', false],
    ['text/markdown;q=abc', false],
    ['', false],
    [undefined, false],
    [null, false],
  ])('%s -> %s', (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected);
  });
});
