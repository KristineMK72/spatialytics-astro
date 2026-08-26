import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react()
  ],
  site: 'https://spatialytics.space',
  // Enable View Transitions for smooth page navigations
  // (available by default in Astro 5 via <ViewTransitions />)
});
