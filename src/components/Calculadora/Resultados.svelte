<script lang="ts">
  import type { Resultado } from '../../lib/tipos';
  import type { Sostenibilidad } from '../../lib/sostenibilidad';
  import { fmtMoneda, fmtPct, fmtNumero } from '../../lib/formato';
  import { descargarImagen } from '../../lib/exportarImagen';
  import SostenibilidadCard from './Sostenibilidad.svelte';
  import InfoTooltip from './InfoTooltip.svelte';

  interface Props {
    r: Resultado;
    sost: Sostenibilidad;
    simbolo: string;
    usarUSD: boolean;
    cotizacion: number;
  }
  let { r, sost, simbolo, usarUSD, cotizacion }: Props = $props();

  function exportarPNG() {
    descargarImagen({
      netoMensual: fmtMoneda(r.netoMensual, simbolo),
      netoAnual: fmtMoneda(r.netoAnual, simbolo),
      horaReal: fmtMoneda(r.ingresoPorHoraReal, simbolo),
      puntaje: sost.puntaje,
      titulo: sost.titulo,
      estado: sost.estado,
    });
  }

  function exportarPDF() {
    if (typeof window !== 'undefined') window.print();
  }

  // Conversión a USD (si está activada y la cotización es válida)
  const aUSD = (v: number) => (cotizacion > 0 ? v / cotizacion : 0);
  const fmtUSD = (v: number) => fmtMoneda(aUSD(v), 'US$');

  // Composición del bruto: impuestos + gastos + neto
  const bruto = $derived(r.brutoMensual);
  const impW = $derived(bruto > 0 ? (r.impuestoMensual / bruto) * 100 : 0);
  const gastosW = $derived(bruto > 0 ? (r.gastosMensual / bruto) * 100 : 0);
  const netoW = $derived(Math.max(0, 100 - impW - gastosW));
  const enRojo = $derived(r.netoMensual < 0);
</script>

<div class="space-y-4">
  <!-- Ingreso neto destacado -->
  <div class="rounded-3xl border border-crema-200 bg-white p-5 shadow-tarjeta">
    <p class="flex items-center gap-1.5 text-sm font-medium text-tinta-500">
      Tu ingreso neto estimado
      <InfoTooltip
        texto="Lo que te queda después de gastos, impuestos, cancelaciones y vacaciones. No lo que facturás en un mes ideal."
      />
    </p>
    <p
      class="mt-1 font-display text-4xl font-semibold {enRojo ? 'text-arcilla-500' : 'text-salvia-600'}"
    >
      {fmtMoneda(r.netoMensual, simbolo)}
    </p>
    <p class="text-sm text-tinta-500">por mes (promedio del año)</p>
    {#if usarUSD}
      <p class="mt-0.5 text-sm font-medium text-tinta-500">≈ {fmtUSD(r.netoMensual)} / mes</p>
    {/if}

    <div class="mt-3 flex items-baseline justify-between border-t border-crema-100 pt-3">
      <span class="text-sm text-tinta-500">Al año</span>
      <span class="font-display text-lg font-semibold text-tinta-900">
        {fmtMoneda(r.netoAnual, simbolo)}
      </span>
    </div>
    {#if enRojo}
      <p class="mt-3 rounded-lg bg-arcilla-50 px-3 py-2 text-xs text-arcilla-600">
        Tus gastos e impuestos superan lo que facturás. Revisá honorarios, volumen o gastos.
      </p>
    {/if}
  </div>

  <!-- Índice de sostenibilidad (el corazón del producto) -->
  <SostenibilidadCard {sost} />

  <!-- Dos métricas clave -->
  <div class="grid grid-cols-2 gap-3">
    <div class="rounded-2xl border border-crema-200 bg-white p-4">
      <p class="flex items-center gap-1.5 text-xs font-medium text-tinta-500">
        Ingreso por hora real
        <InfoTooltip
          texto="Tu neto dividido por todas las horas que dedicás: sesiones, administración y huecos. No solo las sesiones que cobrás."
        />
      </p>
      <p class="mt-1 font-display text-xl font-semibold text-terracota-500">
        {fmtMoneda(r.ingresoPorHoraReal, simbolo)}
      </p>
      <p class="mt-0.5 text-[11px] leading-tight text-tinta-500">
        sobre {fmtNumero(r.horasTotalesSemana)} h/sem dedicadas
      </p>
    </div>
    <div class="rounded-2xl border border-crema-200 bg-white p-4">
      <p class="flex items-center gap-1.5 text-xs font-medium text-tinta-500">
        Margen neto
        <InfoTooltip
          align="right"
          texto="Qué parte de lo que facturás te queda en el bolsillo después de gastos e impuestos."
        />
      </p>
      <p class="mt-1 font-display text-xl font-semibold text-tinta-900">
        {fmtPct(r.margenNetoPct)}
      </p>
      <p class="mt-0.5 text-[11px] leading-tight text-tinta-500">de lo que facturás te queda</p>
    </div>
  </div>

  <!-- Composición del ingreso bruto -->
  <div class="rounded-2xl border border-crema-200 bg-white p-4">
    <div class="flex items-baseline justify-between">
      <p class="text-sm font-medium text-tinta-700">Adónde va tu facturación</p>
      <p class="text-sm font-semibold text-tinta-900">{fmtMoneda(r.brutoMensual, simbolo)}/mes</p>
    </div>
    <div class="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-crema-100">
      <div class="h-full bg-salvia-500" style={`width:${netoW}%`} title="Lo que te queda (neto)"></div>
      <div class="h-full bg-ambar-400" style={`width:${impW}%`} title="Impuestos"></div>
      <div class="h-full bg-terracota-400" style={`width:${gastosW}%`} title="Gastos"></div>
    </div>
    <ul class="mt-3 space-y-1.5 text-sm">
      <li class="flex items-center justify-between">
        <span class="flex items-center gap-2 text-tinta-600">
          <span class="inline-block h-2.5 w-2.5 rounded-full bg-salvia-500"></span> Te queda
        </span>
        <span class="font-medium text-tinta-900">{fmtMoneda(r.netoMensual, simbolo)}</span>
      </li>
      <li class="flex items-center justify-between">
        <span class="flex items-center gap-2 text-tinta-600">
          <span class="inline-block h-2.5 w-2.5 rounded-full bg-ambar-400"></span> Impuestos
        </span>
        <span class="font-medium text-tinta-900">{fmtMoneda(r.impuestoMensual, simbolo)}</span>
      </li>
      <li class="flex items-center justify-between">
        <span class="flex items-center gap-2 text-tinta-600">
          <span class="inline-block h-2.5 w-2.5 rounded-full bg-terracota-400"></span> Gastos
        </span>
        <span class="font-medium text-tinta-900">{fmtMoneda(r.gastosMensual, simbolo)}</span>
      </li>
    </ul>
  </div>

  <!-- Meta -->
  {#if r.meta}
    <div class="rounded-2xl border border-crema-200 bg-crema-50 p-4">
      <p class="text-sm font-medium text-tinta-700">
        Para llegar a {fmtMoneda(r.meta.objetivoMensual, simbolo)}/mes neto
      </p>
      {#if r.meta.yaAlcanzada}
        <p class="mt-2 rounded-lg bg-salvia-50 px-3 py-2 text-sm text-salvia-600">
          Ya lo estás logrando con tu esquema actual. 🎉
        </p>
      {:else}
        <ul class="mt-2 space-y-2 text-sm text-tinta-700">
          {#if r.meta.sesionesSemanaNecesarias !== null && r.meta.sesionesAdicionales !== null}
            <li>
              Necesitás <strong>{fmtNumero(r.meta.sesionesSemanaNecesarias, 1)} sesiones/semana</strong>
              {#if r.meta.sesionesAdicionales > 0}
                <span class="text-tinta-500">
                  ({fmtNumero(r.meta.sesionesAdicionales, 1)} más que ahora)
                </span>
              {/if}
            </li>
          {/if}
          {#if r.meta.aumentoHonorarioPct !== null && r.meta.aumentoHonorarioPct > 0}
            <li>
              <span class="text-tinta-500">o</span> subir tus honorarios un
              <strong>{fmtPct(r.meta.aumentoHonorarioPct)}</strong>
            </li>
          {/if}
        </ul>
      {/if}
    </div>
  {/if}

  <!-- Exportar -->
  <div class="rounded-2xl border border-crema-200 bg-white p-4">
    <p class="text-base font-semibold text-tinta-900">Llevate tu resumen</p>
    <p class="mt-1 text-xs leading-snug text-tinta-500">
      Para guardarlo o mostrárselo a tu contador. Incluye tus números: compartilo solo con quien
      quieras.
    </p>
    <button
      type="button"
      onclick={exportarPDF}
      class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-terracota-600 px-4 py-3 text-sm font-semibold text-crema-50 shadow-suave transition-colors hover:bg-terracota-700"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Descargar PDF
    </button>
    <button
      type="button"
      onclick={exportarPNG}
      class="mt-2 w-full rounded-xl border border-crema-200 bg-crema-50 px-4 py-2.5 text-sm font-semibold text-tinta-800 transition-colors hover:bg-crema-100"
    >
      Descargar imagen
    </button>
    <p class="mt-2 text-[11px] leading-snug text-tinta-500">
      El PDF se genera con la opción «Guardar como PDF» de tu navegador.
    </p>
  </div>
</div>
