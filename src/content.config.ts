import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

/**
 * Colección de guías (contenido SEO en markdown).
 * Cada archivo .md en src/content/guias/ es una guía. El bloque de arriba de
 * cada archivo (frontmatter) define su título, descripción, fecha, etc.
 */
const guias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guias' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Fecha de publicación */
    pubDate: z.coerce.date(),
    /** Fecha de última actualización (opcional) */
    actualizado: z.coerce.date().optional(),
    /** Autor/a (opcional) */
    author: z.string().optional(),
    /** Etiquetas temáticas (opcional) */
    tags: z.array(z.string()).default([]),
    /** Slug sugerido (informativo; la URL sale del nombre del archivo) */
    slug: z.string().optional(),
    /** País al que aplica (opcional): 'Argentina', 'México', etc. */
    pais: z.string().optional(),
    /** Minutos de lectura estimados */
    tiempoLectura: z.number().default(5),
    /** Si está en borrador, no se publica */
    draft: z.boolean().default(false),
    /** Orden en el listado (menor = primero) */
    orden: z.number().default(100),
    /**
     * Preguntas frecuentes (opcional). Si se completa, se muestran al final de
     * la guía y además se emite el schema FAQPage, que permite que Google
     * muestre las preguntas desplegables en el resultado de búsqueda.
     */
    faq: z
      .array(
        z.object({
          pregunta: z.string(),
          respuesta: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = { guias };
