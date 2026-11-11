import { parseArgs } from 'node:util';
import { checkI18n } from './i18n-check';
import { checkSsrBundle } from './ssr-check';

const USAGE = `Usage:
  dasch-build-tools ssr-check --server <dir> [--browser <dir>]
  dasch-build-tools i18n-check --source <file> --target <pattern> --locales <a,b,...>

  --target is a path pattern where {locale} is replaced per locale,
  e.g. src/locale/messages.{locale}.xlf

Exit codes: 0 ok, 1 findings, 2 usage or file error.`;

/**
 * Runs the `dasch-build-tools` command line.
 *
 * @param argv arguments without `node` and script name
 * @param out output function, defaults to `console.log`
 * @returns the process exit code: 0 ok, 1 findings, 2 usage or file error
 */
export function runCli(argv: string[], out: (line: string) => void = console.log): number {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        server: { type: 'string' },
        browser: { type: 'string' },
        source: { type: 'string' },
        target: { type: 'string' },
        locales: { type: 'string' },
        help: { type: 'boolean', short: 'h' },
      },
    });
    const [command] = positionals;

    if (command === 'ssr-check' && values.server) {
      const result = checkSsrBundle({ serverDir: values.server, browserDir: values.browser });
      result.problems.forEach((p) => out(`ssr-check: ${p}`));
      if (result.ok) out('ssr-check: ok');
      return result.ok ? 0 : 1;
    }

    if (command === 'i18n-check' && values.source && values.target?.includes('{locale}') && values.locales) {
      const pattern = values.target;
      const targets = Object.fromEntries(
        values.locales
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((locale) => [locale, pattern.split('{locale}').join(locale)]),
      );
      const findings = checkI18n({ source: values.source, targets });
      findings.forEach((f) => out(`i18n-check: [${f.locale}] ${f.id}: ${f.kind} (${f.detail})`));
      if (findings.length === 0) out('i18n-check: ok');
      return findings.length === 0 ? 0 : 1;
    }

    out(USAGE);
    return values.help ? 0 : 2;
  } catch (e) {
    out(`error: ${e instanceof Error ? e.message : String(e)}`);
    return 2;
  }
}
