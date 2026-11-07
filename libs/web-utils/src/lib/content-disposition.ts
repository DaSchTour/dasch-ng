export interface ContentDisposition {
  /** `attachment`, `inline` or another disposition type, lowercased. */
  type: string;
  /** The file name, decoded. `filename*` (RFC 5987) wins over `filename`. */
  filename?: string;
  /** All parameters with lowercased names, values unquoted (and decoded for `name*`). */
  parameters: Record<string, string>;
}

/**
 * Parses a `Content-Disposition` header (RFC 6266), e.g. to name a file downloaded with
 * `fetch`. Handles quoted values with escapes, unquoted tokens and `filename*=UTF-8''…`.
 * Returns `null` for an empty header.
 *
 * Path separators are not removed from the file name; strip them before using it as a path.
 *
 * @example
 * ```typescript
 * const response = await fetch(url);
 * const { filename } = parseContentDisposition(response.headers.get('Content-Disposition')) ?? {};
 * await download(await response.blob(), filename ?? 'download');
 * ```
 */
export function parseContentDisposition(header: string | null | undefined): ContentDisposition | null {
  if (!header?.trim()) {
    return null;
  }
  const typeEnd = header.indexOf(';');
  const type = (typeEnd === -1 ? header : header.slice(0, typeEnd)).trim().toLowerCase();
  const parameters: Record<string, string> = {};
  // name = "quoted \" value" | token
  const param = /;\s*([^\s=;]+)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^;]*))/g;
  for (const [, rawName, quoted, token] of header.slice(Math.max(typeEnd, 0)).matchAll(param)) {
    const name = rawName.toLowerCase();
    const value = quoted !== undefined ? quoted.replace(/\\(.)/g, '$1') : token.trim();
    parameters[name] = name.endsWith('*') ? (decodeExtValue(value) ?? value) : value;
  }
  const filename = parameters['filename*'] ?? parameters['filename'];
  return { type, parameters, ...(filename !== undefined && { filename }) };
}

/** Decodes `charset'lang'percent-encoded` (RFC 5987); `undefined` if it is not well-formed. */
function decodeExtValue(value: string): string | undefined {
  const match = /^([^']*)'[^']*'(.*)$/.exec(value);
  if (!match) {
    return undefined;
  }
  const [, charset, encoded] = match;
  try {
    if (charset.toLowerCase() === 'utf-8') {
      return decodeURIComponent(encoded);
    }
    const bytes: number[] = [];
    for (let i = 0; i < encoded.length; i++) {
      if (encoded[i] === '%') {
        const byte = Number.parseInt(encoded.slice(i + 1, i + 3), 16);
        if (Number.isNaN(byte)) {
          return undefined;
        }
        bytes.push(byte);
        i += 2;
      } else {
        bytes.push(encoded.charCodeAt(i));
      }
    }
    return new TextDecoder(charset).decode(Uint8Array.from(bytes));
  } catch {
    return undefined;
  }
}
