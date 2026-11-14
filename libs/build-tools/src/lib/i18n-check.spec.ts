import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkI18n } from './i18n-check';

const xlf = (units: string) =>
  `<?xml version="1.0" encoding="UTF-8" ?>\n<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2"><file source-language="en" datatype="plaintext" original="ng2.template"><body>${units}</body></file></xliff>`;
const unit = (id: string, source: string, target?: string) =>
  `<trans-unit id="${id}" datatype="html"><source>${source}</source>${target === undefined ? '' : `<target>${target}</target>`}</trans-unit>`;
const x = (id: string) => `<x id="${id}" equiv-text="{{a}}"/>`;

describe('checkI18n', () => {
  let dir: string;
  const file = (name: string, content: string) => {
    const p = join(dir, name);
    writeFileSync(p, content);
    return p;
  };
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'i18n-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('reports missing and empty translations and placeholder mismatches in JSON', () => {
    const source = file(
      'messages.json',
      JSON.stringify({
        locale: 'en',
        translations: { a: 'Hello', b: 'Hi {$NAME}', c: 'Bye {$NAME}', d: '{$A} and {$B}', e: 'ok' },
      }),
    );
    const de = file('messages.de.json', JSON.stringify({ locale: 'de', translations: { b: 'Hallo {$NAME}', c: 'Tschuess', d: '{$B} und {$A}', e: ' ' } }));
    const findings = checkI18n({ source, targets: { de } });
    expect(findings.map((f) => `${f.id}:${f.kind}`).sort()).toEqual(['a:missing', 'c:placeholder-mismatch', 'e:missing']);
    expect(findings.every((f) => f.locale === 'de')).toBe(true);
  });

  it('checks each locale separately and returns nothing when complete', () => {
    const source = file('m.json', JSON.stringify({ translations: { a: 'A {$X}' } }));
    const de = file('de.json', JSON.stringify({ translations: { a: 'A {$X}' } }));
    const fr = file('fr.json', JSON.stringify({ translations: {} }));
    const findings = checkI18n({ source, targets: { de, fr } });
    expect(findings).toEqual([{ locale: 'fr', id: 'a', kind: 'missing', detail: 'no translation' }]);
  });

  it('supports XLIFF 1.2', () => {
    const source = file(
      'messages.xlf',
      xlf(unit('1', 'Hello') + unit('2', `Hi ${x('INTERPOLATION')}`) + unit('3', `A ${x('START_BOLD_TEXT')}b${x('CLOSE_BOLD_TEXT')}`) + unit('4', 'Missing')),
    );
    const de = file(
      'messages.de.xlf',
      xlf(
        unit('1', 'Hello', 'Hallo') +
          unit('2', `Hi ${x('INTERPOLATION')}`, 'Hallo') +
          unit('3', 'A b', `A ${x('START_BOLD_TEXT')}b${x('CLOSE_BOLD_TEXT')}`) +
          unit('4', 'Missing', ''),
      ),
    );
    const findings = checkI18n({ source, targets: { de } });
    expect(findings.map((f) => `${f.id}:${f.kind}`)).toEqual(['2:placeholder-mismatch', '4:missing']);
    expect(findings[0].detail).toContain('INTERPOLATION');
  });

  it('mixes formats between source and targets', () => {
    const source = file('m.xlf', xlf(unit('1', 'Hello')));
    const de = file('de.json', JSON.stringify({ translations: { '1': 'Hallo' } }));
    expect(checkI18n({ source, targets: { de } })).toEqual([]);
  });

  it('rejects unsupported formats and unreadable files', () => {
    const source = file('m.json', '{}');
    expect(() => checkI18n({ source, targets: { de: file('de.xmb', '') } })).toThrow(/Unsupported/);
    expect(() => checkI18n({ source, targets: { de: join(dir, 'nope.json') } })).toThrow();
  });
});
