import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'dasch.ng',
  description: 'Angular & TypeScript Utilities Monorepo',
  base: '/',
  ignoreDeadLinks: true,
  head: [
    [
      'script',
      {
        src: 'https://kit.fontawesome.com/0763483c5e.js',
        crossorigin: 'anonymous',
      },
    ],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Libraries', link: '/libraries/' },
      { text: 'API Reference', link: '/api/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' },
          ],
        },
      ],
      '/libraries/': [
        {
          text: 'Angular Libraries',
          items: [
            { text: 'Gravatar', link: '/libraries/gravatar' },
            { text: 'JSON Viewer', link: '/libraries/json-viewer' },
            {
              text: 'NG Utils',
              link: '/libraries/ng-utils',
              items: [
                { text: 'Pipes', link: '/libraries/ng-utils/pipes' },
                { text: 'Provider Helpers', link: '/libraries/ng-utils/provide-helpers' },
              ],
            },
            { text: 'Material Right Sheet', link: '/libraries/material-right-sheet' },
            { text: 'Mutation Observer', link: '/libraries/mutation-observer' },
            { text: 'Resize Observer', link: '/libraries/resize-observer' },
            { text: 'Route Signals', link: '/libraries/route-signals' },
            { text: 'Validators', link: '/libraries/validators' },
          ],
        },
        {
          text: 'TypeScript Libraries',
          items: [
            { text: 'Decorators', link: '/libraries/decorators' },
            { text: 'RxJS Operators', link: '/libraries/rxjs-operators' },
            { text: 'Web Utils', link: '/libraries/web-utils' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [{ text: 'Overview', link: '/api/' }],
        },
        {
          text: 'Angular Libraries',
          items: [
            { text: 'Gravatar', link: '/api/@dasch-ng/gravatar/README' },
            { text: 'JSON Viewer', link: '/api/@dasch-ng/json-viewer/README' },
            { text: 'NG Utils', link: '/api/@dasch-ng/utils/README' },
            { text: 'Material Right Sheet', link: '/api/@dasch-ng/material-right-sheet/README' },
            { text: 'Mutation Observer', link: '/api/@dasch-ng/mutation-observer/README' },
            { text: 'Resize Observer', link: '/api/@dasch-ng/resize-observer/README' },
            { text: 'Route Signals', link: '/api/@dasch-ng/route-signals/README' },
            { text: 'Validators', link: '/api/@dasch-ng/validators/README' },
          ],
        },
        {
          text: 'TypeScript Libraries',
          items: [
            { text: 'Decorators', link: '/api/@dasch-ng/decorators/README' },
            { text: 'RxJS Operators', link: '/api/@dasch-ng/rxjs-operators/README' },
            { text: 'Web Utils', link: '/api/@dasch-ng/web-utils/README' },
          ],
        },
      ],
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present <a href="https://daniel-schuba.de" target="_blank" rel="noopener noreferrer">Daniel Schuba</a>',
    },
  },
});
