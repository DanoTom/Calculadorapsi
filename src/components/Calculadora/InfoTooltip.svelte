<script lang="ts">
  /**
   * Tooltip de ayuda accesible. Un botón "i" que abre una breve explicación.
   * Funciona en mobile (tocar), con teclado y mouse. Se cierra al tocar afuera
   * o con Escape.
   */
  interface Props {
    texto: string;
    etiqueta?: string;
    /** Hacia qué lado se abre el globo (para no salirse de pantalla) */
    align?: 'left' | 'right';
  }
  let { texto, etiqueta = 'Qué significa', align = 'left' }: Props = $props();

  let abierto = $state(false);
  let cont: HTMLElement;

  function toggle(e: MouseEvent) {
    e.stopPropagation();
    abierto = !abierto;
  }

  $effect(() => {
    if (!abierto) return;
    const onDoc = (e: MouseEvent) => {
      if (cont && !cont.contains(e.target as Node)) abierto = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') abierto = false;
    };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  });
</script>

<span bind:this={cont} class="relative inline-flex align-middle">
  <button
    type="button"
    onclick={toggle}
    aria-expanded={abierto}
    aria-label={etiqueta}
    class="inline-flex h-4 w-4 items-center justify-center rounded-full border border-crema-300 text-[10px] font-semibold text-tinta-500 transition-colors hover:bg-crema-100 hover:text-tinta-700"
  >
    i
  </button>
  {#if abierto}
    <span
      role="tooltip"
      class:left-0={align === 'left'}
      class:right-0={align === 'right'}
      class="absolute top-6 z-30 w-52 rounded-xl border border-crema-200 bg-white p-3 text-left text-xs font-normal leading-relaxed text-tinta-700 shadow-tarjeta"
    >
      {texto}
    </span>
  {/if}
</span>
