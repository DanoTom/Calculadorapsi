/** Tipos compartidos de la calculadora. */

export type TipoSesion = 'individual' | 'parejaFamilia' | 'grupo';

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

  /** Pacientes activos (contexto; aporta a la lectura de sostenibilidad) */
  pacientesActivos: number;

  /** Honorario por sesión, según tipo (en moneda local) */
  honorarios: Record<TipoSesion, number>;
  /** Sesiones por semana, según tipo */
  sesionesSemana: Record<TipoSesion, number>;

  /** Semanas efectivamente trabajadas al año (52 menos vacaciones) */
  semanasTrabajadas: number;
  /** % estimado de cancelaciones/ausentismo (0–100) */
  cancelacionPct: number;
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
