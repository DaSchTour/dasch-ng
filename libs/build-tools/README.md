# @dasch-ng/build-tools

Node-only build and CI helpers: a Vite plugin for build info, an SSR bundle check and an i18n checker. Each tool is a function and, for CI, a command line.

```bash
npm install --save-dev @dasch-ng/build-tools
```

`vite` is an optional peer dependency, needed only for the `buildInfo` plugin. Requires Node 20 or newer, ESM only.

## Build info (Vite plugin)

```ts
// vite.config.ts
import { buildInfo } from '@dasch-ng/build-tools';

export default defineConfig({ plugins: [buildInfo({ name: '__APP_BUILD__' })] });
```

```ts
// globals.d.ts
declare const __APP_BUILD__: import('@dasch-ng/build-tools').BuildInfo;
```

`__APP_BUILD__` is replaced with `{ version, tag, commit, date }`. Git data is read with `git` (never through a shell). Without git or outside a repository, `tag` and `commit` are `null`. The default name is `__BUILD_INFO__`.

## SSR bundle check

```bash
npx dasch-build-tools ssr-check --server dist/my-app/server --browser dist/my-app/browser
```

Fails (exit code 1) when the server directory has no Angular server platform code, or when the browser directory contains it. This is a heuristic based on marker strings, verified against output of `@angular/build` 22.2 (development and production). `ngServerMode` cannot be searched for, because the build replaces it with `true` or `false`.

## i18n checker

```bash
npx dasch-build-tools i18n-check --source src/locale/messages.xlf --target 'src/locale/messages.{locale}.xlf' --locales de,fr
```

Reports, per locale, ids without translation (missing or empty) and translations whose placeholders differ from the source. Supported formats: Angular JSON and XLIFF 1.2 (as written by `ng extract-i18n`), no XML parser needed. XLIFF 2.0 and XMB/XTB are not supported.

Exit codes: 0 ok, 1 findings, 2 usage or file error.

```ts
import { checkI18n, checkSsrBundle } from '@dasch-ng/build-tools';

checkI18n({ source: 'messages.json', targets: { de: 'messages.de.json' } });
checkSsrBundle({ serverDir: 'dist/my-app/server' });
```

Full documentation: [dasch.ng/libraries/build-tools](https://dasch.ng/libraries/build-tools)

## License

MIT
