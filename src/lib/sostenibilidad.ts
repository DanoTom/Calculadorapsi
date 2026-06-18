import type { Escenario, Resultado, TipoSesion } from './tipos';
import { n } from './formato';

/**
 * Índice de sostenibilidad: el corazón psicológico del producto.
 * Combina cuatro factores en un puntaje 0–100 y una lectura cualitativa,
 * con tono de colega que cuida (sin culpa, sin moralina).
 *
 * Todos los umbrales viven en UMBRALES y son fáciles de ajustar.
 */

export type Estado = 'bien' | 'atencion' | 'riesgo';

export interface Factor {
  clave: string;
  label: string;
  puntaje: number; // 0–100
  estado: Estado;
  mensaje: string;
}

export interface Sostenibilidad {
  puntaje: number; // 0–100 global
  estado: Estado;
  titulo: string;
  lectura: string;
  factores: Factor[];
}

/** Umbrales por defecto. Ajustables (el criterio clínico lo aporta el profesional). */
export const UMBRALES = {
  /** Sesiones/semana: hasta acá sin penalidad por carga */
  cargaPlena: 18,
  /** Sesiones/semana donde el subpuntaje de carga llega a 0 */
  cargaCero: 32,
  /** % de margen neto para puntaje pleno */
  margenSano: 60,
  /** Semanas de descanso al año para puntaje pleno */
  vacacionesPlenas: 4,
  /** Pesos de cada factor (suman 1) */
  pesos: { carga: 0.35, margen: 0.25, descanso: 0.25, fragilidad: 0.15 },
};

const TIPOS: TipoSesion[] = ['individual', 'parejaFamilia', 'grupo'];

function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

function estadoDe(p: number): Estado {
  if (p >= 75) return 'bien';
  if (p >= 50) return 'atencion';
  return 'riesgo';
}

export function calcularSostenibilidad(esc: Escenario, r: Resultado): Sostenibilidad {
  const U = UMBRALES;

  // 1) Carga clínica (según sesiones por semana)
  const S = r.sesionesSemanaTotal;
  const cargaP =
    S <= U.cargaPlena
      ? 100
      : clamp(100 * (1 - (S - U.cargaPlena) / (U.cargaCero - U.cargaPlena)), 0, 100);
  const cargaEstado = estadoDe(cargaP);
  const cargaMsg =
    cargaEstado === 'bien'
      ? `Tu carga (${S} sesiones por semana) deja aire para sostener la calidad clínica y tu energía.`
      : cargaEstado === 'atencion'
        ? `${S} sesiones por semana es una carga alta. Cuidá los espacios de recuperación entre pacientes.`
        : `${S} sesiones por semana es mucho: por encima de este ritmo el desgaste tiende a acelerarse.`;

  // 2) Margen neto
  const margenP = clamp((r.margenNetoPct / U.margenSano) * 100, 0, 100);
  const margenEstado = estadoDe(margenP);
  const margenPct = Math.round(r.margenNetoPct);
  const margenMsg =
    margenEstado === 'bien'
      ? `De lo que facturás te queda un margen sano (${margenPct}%). Tu esfuerzo se traduce en ingreso.`
      : margenEstado === 'atencion'
        ? `Buena parte de lo que facturás se va en gastos e impuestos (te queda ${margenPct}%). Mirá si hay algo para ajustar.`
        : `Casi todo lo que facturás se va en gastos e impuestos (te queda ${margenPct}%): el esfuerzo no se está traduciendo en ingreso.`;

  // 3) Descanso (vacaciones)
  const vacaciones = Math.max(0, 52 - n(esc.semanasTrabajadas));
  const descansoP = clamp((vacaciones / U.vacacionesPlenas) * 100, 0, 100);
  const descansoEstado = estadoDe(descansoP);
  const descansoMsg =
    vacaciones <= 0
      ? `No estás contemplando vacaciones. Aunque cierre en los números, sin descanso no es sostenible en el tiempo.`
      : descansoEstado === 'bien'
        ? `Contemplás ${vacaciones} semanas de descanso al año: clave para sostener el trabajo clínico.`
        : `Tenés ${vacaciones} semanas de descanso al año. Sumar algunas más cuidaría tu continuidad.`;

  // 4) Fragilidad (diversificación del ingreso por tipo de sesión)
  const ingresoPorTipo = TIPOS.map(
    (t) => Math.max(0, n(esc.sesionesSemana[t])) * Math.max(0, n(esc.honorarios[t]))
  );
  const totalIngreso = ingresoPorTipo.reduce((a, b) => a + b, 0);
  const tiposConIngreso = ingresoPorTipo.filter((x) => x > 0).length;
  let fragP: number;
  if (totalIngreso <= 0) {
    fragP = 0;
  } else {
    // Índice de concentración (HHI): 1 = todo en un tipo; menor = más diverso
    const hhi = ingresoPorTipo.reduce((a, x) => {
      const s = x / totalIngreso;
      return a + s * s;
    }, 0);
    fragP = clamp(40 + (1 - hhi) * 90, 0, 100);
  }
  const fragEstado = estadoDe(fragP);
  const fragMsg =
    tiposConIngreso <= 1
      ? `Tu ingreso depende de un solo tipo de sesión. Si esa fuente baja, no hay con qué compensar.`
      : tiposConIngreso === 2
        ? `Tu ingreso se reparte entre dos tipos de sesión: algo de diversificación que te da respaldo.`
        : `Tu ingreso se reparte entre varios tipos de sesión: eso le da resiliencia a tu práctica.`;

  // Puntaje global ponderado
  const puntaje = Math.round(
    cargaP * U.pesos.carga +
      margenP * U.pesos.margen +
      descansoP * U.pesos.descanso +
      fragP * U.pesos.fragilidad
  );
  const estado = estadoDe(puntaje);

  const titulo =
    estado === 'bien' ? 'Sostenible' : estado === 'atencion' ? 'Para mirar de cerca' : 'En riesgo';

  const lectura =
    estado === 'bien'
      ? 'Tu práctica se ve cuidada. Hay equilibrio entre lo que trabajás, lo que te queda y el descanso que te das. Seguí escuchando las señales y date permiso para sostener este ritmo.'
      : estado === 'atencion'
        ? 'Tu práctica funciona, pero hay señales para mirar con cariño. No es una alarma: son ajustes que pueden marcar la diferencia entre llegar bien o llegar al límite.'
        : 'Hay señales de que este ritmo puede desgastarte. Esto no es un reproche: es una invitación a revisar, con la misma compasión con la que mirarías a un paciente, qué se puede acomodar.';

  return {
    puntaje,
    estado,
    titulo,
    lectura,
    factores: [
      { clave: 'carga', label: 'Carga clínica', puntaje: Math.round(cargaP), estado: cargaEstado, mensaje: cargaMsg },
      { clave: 'margen', label: 'Margen económico', puntaje: Math.round(margenP), estado: margenEstado, mensaje: margenMsg },
      { clave: 'descanso', label: 'Descanso', puntaje: Math.round(descansoP), estado: descansoEstado, mensaje: descansoMsg },
      { clave: 'fragilidad', label: 'Diversificación', puntaje: Math.round(fragP), estado: fragEstado, mensaje: fragMsg },
    ],
  };
}
