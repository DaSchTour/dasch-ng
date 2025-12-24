import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'dasch-ng',
  description: 'Angular & TypeScript Utilities Monorepo',
  base: '/',

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
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/DaSchTour/dasch-ng' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present DaSchTour',
    },
  },
});
