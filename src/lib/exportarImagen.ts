/**
 * Genera y descarga una imagen PNG vertical (4:5) con los números clave,
 * lista para compartir en WhatsApp/Instagram. Dibujada directamente en canvas:
 * sin dependencias y nítida.
 */
import type { Estado } from './sostenibilidad';

export interface DatosImagen {
  netoMensual: string;
  netoAnual: string;
  horaReal: string;
  puntaje: number;
  titulo: string;
  estado: Estado;
}

const C = {
  crema: '#fcf9f4',
  blanco: '#ffffff',
  tinta: '#2c241c',
  tintaSuave: '#6e5f50',
  borde: '#ecdfce',
  terracota: '#c75d45',
  salvia: '#5e8c6a',
  ambar: '#ce8e3c',
  arcilla: '#b5483a',
};

const colorEstado: Record<Estado, string> = {
  bien: C.salvia,
  atencion: C.ambar,
  riesgo: C.arcilla,
};

function tarjeta(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = C.blanco;
  ctx.strokeStyle = C.borde;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 24);
  ctx.fill();
  ctx.stroke();
}

export async function descargarImagen(d: DatosImagen): Promise<void> {
  if (typeof document === 'undefined') return;
  const W = 1080;
  const H = 1350;
  const P = 72;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Esperar a que las fuentes estén listas (para que el texto se vea bien)
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* sin problema */
  }

  // Fondo
  ctx.fillStyle = C.crema;
  ctx.fillRect(0, 0, W, H);

  // Encabezado: sello ψ + marca
  ctx.fillStyle = C.terracota;
  ctx.beginPath();
  ctx.roundRect(P, 72, 88, 88, 22);
  ctx.fill();
  ctx.fillStyle = C.crema;
  ctx.font = '600 52px "Fraunces Variable", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ψ', P + 44, 72 + 48);

  ctx.fillStyle = C.tinta;
  ctx.font = '600 40px "Fraunces Variable", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('CalculadoraPsi', P + 108, 72 + 46);

  // Título
  ctx.fillStyle = C.tinta;
  ctx.font = '600 64px "Fraunces Variable", serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Mi práctica,', P, 320);
  ctx.fillText('en números', P, 392);

  // Tarjeta neto mensual (destacada)
  tarjeta(ctx, P, 440, W - 2 * P, 240);
  ctx.fillStyle = C.tintaSuave;
  ctx.font = '500 30px "Inter Variable", sans-serif';
  ctx.fillText('Ingreso neto estimado', P + 44, 510);
  ctx.fillStyle = C.salvia;
  ctx.font = '600 96px "Fraunces Variable", serif';
  ctx.fillText(d.netoMensual, P + 44, 610);
  ctx.fillStyle = C.tintaSuave;
  ctx.font = '400 28px "Inter Variable", sans-serif';
  ctx.fillText('por mes (promedio del año)', P + 44, 655);

  // Dos tarjetas: por hora real + sostenibilidad
  const gap = 28;
  const cw = (W - 2 * P - gap) / 2;
  const cy = 712;
  const ch = 220;

  tarjeta(ctx, P, cy, cw, ch);
  ctx.fillStyle = C.tintaSuave;
  ctx.font = '500 28px "Inter Variable", sans-serif';
  ctx.fillText('Por hora real', P + 36, cy + 60);
  ctx.fillStyle = C.terracota;
  ctx.font = '600 56px "Fraunces Variable", serif';
  ctx.fillText(d.horaReal, P + 36, cy + 130);

  const x2 = P + cw + gap;
  tarjeta(ctx, x2, cy, cw, ch);
  ctx.fillStyle = C.tintaSuave;
  ctx.font = '500 28px "Inter Variable", sans-serif';
  ctx.fillText('Sostenibilidad', x2 + 36, cy + 60);
  // punto de color + puntaje
  ctx.fillStyle = colorEstado[d.estado];
  ctx.beginPath();
  ctx.arc(x2 + 36 + 14, cy + 116, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.tinta;
  ctx.font = '600 56px "Fraunces Variable", serif';
  ctx.fillText(`${d.puntaje}`, x2 + 70, cy + 134);
  ctx.fillStyle = colorEstado[d.estado];
  ctx.font = '500 26px "Inter Variable", sans-serif';
  ctx.fillText(d.titulo, x2 + 36, cy + 180);

  // Neto anual
  const ay = cy + ch + 28;
  tarjeta(ctx, P, ay, W - 2 * P, 130);
  ctx.fillStyle = C.tintaSuave;
  ctx.font = '500 28px "Inter Variable", sans-serif';
  ctx.fillText('Ingreso neto al año', P + 44, ay + 56);
  ctx.fillStyle = C.tinta;
  ctx.font = '600 52px "Fraunces Variable", serif';
  ctx.fillText(d.netoAnual, P + 44, ay + 104);

  // Pie
  ctx.fillStyle = C.terracota;
  ctx.font = '600 34px "Inter Variable", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Calculá la tuya gratis en calculadorapsi.com', W / 2, H - 70);

  // Descargar
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mi-practica-calculadorapsi.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
