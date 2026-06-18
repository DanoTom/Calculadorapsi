<script lang="ts">
  /**
   * ISLA INTERACTIVA — placeholder del Hito 1.
   *
   * Por ahora muestra una vista previa de las tres métricas estrella y un
   * toggle Mensual/Anual (para confirmar que Svelte funciona end-to-end).
   * En el Hito 2 este componente pasa a ser la calculadora real.
   */
  let periodo = $state<'mensual' | 'anual'>('mensual');

  const metricas = [
    {
      etiqueta: 'Ingreso neto real',
      ayuda: 'Lo que te queda después de todo',
      acento: 'salvia',
    },
    {
      etiqueta: 'Ingreso por hora real',
      ayuda: 'Tu neto sobre todas las horas',
      acento: 'terracota',
    },
    {
      etiqueta: 'Índice de sostenibilidad',
      ayuda: 'Si tu ritmo es sano para vos',
      acento: 'ambar',
    },
  ];

  const acentos: Record<string, string> = {
    salvia: 'text-salvia-600',
    terracota: 'text-terracota-500',
    ambar: 'text-ambar-600',
  };
</script>

<div class="rounded-3xl border border-crema-200 bg-white p-5 shadow-tarjeta sm:p-7">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <span
      class="inline-flex items-center gap-1.5 rounded-full bg-ambar-50 px-3 py-1 text-xs font-semibold text-ambar-600"
    >
      <span class="inline-block h-1.5 w-1.5 rounded-full bg-ambar-500"></span>
      En construcción
    </span>

    <!-- Micro-interacción real para validar la isla -->
    <div
      class="inline-flex rounded-xl bg-crema-100 p-1 text-sm"
      role="group"
      aria-label="Período de los resultados"
    >
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 font-medium transition-colors"
        class:bg-white={periodo === 'mensual'}
        class:text-tinta-900={periodo === 'mensual'}
        class:shadow-suave={periodo === 'mensual'}
        class:text-tinta-500={periodo !== 'mensual'}
        aria-pressed={periodo === 'mensual'}
        onclick={() => (periodo = 'mensual')}
      >
        Mensual
      </button>
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 font-medium transition-colors"
        class:bg-white={periodo === 'anual'}
        class:text-tinta-900={periodo === 'anual'}
        class:shadow-suave={periodo === 'anual'}
        class:text-tinta-500={periodo !== 'anual'}
        aria-pressed={periodo === 'anual'}
        onclick={() => (periodo = 'anual')}
      >
        Anual
      </button>
    </div>
  </div>

  <div class="mt-6 grid gap-3 sm:grid-cols-3">
    {#each metricas as m}
      <div class="rounded-2xl border border-crema-100 bg-crema-50 p-4">
        <p class="text-xs font-medium text-tinta-500">{m.etiqueta}</p>
        <p class="mt-2 font-display text-2xl font-semibold {acentos[m.acento]}">
          —
        </p>
        <p class="mt-1 text-xs text-tinta-400">{m.ayuda} · {periodo}</p>
      </div>
    {/each}
  </div>

  <p class="mt-6 text-center text-sm text-tinta-500">
    Estamos puliendo cada detalle. Muy pronto vas a poder cargar tus números acá mismo.
  </p>
</div>
