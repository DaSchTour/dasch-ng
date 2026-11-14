import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runCli } from './cli';

describe('runCli', () => {
  let dir: string;
  let lines: string[];
  const out = (l: string) => lines.push(l);
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'cli-'));
    lines = [];
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('ssr-check returns 0 for a server bundle and 1 otherwise', () => {
    mkdirSync(join(dir, 'server'));
    writeFileSync(join(dir, 'server', 'a.mjs'), 'globalThis.\\u0275domino');
    expect(runCli(['ssr-check', '--server', join(dir, 'server')], out)).toBe(0);
    writeFileSync(join(dir, 'server', 'a.mjs'), 'browser only');
    expect(runCli(['ssr-check', '--server', join(dir, 'server')], out)).toBe(1);
    expect(lines.at(-1)).toMatch(/not built for the server/);
  });

  it('i18n-check expands {locale} and returns 1 on findings', () => {
    writeFileSync(join(dir, 'm.json'), JSON.stringify({ translations: { a: 'A' } }));
    writeFileSync(join(dir, 'm.de.json'), JSON.stringify({ translations: { a: 'A' } }));
    const args = ['i18n-check', '--source', join(dir, 'm.json'), '--target', join(dir, 'm.{locale}.json')];
    expect(runCli([...args, '--locales', 'de'], out)).toBe(0);
    expect(runCli([...args, '--locales', 'de,fr'], out)).toBe(2); // fr file missing: file error
    writeFileSync(join(dir, 'm.fr.json'), '{"translations":{}}');
    expect(runCli([...args, '--locales', 'de,fr'], out)).toBe(1);
    expect(lines.at(-1)).toBe('i18n-check: [fr] a: missing (no translation)');
  });

  it('prints usage and returns 2 for unknown commands or missing options, 0 for --help', () => {
    expect(runCli([], out)).toBe(2);
    expect(runCli(['i18n-check', '--source', 'x'], out)).toBe(2);
    expect(runCli(['--bogus'], out)).toBe(2);
    expect(runCli(['--help'], out)).toBe(0);
    expect(lines.join('\n')).toContain('Usage:');
  });
});
