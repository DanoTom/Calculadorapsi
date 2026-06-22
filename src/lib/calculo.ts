import type { Escenario, Resultado } from './tipos';
import { n } from './formato';

/**
 * Convierte un escenario en resultados. Función pura: mismos inputs → mismos
 * outputs. No toca el DOM ni nada externo (fácil de testear).
 *
 * Criterios de cálculo (documentados a propósito para que sean transparentes):
 * - El impuesto/retención se aplica sobre lo FACTURADO (bruto), al estilo
 *   monotributo/retención de honorarios.
 * - El mensual es el anual / 12, así las vacaciones bajan el promedio mensual
 *   (la visión honesta: no todos los meses se factura igual).
 * - Las cancelaciones reducen lo facturado, pero el tiempo igual se reservó:
 *   por eso el "ingreso por hora real" divide por todas las horas dedicadas.
 */
export function calcular(esc: Escenario): Resultado {
  const semanas = Math.max(0, n(esc.semanasTrabajadas));

  // Sesiones e ingreso semanal "pleno" (agenda completa, sin cancelaciones),
  // sumando todos los grupos de honorarios.
  let sesionesSemanaTotal = 0;
  let brutoSemanalPleno = 0;
  let pacientesActivos = 0;
  for (const g of esc.grupos ?? []) {
    const cantidad = Math.max(0, n(g.cantidad));
    const frecuencia = Math.max(0, n(g.frecuenciaSemanal));
    const honorario = Math.max(0, n(g.honorario));
    const sesiones = cantidad * frecuencia;
    pacientesActivos += cantidad;
    sesionesSemanaTotal += sesiones;
    brutoSemanalPleno += sesiones * honorario;
  }

  // Ausentismo: el usuario carga cuántas sesiones por MES le cancelan.
  // Lo pasamos a semana y lo convertimos en un porcentaje sobre el total.
  const cancelacionesSemana = Math.max(0, n(esc.cancelacionesMes)) / (52 / 12);
  const factorAsistencia =
    sesionesSemanaTotal > 0 ? clamp(1 - cancelacionesSemana / sesionesSemanaTotal, 0, 1) : 1;
  const ausentismoPct = (1 - factorAsistencia) * 100;

  const brutoSemanalFacturado = brutoSemanalPleno * factorAsistencia;
  const brutoAnual = brutoSemanalFacturado * semanas;
  const brutoMensual = brutoAnual / 12;

  // Gastos: cada uno con su frecuencia. Lo anual se reparte entre los 12 meses.
  let gastosMensual = 0;
  for (const g of Array.isArray(esc.gastos) ? esc.gastos : []) {
    const monto = Math.max(0, n(g.monto));
    gastosMensual += g.frecuencia === 'anual' ? monto / 12 : monto;
  }
  const gastosAnual = gastosMensual * 12;

  // Impuestos sobre lo facturado
  const impuestoPct = clamp(n(esc.impuestoPct), 0, 100);
  const impuestoAnual = brutoAnual * (impuestoPct / 100);
  const impuestoMensual = impuestoAnual / 12;

  // Neto
  const netoAnual = brutoAnual - impuestoAnual - gastosAnual;
  const netoMensual = netoAnual / 12;
  const margenNetoPct = brutoAnual > 0 ? (netoAnual / brutoAnual) * 100 : 0;

  // Horas dedicadas (1 hora por sesión reservada + admin)
  const horasSesionSemana = sesionesSemanaTotal;
  const horasTotalesSemana = horasSesionSemana + Math.max(0, n(esc.horasAdminSemana));
  const sesionesFacturadasSemana = sesionesSemanaTotal * factorAsistencia;
  const netoSemanalTrabajado = semanas > 0 ? netoAnual / semanas : 0;
  const ingresoPorHoraReal =
    horasTotalesSemana > 0 ? netoSemanalTrabajado / horasTotalesSemana : 0;

  // Análisis de meta
  const objetivoMensual = Math.max(0, n(esc.metaNetaMensual));
  let meta: Resultado['meta'] = null;
  if (objetivoMensual > 0) {
    const metaNetaAnual = objetivoMensual * 12;
    const factorImp = 1 - impuestoPct / 100;
    const yaAlcanzada = netoMensual >= objetivoMensual;

    let sesionesSemanaNecesarias: number | null = null;
    let sesionesAdicionales: number | null = null;
    let aumentoHonorarioPct: number | null = null;

    if (factorImp > 0) {
      // Cuánto habría que facturar (bruto) para que el neto dé la meta
      const brutoNecesarioAnual = (metaNetaAnual + gastosAnual) / factorImp;

      // Opción A: más sesiones, manteniendo el honorario promedio actual
      const sesionesFacturadasAnual = sesionesFacturadasSemana * semanas;
      const honorarioPromedio =
        sesionesFacturadasAnual > 0 ? brutoAnual / sesionesFacturadasAnual : 0;
      if (honorarioPromedio > 0 && semanas > 0 && factorAsistencia > 0) {
        const sesionesFacturadasNecesarias = brutoNecesarioAnual / honorarioPromedio;
        sesionesSemanaNecesarias =
          sesionesFacturadasNecesarias / semanas / factorAsistencia;
        sesionesAdicionales = sesionesSemanaNecesarias - sesionesSemanaTotal;
      }

      // Opción B: mismo volumen, subiendo honorarios un %
      if (brutoAnual > 0) {
        aumentoHonorarioPct = (brutoNecesarioAnual / brutoAnual - 1) * 100;
      }
    }

    meta = {
      objetivoMensual,
      yaAlcanzada,
      sesionesSemanaNecesarias,
      sesionesAdicionales,
      aumentoHonorarioPct,
    };
  }

  return {
    brutoMensual,
    brutoAnual,
    netoMensual,
    netoAnual,
    impuestoMensual,
    impuestoAnual,
    gastosMensual,
    gastosAnual,
    ingresoPorHoraReal,
    horasSesionSemana,
    horasTotalesSemana,
    sesionesSemanaTotal,
    sesionesFacturadasSemana,
    ausentismoPct,
    pacientesActivos,
    margenNetoPct,
    meta,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
