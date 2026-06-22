import type { Escenario } from './tipos';
import { aListaGastos } from './presets';

/**
 * Guardado de escenarios en el navegador (localStorage). Privado: nada sale
 * del dispositivo del usuario.
 */

const KEY = 'cpsi-escenarios';

export interface EscenarioGuardado {
  id: string;
  nombre: string;
  fecha: string; // ISO
  esc: Escenario;
}

function clon(esc: Escenario): Escenario {
  return JSON.parse(JSON.stringify(esc));
}

export function listarEscenarios(): EscenarioGuardado[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    // Normaliza gastos de escenarios viejos (objeto) a la lista nueva
    return arr.map((item: EscenarioGuardado) => ({
      ...item,
      esc: { ...item.esc, gastos: aListaGastos(item.esc?.gastos) },
    }));
  } catch {
    return [];
  }
}

function persistir(lista: EscenarioGuardado[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(lista));
  } catch {
    /* almacenamiento lleno o bloqueado: lo ignoramos */
  }
}

export function guardarEscenario(nombre: string, esc: Escenario): EscenarioGuardado[] {
  const lista = listarEscenarios();
  const item: EscenarioGuardado = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    nombre: nombre.trim() || 'Escenario sin nombre',
    fecha: new Date().toISOString(),
    esc: clon(esc),
  };
  lista.unshift(item);
  persistir(lista);
  return lista;
}

export function eliminarEscenario(id: string): EscenarioGuardado[] {
  const lista = listarEscenarios().filter((e) => e.id !== id);
  persistir(lista);
  return lista;
}
