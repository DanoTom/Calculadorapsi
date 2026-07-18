// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync, readdirSync } from 'node:fs';
import { SITE } from './site.config.ts';

/**
 * Fechas de última modificación por guía (pubDate o actualizado del
 * frontmatter), para que el sitemap informe frescura real a los buscadores.
 */
const lastmodGuias = {};
for (const archivo of readdirSync('./src/content/guias')) {
  if (!archivo.endsWith('.md')) continue;
  const texto = readFileSync(`./src/content/guias/${archivo}`, 'utf8');
  const fecha =
    texto.match(/^actualizado:\s*"?(\d{4}-\d{2}-\d{2})"?/m)?.[1] ??
    texto.match(/^pubDate:\s*"?(\d{4}-\d{2}-\d{2})"?/m)?.[1];
  if (fecha) lastmodGuias[archivo.replace(/\.md$/, '')] = fecha;
}

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  // Astro genera HTML estático puro: ideal para Cloudflare Pages (sin servidor).
  output: 'static',
  integrations: [
    svelte(),
    sitemap({
      serialize(item) {
        const slug = item.url.match(/\/guias\/([^/]+)\/?$/)?.[1];
        if (slug && lastmodGuias[slug]) item.lastmod = lastmodGuias[slug];
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
