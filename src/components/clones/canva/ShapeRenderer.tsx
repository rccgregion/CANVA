import React from 'react';
import { CanvasItem, ShapeKind } from './types';

interface ShapeRendererProps {
  item: CanvasItem;
  isEditing?: boolean;
  onFinishEdit?: (newText: string) => void;
}

export const getShapeSvgPath = (kind: ShapeKind, w: number, h: number): string => {
  switch (kind) {
    case 'triangle':
      return `M ${w / 2} 4 L ${w - 4} ${h - 4} L 4 ${h - 4} Z`;
    case 'diamond':
      return `M ${w / 2} 4 L ${w - 4} ${h / 2} L ${w / 2} ${h - 4} L 4 ${h / 2} Z`;
    case 'hexagon':
      return `M ${w * 0.25} 4 L ${w * 0.75} 4 L ${w - 4} ${h / 2} L ${w * 0.75} ${h - 4} L ${w * 0.25} ${h - 4} L 4 ${h / 2} Z`;
    case 'star': {
      const cx = w / 2;
      const cy = h / 2;
      const outerR = Math.min(w, h) / 2 - 4;
      const innerR = outerR * 0.42;
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`;
    }
    case 'arrow':
      return `M 4 ${h * 0.3} L ${w * 0.62} ${h * 0.3} L ${w * 0.62} 6 L ${w - 4} ${h / 2} L ${w * 0.62} ${h - 6} L ${w * 0.62} ${h * 0.7} L 4 ${h * 0.7} Z`;
    case 'bubble':
      return `M 16 4 L ${w - 16} 4 Q ${w - 4} 4 ${w - 4} 16 L ${w - 4} ${h * 0.72} Q ${w - 4} ${h * 0.82} ${w - 16} ${h * 0.82} L ${w * 0.35} ${h * 0.82} L ${w * 0.18} ${h - 4} L ${w * 0.22} ${h * 0.82} L 16 ${h * 0.82} Q 4 ${h * 0.82} 4 ${h * 0.72} L 4 16 Q 4 4 16 4 Z`;
    default:
      return '';
  }
};

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({ item, isEditing, onFinishEdit }) => {
  const kind: ShapeKind = item.shapeKind || 'rect';
  const w = item.width || 140;
  const h = item.height || 100;

  if (kind === 'line' || kind === 'dashed-line') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          className="w-full"
          style={{
            height: 0,
            borderTopWidth: `${Math.max(2, item.height || 4)}px`,
            borderTopStyle: kind === 'dashed-line' ? 'dashed' : 'solid',
            borderTopColor: item.bgColor || '#7d2ae8',
          }}
        />
      </div>
    );
  }

  const isPolygon = ['triangle', 'star', 'hexagon', 'diamond', 'arrow', 'bubble'].includes(kind);

  if (isPolygon) {
    const d = getShapeSvgPath(kind, w, h);
    const gradMatches = item.bgGradient?.match(/#[0-9a-fA-F]{3,8}/g);
    const polyGradId = `poly-grad-${item.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const hasGrad = gradMatches && gradMatches.length >= 2;
    return (
      <div className="w-full h-full relative flex items-center justify-center">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
          {hasGrad && (
            <defs>
              <linearGradient id={polyGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradMatches[0]} />
                <stop offset="100%" stopColor={gradMatches[gradMatches.length - 1]} />
              </linearGradient>
            </defs>
          )}
          <path
            d={d}
            fill={hasGrad ? `url(#${polyGradId})` : item.bgColor || '#7d2ae8'}
            stroke={item.borderColor || 'none'}
            strokeWidth={item.borderWidth || 0}
            strokeDasharray={item.borderStyle === 'dashed' ? '6 4' : item.borderStyle === 'dotted' ? '2 4' : undefined}
          />
        </svg>
        {(item.content || isEditing) && (
          <div className="absolute inset-0 flex items-center justify-center p-3">
            {isEditing ? (
              <div
                contentEditable
                suppressContentEditableWarning
                autoFocus
                onMouseDown={(e) => e.stopPropagation()}
                onBlur={(e) => onFinishEdit?.(e.currentTarget.textContent || '')}
                className="outline-none text-center w-full break-words"
                style={{
                  color: item.color || '#ffffff',
                  fontSize: item.fontSize || 14,
                  fontWeight: item.fontWeight || 'bold',
                }}
              >
                {item.content}
              </div>
            ) : (
              <span
                className="text-center break-words leading-tight"
                style={{
                  color: item.color || '#ffffff',
                  fontSize: item.fontSize || 14,
                  fontWeight: item.fontWeight || 'bold',
                }}
              >
                {item.content}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Standard rect / circle / pill / badge
  return (
    <div
      className="w-full h-full flex items-center justify-center px-3 overflow-hidden"
      style={{
        background: item.bgGradient || item.bgColor || '#7d2ae8',
        borderColor: item.borderColor,
        borderWidth: item.borderWidth ? `${item.borderWidth}px` : undefined,
        borderStyle: item.borderStyle || 'solid',
        borderRadius: item.borderRadius !== undefined ? `${item.borderRadius}px` : kind === 'circle' || kind === 'pill' ? '9999px' : '12px',
      }}
    >
      {isEditing ? (
        <div
          contentEditable
          suppressContentEditableWarning
          autoFocus
          onMouseDown={(e) => e.stopPropagation()}
          onBlur={(e) => onFinishEdit?.(e.currentTarget.textContent || '')}
          className="outline-none text-center w-full break-words"
          style={{
            color: item.color || '#ffffff',
            fontSize: item.fontSize || 14,
            fontFamily: item.fontFamily,
            fontWeight: item.fontWeight || 'bold',
            letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : undefined,
          }}
        >
          {item.content}
        </div>
      ) : (
        <span
          className="text-center break-words leading-tight"
          style={{
            color: item.color || '#ffffff',
            fontSize: item.fontSize || 14,
            fontFamily: item.fontFamily,
            fontWeight: item.fontWeight || 'bold',
            letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : undefined,
          }}
        >
          {item.content}
        </span>
      )}
    </div>
  );
};
