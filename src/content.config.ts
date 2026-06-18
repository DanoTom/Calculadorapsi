import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

/**
 * Colección de guías (contenido SEO en markdown).
 * Cada archivo .md en src/content/guias/ es una guía. El frontmatter de arriba
 * de cada archivo define su título, descripción, etc.
 */
const guias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guias' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** País al que aplica (opcional): 'Argentina', 'México', etc. */
    pais: z.string().optional(),
    fecha: z.coerce.date(),
    actualizado: z.coerce.date().optional(),
    /** Minutos de lectura estimados (se muestra en la tarjeta) */
    tiempoLectura: z.number().default(5),
    /** Si está en borrador, no se publica */
    draft: z.boolean().default(false),
    /** Orden en el listado (menor = primero) */
    orden: z.number().default(100),
  }),
});

export const collections = { guias };
