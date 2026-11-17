import React from 'react';
import QRCode from 'qrcode';
import { CanvasItem, ChartDatum } from './types';

// Real ISO/IEC 18004 Reed-Solomon scannable QR matrix generator
export function buildQrMatrix(value: string): number[][] {
  const payload = (value || 'https://canva.com').trim() || 'https://canva.com';
  try {
    const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const grid: number[][] = [];
    for (let r = 0; r < size; r++) {
      const row: number[] = [];
      for (let c = 0; c < size; c++) {
        row.push(data[r * size + c] ? 1 : 0);
      }
      grid.push(row);
    }
    return grid;
  } catch {
    return [[1]];
  }
}

export const DEFAULT_CHART_DATA: ChartDatum[] = [
  { label: 'Q1', value: 42, color: '#7d2ae8' },
  { label: 'Q2', value: 68, color: '#00c4cc' },
  { label: 'Q3', value: 55, color: '#ec4899' },
  { label: 'Q4', value: 92, color: '#f97316' },
];

export const QrAndChartRenderer: React.FC<{ item: CanvasItem }> = ({ item }) => {
  if (item.type === 'qrcode') {
    const matrix = buildQrMatrix(item.qrValue || item.content || 'https://canva.com');
    const size = matrix.length;
    return (
      <div
        className="w-full h-full p-2.5 flex flex-col items-center justify-center rounded-xl shadow-xs"
        style={{ backgroundColor: item.bgColor || '#ffffff' }}
      >
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          {matrix.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect
                  key={`${r}-${c}`}
                  x={c}
                  y={r}
                  width={1.02}
                  height={1.02}
                  fill={item.color || '#1e1b4b'}
                />
              ) : null
            )
          )}
        </svg>
      </div>
    );
  }

  // Chart widget (Bar or Donut)
  const data = item.chartData && item.chartData.length > 0 ? item.chartData : DEFAULT_CHART_DATA;
  const maxVal = Math.max(1, ...data.map((d) => d.value));

  if (item.chartKind === 'donut') {
    const total = Math.max(1, data.reduce((acc, d) => acc + d.value, 0));
    let cumulative = 0;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;

    return (
      <div
        className="w-full h-full p-3 rounded-xl flex items-center gap-3 border border-slate-200/40"
        style={{ backgroundColor: item.bgColor || '#ffffff', color: item.color || '#1e1b4b' }}
      >
        <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0 -rotate-90">
          {data.map((d, idx) => {
            const frac = d.value / total;
            const dash = frac * circumference;
            const offset = -cumulative * circumference;
            cumulative += frac;
            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        <div className="flex-1 space-y-1 text-[10px] font-semibold overflow-hidden">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.label}</span>
              </div>
              <span className="font-mono">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full p-3 rounded-xl flex flex-col justify-between border border-slate-200/40"
      style={{ backgroundColor: item.bgColor || '#ffffff', color: item.color || '#1e1b4b' }}
    >
      <div className="text-[11px] font-bold truncate">{item.content || 'Performance Metrics'}</div>
      <div className="flex-1 flex items-end gap-2 pt-2">
        {data.map((d, idx) => {
          const pct = Math.max(8, Math.round((d.value / maxVal) * 100));
          return (
            <div key={idx} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
              <span className="text-[9px] font-mono opacity-80">{d.value}</span>
              <div
                className="w-full rounded-t-md transition-all"
                style={{ height: `${pct}%`, backgroundColor: d.color }}
              />
              <span className="text-[9px] font-semibold truncate max-w-full">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
