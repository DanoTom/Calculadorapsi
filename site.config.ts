/**
 * Configuración central del sitio.
 * Acá viven los "interruptores" (flags) que activan o desactivan funciones
 * sin tocar el código. Pensado para que sea fácil de editar sin programar.
 */
export const SITE = {
  /** Nombre visible de la app */
  name: 'CalculadoraPsi',
  /** Dominio final (con https, sin barra al final) */
  url: 'https://calculadorapsi.com',
  /** Descripción para buscadores y redes (Google, WhatsApp, etc.) */
  description:
    'Calculadora gratuita de ingresos y sostenibilidad para psicólogos y terapeutas de Latinoamérica. Descubrí cuánto ganás de verdad por hora y si tu forma de trabajar es sostenible.',
  /** Idioma principal */
  locale: 'es',
  /** Autor / proyecto, para metadatos */
  author: 'Daniel Tommasi',
  /** Perfil público del autor (se usa en los datos estructurados y en /sobre) */
  authorLinkedIn: 'https://ar.linkedin.com/in/daniel-tommasi-psicolog%C3%ADa',

  /**
   * Google AdSense. Lo dejamos APAGADO hasta tener la cuenta aprobada.
   * Para activarlo: enabled = true y pegá tu client id (ca-pub-XXXX).
   */
  ads: {
    enabled: true,
    client: 'ca-pub-9232748982913595',
  },

  /**
   * Cloudflare Web Analytics (sin cookies, respeta privacidad).
   * Para activarlo: pegá el token que te da Cloudflare.
   */
  analytics: {
    cloudflareToken: '',
  },

  /** Redes / contacto (opcional, se usan en footer y datos estructurados) */
  social: {
    instagram: '',
    email: 'contacto@calculadorapsi.com',
  },
} as const;

export type SiteConfig = typeof SITE;
