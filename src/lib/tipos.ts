/** Tipos compartidos de la calculadora. */

export type TipoSesion = 'individual' | 'parejaFamilia' | 'grupo';

/**
 * Un grupo de honorario: pacientes que pagan lo mismo y van con la misma
 * frecuencia. Permite reflejar que se cobra distinto a distintos pacientes
 * (tarifa plena, reducida, pareja, etc.) sin cargar paciente por paciente.
 */
export interface GrupoHonorario {
  id: string;
  tipo: TipoSesion;
  /** Nombre opcional para reconocerlo (ej. "reducido", "obra social") */
  etiqueta: string;
  /** Cantidad de pacientes en este grupo */
  cantidad: number;
  /** Honorario por sesión (moneda local) */
  honorario: number;
  /** Sesiones por semana por paciente: 1 semanal, 0.5 quincenal, 2, 0.25 mensual */
  frecuenciaSemanal: number;
}

/** Un "escenario" es todo lo que el usuario carga. Se guarda/serializa entero. */
export interface Escenario {
  /** Versión del modelo de datos (para no romper links viejos a futuro) */
  version: number;
  /** Código de país: 'AR', 'MX', 'CL', 'UY', 'CO' */
  pais: string;
  /** Mostrar también los resultados en USD */
  usarUSD: boolean;
  /** Cuántas unidades de moneda local equivalen a 1 USD */
  cotizacionUSD: number;

  /** Grupos de honorarios (cada uno con su tarifa y frecuencia) */
  grupos: GrupoHonorario[];

  /** Semanas efectivamente trabajadas al año (52 menos vacaciones) */
  semanasTrabajadas: number;
  /** Sesiones por semana que se caen (cancelaciones/ausencias) */
  cancelacionesSemana: number;
  /** Horas administrativas no facturables por semana */
  horasAdminSemana: number;

  /** Gastos mensuales (en moneda local) */
  gastos: {
    alquiler: number;
    supervision: number;
    formacion: number;
    otros: number;
  };

  /** % de impuestos/retención sobre lo facturado (0–100) */
  impuestoPct: number;

  /** Meta de ingreso NETO mensual (0 = sin meta) */
  metaNetaMensual: number;
}

/** Resultado calculado a partir de un Escenario. Todo en moneda local. */
export interface Resultado {
  brutoMensual: number;
  brutoAnual: number;
  netoMensual: number;
  netoAnual: number;
  impuestoMensual: number;
  impuestoAnual: number;
  gastosMensual: number;
  gastosAnual: number;

  /** Neto por hora dedicada real (sesiones + admin), sobre semanas trabajadas */
  ingresoPorHoraReal: number;
  horasSesionSemana: number;
  horasTotalesSemana: number;
  sesionesSemanaTotal: number;
  sesionesFacturadasSemana: number;
  /** % efectivo de ausentismo (derivado de las cancelaciones por semana) */
  ausentismoPct: number;
  /** Pacientes activos (suma de todos los grupos) */
  pacientesActivos: number;

  /** Margen neto = neto / bruto (en %) */
  margenNetoPct: number;

  /** Análisis de meta (null si no hay meta cargada) */
  meta: {
    objetivoMensual: number;
    yaAlcanzada: boolean;
    sesionesSemanaNecesarias: number | null;
    sesionesAdicionales: number | null;
    aumentoHonorarioPct: number | null;
  } | null;
}
