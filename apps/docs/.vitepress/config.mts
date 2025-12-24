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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/DaSchTour/dasch-ng' },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
        },
        link: 'https://daniel-schuba.de',
        ariaLabel: 'Daniel Schuba Website',
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present <a href="https://daniel-schuba.de" target="_blank" rel="noopener">Daniel Schuba</a>',
    },
  },
});
