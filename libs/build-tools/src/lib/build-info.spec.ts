import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildInfo, readBuildInfo } from './build-info';

const git = (cwd: string, ...args: string[]) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd, stdio: 'ignore' });

describe('build-info', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'build-info-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('reads version, tag, commit and date from a git repository', () => {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ version: '1.2.3' }));
    git(dir, 'init', '-q');
    git(dir, 'add', '.');
    git(dir, 'commit', '-q', '-m', 'init');
    git(dir, 'tag', 'v1.2.3');
    const info = readBuildInfo({ cwd: dir, date: new Date('2026-01-02T03:04:05Z') });
    expect(info.version).toBe('1.2.3');
    expect(info.tag).toBe('v1.2.3');
    expect(info.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(info.date).toBe('2026-01-02T03:04:05.000Z');
  });

  it('falls back to null outside a repository and without package.json', () => {
    const info = readBuildInfo({ cwd: dir });
    expect(info).toMatchObject({ version: null, tag: null, commit: null });
  });

  it('falls back to null when git is not installed', () => {
    const path = process.env['PATH'];
    process.env['PATH'] = dir; // empty directory: no git binary
    try {
      expect(readBuildInfo({ cwd: dir })).toMatchObject({ tag: null, commit: null });
    } finally {
      process.env['PATH'] = path;
    }
  });

  it('defines the constant under the configured name', () => {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ version: '9.9.9' }));
    const plugin = buildInfo({ name: '__APP__', cwd: dir, date: new Date(0) });
    const config = (plugin.config as () => { define: Record<string, string> })();
    expect(JSON.parse(config.define['__APP__'])).toMatchObject({ version: '9.9.9', date: '1970-01-01T00:00:00.000Z' });
  });

  it('uses __BUILD_INFO__ by default', () => {
    const config = (buildInfo({ cwd: dir }).config as () => { define: Record<string, string> })();
    expect(Object.keys(config.define)).toEqual(['__BUILD_INFO__']);
  });
});
