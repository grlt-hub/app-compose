import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://grlt-hub.github.io',
  base: '/app-compose',
  integrations: [
    starlight({
      title: '@grlt-hub/app-compose',
      social: {
        github: 'https://github.com/grlt-hub/app-compose',
      },
      sidebar: [
        {
          label: 'Getting started',
          items: [{ label: 'Introduction', link: '/' }],
        },
      ],
      tableOfContents: {
        maxHeadingLevel: 4,
      },
    }),
  ],
});
