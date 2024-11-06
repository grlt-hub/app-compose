import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://grlt-hub.github.io',
  base: '/app-compose',
  integrations: [
    starlight({
      title: 'app-compose',
      description: 'Create scalable, module-based applications with ease.'
      social: {
        discord: 'https://discord.gg/Q4DFKnxp',
        github: 'https://github.com/grlt-hub/app-compose',
      },
      sidebar: [
        { label: 'Introduction', link: '/' },
        {
          label: 'Tutorials',
          autogenerate: { directory: 'tutorials' },
        },
        {
          label: 'How-to Guides',
          autogenerate: { directory: 'how-to-guides' },
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
      tableOfContents: {
        maxHeadingLevel: 4,
      },
      lastUpdated: true
    }),
  ],
});
