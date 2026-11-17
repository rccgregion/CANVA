import { CanvaPage, DocDimensions, CanvasItem } from './types';
import { getShapeSvgPath } from './ShapeRenderer';
import { buildQrMatrix, DEFAULT_CHART_DATA } from './QrAndChartRenderer';

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

export const formatDisplayText = (item: CanvasItem): string => {
  let text = item.content || '';
  if (item.textTransform === 'uppercase') text = text.toUpperCase();
  if (item.textTransform === 'lowercase') text = text.toLowerCase();
  if (item.listType === 'bullet') {
    text = text
      .split('\n')
      .map((line) => (line.trim() ? `• ${line.replace(/^[•\d+.]\s*/, '')}` : line))
      .join('\n');
  } else if (item.listType === 'numbered') {
    let n = 1;
    text = text
      .split('\n')
      .map((line) => (line.trim() ? `${n++}. ${line.replace(/^[•\d+.]\s*/, '')}` : line))
      .join('\n');
  }
  return text;
};

const wrapTextLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    lines.push(current);
  }
  return lines;
};

const makeCanvasGradient = (
  ctx: CanvasRenderingContext2D,
  cssGradient: string | undefined,
  fallback: string,
  x: number,
  y: number,
  w: number,
  h: number
): string | CanvasGradient => {
  if (cssGradient) {
    const matches = cssGradient.match(/#[0-9a-fA-F]{3,8}/g);
    if (matches && matches.length >= 2) {
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, matches[0]);
      grad.addColorStop(1, matches[matches.length - 1]);
      return grad;
    }
  }
  return fallback;
};

export async function renderPageToCanvas(
  page: CanvaPage,
  dimensions: DocDimensions,
  baseWidth: number,
  baseHeight: number,
  scaleFactor = 1,
  transparentBg = false
): Promise<HTMLCanvasElement> {
  const outW = Math.round(dimensions.width * scaleFactor);
  const outH = Math.round(dimensions.height * scaleFactor);
  const scaleX = outW / baseWidth;
  const scaleY = outH / baseHeight;

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Background
  if (!transparentBg) {
    ctx.fillStyle = makeCanvasGradient(
      ctx,
      page.backgroundGradient,
      page.backgroundColor || '#ffffff',
      0,
      0,
      outW,
      outH
    );
    ctx.fillRect(0, 0, outW, outH);
  }

  // Render items in layer order
  for (const item of page.items) {
    if (item.isHidden) continue;

    ctx.save();
    ctx.globalAlpha = item.opacity ?? 1;

    const ix = item.x * scaleX;
    const iy = item.y * scaleY;
    const iw = (item.width || (item.type === 'sticker' ? (item.fontSize || 48) * 1.3 : 260)) * scaleX;
    const ih = (item.height || (item.type === 'sticker' ? (item.fontSize || 48) * 1.3 : 56)) * scaleY;

    // Rotation & flip around item center
    const cx = ix + iw / 2;
    const cy = iy + ih / 2;
    ctx.translate(cx, cy);
    if (item.rotation) ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.scale(item.flipX ? -1 : 1, item.flipY ? -1 : 1);
    ctx.translate(-cx, -cy);

    if (item.type === 'image' && item.imageUrl) {
      try {
        const img = await loadImage(item.imageUrl);
        const f = item.imageFilters;
        if (f) {
          ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) blur(${f.blur}px) grayscale(${f.grayscale}%)`;
        }
        const radius = (item.magicCutout ? 9999 : item.borderRadius || 0) * scaleX;
        ctx.save();
        drawRoundedRect(ctx, ix, iy, iw, ih, radius);
        ctx.clip();
        const crop = item.imageCrop;
        const cScale = crop?.scale ?? 1;
        const cOffX = ((crop?.offsetX ?? 0) / 100) * iw;
        const cOffY = ((crop?.offsetY ?? 0) / 100) * ih;
        const dw = iw * cScale;
        const dh = ih * cScale;
        const dx = ix + (iw - dw) / 2 + cOffX;
        const dy = iy + (ih - dh) / 2 + cOffY;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
        ctx.filter = 'none';
      } catch {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(ix, iy, iw, ih);
      }
    } else if (item.type === 'qrcode') {
      drawRoundedRect(ctx, ix, iy, iw, ih, 12 * scaleX);
      ctx.fillStyle = item.bgColor || '#ffffff';
      ctx.fill();
      const matrix = buildQrMatrix(item.qrValue || item.content || 'https://canva.com');
      const pad = 10 * scaleX;
      const cellW = (iw - pad * 2) / matrix.length;
      const cellH = (ih - pad * 2) / matrix.length;
      ctx.fillStyle = item.color || '#1e1b4b';
      matrix.forEach((row, r) =>
        row.forEach((cell, c) => {
          if (cell) ctx.fillRect(ix + pad + c * cellW, iy + pad + r * cellH, cellW + 0.4, cellH + 0.4);
        })
      );
    } else if (item.type === 'chart') {
      const data = item.chartData && item.chartData.length > 0 ? item.chartData : DEFAULT_CHART_DATA;
      drawRoundedRect(ctx, ix, iy, iw, ih, 12 * scaleX);
      ctx.fillStyle = item.bgColor || '#ffffff';
      ctx.fill();

      if (item.chartKind === 'donut') {
        const total = Math.max(1, data.reduce((acc, d) => acc + d.value, 0));
        const r = Math.min(iw * 0.25, ih * 0.34);
        const centerX = ix + r + 18 * scaleX;
        const centerY = iy + ih / 2;
        let startAngle = -Math.PI / 2;
        data.forEach((d) => {
          const slice = (d.value / total) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, startAngle, startAngle + slice);
          ctx.strokeStyle = d.color;
          ctx.lineWidth = Math.max(8, r * 0.45);
          ctx.stroke();
          startAngle += slice;
        });
        ctx.font = `600 ${11 * scaleX}px Outfit, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        data.forEach((d, idx) => {
          const ly = iy + 22 * scaleY + idx * 18 * scaleY;
          const lx = centerX + r + 24 * scaleX;
          ctx.fillStyle = d.color;
          ctx.fillRect(lx, ly - 4 * scaleY, 8 * scaleX, 8 * scaleY);
          ctx.fillStyle = item.color || '#1e1b4b';
          ctx.fillText(`${d.label}: ${d.value}`, lx + 12 * scaleX, ly);
        });
      } else {
        ctx.font = `700 ${11 * scaleX}px Outfit, sans-serif`;
        ctx.fillStyle = item.color || '#1e1b4b';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(item.content || 'Performance Metrics', ix + 12 * scaleX, iy + 10 * scaleY);

        const maxVal = Math.max(1, ...data.map((d) => d.value));
        const chartTop = iy + 32 * scaleY;
        const chartBottom = iy + ih - 22 * scaleY;
        const availH = Math.max(20, chartBottom - chartTop);
        const gap = 8 * scaleX;
        const barW = (iw - 24 * scaleX - gap * (data.length - 1)) / data.length;

        data.forEach((d, idx) => {
          const bx = ix + 12 * scaleX + idx * (barW + gap);
          const bh = Math.max(6, (d.value / maxVal) * availH);
          const by = chartBottom - bh;
          drawRoundedRect(ctx, bx, by, barW, bh, 4 * scaleX);
          ctx.fillStyle = d.color;
          ctx.fill();
          ctx.fillStyle = item.color || '#1e1b4b';
          ctx.font = `600 ${9 * scaleX}px Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(d.label, bx + barW / 2, chartBottom + 5 * scaleY);
        });
      }
    } else if (item.type === 'shape' || item.type === 'badge') {
      const kind = item.shapeKind || 'rect';
      if (kind === 'line' || kind === 'dashed-line') {
        ctx.strokeStyle = item.bgColor || '#7d2ae8';
        ctx.lineWidth = Math.max(2, (item.height || 4) * scaleY);
        if (kind === 'dashed-line') ctx.setLineDash([10 * scaleX, 6 * scaleX]);
        ctx.beginPath();
        ctx.moveTo(ix, iy + ih / 2);
        ctx.lineTo(ix + iw, iy + ih / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (['triangle', 'star', 'hexagon', 'diamond', 'arrow', 'bubble'].includes(kind)) {
        const rawW = item.width || 140;
        const rawH = item.height || 100;
        const svgPath = getShapeSvgPath(kind, rawW, rawH);
        const p2d = new Path2D(svgPath);
        ctx.save();
        ctx.translate(ix, iy);
        ctx.scale(iw / rawW, ih / rawH);
        ctx.fillStyle = makeCanvasGradient(ctx, item.bgGradient, item.bgColor || '#7d2ae8', 0, 0, rawW, rawH);
        ctx.fill(p2d);
        if (item.borderWidth && item.borderColor) {
          ctx.strokeStyle = item.borderColor;
          ctx.lineWidth = item.borderWidth;
          ctx.stroke(p2d);
        }
        ctx.restore();
      } else {
        const radius =
          (item.borderRadius !== undefined
            ? item.borderRadius
            : kind === 'circle' || kind === 'pill'
            ? 9999
            : 12) * scaleX;
        drawRoundedRect(ctx, ix, iy, iw, ih, radius);
        ctx.fillStyle = makeCanvasGradient(ctx, item.bgGradient, item.bgColor || '#7d2ae8', ix, iy, iw, ih);
        ctx.fill();
        if (item.borderWidth && item.borderColor) {
          ctx.strokeStyle = item.borderColor;
          ctx.lineWidth = item.borderWidth * scaleX;
          if (item.borderStyle === 'dashed') ctx.setLineDash([8 * scaleX, 5 * scaleX]);
          if (item.borderStyle === 'dotted') ctx.setLineDash([2 * scaleX, 4 * scaleX]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      if (item.content) {
        const fs = (item.fontSize || 13) * scaleX;
        ctx.font = `${item.fontWeight || 'bold'} ${fs}px ${item.fontFamily || 'Outfit, sans-serif'}`;
        ctx.fillStyle = item.color || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.content, ix + iw / 2, iy + ih / 2);
      }
    } else if (item.type === 'sticker') {
      const fs = (item.fontSize || 48) * scaleX;
      ctx.font = `${fs}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.content, ix + iw / 2, iy + ih / 2);
    } else if (item.type === 'text') {
      const fs = (item.fontSize || 24) * scaleX;
      const stylePrefix = item.fontStyle === 'italic' ? 'italic ' : '';
      const weightPrefix = item.fontWeight || '600';
      ctx.font = `${stylePrefix}${weightPrefix} ${fs}px ${item.fontFamily || 'Outfit, sans-serif'}`;
      ctx.textBaseline = 'top';

      const textValue = formatDisplayText(item);
      const align = item.textAlign || 'center';
      ctx.textAlign = align;
      const lines = wrapTextLines(ctx, textValue, iw);
      const lh = fs * (item.lineHeight || 1.2);

      if (item.textEffect === 'shadow') {
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 8 * scaleX;
        ctx.shadowOffsetX = 3 * scaleX;
        ctx.shadowOffsetY = 4 * scaleY;
      } else if (item.textEffect === 'lift') {
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 16 * scaleX;
        ctx.shadowOffsetY = 6 * scaleY;
      } else if (item.textEffect === 'neon') {
        ctx.shadowColor = item.color || '#ec4899';
        ctx.shadowBlur = 18 * scaleX;
      }

      const curve = item.textCurve || 0;
      if (Math.abs(curve) >= 5 && lines.length > 0) {
        const flatText = lines.join(' ');
        const chars = Array.from(flatText);
        const arcSpan = (curve / 100) * Math.PI * 0.85;
        const radius = Math.max(40, (iw * 0.55) / Math.max(0.25, Math.abs(arcSpan)));
        const arcCx = ix + iw / 2;
        const arcCy = curve > 0 ? iy + radius + fs * 0.4 : iy - radius + fs * 1.1;
        const stepAngle = chars.length > 1 ? arcSpan / (chars.length - 1) : 0;
        const startAngle = (curve > 0 ? -Math.PI / 2 : Math.PI / 2) - arcSpan / 2;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = item.color || '#1e1b4b';
        chars.forEach((ch, ci) => {
          const theta = startAngle + ci * stepAngle;
          const px = arcCx + radius * Math.cos(theta);
          const py = arcCy + radius * Math.sin(theta);
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(curve > 0 ? theta + Math.PI / 2 : theta - Math.PI / 2);
          if (item.textEffect === 'hollow') {
            ctx.strokeStyle = item.color || '#1e1b4b';
            ctx.lineWidth = Math.max(1.5, fs * 0.04);
            ctx.strokeText(ch, 0, 0);
          } else {
            ctx.fillText(ch, 0, 0);
          }
          ctx.restore();
        });
      } else {
        lines.forEach((line, idx) => {
          const lx = align === 'center' ? ix + iw / 2 : align === 'right' ? ix + iw : ix;
          const ly = iy + idx * lh;

          if (item.textEffect === 'background') {
            const metrics = ctx.measureText(line);
            const padX = 10 * scaleX;
            const padY = 4 * scaleY;
            const bw = metrics.width + padX * 2;
            const bh = fs * 1.2 + padY * 2;
            const bx = align === 'center' ? lx - bw / 2 : align === 'right' ? lx - bw + padX : lx - padX;
            ctx.save();
            ctx.shadowColor = 'transparent';
            drawRoundedRect(ctx, bx, ly - padY, bw, bh, 8 * scaleX);
            ctx.fillStyle = item.bgColor || '#f5f3ff';
            ctx.fill();
            ctx.restore();
          }

          if (item.textEffect === 'glitch') {
            ctx.fillStyle = '#00c4cc';
            ctx.fillText(line, lx + 2 * scaleX, ly);
            ctx.fillStyle = '#ec4899';
            ctx.fillText(line, lx - 2 * scaleX, ly);
          } else if (item.textEffect === 'echo') {
            ctx.save();
            ctx.globalAlpha = (item.opacity ?? 1) * 0.32;
            ctx.fillStyle = item.color || '#1e1b4b';
            ctx.fillText(line, lx + 4 * scaleX, ly + 4 * scaleY);
            ctx.restore();
          }

          if (item.textEffect === 'hollow') {
            ctx.strokeStyle = item.color || '#1e1b4b';
            ctx.lineWidth = Math.max(1.5, fs * 0.04);
            ctx.strokeText(line, lx, ly);
          } else {
            ctx.fillStyle = item.color || '#1e1b4b';
            ctx.fillText(line, lx, ly);
          }

          if (item.textDecoration && item.textDecoration !== 'none') {
            const metrics = ctx.measureText(line);
            const lineW = metrics.width;
            const startX = align === 'center' ? lx - lineW / 2 : align === 'right' ? lx - lineW : lx;
            const lineY = item.textDecoration === 'underline' ? ly + fs * 1.05 : ly + fs * 0.55;
            ctx.strokeStyle = item.color || '#1e1b4b';
            ctx.lineWidth = Math.max(1.5, fs * 0.06);
            ctx.beginPath();
            ctx.moveTo(startX, lineY);
            ctx.lineTo(startX + lineW, lineY);
            ctx.stroke();
          }
        });
      }
    }

    ctx.restore();
  }

  // Render freehand draw strokes
  for (const stroke of page.strokes) {
    if (stroke.points.length < 2) continue;
    ctx.save();
    ctx.globalAlpha = stroke.opacity;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width * scaleX;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x * scaleX, stroke.points[i].y * scaleY);
    }
    ctx.stroke();
    ctx.restore();
  }

  return canvas;
}

export function generateSvgExport(
  page: CanvaPage,
  dimensions: DocDimensions,
  baseWidth: number,
  baseHeight: number,
  transparentBg = false
): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const defs: string[] = [];

  let bgFill = page.backgroundColor || '#ffffff';
  if (page.backgroundGradient) {
    const matches = page.backgroundGradient.match(/#[0-9a-fA-F]{3,8}/g);
    if (matches && matches.length >= 2) {
      defs.push(
        `<linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${matches[0]}"/>
          <stop offset="100%" stop-color="${matches[matches.length - 1]}"/>
        </linearGradient>`
      );
      bgFill = 'url(#bg-grad)';
    }
  }

  const elementsSvg = page.items
    .filter((i) => !i.isHidden)
    .map((item: CanvasItem) => {
      const opacity = item.opacity ?? 1;
      const w = item.width || 220;
      const h = item.height || 50;
      const cx = item.x + w / 2;
      const cy = item.y + h / 2;
      const sx = item.flipX ? -1 : 1;
      const sy = item.flipY ? -1 : 1;
      const transforms: string[] = [];
      if (item.rotation) transforms.push(`rotate(${item.rotation} ${cx} ${cy})`);
      if (sx !== 1 || sy !== 1) transforms.push(`translate(${cx} ${cy}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`);
      const transform = transforms.length ? ` transform="${transforms.join(' ')}"` : '';

      if (item.type === 'qrcode') {
        const matrix = buildQrMatrix(item.qrValue || item.content || 'https://canva.com');
        const pad = 10;
        const cw = (w - pad * 2) / matrix.length;
        const ch = (h - pad * 2) / matrix.length;
        const rects = matrix
          .flatMap((row, r) =>
            row.map((cell, c) =>
              cell
                ? `<rect x="${(item.x + pad + c * cw).toFixed(2)}" y="${(item.y + pad + r * ch).toFixed(2)}" width="${(cw + 0.3).toFixed(2)}" height="${(ch + 0.3).toFixed(2)}" fill="${item.color || '#1e1b4b'}"/>`
                : ''
            )
          )
          .filter(Boolean)
          .join('');
        return `<g opacity="${opacity}"${transform}>
          <rect x="${item.x}" y="${item.y}" width="${w}" height="${h}" rx="12" fill="${item.bgColor || '#ffffff'}"/>
          ${rects}
        </g>`;
      }

      if (item.type === 'chart') {
        const data = item.chartData && item.chartData.length > 0 ? item.chartData : DEFAULT_CHART_DATA;
        if (item.chartKind === 'donut') {
          const total = Math.max(1, data.reduce((acc, d) => acc + d.value, 0));
          const r = Math.min(w * 0.25, h * 0.34);
          const dcx = item.x + r + 18;
          const dcy = item.y + h / 2;
          const circ = 2 * Math.PI * r;
          let cum = 0;
          const arcs = data
            .map((d) => {
              const frac = d.value / total;
              const dash = frac * circ;
              const offset = -cum * circ;
              cum += frac;
              return `<circle cx="${dcx}" cy="${dcy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${Math.max(8, r * 0.45)}" stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}" transform="rotate(-90 ${dcx} ${dcy})"/>`;
            })
            .join('');
          const legend = data
            .map((d, idx) => {
              const ly = item.y + 22 + idx * 18;
              const lx = dcx + r + 24;
              return `<rect x="${lx}" y="${ly - 4}" width="8" height="8" fill="${d.color}"/><text x="${lx + 12}" y="${ly + 3}" font-size="11" font-weight="600" font-family="sans-serif" fill="${item.color || '#1e1b4b'}">${esc(`${d.label}: ${d.value}`)}</text>`;
            })
            .join('');
          return `<g opacity="${opacity}"${transform}>
          <rect x="${item.x}" y="${item.y}" width="${w}" height="${h}" rx="12" fill="${item.bgColor || '#ffffff'}"/>
          ${arcs}
          ${legend}
        </g>`;
        }
        const maxVal = Math.max(1, ...data.map((d) => d.value));
        const bars = data
          .map((d, idx) => {
            const barW = (w - 24 - 8 * (data.length - 1)) / data.length;
            const bh = Math.max(6, (d.value / maxVal) * (h - 54));
            const bx = item.x + 12 + idx * (barW + 8);
            const by = item.y + h - 22 - bh;
            return `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" rx="4" fill="${d.color}"/><text x="${bx + barW / 2}" y="${item.y + h - 8}" text-anchor="middle" font-size="9" font-weight="600" font-family="sans-serif" fill="${item.color || '#1e1b4b'}">${esc(d.label)}</text>`;
          })
          .join('');
        return `<g opacity="${opacity}"${transform}>
          <rect x="${item.x}" y="${item.y}" width="${w}" height="${h}" rx="12" fill="${item.bgColor || '#ffffff'}"/>
          <text x="${item.x + 12}" y="${item.y + 20}" font-size="11" font-weight="700" font-family="sans-serif" fill="${item.color || '#1e1b4b'}">${esc(item.content || 'Performance Metrics')}</text>
          ${bars}
        </g>`;
      }

      if (item.type === 'shape' || item.type === 'badge') {
        const kind = item.shapeKind || 'rect';
        if (kind === 'line' || kind === 'dashed-line') {
          return `<line x1="${item.x}" y1="${cy}" x2="${item.x + w}" y2="${cy}" stroke="${item.bgColor || '#7d2ae8'}" stroke-width="${Math.max(2, h)}" ${kind === 'dashed-line' ? 'stroke-dasharray="10 6"' : ''} opacity="${opacity}"${transform}/>`;
        }
        let shapeFill = item.bgColor || '#7d2ae8';
        if (item.bgGradient) {
          const gMatches = item.bgGradient.match(/#[0-9a-fA-F]{3,8}/g);
          if (gMatches && gMatches.length >= 2) {
            const gid = `item-grad-${item.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
            defs.push(
              `<linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${gMatches[0]}"/><stop offset="100%" stop-color="${gMatches[gMatches.length - 1]}"/></linearGradient>`
            );
            shapeFill = `url(#${gid})`;
          }
        }
        if (['triangle', 'star', 'hexagon', 'diamond', 'arrow', 'bubble'].includes(kind)) {
          const d = getShapeSvgPath(kind, w, h);
          return `<g opacity="${opacity}"${transform}>
            <g transform="translate(${item.x} ${item.y})">
              <path d="${d}" fill="${shapeFill}" ${item.borderColor ? `stroke="${item.borderColor}" stroke-width="${item.borderWidth || 1}"` : ''}/>
            </g>
            ${item.content ? `<text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="${item.color}" font-size="${item.fontSize || 13}" font-weight="${item.fontWeight || 'bold'}" font-family="sans-serif">${esc(item.content)}</text>` : ''}
          </g>`;
        }
        const rx = item.borderRadius !== undefined ? item.borderRadius : kind === 'circle' || kind === 'pill' ? 9999 : 12;
        return `<g opacity="${opacity}"${transform}>
          <rect x="${item.x}" y="${item.y}" width="${w}" height="${h}" rx="${rx}" fill="${shapeFill}" ${item.borderColor ? `stroke="${item.borderColor}" stroke-width="${item.borderWidth || 1}"` : ''}/>
          ${item.content ? `<text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="${item.color}" font-size="${item.fontSize || 13}" font-weight="${item.fontWeight || 'bold'}" font-family="sans-serif">${esc(item.content)}</text>` : ''}
        </g>`;
      }

      if (item.type === 'sticker') {
        return `<text x="${cx}" y="${cy + (item.fontSize || 48) * 0.35}" text-anchor="middle" font-size="${item.fontSize || 48}" opacity="${opacity}"${transform}>${esc(item.content)}</text>`;
      }

      if (item.type === 'image' && item.imageUrl) {
        const clipId = `clip-${item.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
        const rad = item.magicCutout ? 9999 : item.borderRadius || 0;
        defs.push(`<clipPath id="${clipId}"><rect x="${item.x}" y="${item.y}" width="${w}" height="${h}" rx="${rad}"/></clipPath>`);
        const crop = item.imageCrop;
        const cScale = crop?.scale ?? 1;
        const dw = w * cScale;
        const dh = h * cScale;
        const dx = item.x + (w - dw) / 2 + ((crop?.offsetX ?? 0) / 100) * w;
        const dy = item.y + (h - dh) / 2 + ((crop?.offsetY ?? 0) / 100) * h;
        return `<image href="${esc(item.imageUrl)}" x="${dx.toFixed(1)}" y="${dy.toFixed(1)}" width="${dw.toFixed(1)}" height="${dh.toFixed(1)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" opacity="${opacity}"${transform}/>`;
      }

      const fs = item.fontSize || 24;
      const anchor = item.textAlign === 'left' ? 'start' : item.textAlign === 'right' ? 'end' : 'middle';
      const tx = anchor === 'middle' ? cx : anchor === 'end' ? item.x + w : item.x;
      const lines = formatDisplayText(item).split('\n');
      const lh = fs * (item.lineHeight || 1.2);
      const curve = item.textCurve || 0;
      if (Math.abs(curve) >= 5) {
        const arcId = `curve-${item.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
        const bend = -(curve / 100) * Math.min(w * 0.45, 90);
        const startY = item.y + fs * 1.4;
        defs.push(`<path id="${arcId}" d="M ${item.x} ${startY} Q ${cx} ${startY + bend} ${item.x + w} ${startY}" fill="none"/>`);
        return `<text fill="${item.color}" font-size="${fs}" font-weight="${item.fontWeight || '600'}" font-style="${item.fontStyle || 'normal'}" font-family="sans-serif" opacity="${opacity}"${transform}><textPath href="#${arcId}" startOffset="50%" text-anchor="middle">${esc(lines.join(' '))}</textPath></text>`;
      }
      const bgRect =
        item.textEffect === 'background'
          ? `<rect x="${item.x - 6}" y="${item.y - 4}" width="${w + 12}" height="${lines.length * lh + 10}" rx="8" fill="${item.bgColor || '#f5f3ff'}" opacity="${opacity}"${transform}/>`
          : '';
      const tspans = lines
        .map((ln, idx) => `<tspan x="${tx}" dy="${idx === 0 ? 0 : lh}">${esc(ln)}</tspan>`)
        .join('');
      const deco = item.textDecoration && item.textDecoration !== 'none' ? ` text-decoration="${item.textDecoration}"` : '';
      return `${bgRect}<text x="${tx}" y="${item.y + fs}" text-anchor="${anchor}" fill="${item.color}" font-size="${fs}" font-weight="${item.fontWeight || '600'}" font-style="${item.fontStyle || 'normal'}" font-family="sans-serif"${deco} opacity="${opacity}"${transform}>${tspans}</text>`;
    })
    .join('\n  ');

  const strokesSvg = page.strokes
    .filter((s) => s.points.length >= 2)
    .map((s) => {
      const d = s.points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round" opacity="${s.opacity}"/>`;
    })
    .join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${baseWidth} ${baseHeight}">
  ${defs.length ? `<defs>${defs.join('\n  ')}</defs>` : ''}
  ${!transparentBg ? `<rect width="${baseWidth}" height="${baseHeight}" fill="${bgFill}"/>` : ''}
  ${elementsSvg}
  ${strokesSvg}
</svg>`;
}

// Pure JS Multi-Page PDF 1.4 generator wrapping JPEG-encoded rendered canvases
export function buildPdfFromJpegCanvases(canvases: HTMLCanvasElement[]): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0]; // 1-indexed objects
  let cursor = 0;

  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    cursor += b.length;
  };
  const pushText = (s: string) => pushBytes(encoder.encode(s));

  pushText('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  const pageCount = canvases.length;
  const totalObjs = 2 + pageCount * 3;
  for (let i = 1; i <= totalObjs; i++) offsets[i] = 0;

  const pageKidsRefs = canvases.map((_, idx) => `${3 + idx * 3} 0 R`).join(' ');

  // Obj 1: Catalog
  offsets[1] = cursor;
  pushText('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Obj 2: Pages
  offsets[2] = cursor;
  pushText(`2 0 obj\n<< /Type /Pages /Kids [${pageKidsRefs}] /Count ${pageCount} >>\nendobj\n`);

  canvases.forEach((canvas, idx) => {
    const pageObj = 3 + idx * 3;
    const contentObj = pageObj + 1;
    const imgObj = pageObj + 2;

    const wPt = Math.round((canvas.width * 72) / 96);
    const hPt = Math.round((canvas.height * 72) / 96);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const base64 = dataUrl.split(',')[1];
    const binStr = atob(base64);
    const imgBytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) imgBytes[i] = binStr.charCodeAt(i);

    const contentStream = `q\n${wPt} 0 0 ${hPt} 0 0 cm\n/Im0 Do\nQ\n`;

    // Page Obj
    offsets[pageObj] = cursor;
    pushText(
      `${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt} ${hPt}] /Resources << /XObject << /Im0 ${imgObj} 0 R >> >> /Contents ${contentObj} 0 R >>\nendobj\n`
    );

    // Content Obj
    offsets[contentObj] = cursor;
    pushText(`${contentObj} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

    // Image XObject
    offsets[imgObj] = cursor;
    pushText(
      `${imgObj} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`
    );
    pushBytes(imgBytes);
    pushText('\nendstream\nendobj\n');
  });

  const xrefStart = cursor;
  pushText(`xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i <= totalObjs; i++) {
    pushText(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  const blobParts: BlobPart[] = chunks.map((c) => new Uint8Array(c));
  return new Blob(blobParts, { type: 'application/pdf' });
}
