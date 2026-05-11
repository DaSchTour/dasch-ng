#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// PostCSS plugins loaded via postcss-load-config (Vite, Vitest, @angular/build, etc.)
// expect `module.exports` to BE the plugin function, not `{ default: fn }`.
// esbuild's CJS output exposes the function only on `.default`, so we rewrite
// the bundle to mirror how every other PostCSS plugin ships its CJS entry.
const file = resolve('dist/libs/postcss-custom-container/index.cjs');
const original = readFileSync(file, 'utf8');

const marker = 'module.exports = __toCommonJS(index_exports);';
if (!original.includes(marker)) {
  console.error(`[patch-cjs] esbuild CJS export marker not found in ${file}`);
  process.exit(1);
}

const patched = `${original.replace(marker, '// patched: expose default as module.exports for postcss-load-config interop')}
module.exports = index_default;
module.exports.default = index_default;
`;

writeFileSync(file, patched);
console.log(`[patch-cjs] patched ${file}`);
