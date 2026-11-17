export type CanvasItemType = 'text' | 'shape' | 'sticker' | 'image' | 'badge' | 'chart' | 'qrcode';

export type ShapeKind =
  | 'rect'
  | 'circle'
  | 'pill'
  | 'triangle'
  | 'star'
  | 'hexagon'
  | 'diamond'
  | 'arrow'
  | 'bubble'
  | 'line'
  | 'dashed-line';

export type TextEffectType = 'none' | 'shadow' | 'lift' | 'hollow' | 'neon' | 'glitch' | 'echo' | 'background';

export type AnimationType = 'none' | 'fade' | 'rise' | 'pop' | 'pan' | 'bounce' | 'pulse';

export interface ImageFilters {
  brightness: number; // 100 default
  contrast: number;   // 100 default
  saturate: number;   // 100 default
  blur: number;       // 0 default (px)
  grayscale: number;  // 0 default (%)
}

export interface ImageCrop {
  scale: number;   // 1..2.5
  offsetX: number; // -50..50 (%)
  offsetY: number; // -50..50 (%)
}

export interface ChartDatum {
  label: string;
  value: number;
  color: string;
}

export interface CanvasItem {
  id: string;
  type: CanvasItemType;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  groupId?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  textAlign?: 'left' | 'center' | 'right';
  listType?: 'none' | 'bullet' | 'numbered';
  lineHeight?: number;
  letterSpacing?: number;
  color: string;
  bgColor?: string;
  bgGradient?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  opacity?: number; // 0..1
  rotation?: number; // degrees
  flipX?: boolean;
  flipY?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
  shapeKind?: ShapeKind;
  textEffect?: TextEffectType;
  textCurve?: number; // -100..100
  animation?: AnimationType;
  imageUrl?: string;
  imageFilters?: ImageFilters;
  imageCrop?: ImageCrop;
  magicCutout?: boolean;
  chartKind?: 'bar' | 'donut';
  chartData?: ChartDatum[];
  qrValue?: string;
}

export interface DrawStroke {
  id: string;
  tool: 'pen' | 'marker' | 'highlighter';
  color: string;
  width: number;
  opacity: number;
  points: Array<{ x: number; y: number }>;
}

export interface CanvaPage {
  id: string;
  title?: string;
  backgroundColor: string;
  backgroundGradient?: string;
  items: CanvasItem[];
  strokes: DrawStroke[];
  notes: string;
}

export interface DocDimensions {
  width: number;  // Virtual export width (e.g., 1080)
  height: number; // Virtual export height (e.g., 1080)
  label: string;
}

export interface UploadedAsset {
  id: string;
  name: string;
  url: string;
  addedAt: string;
}

export interface CanvaHistorySnapshot {
  pages: CanvaPage[];
  activePageIndex: number;
  dimensions: DocDimensions;
}
