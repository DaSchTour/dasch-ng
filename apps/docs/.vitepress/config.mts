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
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        },
        link: 'https://daniel-schuba.de',
        ariaLabel: 'Daniel Schuba Website',
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present <a href="https://daniel-schuba.de" target="_blank" rel="noopener noreferrer">Daniel Schuba</a>',
    },
  },
});
