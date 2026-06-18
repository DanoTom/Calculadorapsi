// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './site.config.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  // Astro genera HTML estático puro: ideal para Cloudflare Pages (sin servidor).
  output: 'static',
  integrations: [
    svelte(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
