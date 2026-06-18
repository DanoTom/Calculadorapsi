<script lang="ts">
  /**
   * ISLA INTERACTIVA — la calculadora.
   * Tiene todo el estado del escenario y muestra los resultados en vivo.
   * La lógica de cálculo vive aparte, en src/lib/calculo.ts.
   */
  import { onMount } from 'svelte';
  import type { Escenario, TipoSesion } from '../../lib/tipos';
  import { escenarioInicial, presetPorCodigo, PAISES, nuevoGrupoId } from '../../lib/presets';
  import { calcular } from '../../lib/calculo';
  import { calcularSostenibilidad } from '../../lib/sostenibilidad';
  import { traerCotizacionARS } from '../../lib/cotizacion';
  import { leerEscenarioDeURL, linkDeEscenario, actualizarURL } from '../../lib/urlState';
  import {
    listarEscenarios,
    guardarEscenario,
    eliminarEscenario,
    type EscenarioGuardado,
  } from '../../lib/storage';
  import { n, fmtMoneda, fmtNumero, fmtPct } from '../../lib/formato';
  import CampoNumero from './CampoNumero.svelte';
  import Resultados from './Resultados.svelte';
  import Comparar from './Comparar.svelte';
  import ResumenImprimible from './ResumenImprimible.svelte';

  let esc = $state<Escenario>(escenarioInicial('AR'));

  const preset = $derived(presetPorCodigo(esc.pais));
  const r = $derived(calcular(esc));
  const sost = $derived(calcularSostenibilidad(esc, r));
  const vacaciones = $derived(Math.max(0, 52 - n(esc.semanasTrabajadas)));

  const tipos: { clave: TipoSesion; nombre: string }[] = [
    { clave: 'individual', nombre: 'Individual' },
    { clave: 'parejaFamilia', nombre: 'Pareja / Familia' },
    { clave: 'grupo', nombre: 'Grupo' },
  ];

  const frecuencias: { valor: number; nombre: string }[] = [
    { valor: 1, nombre: '1 vez por semana' },
    { valor: 0.5, nombre: 'Cada 15 días' },
    { valor: 2, nombre: '2 veces por semana' },
    { valor: 0.25, nombre: '1 vez al mes' },
  ];

  function agregarGrupo() {
    const ultimo = esc.grupos[esc.grupos.length - 1];
    esc.grupos = [
      ...esc.grupos,
      {
        id: nuevoGrupoId(),
        tipo: 'individual',
        etiqueta: '',
        cantidad: 1,
        honorario: ultimo ? ultimo.honorario : preset.honorarioIndividualEjemplo,
        frecuenciaSemanal: 1,
      },
    ];
  }

  function eliminarGrupo(id: string) {
    if (esc.grupos.length <= 1) return;
    esc.grupos = esc.grupos.filter((g) => g.id !== id);
  }

  // Descanso/vacaciones en opciones rápidas (más natural que "semanas trabajadas")
  const descansoPresets = [
    { label: '2 semanas', semanas: 2 },
    { label: '1 mes', semanas: 4 },
    { label: 'Mes y medio', semanas: 6 },
    { label: '2 meses', semanas: 8 },
  ];
  function setDescanso(semanasDescanso: number) {
    esc.semanasTrabajadas = Math.max(0, 52 - semanasDescanso);
  }

  let cotizacionInfo = $state('');
  let cargandoCotizacion = $state(false);

  // --- Guardar / compartir / comparar ---
  let guardados = $state<EscenarioGuardado[]>([]);
  let mostrarPanel = $state(false);
  let mostrarGuardar = $state(false);
  let nombreNuevo = $state('');
  let seleccionados = $state<string[]>([]);
  let comparando = $state(false);
  let linkActual = $state('');
  let copiado = $state(false);

  function copiarLink() {
    linkActual = linkDeEscenario(esc);
    actualizarURL(esc);
    copiado = false;
    navigator.clipboard
      ?.writeText(linkActual)
      .then(() => {
        copiado = true;
        setTimeout(() => (copiado = false), 2500);
      })
      .catch(() => {});
  }

  function confirmarGuardar() {
    guardados = guardarEscenario(nombreNuevo, esc);
    nombreNuevo = '';
    mostrarGuardar = false;
    mostrarPanel = true;
  }

  function cargar(item: EscenarioGuardado) {
    esc = JSON.parse(JSON.stringify(item.esc));
    actualizarURL(esc);
    mostrarPanel = false;
  }

  function borrar(id: string) {
    guardados = eliminarEscenario(id);
    seleccionados = seleccionados.filter((s) => s !== id);
  }

  function alternarSeleccion(id: string) {
    if (seleccionados.includes(id)) {
      seleccionados = seleccionados.filter((s) => s !== id);
    } else if (seleccionados.length < 3) {
      seleccionados = [...seleccionados, id];
    }
  }

  const itemsComparar = $derived(
    guardados
      .filter((g) => seleccionados.includes(g.id))
      .map((g) => ({ nombre: g.nombre, esc: g.esc }))
  );

  function reiniciar() {
    esc = escenarioInicial(esc.pais);
    if (preset.soportaDolarApi) actualizarCotizacion();
  }

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

  /**
   * Cambiar de país reinicia los valores en moneda local (honorarios, gastos)
   * al ejemplo del país nuevo, pero conserva tu ritmo de trabajo.
   */
  function cambiarPais(codigo: string) {
    const base = escenarioInicial(codigo);
    esc = {
      ...base,
      usarUSD: esc.usarUSD,
      semanasTrabajadas: esc.semanasTrabajadas,
      cancelacionesMes: esc.cancelacionesMes,
      horasAdminSemana: esc.horasAdminSemana,
    };
    cotizacionInfo = '';
    if (presetPorCodigo(codigo).soportaDolarApi) actualizarCotizacion();
  }

  onMount(() => {
    const desdeURL = leerEscenarioDeURL();
    if (desdeURL) esc = desdeURL;
    guardados = listarEscenarios();
    // Solo traemos cotización en vivo si no vino fijada en el link
    if (presetPorCodigo(esc.pais).soportaDolarApi && !desdeURL) actualizarCotizacion();
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
  <div class="flex flex-col items-center">
    <span class="text-[11px] font-medium text-tinta-500">Sostenib.</span>
    <span class="mt-0.5 flex items-center gap-1.5">
      <span
        class="inline-block h-2.5 w-2.5 rounded-full {sost.estado === 'bien'
          ? 'bg-salvia-500'
          : sost.estado === 'atencion'
            ? 'bg-ambar-500'
            : 'bg-arcilla-500'}"
      ></span>
      <span class="font-display text-xl font-semibold text-tinta-900">{sost.puntaje}</span>
    </span>
  </div>
  <div class="text-right">
    <p class="text-[11px] font-medium text-tinta-500">Por hora real</p>
    <p class="font-display text-xl font-semibold text-terracota-500">
      {fmtMoneda(r.ingresoPorHoraReal, preset.simbolo)}
    </p>
  </div>
</div>

<!-- ============ BARRA DE ACCIONES ============ -->
<div class="mb-4 flex flex-wrap items-center gap-2">
  <button
    type="button"
    onclick={copiarLink}
    class="inline-flex items-center gap-1.5 rounded-xl bg-terracota-600 px-4 py-2 text-sm font-semibold text-crema-50 shadow-suave transition-colors hover:bg-terracota-700"
  >
    {copiado ? '¡Link copiado!' : 'Copiar link'}
  </button>
  <button
    type="button"
    onclick={() => {
      mostrarGuardar = !mostrarGuardar;
      mostrarPanel = false;
    }}
    class="rounded-xl border border-crema-200 bg-crema-50 px-4 py-2 text-sm font-semibold text-tinta-800 transition-colors hover:bg-crema-100"
  >
    Guardar escenario
  </button>
  <button
    type="button"
    onclick={() => {
      mostrarPanel = !mostrarPanel;
      mostrarGuardar = false;
    }}
    class="rounded-xl border border-crema-200 bg-crema-50 px-4 py-2 text-sm font-semibold text-tinta-800 transition-colors hover:bg-crema-100"
  >
    Mis escenarios{guardados.length ? ` (${guardados.length})` : ''}
  </button>
  <button
    type="button"
    onclick={reiniciar}
    class="ml-auto rounded-xl px-3 py-2 text-sm font-medium text-tinta-500 transition-colors hover:text-tinta-800"
  >
    Reiniciar
  </button>
</div>

<!-- Link compartible -->
{#if linkActual}
  <div class="mb-4 rounded-xl border border-crema-200 bg-crema-50 p-2">
    <div class="flex items-center gap-2">
      <input
        readonly
        value={linkActual}
        onfocus={(e) => e.currentTarget.select()}
        class="w-full bg-transparent px-2 text-xs text-tinta-600 outline-none"
        aria-label="Link del escenario"
      />
    </div>
    <p class="mt-1.5 px-2 text-[11px] leading-snug text-tinta-500">
      El link lleva tus números adentro: compartilo solo con quien quieras.
    </p>
  </div>
{/if}

<!-- Formulario para guardar -->
{#if mostrarGuardar}
  <div class="mb-4 rounded-2xl border border-crema-200 bg-white p-4">
    <label for="nombre-esc" class="block text-sm font-medium text-tinta-700">
      Nombre para este escenario
    </label>
    <div class="mt-2 flex flex-wrap gap-2">
      <input
        id="nombre-esc"
        bind:value={nombreNuevo}
        placeholder="Ej.: Mi consultorio 2026"
        onkeydown={(e) => e.key === 'Enter' && confirmarGuardar()}
        class="min-w-0 flex-1 rounded-xl border border-crema-200 bg-white px-3.5 py-2.5 text-base outline-none focus:border-terracota-300 focus:ring-2 focus:ring-terracota-100"
      />
      <button
        type="button"
        onclick={confirmarGuardar}
        class="rounded-xl bg-terracota-600 px-4 py-2.5 text-sm font-semibold text-crema-50 hover:bg-terracota-700"
      >
        Guardar
      </button>
    </div>
  </div>
{/if}

<!-- Panel "Mis escenarios" -->
{#if mostrarPanel}
  <div class="mb-4 rounded-2xl border border-crema-200 bg-white p-4">
    {#if guardados.length === 0}
      <p class="text-sm text-tinta-500">
        Todavía no guardaste escenarios. Cargá tus números y tocá «Guardar escenario».
      </p>
    {:else}
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm font-medium text-tinta-700">
          Tus escenarios <span class="text-tinta-500">(marcá hasta 3 para comparar)</span>
        </p>
        <button
          type="button"
          disabled={seleccionados.length < 2}
          onclick={() => (comparando = true)}
          class="rounded-xl bg-terracota-600 px-3.5 py-1.5 text-sm font-semibold text-crema-50 hover:bg-terracota-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Comparar{seleccionados.length ? ` (${seleccionados.length})` : ''}
        </button>
      </div>
      <ul class="mt-3 divide-y divide-crema-100">
        {#each guardados as g}
          <li class="flex items-center gap-3 py-2.5">
            <input
              type="checkbox"
              checked={seleccionados.includes(g.id)}
              onchange={() => alternarSeleccion(g.id)}
              disabled={!seleccionados.includes(g.id) && seleccionados.length >= 3}
              class="h-5 w-5 rounded border-crema-300 text-terracota-500 focus:ring-terracota-200"
              aria-label={`Comparar ${g.nombre}`}
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-tinta-800">{g.nombre}</p>
              <p class="text-xs text-tinta-500">
                {new Date(g.fecha).toLocaleDateString('es-AR')}
              </p>
            </div>
            <button
              type="button"
              onclick={() => cargar(g)}
              class="rounded-lg border border-crema-200 px-3 py-1.5 text-xs font-semibold text-tinta-700 hover:bg-crema-100"
            >
              Cargar
            </button>
            <button
              type="button"
              onclick={() => borrar(g.id)}
              class="rounded-lg px-2 py-1.5 text-xs font-medium text-tinta-500 hover:text-arcilla-500"
              aria-label={`Borrar ${g.nombre}`}
            >
              Borrar
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}

{#if comparando}
  <Comparar items={itemsComparar} onCerrar={() => (comparando = false)} />
{/if}

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

      <p class="mt-3 text-xs leading-relaxed text-tinta-600">{preset.nota}</p>
    </section>

    <!-- Esquema de trabajo -->
    <section class="rounded-3xl border border-crema-200 bg-white p-5 sm:p-6">
      <h3 class="text-lg font-semibold">Tu esquema de trabajo</h3>
      <p class="mt-1 text-sm text-tinta-500">
        Agrupá a tus pacientes por honorario. ¿Cobrás distinto a algunos? Agregá un grupo.
      </p>

      <div class="mt-4 space-y-3">
        {#each esc.grupos as grupo (grupo.id)}
          <div class="rounded-2xl border border-crema-100 bg-crema-50 p-3">
            <div class="mb-3 flex items-center gap-2">
              <select
                bind:value={grupo.tipo}
                aria-label="Tipo de sesión"
                class="rounded-lg border border-crema-200 bg-white px-2.5 py-2 text-sm font-medium text-tinta-800 outline-none focus:border-terracota-300 focus:ring-2 focus:ring-terracota-100"
              >
                {#each tipos as t}
                  <option value={t.clave}>{t.nombre}</option>
                {/each}
              </select>
              <input
                bind:value={grupo.etiqueta}
                placeholder="Etiqueta (opcional)"
                aria-label="Etiqueta del grupo"
                class="min-w-0 flex-1 rounded-lg border border-crema-200 bg-white px-2.5 py-2 text-sm text-tinta-800 outline-none focus:border-terracota-300 focus:ring-2 focus:ring-terracota-100"
              />
              {#if esc.grupos.length > 1}
                <button
                  type="button"
                  onclick={() => eliminarGrupo(grupo.id)}
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-tinta-500 hover:bg-crema-100 hover:text-arcilla-500"
                  aria-label="Eliminar grupo"
                >
                  ✕
                </button>
              {/if}
            </div>
            <div class="grid grid-cols-2 gap-3">
              <CampoNumero id={`cant-${grupo.id}`} label="Pacientes" bind:value={grupo.cantidad} />
              <CampoNumero
                id={`hon-${grupo.id}`}
                label="Honorario"
                prefijo={preset.simbolo}
                step={100}
                bind:value={grupo.honorario}
              />
            </div>
            <div class="mt-3">
              <label for={`frec-${grupo.id}`} class="block text-sm font-medium text-tinta-700">
                Frecuencia
              </label>
              <select
                id={`frec-${grupo.id}`}
                bind:value={grupo.frecuenciaSemanal}
                class="mt-1.5 w-full rounded-xl border border-crema-200 bg-white px-3.5 py-2.5 text-base text-tinta-900 outline-none focus:border-terracota-300 focus:ring-2 focus:ring-terracota-100"
              >
                {#each frecuencias as f}
                  <option value={f.valor}>{f.nombre}</option>
                {/each}
              </select>
            </div>
          </div>
        {/each}
      </div>

      <button
        type="button"
        onclick={agregarGrupo}
        class="mt-3 w-full rounded-xl border border-dashed border-crema-300 px-4 py-2.5 text-sm font-semibold text-tinta-700 transition-colors hover:bg-crema-100"
      >
        + Agregar grupo de honorario
      </button>

      <p class="mt-3 rounded-lg bg-crema-50 px-3 py-2 text-sm text-tinta-600">
        <strong class="text-tinta-900">{r.pacientesActivos}</strong> pacientes ·
        <strong class="text-tinta-900">{fmtNumero(r.sesionesSemanaTotal)}</strong> sesiones por semana
      </p>

      <!-- Descanso / vacaciones (en lenguaje humano, no "semanas trabajadas") -->
      <div class="mt-5">
        <p class="text-sm font-medium text-tinta-700">¿Cuánto descansás al año?</p>
        <div class="mt-2 flex flex-wrap gap-2">
          {#each descansoPresets as d}
            <button
              type="button"
              onclick={() => setDescanso(d.semanas)}
              aria-pressed={vacaciones === d.semanas}
              class:bg-terracota-600={vacaciones === d.semanas}
              class:text-crema-50={vacaciones === d.semanas}
              class:border-transparent={vacaciones === d.semanas}
              class="rounded-xl border border-crema-200 bg-white px-3.5 py-2 text-sm font-medium text-tinta-700 transition-colors hover:bg-crema-100"
            >
              {d.label}
            </button>
          {/each}
        </div>
        <div class="mt-2.5 flex items-center gap-2">
          <label for="descanso-exacto" class="text-sm text-tinta-500">o exactas</label>
          <input
            id="descanso-exacto"
            type="number"
            inputmode="numeric"
            min="0"
            max="52"
            value={vacaciones}
            onfocus={(e) => e.currentTarget.select()}
            oninput={(e) =>
              setDescanso(e.currentTarget.value === '' ? 0 : e.currentTarget.valueAsNumber)}
            class="w-16 rounded-lg border border-crema-200 bg-white px-2 py-1.5 text-center text-base text-tinta-900 outline-none focus:border-terracota-300 focus:ring-2 focus:ring-terracota-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span class="text-sm text-tinta-500">semanas</span>
        </div>
        <p class="mt-2 text-xs text-tinta-600">
          → Trabajás unas <strong class="text-tinta-900">{fmtNumero(esc.semanasTrabajadas)}</strong>
          semanas al año.
        </p>
      </div>

      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <CampoNumero
          id="cancelaciones"
          label="Sesiones que cancelan"
          sufijo="/mes"
          bind:value={esc.cancelacionesMes}
          ayuda={`Más o menos por mes, entre ausencias y cancelaciones. ≈ ${fmtPct(r.ausentismoPct)} de tus sesiones.`}
        />
        <CampoNumero
          id="admin"
          label="Horas administrativas"
          sufijo="h/sem"
          bind:value={esc.horasAdminSemana}
          ayuda="Registros, mails, coordinación, facturación… para muchos son entre 3 y 6 h por semana."
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
    <Resultados {r} {sost} simbolo={preset.simbolo} usarUSD={esc.usarUSD} cotizacion={esc.cotizacionUSD} />
  </div>
</div>

<!-- Hoja imprimible (oculta en pantalla; se ve al exportar PDF) -->
<ResumenImprimible {esc} {r} {sost} {preset} />
