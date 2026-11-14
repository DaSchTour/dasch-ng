# Build Tools

Node-only build and CI helpers: a Vite plugin that injects build info, a check that an SSR bundle was built for the server, and an i18n checker for missing translations. Each tool is a function and, for CI, a command line (`dasch-build-tools`).

## Installation

```bash
npm install --save-dev @dasch-ng/build-tools
```

`vite` is an optional peer dependency, needed only for the `buildInfo` plugin (the import is type-only). The package is ESM only and requires Node 20 or newer.

## Build info (Vite plugin)

### Why

Showing the version, commit and build date in an "about" dialog or in error reports needs the same data in every project. The plugin reads it at build time and replaces a global constant through Vite's `define`.

### Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { buildInfo } from '@dasch-ng/build-tools';

export default defineConfig({
  plugins: [buildInfo({ name: '__APP_BUILD__' })],
});
```

```ts
// globals.d.ts
declare const __APP_BUILD__: import('@dasch-ng/build-tools').BuildInfo;

// anywhere in your app
console.log(__APP_BUILD__.version, __APP_BUILD__.commit);
```

| Field     | Source                                             |
| --------- | -------------------------------------------------- |
| `version` | `version` in `package.json` of `cwd`               |
| `tag`     | nearest git tag (`git describe --tags --abbrev=0`) |
| `commit`  | full hash of `HEAD`                                |
| `date`    | build time, ISO 8601 (UTC)                         |

Git is called with argument arrays, never through a shell. If git is not installed, the folder is not a repository or there is no tag yet, the field is `null`. `readBuildInfo()` returns the same data without Vite.

Options: `name` (default `__BUILD_INFO__`), `cwd` (default `process.cwd()`), `date` (default now).

## SSR bundle check

### Why

A server bundle that was accidentally built like a browser bundle fails only at runtime. The check catches it in CI.

### Usage

```bash
dasch-build-tools ssr-check --server dist/my-app/server --browser dist/my-app/browser
```

```ts
import { checkSsrBundle } from '@dasch-ng/build-tools';

const { ok, problems } = checkSsrBundle({ serverDir: 'dist/my-app/server', browserDir: 'dist/my-app/browser' });
```

It fails when the server directory has no JavaScript or no Angular server platform code, and (with `--browser`) when the browser directory contains such code.

::: warning Heuristic
`ngServerMode` is replaced by `true` or `false` at compile time, so the output holds no token to search for. The check looks for strings that only exist in bundles containing the server platform (`@angular/platform-server`). They were verified against a real build of `@angular/build` 22.2 with SSR, in development and production mode. Other Angular versions may need different markers.
:::

## i18n checker

### Why

`ng extract-i18n` adds new ids, but nothing tells you which locales are still missing them, or where a translator dropped or renamed a placeholder.

### Usage

```bash
dasch-build-tools i18n-check \
  --source src/locale/messages.xlf \
  --target 'src/locale/messages.{locale}.xlf' \
  --locales de,fr
```

```ts
import { checkI18n } from '@dasch-ng/build-tools';

const findings = checkI18n({
  source: 'src/locale/messages.json',
  targets: { de: 'src/locale/messages.de.json', fr: 'src/locale/messages.fr.json' },
});
// [{ locale: 'fr', id: 'greeting', kind: 'missing', detail: 'no translation' }]
```

Findings:

- `missing`: the id is absent in the locale file or its translation is empty
- `placeholder-mismatch`: the translation uses other placeholders (`{$NAME}` in JSON, `<x id="NAME"/>` in XLIFF) than the source. Order does not matter.

Supported formats: Angular JSON and XLIFF 1.2 as written by Angular, chosen by file extension (`.json`, `.xlf`, `.xliff`). Source and locale files may use different formats. XLIFF is read with regular expressions, not an XML parser, so it targets Angular's own output. XLIFF 2.0 and XMB/XTB are not supported.

## Command line

| Command      | Options                                                    |
| ------------ | ---------------------------------------------------------- |
| `ssr-check`  | `--server <dir>`, `--browser <dir>` (optional)             |
| `i18n-check` | `--source <file>`, `--target <pattern>`, `--locales <a,b>` |

Exit codes: `0` ok, `1` findings, `2` usage or file error.

## API Reference

See the [TypeDoc API reference](/api/@dasch-ng/build-tools/README).

## License

MIT
