import type { Escenario, GastoItem } from './tipos';

/**
 * Datos por país. TODO es un valor por defecto editable, no una verdad fija.
 * Para agregar un país nuevo: copiá un bloque y cambiá los valores.
 */
export interface Preset {
  codigo: string;
  nombre: string;
  /** Código ISO de la moneda: ARS, MXN, CLP, UYU, COP */
  monedaCodigo: string;
  /** Símbolo que se muestra en pantalla */
  simbolo: string;
  /** % de impuesto/retención sugerido como punto de partida */
  impuestoPctSugerido: number;
  /** Cotización sugerida (unidades locales por 1 USD); editable */
  cotizacionUSDsugerida: number;
  /** Si soporta traer cotización en vivo (solo Argentina por ahora) */
  soportaDolarApi: boolean;
  /** Honorario individual de ejemplo (para no arrancar en cero) */
  honorarioIndividualEjemplo: number;
  /** Alquiler mensual de ejemplo */
  alquilerEjemplo: number;
  /** Nota de contexto local que se muestra como ayuda */
  nota: string;
}

export const PAISES: Preset[] = [
  {
    codigo: 'AR',
    nombre: 'Argentina',
    monedaCodigo: 'ARS',
    simbolo: '$',
    impuestoPctSugerido: 10,
    cotizacionUSDsugerida: 1200,
    soportaDolarApi: true,
    honorarioIndividualEjemplo: 18000,
    alquilerEjemplo: 120000,
    nota: 'Muchos profesionales trabajan con monotributo (un monto fijo mensual). Por la brecha cambiaria, conviene mirar el dólar blue. Ajustá el % según tu categoría real.',
  },
  {
    codigo: 'MX',
    nombre: 'México',
    monedaCodigo: 'MXN',
    simbolo: '$',
    impuestoPctSugerido: 10,
    cotizacionUSDsugerida: 18,
    soportaDolarApi: false,
    honorarioIndividualEjemplo: 700,
    alquilerEjemplo: 6000,
    nota: 'Como persona física con actividad profesional suele aplicarse retención de ISR (y a veces IVA). El % real depende de tu régimen, por ejemplo RESICO.',
  },
  {
    codigo: 'CL',
    nombre: 'Chile',
    monedaCodigo: 'CLP',
    simbolo: '$',
    impuestoPctSugerido: 13,
    cotizacionUSDsugerida: 950,
    soportaDolarApi: false,
    honorarioIndividualEjemplo: 40000,
    alquilerEjemplo: 250000,
    nota: 'Las boletas de honorarios tienen una retención que el Estado actualiza cada año. Verificá el porcentaje vigente y ajustalo acá.',
  },
  {
    codigo: 'UY',
    nombre: 'Uruguay',
    monedaCodigo: 'UYU',
    simbolo: '$',
    impuestoPctSugerido: 12,
    cotizacionUSDsugerida: 40,
    soportaDolarApi: false,
    honorarioIndividualEjemplo: 1500,
    alquilerEjemplo: 18000,
    nota: 'Los honorarios profesionales tributan IRPF e IVA según tu situación. El porcentaje es orientativo: ajustalo a tu caso.',
  },
  {
    codigo: 'CO',
    nombre: 'Colombia',
    monedaCodigo: 'COP',
    simbolo: '$',
    impuestoPctSugerido: 11,
    cotizacionUSDsugerida: 4000,
    soportaDolarApi: false,
    honorarioIndividualEjemplo: 120000,
    alquilerEjemplo: 900000,
    nota: 'A los honorarios suele aplicárseles retención en la fuente. El porcentaje depende de tu base y condición; ajustalo acá.',
  },
];

export function presetPorCodigo(codigo: string): Preset {
  return PAISES.find((p) => p.codigo === codigo) ?? PAISES[0];
}

/** Crea un escenario inicial poblado con un ejemplo del país (dos grupos). */
export function escenarioInicial(codigo = 'AR'): Escenario {
  const p = presetPorCodigo(codigo);
  const pleno = p.honorarioIndividualEjemplo;
  return {
    version: 2,
    pais: p.codigo,
    usarUSD: false,
    cotizacionUSD: p.cotizacionUSDsugerida,
    grupos: [
      {
        id: 'g1',
        tipo: 'individual',
        etiqueta: '',
        cantidad: 12,
        honorario: pleno,
        frecuenciaSemanal: 1,
      },
      {
        id: 'g2',
        tipo: 'individual',
        etiqueta: 'reducido',
        cantidad: 6,
        honorario: Math.round(pleno * 0.65),
        frecuenciaSemanal: 0.5,
      },
    ],
    semanasTrabajadas: 48,
    cancelacionesMes: 4,
    horasAdminSemana: 5,
    gastos: [
      { id: 'gasto-1', concepto: 'Alquiler / coworking', monto: p.alquilerEjemplo, frecuencia: 'mensual' },
      { id: 'gasto-2', concepto: 'Supervisión', monto: 0, frecuencia: 'mensual' },
      { id: 'gasto-3', concepto: 'Formación', monto: 0, frecuencia: 'mensual' },
    ],
    impuestoPct: p.impuestoPctSugerido,
    metaNetaMensual: 0,
  };
}

/**
 * Crea un escenario vacío para cargar valores propios desde cero.
 * Conserva el país y sus valores estructurales (semanas, % de impuesto
 * sugerido, cotización), pero sin datos de ejemplo: eso es lo que la gente
 * espera de "Reiniciar".
 */
export function escenarioVacio(codigo = 'AR'): Escenario {
  const p = presetPorCodigo(codigo);
  return {
    version: 2,
    pais: p.codigo,
    usarUSD: false,
    cotizacionUSD: p.cotizacionUSDsugerida,
    grupos: [
      {
        id: 'g1',
        tipo: 'individual',
        etiqueta: '',
        cantidad: 0,
        honorario: 0,
        frecuenciaSemanal: 1,
      },
    ],
    semanasTrabajadas: 48,
    cancelacionesMes: 0,
    horasAdminSemana: 0,
    gastos: [
      { id: 'gasto-1', concepto: 'Alquiler / coworking', monto: 0, frecuencia: 'mensual' },
    ],
    impuestoPct: p.impuestoPctSugerido,
    metaNetaMensual: 0,
  };
}

/**
 * Normaliza los gastos a la lista nueva. Convierte el formato viejo
 * (objeto con alquiler/supervision/...) por si hay escenarios guardados o
 * links previos, para no perder esos datos.
 */
export function aListaGastos(g: unknown): GastoItem[] {
  if (Array.isArray(g)) return g as GastoItem[];
  if (g && typeof g === 'object') {
    const o = g as Record<string, number>;
    const mapa: [string, string][] = [
      ['alquiler', 'Alquiler / coworking'],
      ['supervision', 'Supervisión'],
      ['formacion', 'Formación'],
      ['otros', 'Otros gastos'],
    ];
    return mapa.map(([clave, concepto], i) => ({
      id: 'gasto-' + (i + 1),
      concepto,
      monto: Number(o[clave]) || 0,
      frecuencia: 'mensual' as const,
    }));
  }
  return [];
}

/** Genera un id único para un grupo nuevo creado en tiempo de ejecución. */
export function nuevoGrupoId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'g' + Date.now().toString(36);
}
