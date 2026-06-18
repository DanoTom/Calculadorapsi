/**
 * Trae la cotización del dólar para Argentina desde dolarapi.com (gratis, sin
 * clave). Se usa solo del lado del cliente. Si falla, devuelve null y la UI
 * cae en el valor manual.
 */
export interface Cotizacion {
  valor: number;
  fuente: string;
  fecha: string;
}

export async function traerCotizacionARS(): Promise<Cotizacion | null> {
  try {
    // Dólar "blue": el más representativo del poder de compra real.
    const r = await fetch('https://dolarapi.com/v1/dolares/blue', {
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const valor = typeof d?.venta === 'number' ? d.venta : Number(d?.venta);
    if (!Number.isFinite(valor) || valor <= 0) return null;
    return {
      valor,
      fuente: 'dólar blue (dolarapi.com)',
      fecha: typeof d?.fechaActualizacion === 'string' ? d.fechaActualizacion : '',
    };
  } catch {
    return null;
  }
}
