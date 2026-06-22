import type { Escenario } from './tipos';
import { escenarioInicial, aListaGastos } from './presets';

/**
 * Serializa un escenario completo dentro de la URL (para compartir por link) y
 * lo vuelve a leer al abrir ese link. Se usa solo del lado del cliente.
 */

const PARAM = 'e';

function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function serializarEscenario(esc: Escenario): string {
  return base64urlEncode(JSON.stringify(esc));
}

/** Reconstruye un escenario, completando lo que falte con los valores por defecto. */
export function deserializarEscenario(s: string): Escenario | null {
  try {
    const data = JSON.parse(base64urlDecode(s));
    if (!data || typeof data !== 'object') return null;
    const base = escenarioInicial(typeof data.pais === 'string' ? data.pais : 'AR');
    return {
      ...base,
      ...data,
      grupos: Array.isArray(data.grupos) && data.grupos.length > 0 ? data.grupos : base.grupos,
      gastos: aListaGastos(data.gastos ?? base.gastos),
      version: base.version,
    } as Escenario;
  } catch {
    return null;
  }
}

/** Arma el link completo (con el escenario serializado) para compartir. */
export function linkDeEscenario(esc: Escenario): string {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, serializarEscenario(esc));
  url.hash = 'calculadora';
  return url.toString();
}

/** Si la URL trae un escenario, lo devuelve; si no, null. */
export function leerEscenarioDeURL(): Escenario | null {
  if (typeof window === 'undefined') return null;
  const s = new URL(window.location.href).searchParams.get(PARAM);
  return s ? deserializarEscenario(s) : null;
}

/** Refleja el escenario actual en la barra de direcciones (sin recargar). */
export function actualizarURL(esc: Escenario): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, serializarEscenario(esc));
  history.replaceState(null, '', url.toString());
}
