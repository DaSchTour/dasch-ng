import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

/** Build metadata injected into the bundle. `tag` and `commit` are `null` when git data is unavailable. */
export interface BuildInfo {
  /** `version` from the `package.json` in `cwd`, or `null` if it cannot be read. */
  version: string | null;
  /** Nearest git tag reachable from HEAD, or `null`. */
  tag: string | null;
  /** Full commit hash of HEAD, or `null`. */
  commit: string | null;
  /** Build time as ISO 8601 string (UTC). */
  date: string;
}

/** Options for {@link buildInfo} and {@link readBuildInfo}. */
export interface BuildInfoOptions {
  /** Name of the global constant replaced in the source. Default: `__BUILD_INFO__`. */
  name?: string;
  /** Directory to read `package.json` and git data from. Default: `process.cwd()`. */
  cwd?: string;
  /** Build date. Default: `new Date()`. Mainly useful for reproducible builds and tests. */
  date?: Date;
}

function git(args: string[], cwd: string): string | null {
  try {
    const out = execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 });
    return out.trim() || null;
  } catch {
    // git missing, not a repository, or no tags yet
    return null;
  }
}

/**
 * Reads version, git tag, commit and date. Never throws: missing git or `package.json`
 * yields `null` fields.
 */
export function readBuildInfo(options: BuildInfoOptions = {}): BuildInfo {
  const cwd = options.cwd ?? process.cwd();
  let version: string | null = null;
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')) as { version?: unknown };
    if (typeof pkg.version === 'string') version = pkg.version;
  } catch {
    // no readable package.json
  }
  return {
    version,
    tag: git(['describe', '--tags', '--abbrev=0'], cwd),
    commit: git(['rev-parse', 'HEAD'], cwd),
    date: (options.date ?? new Date()).toISOString(),
  };
}

/**
 * Vite plugin that replaces a global constant with the {@link BuildInfo} object via Vite `define`.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * export default defineConfig({ plugins: [buildInfo({ name: '__APP_BUILD__' })] });
 * // src/globals.d.ts
 * declare const __APP_BUILD__: import('@dasch-ng/build-tools').BuildInfo;
 * ```
 */
export function buildInfo(options: BuildInfoOptions = {}): Plugin {
  const name = options.name ?? '__BUILD_INFO__';
  return {
    name: 'dasch-build-info',
    config: () => ({ define: { [name]: JSON.stringify(readBuildInfo(options)) } }),
  };
}
