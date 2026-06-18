<script lang="ts">
  import type { Escenario } from '../../lib/tipos';
  import { calcular } from '../../lib/calculo';
  import { calcularSostenibilidad, type Estado } from '../../lib/sostenibilidad';
  import { presetPorCodigo } from '../../lib/presets';
  import { fmtMoneda, fmtPct, fmtNumero } from '../../lib/formato';

  interface Item {
    nombre: string;
    esc: Escenario;
  }
  interface Props {
    items: Item[];
    onCerrar: () => void;
  }
  let { items, onCerrar }: Props = $props();

  const datos = $derived(
    items.map((it) => {
      const r = calcular(it.esc);
      const sost = calcularSostenibilidad(it.esc, r);
      return { nombre: it.nombre, r, sost, simbolo: presetPorCodigo(it.esc.pais).simbolo };
    })
  );

  const textoEstado: Record<Estado, string> = {
    bien: 'text-salvia-600',
    atencion: 'text-ambar-600',
    riesgo: 'text-arcilla-600',
  };
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onCerrar()} />

<div
  class="fixed inset-0 z-50 flex items-end justify-center bg-tinta-900/40 p-0 sm:items-center sm:p-4"
  role="dialog"
  aria-modal="true"
  aria-label="Comparar escenarios"
>
  <!-- Fondo clickeable para cerrar -->
  <button class="absolute inset-0 cursor-default" aria-label="Cerrar" onclick={onCerrar}></button>

  <div
    class="relative max-h-[90dvh] w-full max-w-2xl overflow-auto rounded-t-3xl bg-crema-50 p-5 shadow-tarjeta sm:rounded-3xl sm:p-6"
  >
    <div class="flex items-center justify-between">
      <h3 class="font-display text-xl font-semibold">Comparar escenarios</h3>
      <button
        onclick={onCerrar}
        class="flex h-9 w-9 items-center justify-center rounded-xl border border-crema-200 bg-white text-tinta-700 hover:bg-crema-100"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>

    <div class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class="sticky left-0 bg-crema-50 p-2 text-left font-medium text-tinta-500"></th>
            {#each datos as d}
              <th class="min-w-[7.5rem] p-2 text-right align-bottom font-semibold text-tinta-900">
                {d.nombre}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody class="[&_td]:border-t [&_td]:border-crema-200">
          <tr>
            <td class="sticky left-0 bg-crema-50 p-2 text-tinta-600">Neto mensual</td>
            {#each datos as d}
              <td class="p-2 text-right font-semibold text-salvia-600">
                {fmtMoneda(d.r.netoMensual, d.simbolo)}
              </td>
            {/each}
          </tr>
          <tr>
            <td class="sticky left-0 bg-crema-50 p-2 text-tinta-600">Neto anual</td>
            {#each datos as d}
              <td class="p-2 text-right text-tinta-900">{fmtMoneda(d.r.netoAnual, d.simbolo)}</td>
            {/each}
          </tr>
          <tr>
            <td class="sticky left-0 bg-crema-50 p-2 text-tinta-600">Bruto mensual</td>
            {#each datos as d}
              <td class="p-2 text-right text-tinta-900">{fmtMoneda(d.r.brutoMensual, d.simbolo)}</td>
            {/each}
          </tr>
          <tr>
            <td class="sticky left-0 bg-crema-50 p-2 text-tinta-600">Por hora real</td>
            {#each datos as d}
              <td class="p-2 text-right text-tinta-900">
                {fmtMoneda(d.r.ingresoPorHoraReal, d.simbolo)}
              </td>
            {/each}
          </tr>
          <tr>
            <td class="sticky left-0 bg-crema-50 p-2 text-tinta-600">Margen neto</td>
            {#each datos as d}
              <td class="p-2 text-right text-tinta-900">{fmtPct(d.r.margenNetoPct)}</td>
            {/each}
          </tr>
          <tr>
            <td class="sticky left-0 bg-crema-50 p-2 text-tinta-600">Sesiones/semana</td>
            {#each datos as d}
              <td class="p-2 text-right text-tinta-900">{fmtNumero(d.r.sesionesSemanaTotal)}</td>
            {/each}
          </tr>
          <tr>
            <td class="sticky left-0 bg-crema-50 p-2 text-tinta-600">Sostenibilidad</td>
            {#each datos as d}
              <td class="p-2 text-right font-semibold {textoEstado[d.sost.estado]}">
                {d.sost.puntaje} · {d.sost.titulo}
              </td>
            {/each}
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
