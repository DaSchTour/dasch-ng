function quality(accept: string, type: string): number {
  let best = -1;
  for (const part of accept.split(',')) {
    const [range, ...params] = part.trim().toLowerCase().split(';');
    if (range.trim() !== type) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
    const value = q ? Number(q.slice(2)) : 1;
    best = Math.max(best, Number.isNaN(value) ? 0 : value);
  }
  return best;
}

/**
 * Whether an `Accept` header asks for `text/markdown` over `text/html`.
 * Only explicit media types count: wildcards never select Markdown.
 *
 * @example
 * prefersMarkdown('text/markdown, text/html;q=0.8'); // true
 * prefersMarkdown('text/html, *' + '/*'); // false
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  const markdown = quality(accept, 'text/markdown');
  return markdown > 0 && markdown > quality(accept, 'text/html');
}
