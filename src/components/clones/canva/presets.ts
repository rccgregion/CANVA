import { CanvaPage, DocDimensions, ShapeKind, CanvasItem } from './types';

export const RESIZE_PRESETS: Array<DocDimensions & { category: string }> = [
  { width: 1080, height: 1080, label: 'Instagram Post (Square)', category: 'Social' },
  { width: 1080, height: 1920, label: 'Instagram Story / Reel', category: 'Social' },
  { width: 1280, height: 720, label: 'YouTube Thumbnail', category: 'Video' },
  { width: 1920, height: 1080, label: 'Presentation (16:9)', category: 'Business' },
  { width: 794, height: 1123, label: 'A4 Poster / Flyer', category: 'Print' },
  { width: 1584, height: 396, label: 'LinkedIn Cover Banner', category: 'Business' },
];

export const INITIAL_PAGES: CanvaPage[] = [
  {
    id: 'page-1',
    title: 'Main Promo Slide',
    backgroundColor: '#ffffff',
    strokes: [],
    notes: 'Remember to highlight the 50% discount code CANVA2026 in the caption.',
    items: [
      {
        id: 'item-tag',
        type: 'badge',
        content: 'LIMITED TIME OFFER',
        x: 180,
        y: 56,
        width: 180,
        height: 32,
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 2,
        color: '#ffffff',
        bgColor: '#7d2ae8',
        borderRadius: 9999,
        textAlign: 'center',
      },
      {
        id: 'item-heading',
        type: 'text',
        content: 'SUMMER MEGA SALE',
        x: 60,
        y: 106,
        width: 420,
        fontSize: 42,
        fontFamily: 'Outfit, sans-serif',
        fontWeight: '800',
        color: '#1e1b4b',
        textAlign: 'center',
        letterSpacing: -1,
      },
      {
        id: 'item-subheading',
        type: 'text',
        content: 'UP TO 50% OFF ALL COLLECTIONS',
        x: 90,
        y: 172,
        width: 360,
        fontSize: 16,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontWeight: '600',
        color: '#7d2ae8',
        textAlign: 'center',
        letterSpacing: 1,
      },
      {
        id: 'item-card',
        type: 'shape',
        shapeKind: 'rect',
        content: '',
        x: 80,
        y: 220,
        width: 380,
        height: 185,
        bgColor: '#f5f3ff',
        borderColor: '#ddd6fe',
        borderWidth: 2,
        borderRadius: 20,
        color: '#1e1b4b',
      },
      {
        id: 'item-card-text',
        type: 'text',
        content: 'Use Coupon Code: CANVA2026',
        x: 115,
        y: 248,
        width: 310,
        fontSize: 15,
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: '700',
        color: '#6b21a8',
        textAlign: 'center',
      },
      {
        id: 'item-card-desc',
        type: 'text',
        content: 'Valid in store and online on all new arrivals until Sunday midnight.',
        x: 110,
        y: 282,
        width: 320,
        fontSize: 12,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        color: '#64748b',
        textAlign: 'center',
      },
      {
        id: 'item-cta-btn',
        type: 'badge',
        content: 'CLAIM DISCOUNT NOW →',
        x: 160,
        y: 335,
        width: 220,
        height: 44,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#ffffff',
        bgColor: '#00c4cc',
        borderRadius: 12,
        textAlign: 'center',
      },
      {
        id: 'item-sticker-1',
        type: 'sticker',
        content: '🔥',
        x: 445,
        y: 86,
        fontSize: 48,
        color: '#f97316',
      },
      {
        id: 'item-sticker-2',
        type: 'sticker',
        content: '✨',
        x: 46,
        y: 92,
        fontSize: 38,
        color: '#fbbf24',
      },
    ],
  },
  {
    id: 'page-2',
    title: 'Thank You Slide',
    backgroundColor: '#f8fafc',
    strokes: [],
    notes: 'Call to action slide for carousel post.',
    items: [
      {
        id: 'p2-heading',
        type: 'text',
        content: 'THANK YOU FOR SHOPPING WITH US',
        x: 60,
        y: 160,
        width: 420,
        fontSize: 32,
        fontFamily: 'Outfit, sans-serif',
        fontWeight: '800',
        color: '#1e1b4b',
        textAlign: 'center',
      },
      {
        id: 'p2-subheading',
        type: 'text',
        content: 'Follow @canva for weekly inspiration and free templates',
        x: 80,
        y: 235,
        width: 380,
        fontSize: 15,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontWeight: '500',
        color: '#7d2ae8',
        textAlign: 'center',
      },
      {
        id: 'p2-sticker',
        type: 'sticker',
        content: '🎉',
        x: 235,
        y: 295,
        fontSize: 64,
        color: '#ffffff',
      },
    ],
  },
];

export type TemplateCategory = 'Summer Sale' | 'Tech' | 'Music' | 'Quote' | 'Minimal' | 'Business';

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Summer Sale',
  'Tech',
  'Music',
  'Quote',
  'Minimal',
  'Business',
];

export interface CanvaTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  formatTag?: string;
  previewBg: string;
  previewBadge: string;
  previewHeadline: string;
  previewDarkText?: boolean;
  previewImageUrl?: string;
  sourceProvider?: 'canva' | 'pinterest';
  sourcePinUrl?: string;
  sourceAuthor?: string;
  canvasBg: string;
  canvasGradient?: string;
  items: CanvasItem[];
}

export const TEMPLATES_CATALOG: CanvaTemplate[] = [
  {
    id: 'tpl-summer',
    title: 'Summer Mega Sale',
    category: 'Summer Sale',
    formatTag: 'Instagram Post',
    previewBg: 'from-amber-400 via-orange-500 to-rose-600',
    previewBadge: 'HOT SALE',
    previewHeadline: 'SUMMER 50% OFF',
    canvasBg: '#ffffff',
    items: [
      { id: 't1-tag', type: 'badge', content: 'HOT DEAL', x: 200, y: 70, width: 140, height: 32, fontSize: 11, fontWeight: 'bold', color: '#fff', bgColor: '#f97316', borderRadius: 9999, textAlign: 'center' },
      { id: 't1-h', type: 'text', content: 'SUMMER SALE', x: 70, y: 120, width: 400, fontSize: 44, fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: '#0f172a', textAlign: 'center' },
      { id: 't1-sub', type: 'text', content: 'Up to 50% Off Everything', x: 110, y: 185, width: 320, fontSize: 18, color: '#64748b', fontWeight: '600', textAlign: 'center' },
      { id: 't1-btn', type: 'badge', content: 'SHOP ONLINE NOW', x: 170, y: 260, width: 200, height: 46, fontSize: 14, fontWeight: 'bold', color: '#fff', bgColor: '#7d2ae8', borderRadius: 12, textAlign: 'center' },
      { id: 't1-s', type: 'sticker', content: '🔥', x: 420, y: 100, fontSize: 50, color: '#f97316' },
    ],
  },
  {
    id: 'tpl-flash-drop',
    title: 'Weekend Flash Drop',
    category: 'Summer Sale',
    formatTag: 'Story & Promo',
    previewBg: 'from-rose-500 via-pink-500 to-amber-400',
    previewBadge: '48H ONLY',
    previewHeadline: 'FLASH DROP',
    canvasBg: '#fff1f2',
    canvasGradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 55%, #fef3c7 100%)',
    items: [
      { id: 't7-card', type: 'shape', shapeKind: 'rect', content: '', x: 60, y: 65, width: 420, height: 410, bgColor: '#ffffff', borderColor: '#fecdd3', borderWidth: 2, borderRadius: 28, color: '#881337' },
      { id: 't7-tag', type: 'badge', content: '48 HOURS ONLY', x: 185, y: 98, width: 170, height: 30, fontSize: 11, fontWeight: 'bold', color: '#ffffff', bgColor: '#e11d48', borderRadius: 9999, textAlign: 'center' },
      { id: 't7-h', type: 'text', content: 'WEEKEND FLASH DROP', x: 90, y: 150, width: 360, fontSize: 40, fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: '#881337', textAlign: 'center' },
      { id: 't7-sub', type: 'text', content: 'Extra 30% Off With Code FLASH30', x: 110, y: 265, width: 320, fontSize: 15, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '600', color: '#be123c', textAlign: 'center' },
      { id: 't7-btn', type: 'badge', content: 'UNLOCK OFFER →', x: 170, y: 340, width: 200, height: 46, fontSize: 13, fontWeight: 'bold', color: '#ffffff', bgColor: '#1e1b4b', borderRadius: 12, textAlign: 'center' },
    ],
  },
  {
    id: 'tpl-tech',
    title: 'Tech Summit 2026',
    category: 'Tech',
    formatTag: 'Keynote Banner',
    previewBg: 'from-slate-900 via-cyan-950 to-blue-900',
    previewBadge: 'TECH SUMMIT',
    previewHeadline: 'AI DEV 2026',
    canvasBg: '#090a16',
    canvasGradient: 'linear-gradient(135deg, #090a16 0%, #0f172a 55%, #1e1b4b 100%)',
    items: [
      { id: 't2-tag', type: 'badge', content: 'VIRTUAL CONFERENCE', x: 160, y: 80, width: 220, height: 30, fontSize: 10, fontWeight: 'bold', color: '#38bdf8', bgColor: '#082f49', borderRadius: 9999, textAlign: 'center' },
      { id: 't2-h', type: 'text', content: 'TECH SUMMIT 2026', x: 50, y: 130, width: 440, fontSize: 38, fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: '#ffffff', textAlign: 'center', textEffect: 'neon' },
      { id: 't2-sub', type: 'text', content: 'The Next Generation of AI & Agents', x: 90, y: 195, width: 360, fontSize: 16, color: '#94a3b8', fontWeight: '600', textAlign: 'center' },
      { id: 't2-btn', type: 'badge', content: 'REGISTER FREE', x: 170, y: 270, width: 200, height: 46, fontSize: 14, fontWeight: 'bold', color: '#fff', bgColor: '#0284c7', borderRadius: 12, textAlign: 'center' },
      { id: 't2-s', type: 'sticker', content: '⚡', x: 440, y: 110, fontSize: 44, color: '#38bdf8' },
    ],
  },
  {
    id: 'tpl-saas-launch',
    title: 'SaaS Product Launch',
    category: 'Tech',
    formatTag: 'Feature Card',
    previewBg: 'from-cyan-600 via-teal-600 to-emerald-700',
    previewBadge: 'RELEASE 2.0',
    previewHeadline: 'SHIP FASTER',
    canvasBg: '#042f2e',
    canvasGradient: 'linear-gradient(135deg, #0f172a 0%, #064e3b 65%, #0f766e 100%)',
    items: [
      { id: 't8-tag', type: 'badge', content: 'VERSION 2.0 LIVE', x: 56, y: 68, width: 155, height: 28, fontSize: 10, fontWeight: 'bold', color: '#5eead4', bgColor: '#134e4a', borderRadius: 8, textAlign: 'center' },
      { id: 't8-h', type: 'text', content: 'BUILD AT 10X VELOCITY', x: 56, y: 118, width: 420, fontSize: 38, fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: '#ffffff', textAlign: 'left' },
      { id: 't8-sub', type: 'text', content: 'Automated workflows, zero-latency collaboration, and real-time analytics.', x: 56, y: 215, width: 420, fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#99f6e4', textAlign: 'left' },
      { id: 't8-btn', type: 'badge', content: 'START FREE TRIAL', x: 56, y: 310, width: 195, height: 44, fontSize: 13, fontWeight: 'bold', color: '#042f2e', bgColor: '#2dd4bf', borderRadius: 12, textAlign: 'center' },
      { id: 't8-s', type: 'sticker', content: '🚀', x: 410, y: 295, fontSize: 56, color: '#5eead4' },
    ],
  },
  {
    id: 'tpl-podcast',
    title: 'Podcast Release',
    category: 'Music',
    formatTag: 'Audio Cover',
    previewBg: 'from-purple-900 via-fuchsia-950 to-emerald-950',
    previewBadge: 'PODCAST',
    previewHeadline: 'EPISODE #42',
    canvasBg: '#18181b',
    canvasGradient: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, #09090b 100%)',
    items: [
      { id: 't3-tag', type: 'badge', content: 'NEW EPISODE', x: 200, y: 80, width: 140, height: 30, fontSize: 11, fontWeight: 'bold', color: '#fff', bgColor: '#10b981', borderRadius: 9999, textAlign: 'center' },
      { id: 't3-h', type: 'text', content: 'THE CREATIVE MIND', x: 60, y: 130, width: 420, fontSize: 36, fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: '#ffffff', textAlign: 'center' },
      { id: 't3-s', type: 'sticker', content: '🎙️', x: 235, y: 205, fontSize: 60, color: '#fff' },
      { id: 't3-sub', type: 'text', content: 'Streaming on Spotify & Apple Podcasts', x: 90, y: 310, width: 360, fontSize: 14, color: '#94a3b8', fontWeight: '600', textAlign: 'center' },
    ],
  },
  {
    id: 'tpl-vinyl-tour',
    title: 'Indie Vinyl Tour',
    category: 'Music',
    formatTag: 'Concert Flyer',
    previewBg: 'from-amber-600 via-orange-700 to-stone-900',
    previewBadge: 'LIVE TOUR',
    previewHeadline: 'MIDNIGHT SESSIONS',
    canvasBg: '#1c1917',
    canvasGradient: 'linear-gradient(135deg, #292524 0%, #7c2d12 55%, #1c1917 100%)',
    items: [
      { id: 't9-circle', type: 'shape', shapeKind: 'circle', content: '', x: 145, y: 70, width: 250, height: 250, bgColor: '#f59e0b', borderColor: '#fef3c7', borderWidth: 3, borderRadius: 9999, color: '#1c1917' },
      { id: 't9-s', type: 'sticker', content: '🎵', x: 238, y: 148, fontSize: 62, color: '#1c1917' },
      { id: 't9-h', type: 'text', content: 'MIDNIGHT TOUR', x: 60, y: 345, width: 420, fontSize: 36, fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: '#fef3c7', textAlign: 'center' },
      { id: 't9-sub', type: 'text', content: 'LONDON · BERLIN · TOKYO · NYC', x: 80, y: 405, width: 380, fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: '700', color: '#fbbf24', textAlign: 'center', letterSpacing: 2 },
    ],
  },
  {
    id: 'tpl-quote',
    title: 'Inspirational Quote',
    category: 'Quote',
    formatTag: 'Editorial Serif',
    previewBg: 'from-stone-200 via-amber-100 to-stone-300',
    previewBadge: 'QUOTE',
    previewHeadline: '"Make it visible"',
    previewDarkText: true,
    canvasBg: '#fafaf9',
    items: [
      { id: 't4-s', type: 'sticker', content: '✨', x: 245, y: 90, fontSize: 44, color: '#fbbf24' },
      { id: 't4-h', type: 'text', content: '"Design is intelligence made visible."', x: 60, y: 170, width: 420, fontSize: 32, fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: '700', color: '#1c1917', textAlign: 'center' },
      { id: 't4-line', type: 'shape', shapeKind: 'line', content: '', x: 210, y: 280, width: 120, height: 4, bgColor: '#d97706', color: '#d97706' },
      { id: 't4-sub', type: 'text', content: '— Alina Wheeler', x: 170, y: 300, width: 200, fontSize: 16, color: '#78716c', fontWeight: '600', textAlign: 'center' },
    ],
  },
  {
    id: 'tpl-bold-manifesto',
    title: 'Bold Manifesto',
    category: 'Quote',
    formatTag: 'Typography Post',
    previewBg: 'from-violet-600 via-purple-600 to-indigo-700',
    previewBadge: 'STATEMENT',
    previewHeadline: 'CREATE DAILY',
    canvasBg: '#4c1d95',
    canvasGradient: 'linear-gradient(135deg, #5b21b6 0%, #312e81 100%)',
    items: [
      { id: 't10-tag', type: 'text', content: 'DAILY REMINDER', x: 80, y: 90, width: 380, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: '700', letterSpacing: 4, color: '#ddd6fe', textAlign: 'center' },
      { id: 't10-h', type: 'text', content: 'MAKE THINGS PEOPLE ACTUALLY LOVE.', x: 60, y: 155, width: 420, fontSize: 40, fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: '#ffffff', textAlign: 'center' },
      { id: 't10-btn', type: 'badge', content: '@STUDIO.NOTE', x: 195, y: 365, width: 150, height: 34, fontSize: 11, fontWeight: 'bold', color: '#4c1d95', bgColor: '#e9d5ff', borderRadius: 9999, textAlign: 'center' },
    ],
  },
  {
    id: 'tpl-minimal',
    title: 'Minimal Product Launch',
    category: 'Minimal',
    formatTag: 'Lookbook Card',
    previewBg: 'from-zinc-100 via-slate-200 to-zinc-300',
    previewBadge: 'NEW ARRIVAL',
    previewHeadline: 'PURE STUDIO',
    previewDarkText: true,
    canvasBg: '#f4f4f5',
    items: [
      { id: 't5-box', type: 'shape', shapeKind: 'rect', content: '', x: 70, y: 70, width: 400, height: 400, bgColor: '#ffffff', borderColor: '#e4e4e7', borderWidth: 1, borderRadius: 24, color: '#18181b' },
      { id: 't5-tag', type: 'text', content: 'COLLECTION 2026', x: 120, y: 110, width: 300, fontSize: 11, letterSpacing: 4, fontWeight: '700', color: '#71717a', textAlign: 'center' },
      { id: 't5-h', type: 'text', content: 'LESS IS MORE.', x: 90, y: 195, width: 360, fontSize: 44, fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: '#18181b', textAlign: 'center' },
      { id: 't5-btn', type: 'badge', content: 'EXPLORE LOOKBOOK', x: 170, y: 315, width: 200, height: 42, fontSize: 12, fontWeight: '700', color: '#ffffff', bgColor: '#18181b', borderRadius: 9999, textAlign: 'center' },
    ],
  },
  {
    id: 'tpl-skincare',
    title: 'Atelier Botanical',
    category: 'Minimal',
    formatTag: 'Editorial Ad',
    previewBg: 'from-emerald-100 via-teal-50 to-stone-200',
    previewBadge: 'BOTANICAL',
    previewHeadline: 'PURE SKIN',
    previewDarkText: true,
    canvasBg: '#ecfdf5',
    canvasGradient: 'linear-gradient(135deg, #ecfdf5 0%, #f5f5f4 100%)',
    items: [
      { id: 't11-frame', type: 'shape', shapeKind: 'rect', content: '', x: 85, y: 75, width: 370, height: 390, bgColor: '#ffffff', borderColor: '#a7f3d0', borderWidth: 1.5, borderRadius: 180, color: '#064e3b' },
      { id: 't11-sub', type: 'text', content: 'ORGANIC FORMULATION', x: 120, y: 135, width: 300, fontSize: 11, fontWeight: '700', letterSpacing: 3, color: '#059669', textAlign: 'center' },
      { id: 't11-h', type: 'text', content: 'Atelier Glow', x: 110, y: 200, width: 320, fontSize: 42, fontFamily: 'Playfair Display, serif', fontWeight: '700', color: '#064e3b', textAlign: 'center' },
      { id: 't11-body', type: 'text', content: 'Cold-pressed botanical serum for daily radiance.', x: 135, y: 275, width: 270, fontSize: 13, color: '#475569', textAlign: 'center' },
      { id: 't11-btn', type: 'badge', content: 'SHOP SERUM', x: 185, y: 345, width: 170, height: 40, fontSize: 12, fontWeight: 'bold', color: '#ffffff', bgColor: '#059669', borderRadius: 9999, textAlign: 'center' },
    ],
  },
  {
    id: 'tpl-business',
    title: 'Quarterly Growth Pitch',
    category: 'Business',
    formatTag: 'Investor Slide',
    previewBg: 'from-indigo-700 via-violet-700 to-purple-800',
    previewBadge: 'PITCH DECK',
    previewHeadline: '+240% Q4',
    canvasBg: '#1e1b4b',
    canvasGradient: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
    items: [
      { id: 't6-tag', type: 'badge', content: 'Q4 METRICS', x: 50, y: 55, width: 130, height: 28, fontSize: 10, fontWeight: 'bold', color: '#c4b5fd', bgColor: '#3b0764', borderRadius: 8, textAlign: 'center' },
      { id: 't6-h', type: 'text', content: 'ANNUAL REVENUE GROWTH', x: 50, y: 110, width: 440, fontSize: 30, fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: '#ffffff', textAlign: 'left' },
      { id: 't6-stat', type: 'shape', shapeKind: 'rect', content: '+240%', x: 50, y: 205, width: 200, height: 150, bgColor: '#7d2ae8', borderRadius: 20, color: '#ffffff', fontSize: 42, fontWeight: '800', textAlign: 'center' },
      { id: 't6-stat2', type: 'shape', shapeKind: 'rect', content: '50K Users', x: 270, y: 205, width: 220, height: 150, bgColor: '#00c4cc', borderRadius: 20, color: '#0f172a', fontSize: 32, fontWeight: '800', textAlign: 'center' },
      { id: 't6-foot', type: 'text', content: 'Confidential Investor Update · 2026', x: 50, y: 420, width: 440, fontSize: 12, color: '#c4b5fd', textAlign: 'left' },
    ],
  },
  {
    id: 'tpl-event-invite',
    title: 'Executive Summit Invite',
    category: 'Business',
    formatTag: 'Event Card',
    previewBg: 'from-slate-800 via-slate-900 to-zinc-950',
    previewBadge: 'INVITATION',
    previewHeadline: 'DESIGN LEADERS',
    canvasBg: '#f8fafc',
    items: [
      { id: 't12-header', type: 'shape', shapeKind: 'rect', content: '', x: 40, y: 40, width: 460, height: 165, bgColor: '#0f172a', borderRadius: 20, color: '#ffffff' },
      { id: 't12-tag', type: 'badge', content: 'EXCLUSIVE INVITE', x: 185, y: 65, width: 170, height: 26, fontSize: 10, fontWeight: 'bold', color: '#0f172a', bgColor: '#38bdf8', borderRadius: 9999, textAlign: 'center' },
      { id: 't12-h', type: 'text', content: 'DESIGN LEADERS FORUM', x: 60, y: 112, width: 420, fontSize: 30, fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: '#ffffff', textAlign: 'center' },
      { id: 't12-sub', type: 'text', content: 'Thursday, November 19 · 6:00 PM PST · San Francisco', x: 70, y: 245, width: 400, fontSize: 15, fontWeight: '600', color: '#334155', textAlign: 'center' },
      { id: 't12-desc', type: 'text', content: 'Join product directors and founders for keynote demos and private networking.', x: 85, y: 300, width: 370, fontSize: 13, color: '#64748b', textAlign: 'center' },
      { id: 't12-btn', type: 'badge', content: 'RSVP YOUR SEAT', x: 175, y: 385, width: 190, height: 44, fontSize: 13, fontWeight: 'bold', color: '#ffffff', bgColor: '#7d2ae8', borderRadius: 12, textAlign: 'center' },
    ],
  },
];

export const SHAPE_CATALOG: Array<{ kind: ShapeKind; label: string }> = [
  { kind: 'rect', label: 'Square / Box' },
  { kind: 'circle', label: 'Circle' },
  { kind: 'pill', label: 'Pill Button' },
  { kind: 'triangle', label: 'Triangle' },
  { kind: 'star', label: 'Star' },
  { kind: 'hexagon', label: 'Hexagon' },
  { kind: 'diamond', label: 'Diamond' },
  { kind: 'arrow', label: 'Right Arrow' },
  { kind: 'bubble', label: 'Speech Bubble' },
  { kind: 'line', label: 'Solid Line' },
  { kind: 'dashed-line', label: 'Dashed Line' },
];

export const FONT_PAIRINGS = [
  {
    id: 'pair-sale',
    name: 'Bold Promo',
    heading: 'FLASH SALE',
    sub: '24 HOURS ONLY — DON’T MISS OUT',
    headingFont: 'Outfit, sans-serif',
    subFont: 'Plus Jakarta Sans, sans-serif',
    headingColor: '#7d2ae8',
    subColor: '#1e1b4b',
  },
  {
    id: 'pair-editorial',
    name: 'Luxury Editorial',
    heading: 'Autumn Vogue',
    sub: 'THE NEW MINIMALIST WARDROBE',
    headingFont: 'Playfair Display, serif',
    subFont: 'Plus Jakarta Sans, sans-serif',
    headingColor: '#1c1917',
    subColor: '#78716c',
  },
  {
    id: 'pair-neon',
    name: 'Cyber Glow',
    heading: 'FUTURE NOW',
    sub: 'NEXT GEN CREATIVE STUDIO',
    headingFont: 'Outfit, sans-serif',
    subFont: 'JetBrains Mono, monospace',
    headingColor: '#ec4899',
    subColor: '#06b6d4',
  },
  {
    id: 'pair-retro',
    name: 'Sparkle Event',
    heading: 'Grand Opening',
    sub: 'JOIN US THIS FRIDAY AT 8 PM',
    headingFont: 'Playfair Display, serif',
    subFont: 'Outfit, sans-serif',
    headingColor: '#d97706',
    subColor: '#0f172a',
  },
];

export const BRAND_KITS = [
  {
    id: 'brand-canva',
    name: 'Canva Studio Official',
    colors: ['#7d2ae8', '#00c4cc', '#1e1b4b', '#f5f3ff', '#ffffff'],
    bgColor: '#ffffff',
    headingFont: 'Outfit, sans-serif',
  },
  {
    id: 'brand-cyber',
    name: 'Neon Cyberpunk',
    colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#090a16', '#ffffff'],
    bgColor: '#090a16',
    headingFont: 'JetBrains Mono, monospace',
  },
  {
    id: 'brand-earth',
    name: 'Warm Terracotta',
    colors: ['#c2410c', '#d97706', '#292524', '#fef3c7', '#fafaf9'],
    bgColor: '#fafaf9',
    headingFont: 'Playfair Display, serif',
  },
  {
    id: 'brand-emerald',
    name: 'Fintech Emerald',
    colors: ['#059669', '#10b981', '#064e3b', '#ecfdf5', '#ffffff'],
    bgColor: '#ecfdf5',
    headingFont: 'Plus Jakarta Sans, sans-serif',
  },
];

// Clean-room SVG data URI sample photos so Uploads gallery is crisp & always offline-ready
const makeSvgPhoto = (title: string, c1: string, c2: string, accent: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#g)"/>
      <circle cx="310" cy="80" r="55" fill="${accent}" opacity="0.5"/>
      <circle cx="110" cy="220" r="85" fill="#ffffff" opacity="0.14"/>
      <path d="M0 240 Q120 170 220 220 T400 190 L400 300 L0 300 Z" fill="#000000" opacity="0.22"/>
      <text x="24" y="272" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="18" opacity="0.85">${title}</text>
    </svg>`
  )}`;

export const SAMPLE_UPLOAD_PHOTOS = [
  { id: 'sample-1', name: 'Sunset Gradient', url: makeSvgPhoto('Sunset Horizon', '#f97316', '#ec4899', '#fde047') },
  { id: 'sample-2', name: 'Aurora Studio', url: makeSvgPhoto('Aurora Studio', '#7d2ae8', '#00c4cc', '#38bdf8') },
  { id: 'sample-3', name: 'Emerald Peaks', url: makeSvgPhoto('Emerald Peaks', '#059669', '#0f172a', '#34d399') },
  { id: 'sample-4', name: 'Midnight Synth', url: makeSvgPhoto('Midnight Synth', '#1e1b4b', '#be185d', '#f472b6') },
];

export const CANVAS_BG_GRADIENTS = [
  { label: 'Violet Glow', value: 'linear-gradient(135deg, #7d2ae8 0%, #00c4cc 100%)' },
  { label: 'Sunset Pop', value: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
  { label: 'Midnight', value: 'linear-gradient(135deg, #090a16 0%, #3b0764 100%)' },
  { label: 'Mint Breeze', value: 'linear-gradient(135deg, #d1fae5 0%, #dbeafe 100%)' },
  { label: 'Peach Cream', value: 'linear-gradient(135deg, #ffedd5 0%, #fce7f3 100%)' },
  { label: 'Oceanic', value: 'linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%)' },
];

export type SidebarDragPayload =
  | { kind: 'shape'; shapeKind: ShapeKind; label: string }
  | { kind: 'sticker'; emoji: string }
  | { kind: 'text'; textRole: 'heading' | 'subheading' | 'body'; label: string }
  | { kind: 'font_pairing'; pairId: string; label: string }
  | { kind: 'badge'; badge: { label: string; color: string; bg: string } }
  | { kind: 'chart'; chartKind: 'bar' | 'donut'; label: string }
  | { kind: 'qrcode'; url: string; label: string }
  | { kind: 'image'; url: string; name: string; borderRadius?: number; magicCutout?: boolean }
  | { kind: 'template'; templateId: string; title: string };

/**
 * Converts pointer drop coordinates in scaled screen space into clamped artboard coordinates
 * centering the inserted item on the cursor drop point.
 */
export const computeArtboardDropPosition = (
  artboardX: number,
  artboardY: number,
  itemWidth: number,
  itemHeight: number,
  artboardWidth: number,
  artboardHeight: number
): { x: number; y: number } => {
  const maxW = Math.max(0, artboardWidth - itemWidth);
  const maxH = Math.max(0, artboardHeight - itemHeight);
  return {
    x: Math.round(Math.max(0, Math.min(maxW, artboardX - itemWidth / 2))),
    y: Math.round(Math.max(0, Math.min(maxH, artboardY - itemHeight / 2))),
  };
};

export interface PinterestBoardInfo {
  id: string;
  name: string;
  description?: string;
  pinCount: number;
  coverUrl?: string;
}

export interface PinterestPinInput {
  id: string;
  title: string;
  description?: string;
  boardId?: string;
  category?: string;
  dominantColor?: string;
  pinUrl: string;
  imageUrl: string;
  width?: number;
  height?: number;
  author?: string;
}

export const inferTemplateCategory = (text = ''): TemplateCategory => {
  const q = text.toLowerCase();
  if (/(sale|promo|discount|flash|shop|offer|summer|deal|retail|fashion)/.test(q)) return 'Summer Sale';
  if (/(tech|saas|ai|app|software|product|launch|code|dev|cyber|startup)/.test(q)) return 'Tech';
  if (/(music|concert|podcast|vinyl|tour|dj|band|album|festival|audio)/.test(q)) return 'Music';
  if (/(quote|typography|manifesto|poem|poster|lettering|inspire|serif)/.test(q)) return 'Quote';
  if (/(business|pitch|corporate|deck|summit|report|finance|invite|conference)/.test(q)) return 'Business';
  return 'Minimal';
};

const CATEGORY_STYLE_MAP: Record<
  TemplateCategory,
  {
    previewBg: string;
    canvasBg: string;
    canvasGradient: string;
    accent: string;
    ink: string;
    mutedInk: string;
    headingFont: string;
    darkText?: boolean;
    ctaLabel: string;
  }
> = {
  'Summer Sale': {
    previewBg: 'from-amber-400 via-orange-500 to-rose-600',
    canvasBg: '#fff7ed',
    canvasGradient: 'linear-gradient(135deg, #fff7ed 0%, #ffe4e6 100%)',
    accent: '#f97316',
    ink: '#0f172a',
    mutedInk: '#64748b',
    headingFont: 'Outfit, sans-serif',
    darkText: true,
    ctaLabel: 'SHOP THE EDIT →',
  },
  Tech: {
    previewBg: 'from-slate-900 via-indigo-950 to-cyan-700',
    canvasBg: '#090a16',
    canvasGradient: 'linear-gradient(135deg, #090a16 0%, #1e1b4b 55%, #0f766e 100%)',
    accent: '#00c4cc',
    ink: '#f8fafc',
    mutedInk: '#cbd5e1',
    headingFont: 'Outfit, sans-serif',
    ctaLabel: 'LAUNCH EXPERIENCE →',
  },
  Music: {
    previewBg: 'from-fuchsia-700 via-purple-800 to-slate-950',
    canvasBg: '#1e0b36',
    canvasGradient: 'linear-gradient(135deg, #1e0b36 0%, #4c1d95 55%, #be185d 100%)',
    accent: '#ec4899',
    ink: '#ffffff',
    mutedInk: '#f5d0fe',
    headingFont: 'Outfit, sans-serif',
    ctaLabel: 'LISTEN LIVE →',
  },
  Quote: {
    previewBg: 'from-stone-200 via-amber-100 to-rose-100',
    canvasBg: '#faf7f2',
    canvasGradient: 'linear-gradient(135deg, #faf7f2 0%, #f5ebe0 100%)',
    accent: '#78350f',
    ink: '#1c1917',
    mutedInk: '#57534e',
    headingFont: 'Playfair Display, serif',
    darkText: true,
    ctaLabel: 'SAVE INSPIRATION',
  },
  Minimal: {
    previewBg: 'from-slate-100 via-zinc-200 to-stone-300',
    canvasBg: '#f8fafc',
    canvasGradient: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
    accent: '#7d2ae8',
    ink: '#0f172a',
    mutedInk: '#475569',
    headingFont: 'Plus Jakarta Sans, sans-serif',
    darkText: true,
    ctaLabel: 'VIEW COLLECTION →',
  },
  Business: {
    previewBg: 'from-blue-900 via-slate-900 to-emerald-800',
    canvasBg: '#0f172a',
    canvasGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 65%, #065f46 100%)',
    accent: '#38bdf8',
    ink: '#ffffff',
    mutedInk: '#cbd5e1',
    headingFont: 'Outfit, sans-serif',
    ctaLabel: 'BOOK STRATEGY CALL →',
  },
};

export const convertPinterestPinToTemplate = (
  pin: PinterestPinInput,
  explicitCategory?: TemplateCategory
): CanvaTemplate => {
  const matchedCat =
    explicitCategory ||
    (TEMPLATE_CATEGORIES.includes(pin.category as TemplateCategory)
      ? (pin.category as TemplateCategory)
      : inferTemplateCategory(`${pin.title} ${pin.description || ''}`));
  const theme = CATEGORY_STYLE_MAP[matchedCat];
  const cleanTitle = (pin.title || 'Pinterest Concept').trim().slice(0, 44);
  const shortHeadline = cleanTitle.length > 26 ? `${cleanTitle.slice(0, 24)}…` : cleanTitle;
  const t = pin.id.replace(/[^a-zA-Z0-9_-]/g, '');

  return {
    id: `pin-tpl-${t}`,
    title: cleanTitle,
    category: matchedCat,
    formatTag: 'Pinterest Pin',
    previewBg: theme.previewBg,
    previewBadge: `PIN · ${matchedCat.toUpperCase()}`,
    previewHeadline: shortHeadline,
    previewDarkText: theme.darkText,
    previewImageUrl: pin.imageUrl,
    sourceProvider: 'pinterest',
    sourcePinUrl: pin.pinUrl,
    sourceAuthor: pin.author || 'Pinterest Creator',
    canvasBg: theme.canvasBg,
    canvasGradient: theme.canvasGradient,
    items: [
      {
        id: `${t}-badge`,
        type: 'badge',
        content: `PINTEREST · ${matchedCat.toUpperCase()}`,
        x: 155,
        y: 28,
        width: 230,
        height: 30,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.4,
        color: '#ffffff',
        bgColor: theme.accent,
        borderRadius: 9999,
        textAlign: 'center',
      },
      {
        id: `${t}-img`,
        type: 'image',
        content: cleanTitle,
        imageUrl: pin.imageUrl,
        x: 90,
        y: 74,
        width: 360,
        height: 255,
        borderRadius: 18,
        borderColor: 'rgba(255,255,255,0.28)',
        borderWidth: 2,
        color: '#ffffff',
        imageFilters: { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0 },
      },
      {
        id: `${t}-heading`,
        type: 'text',
        content: cleanTitle.toUpperCase(),
        x: 45,
        y: 344,
        width: 450,
        fontSize: 28,
        fontFamily: theme.headingFont,
        fontWeight: '800',
        color: theme.ink,
        textAlign: 'center',
        letterSpacing: -0.5,
      },
      {
        id: `${t}-sub`,
        type: 'text',
        content: `Curated from Pinterest · ${pin.author || 'Design Board'}`,
        x: 75,
        y: 416,
        width: 390,
        fontSize: 12,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontWeight: '600',
        color: theme.mutedInk,
        textAlign: 'center',
      },
      {
        id: `${t}-cta`,
        type: 'badge',
        content: theme.ctaLabel,
        x: 155,
        y: 458,
        width: 230,
        height: 42,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
        bgColor: theme.accent,
        borderRadius: 12,
        textAlign: 'center',
      },
    ],
  };
};


