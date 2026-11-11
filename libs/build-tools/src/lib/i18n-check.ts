import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

/** Message id mapped to the list of placeholder names in its text, e.g. `['INTERPOLATION', 'START_TAG_SPAN']`. */
type Messages = Map<string, { text: string; placeholders: string[] }>;

/** Options for {@link checkI18n}. */
export interface I18nCheckOptions {
  /** Source messages file (`ng extract-i18n` output). `.json` or `.xlf` / `.xliff` (XLIFF 1.2). */
  source: string;
  /** Translation file per locale, e.g. `{ de: 'src/locale/messages.de.xlf' }`. Same formats as `source`. */
  targets: Record<string, string>;
}

/** A single finding of {@link checkI18n}. */
export interface I18nFinding {
  locale: string;
  id: string;
  kind: 'missing' | 'placeholder-mismatch';
  /** Human readable detail, e.g. the expected and actual placeholders. */
  detail: string;
}

const sorted = (a: string[]) => [...a].sort();

function parseJson(content: string): Messages {
  const data = JSON.parse(content) as { translations?: Record<string, unknown> };
  const out: Messages = new Map();
  for (const [id, text] of Object.entries(data.translations ?? {})) {
    if (typeof text !== 'string') continue;
    out.set(id, { text, placeholders: [...text.matchAll(/\{\$([A-Za-z0-9_]+)\}/g)].map((m) => m[1]) });
  }
  return out;
}

/**
 * Reads the translation units of an XLIFF 1.2 file as written by Angular (`<trans-unit id>` with
 * `<source>` / `<target>`, placeholders as `<x id="..."/>`). Not a general XML parser.
 */
function parseXliff(content: string, part: 'source' | 'target'): Messages {
  const out: Messages = new Map();
  for (const unit of content.matchAll(/<trans-unit\b([^>]*)>([\s\S]*?)<\/trans-unit>/g)) {
    const id = /\bid="([^"]*)"/.exec(unit[1])?.[1];
    const text = new RegExp(`<${part}\\b[^>]*>([\\s\\S]*?)</${part}>`).exec(unit[2])?.[1];
    if (id === undefined || text === undefined) continue;
    out.set(id, { text, placeholders: [...text.matchAll(/<x\b[^>]*\bid="([^"]*)"/g)].map((m) => m[1]) });
  }
  return out;
}

function load(path: string, part: 'source' | 'target'): Messages {
  const content = readFileSync(path, 'utf8');
  const ext = extname(path).toLowerCase();
  if (ext === '.json') return parseJson(content);
  if (ext === '.xlf' || ext === '.xliff') return parseXliff(content, part);
  throw new Error(`Unsupported i18n file format "${ext}" (${path}). Supported: .json, .xlf, .xliff (XLIFF 1.2).`);
}

/**
 * Compares per-locale translation files with the source messages and reports ids without
 * translation (absent or empty) and translations whose placeholders differ from the source.
 *
 * Supported formats: Angular JSON (`ng extract-i18n --format json`) and XLIFF 1.2 as written by Angular.
 * XLIFF 2.0 and XMB/XTB are not supported.
 *
 * @throws if a file cannot be read or has an unsupported extension.
 */
export function checkI18n(options: I18nCheckOptions): I18nFinding[] {
  const source = load(options.source, 'source');
  const findings: I18nFinding[] = [];
  for (const [locale, path] of Object.entries(options.targets)) {
    const target = load(path, 'target');
    for (const [id, src] of source) {
      const tr = target.get(id);
      if (!tr || tr.text.trim() === '') {
        findings.push({ locale, id, kind: 'missing', detail: 'no translation' });
        continue;
      }
      const want = sorted(src.placeholders);
      const have = sorted(tr.placeholders);
      if (want.join() !== have.join()) {
        findings.push({
          locale,
          id,
          kind: 'placeholder-mismatch',
          detail: `expected [${want.join(', ')}], found [${have.join(', ')}]`,
        });
      }
    }
  }
  return findings;
}
