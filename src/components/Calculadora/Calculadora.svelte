<script lang="ts">
  /**
   * ISLA INTERACTIVA — la calculadora.
   * Tiene todo el estado del escenario y muestra los resultados en vivo.
   * La lógica de cálculo vive aparte, en src/lib/calculo.ts.
   */
  import { onMount } from 'svelte';
  import type { Escenario, TipoSesion } from '../../lib/tipos';
  import { escenarioInicial, presetPorCodigo, PAISES } from '../../lib/presets';
  import { calcular } from '../../lib/calculo';
  import { traerCotizacionARS } from '../../lib/cotizacion';
  import { n, fmtMoneda } from '../../lib/formato';
  import CampoNumero from './CampoNumero.svelte';
  import Resultados from './Resultados.svelte';

  let esc = $state<Escenario>(escenarioInicial('AR'));

  const preset = $derived(presetPorCodigo(esc.pais));
  const r = $derived(calcular(esc));
  const vacaciones = $derived(Math.max(0, 52 - n(esc.semanasTrabajadas)));

  const tipos: { clave: TipoSesion; nombre: string }[] = [
    { clave: 'individual', nombre: 'Individual' },
    { clave: 'parejaFamilia', nombre: 'Pareja / Familia' },
    { clave: 'grupo', nombre: 'Grupo' },
  ];

  let cotizacionInfo = $state('');
  let cargandoCotizacion = $state(false);

  async function actualizarCotizacion() {
    if (!preset.soportaDolarApi) return;
    cargandoCotizacion = true;
    cotizacionInfo = '';
    const c = await traerCotizacionARS();
    cargandoCotizacion = false;
    if (c) {
      esc.cotizacionUSD = Math.round(c.valor);
      cotizacionInfo = `Traído de ${c.fuente}`;
    } else {
      cotizacionInfo = 'No se pudo traer la cotización. Cargala a mano.';
    }
  }

  /** Cambiar de país reinicia los valores en moneda local (no la estructura). */
  function cambiarPais(codigo: string) {
    const base = escenarioInicial(codigo);
    esc = {
      ...base,
      usarUSD: esc.usarUSD,
      pacientesActivos: esc.pacientesActivos,
      sesionesSemana: { ...esc.sesionesSemana },
      semanasTrabajadas: esc.semanasTrabajadas,
      cancelacionPct: esc.cancelacionPct,
      horasAdminSemana: esc.horasAdminSemana,
    };
    cotizacionInfo = '';
    if (presetPorCodigo(codigo).soportaDolarApi) actualizarCotizacion();
  }

  onMount(() => {
    if (preset.soportaDolarApi) actualizarCotizacion();
  });
</script>

<!-- Resumen pegajoso en celular: el número clave siempre visible -->
<div
  class="sticky top-16 z-20 mb-4 flex items-center justify-between gap-3 rounded-2xl border border-crema-200 bg-white/95 px-4 py-2.5 shadow-suave backdrop-blur lg:hidden"
>
  <div>
    <p class="text-[11px] font-medium text-tinta-500">Neto por mes</p>
    <p
      class="font-display text-xl font-semibold {r.netoMensual < 0
        ? 'text-arcilla-500'
        : 'text-salvia-600'}"
    >
      {fmtMoneda(r.netoMensual, preset.simbolo)}
    </p>
  </div>
  <div class="text-right">
    <p class="text-[11px] font-medium text-tinta-500">Por hora real</p>
    <p class="font-display text-xl font-semibold text-terracota-500">
      {fmtMoneda(r.ingresoPorHoraReal, preset.simbolo)}
    </p>
  </div>
</div>

<div class="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
  <!-- ============ INPUTS ============ -->
  <div class="space-y-5">
    <!-- País y moneda -->
    <section class="rounded-3xl border border-crema-200 bg-white p-5 sm:p-6">
      <h3 class="text-lg font-semibold">País y moneda</h3>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label for="pais" class="block text-sm font-medium text-tinta-700">País</label>
          <select
            id="pais"
            value={esc.pais}
            onchange={(e) => cambiarPais(e.currentTarget.value)}
            class="mt-1.5 w-full rounded-xl border border-crema-200 bg-white px-3.5 py-2.5 text-base text-tinta-900 outline-none focus:border-terracota-300 focus:ring-2 focus:ring-terracota-100"
          >
            {#each PAISES as p}
              <option value={p.codigo}>{p.nombre}</option>
            {/each}
          </select>
        </div>
        <div class="flex items-end">
          <label class="flex cursor-pointer items-center gap-3 rounded-xl px-1 py-2">
            <input
              type="checkbox"
              bind:checked={esc.usarUSD}
              class="h-5 w-5 rounded border-crema-300 text-terracota-500 focus:ring-terracota-200"
            />
            <span class="text-sm font-medium text-tinta-700">Razonar también en USD</span>
          </label>
        </div>
      </div>

      {#if esc.usarUSD}
        <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <CampoNumero
            id="cotizacion"
            label={`Cotización (1 USD en ${preset.monedaCodigo})`}
            prefijo={preset.simbolo}
            bind:value={esc.cotizacionUSD}
            ayuda={cotizacionInfo}
          />
          {#if preset.soportaDolarApi}
            <button
              type="button"
              onclick={actualizarCotizacion}
              disabled={cargandoCotizacion}
              class="h-[46px] rounded-xl border border-crema-200 bg-crema-50 px-4 text-sm font-semibold text-tinta-800 transition-colors hover:bg-crema-100 disabled:opacity-60"
            >
              {cargandoCotizacion ? 'Buscando…' : 'Actualizar'}
            </button>
          {/if}
        </div>
      {/if}

      <p class="mt-3 text-xs leading-relaxed text-tinta-400">{preset.nota}</p>
    </section>

    <!-- Esquema de trabajo -->
    <section class="rounded-3xl border border-crema-200 bg-white p-5 sm:p-6">
      <h3 class="text-lg font-semibold">Tu esquema de trabajo</h3>
      <p class="mt-1 text-sm text-tinta-500">Honorario y cantidad de sesiones por tipo.</p>

      <div class="mt-4 space-y-3">
        {#each tipos as t}
          <div class="rounded-2xl border border-crema-100 bg-crema-50 p-3">
            <p class="mb-2 text-sm font-semibold text-tinta-800">{t.nombre}</p>
            <div class="grid grid-cols-2 gap-3">
              <CampoNumero
                id={`hon-${t.clave}`}
                label="Honorario"
                prefijo={preset.simbolo}
                step={100}
                bind:value={esc.honorarios[t.clave]}
              />
              <CampoNumero
                id={`ses-${t.clave}`}
                label="Sesiones/semana"
                bind:value={esc.sesionesSemana[t.clave]}
              />
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <CampoNumero
          id="pacientes"
          label="Pacientes activos"
          bind:value={esc.pacientesActivos}
          ayuda="Para contexto y, más adelante, tu sostenibilidad."
        />
        <CampoNumero
          id="semanas"
          label="Semanas trabajadas al año"
          max={52}
          bind:value={esc.semanasTrabajadas}
          ayuda={`Equivale a ${vacaciones} semanas de descanso.`}
        />
        <CampoNumero
          id="cancelaciones"
          label="Cancelaciones / ausentismo"
          sufijo="%"
          max={100}
          bind:value={esc.cancelacionPct}
          ayuda="Sesiones que no se cobran pero ocupan tu agenda."
        />
        <CampoNumero
          id="admin"
          label="Horas administrativas"
          sufijo="h/sem"
          bind:value={esc.horasAdminSemana}
          ayuda="Tiempo no facturable: registros, mails, coordinación."
        />
      </div>
    </section>

    <!-- Gastos -->
    <section class="rounded-3xl border border-crema-200 bg-white p-5 sm:p-6">
      <h3 class="text-lg font-semibold">Gastos mensuales</h3>
      <p class="mt-1 text-sm text-tinta-500">Todo opcional. Dejá en cero lo que no apliques.</p>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <CampoNumero id="alquiler" label="Alquiler / coworking" prefijo={preset.simbolo} step={1000} bind:value={esc.gastos.alquiler} />
        <CampoNumero id="supervision" label="Supervisión" prefijo={preset.simbolo} step={1000} bind:value={esc.gastos.supervision} ayuda="Mensualizada." />
        <CampoNumero id="formacion" label="Formación continua" prefijo={preset.simbolo} step={1000} bind:value={esc.gastos.formacion} ayuda="Mensualizada." />
        <CampoNumero id="otros" label="Otros gastos fijos" prefijo={preset.simbolo} step={1000} bind:value={esc.gastos.otros} />
      </div>
    </section>

    <!-- Impuestos -->
    <section class="rounded-3xl border border-crema-200 bg-white p-5 sm:p-6">
      <h3 class="text-lg font-semibold">Impuestos y retenciones</h3>
      <div class="mt-4 max-w-xs">
        <CampoNumero
          id="impuesto"
          label="Impuesto / retención sobre lo facturado"
          sufijo="%"
          max={100}
          bind:value={esc.impuestoPct}
        />
      </div>
      <p class="mt-3 rounded-lg bg-crema-50 px-3 py-2 text-xs leading-relaxed text-tinta-500">
        Estimación orientativa, no asesoramiento contable. Empezá con el valor sugerido para
        {preset.nombre} y ajustalo a tu situación. Consultá a un profesional.
      </p>
    </section>

    <!-- Meta -->
    <section class="rounded-3xl border border-crema-200 bg-white p-5 sm:p-6">
      <h3 class="text-lg font-semibold">Tu meta (opcional)</h3>
      <p class="mt-1 text-sm text-tinta-500">
        Poné cuánto querés ganar neto por mes y te decimos cómo llegar.
      </p>
      <div class="mt-4 max-w-xs">
        <CampoNumero
          id="meta"
          label="Ingreso neto deseado"
          prefijo={preset.simbolo}
          sufijo="/mes"
          step={10000}
          bind:value={esc.metaNetaMensual}
        />
      </div>
    </section>
  </div>

  <!-- ============ RESULTADOS ============ -->
  <div class="lg:sticky lg:top-20">
    <Resultados {r} simbolo={preset.simbolo} usarUSD={esc.usarUSD} cotizacion={esc.cotizacionUSD} />
  </div>
</div>
