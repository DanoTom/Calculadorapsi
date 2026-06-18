/** Funciones de formato de números, dinero y porcentajes (locale es-AR). */

const nf0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Devuelve un número finito o 0 (evita NaN cuando un campo queda vacío). */
export function n(v: unknown): number {
  const x = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(x) ? x : 0;
}

/** Dinero: "$ 1.234.567" (sin decimales por defecto). */
export function fmtMoneda(valor: number, simbolo = '$', decimales = 0): string {
  const v = n(valor);
  const fmt = decimales === 2 ? nf2 : decimales === 1 ? nf1 : nf0;
  const signo = v < 0 ? '-' : '';
  return `${signo}${simbolo} ${fmt.format(Math.abs(v))}`;
}

/** Número simple con separador de miles. */
export function fmtNumero(valor: number, decimales = 0): string {
  const fmt = decimales === 2 ? nf2 : decimales === 1 ? nf1 : nf0;
  return fmt.format(n(valor));
}

/** Porcentaje: "12,5%". */
export function fmtPct(valor: number, decimales = 0): string {
  const fmt = decimales === 1 ? nf1 : nf0;
  return `${fmt.format(n(valor))}%`;
}
