<script lang="ts">
  import type { Sostenibilidad, Estado } from '../../lib/sostenibilidad';

  interface Props {
    sost: Sostenibilidad;
  }
  let { sost }: Props = $props();

  // Colores por estado (cálidos, nada estridente)
  const trazo: Record<Estado, string> = {
    bien: '#5e8c6a', // salvia-500
    atencion: '#ce8e3c', // ambar-500
    riesgo: '#b5483a', // arcilla-500
  };
  const puntoClase: Record<Estado, string> = {
    bien: 'bg-salvia-500',
    atencion: 'bg-ambar-500',
    riesgo: 'bg-arcilla-500',
  };
  const textoClase: Record<Estado, string> = {
    bien: 'text-salvia-600',
    atencion: 'text-ambar-600',
    riesgo: 'text-arcilla-600',
  };

  // Geometría del medidor circular (donut)
  const R = 52;
  const C = 2 * Math.PI * R;
  const offset = $derived(C * (1 - sost.puntaje / 100));
</script>

<div class="rounded-3xl border border-crema-200 bg-white p-5 shadow-tarjeta">
  <p class="text-sm font-medium text-tinta-500">Índice de sostenibilidad</p>

  <div class="mt-3 flex items-center gap-4">
    <!-- Medidor -->
    <div class="relative shrink-0">
      <svg width="104" height="104" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#f6efe5" stroke-width="12" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={trazo[sost.estado]}
          stroke-width="12"
          stroke-linecap="round"
          stroke-dasharray={C}
          stroke-dashoffset={offset}
          transform="rotate(-90 60 60)"
          style="transition: stroke-dashoffset 0.5s ease"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="font-display text-2xl font-semibold text-tinta-900">{sost.puntaje}</span>
        <span class="text-[10px] font-medium text-tinta-500">de 100</span>
      </div>
    </div>

    <div>
      <p class="font-display text-xl font-semibold {textoClase[sost.estado]}">{sost.titulo}</p>
      <p class="mt-1 text-sm leading-relaxed text-tinta-600">{sost.lectura}</p>
    </div>
  </div>

  <!-- Factores -->
  <ul class="mt-4 space-y-3 border-t border-crema-100 pt-4">
    {#each sost.factores as f}
      <li class="flex gap-3">
        <span class="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full {puntoClase[f.estado]}"></span>
        <div>
          <p class="text-sm font-semibold text-tinta-800">{f.label}</p>
          <p class="text-xs leading-relaxed text-tinta-500">{f.mensaje}</p>
        </div>
      </li>
    {/each}
  </ul>

  <p class="mt-4 text-[11px] leading-relaxed text-tinta-600">
    Es una lectura orientativa para acompañar tus decisiones, no un diagnóstico. Vos conocés tu
    contexto mejor que cualquier número.
  </p>
</div>
