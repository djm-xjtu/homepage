// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://djm-xjtu.github.io',
  base: '/homepage',
  trailingSlash: 'always',
  integrations: [sitemap()],
  // No server-side image processing, so we can skip the heavy `sharp` dependency
  // entirely. Keeps CI installs small and fast.
  image: { service: passthroughImageService() },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
