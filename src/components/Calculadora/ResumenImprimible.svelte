<script lang="ts">
  /** Hoja A4 imprimible (Exportar PDF). Oculta en pantalla; se ve al imprimir. */
  import { onMount } from 'svelte';
  import type { Escenario, TipoSesion } from '../../lib/tipos';
  import type { Resultado } from '../../lib/tipos';
  import type { Sostenibilidad } from '../../lib/sostenibilidad';
  import type { Preset } from '../../lib/presets';
  import { fmtMoneda, fmtPct, fmtNumero, n } from '../../lib/formato';

  // Movemos la hoja a ser hija directa del <body>. Así, al imprimir, podemos
  // ocultar todo lo demás y que NO queden páginas en blanco.
  let el: HTMLElement;
  onMount(() => {
    document.body.appendChild(el);
    return () => el?.remove();
  });

  interface Props {
    esc: Escenario;
    r: Resultado;
    sost: Sostenibilidad;
    preset: Preset;
  }
  let { esc, r, sost, preset }: Props = $props();

  const s = preset.simbolo;
  const fecha = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tiposNombre: Record<TipoSesion, string> = {
    individual: 'Individual',
    parejaFamilia: 'Pareja / Familia',
    grupo: 'Grupo',
  };
  const frecLabel = (v: number) =>
    v === 1 ? 'semanal' : v === 0.5 ? 'quincenal' : v === 2 ? '2x/sem' : v === 0.25 ? 'mensual' : `${v}/sem`;
  const vacaciones = $derived(Math.max(0, 52 - n(esc.semanasTrabajadas)));

  const gastosLista = $derived((esc.gastos ?? []).filter((g) => n(g.monto) > 0));
</script>

<div bind:this={el} id="hoja-impresion" class="hoja-impresion">
  <div style="font-family: 'Inter Variable', sans-serif; color: #2c241c; max-width: 720px;">
    <!-- Encabezado -->
    <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #ecdfce; padding-bottom:12px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:10px; background:#c75d45; color:#fcf9f4; font-family:'Fraunces Variable',serif; font-size:22px; font-weight:600;">ψ</span>
        <span style="font-family:'Fraunces Variable',serif; font-size:22px; font-weight:600;">Resumen de tu práctica</span>
      </div>
      <div style="text-align:right; font-size:12px; color:#6e5f50;">
        <div>{preset.nombre}</div>
        <div>{fecha}</div>
      </div>
    </div>

    <!-- Espacio para marca propia -->
    <div style="margin-top:10px; font-size:12px; color:#6e5f50;">
      Profesional: ______________________________
    </div>

    <!-- Resultados principales -->
    <h2 style="font-family:'Fraunces Variable',serif; font-size:16px; margin:18px 0 8px;">Resultados</h2>
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
      <div style="border:1px solid #ecdfce; border-radius:10px; padding:10px;">
        <div style="font-size:11px; color:#6e5f50;">Ingreso neto / mes</div>
        <div style="font-family:'Fraunces Variable',serif; font-size:20px; font-weight:600; color:#4a7355;">{fmtMoneda(r.netoMensual, s)}</div>
      </div>
      <div style="border:1px solid #ecdfce; border-radius:10px; padding:10px;">
        <div style="font-size:11px; color:#6e5f50;">Ingreso neto / año</div>
        <div style="font-family:'Fraunces Variable',serif; font-size:20px; font-weight:600;">{fmtMoneda(r.netoAnual, s)}</div>
      </div>
      <div style="border:1px solid #ecdfce; border-radius:10px; padding:10px;">
        <div style="font-size:11px; color:#6e5f50;">Por hora real</div>
        <div style="font-family:'Fraunces Variable',serif; font-size:20px; font-weight:600; color:#ad4a35;">{fmtMoneda(r.ingresoPorHoraReal, s)}</div>
      </div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:10px;">
      <div style="border:1px solid #ecdfce; border-radius:10px; padding:10px;">
        <div style="font-size:11px; color:#6e5f50;">Facturación bruta / mes</div>
        <div style="font-size:15px; font-weight:600;">{fmtMoneda(r.brutoMensual, s)}</div>
      </div>
      <div style="border:1px solid #ecdfce; border-radius:10px; padding:10px;">
        <div style="font-size:11px; color:#6e5f50;">Margen neto</div>
        <div style="font-size:15px; font-weight:600;">{fmtPct(r.margenNetoPct)}</div>
      </div>
      <div style="border:1px solid #ecdfce; border-radius:10px; padding:10px;">
        <div style="font-size:11px; color:#6e5f50;">Sostenibilidad</div>
        <div style="font-size:15px; font-weight:600;">{sost.puntaje}/100 · {sost.titulo}</div>
      </div>
    </div>

    <!-- Esquema y gastos -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:18px;">
      <div>
        <h2 style="font-family:'Fraunces Variable',serif; font-size:16px; margin:0 0 8px;">Tu esquema</h2>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <tbody>
          {#each esc.grupos as g}
            <tr>
              <td style="padding:3px 0; color:#6e5f50;">
                {tiposNombre[g.tipo]}{g.etiqueta ? ` (${g.etiqueta})` : ''}
              </td>
              <td style="padding:3px 0; text-align:right;">
                {fmtNumero(n(g.cantidad))} pac · {fmtMoneda(n(g.honorario), s)} · {frecLabel(g.frecuenciaSemanal)}
              </td>
            </tr>
          {/each}
          <tr><td style="padding:3px 0; color:#6e5f50;">Pacientes / sesiones</td><td style="padding:3px 0; text-align:right;">{fmtNumero(r.pacientesActivos)} pac · {fmtNumero(r.sesionesSemanaTotal)}/sem</td></tr>
          <tr><td style="padding:3px 0; color:#6e5f50;">Semanas trabajadas</td><td style="padding:3px 0; text-align:right;">{fmtNumero(n(esc.semanasTrabajadas))} ({vacaciones} de descanso)</td></tr>
          <tr><td style="padding:3px 0; color:#6e5f50;">Sesiones que cancelan</td><td style="padding:3px 0; text-align:right;">{fmtNumero(n(esc.cancelacionesMes))}/mes (≈ {fmtPct(r.ausentismoPct)})</td></tr>
          <tr><td style="padding:3px 0; color:#6e5f50;">Horas admin.</td><td style="padding:3px 0; text-align:right;">{fmtNumero(n(esc.horasAdminSemana))} h/sem</td></tr>
          <tr><td style="padding:3px 0; color:#6e5f50;">Impuesto / retención</td><td style="padding:3px 0; text-align:right;">{fmtPct(n(esc.impuestoPct))}</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <h2 style="font-family:'Fraunces Variable',serif; font-size:16px; margin:0 0 8px;">Gastos / mes</h2>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <tbody>
          {#each gastosLista as g}
            <tr><td style="padding:3px 0; color:#6e5f50;">{g.concepto}{g.frecuencia === 'anual' ? ' (anual)' : ''}</td><td style="padding:3px 0; text-align:right;">{fmtMoneda(n(g.monto), s)}{g.frecuencia === 'anual' ? '/año' : ''}</td></tr>
          {/each}
          <tr style="border-top:1px solid #ecdfce;"><td style="padding:5px 0; font-weight:600;">Total gastos / mes</td><td style="padding:5px 0; text-align:right; font-weight:600;">{fmtMoneda(r.gastosMensual, s)}</td></tr>
          <tr><td style="padding:3px 0; color:#6e5f50;">Impuestos</td><td style="padding:3px 0; text-align:right;">{fmtMoneda(r.impuestoMensual, s)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Sostenibilidad -->
    <h2 style="font-family:'Fraunces Variable',serif; font-size:16px; margin:18px 0 8px;">
      Sostenibilidad: {sost.puntaje}/100 — {sost.titulo}
    </h2>
    <p style="font-size:12px; color:#54473a; margin:0 0 8px;">{sost.lectura}</p>
    <ul style="font-size:12px; color:#54473a; margin:0; padding-left:16px;">
      {#each sost.factores as f}
        <li style="margin-bottom:3px;"><strong>{f.label}:</strong> {f.mensaje}</li>
      {/each}
    </ul>

    <!-- Pie -->
    <div style="margin-top:18px; border-top:1px solid #ecdfce; padding-top:10px; font-size:10px; color:#8c7c6b;">
      Estimación orientativa, no asesoramiento contable. Generado en calculadorapsi.com
    </div>
  </div>
</div>
