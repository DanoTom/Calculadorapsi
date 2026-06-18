# CalculadoraPsi

Calculadora de ingresos y sostenibilidad para psicólogos y terapeutas de
Latinoamérica. Sitio web estático (sin backend, sin login, sin base de datos),
pensado para desplegarse gratis en Cloudflare Pages.

## Stack

- **[Astro](https://astro.build)** — framework de sitio estático (SEO + velocidad).
- **[Svelte](https://svelte.dev)** — la calculadora interactiva (la "isla").
- **[Tailwind CSS v4](https://tailwindcss.com)** — estilos.
- Tipografías **Fraunces** (títulos) e **Inter** (cuerpo), self-hosted.

## Comandos

| Comando           | Qué hace                                            |
| ----------------- | --------------------------------------------------- |
| `npm install`     | Instala las dependencias.                           |
| `npm run dev`     | Levanta el sitio en `http://localhost:4321`.        |
| `npm run build`   | Genera el sitio en la carpeta `dist/`.              |
| `npm run preview` | Previsualiza el `build` localmente.                 |
| `npm run check`   | Revisa errores de tipos y de Astro.                 |

## Configuración rápida (sin programar)

Casi todo lo editable vive en dos archivos:

- **`site.config.ts`** — interruptores del sitio: dominio, anuncios (AdSense),
  token de analítica. Los anuncios vienen **apagados** hasta tener cuenta aprobada.
- **`src/lib/strings.ts`** — todos los textos de la interfaz, en un solo lugar.

Las guías son archivos markdown en `src/content/guias/`. Cada una tiene arriba un
bloque con título, descripción, etc. Poné `draft: false` para publicarla.

## Estructura

```
src/
├─ pages/         # cada archivo es una página (index, guías, privacidad, sobre)
├─ components/    # piezas reutilizables (calculadora, header, footer, SEO, ads)
├─ content/guias/ # las guías en markdown
├─ lib/           # lógica y textos
├─ layouts/       # la plantilla base de todas las páginas
└─ styles/        # tema y estilos globales
```

## Deploy en Cloudflare Pages

1. Subí este repo a GitHub.
2. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
3. Elegí el repositorio.
4. Configuración de build:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. **Save and Deploy**. Cada push a la rama principal vuelve a desplegar solo.

## Pendientes conocidos

- La imagen para compartir (`public/og-default.svg`) es un placeholder; conviene
  reemplazarla por un PNG 1200×630 en el hito de SEO (WhatsApp prefiere PNG/JPG).
- La calculadora es por ahora una vista previa; la versión funcional llega en el
  próximo hito.
