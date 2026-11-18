/// <reference types='vitest' />
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { cpSync, globSync } from 'node:fs';

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
  resolve: {
    tsconfigPaths: true,
  },
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/decorators',

  plugins: [
    copyAssets(['package.json']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../dist/libs/decorators',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'decorators',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rolldownOptions: {
      // External packages that should not be bundled into your library.
      external: ['@fxts/core'],
    },
  },
  test: {
    name: 'decorators',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/decorators',
      provider: 'v8' as const,
    },
  },
});
