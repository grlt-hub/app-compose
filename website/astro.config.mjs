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
        { label: 'Introduction', link: '/' },
        {
          label: 'Tutorials',
          autogenerate: { directory: 'tutorials' },
        },
      ],
      tableOfContents: {
        maxHeadingLevel: 4,
      },
    }),
  ],
});
