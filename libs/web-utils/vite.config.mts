/// <reference types='vitest' />
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { cpSync, globSync } from 'node:fs';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

/**
 * Copies files from the project directory into the build output. Releases are published
 * from `dist/`, so `package.json` (and docs) must sit next to the bundle. Replaces what
 * the `@nx/vite:build` executor and `nxCopyAssetsPlugin` did before Nx 24.
 */
function copyAssets(patterns: string[]): Plugin {
  let root: string;
  let outDir: string;

  return {
    name: 'copy-assets',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      for (const file of globSync(patterns, { cwd: root })) {
        cpSync(path.resolve(root, file), path.resolve(outDir, file));
      }
    },
  };
}

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/web-utils',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    copyAssets(['package.json']),
    dts({ entryRoot: 'src', tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'), pathsToAliases: false }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  // Configuration for building your library.
  // See: https://vite.dev/guide/build.html#library-mode
  build: {
    outDir: '../../dist/libs/web-utils',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    minify: false,
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'web-utils',
      fileName: '[name]',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rolldownOptions: {
      // External packages that should not be bundled into your library.
      external: [],
      output: {
        preserveModules: true,
      },
    },
  },
  test: {
    name: 'web-utils',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/web-utils',
      provider: 'v8' as const,
    },
  },
});
