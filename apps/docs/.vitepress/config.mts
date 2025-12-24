import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'dasch.ng',
  description: 'Angular & TypeScript Utilities Monorepo',
  base: '/',
  ignoreDeadLinks: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Libraries', link: '/libraries/rxjs-operators' },
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
            { text: 'NG Utils', link: '/libraries/ng-utils' },
            { text: 'Material Right Sheet', link: '/libraries/material-right-sheet' },
            { text: 'Mutation Observer', link: '/libraries/mutation-observer' },
            { text: 'Resize Observer', link: '/libraries/resize-observer' },
            { text: 'Validators', link: '/libraries/validators' },
          ],
        },
        {
          text: 'TypeScript Libraries',
          items: [
            { text: 'Decorators', link: '/libraries/decorators' },
            { text: 'RxJS Operators', link: '/libraries/rxjs-operators' },
            { text: 'Sharp Operators', link: '/libraries/sharp-operators' },
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
            { text: 'Gravatar', link: '/api/gravatar/src/README' },
            { text: 'NG Utils', link: '/api/ng/utils/src/README' },
            { text: 'Material Right Sheet', link: '/api/material/right-sheet/src/README' },
            { text: 'Mutation Observer', link: '/api/ng/mutation-observer/src/README' },
            { text: 'Resize Observer', link: '/api/ng/resize-observer/src/README' },
            { text: 'Validators', link: '/api/validators/src/README' },
          ],
        },
        {
          text: 'TypeScript Libraries',
          items: [
            { text: 'Decorators', link: '/api/decorators/src/README' },
            { text: 'RxJS Operators', link: '/api/rxjs/operators/src/README' },
            { text: 'Sharp Operators', link: '/api/sharp/operators/src/README' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/DaSchTour/dasch-ng' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present DaSchTour',
    },
  },
});
