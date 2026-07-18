<script lang="ts">
  import { untrack } from 'svelte';

  /**
   * Recorrido guiado por la calculadora. Sin dependencias: un "spotlight"
   * (recuadro con sombra gigante que oscurece el resto) que se posiciona
   * sobre el elemento [data-tour] de cada paso, más una tarjeta fija abajo
   * con la explicación y los controles.
   */
  interface Paso {
    objetivo: string;
    titulo: string;
    texto: string;
  }

  let {
    pasos,
    activo = $bindable(false),
  }: { pasos: Paso[]; activo: boolean } = $props();

  let indice = $state(0);
  let rect = $state<{ top: number; left: number; width: number; height: number } | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function medir() {
    rect = null;
    const el = document.querySelector(`[data-tour="${pasos[indice].objetivo}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    clearTimeout(timer);
    // Esperamos a que termine el scroll suave antes de posicionar el recuadro
    timer = setTimeout(() => {
      const r = el.getBoundingClientRect();
      const margen = 8;
      rect = {
        top: r.top + window.scrollY - margen,
        left: r.left + window.scrollX - margen,
        width: r.width + margen * 2,
        height: r.height + margen * 2,
      };
    }, 420);
  }

  function cerrar() {
    activo = false;
    indice = 0;
    rect = null;
  }

  function siguiente() {
    if (indice < pasos.length - 1) {
      indice += 1;
      medir();
    } else {
      cerrar();
    }
  }

  function anterior() {
    if (indice > 0) {
      indice -= 1;
      medir();
    }
  }

  $effect(() => {
    if (activo) {
      // untrack: este efecto debe depender SOLO de `activo`; si trackeara
      // `indice` (que medir() lee), cada "Siguiente" lo devolvería al paso 0.
      untrack(() => {
        indice = 0;
        medir();
      });
    }
  });

  $effect(() => {
    if (!activo) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
      if (e.key === 'ArrowRight') siguiente();
      if (e.key === 'ArrowLeft') anterior();
    };
    const alRedimensionar = () => medir();
    window.addEventListener('keydown', alTeclear);
    window.addEventListener('resize', alRedimensionar);
    return () => {
      window.removeEventListener('keydown', alTeclear);
      window.removeEventListener('resize', alRedimensionar);
    };
  });
</script>

{#if activo}
  <!-- Spotlight: recuadro sobre el elemento del paso; la sombra oscurece el resto -->
  {#if rect}
    <div
      class="pointer-events-none absolute z-[60] rounded-2xl border-2 border-terracota-400 transition-all duration-200"
      style={`top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;box-shadow:0 0 0 9999px rgba(44,36,28,0.45)`}
      aria-hidden="true"
    ></div>
  {/if}

  <!-- Tarjeta guía -->
  <div
    class="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-md rounded-2xl border border-crema-200 bg-white p-4 shadow-2xl sm:bottom-5 sm:p-5"
    role="dialog"
    aria-label="Recorrido guiado"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-terracota-600">
          Paso {indice + 1} de {pasos.length}
        </p>
        <h3 class="mt-1 font-display text-lg font-semibold text-tinta-900">
          {pasos[indice].titulo}
        </h3>
      </div>
      <button
        type="button"
        onclick={cerrar}
        class="rounded-lg px-2 py-1 text-sm text-tinta-500 transition-colors hover:text-tinta-800"
        aria-label="Salir del recorrido"
      >
        ✕
      </button>
    </div>
    <p class="mt-2 text-sm leading-relaxed text-tinta-600">{pasos[indice].texto}</p>
    <div class="mt-4 flex items-center justify-between">
      <button
        type="button"
        onclick={anterior}
        disabled={indice === 0}
        class="rounded-xl px-3 py-2 text-sm font-medium text-tinta-600 transition-colors hover:text-tinta-900 disabled:invisible"
      >
        ← Anterior
      </button>
      <button
        type="button"
        onclick={siguiente}
        class="rounded-xl bg-terracota-600 px-4 py-2 text-sm font-semibold text-crema-50 transition-colors hover:bg-terracota-700"
      >
        {indice === pasos.length - 1 ? 'Listo, a cargar lo mío' : 'Siguiente →'}
      </button>
    </div>
  </div>
{/if}
