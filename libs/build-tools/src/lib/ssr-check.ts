import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Strings that only end up in bundles that contain Angular's server platform
 * (`@angular/platform-server`). Found in Angular 22 `@angular/build:application` output:
 * the server bundle contains them (development and production builds), the browser bundle never does.
 *
 * `ngServerMode` itself cannot be used: the build replaces it with `true` / `false` at compile time,
 * so no token is left in the output.
 */
const SERVER_MARKERS = /(?:\\u0275|ɵ)domino|__domino_frozen__|ng-event-dispatch-contract/;

/** Options for {@link checkSsrBundle}. */
export interface SsrCheckOptions {
  /** Directory with the built server bundle, e.g. `dist/my-app/server`. */
  serverDir: string;
  /** Optional directory with the built browser bundle, e.g. `dist/my-app/browser`. It must not contain server code. */
  browserDir?: string;
}

/** Result of {@link checkSsrBundle}. `ok` is true when `problems` is empty. */
export interface SsrCheckResult {
  ok: boolean;
  problems: string[];
}

function scriptFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && /\.(?:m?js|cjs)$/.test(e.name))
    .map((e) => join(e.parentPath, e.name));
}

/**
 * Checks that a built Angular server bundle really contains the server platform and that the
 * browser bundle does not. Heuristic based on marker strings in the output, verified against
 * `@angular/build` 22.2 (development and production build). Other Angular versions or builders
 * may need different markers.
 *
 * @throws if a directory does not exist.
 */
export function checkSsrBundle(options: SsrCheckOptions): SsrCheckResult {
  const problems: string[] = [];
  const serverFiles = scriptFiles(options.serverDir);
  if (serverFiles.length === 0) {
    problems.push(`no JavaScript files found in server directory ${options.serverDir}`);
  } else if (!serverFiles.some((f) => SERVER_MARKERS.test(readFileSync(f, 'utf8')))) {
    problems.push(`server directory ${options.serverDir} contains no Angular server platform code (not built for the server?)`);
  }
  if (options.browserDir) {
    for (const f of scriptFiles(options.browserDir)) {
      if (SERVER_MARKERS.test(readFileSync(f, 'utf8'))) problems.push(`browser bundle contains server code: ${f}`);
    }
  }
  return { ok: problems.length === 0, problems };
}
