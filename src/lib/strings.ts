/**
 * Todos los textos de la interfaz en un solo lugar.
 * Tono: español rioplatense, voseo, cálido y claro. Como un colega que cuida.
 * Editá acá para cambiar cualquier palabra de la UI sin tocar el código.
 */
export const T = {
  marca: {
    nombre: 'CalculadoraPsi',
    tagline: 'Tu práctica, en números claros.',
  },

  nav: {
    calculadora: 'Calculadora',
    guias: 'Guías',
    sobre: 'Sobre el proyecto',
    privacidad: 'Privacidad',
    irACalcular: 'Calcular mis ingresos',
  },

  hero: {
    titulo: 'Cuánto ganás de verdad con tu práctica',
    subtitulo:
      'Una calculadora gratuita y privada para psicólogos y terapeutas de Latinoamérica. Descubrí tu ingreso real por hora y si tu forma de trabajar es sostenible para vos.',
    cta: 'Calcular mis ingresos',
    ctaSecundaria: 'Ver cómo funciona',
    nota: 'Gratis · Sin registro · Tus datos no salen de tu dispositivo',
  },

  // Las tres métricas estrella que el producto va a mostrar
  valor: {
    titulo: 'Tres números que cambian cómo ves tu trabajo',
    items: [
      {
        titulo: 'Ingreso neto real',
        texto:
          'Lo que te queda después de gastos, impuestos, cancelaciones y vacaciones. No lo que facturás en un mes ideal.',
      },
      {
        titulo: 'Ingreso por hora real',
        texto:
          'Tu neto dividido por todas las horas que dedicás: sesiones, administración y huecos. Suele sorprender.',
      },
      {
        titulo: 'Índice de sostenibilidad',
        texto:
          'Una lectura honesta de si tu ritmo es sano: carga de sesiones, margen, descanso y dependencia de una sola fuente.',
      },
    ],
  },

  comoFunciona: {
    titulo: 'Cómo funciona',
    pasos: [
      {
        titulo: 'Cargá tu esquema',
        texto: 'Pacientes, sesiones, honorarios y gastos. Con valores sugeridos por país que podés ajustar.',
      },
      {
        titulo: 'Mirá los resultados',
        texto: 'Tu ingreso real, por hora y al año, con un índice de sostenibilidad que te cuida.',
      },
      {
        titulo: 'Guardá y compartí',
        texto: 'Probá escenarios, guardalos, compará y exportá un resumen prolijo o una imagen para compartir.',
      },
    ],
  },

  calculadora: {
    placeholderTitulo: 'Tu calculadora está casi lista',
    placeholderTexto:
      'Estamos puliendo cada detalle para que cargar tus números sea simple y los resultados, claros. Muy pronto vas a poder usarla acá mismo.',
    placeholderBadge: 'En construcción',
  },

  guias: {
    titulo: 'Guías para tu práctica',
    subtitulo:
      'Información clara sobre precios, gastos e impuestos para psicólogos en Latinoamérica. Sin jerga, sin humo.',
    leerMas: 'Leer la guía',
    volver: 'Volver a las guías',
    tiempoLectura: 'min de lectura',
  },

  footer: {
    descripcion:
      'CalculadoraPsi es una herramienta gratuita para ayudarte a entender y planificar tus ingresos como profesional de la salud mental.',
    secciones: 'Secciones',
    legal: 'Legal',
    hechoCon: 'Hecho con cuidado para la comunidad terapéutica de Latinoamérica.',
    derechos: 'Esta herramienta brinda estimaciones orientativas, no asesoramiento contable ni financiero.',
  },

  disclaimer:
    'Estimación orientativa, no asesoramiento contable. Los valores son aproximados y editables. Consultá a un profesional para tu situación particular.',

  cookies: {
    texto:
      'Usamos almacenamiento local para guardar tus escenarios y analítica anónima para mejorar el sitio. No vendemos tus datos.',
    aceptar: 'Entendido',
    masInfo: 'Más información',
  },

  error404: {
    titulo: 'No encontramos esta página',
    texto: 'Puede que el enlace esté roto o que la página se haya movido.',
    volver: 'Volver al inicio',
  },
} as const;
