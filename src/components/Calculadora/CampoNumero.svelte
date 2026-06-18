<script lang="ts">
  /** Campo numérico reutilizable con etiqueta, prefijo/sufijo y ayuda. */
  interface Props {
    label: string;
    value: number;
    id?: string;
    prefijo?: string;
    sufijo?: string;
    ayuda?: string;
    min?: number;
    max?: number;
    step?: number;
  }

  let {
    label,
    value = $bindable(),
    id,
    prefijo = '',
    sufijo = '',
    ayuda = '',
    min = 0,
    max,
    step = 1,
  }: Props = $props();

  // id estable (mismo en servidor y cliente) para asociar <label> e <input>
  const campoId = id ?? 'c-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const ayudaId = ayuda ? campoId + '-ayuda' : undefined;

  function onInput(e: Event) {
    const t = e.currentTarget as HTMLInputElement;
    value = t.value === '' ? 0 : t.valueAsNumber;
  }
</script>

<div>
  <label for={campoId} class="block text-sm font-medium text-tinta-700">{label}</label>
  <div
    class="mt-1.5 flex items-center rounded-xl border border-crema-200 bg-white transition-colors focus-within:border-terracota-300 focus-within:ring-2 focus-within:ring-terracota-100"
  >
    {#if prefijo}
      <span class="pl-3.5 text-sm text-tinta-500 select-none">{prefijo}</span>
    {/if}
    <input
      id={campoId}
      type="number"
      inputmode="decimal"
      {min}
      {max}
      {step}
      value={Number.isFinite(value) ? value : 0}
      oninput={onInput}
      onfocus={(e) => e.currentTarget.select()}
      aria-describedby={ayudaId}
      class="w-full bg-transparent px-3.5 py-2.5 text-base text-tinta-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
    {#if sufijo}
      <span class="pr-3.5 text-sm text-tinta-500 select-none">{sufijo}</span>
    {/if}
  </div>
  {#if ayuda}
    <p id={ayudaId} class="mt-1 text-xs leading-snug text-tinta-600">{ayuda}</p>
  {/if}
</div>
