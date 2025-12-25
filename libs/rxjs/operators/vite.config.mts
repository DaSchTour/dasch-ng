/// <reference types="vitest" />
import { defineConfig } from 'vite';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dts from 'vite-plugin-dts';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import * as path from 'path';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/rxjs-operators',

  plugins: [
    nxCopyAssetsPlugin(['*.md']),
    nxViteTsPaths(),
    dts({ entryRoot: 'src', tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'), pathsToAliases: false }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../../',
  //    }),
  //  ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../../dist/libs/rxjs/operators',
    reportCompressedSize: true,
    commonjsOptions: { transformMixedEsModules: true },
    minify: false,
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'rxjs-operators',
      fileName: '[name]',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ['@fxts/core', 'rxjs', 'rxjs/operators'],
      output: {
        preserveModules: true,
      },
    },
  },
  test: {
    name: 'rxjs-operators',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/rxjs-operators',
      provider: 'v8' as const,
    },
  },
});
