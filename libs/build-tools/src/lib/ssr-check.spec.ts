import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkSsrBundle } from './ssr-check';

// Marker snippets copied from a real `@angular/build` 22.2 server bundle (production and development).
const SERVER_PROD = 'var Po=globalThis.\\u0275domino;function DT(){}';
const SERVER_DEV = 'globalThis.ɵdomino = domino;';
const BROWSER = 'bootstrapApplication(App);var __ngContext__="__ngContext__";';

describe('checkSsrBundle', () => {
  let dir: string;
  const write = (rel: string, content: string) => {
    const p = join(dir, rel);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, content);
  };
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'ssr-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('accepts a server bundle in production and development form, with a clean browser bundle', () => {
    write('server/main.server.mjs', SERVER_PROD);
    write('browser/main.js', BROWSER);
    expect(checkSsrBundle({ serverDir: join(dir, 'server'), browserDir: join(dir, 'browser') })).toEqual({
      ok: true,
      problems: [],
    });
    write('server/main.server.mjs', SERVER_DEV);
    expect(checkSsrBundle({ serverDir: join(dir, 'server') }).ok).toBe(true);
  });

  it('finds markers in nested chunk files', () => {
    write('server/chunks/a.mjs', 'nothing');
    write('server/chunks/deep/b.mjs', SERVER_PROD);
    expect(checkSsrBundle({ serverDir: join(dir, 'server') }).ok).toBe(true);
  });

  it('fails for a browser bundle passed as server bundle', () => {
    write('server/main.js', BROWSER);
    const result = checkSsrBundle({ serverDir: join(dir, 'server') });
    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/not built for the server/);
  });

  it('fails for an empty server directory', () => {
    mkdirSync(join(dir, 'server'));
    expect(checkSsrBundle({ serverDir: join(dir, 'server') }).problems[0]).toMatch(/no JavaScript files/);
  });

  it('fails when the browser directory contains server code', () => {
    write('server/main.server.mjs', SERVER_PROD);
    write('browser/main.js', SERVER_PROD);
    const result = checkSsrBundle({ serverDir: join(dir, 'server'), browserDir: join(dir, 'browser') });
    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/browser bundle contains server code/);
  });

  it('throws for a missing directory', () => {
    expect(() => checkSsrBundle({ serverDir: join(dir, 'missing') })).toThrow();
  });
});
