import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../../site.config';
import type { APIContext } from 'astro';

/**
 * Feed RSS de las guías. Señal de frescura para buscadores y forma de
 * suscribirse sin depender de redes. Ordenado de la más nueva a la más vieja.
 */
export async function GET(context: APIContext) {
  const todas = await getCollection('guias');
  const publicadas = todas
    .filter((g) => !g.data.draft)
    .sort((a, b) => {
      const fa = a.data.actualizado ?? a.data.pubDate;
      const fb = b.data.actualizado ?? b.data.pubDate;
      return fb.valueOf() - fa.valueOf();
    });

  return rss({
    title: `${SITE.name} — Guías`,
    description:
      'Guías sobre honorarios, finanzas y sostenibilidad de la práctica para psicólogos y terapeutas de Latinoamérica.',
    site: context.site ?? SITE.url,
    items: publicadas.map((g) => ({
      title: g.data.title,
      description: g.data.description,
      pubDate: g.data.actualizado ?? g.data.pubDate,
      link: `/guias/${g.id}/`,
      author: g.data.author,
    })),
    customData: `<language>es</language>`,
  });
}
