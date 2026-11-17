import {
  InvestigationTarget,
  Message,
  EvidenceItem,
  CodeFile,
  StructureNode,
  StructureEdge,
  ArtifactItem,
  TimelineEvent,
} from '../types/rea';

export const INITIAL_TARGETS: InvestigationTarget[] = [
  {
    id: 'target-canva',
    name: 'Canva (Graphic Editor)',
    version: 'Web App (Clean-Room v3.3)',
    type: 'web',
    path: 'https://www.canva.com/design',
    status: 'completed',
    progress: 100,
    currentStep: 'Clone ready! Full multi-page editor, marquee select, ISO QR, crop/curve tools & live verification active.',
    createdAt: 'Just now',
    description: 'Clean-room Canva graphic design suite with 7 toolrail tabs, marquee box selection, sibling smart guides, photo crop/pan, curved text, real ISO QR codes, and PNG/JPG/SVG/PDF/JSON export.',
    size: 'Web Application',
    arch: 'React / HTML5 Canvas + SVG',
    sha256: 'canva-design-studio-cleanroom-v33',
    starred: true,
  },
  {
    id: 'target-neonmorphic',
    name: 'Neonmorphic (NFT Market)',
    version: 'Web App',
    type: 'web',
    path: 'https://neonmorphic.art',
    status: 'completed',
    progress: 100,
    currentStep: 'Clone ready! Reconstructed from design mockup.',
    createdAt: 'Just now',
    description: 'Cyberpunk dark-neon NFT marketplace for creators with live bidding, wallet connection, and artwork gallery.',
    size: 'Web Application',
    arch: 'React / Web3 UI',
    sha256: 'neonmorphic-marketplace-clone-ready',
    starred: true,
  },
  {
    id: 'target-linear',
    name: 'Linear (Task Board)',
    version: 'Web App',
    type: 'web',
    path: 'https://linear.app',
    status: 'completed',
    progress: 100,
    currentStep: 'Clone ready! Interactive task board generated.',
    createdAt: '1 hour ago',
    description: 'Sleek dark-mode task planner and team project board with drag-and-drop columns.',
    size: 'Web Application',
    arch: 'React / Kanban',
    sha256: 'linear-project-board-clone-ready',
    starred: true,
  },
  {
    id: 'target-spotify',
    name: 'Spotify (Music Player)',
    version: 'Web App',
    type: 'web',
    path: 'https://open.spotify.com',
    status: 'completed',
    progress: 100,
    currentStep: 'Audio player controls and playlist layout mapped.',
    createdAt: 'Yesterday',
    description: 'Streaming audio player with playlists, album art, search, and volume slider.',
    size: 'Web Application',
    arch: 'React / Audio Web',
    sha256: 'spotify-web-player-clone-ready',
    starred: false,
  },
  {
    id: 'target-signal',
    name: 'Signal Desktop App',
    version: 'v7.18',
    type: 'electron',
    path: 'Signal Desktop Application',
    status: 'completed',
    progress: 100,
    currentStep: 'Chat interface and database security verified.',
    createdAt: '3 days ago',
    description: 'Encrypted desktop chat application with attachment safety checks.',
    size: '142 MB',
    arch: 'Desktop App',
    sha256: 'signal-desktop-app-clone-ready',
    starred: false,
  },
];

export const MOCK_CONVERSATIONS: Record<string, Message[]> = {
  'target-canva': [
    {
      id: 'mc-1',
      sender: 'user',
      content: 'Clone Canva. I want the full graphic design editor with multi-page layouts, templates, typography, photo editing, drawing, and real exports.',
      timestamp: '10:00 AM',
    },
    {
      id: 'mc-2',
      sender: 'agent',
      content: 'I have analyzed `canva.com` and implemented a clean-room Canva Studio replica backed by `CLONE_SPEC.md v3.3`.\n\nKey capabilities reconstructed:\n• **Header & Focus Mode**: `File` menu, `Magic Switch` resize presets, 50-step Undo/Redo, Focus Mode full-width collapse, `Present` mode, and `Share / Download` modal.\n• **7-Tab Dark Toolrail**: `Design`, `Elements` (shapes, frames, lines, charts, ISO/IEC 18004 QR codes, stickers), `Text` (styles + Curve Text & Background highlight effects), `Brand` kits, `Uploads` (local image + JSON import), `Draw` (pen/marker/highlighter + eraser), and `Apps` (AI Layout Generator, Bulk Data Merge, Color Palette Extractor).\n• **Canvas Precision**: 540px proportional multi-format artboard with marquee box drag selection, Shift+Click multi-select, grouping (`Ctrl+G`), sibling edge/center smart snap guides, horizontal `Tidy Up`, photo Crop & Pan, rulers, and `Ctrl+=`/`Ctrl+-`/`Ctrl+0` zoom.\n• **Production Export & Live Verification**: Rasterizes to **PNG**, **JPG**, **SVG** (with `<textPath>` and gradients), **PDF** print sheet, **CanvaDocV3 JSON**, and standalone React JSX, verified via `Spec & Verification`.',
      timestamp: '10:00 AM',
      reasoningSteps: [
        'Inspected Canva web workspace, 72px toolrail, floating contextual bar, and bottom page/zoom tray.',
        'Built a proportional 540px artboard supporting 6+ canvas formats, multi-page switching, Grid View, and Present Mode.',
        'Implemented marquee drag selection, sibling snap alignment guides, horizontal Tidy Up, photo Crop & Pan, and curved SVG text.',
        'Integrated ISO/IEC 18004 Reed-Solomon QR generation and HTML5 Canvas/SVG/PDF/JSON export rasterization.',
      ],
      toolCalls: [
        {
          tool: 'rea clone-interface',
          args: { target: 'https://www.canva.com', mode: 'clean-room-studio', specVersion: '3.3.0' },
          status: 'done',
          durationMs: 450,
          outputSummary: 'Reconstructed Canva Studio with 7 tool tabs, marquee & snap geometry, real QR encoder, and 5 export formats.',
        },
      ],
      codeSnippets: [
        {
          language: 'typescript',
          title: 'CanvaClone Artboard & Exporter Modules',
          code: `// Clean-Room Canva Architecture
// - src/components/clones/CanvaClone.tsx (Studio workspace, marquee, crop, curve, shortcuts)
// - src/components/clones/canva/exporter.ts (Canvas2D PNG/JPG, SVG <textPath>, PDF, JSON)
// - src/components/clones/canva/QrAndChartRenderer.tsx (ISO/IEC 18004 QRCode.create + Bar/Donut/Line SVG)
// - src/components/clones/canva/ShapeRenderer.tsx (Polygons, frames, arrows, badges)
// - src/components/clones/CanvaSpecAndTests.tsx (Live TC-01..TC-09 behavioral test suite)`,
        },
      ],
      quickActions: [
        'Open Live Canva Clone',
        'Run Spec & Verification Suite',
        'Copy React code for Canva',
        'Deep Improve Canva',
      ],
    },
  ],
  'target-linear': [
    {
      id: 'ml-1',
      sender: 'user',
      content: 'Clone Linear task board.',
      timestamp: '09:30 AM',
    },
    {
      id: 'ml-2',
      sender: 'agent',
      content: 'I have cloned Linear for you! The kanban board is live with To Do, In Progress, and Done columns. You can add new tasks and copy the code.',
      timestamp: '09:30 AM',
      quickActions: ['Open Live Linear Clone', 'Copy Linear Code'],
    },
  ],
  'target-spotify': [
    {
      id: 'ms-1',
      sender: 'user',
      content: 'Clone Spotify web player.',
      timestamp: '08:00 AM',
    },
    {
      id: 'ms-2',
      sender: 'agent',
      content: 'I have cloned Spotify! Music playlist view, album cover banner, and bottom playback controls are mapped and ready.',
      timestamp: '08:00 AM',
      quickActions: ['Show Spotify Player', 'Copy Player Code'],
    },
  ],
  'target-signal': [
    {
      id: 'msi-1',
      sender: 'user',
      content: 'Analyze Signal Desktop app.',
      timestamp: 'Yesterday',
    },
    {
      id: 'msi-2',
      sender: 'agent',
      content: 'Signal Desktop has been analyzed. The database uses password-protected encryption and attachment file safety checks are active.',
      timestamp: 'Yesterday',
    },
  ],
};

export const MOCK_EVIDENCE: Record<string, EvidenceItem[]> = {
  'target-canva': [
    {
      id: 'ev-c1',
      title: 'Proportional 540px Multi-Format Artboard & Marquee Engine',
      category: 'logic',
      confidence: 'High',
      confidenceScore: 99,
      sourceTool: 'REA Web Inspector',
      summary: 'Proportional 540px coordinate space dynamically scales across 1080×1080, 1920×1080, 1080×1920, A4, Letter, and custom dimensions.',
      detailedFinding: 'Supports marquee box drag selection, Shift+Click multi-select, Ctrl+G grouping, 8-handle resize, rotation handle, sibling smart snap guides, horizontal Tidy Up distribution, and 1px/10px arrow nudging.',
      limitations: 'Offline-first browser state persists to localStorage["canva_cleanroom_draft_v2"] instead of proprietary WebSocket RTC.',
      location: 'src/components/clones/CanvaClone.tsx',
      codeSnippet: `const scaleFactor = Math.round(zoomPercent) / 100; // Dynamic Fit computes viewport bounds`,
    },
    {
      id: 'ev-c2',
      title: '7-Tab Toolrail & Advanced Typography / Image Crop Controls',
      category: 'ipc',
      confidence: 'High',
      confidenceScore: 98,
      sourceTool: 'REA Layout Extractor',
      summary: 'Left 72px toolrail switches cleanly between Design, Elements, Text, Brand, Uploads, Draw, and Apps.',
      detailedFinding: 'Includes curved SVG <textPath> geometry, Highlight Background text box, Neon/Lift/Shadow/Hollow effects, non-destructive Photo Crop & Pan inside rounded clip frames, and freehand vector pen/highlighter strokes.',
      limitations: 'Media stock uploads rely on local object/DataURLs or canvas swatches without external CDN dependencies.',
      location: 'src/components/clones/CanvaClone.tsx & presets.ts',
    },
    {
      id: 'ev-c3',
      title: 'HTML5 Canvas, Vector SVG, PDF & ISO/IEC 18004 QR Pipeline',
      category: 'crypto',
      confidence: 'High',
      confidenceScore: 97,
      sourceTool: 'REA Export Engine',
      summary: 'Multi-format export pipeline plus live Reed-Solomon QR generation via qrcode.',
      detailedFinding: 'Exports crisp PNG/JPG at 1×/2×/3× resolution, vector SVG with gradients & <textPath>, multi-page printable PDF view, and CanvaDocV3 JSON import/export.',
      limitations: 'Video/GIF timeline animation export is excluded and documented in CLONE_SPEC.md.',
      location: 'src/components/clones/canva/exporter.ts & QrAndChartRenderer.tsx',
    },
  ],
  'target-linear': [
    {
      id: 'ev-l1',
      title: '3-Column Kanban Workflow',
      category: 'logic',
      confidence: 'High',
      confidenceScore: 98,
      sourceTool: 'REA Web Inspector',
      summary: 'To Do, In Progress, and Done columns with real-time task creation.',
      detailedFinding: 'Each task card displays priority badges and issue tracking IDs (e.g. LIN-101).',
      limitations: 'Requires local storage for persistence across reloads.',
      location: 'Linear Kanban Grid',
    },
  ],
};

export const MOCK_CODE_FILES: Record<string, CodeFile[]> = {
  'target-canva': [
    {
      id: 'code-canva-1',
      filename: 'CanvaClone.tsx',
      language: 'typescript',
      path: 'src/components/clones/CanvaClone.tsx',
      recoveredFrom: 'Clean-Room Canva Studio Workspace + Interaction State Machine',
      tags: ['Editor', 'Marquee', 'Crop & Curve', 'React'],
      code: `// Excerpt from clean-room CanvaClone.tsx
// Supports 50-step Undo/Redo, marquee box selection, sibling smart snap guides,
// horizontal Tidy Up spacing, Photo Crop & Pan, Curved Text, Focus Mode,
// and shortcuts (Ctrl+Z/Y/D/G/A/C/V, Ctrl+=/−/0, Shift+Arrow, Shift+R).
export const CanvaClone: React.FC = () => {
  const { setIsSidebarCollapsed, setIsEvidencePanelCollapsed } = useREA();
  // Active document pages persisted to localStorage["canva_cleanroom_draft_v2"]
  return null;
};`,
    },
    {
      id: 'code-canva-2',
      filename: 'exporter.ts',
      language: 'typescript',
      path: 'src/components/clones/canva/exporter.ts',
      recoveredFrom: 'HTML5 Canvas & Vector SVG Rasterization Pipeline',
      tags: ['PNG/JPG', 'SVG <textPath>', 'PDF', 'CanvaDocV3'],
      code: `// Multi-format exporter parity module
// - renderPageToCanvas(): applies linear gradients, imageCrop pan/zoom clips,
//   background highlight text boxes, curved arc text, ISO QR matrices, & strokes.
// - generateSvgExport(): emits standalone SVG with <linearGradient> & <textPath>.`,
    },
  ],
  'target-linear': [
    {
      id: 'code-lin-1',
      filename: 'LinearBoard.tsx',
      language: 'typescript',
      path: 'src/components/LinearBoard.tsx',
      recoveredFrom: 'Linear App Cloned by REA',
      tags: ['Board', 'Tasks', 'React'],
      code: `// Linear Board Clone
import React, { useState } from 'react';

export default function LinearBoard() {
  return (
    <div className="p-6 bg-[#080911] text-white min-h-screen">
      <h1 className="text-xl font-bold mb-4">Linear Tasks</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0e1022] p-4 rounded-xl">To Do</div>
        <div className="bg-[#0e1022] p-4 rounded-xl">In Progress</div>
        <div className="bg-[#0e1022] p-4 rounded-xl">Done</div>
      </div>
    </div>
  );
}`,
    },
  ],
};

export const MOCK_STRUCTURE: Record<string, { nodes: StructureNode[]; edges: StructureEdge[] }> = {
  'target-canva': {
    nodes: [
      { id: 'top', label: 'Header Bar & Magic Switch', type: 'entrypoint', x: 220, y: 40, category: 'Navigation', details: 'File menu, Resize, Undo/Redo, Focus Mode, Present & Share.', xrefsCount: 9 },
      { id: 'rail', label: '7-Tab Dark Toolrail + Drawer', type: 'module', x: 80, y: 150, category: 'Tools', details: 'Design, Elements, Text, Brand, Uploads, Draw, and Apps.', xrefsCount: 16 },
      { id: 'canvas', label: '540px Proportional Artboard', type: 'function', x: 350, y: 150, category: 'Canvas', details: 'Marquee selection, sibling snap guides, Tidy Up, Crop & Curved Text.', xrefsCount: 28 },
      { id: 'qr', label: 'ISO/IEC 18004 QR & Charts', type: 'ipc', x: 80, y: 270, category: 'Generators', details: 'QRCode.create Reed-Solomon matrix + Bar/Donut/Line SVG.', xrefsCount: 8 },
      { id: 'export', label: 'Canvas2D / SVG / PDF Exporter', type: 'crypto', x: 350, y: 270, category: 'Export', details: 'PNG/JPG 1x-3x, vector SVG <textPath>, PDF, JSON, JSX.', xrefsCount: 11 },
    ],
    edges: [
      { id: 'e1', source: 'top', target: 'rail', label: 'toggles focus / panels', type: 'calls' },
      { id: 'e2', source: 'rail', target: 'canvas', label: 'inserts items & strokes', type: 'calls' },
      { id: 'e3', source: 'rail', target: 'qr', label: 'builds QR & charts', type: 'imports' },
      { id: 'e4', source: 'canvas', target: 'export', label: 'serializes CanvaDocV3', type: 'decrypts' },
    ],
  },
  'target-linear': {
    nodes: [
      { id: 'board', label: 'Task Board', type: 'entrypoint', x: 220, y: 60, category: 'Board', details: 'Kanban columns', xrefsCount: 4 },
      { id: 'task', label: 'Task Card', type: 'module', x: 220, y: 180, category: 'Item', details: 'Task details and priority', xrefsCount: 8 },
    ],
    edges: [
      { id: 'el1', source: 'board', target: 'task', label: 'renders', type: 'calls' },
    ],
  },
};

export const MOCK_ARTIFACTS: Record<string, ArtifactItem[]> = {
  'target-canva': [
    {
      id: 'art-c1',
      name: 'CLONE_SPEC.md',
      type: 'Clean-Room Spec v3.3',
      size: '15.2 KB',
      path: 'CLONE_SPEC.md',
      description: 'Authoritative black-box specification with triggers, shortcuts, CanvaDocV3 schema, and divergences.',
      createdAt: 'Just now',
    },
    {
      id: 'art-c2',
      name: 'CanvaClone.tsx',
      type: 'React Studio Component',
      size: '214 KB',
      path: 'src/components/clones/CanvaClone.tsx',
      description: 'Complete interactive Canva Studio with marquee select, smart snaps, crop/pan, curve text, and exports.',
      createdAt: 'Just now',
    },
  ],
};

export const MOCK_TIMELINE: Record<string, TimelineEvent[]> = {
  'target-canva': [
    {
      id: 'tl-c1',
      timestamp: '10:00:01',
      title: 'Black-Box Inspection of Canva.com',
      detail: 'Documented 72px 7-tab rail, floating contextual toolbar, artboard bounding handles, and shortcut dispatch.',
      tool: 'REA Web Inspector',
      status: 'completed',
      durationMs: 240,
    },
    {
      id: 'tl-c2',
      timestamp: '10:00:04',
      title: 'Authored CLONE_SPEC.md v3.3',
      detail: 'Captured CanvaDocV3 JSON schema, 50-step Undo/Redo transaction semantics, and privacy divergences.',
      tool: 'REA Spec Compiler',
      status: 'completed',
      durationMs: 190,
    },
    {
      id: 'tl-c3',
      timestamp: '10:00:08',
      title: 'Implemented Clean-Room Studio & Parity Upgrades',
      detail: 'Added marquee drag select, sibling snap guides, Tidy Up, ISO QR codes, photo crop/pan, curve text, and Focus Mode.',
      tool: 'REA Clean-Room Builder',
      status: 'completed',
      durationMs: 380,
    },
    {
      id: 'tl-c4',
      timestamp: '10:00:10',
      title: 'Executed Live Verification Suite (TC-01..TC-09)',
      detail: 'All 9 live behavioral assertions passed with 1 documented offline-first cloud divergence.',
      tool: 'REA Verify Suite',
      status: 'completed',
      durationMs: 90,
    },
  ],
};
