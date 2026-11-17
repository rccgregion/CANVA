import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useREA } from '../../context/REAContext';
import {
  Sparkles,
  Type,
  Shapes,
  Download,
  Share2,
  Undo2,
  Redo2,
  Trash2,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Copy,
  Layers,
  FolderOpen,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Lock,
  Unlock,
  Crown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  PenTool,
  Grid,
  Eye,
  EyeOff,
  Sliders,
  Upload,
  Eraser,
  FlipHorizontal,
  FlipVertical,
  Play,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Keyboard,
  FileJson,
  RotateCw,
  Wand2,
  StickyNote,
  PaintRoller,
  List,
  ListOrdered,
  Group,
  Ungroup,
  QrCode,
  BarChart3,
  PieChart,
  Link2,
  Maximize2,
  Minimize2,
  Crop,
  AlignHorizontalSpaceAround,
  Home,
  MoreHorizontal,
  Timer,
  FlaskConical,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  CanvasItem,
  CanvaPage,
  CanvaHistorySnapshot,
  DocDimensions,
  DrawStroke,
  ShapeKind,
  TextEffectType,
  AnimationType,
  UploadedAsset,
} from './canva/types';
import {
  INITIAL_PAGES,
  TEMPLATES_CATALOG,
  TEMPLATE_CATEGORIES,
  CanvaTemplate,
  TemplateCategory,
  PinterestBoardInfo,
  PinterestPinInput,
  convertPinterestPinToTemplate,
  RESIZE_PRESETS,
  SHAPE_CATALOG,
  FONT_PAIRINGS,
  BRAND_KITS,
  SAMPLE_UPLOAD_PHOTOS,
  CANVAS_BG_GRADIENTS,
  SidebarDragPayload,
  computeArtboardDropPosition,
} from './canva/presets';
import { ShapeRenderer } from './canva/ShapeRenderer';
import { QrAndChartRenderer, DEFAULT_CHART_DATA } from './canva/QrAndChartRenderer';
import { renderPageToCanvas, generateSvgExport, buildPdfFromJpegCanvases, formatDisplayText } from './canva/exporter';

const STORAGE_KEY = 'canva_cleanroom_draft_v2';
const MAX_HISTORY = 50;

const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export const CanvaClone: React.FC = () => {
  const {
    setIsDeepImproveModalOpen,
    isClone100PercentUpgraded,
    setWorkspaceMode,
    pendingCanvaPreset,
    setPendingCanvaPreset,
  } = useREA();

  // Document State (Hydrate from localStorage if available)
  const [docTitle, setDocTitle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).docTitle || 'Instagram Post - Summer Mega Sale';
    } catch {}
    return 'Instagram Post - Summer Mega Sale';
  });

  const [dimensions, setDimensions] = useState<DocDimensions>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && JSON.parse(saved).dimensions) return JSON.parse(saved).dimensions;
    } catch {}
    return { width: 1080, height: 1080, label: 'Instagram Post (Square)' };
  });

  const [pages, setPages] = useState<CanvaPage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && Array.isArray(JSON.parse(saved).pages) && JSON.parse(saved).pages.length > 0) {
        return JSON.parse(saved).pages;
      }
    } catch {}
    return deepClone(INITIAL_PAGES);
  });

  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Undo / Redo Stack
  const [history, setHistory] = useState<CanvaHistorySnapshot[]>(() => [
    deepClone({ pages, activePageIndex: 0, dimensions }),
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Navigation & Panels
  const [activeRailTab, setActiveRailTab] = useState<
    'design' | 'elements' | 'text' | 'brand' | 'uploads' | 'draw' | 'layers'
  >('design');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedIds, setSelectedIds] = useState<string[]>(['item-heading']);
  const selectedId = selectedIds[selectedIds.length - 1] || null;
  const setSelectedId = useCallback((id: string | null) => {
    setSelectedIds(id ? [id] : []);
  }, []);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [clipboardItems, setClipboardItems] = useState<CanvasItem[]>([]);
  const [copiedStyle, setCopiedStyle] = useState<Partial<CanvasItem> | null>(null);

  // Search & Filter states
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('All');
  const [templateApplyMode, setTemplateApplyMode] = useState<'replace' | 'new-page'>('replace');
  const [templateSource, setTemplateSource] = useState<'canva' | 'pinterest'>('canva');
  const [pinterestStatus, setPinterestStatus] = useState<{
    oauthConfigured: boolean;
    connected: boolean;
    username: string | null;
    callbackUrl?: string;
  }>({ oauthConfigured: false, connected: false, username: null });
  const [pinterestBoards, setPinterestBoards] = useState<PinterestBoardInfo[]>([]);
  const [selectedPinterestBoard, setSelectedPinterestBoard] = useState<string>('all');
  const [pinterestPins, setPinterestPins] = useState<PinterestPinInput[]>(() => {
    try {
      const saved = localStorage.getItem('canva_pinterest_pins_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [pinterestUrlInput, setPinterestUrlInput] = useState('');
  const [pinterestLoading, setPinterestLoading] = useState(false);
  const [pinterestError, setPinterestError] = useState<string | null>(null);
  const [elementSearch, setElementSearch] = useState('');

  // Overlays & Modals
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [showPresentNotes, setShowPresentNotes] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [showMargins, setShowMargins] = useState(false);

  // Contextual Toolbar Popovers
  const [activePopover, setActivePopover] = useState<
    null | 'spacing' | 'effects' | 'animate' | 'opacity' | 'position' | 'border' | 'filters' | 'crop' | 'bg' | 'qr' | 'chart'
  >(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);

  // Export & Save Status
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const [downloadFormat, setDownloadFormat] = useState<'PNG' | 'JPG' | 'PDF' | 'SVG' | 'JSON'>('PNG');
  const [exportScale, setExportScale] = useState<1 | 2>(1);
  const [transparentBg, setTransparentBg] = useState(false);
  const [exportAllPages, setExportAllPages] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedReactCode, setCopiedReactCode] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Resize modal local inputs
  const [customW, setCustomW] = useState(String(dimensions.width));
  const [customH, setCustomH] = useState(String(dimensions.height));

  // Uploaded images store
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>(
    SAMPLE_UPLOAD_PHOTOS.map((p) => ({ ...p, addedAt: 'Sample' }))
  );

  // Draw Mode State
  const [drawTool, setDrawTool] = useState<'pen' | 'marker' | 'highlighter' | 'eraser'>('pen');
  const [drawColor, setDrawColor] = useState('#7d2ae8');
  const [drawWidth, setDrawWidth] = useState(6);
  const [isDrawingStroke, setIsDrawingStroke] = useState(false);
  const [activeStrokePoints, setActiveStrokePoints] = useState<Array<{ x: number; y: number }>>([]);

  // Drag / Resize / Rotate / Marquee Interaction Refs
  const [interaction, setInteraction] = useState<
    | null
    | {
        mode: 'drag' | 'resize-se' | 'resize-sw' | 'resize-ne' | 'resize-nw' | 'resize-e' | 'resize-s' | 'rotate';
        itemId: string;
        startX: number;
        startY: number;
        origItem: CanvasItem;
        origGroupItems?: Record<string, { x: number; y: number }>;
      }
  >(null);
  const [marquee, setMarquee] = useState<null | { startX: number; startY: number; curX: number; curY: number }>(null);
  const [snapGuides, setSnapGuides] = useState<{ x?: number; y?: number }>({});
  const [activeSidebarDrag, setActiveSidebarDrag] = useState<SidebarDragPayload | null>(null);
  const activeSidebarDragRef = useRef<SidebarDragPayload | null>(null);
  const [dropPreview, setDropPreview] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    isTemplate?: boolean;
  } | null>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  // Derived active page & base viewport size (fit inside 540px max box preserving aspect ratio)
  const activePage = pages[activePageIndex] || pages[0];
  const items = activePage.items;
  const selectedItem = items.find((i) => i.id === selectedId) || null;
  const selectedItemsList = items.filter((i) => selectedIds.includes(i.id));

  const baseArtboardSize = useMemo(() => {
    const maxBox = 540;
    const ratio = dimensions.width / dimensions.height;
    if (ratio >= 1) {
      return { width: maxBox, height: Math.round(maxBox / ratio) };
    }
    return { width: Math.round(maxBox * ratio), height: maxBox };
  }, [dimensions]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((prev) => (prev === msg ? null : prev)), 2800);
  }, []);

  // Auto-save Pinterest pins to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('canva_pinterest_pins_v1', JSON.stringify(pinterestPins));
    } catch {}
  }, [pinterestPins]);

  const fetchPinterestBoardsAndPins = useCallback(async (boardId = 'all') => {
    setPinterestLoading(true);
    setPinterestError(null);
    try {
      const [boardsRes, pinsRes] = await Promise.all([
        fetch('/api/pinterest/boards'),
        fetch(`/api/pinterest/pins?boardId=${encodeURIComponent(boardId)}`),
      ]);
      if (boardsRes.ok) {
        const bJson = await boardsRes.json();
        if (Array.isArray(bJson.boards)) setPinterestBoards(bJson.boards);
      }
      if (pinsRes.ok) {
        const pJson = await pinsRes.json();
        if (Array.isArray(pJson.pins)) {
          setPinterestPins((prev) => {
            const importedOnly = prev.filter((p) => p.id.startsWith('pin-') && !p.boardId);
            const combined = [...pJson.pins, ...importedOnly];
            const seen = new Set<string>();
            return combined.filter((item) => {
              if (seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            });
          });
        }
      } else {
        const errJson = await pinsRes.json().catch(() => ({}));
        setPinterestError(errJson.error || 'Could not load Pinterest pins.');
      }
    } catch {
      setPinterestError('Failed to reach Pinterest proxy endpoint.');
    } finally {
      setPinterestLoading(false);
    }
  }, []);

  const refreshPinterestStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/pinterest/status');
      if (res.ok) {
        const statusData = await res.json();
        setPinterestStatus({
          oauthConfigured: Boolean(statusData.oauthConfigured),
          connected: Boolean(statusData.connected),
          username: statusData.username || null,
          callbackUrl: statusData.callbackUrl,
        });
        if (statusData.connected) {
          fetchPinterestBoardsAndPins(selectedPinterestBoard);
        }
      }
    } catch {}
  }, [fetchPinterestBoardsAndPins, selectedPinterestBoard]);

  useEffect(() => {
    refreshPinterestStatus();
  }, [refreshPinterestStatus]);

  // Listen for OAuth popup completion cross-origin postMessage
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const origin = event.origin || '';
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== window.location.origin) {
        return;
      }
      if (event.data?.provider !== 'pinterest') return;
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setPinterestError(null);
        refreshPinterestStatus();
        showToast('Pinterest account connected');
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setPinterestError(event.data?.error || 'Pinterest authorization failed.');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [refreshPinterestStatus, showToast]);

  const handleConnectPinterest = async () => {
    setPinterestError(null);
    setPinterestLoading(true);
    try {
      const res = await fetch('/api/pinterest/auth/url');
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setPinterestError(data.error || 'Pinterest OAuth is not configured on the server yet.');
        return;
      }
      const popup = window.open(data.url, 'pinterest_oauth', 'width=600,height=700');
      if (!popup) {
        setPinterestError('Popup was blocked by your browser. Please allow popups for this site and click Connect again.');
      }
    } catch {
      setPinterestError('Unable to initiate Pinterest OAuth.');
    } finally {
      setPinterestLoading(false);
    }
  };

  const handleDisconnectPinterest = async () => {
    try {
      await fetch('/api/pinterest/disconnect', { method: 'POST' });
    } catch {}
    setPinterestStatus((prev) => ({ ...prev, connected: false, username: null }));
    setPinterestBoards([]);
    setSelectedPinterestBoard('all');
    showToast('Disconnected Pinterest');
  };

  const handleImportPinterestUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = pinterestUrlInput.trim();
    if (!url) return;
    setPinterestError(null);
    setPinterestLoading(true);
    try {
      const targetCat = TEMPLATE_CATEGORIES.includes(templateCategory as TemplateCategory)
        ? templateCategory
        : '';
      const res = await fetch('/api/pinterest/oembed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, category: targetCat || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.pin) {
        setPinterestError(data.error || 'Could not import that Pinterest Pin URL.');
        return;
      }
      const importedPin: PinterestPinInput = data.pin;
      setPinterestPins((prev) => [importedPin, ...prev.filter((p) => p.id !== importedPin.id)]);
      setPinterestUrlInput('');
      showToast(`Converted Pinterest Pin "${importedPin.title.slice(0, 28)}" into template`);
    } catch {
      setPinterestError('Network error importing Pinterest Pin.');
    } finally {
      setPinterestLoading(false);
    }
  };

  // Auto-save to localStorage
  useEffect(() => {
    setSaveState('saving');
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ docTitle, dimensions, pages }));
      } catch {}
      setSaveState('saved');
    }, 350);
    return () => clearTimeout(t);
  }, [docTitle, dimensions, pages]);

  // Apply template or format launch from CanvaHome
  useEffect(() => {
    if (!pendingCanvaPreset) return;
    if (pendingCanvaPreset.resetBlank && pendingCanvaPreset.dimensions) {
      const blankPage: CanvaPage = {
        id: `page-${Date.now()}`,
        title: 'Page 1',
        backgroundColor: '#ffffff',
        strokes: [],
        notes: '',
        items: [],
      };
      setPages([blankPage]);
      setActivePageIndex(0);
      setDimensions(pendingCanvaPreset.dimensions);
      setDocTitle(pendingCanvaPreset.title || `Untitled ${pendingCanvaPreset.dimensions.label}`);
      setSelectedIds([]);
      setHistory([{ pages: [deepClone(blankPage)], activePageIndex: 0, dimensions: pendingCanvaPreset.dimensions }]);
      setHistoryIndex(0);
    } else if (pendingCanvaPreset.templateId) {
      const tpl = TEMPLATES_CATALOG.find((t) => t.id === pendingCanvaPreset.templateId);
      if (tpl) {
        const loadedPage: CanvaPage = {
          id: `page-${Date.now()}`,
          title: tpl.title,
          backgroundColor: tpl.canvasBg,
          backgroundGradient: tpl.canvasGradient,
          strokes: [],
          notes: '',
          items: deepClone(tpl.items),
        };
        const dims = { width: 1080, height: 1080, label: 'Instagram Post (Square)' };
        setPages([loadedPage]);
        setActivePageIndex(0);
        setDimensions(dims);
        setDocTitle(tpl.title);
        setSelectedIds([]);
        setHistory([{ pages: [deepClone(loadedPage)], activePageIndex: 0, dimensions: dims }]);
        setHistoryIndex(0);
      }
    }
    setPendingCanvaPreset(null);
  }, [pendingCanvaPreset, setPendingCanvaPreset]);

  // Countdown Timer Ticker (Canva Footer Timer)
  useEffect(() => {
    if (!timerRunning) return;
    const iv = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          showToast('Timer finished!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [timerRunning, showToast]);

  // History commit helper
  const commitSnapshot = useCallback(
    (nextPages: CanvaPage[], nextPageIdx = activePageIndex, nextDims = dimensions) => {
      const snap: CanvaHistorySnapshot = deepClone({
        pages: nextPages,
        activePageIndex: nextPageIdx,
        dimensions: nextDims,
      });
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        const updated = [...sliced, snap].slice(-MAX_HISTORY);
        setHistoryIndex(updated.length - 1);
        return updated;
      });
    },
    [activePageIndex, dimensions, historyIndex]
  );

  // Mutate active page items with optional history push
  const updateActivePage = useCallback(
    (updater: (page: CanvaPage) => CanvaPage, pushHistory = true) => {
      setPages((prev) => {
        const next = prev.map((p, idx) => (idx === activePageIndex ? updater(p) : p));
        if (pushHistory) commitSnapshot(next);
        return next;
      });
    },
    [activePageIndex, commitSnapshot]
  );

  const updateItemById = useCallback(
    (id: string, fields: Partial<CanvasItem>, pushHistory = true) => {
      updateActivePage(
        (p) => ({
          ...p,
          items: p.items.map((item) => (item.id === id ? { ...item, ...fields } : item)),
        }),
        pushHistory
      );
    },
    [updateActivePage]
  );

  const updateSelected = useCallback(
    (fields: Partial<CanvasItem>, pushHistory = true) => {
      if (!selectedId) return;
      updateItemById(selectedId, fields, pushHistory);
    },
    [selectedId, updateItemById]
  );

  // Undo & Redo Actions
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const targetIdx = historyIndex - 1;
    const snap = deepClone(history[targetIdx]);
    setPages(snap.pages);
    setActivePageIndex(Math.min(snap.activePageIndex, snap.pages.length - 1));
    setDimensions(snap.dimensions);
    setHistoryIndex(targetIdx);
    setSelectedId(null);
  }, [canUndo, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const targetIdx = historyIndex + 1;
    const snap = deepClone(history[targetIdx]);
    setPages(snap.pages);
    setActivePageIndex(Math.min(snap.activePageIndex, snap.pages.length - 1));
    setDimensions(snap.dimensions);
    setHistoryIndex(targetIdx);
    setSelectedId(null);
  }, [canRedo, history, historyIndex]);

  // Delete / Duplicate / Copy / Paste / Group / Ungroup / Layer Reorder
  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const targets = items.filter((i) => selectedIds.includes(i.id));
    if (targets.some((t) => t.isLocked)) {
      showToast('Unlock selected elements first to delete them');
      return;
    }
    updateActivePage((p) => ({ ...p, items: p.items.filter((i) => !selectedIds.includes(i.id)) }), true);
    setSelectedIds([]);
    setActivePopover(null);
  }, [items, selectedIds, showToast, updateActivePage]);

  const duplicateItems = useCallback(
    (itemsToCopy: CanvasItem[]) => {
      if (itemsToCopy.length === 0) return;
      const t = Date.now();
      const dupes: CanvasItem[] = itemsToCopy.map((itemToCopy, idx) => ({
        ...deepClone(itemToCopy),
        id: `item-${t}-${idx}-${Math.floor(Math.random() * 1000)}`,
        x: Math.min(baseArtboardSize.width - 40, itemToCopy.x + 20),
        y: Math.min(baseArtboardSize.height - 40, itemToCopy.y + 20),
        isLocked: false,
      }));
      updateActivePage((p) => ({ ...p, items: [...p.items, ...dupes] }), true);
      setSelectedIds(dupes.map((d) => d.id));
    },
    [baseArtboardSize.height, baseArtboardSize.width, updateActivePage]
  );

  const handleGroupSelected = useCallback(() => {
    if (selectedIds.length < 2) return;
    const gid = `grp-${Date.now()}`;
    updateActivePage(
      (p) => ({
        ...p,
        items: p.items.map((it) => (selectedIds.includes(it.id) ? { ...it, groupId: gid } : it)),
      }),
      true
    );
    showToast(`Grouped ${selectedIds.length} elements`);
  }, [selectedIds, showToast, updateActivePage]);

  const handleUngroupSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    updateActivePage(
      (p) => ({
        ...p,
        items: p.items.map((it) => (selectedIds.includes(it.id) ? { ...it, groupId: undefined } : it)),
      }),
      true
    );
    showToast('Ungrouped elements');
  }, [selectedIds, showToast, updateActivePage]);

  const handleApplyCopiedStyle = useCallback(
    (targetItem: CanvasItem) => {
      if (!copiedStyle) return;
      const patch: Partial<CanvasItem> = {
        opacity: copiedStyle.opacity,
        color: copiedStyle.color,
      };
      if (targetItem.type === 'text') {
        Object.assign(patch, {
          fontFamily: copiedStyle.fontFamily ?? targetItem.fontFamily,
          fontSize: copiedStyle.fontSize ?? targetItem.fontSize,
          fontWeight: copiedStyle.fontWeight ?? targetItem.fontWeight,
          fontStyle: copiedStyle.fontStyle ?? targetItem.fontStyle,
          textDecoration: copiedStyle.textDecoration ?? targetItem.textDecoration,
          textEffect: copiedStyle.textEffect ?? targetItem.textEffect,
        });
      } else if (targetItem.type === 'shape' || targetItem.type === 'badge') {
        Object.assign(patch, {
          bgColor: copiedStyle.bgColor ?? targetItem.bgColor,
          bgGradient: copiedStyle.bgGradient,
          borderColor: copiedStyle.borderColor ?? targetItem.borderColor,
          borderWidth: copiedStyle.borderWidth ?? targetItem.borderWidth,
          borderRadius: copiedStyle.borderRadius ?? targetItem.borderRadius,
        });
      } else if (targetItem.type === 'image' && copiedStyle.imageFilters) {
        patch.imageFilters = deepClone(copiedStyle.imageFilters);
      }
      updateItemById(targetItem.id, patch, true);
      setCopiedStyle(null);
      showToast('Style pasted!');
    },
    [copiedStyle, showToast, updateItemById]
  );

  const reorderLayer = useCallback(
    (itemId: string, direction: 'front' | 'back' | 'forward' | 'backward') => {
      updateActivePage((p) => {
        const idx = p.items.findIndex((i) => i.id === itemId);
        if (idx === -1) return p;
        const arr = [...p.items];
        const [removed] = arr.splice(idx, 1);
        if (direction === 'front') arr.push(removed);
        else if (direction === 'back') arr.unshift(removed);
        else if (direction === 'forward') arr.splice(Math.min(arr.length, idx + 1), 0, removed);
        else if (direction === 'backward') arr.splice(Math.max(0, idx - 1), 0, removed);
        return { ...p, items: arr };
      }, true);
    },
    [updateActivePage]
  );

  const alignSelectedToPage = useCallback(
    (align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (selectedIds.length === 0) return;
      updateActivePage((p) => ({
        ...p,
        items: p.items.map((it) => {
          if (!selectedIds.includes(it.id) || it.isLocked) return it;
          const w = it.width || 220;
          const h = it.height || 50;
          if (align === 'left') return { ...it, x: 0 };
          if (align === 'center') return { ...it, x: Math.round((baseArtboardSize.width - w) / 2) };
          if (align === 'right') return { ...it, x: Math.round(baseArtboardSize.width - w) };
          if (align === 'top') return { ...it, y: 0 };
          if (align === 'middle') return { ...it, y: Math.round((baseArtboardSize.height - h) / 2) };
          return { ...it, y: Math.round(baseArtboardSize.height - h) };
        }),
      }), true);
    },
    [baseArtboardSize.height, baseArtboardSize.width, selectedIds, updateActivePage]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditingText =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      const mod = e.ctrlKey || e.metaKey;

      if (e.key === 'Escape') {
        if (isPresentMode) {
          setIsPresentMode(false);
          return;
        }
        setSelectedIds([]);
        setEditingItemId(null);
        setActivePopover(null);
        setContextMenu(null);
        setIsFileMenuOpen(false);
        setCopiedStyle(null);
        return;
      }

      if (isPresentMode) {
        if (e.key === 'ArrowRight') setActivePageIndex((i) => Math.min(pages.length - 1, i + 1));
        if (e.key === 'ArrowLeft') setActivePageIndex((i) => Math.max(0, i - 1));
        return;
      }

      if (e.shiftKey && (e.key === 'R' || e.key === 'r') && !isEditingText) {
        e.preventDefault();
        setShowRulers((r) => !r);
        return;
      }

      if (isEditingText) return;

      if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedIds(items.filter((i) => !i.isHidden && !i.isLocked).map((i) => i.id));
        return;
      }
      if (mod && e.key.toLowerCase() === 'g' && !e.shiftKey) {
        e.preventDefault();
        handleGroupSelected();
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        handleUngroupSelected();
        return;
      }
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((mod && e.key.toLowerCase() === 'y') || (mod && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'd' && selectedItemsList.length > 0) {
        e.preventDefault();
        duplicateItems(selectedItemsList);
        return;
      }
      if (mod && e.key.toLowerCase() === 'c' && selectedItemsList.length > 0) {
        e.preventDefault();
        setClipboardItems(deepClone(selectedItemsList));
        showToast(`Copied ${selectedItemsList.length} element(s) to clipboard`);
        return;
      }
      if (mod && e.key.toLowerCase() === 'v' && clipboardItems.length > 0) {
        e.preventDefault();
        duplicateItems(clipboardItems);
        return;
      }
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoomLevel((z) => Math.min(200, z + 10));
        return;
      }
      if (mod && e.key === '-') {
        e.preventDefault();
        setZoomLevel((z) => Math.max(40, z - 10));
        return;
      }
      if (mod && e.key === '0') {
        e.preventDefault();
        setZoomLevel(100);
        return;
      }
      if (mod && e.key === ']' && selectedId) {
        e.preventDefault();
        reorderLayer(selectedId, 'forward');
        return;
      }
      if (mod && e.key === '[' && selectedId) {
        e.preventDefault();
        reorderLayer(selectedId, 'backward');
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        deleteSelected();
        return;
      }
      if (
        selectedItemsList.length > 0 &&
        selectedItemsList.every((i) => !i.isLocked) &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        updateActivePage(
          (p) => ({
            ...p,
            items: p.items.map((it) =>
              selectedIds.includes(it.id) ? { ...it, x: it.x + dx, y: it.y + dy } : it
            ),
          }),
          true
        );
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    clipboardItems,
    deleteSelected,
    duplicateItems,
    handleGroupSelected,
    handleRedo,
    handleUndo,
    handleUngroupSelected,
    isPresentMode,
    items,
    pages.length,
    reorderLayer,
    selectedId,
    selectedIds,
    selectedItemsList,
    showToast,
    updateActivePage,
  ]);

  // Mouse Drag / Resize / Rotate Handlers on Artboard
  const scaleFactor = zoomLevel / 100;

  const startInteraction = (
    e: React.MouseEvent,
    item: CanvasItem,
    mode: NonNullable<typeof interaction>['mode']
  ) => {
    e.stopPropagation();
    setContextMenu(null);

    // Paint Roller Copy Style click
    if (copiedStyle) {
      handleApplyCopiedStyle(item);
      return;
    }

    let nextSelectedIds: string[];
    if (e.shiftKey) {
      nextSelectedIds = selectedIds.includes(item.id)
        ? selectedIds.filter((id) => id !== item.id)
        : [...selectedIds, item.id];
      setSelectedIds(nextSelectedIds);
      return;
    } else if (selectedIds.includes(item.id) && selectedIds.length > 1) {
      nextSelectedIds = selectedIds;
    } else if (item.groupId) {
      nextSelectedIds = items.filter((it) => it.groupId === item.groupId).map((it) => it.id);
      setSelectedIds(nextSelectedIds);
    } else {
      nextSelectedIds = [item.id];
      setSelectedIds(nextSelectedIds);
    }

    if (item.isLocked) return;

    const origGroupItems: Record<string, { x: number; y: number }> = {};
    items.forEach((it) => {
      if (nextSelectedIds.includes(it.id) && !it.isLocked) {
        origGroupItems[it.id] = { x: it.x, y: it.y };
      }
    });

    setInteraction({
      mode,
      itemId: item.id,
      startX: e.clientX,
      startY: e.clientY,
      origItem: deepClone(item),
      origGroupItems,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Marquee selection drag
    if (marquee && artboardRef.current) {
      const rect = artboardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scaleFactor;
      const y = (e.clientY - rect.top) / scaleFactor;
      setMarquee((prev) => (prev ? { ...prev, curX: x, curY: y } : null));
      return;
    }

    // Drawing stroke
    if (isDrawingStroke && activeRailTab === 'draw' && artboardRef.current) {
      const rect = artboardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scaleFactor;
      const y = (e.clientY - rect.top) / scaleFactor;

      if (drawTool === 'eraser') {
        const eraseRadius = Math.max(12, drawWidth * 1.5);
        updateActivePage(
          (p) => ({
            ...p,
            strokes: p.strokes.filter(
              (s) => !s.points.some((pt) => Math.hypot(pt.x - x, pt.y - y) < eraseRadius)
            ),
          }),
          false
        );
      } else {
        setActiveStrokePoints((prev) => [...prev, { x, y }]);
      }
      return;
    }

    if (!interaction) return;
    const dx = (e.clientX - interaction.startX) / scaleFactor;
    const dy = (e.clientY - interaction.startY) / scaleFactor;
    const orig = interaction.origItem;
    const origW = orig.width || 220;
    const origH = orig.height || 50;

    if (interaction.mode === 'drag') {
      let nextX = Math.round(orig.x + dx);
      let nextY = Math.round(orig.y + dy);

      // Smart snap guides to canvas center, 28px print margins, and sibling element edges/centers
      const guides: { x?: number; y?: number } = {};
      const canvasCenterX = baseArtboardSize.width / 2;
      const canvasCenterY = baseArtboardSize.height / 2;
      const margin = 28;

      const xTargets: Array<{ target: number; guide: number }> = [
        { target: canvasCenterX - origW / 2, guide: canvasCenterX },
        { target: margin, guide: margin },
        { target: baseArtboardSize.width - margin - origW, guide: baseArtboardSize.width - margin },
      ];
      const yTargets: Array<{ target: number; guide: number }> = [
        { target: canvasCenterY - origH / 2, guide: canvasCenterY },
        { target: margin, guide: margin },
        { target: baseArtboardSize.height - margin - origH, guide: baseArtboardSize.height - margin },
      ];

      items.forEach((other) => {
        if (other.id === orig.id || other.isHidden || selectedIds.includes(other.id)) return;
        const ow = other.width || 220;
        const oh = other.height || 50;
        xTargets.push(
          { target: other.x, guide: other.x },
          { target: other.x + ow / 2 - origW / 2, guide: other.x + ow / 2 },
          { target: other.x + ow - origW, guide: other.x + ow }
        );
        yTargets.push(
          { target: other.y, guide: other.y },
          { target: other.y + oh / 2 - origH / 2, guide: other.y + oh / 2 },
          { target: other.y + oh - origH, guide: other.y + oh }
        );
      });

      let bestDx = 6;
      for (const xt of xTargets) {
        const d = Math.abs(nextX - xt.target);
        if (d < bestDx) {
          bestDx = d;
          nextX = Math.round(xt.target);
          guides.x = xt.guide;
        }
      }
      let bestDy = 6;
      for (const yt of yTargets) {
        const d = Math.abs(nextY - yt.target);
        if (d < bestDy) {
          bestDy = d;
          nextY = Math.round(yt.target);
          guides.y = yt.guide;
        }
      }

      const appliedDx = nextX - orig.x;
      const appliedDy = nextY - orig.y;
      setSnapGuides(guides);

      const groupCoords = interaction.origGroupItems;
      if (groupCoords && Object.keys(groupCoords).length > 1) {
        updateActivePage(
          (p) => ({
            ...p,
            items: p.items.map((it) =>
              groupCoords[it.id]
                ? { ...it, x: groupCoords[it.id].x + appliedDx, y: groupCoords[it.id].y + appliedDy }
                : it
            ),
          }),
          false
        );
      } else {
        updateItemById(interaction.itemId, { x: nextX, y: nextY }, false);
      }
    } else if (interaction.mode === 'rotate') {
      if (!artboardRef.current) return;
      const rect = artboardRef.current.getBoundingClientRect();
      const cx = rect.left + (orig.x + origW / 2) * scaleFactor;
      const cy = rect.top + (orig.y + origH / 2) * scaleFactor;
      let deg = Math.round((Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI - 90);
      if (e.shiftKey) deg = Math.round(deg / 15) * 15;
      updateItemById(interaction.itemId, { rotation: ((deg % 360) + 360) % 360 }, false);
    } else {
      let newX = orig.x;
      let newY = orig.y;
      let newW = origW;
      let newH = origH;

      if (interaction.mode.includes('e')) newW = Math.max(24, Math.round(origW + dx));
      if (interaction.mode.includes('s')) newH = Math.max(12, Math.round(origH + dy));
      if (interaction.mode.includes('w')) {
        const clampedDx = Math.min(dx, origW - 24);
        newX = Math.round(orig.x + clampedDx);
        newW = Math.round(origW - clampedDx);
      }
      if (interaction.mode.includes('n')) {
        const clampedDy = Math.min(dy, origH - 20);
        newY = Math.round(orig.y + clampedDy);
        newH = Math.round(origH - clampedDy);
      }

      const patch: Partial<CanvasItem> = { x: newX, y: newY, width: newW, height: newH };
      if (orig.type === 'sticker' || (orig.type === 'text' && interaction.mode === 'resize-se')) {
        const ratio = newW / origW;
        if (orig.fontSize) {
          patch.fontSize = Math.max(10, Math.min(140, Math.round(orig.fontSize * ratio)));
        }
      }
      updateItemById(interaction.itemId, patch, false);
    }
  };

  const handleCanvasMouseUp = () => {
    if (marquee) {
      const x1 = Math.min(marquee.startX, marquee.curX);
      const y1 = Math.min(marquee.startY, marquee.curY);
      const x2 = Math.max(marquee.startX, marquee.curX);
      const y2 = Math.max(marquee.startY, marquee.curY);
      if (x2 - x1 > 6 || y2 - y1 > 6) {
        const hits = items
          .filter((it) => {
            if (it.isHidden || it.isLocked) return false;
            const iw = it.width || 220;
            const ih = it.height || 50;
            return it.x < x2 && it.x + iw > x1 && it.y < y2 && it.y + ih > y1;
          })
          .map((it) => it.id);
        setSelectedIds(hits);
      }
      setMarquee(null);
    }

    if (isDrawingStroke) {
      setIsDrawingStroke(false);
      if (drawTool !== 'eraser' && activeStrokePoints.length > 1) {
        const newStroke: DrawStroke = {
          id: `stroke-${Date.now()}`,
          tool: drawTool,
          color: drawColor,
          width: drawTool === 'highlighter' ? drawWidth * 2.5 : drawTool === 'marker' ? drawWidth * 1.6 : drawWidth,
          opacity: drawTool === 'highlighter' ? 0.42 : 1,
          points: activeStrokePoints,
        };
        updateActivePage((p) => ({ ...p, strokes: [...p.strokes, newStroke] }), true);
      }
      setActiveStrokePoints([]);
    }

    if (interaction) {
      setInteraction(null);
      setSnapGuides({});
      commitSnapshot(pages);
    }
  };

  // Artboard Draw or Marquee Start
  const handleArtboardMouseDown = (e: React.MouseEvent) => {
    setContextMenu(null);
    setActivePopover(null);
    if (!artboardRef.current) return;
    const rect = artboardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scaleFactor;
    const y = (e.clientY - rect.top) / scaleFactor;

    if (activeRailTab === 'draw') {
      e.stopPropagation();
      setIsDrawingStroke(true);
      setActiveStrokePoints([{ x, y }]);
      setSelectedId(null);
      return;
    }

    setSelectedId(null);
    setEditingItemId(null);
    setMarquee({ startX: x, startY: y, curX: x, curY: y });
  };

  // Sidebar Drag Helpers
  const getDragBoxSize = useCallback((payload: SidebarDragPayload): { width: number; height: number; label: string; isTemplate?: boolean } => {
    switch (payload.kind) {
      case 'shape': {
        const isLine = payload.shapeKind === 'line' || payload.shapeKind === 'dashed-line';
        return {
          width: payload.shapeKind === 'circle' ? 120 : payload.shapeKind === 'pill' ? 180 : isLine ? 200 : 140,
          height: payload.shapeKind === 'circle' ? 120 : payload.shapeKind === 'pill' ? 46 : isLine ? 12 : 110,
          label: payload.label,
        };
      }
      case 'sticker':
        return { width: 72, height: 72, label: `Sticker ${payload.emoji}` };
      case 'text':
        return { width: 300, height: payload.textRole === 'heading' ? 56 : 38, label: payload.label };
      case 'font_pairing':
        return { width: 380, height: 110, label: payload.label };
      case 'badge':
        return { width: 140, height: 34, label: payload.badge.label };
      case 'chart':
        return { width: 280, height: 180, label: payload.label };
      case 'qrcode':
        return { width: 140, height: 140, label: 'QR Code' };
      case 'image':
        return { width: payload.magicCutout ? 180 : 240, height: 180, label: payload.name };
      case 'template':
        return { width: baseArtboardSize.width, height: baseArtboardSize.height, label: `Template: ${payload.title}`, isTemplate: true };
    }
  }, [baseArtboardSize.height, baseArtboardSize.width]);

  const startSidebarDrag = (e: React.DragEvent, payload: SidebarDragPayload) => {
    activeSidebarDragRef.current = payload;
    setActiveSidebarDrag(payload);
    e.dataTransfer.effectAllowed = 'copy';
    try {
      e.dataTransfer.setData('application/canva-drag-payload', JSON.stringify(payload));
      e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    } catch {}
  };

  const endSidebarDrag = () => {
    activeSidebarDragRef.current = null;
    setActiveSidebarDrag(null);
    setDropPreview(null);
  };

  // Element Creators (Support both Click-to-Center and Drag-to-Drop Coordinates)
  const handleAddText = (type: 'heading' | 'subheading' | 'body', coords?: { x: number; y: number }) => {
    const w = 300;
    const h = type === 'heading' ? 54 : type === 'subheading' ? 36 : 28;
    const pos = coords
      ? computeArtboardDropPosition(coords.x, coords.y, w, h, baseArtboardSize.width, baseArtboardSize.height)
      : { x: Math.round(baseArtboardSize.width / 2 - 150), y: 120 + (items.length % 6) * 24 };
    const newItem: CanvasItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      content:
        type === 'heading'
          ? 'Add a heading'
          : type === 'subheading'
          ? 'Add a subheading'
          : 'Add a little bit of body text',
      x: pos.x,
      y: pos.y,
      width: w,
      fontSize: type === 'heading' ? 36 : type === 'subheading' ? 22 : 14,
      fontFamily: type === 'heading' ? 'Outfit, sans-serif' : 'Plus Jakarta Sans, sans-serif',
      fontWeight: type === 'heading' ? '800' : type === 'subheading' ? '600' : '400',
      color: activePage.backgroundColor === '#090a16' || activePage.backgroundColor === '#18181b' ? '#ffffff' : '#1e1b4b',
      textAlign: 'center',
    };
    updateActivePage((p) => ({ ...p, items: [...p.items, newItem] }), true);
    setSelectedId(newItem.id);
  };

  const handleAddFontPairing = (pair: (typeof FONT_PAIRINGS)[number], coords?: { x: number; y: number }) => {
    const t = Date.now();
    const headPos = coords
      ? computeArtboardDropPosition(coords.x, coords.y - 24, 400, 60, baseArtboardSize.width, baseArtboardSize.height)
      : { x: 70, y: 150 };
    const head: CanvasItem = {
      id: `pair-h-${t}`,
      type: 'text',
      content: pair.heading,
      x: headPos.x,
      y: headPos.y,
      width: 400,
      fontSize: 42,
      fontFamily: pair.headingFont,
      fontWeight: '800',
      color: pair.headingColor,
      textAlign: 'center',
    };
    const sub: CanvasItem = {
      id: `pair-s-${t}`,
      type: 'text',
      content: pair.sub,
      x: Math.min(baseArtboardSize.width - 360, Math.max(0, headPos.x + 20)),
      y: Math.min(baseArtboardSize.height - 36, headPos.y + 65),
      width: 360,
      fontSize: 15,
      fontFamily: pair.subFont,
      fontWeight: '600',
      color: pair.subColor,
      textAlign: 'center',
      letterSpacing: 1.5,
    };
    updateActivePage((p) => ({ ...p, items: [...p.items, head, sub] }), true);
    setSelectedId(head.id);
  };

  const handleAddSticker = (emoji: string, coords?: { x: number; y: number }) => {
    const pos = coords
      ? computeArtboardDropPosition(coords.x, coords.y, 72, 72, baseArtboardSize.width, baseArtboardSize.height)
      : {
          x: Math.round(baseArtboardSize.width / 2 - 30) + Math.floor(Math.random() * 30 - 15),
          y: Math.round(baseArtboardSize.height / 2 - 30) + Math.floor(Math.random() * 30 - 15),
        };
    const newItem: CanvasItem = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      content: emoji,
      x: pos.x,
      y: pos.y,
      width: 72,
      height: 72,
      fontSize: 54,
      color: '#ffffff',
    };
    updateActivePage((p) => ({ ...p, items: [...p.items, newItem] }), true);
    setSelectedId(newItem.id);
  };

  const handleAddShape = (kind: ShapeKind, coords?: { x: number; y: number }) => {
    const isLine = kind === 'line' || kind === 'dashed-line';
    const w = kind === 'circle' ? 120 : kind === 'pill' ? 180 : isLine ? 200 : 140;
    const h = kind === 'circle' ? 120 : kind === 'pill' ? 46 : isLine ? 4 : 110;
    const pos = coords
      ? computeArtboardDropPosition(coords.x, coords.y, w, h, baseArtboardSize.width, baseArtboardSize.height)
      : {
          x: Math.round(baseArtboardSize.width / 2 - (isLine ? 100 : 70)),
          y: Math.round(baseArtboardSize.height / 2 - (isLine ? 4 : 55)),
        };
    const newItem: CanvasItem = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeKind: kind,
      content: kind === 'pill' ? 'Button Label' : '',
      x: pos.x,
      y: pos.y,
      width: w,
      height: h,
      borderRadius: kind === 'circle' || kind === 'pill' ? 9999 : 12,
      bgColor: '#7d2ae8',
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    };
    updateActivePage((p) => ({ ...p, items: [...p.items, newItem] }), true);
    setSelectedId(newItem.id);
  };

  const handleAddBadge = (badge: { label: string; color: string; bg: string }, coords?: { x: number; y: number }) => {
    const pos = coords
      ? computeArtboardDropPosition(coords.x, coords.y, 140, 34, baseArtboardSize.width, baseArtboardSize.height)
      : { x: 180, y: 200 };
    const newItem: CanvasItem = {
      id: `badge-${Date.now()}`,
      type: 'badge',
      content: badge.label,
      x: pos.x,
      y: pos.y,
      width: 140,
      height: 34,
      fontSize: 10,
      fontWeight: 'bold',
      color: badge.color,
      bgColor: badge.bg,
      borderColor: badge.color,
      borderWidth: 1.5,
      borderRadius: 9999,
      textAlign: 'center',
    };
    updateActivePage((p) => ({ ...p, items: [...p.items, newItem] }), true);
    setSelectedId(newItem.id);
  };

  const handleAddImageToCanvas = (
    url: string,
    name: string,
    opts?: { x?: number; y?: number; borderRadius?: number; magicCutout?: boolean }
  ) => {
    const w = opts?.magicCutout ? 180 : 240;
    const h = 180;
    const pos =
      opts?.x !== undefined && opts?.y !== undefined
        ? computeArtboardDropPosition(opts.x, opts.y, w, h, baseArtboardSize.width, baseArtboardSize.height)
        : { x: Math.round(baseArtboardSize.width / 2 - w / 2), y: Math.round(baseArtboardSize.height / 2 - h / 2) };
    const newItem: CanvasItem = {
      id: `img-${Date.now()}`,
      type: 'image',
      content: name,
      imageUrl: url,
      x: pos.x,
      y: pos.y,
      width: w,
      height: h,
      borderRadius: opts?.borderRadius ?? 12,
      magicCutout: opts?.magicCutout,
      color: '#ffffff',
      imageFilters: { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0 },
    };
    updateActivePage((p) => ({ ...p, items: [...p.items, newItem] }), true);
    setSelectedId(newItem.id);
  };

  const handleAddQrCode = (url = 'https://canva.com', coords?: { x: number; y: number }) => {
    const pos = coords
      ? computeArtboardDropPosition(coords.x, coords.y, 140, 140, baseArtboardSize.width, baseArtboardSize.height)
      : { x: Math.round(baseArtboardSize.width / 2 - 70), y: Math.round(baseArtboardSize.height / 2 - 70) };
    const newItem: CanvasItem = {
      id: `qr-${Date.now()}`,
      type: 'qrcode',
      content: url,
      qrValue: url,
      x: pos.x,
      y: pos.y,
      width: 140,
      height: 140,
      color: '#1e1b4b',
      bgColor: '#ffffff',
      borderRadius: 12,
    };
    updateActivePage((p) => ({ ...p, items: [...p.items, newItem] }), true);
    setSelectedId(newItem.id);
    setActivePopover('qr');
  };

  const handleAddChart = (kind: 'bar' | 'donut', coords?: { x: number; y: number }) => {
    const pos = coords
      ? computeArtboardDropPosition(coords.x, coords.y, 280, 180, baseArtboardSize.width, baseArtboardSize.height)
      : { x: Math.round(baseArtboardSize.width / 2 - 140), y: Math.round(baseArtboardSize.height / 2 - 90) };
    const newItem: CanvasItem = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      chartKind: kind,
      content: kind === 'bar' ? 'Quarterly Growth' : 'Traffic Breakdown',
      chartData: deepClone(DEFAULT_CHART_DATA),
      x: pos.x,
      y: pos.y,
      width: 280,
      height: 180,
      color: '#1e1b4b',
      bgColor: '#ffffff',
      borderRadius: 14,
    };
    updateActivePage((p) => ({ ...p, items: [...p.items, newItem] }), true);
    setSelectedId(newItem.id);
    setActivePopover('chart');
  };

  const handleUploadFiles = (files: FileList | null, dropCoords?: { x: number; y: number }) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        const asset: UploadedAsset = {
          id: `up-${Date.now()}-${Math.random()}`,
          name: file.name,
          url: dataUrl,
          addedAt: 'Just now',
        };
        setUploadedAssets((prev) => [asset, ...prev]);
        handleAddImageToCanvas(dataUrl, file.name, dropCoords);
        showToast(`Uploaded "${file.name}"`);
      };
      reader.readAsDataURL(file);
    });
  };

  // Templates & Brand Kits
  const handleLoadTemplate = (
    tpl: (typeof TEMPLATES_CATALOG)[number],
    mode: 'replace' | 'new-page' = templateApplyMode
  ) => {
    if (mode === 'new-page') {
      const nextPage: CanvaPage = {
        id: `page-${Date.now()}`,
        title: tpl.title,
        backgroundColor: tpl.canvasBg,
        backgroundGradient: tpl.canvasGradient,
        strokes: [],
        notes: '',
        items: deepClone(tpl.items).map((it: CanvasItem, idx: number) => ({
          ...it,
          id: `${it.id}-${Date.now()}-${idx}`,
        })),
      };
      const nextPages = [...pages, nextPage];
      setPages(nextPages);
      setActivePageIndex(nextPages.length - 1);
      setSelectedId(nextPage.items[0]?.id || null);
      commitSnapshot(nextPages, nextPages.length - 1);
      showToast(`Added "${tpl.title}" as Page ${nextPages.length}`);
      return;
    }

    setDocTitle(`${tpl.title} - ${dimensions.width} × ${dimensions.height} px`);
    updateActivePage(
      (p) => ({
        ...p,
        title: tpl.title,
        backgroundColor: tpl.canvasBg,
        backgroundGradient: tpl.canvasGradient,
        items: deepClone(tpl.items),
      }),
      true
    );
    setSelectedId(tpl.items[0]?.id || null);
    showToast(`Applied template "${tpl.title}"`);
  };

  const handleApplyBrandKit = (kit: (typeof BRAND_KITS)[number]) => {
    updateActivePage(
      (p) => ({
        ...p,
        backgroundColor: kit.bgColor,
        backgroundGradient: undefined,
        items: p.items.map((item, idx) => {
          if (item.type === 'text') {
            return {
              ...item,
              fontFamily: idx === 0 ? kit.headingFont : item.fontFamily,
              color: kit.colors[idx % 3],
            };
          }
          if (item.type === 'shape' || item.type === 'badge') {
            return {
              ...item,
              bgColor: kit.colors[idx % 2],
            };
          }
          return item;
        }),
      }),
      true
    );
    showToast(`Applied Brand Kit "${kit.name}"`);
  };

  // Resize & Magic Switch
  const handleResizeDocument = (nextW: number, nextH: number, label: string) => {
    const prevBase = baseArtboardSize;
    const ratio = nextW / nextH;
    const maxBox = 540;
    const nextBase = ratio >= 1 ? { width: maxBox, height: Math.round(maxBox / ratio) } : { width: Math.round(maxBox * ratio), height: maxBox };
    const sx = nextBase.width / prevBase.width;
    const sy = nextBase.height / prevBase.height;
    const avgScale = (sx + sy) / 2;

    const scaledPages = pages.map((p) => ({
      ...p,
      items: p.items.map((item) => ({
        ...item,
        x: Math.round(item.x * sx),
        y: Math.round(item.y * sy),
        width: item.width ? Math.round(item.width * sx) : undefined,
        height: item.height ? Math.round(item.height * sy) : undefined,
        fontSize: item.fontSize ? Math.max(9, Math.round(item.fontSize * avgScale)) : undefined,
      })),
      strokes: p.strokes.map((s) => ({
        ...s,
        width: Math.max(1, Math.round(s.width * avgScale)),
        points: s.points.map((pt) => ({
          x: Math.round(pt.x * sx),
          y: Math.round(pt.y * sy),
        })),
      })),
    }));

    const nextDims: DocDimensions = { width: nextW, height: nextH, label };
    setDimensions(nextDims);
    setPages(scaledPages);
    commitSnapshot(scaledPages, activePageIndex, nextDims);
    setIsResizeModalOpen(false);
    showToast(`Resized design to ${nextW} × ${nextH} px`);
  };

  const handleMagicCopySwitch = (mode: 'uppercase' | 'titlecase' | 'concise') => {
    updateActivePage(
      (p) => ({
        ...p,
        items: p.items.map((it) => {
          if (it.type !== 'text' && it.type !== 'badge') return it;
          let txt = it.content || '';
          if (mode === 'uppercase') txt = txt.toUpperCase();
          if (mode === 'titlecase') {
            txt = txt.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          }
          if (mode === 'concise') {
            const words = txt.split(/\s+/);
            if (words.length > 6) txt = `${words.slice(0, 5).join(' ')}!`;
          }
          return { ...it, content: txt };
        }),
      }),
      true
    );
    showToast(`Magic Switch applied (${mode})`);
  };

  // Multi-page operations
  const handleAddPage = () => {
    const nextNum = pages.length + 1;
    const blankPage: CanvaPage = {
      id: `page-${Date.now()}`,
      title: `Page ${nextNum}`,
      backgroundColor: '#ffffff',
      strokes: [],
      notes: '',
      items: [
        {
          id: `p${nextNum}-h-${Date.now()}`,
          type: 'text',
          content: `Page ${nextNum} Heading`,
          x: Math.round(baseArtboardSize.width / 2 - 180),
          y: Math.round(baseArtboardSize.height / 2 - 50),
          width: 360,
          fontSize: 32,
          fontFamily: 'Outfit, sans-serif',
          fontWeight: '800',
          color: '#1e1b4b',
          textAlign: 'center',
        },
        {
          id: `p${nextNum}-sub-${Date.now()}`,
          type: 'text',
          content: 'Click here or choose templates on the left to customize this page',
          x: Math.round(baseArtboardSize.width / 2 - 190),
          y: Math.round(baseArtboardSize.height / 2 + 10),
          width: 380,
          fontSize: 14,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontWeight: '500',
          color: '#64748b',
          textAlign: 'center',
        },
      ],
    };
    const nextPages = [...pages, blankPage];
    setPages(nextPages);
    setActivePageIndex(nextPages.length - 1);
    setSelectedId(null);
    commitSnapshot(nextPages, nextPages.length - 1);
  };

  const handleDuplicatePage = (idx: number) => {
    const copy = deepClone(pages[idx]);
    copy.id = `page-${Date.now()}`;
    copy.title = `${copy.title || `Page ${idx + 1}`} (Copy)`;
    const nextPages = [...pages];
    nextPages.splice(idx + 1, 0, copy);
    setPages(nextPages);
    setActivePageIndex(idx + 1);
    commitSnapshot(nextPages, idx + 1);
    showToast(`Duplicated Page ${idx + 1}`);
  };

  const handleDeletePage = (idx: number) => {
    if (pages.length <= 1) {
      // Clear page cleanly
      const reset: CanvaPage = {
        id: pages[0].id,
        title: 'Page 1',
        backgroundColor: '#ffffff',
        strokes: [],
        notes: '',
        items: [],
      };
      setPages([reset]);
      setSelectedId(null);
      commitSnapshot([reset], 0);
      return;
    }
    const nextPages = pages.filter((_, i) => i !== idx);
    const nextIdx = Math.min(activePageIndex, nextPages.length - 1);
    setPages(nextPages);
    setActivePageIndex(nextIdx);
    setSelectedId(null);
    commitSnapshot(nextPages, nextIdx);
  };

  const handleMovePage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= pages.length) return;
    const nextPages = [...pages];
    const [moved] = nextPages.splice(idx, 1);
    nextPages.splice(target, 0, moved);
    setPages(nextPages);
    setActivePageIndex(target);
    commitSnapshot(nextPages, target);
  };

  // Real Client-Side Export (PNG, JPG, SVG, PDF, JSON)
  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const safeName = (docTitle || 'canva_design').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    try {
      if (downloadFormat === 'JSON') {
        const schemaDoc = {
          schema: 'https://canva.com/schemas/document/v3.json',
          title: docTitle,
          dimensions,
          pages,
        };
        triggerBlobDownload(
          new Blob([JSON.stringify(schemaDoc, null, 2)], { type: 'application/json' }),
          `${safeName}.json`
        );
      } else if (downloadFormat === 'SVG') {
        const svgStr = generateSvgExport(
          activePage,
          dimensions,
          baseArtboardSize.width,
          baseArtboardSize.height,
          transparentBg
        );
        triggerBlobDownload(new Blob([svgStr], { type: 'image/svg+xml' }), `${safeName}.svg`);
      } else if (downloadFormat === 'PDF') {
        const targetPages = exportAllPages ? pages : [activePage];
        const rendered = await Promise.all(
          targetPages.map((pg) =>
            renderPageToCanvas(pg, dimensions, baseArtboardSize.width, baseArtboardSize.height, exportScale, false)
          )
        );
        const pdfBlob = buildPdfFromJpegCanvases(rendered);
        triggerBlobDownload(pdfBlob, `${safeName}.pdf`);
      } else {
        const canvas = await renderPageToCanvas(
          activePage,
          dimensions,
          baseArtboardSize.width,
          baseArtboardSize.height,
          exportScale,
          downloadFormat === 'PNG' && transparentBg
        );
        const mime = downloadFormat === 'JPG' ? 'image/jpeg' : 'image/png';
        const ext = downloadFormat === 'JPG' ? 'jpg' : 'png';
        await new Promise<void>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) triggerBlobDownload(blob, `${safeName}.${ext}`);
              resolve();
            },
            mime,
            0.94
          );
        });
      }

      setIsShareModalOpen(false);
      showToast(`Exported ${safeName}.${downloadFormat.toLowerCase()} cleanly!`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImportJsonFile = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
          setDocTitle(parsed.title || 'Imported Canva Design');
          if (parsed.dimensions) setDimensions(parsed.dimensions);
          setPages(parsed.pages);
          setActivePageIndex(0);
          commitSnapshot(parsed.pages, 0, parsed.dimensions || dimensions);
          showToast('Imported CanvaDocV3 JSON successfully!');
        }
      } catch {
        showToast('Invalid design JSON file');
      }
    };
    reader.readAsText(files[0]);
  };

  const handleFitZoom = useCallback(() => {
    if (!viewportRef.current) {
      setZoomLevel(100);
      return;
    }
    const availW = Math.max(200, viewportRef.current.clientWidth - 72);
    const availH = Math.max(200, viewportRef.current.clientHeight - 88);
    const ratio = Math.min(availW / baseArtboardSize.width, availH / baseArtboardSize.height);
    const pct = Math.max(40, Math.min(180, Math.round((ratio * 100) / 5) * 5));
    setZoomLevel(pct);
  }, [baseArtboardSize.height, baseArtboardSize.width]);

  const handleDistributeHorizontal = useCallback(() => {
    if (selectedIds.length < 3) return;
    const selectedOrdered = items
      .filter((i) => selectedIds.includes(i.id) && !i.isLocked)
      .sort((a, b) => a.x - b.x);
    if (selectedOrdered.length < 3) return;
    const minX = selectedOrdered[0].x;
    const last = selectedOrdered[selectedOrdered.length - 1];
    const maxRight = last.x + (last.width || 120);
    const totalW = selectedOrdered.reduce((s, it) => s + (it.width || 120), 0);
    const gap = (maxRight - minX - totalW) / (selectedOrdered.length - 1);
    let cursor = minX;
    const nextCoords: Record<string, number> = {};
    selectedOrdered.forEach((it) => {
      nextCoords[it.id] = Math.round(cursor);
      cursor += (it.width || 120) + gap;
    });
    updateActivePage(
      (p) => ({
        ...p,
        items: p.items.map((it) => (nextCoords[it.id] !== undefined ? { ...it, x: nextCoords[it.id] } : it)),
      }),
      true
    );
    showToast('Tidied horizontal spacing');
  }, [items, selectedIds, showToast, updateActivePage]);

  const handleCopyReactCode = () => {
    const strokesBlock =
      activePage.strokes.length > 0
        ? `\n        <svg viewBox="0 0 ${baseArtboardSize.width} ${baseArtboardSize.height}" className="absolute inset-0 w-full h-full pointer-events-none">\n          ${activePage.strokes
            .filter((s) => s.points.length >= 2)
            .map(
              (s) =>
                `<path d="${s.points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')}" fill="none" stroke="${s.color}" strokeWidth={${s.width}} strokeOpacity={${s.opacity}} strokeLinecap="round" />`
            )
            .join('\n          ')}\n        </svg>`
        : '';

    const code = `// Canva Design Component (Standalone React + Tailwind)
import React from 'react';

export default function MyCanvaDesign() {
  return (
    <div className="flex items-center justify-center p-8 bg-slate-100 min-h-screen">
      <div
        className="relative rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        style={{ width: '${baseArtboardSize.width}px', height: '${baseArtboardSize.height}px', background: '${activePage.backgroundGradient || activePage.backgroundColor}' }}
      >
        ${items
          .filter((i) => !i.isHidden)
          .map((i) => {
            if (i.type === 'image' && i.imageUrl) {
              return `<img src="${i.imageUrl}" alt="${i.content || 'Design image'}" style={{ position: 'absolute', left: '${i.x}px', top: '${i.y}px', width: '${i.width || 240}px', height: '${i.height || 180}px', objectFit: 'cover', borderRadius: '${i.magicCutout ? 9999 : i.borderRadius ?? 0}px', opacity: ${i.opacity ?? 1} }} />`;
            }
            if (i.type === 'sticker') {
              return `<div style={{ position: 'absolute', left: '${i.x}px', top: '${i.y}px', width: '${i.width || 72}px', height: '${i.height || 72}px', fontSize: '${i.fontSize || 48}px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ${i.opacity ?? 1} }}>
          ${i.content}
        </div>`;
            }
            if (i.type === 'qrcode') {
              return `<div style={{ position: 'absolute', left: '${i.x}px', top: '${i.y}px', width: '${i.width || 140}px', height: '${i.height || 140}px', backgroundColor: '${i.bgColor || '#ffffff'}', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '${i.color || '#1e1b4b'}' }}>
          QR: ${i.qrValue || i.content}
        </div>`;
            }
            if (i.type === 'chart') {
              return `<div style={{ position: 'absolute', left: '${i.x}px', top: '${i.y}px', width: '${i.width || 280}px', height: '${i.height || 180}px', backgroundColor: '${i.bgColor || '#ffffff'}', borderRadius: '14px', padding: '12px', color: '${i.color || '#1e1b4b'}', fontWeight: 'bold' }}>
          ${i.content || 'Chart Widget'}
        </div>`;
            }
            if (i.type === 'badge' || i.type === 'shape') {
              return `<div style={{ position: 'absolute', left: '${i.x}px', top: '${i.y}px', width: '${i.width || 140}px', height: '${i.height || 100}px', background: '${i.bgGradient || i.bgColor || '#7d2ae8'}', borderRadius: '${i.borderRadius ?? 12}px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '${i.color || '#ffffff'}', fontWeight: '${i.fontWeight || 'bold'}', opacity: ${i.opacity ?? 1} }}>
          ${i.content}
        </div>`;
            }
            return `<div style={{ position: 'absolute', left: '${i.x}px', top: '${i.y}px', width: '${i.width || 300}px', fontSize: '${i.fontSize || 24}px', color: '${i.color}', fontWeight: '${i.fontWeight || 'normal'}', textAlign: '${i.textAlign || 'center'}', opacity: ${i.opacity ?? 1} }}>
          ${formatDisplayText(i)}
        </div>`;
          })
          .join('\n        ')}${strokesBlock}
      </div>
    </div>
  );
}`;
    navigator.clipboard.writeText(code);
    setCopiedReactCode(true);
    setTimeout(() => setCopiedReactCode(false), 2000);
  };

  const pinterestTemplates: CanvaTemplate[] = useMemo(
    () =>
      pinterestPins
        .filter((pin) => selectedPinterestBoard === 'all' || pin.boardId === selectedPinterestBoard)
        .map((pin) =>
          convertPinterestPinToTemplate(
            pin,
            TEMPLATE_CATEGORIES.includes(pin.category as TemplateCategory)
              ? (pin.category as TemplateCategory)
              : undefined
          )
        ),
    [pinterestPins, selectedPinterestBoard]
  );

  const allAvailableTemplates = useMemo(
    () => [...TEMPLATES_CATALOG, ...pinterestTemplates],
    [pinterestTemplates]
  );

  // Filtered Templates & Elements
  const activeTemplatePool = templateSource === 'pinterest' ? pinterestTemplates : TEMPLATES_CATALOG;
  const filteredTemplates = activeTemplatePool.filter((tpl) => {
    const catOk = templateCategory === 'All' || tpl.category === templateCategory;
    const q = templateSearch.trim().toLowerCase();
    const searchOk =
      !q ||
      tpl.title.toLowerCase().includes(q) ||
      tpl.category.toLowerCase().includes(q) ||
      (tpl.sourceAuthor || '').toLowerCase().includes(q);
    return catOk && searchOk;
  });

  const filteredShapes = SHAPE_CATALOG.filter(
    (s) => !elementSearch.trim() || s.label.toLowerCase().includes(elementSearch.toLowerCase())
  );

  // Build CSS text effect style
  const getTextEffectStyle = (item: CanvasItem): React.CSSProperties => {
    switch (item.textEffect) {
      case 'shadow':
        return { textShadow: '3px 4px 8px rgba(0,0,0,0.35)' };
      case 'lift':
        return { textShadow: '0 6px 18px rgba(0,0,0,0.45)' };
      case 'hollow':
        return { WebkitTextStroke: `1.5px ${item.color}`, color: 'transparent' };
      case 'neon':
        return { textShadow: `0 0 8px ${item.color}, 0 0 20px ${item.color}` };
      case 'glitch':
        return { textShadow: '2px 0 #00c4cc, -2px 0 #ec4899' };
      case 'echo':
        return { textShadow: `3px 3px 0 ${item.color}55, 6px 6px 0 ${item.color}25` };
      case 'background':
        return {
          backgroundColor: item.bgColor || '#f5f3ff',
          padding: '4px 10px',
          borderRadius: '8px',
        };
      default:
        return {};
    }
  };

  const getAnimationClass = (anim?: AnimationType) => {
    switch (anim) {
      case 'fade':
        return 'animate-in fade-in duration-700';
      case 'rise':
        return 'animate-in slide-in-from-bottom-4 duration-700';
      case 'pop':
        return 'animate-in zoom-in-75 duration-500';
      case 'pan':
        return 'animate-in slide-in-from-left-4 duration-700';
      case 'bounce':
        return 'animate-bounce';
      case 'pulse':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  return (
    <div
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onClick={() => {
        setIsMoreMenuOpen(false);
        setIsFileMenuOpen(false);
        setIsTimerOpen(false);
        setContextMenu(null);
      }}
      className="flex-1 flex flex-col h-full bg-[#f3f4f7] text-slate-900 overflow-hidden select-none font-sans relative"
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUploadFiles(e.target.files)}
      />
      <input
        ref={jsonImportRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => handleImportJsonFile(e.target.files)}
      />

      {/* 1. AUTHENTIC CANVA GRADIENT TOP HEADER BAR (56px, matches canva.com/design/play) */}
      <header
        className="h-14 border-b border-white/15 px-3.5 flex items-center justify-between gap-3 shrink-0 z-30 text-white"
        style={{ background: 'linear-gradient(90deg, #00c4cc 0%, #5c33ff 52%, #7d2ae8 100%)' }}
      >
        {/* Left: Home, Wordmark, File Menu, Resize, Undo/Redo, Save Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setWorkspaceMode('canva_home')}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Canva Home"
          >
            <Home className="w-4 h-4" />
          </button>

          <button
            onClick={() => setWorkspaceMode('canva_home')}
            className="px-2 py-1 rounded-lg hover:bg-white/15 font-extrabold text-white text-lg tracking-tight font-display whitespace-nowrap cursor-pointer"
          >
            Canva
          </button>

          {/* FILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFileMenuOpen((v) => !v);
                setIsMoreMenuOpen(false);
              }}
              className="text-xs font-semibold text-white/95 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/15 transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <span>File</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isFileMenuOpen && (
              <div className="absolute left-0 top-10 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-800">
                <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-slate-900 truncate">
                  {docTitle}
                </div>
                <button
                  onClick={() => {
                    const blank: CanvaPage[] = [{ id: `p-${Date.now()}`, title: 'Page 1', backgroundColor: '#ffffff', strokes: [], notes: '', items: [] }];
                    setPages(blank);
                    setActivePageIndex(0);
                    setDocTitle('Untitled Design');
                    commitSnapshot(blank, 0);
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Create new blank design</span>
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    jsonImportRef.current?.click();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Import CanvaDocV3 JSON</span>
                  <FileJson className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    setDownloadFormat('JSON');
                    setIsShareModalOpen(true);
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Export JSON schema</span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setShowRulers((v) => !v);
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Show rulers & guides</span>
                  <span className="text-[10px] font-mono text-[#7d2ae8]">{showRulers ? 'ON' : 'Shift+R'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowMargins((v) => !v);
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Show print margins</span>
                  <span className="text-[10px] font-mono text-[#7d2ae8]">{showMargins ? 'ON' : 'OFF'}</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setIsShortcutsModalOpen(true);
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Keyboard shortcuts</span>
                  <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    const reset = deepClone(INITIAL_PAGES);
                    setPages(reset);
                    setActivePageIndex(0);
                    setDimensions({ width: 1080, height: 1080, label: 'Instagram Post (Square)' });
                    setDocTitle('Instagram Post - Summer Mega Sale');
                    commitSnapshot(reset, 0, { width: 1080, height: 1080, label: 'Instagram Post (Square)' });
                    setIsFileMenuOpen(false);
                    showToast('Reset to starter Canva template');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center justify-between cursor-pointer"
                >
                  <span>Reset to default design</span>
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* RESIZE & MAGIC SWITCH */}
          <button
            onClick={() => {
              setCustomW(String(dimensions.width));
              setCustomH(String(dimensions.height));
              setIsResizeModalOpen(true);
            }}
            className="text-xs font-semibold text-white/95 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/15 flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Resize</span>
          </button>

          <div className="h-4 w-[1px] bg-white/25 mx-0.5" />

          {/* REAL UNDO / REDO */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-white hover:bg-white/15 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-white hover:bg-white/15 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Cloud Save Indicator */}
          <div className="hidden xl:flex items-center gap-1 text-[11px] text-white/85 ml-1 whitespace-nowrap">
            <Check className={`w-3.5 h-3.5 ${saveState === 'saved' ? 'text-white' : 'text-amber-200 animate-spin'}`} />
            <span>{saveState === 'saved' ? 'Saved' : 'Saving...'}</span>
          </div>
        </div>

        {/* Center: Document Title */}
        <div className="flex items-center max-w-sm w-full justify-center">
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="w-full text-center bg-transparent hover:bg-white/15 focus:bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold text-white placeholder-white/60 border border-transparent focus:border-white/50 outline-none transition-colors"
          />
        </div>

        {/* Right: Present, White Share CTA, More menu */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPresentMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors whitespace-nowrap cursor-pointer"
            title="Present Slideshow Fullscreen"
          >
            <Play className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Present</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-700" />
            <span>Share</span>
          </button>

          {/* Subtle Overflow Menu for Developer / REA Utilities */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMoreMenuOpen((v) => !v);
                setIsFileMenuOpen(false);
              }}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-10 w-60 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-800"
              >
                <button
                  onClick={() => {
                    handleCopyReactCode();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>{copiedReactCode ? 'Copied React Code' : 'Copy React Code'}</span>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    setIsShortcutsModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Keyboard Shortcuts</span>
                  <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setWorkspaceMode('spec_tests');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Spec & Live Verification</span>
                  <FlaskConical className="w-3.5 h-3.5 text-[#7d2ae8]" />
                </button>
                <button
                  onClick={() => {
                    setIsDeepImproveModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>{isClone100PercentUpgraded ? 'REA 100% Assets Active' : 'REA Improve & Extract'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#7d2ae8]" />
                </button>
                <button
                  onClick={() => {
                    setWorkspaceMode('chat');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>Open REA Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE SPLIT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Leftmost Tool Rail (72px, Authentic Light Canva Rail matching canva.com/design/play) */}
        <div className="w-[72px] bg-[#f4f5f7] border-r border-slate-200 flex flex-col items-center py-2.5 gap-1 shrink-0 z-20">
          {[
            { id: 'design', label: 'Design', icon: Sparkles },
            { id: 'elements', label: 'Elements', icon: Shapes },
            { id: 'text', label: 'Text', icon: Type },
            { id: 'brand', label: 'Brand', icon: Crown },
            { id: 'uploads', label: 'Uploads', icon: FolderOpen },
            { id: 'draw', label: 'Draw', icon: PenTool },
            { id: 'layers', label: 'Layers', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeRailTab === tab.id && !isDrawerCollapsed;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (activeRailTab === tab.id && !isDrawerCollapsed) {
                    setIsDrawerCollapsed(true);
                  } else {
                    setActiveRailTab(tab.id as any);
                    setIsDrawerCollapsed(false);
                  }
                }}
                className={`w-14 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#7d2ae8] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#7d2ae8]' : 'text-slate-600'}`} />
                <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Collapsible White Side Drawer (344px, matches canva.com/design/play) */}
        {!isDrawerCollapsed && (
          <div className="w-[344px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 text-slate-900 relative">
            {/* Protruding Pill Collapse Handle (matches Canva.com) */}
            <button
              onClick={() => setIsDrawerCollapsed(true)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-14 bg-white border border-l-0 border-slate-200 rounded-r-lg shadow-sm flex items-center justify-center text-slate-500 hover:text-[#7d2ae8] z-30 cursor-pointer"
              title="Collapse side panel"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex-1 overflow-y-auto">
              {/* TAB 1: DESIGN / TEMPLATE LIBRARY */}
              {activeRailTab === 'design' && (
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-900">Template Library</div>
                    <span className="text-[11px] text-slate-500 tabular-nums">
                      {filteredTemplates.length} of {activeTemplatePool.length}
                    </span>
                  </div>

                  {/* Source Toggle: Canva Presets vs Pinterest Integration */}
                  <div className="p-1 bg-[#f4f5f7] rounded-lg grid grid-cols-2 gap-1 text-[11px] border border-slate-200">
                    <button
                      onClick={() => setTemplateSource('canva')}
                      className={`py-1.5 px-2 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        templateSource === 'canva'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Built-in ({TEMPLATES_CATALOG.length})
                    </button>
                    <button
                      onClick={() => setTemplateSource('pinterest')}
                      className={`py-1.5 px-2 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                        templateSource === 'pinterest'
                          ? 'bg-white text-[#e60023] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Pinterest</span>
                      {pinterestStatus.connected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Connected" />
                      )}
                    </button>
                  </div>

                  {/* Pinterest Connection & Pin Importer Card */}
                  {templateSource === 'pinterest' && (
                    <div className="p-3 rounded-xl bg-[#fff8f8] border border-rose-200/80 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#e60023]" />
                            <span>
                              {pinterestStatus.connected
                                ? `@${pinterestStatus.username}`
                                : 'Pinterest Boards & Pins'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {pinterestStatus.connected
                              ? 'Synced for all template categories'
                              : 'Connect OAuth or paste any public Pin URL'}
                          </div>
                        </div>

                        {pinterestStatus.connected ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => fetchPinterestBoardsAndPins(selectedPinterestBoard)}
                              disabled={pinterestLoading}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                              title="Sync Pinterest Boards"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${pinterestLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              onClick={handleDisconnectPinterest}
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 hover:text-rose-600 cursor-pointer whitespace-nowrap"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleConnectPinterest}
                            disabled={pinterestLoading}
                            className="px-2.5 py-1.5 rounded-lg bg-[#e60023] hover:bg-[#ad081b] text-white text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
                          >
                            {pinterestStatus.oauthConfigured ? 'Connect Pinterest' : 'Connect OAuth'}
                          </button>
                        )}
                      </div>

                      {pinterestStatus.connected && pinterestBoards.length > 0 && (
                        <select
                          value={selectedPinterestBoard}
                          onChange={(e) => {
                            setSelectedPinterestBoard(e.target.value);
                            fetchPinterestBoardsAndPins(e.target.value);
                          }}
                          className="w-full bg-white border border-rose-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 outline-none focus:border-[#e60023]"
                        >
                          <option value="all">All Pinterest Boards ({pinterestPins.length})</option>
                          {pinterestBoards.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.pinCount})
                            </option>
                          ))}
                        </select>
                      )}

                      <form onSubmit={handleImportPinterestUrl} className="flex items-center gap-1.5">
                        <input
                          type="url"
                          placeholder="Paste pinterest.com/pin/... URL"
                          value={pinterestUrlInput}
                          onChange={(e) => setPinterestUrlInput(e.target.value)}
                          className="flex-1 min-w-0 bg-white border border-rose-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 placeholder-slate-400 outline-none focus:border-[#e60023]"
                        />
                        <button
                          type="submit"
                          disabled={pinterestLoading || !pinterestUrlInput.trim()}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                        >
                          {pinterestLoading ? 'Importing...' : 'Import Pin'}
                        </button>
                      </form>

                      {pinterestError && (
                        <div className="p-2 rounded-lg bg-white border border-rose-300 text-[10px] text-rose-700 leading-snug">
                          {pinterestError}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder={
                        templateSource === 'pinterest'
                          ? 'Filter Pinterest templates or authors...'
                          : 'Search templates, styles, topics...'
                      }
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="w-full bg-[#f4f5f7] border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#7d2ae8] focus:bg-white"
                    />
                  </div>

                  {/* Canva Apply Mode Switch: Replace Active Page vs Add as New Page */}
                  <div className="p-1 bg-[#f4f5f7] rounded-lg grid grid-cols-2 gap-1 text-[11px] border border-slate-200">
                    <button
                      onClick={() => setTemplateApplyMode('replace')}
                      className={`py-1 px-2 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        templateApplyMode === 'replace'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Replace page
                    </button>
                    <button
                      onClick={() => setTemplateApplyMode('new-page')}
                      className={`py-1 px-2 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        templateApplyMode === 'new-page'
                          ? 'bg-white text-[#7d2ae8] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Add as new page
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {['All', ...TEMPLATE_CATEGORIES].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTemplateCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg border shrink-0 font-medium cursor-pointer transition-colors whitespace-nowrap ${
                          templateCategory === cat
                            ? 'bg-[#7d2ae8] border-[#7d2ae8] text-white'
                            : 'bg-[#f4f5f7] hover:bg-slate-200/70 border-slate-200 text-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {filteredTemplates.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#f8f9fb] border border-slate-200 text-center space-y-2">
                      <div className="text-xs font-semibold text-slate-700">
                        {templateSource === 'pinterest'
                          ? 'No Pinterest templates in this category yet'
                          : 'No matching templates'}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {templateSource === 'pinterest'
                          ? 'Select a category above and paste a Pinterest Pin URL (or connect your Pinterest boards) to convert any Pin into an editable multi-layer design.'
                          : 'Try another search term or reset your category filter.'}
                      </p>
                      {(templateSearch || templateCategory !== 'All') && (
                        <button
                          onClick={() => {
                            setTemplateSearch('');
                            setTemplateCategory('All');
                          }}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-[#7d2ae8] hover:border-[#7d2ae8] cursor-pointer"
                        >
                          Reset filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {filteredTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          draggable
                          onDragStart={(e) =>
                            startSidebarDrag(e, { kind: 'template', templateId: tpl.id, title: tpl.title })
                          }
                          onDragEnd={endSidebarDrag}
                          onClick={() => handleLoadTemplate(tpl)}
                          title={`Click to ${templateApplyMode === 'new-page' ? 'add as new page' : 'apply'} or drag onto canvas`}
                          className="group p-1.5 rounded-xl bg-[#f8f9fb] hover:border-[#7d2ae8] border border-slate-200 cursor-grab active:cursor-grabbing transition-all hover:shadow-xs relative"
                        >
                          <div
                            className={`h-24 rounded-lg bg-gradient-to-br ${tpl.previewBg} p-2.5 flex flex-col justify-between shadow-2xs relative overflow-hidden ${
                              tpl.previewDarkText ? 'text-stone-900' : 'text-white'
                            }`}
                          >
                            {tpl.previewImageUrl && (
                              <img
                                src={tpl.previewImageUrl}
                                alt={tpl.title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )}
                            {tpl.previewImageUrl && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                            )}
                            <span
                              className={`relative z-10 text-[9px] font-bold uppercase opacity-95 tracking-wide ${
                                tpl.previewImageUrl ? 'text-white' : ''
                              }`}
                            >
                              {tpl.previewBadge}
                            </span>
                            <div
                              className={`relative z-10 font-extrabold text-xs leading-tight line-clamp-2 ${
                                tpl.previewImageUrl ? 'text-white' : ''
                              }`}
                            >
                              {tpl.previewHeadline}
                            </div>

                            {/* Hover quick actions: Apply vs +Page */}
                            <div className="absolute inset-0 z-20 bg-slate-900/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLoadTemplate(tpl, 'replace');
                                }}
                                className="px-2 py-1 rounded-md bg-white text-slate-900 text-[10px] font-bold hover:bg-purple-50 cursor-pointer"
                              >
                                Apply
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLoadTemplate(tpl, 'new-page');
                                }}
                                className="px-2 py-1 rounded-md bg-[#7d2ae8] text-white text-[10px] font-bold hover:bg-[#6b21a8] cursor-pointer"
                                title="Insert as new page"
                              >
                                + Page
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-1 mt-1.5 px-0.5">
                            <span className="text-[11px] font-semibold text-slate-800 truncate">{tpl.title}</span>
                            {tpl.sourcePinUrl && (
                              <a
                                href={tpl.sourcePinUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-[#e60023] shrink-0"
                                title="Open Pin on Pinterest"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 px-0.5 truncate">
                            {tpl.category} · {tpl.items.length} layers
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ELEMENTS */}
              {activeRailTab === 'elements' && (
                <div className="p-4 space-y-4">
                  <div className="text-sm font-bold text-slate-900">Elements</div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search shapes, stickers, charts..."
                      value={elementSearch}
                      onChange={(e) => setElementSearch(e.target.value)}
                      className="w-full bg-[#f4f5f7] border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#7d2ae8] focus:bg-white"
                    />
                  </div>

                  {/* Shapes & Lines (Click or Drag onto Artboard) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-700">Lines & Shapes</div>
                      <span className="text-[10px] text-slate-400">Drag or click</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {filteredShapes.map((shape) => (
                        <button
                          key={shape.kind}
                          draggable
                          onDragStart={(e) =>
                            startSidebarDrag(e, { kind: 'shape', shapeKind: shape.kind, label: shape.label })
                          }
                          onDragEnd={endSidebarDrag}
                          onClick={() => handleAddShape(shape.kind)}
                          title={`${shape.label} — click or drag onto canvas`}
                          className="h-12 rounded-lg bg-[#f4f5f7] hover:bg-purple-50 hover:border-[#7d2ae8] flex items-center justify-center p-2 transition-colors border border-slate-200 cursor-grab active:cursor-grabbing"
                        >
                          {shape.kind === 'rect' && <div className="w-6 h-6 rounded bg-[#8b3dff]" />}
                          {shape.kind === 'circle' && <div className="w-6 h-6 rounded-full bg-[#00c4cc]" />}
                          {shape.kind === 'pill' && <div className="w-8 h-4 rounded-full bg-[#ec4899]" />}
                          {shape.kind === 'line' && <div className="w-8 h-0.5 bg-slate-700" />}
                          {shape.kind === 'dashed-line' && <div className="w-8 border-t-2 border-dashed border-slate-700" />}
                          {['triangle', 'star', 'hexagon', 'diamond', 'arrow', 'bubble'].includes(shape.kind) && (
                            <div className="w-6 h-6 text-[#7d2ae8] pointer-events-none">
                              <ShapeRenderer
                                item={{
                                  id: 'preview',
                                  type: 'shape',
                                  shapeKind: shape.kind,
                                  content: '',
                                  x: 0,
                                  y: 0,
                                  width: 40,
                                  height: 40,
                                  bgColor: '#7d2ae8',
                                  color: '#fff',
                                }}
                              />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stickers */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">Graphics & Stickers</div>
                    <div className="grid grid-cols-4 gap-2 text-2xl">
                      {[
                        { emoji: '🔥', keywords: 'fire hot flame' },
                        { emoji: '✨', keywords: 'sparkle star shine' },
                        { emoji: '⚡', keywords: 'lightning bolt flash' },
                        { emoji: '🚀', keywords: 'rocket launch space' },
                        { emoji: '❤️', keywords: 'heart love like' },
                        { emoji: '👑', keywords: 'crown king queen pro' },
                        { emoji: '💎', keywords: 'diamond gem luxury' },
                        { emoji: '🎉', keywords: 'party celebration confetti' },
                        { emoji: '💡', keywords: 'idea bulb light' },
                        { emoji: '🎨', keywords: 'art palette paint design' },
                        { emoji: '🎯', keywords: 'target goal bullseye' },
                        { emoji: '💯', keywords: '100 score perfect' },
                      ]
                        .filter(
                          (s) =>
                            !elementSearch.trim() ||
                            s.keywords.includes(elementSearch.trim().toLowerCase()) ||
                            s.emoji.includes(elementSearch.trim())
                        )
                        .map((s, idx) => (
                          <button
                            key={idx}
                            draggable
                            onDragStart={(e) => startSidebarDrag(e, { kind: 'sticker', emoji: s.emoji })}
                            onDragEnd={endSidebarDrag}
                            onClick={() => handleAddSticker(s.emoji)}
                            title={`${s.keywords} — click or drag onto canvas`}
                            className="h-11 rounded-lg bg-[#f4f5f7] hover:bg-purple-50 hover:border-[#7d2ae8] flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-slate-200 cursor-grab active:cursor-grabbing"
                          >
                            {s.emoji}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Frames, Charts & QR Apps */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">Frames, Charts & QR Code</div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {(!elementSearch.trim() || 'circle photo frame'.includes(elementSearch.toLowerCase())) && (
                        <button
                          draggable
                          onDragStart={(e) =>
                            startSidebarDrag(e, {
                              kind: 'image',
                              url: SAMPLE_UPLOAD_PHOTOS[0].url,
                              name: 'Circle Photo Frame',
                              borderRadius: 9999,
                              magicCutout: true,
                            })
                          }
                          onDragEnd={endSidebarDrag}
                          onClick={() =>
                            handleAddImageToCanvas(SAMPLE_UPLOAD_PHOTOS[0].url, 'Circle Photo Frame', {
                              borderRadius: 9999,
                              magicCutout: true,
                            })
                          }
                          className="p-2 rounded-lg bg-[#f4f5f7] hover:bg-purple-50 border border-slate-200 flex items-center gap-2 text-slate-800 font-medium cursor-grab active:cursor-grabbing"
                        >
                          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 shrink-0" />
                          <span>Circle Frame</span>
                        </button>
                      )}
                      {(!elementSearch.trim() || 'arch card photo frame'.includes(elementSearch.toLowerCase())) && (
                        <button
                          draggable
                          onDragStart={(e) =>
                            startSidebarDrag(e, {
                              kind: 'image',
                              url: SAMPLE_UPLOAD_PHOTOS[1].url,
                              name: 'Card Photo Frame',
                              borderRadius: 24,
                            })
                          }
                          onDragEnd={endSidebarDrag}
                          onClick={() =>
                            handleAddImageToCanvas(SAMPLE_UPLOAD_PHOTOS[1].url, 'Card Photo Frame', {
                              borderRadius: 24,
                            })
                          }
                          className="p-2 rounded-lg bg-[#f4f5f7] hover:bg-purple-50 border border-slate-200 flex items-center gap-2 text-slate-800 font-medium cursor-grab active:cursor-grabbing"
                        >
                          <span className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-cyan-400 shrink-0" />
                          <span>Arch Frame</span>
                        </button>
                      )}
                      {(!elementSearch.trim() || 'bar chart graph data'.includes(elementSearch.toLowerCase())) && (
                        <button
                          draggable
                          onDragStart={(e) =>
                            startSidebarDrag(e, { kind: 'chart', chartKind: 'bar', label: 'Bar Chart' })
                          }
                          onDragEnd={endSidebarDrag}
                          onClick={() => handleAddChart('bar')}
                          className="p-2 rounded-lg bg-[#f4f5f7] hover:bg-purple-50 border border-slate-200 flex items-center gap-2 text-slate-800 font-medium cursor-grab active:cursor-grabbing"
                        >
                          <BarChart3 className="w-4 h-4 text-[#7d2ae8] shrink-0" />
                          <span>Bar Chart</span>
                        </button>
                      )}
                      {(!elementSearch.trim() || 'donut pie chart graph data'.includes(elementSearch.toLowerCase())) && (
                        <button
                          draggable
                          onDragStart={(e) =>
                            startSidebarDrag(e, { kind: 'chart', chartKind: 'donut', label: 'Donut Chart' })
                          }
                          onDragEnd={endSidebarDrag}
                          onClick={() => handleAddChart('donut')}
                          className="p-2 rounded-lg bg-[#f4f5f7] hover:bg-purple-50 border border-slate-200 flex items-center gap-2 text-slate-800 font-medium cursor-grab active:cursor-grabbing"
                        >
                          <PieChart className="w-4 h-4 text-[#00c4cc] shrink-0" />
                          <span>Donut Chart</span>
                        </button>
                      )}
                      {(!elementSearch.trim() || 'qr code barcode link'.includes(elementSearch.toLowerCase())) && (
                        <button
                          draggable
                          onDragStart={(e) =>
                            startSidebarDrag(e, { kind: 'qrcode', url: 'https://canva.com', label: 'QR Code' })
                          }
                          onDragEnd={endSidebarDrag}
                          onClick={() => handleAddQrCode('https://canva.com')}
                          className="col-span-2 p-2 rounded-lg bg-[#f4f5f7] hover:bg-purple-50 border border-slate-200 flex items-center justify-center gap-2 text-slate-800 font-semibold cursor-grab active:cursor-grabbing"
                        >
                          <QrCode className="w-4 h-4 text-[#7d2ae8] shrink-0" />
                          <span>Generate Scannable QR Code</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-700">Labels & Callout Badges</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: '50% OFF', color: '#ec4899', bg: '#fdf2f8' },
                        { label: 'BESTSELLER', color: '#0284c7', bg: '#f0f9ff' },
                        { label: 'TOP RATED ⭐', color: '#ca8a04', bg: '#fefce8' },
                        { label: 'NEW DROP 🚀', color: '#7c3aed', bg: '#f5f3ff' },
                        { label: 'VERIFIED ✅', color: '#059669', bg: '#ecfdf5' },
                        { label: 'FLASH SALE ⚡', color: '#dc2626', bg: '#fef2f2' },
                      ]
                        .filter((b) => !elementSearch.trim() || b.label.toLowerCase().includes(elementSearch.toLowerCase()))
                        .map((badge, idx) => (
                          <button
                            key={idx}
                            draggable
                            onDragStart={(e) => startSidebarDrag(e, { kind: 'badge', badge })}
                            onDragEnd={endSidebarDrag}
                            onClick={() => handleAddBadge(badge)}
                            className="py-1.5 px-2 rounded-lg text-[9px] font-bold border truncate hover:scale-105 transition-all cursor-grab active:cursor-grabbing"
                            style={{ color: badge.color, backgroundColor: badge.bg, borderColor: badge.color }}
                          >
                            {badge.label}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Canvas Colors & Gradients */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-700">Page Background</div>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        '#ffffff', '#090a16', '#f5f3ff', '#eff6ff', '#f0fdf4', '#fff7ed',
                        '#7d2ae8', '#00c4cc', '#f43f5e', '#e11d48', '#1e1b4b', '#18181b',
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            updateActivePage((p) => ({ ...p, backgroundColor: color, backgroundGradient: undefined }), true)
                          }
                          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${
                            activePage.backgroundColor === color && !activePage.backgroundGradient
                              ? 'border-[#7d2ae8] scale-105'
                              : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500 pt-2">Gradients</div>
                    <div className="grid grid-cols-3 gap-2">
                      {CANVAS_BG_GRADIENTS.map((g) => (
                        <button
                          key={g.label}
                          onClick={() =>
                            updateActivePage((p) => ({ ...p, backgroundGradient: g.value }), true)
                          }
                          className="h-9 rounded-lg border border-slate-200 hover:scale-105 transition-transform cursor-pointer"
                          style={{ background: g.value }}
                          title={g.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TEXT & FONT PAIRINGS */}
              {activeRailTab === 'text' && (
                <div className="p-4 space-y-4">
                  <div className="text-sm font-bold text-slate-900">Text</div>
                  <button
                    onClick={() => handleAddText('heading')}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#8b3dff] hover:bg-[#7d2ae8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add a text box</span>
                  </button>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Default text styles</div>
                      <span className="text-[10px] text-slate-400">Drag or click</span>
                    </div>
                    <button
                      draggable
                      onDragStart={(e) =>
                        startSidebarDrag(e, { kind: 'text', textRole: 'heading', label: 'Heading' })
                      }
                      onDragEnd={endSidebarDrag}
                      onClick={() => handleAddText('heading')}
                      className="w-full p-3 rounded-xl bg-[#f4f5f7] hover:bg-purple-50 text-left border border-slate-200 hover:border-[#7d2ae8] cursor-grab active:cursor-grabbing"
                    >
                      <div className="text-xl font-extrabold text-slate-900">Add a heading</div>
                    </button>
                    <button
                      draggable
                      onDragStart={(e) =>
                        startSidebarDrag(e, { kind: 'text', textRole: 'subheading', label: 'Subheading' })
                      }
                      onDragEnd={endSidebarDrag}
                      onClick={() => handleAddText('subheading')}
                      className="w-full p-2.5 rounded-xl bg-[#f4f5f7] hover:bg-purple-50 text-left border border-slate-200 hover:border-[#7d2ae8] cursor-grab active:cursor-grabbing"
                    >
                      <div className="text-base font-semibold text-slate-800">Add a subheading</div>
                    </button>
                    <button
                      draggable
                      onDragStart={(e) =>
                        startSidebarDrag(e, { kind: 'text', textRole: 'body', label: 'Body text' })
                      }
                      onDragEnd={endSidebarDrag}
                      onClick={() => handleAddText('body')}
                      className="w-full p-2.5 rounded-xl bg-[#f4f5f7] hover:bg-purple-50 text-left border border-slate-200 hover:border-[#7d2ae8] cursor-grab active:cursor-grabbing"
                    >
                      <div className="text-xs text-slate-600">Add a little bit of body text</div>
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Font Combinations</div>
                    <div className="grid grid-cols-1 gap-2">
                      {FONT_PAIRINGS.map((pair) => (
                        <button
                          key={pair.id}
                          draggable
                          onDragStart={(e) =>
                            startSidebarDrag(e, { kind: 'font_pairing', pairId: pair.id, label: pair.name })
                          }
                          onDragEnd={endSidebarDrag}
                          onClick={() => handleAddFontPairing(pair)}
                          className="p-3 rounded-xl bg-[#f4f5f7] hover:bg-purple-50 border border-slate-200 hover:border-[#7d2ae8] text-left transition-all cursor-grab active:cursor-grabbing"
                        >
                          <div className="text-base font-extrabold" style={{ fontFamily: pair.headingFont, color: pair.headingColor }}>
                            {pair.heading}
                          </div>
                          <div className="text-[10px] tracking-wider text-slate-500 mt-0.5">{pair.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BRAND KITS */}
              {activeRailTab === 'brand' && (
                <div className="p-4 space-y-4">
                  <div className="text-sm font-bold text-slate-900">Brand Kits</div>
                  <p className="text-[11px] text-slate-500">
                    Apply a cohesive color palette and font hierarchy to this page in 1 click.
                  </p>

                  <div className="space-y-3">
                    {BRAND_KITS.map((kit) => (
                      <div
                        key={kit.id}
                        className="p-3 rounded-xl bg-[#f8f9fb] border border-slate-200 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{kit.name}</span>
                          <button
                            onClick={() => handleApplyBrandKit(kit)}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#8b3dff] hover:bg-[#7d2ae8] text-white cursor-pointer"
                          >
                            Apply Theme
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {kit.colors.map((c) => (
                            <button
                              key={c}
                              onClick={() => {
                                if (selectedItem) {
                                  updateSelected(
                                    selectedItem.type === 'text' ? { color: c } : { bgColor: c }
                                  );
                                } else {
                                  updateActivePage((p) => ({ ...p, backgroundColor: c, backgroundGradient: undefined }));
                                }
                              }}
                              className="flex-1 h-7 rounded-lg border border-slate-300 hover:scale-105 transition-transform cursor-pointer"
                              style={{ backgroundColor: c }}
                              title={`Apply ${c}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: REAL UPLOADS */}
              {activeRailTab === 'uploads' && (
                <div className="p-4 space-y-4">
                  <div className="text-sm font-bold text-slate-900">Uploads</div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#8b3dff] hover:bg-[#7d2ae8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload files</span>
                  </button>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleUploadFiles(e.dataTransfer.files);
                    }}
                    className="p-3 rounded-xl border border-dashed border-slate-300 bg-[#f8f9fb] text-center text-[11px] text-slate-500"
                  >
                    Drag & drop PNG, JPG, or SVG images here
                  </div>

                  <div className="text-xs font-bold text-slate-700">Images Library ({uploadedAssets.length})</div>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        draggable
                        onDragStart={(e) => {
                          startSidebarDrag(e, { kind: 'image', url: asset.url, name: asset.name });
                          e.dataTransfer.setData('application/canva-asset', JSON.stringify(asset));
                        }}
                        onDragEnd={endSidebarDrag}
                        onClick={() => handleAddImageToCanvas(asset.url, asset.name)}
                        className="rounded-lg overflow-hidden border border-slate-200 hover:border-[#7d2ae8] cursor-grab active:cursor-grabbing group bg-[#f8f9fb]"
                        title="Click or drag onto canvas"
                      >
                        <img src={asset.url} alt={asset.name} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                        <div className="px-2 py-1 text-[10px] text-slate-700 font-medium truncate">{asset.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: REAL DRAW TOOL */}
              {activeRailTab === 'draw' && (
                <div className="p-4 space-y-4">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-[#7d2ae8]" />
                    <span>Draw on canvas</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Click and drag anywhere on the page to draw freehand vector strokes.
                  </p>

                  {/* Brush Tools */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'pen', label: 'Pen' },
                      { id: 'marker', label: 'Marker' },
                      { id: 'highlighter', label: 'Highlt' },
                      { id: 'eraser', label: 'Eraser' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setDrawTool(t.id as any)}
                        className={`py-2 px-1 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                          drawTool === t.id
                            ? 'bg-purple-50 border-[#7d2ae8] text-[#7d2ae8]'
                            : 'bg-[#f4f5f7] border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t.id === 'eraser' ? <Eraser className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Stroke Width */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium">Weight</span>
                      <span className="font-mono text-[#7d2ae8] font-bold">{drawWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={28}
                      value={drawWidth}
                      onChange={(e) => setDrawWidth(Number(e.target.value))}
                      className="w-full accent-[#7d2ae8]"
                    />
                  </div>

                  {/* Draw Colors */}
                  <div className="space-y-2">
                    <div className="text-xs text-slate-700 font-medium">Ink Color</div>
                    <div className="grid grid-cols-6 gap-2">
                      {['#7d2ae8', '#00c4cc', '#f97316', '#ec4899', '#10b981', '#1e1b4b', '#ef4444', '#eab308', '#3b82f6', '#ffffff', '#64748b', '#000000'].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setDrawColor(c);
                            if (drawTool === 'eraser') setDrawTool('pen');
                          }}
                          className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                            drawColor === c && drawTool !== 'eraser' ? 'border-[#7d2ae8] scale-110' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stroke Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() =>
                        updateActivePage((p) => ({ ...p, strokes: p.strokes.slice(0, -1) }), true)
                      }
                      disabled={activePage.strokes.length === 0}
                      className="flex-1 py-2 rounded-lg bg-[#f4f5f7] hover:bg-slate-200 text-slate-800 disabled:opacity-40 text-xs font-semibold cursor-pointer"
                    >
                      Undo Stroke
                    </button>
                    <button
                      onClick={() => updateActivePage((p) => ({ ...p, strokes: [] }), true)}
                      disabled={activePage.strokes.length === 0}
                      className="flex-1 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 disabled:opacity-40 text-rose-600 text-xs font-semibold cursor-pointer"
                    >
                      Clear Drawing
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 7: LAYERS STACK */}
              {activeRailTab === 'layers' && (
                <div className="p-4 space-y-4">
                  <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>Layers ({items.length})</span>
                    <span className="text-[11px] text-slate-500 font-normal">Top to bottom</span>
                  </div>

                  {/* Align to Page quick grid */}
                  {selectedItem && (
                    <div className="p-2.5 rounded-xl bg-[#f8f9fb] border border-slate-200 space-y-2">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Align to page</div>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        {(['top', 'middle', 'bottom', 'left', 'center', 'right'] as const).map((a) => (
                          <button
                            key={a}
                            onClick={() => alignSelectedToPage(a)}
                            className="py-1 rounded bg-white border border-slate-200 hover:border-[#7d2ae8] hover:text-[#7d2ae8] capitalize text-slate-700 font-medium cursor-pointer"
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {[...items].reverse().map((item) => {
                      const isSel = selectedIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            if (e.shiftKey) {
                              setSelectedIds((prev) =>
                                prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                              );
                            } else {
                              setSelectedId(item.id);
                            }
                          }}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isSel
                              ? 'bg-purple-50 border-[#7d2ae8] text-slate-900 font-semibold'
                              : 'bg-[#f8f9fb] border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[#7d2ae8] shrink-0">
                              {item.type}
                            </span>
                            <span className="text-xs truncate">{item.content || item.shapeKind || 'Element'}</span>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                reorderLayer(item.id, 'forward');
                              }}
                              className="p-1 hover:text-[#7d2ae8] text-slate-500"
                              title="Bring Forward"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                reorderLayer(item.id, 'backward');
                              }}
                              className="p-1 hover:text-[#7d2ae8] text-slate-500"
                              title="Send Backward"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateItemById(item.id, { isHidden: !item.isHidden });
                              }}
                              className="p-1 hover:text-[#7d2ae8] text-slate-500"
                              title={item.isHidden ? 'Show' : 'Hide'}
                            >
                              {item.isHidden ? <EyeOff className="w-3 h-3 text-amber-500" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateItemById(item.id, { isLocked: !item.isLocked });
                              }}
                              className="p-1 hover:text-[#7d2ae8] text-slate-500"
                              title={item.isLocked ? 'Unlock' : 'Lock'}
                            >
                              {item.isLocked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. CENTRAL EDITING CANVAS WORKSPACE */}
        <div className="flex-1 flex flex-col bg-[#f3f4f7] overflow-hidden relative">
          {/* CONTEXTUAL FORMATTING TOOLBAR */}
          <div className="h-11 bg-white border-b border-slate-200 px-3 flex items-center justify-between text-xs text-slate-700 shrink-0 z-20 relative">
            {isDrawerCollapsed && (
              <button
                onClick={() => setIsDrawerCollapsed(false)}
                className="mr-2 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                title="Open Tools Drawer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Tools</span>
              </button>
            )}

            {selectedIds.length > 1 ? (
              /* MULTI-SELECT TOOLBAR (Group / Ungroup / Align / Duplicate / Delete) */
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-[#7d2ae8] font-bold">
                  {selectedIds.length} elements selected
                </span>
                <button
                  onClick={handleGroupSelected}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-purple-100 hover:text-[#7d2ae8] font-semibold cursor-pointer"
                  title="Group (Ctrl+G)"
                >
                  <Group className="w-3.5 h-3.5" />
                  <span>Group</span>
                </button>
                {selectedItemsList.some((i) => i.groupId) && (
                  <button
                    onClick={handleUngroupSelected}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-purple-100 hover:text-[#7d2ae8] font-semibold cursor-pointer"
                    title="Ungroup (Ctrl+Shift+G)"
                  >
                    <Ungroup className="w-3.5 h-3.5" />
                    <span>Ungroup</span>
                  </button>
                )}
                <button
                  onClick={() => alignSelectedToPage('center')}
                  className="px-2.5 py-1 rounded hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Center X
                </button>
                <button
                  onClick={() => alignSelectedToPage('middle')}
                  className="px-2.5 py-1 rounded hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Center Y
                </button>
                {selectedIds.length >= 3 && (
                  <button
                    onClick={handleDistributeHorizontal}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-purple-100 hover:text-[#7d2ae8] font-semibold cursor-pointer"
                    title="Tidy up horizontal spacing"
                  >
                    <AlignHorizontalSpaceAround className="w-3.5 h-3.5" />
                    <span>Tidy Up</span>
                  </button>
                )}
                <button
                  onClick={() => duplicateItems(selectedItemsList)}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="Duplicate Selected"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={deleteSelected}
                  className="p-1.5 rounded text-rose-500 hover:bg-rose-100 cursor-pointer"
                  title="Delete Selected"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : selectedItem ? (
              <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-none py-1">
                {/* TEXT CONTROLS */}
                {selectedItem.type === 'text' && (
                  <>
                    <select
                      value={selectedItem.fontFamily || 'Outfit, sans-serif'}
                      onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium px-2 py-1 rounded border border-slate-300 outline-none cursor-pointer"
                    >
                      <option value="Outfit, sans-serif">Canva Sans</option>
                      <option value="Plus Jakarta Sans, sans-serif">Jakarta Sans</option>
                      <option value="Playfair Display, serif">Playfair Display</option>
                      <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                      <option value="Georgia, serif">Georgia Serif</option>
                      <option value="Impact, sans-serif">Impact Display</option>
                    </select>

                    {/* Font Size Direct Input + Counter */}
                    <div className="flex items-center border border-slate-300 rounded bg-slate-50 shrink-0">
                      <button
                        onClick={() => updateSelected({ fontSize: Math.max((selectedItem.fontSize || 16) - 2, 8) })}
                        className="px-2 py-0.5 hover:bg-slate-200 font-bold text-slate-600 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={8}
                        max={160}
                        value={selectedItem.fontSize || 16}
                        onChange={(e) => updateSelected({ fontSize: Math.max(8, Math.min(160, Number(e.target.value) || 16)) })}
                        className="w-10 text-center bg-transparent font-mono text-xs font-bold text-slate-800 outline-none"
                      />
                      <button
                        onClick={() => updateSelected({ fontSize: Math.min((selectedItem.fontSize || 16) + 2, 160) })}
                        className="px-2 py-0.5 hover:bg-slate-200 font-bold text-slate-600 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Text Color Picker + Swatches */}
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5 shrink-0">
                      <input
                        type="color"
                        value={selectedItem.color}
                        onChange={(e) => updateSelected({ color: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                        title="Custom text color"
                      />
                      {['#1e1b4b', '#7d2ae8', '#00c4cc', '#f43f5e', '#ffffff'].map((c) => (
                        <button
                          key={c}
                          onClick={() => updateSelected({ color: c })}
                          className="w-4 h-4 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    {/* Bold, Italic, Underline, Strikethrough, Uppercase, Lists */}
                    <div className="flex items-center border-l border-slate-200 pl-1.5 gap-0.5 shrink-0">
                      <button
                        onClick={() =>
                          updateSelected({
                            fontWeight: selectedItem.fontWeight === 'bold' || selectedItem.fontWeight === '800' ? 'normal' : '800',
                          })
                        }
                        className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                          selectedItem.fontWeight === 'bold' || selectedItem.fontWeight === '800' ? 'bg-purple-100 text-[#7d2ae8]' : 'text-slate-600'
                        }`}
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          updateSelected({ fontStyle: selectedItem.fontStyle === 'italic' ? 'normal' : 'italic' })
                        }
                        className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                          selectedItem.fontStyle === 'italic' ? 'bg-purple-100 text-[#7d2ae8]' : 'text-slate-600'
                        }`}
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          updateSelected({
                            textDecoration: selectedItem.textDecoration === 'underline' ? 'none' : 'underline',
                          })
                        }
                        className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                          selectedItem.textDecoration === 'underline' ? 'bg-purple-100 text-[#7d2ae8]' : 'text-slate-600'
                        }`}
                        title="Underline"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          updateSelected({
                            textDecoration: selectedItem.textDecoration === 'line-through' ? 'none' : 'line-through',
                          })
                        }
                        className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                          selectedItem.textDecoration === 'line-through' ? 'bg-purple-100 text-[#7d2ae8]' : 'text-slate-600'
                        }`}
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          updateSelected({
                            textTransform: selectedItem.textTransform === 'uppercase' ? 'none' : 'uppercase',
                          })
                        }
                        className={`px-1.5 py-1 rounded text-[11px] font-bold hover:bg-slate-200 cursor-pointer ${
                          selectedItem.textTransform === 'uppercase' ? 'bg-purple-100 text-[#7d2ae8]' : 'text-slate-600'
                        }`}
                        title="Uppercase Toggle"
                      >
                        aA
                      </button>
                      <button
                        onClick={() =>
                          updateSelected({
                            listType: selectedItem.listType === 'bullet' ? 'none' : 'bullet',
                          })
                        }
                        className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                          selectedItem.listType === 'bullet' ? 'bg-purple-100 text-[#7d2ae8]' : 'text-slate-600'
                        }`}
                        title="Bullet List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          updateSelected({
                            listType: selectedItem.listType === 'numbered' ? 'none' : 'numbered',
                          })
                        }
                        className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                          selectedItem.listType === 'numbered' ? 'bg-purple-100 text-[#7d2ae8]' : 'text-slate-600'
                        }`}
                        title="Numbered List"
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Alignment */}
                    <button
                      onClick={() => {
                        const order: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];
                        const next = order[(order.indexOf(selectedItem.textAlign || 'center') + 1) % 3];
                        updateSelected({ textAlign: next });
                      }}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 cursor-pointer border-l border-slate-200 pl-2"
                      title={`Align (${selectedItem.textAlign || 'center'})`}
                    >
                      {selectedItem.textAlign === 'left' ? (
                        <AlignLeft className="w-3.5 h-3.5" />
                      ) : selectedItem.textAlign === 'right' ? (
                        <AlignRight className="w-3.5 h-3.5" />
                      ) : (
                        <AlignCenter className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Spacing & Effects */}
                    <button
                      onClick={() => setActivePopover(activePopover === 'spacing' ? null : 'spacing')}
                      className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                        activePopover === 'spacing' ? 'bg-purple-100 text-[#7d2ae8]' : 'hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Spacing
                    </button>
                    <button
                      onClick={() => setActivePopover(activePopover === 'effects' ? null : 'effects')}
                      className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                        activePopover === 'effects' || (selectedItem.textEffect && selectedItem.textEffect !== 'none')
                          ? 'bg-purple-100 text-[#7d2ae8]'
                          : 'hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Effects
                    </button>
                  </>
                )}

                {/* SHAPE / BADGE CONTROLS */}
                {(selectedItem.type === 'shape' || selectedItem.type === 'badge') && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="color"
                      value={selectedItem.bgColor || '#7d2ae8'}
                      onChange={(e) => updateSelected({ bgColor: e.target.value, bgGradient: undefined })}
                      className="w-6 h-6 rounded cursor-pointer border border-slate-300"
                      title="Shape Fill Color"
                    />
                    {['#7d2ae8', '#00c4cc', '#f97316', '#10b981', '#1e1b4b'].map((c) => (
                      <button
                        key={c}
                        onClick={() => updateSelected({ bgColor: c, bgGradient: undefined })}
                        className="w-4 h-4 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />
                    <input
                      type="color"
                      value={selectedItem.color || '#ffffff'}
                      onChange={(e) => updateSelected({ color: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border border-slate-300"
                      title="Label Text Color"
                    />
                    <button
                      onClick={() => setActivePopover(activePopover === 'border' ? null : 'border')}
                      className={`px-2 py-1 rounded font-semibold cursor-pointer ml-1 ${
                        activePopover === 'border' ? 'bg-purple-100 text-[#7d2ae8]' : 'hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Style & Borders
                    </button>
                  </div>
                )}

                {/* QR CODE CONTROLS */}
                {selectedItem.type === 'qrcode' && (
                  <button
                    onClick={() => setActivePopover(activePopover === 'qr' ? null : 'qr')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      activePopover === 'qr' ? 'bg-purple-100 text-[#7d2ae8]' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Edit QR Link</span>
                  </button>
                )}

                {/* CHART CONTROLS */}
                {selectedItem.type === 'chart' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setActivePopover(activePopover === 'chart' ? null : 'chart')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold cursor-pointer ${
                        activePopover === 'chart' ? 'bg-purple-100 text-[#7d2ae8]' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Edit Data</span>
                    </button>
                    <button
                      onClick={() =>
                        updateSelected({ chartKind: selectedItem.chartKind === 'donut' ? 'bar' : 'donut' })
                      }
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      Switch to {selectedItem.chartKind === 'donut' ? 'Bar' : 'Donut'}
                    </button>
                  </div>
                )}

                {/* IMAGE CONTROLS */}
                {selectedItem.type === 'image' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setActivePopover(activePopover === 'filters' ? null : 'filters')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold cursor-pointer ${
                        activePopover === 'filters' ? 'bg-purple-100 text-[#7d2ae8]' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Edit photo</span>
                    </button>
                    <button
                      onClick={() => setActivePopover(activePopover === 'crop' ? null : 'crop')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold cursor-pointer ${
                        activePopover === 'crop' || (selectedItem.imageCrop && selectedItem.imageCrop.scale !== 1)
                          ? 'bg-purple-100 text-[#7d2ae8]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Crop</span>
                    </button>
                    <button
                      onClick={() => updateSelected({ magicCutout: !selectedItem.magicCutout })}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold cursor-pointer ${
                        selectedItem.magicCutout ? 'bg-purple-100 text-[#7d2ae8]' : 'bg-purple-50 hover:bg-purple-100 text-[#7d2ae8]'
                      }`}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>BG Remover</span>
                    </button>
                  </div>
                )}

                {/* UNIVERSAL CONTROLS */}
                <div className="flex items-center border-l border-slate-200 pl-2 gap-1 shrink-0">
                  <button
                    onClick={() => updateSelected({ flipX: !selectedItem.flipX })}
                    className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                      selectedItem.flipX ? 'bg-purple-100 text-[#7d2ae8]' : 'text-slate-600'
                    }`}
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateSelected({ flipY: !selectedItem.flipY })}
                    className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                      selectedItem.flipY ? 'bg-purple-100 text-[#7d2ae8]' : 'text-slate-600'
                    }`}
                    title="Flip Vertical"
                  >
                    <FlipVertical className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (copiedStyle) {
                        setCopiedStyle(null);
                      } else {
                        setCopiedStyle(deepClone(selectedItem));
                        showToast('Style copied! Click another element to paste style.');
                      }
                    }}
                    className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                      copiedStyle ? 'bg-purple-600 text-white' : 'text-slate-600'
                    }`}
                    title="Copy Style (Paint Roller)"
                  >
                    <PaintRoller className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActivePopover(activePopover === 'animate' ? null : 'animate')}
                    className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                      activePopover === 'animate' || (selectedItem.animation && selectedItem.animation !== 'none')
                        ? 'bg-purple-100 text-[#7d2ae8]'
                        : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Animate
                  </button>
                  <button
                    onClick={() => setActivePopover(activePopover === 'position' ? null : 'position')}
                    className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                      activePopover === 'position' ? 'bg-purple-100 text-[#7d2ae8]' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Position
                  </button>
                  <button
                    onClick={() => setActivePopover(activePopover === 'opacity' ? null : 'opacity')}
                    className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                      activePopover === 'opacity' ? 'bg-purple-100 text-[#7d2ae8]' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Transparency"
                  >
                    Opacity
                  </button>
                  {selectedItem.groupId && (
                    <button
                      onClick={handleUngroupSelected}
                      className="px-2 py-1 rounded bg-purple-50 text-[#7d2ae8] hover:bg-purple-100 font-semibold cursor-pointer"
                      title="Ungroup (Ctrl+Shift+G)"
                    >
                      Ungroup
                    </button>
                  )}
                  <button
                    onClick={() => updateSelected({ isLocked: !selectedItem.isLocked })}
                    className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                      selectedItem.isLocked ? 'bg-amber-100 text-amber-700' : 'text-slate-600'
                    }`}
                    title={selectedItem.isLocked ? 'Unlock element' : 'Lock element'}
                  >
                    {selectedItem.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => duplicateItems([selectedItem])}
                    className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
                    title="Duplicate (Ctrl+D)"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-100 cursor-pointer"
                    title="Delete (Del)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* NO SELECTION: PAGE BACKGROUND & TOOLS */
              <div className="flex items-center gap-3 text-slate-600 text-xs">
                <button
                  onClick={() => setActivePopover(activePopover === 'bg' ? null : 'bg')}
                  className="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-slate-100 border border-slate-200 cursor-pointer font-semibold"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300"
                    style={{ background: activePage.backgroundGradient || activePage.backgroundColor }}
                  />
                  <span>Background</span>
                </button>
                <button
                  onClick={() => {
                    setActiveRailTab('layers');
                    setIsDrawerCollapsed(false);
                  }}
                  className="px-2.5 py-1 rounded hover:bg-slate-100 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Layers ({items.length})</span>
                </button>
                <span className="hidden md:inline text-slate-400">
                  {activeRailTab === 'draw'
                    ? 'Draw mode active — click & drag on page to sketch'
                    : 'Click any item to edit, drag corners to resize, or double-click text'}
                </span>
              </div>
            )}

            {/* Zoom and Fit live in the Canva footer bar to keep the contextual toolbar spacious */}

            {/* POPOVER PANELS */}
            {activePopover && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-13 left-6 z-40 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 text-slate-800 space-y-3 animate-in fade-in"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs capitalize">{activePopover}</span>
                  <button onClick={() => setActivePopover(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {activePopover === 'spacing' && selectedItem && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Letter spacing</span>
                        <span className="font-mono">{selectedItem.letterSpacing || 0}</span>
                      </div>
                      <input
                        type="range"
                        min={-4}
                        max={20}
                        step={0.5}
                        value={selectedItem.letterSpacing || 0}
                        onChange={(e) => updateSelected({ letterSpacing: Number(e.target.value) })}
                        className="w-full accent-[#7d2ae8]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Line spacing</span>
                        <span className="font-mono">{selectedItem.lineHeight || 1.2}</span>
                      </div>
                      <input
                        type="range"
                        min={0.8}
                        max={2.4}
                        step={0.1}
                        value={selectedItem.lineHeight || 1.2}
                        onChange={(e) => updateSelected({ lineHeight: Number(e.target.value) })}
                        className="w-full accent-[#7d2ae8]"
                      />
                    </div>
                  </div>
                )}

                {activePopover === 'effects' && selectedItem && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {(['none', 'shadow', 'lift', 'hollow', 'neon', 'glitch', 'echo', 'background'] as TextEffectType[]).map((eff) => (
                        <button
                          key={eff}
                          onClick={() => updateSelected({ textEffect: eff })}
                          className={`py-2 px-1 rounded-lg border text-[11px] font-semibold capitalize cursor-pointer ${
                            (selectedItem.textEffect || 'none') === eff
                              ? 'border-[#7d2ae8] bg-purple-50 text-[#7d2ae8]'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {eff}
                        </button>
                      ))}
                    </div>
                    {selectedItem.textEffect === 'background' && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-semibold">Highlight fill</span>
                        <input
                          type="color"
                          value={selectedItem.bgColor || '#f5f3ff'}
                          onChange={(e) => updateSelected({ bgColor: e.target.value })}
                          className="w-7 h-6 rounded border border-slate-300 cursor-pointer"
                        />
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-semibold">Curve Text Shape</span>
                        <span className="font-mono">{selectedItem.textCurve || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        step={5}
                        value={selectedItem.textCurve || 0}
                        onChange={(e) => updateSelected({ textCurve: Number(e.target.value) })}
                        className="w-full accent-[#7d2ae8]"
                      />
                    </div>
                  </div>
                )}

                {activePopover === 'animate' && selectedItem && (
                  <div className="grid grid-cols-3 gap-2">
                    {(['none', 'fade', 'rise', 'pop', 'pan', 'bounce', 'pulse'] as AnimationType[]).map((anim) => (
                      <button
                        key={anim}
                        onClick={() => updateSelected({ animation: anim })}
                        className={`py-2 px-1 rounded-lg border text-[11px] font-semibold capitalize cursor-pointer ${
                          (selectedItem.animation || 'none') === anim
                            ? 'border-[#7d2ae8] bg-purple-50 text-[#7d2ae8]'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {anim}
                      </button>
                    ))}
                  </div>
                )}

                {activePopover === 'opacity' && selectedItem && (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Transparency</span>
                      <span className="font-mono">{Math.round((selectedItem.opacity ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round((selectedItem.opacity ?? 1) * 100)}
                      onChange={(e) => updateSelected({ opacity: Number(e.target.value) / 100 })}
                      className="w-full accent-[#7d2ae8]"
                    />
                  </div>
                )}

                {activePopover === 'border' && selectedItem && (
                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] font-semibold mb-1.5">Gradient Fill</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {CANVAS_BG_GRADIENTS.map((g) => (
                          <button
                            key={g.label}
                            onClick={() => updateSelected({ bgGradient: g.value })}
                            className="h-6 rounded-md border border-slate-200 hover:scale-105 transition-transform cursor-pointer"
                            style={{ background: g.value }}
                            title={g.label}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5 pt-1 border-t border-slate-100">
                      {(['solid', 'dashed', 'dotted'] as const).map((bs) => (
                        <button
                          key={bs}
                          onClick={() => updateSelected({ borderStyle: bs, borderWidth: selectedItem.borderWidth || 2, borderColor: selectedItem.borderColor || '#1e1b4b' })}
                          className={`flex-1 py-1 rounded border text-[11px] capitalize cursor-pointer ${
                            selectedItem.borderStyle === bs ? 'border-[#7d2ae8] bg-purple-50 text-[#7d2ae8]' : 'border-slate-200'
                          }`}
                        >
                          {bs}
                        </button>
                      ))}
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Border weight</span>
                        <span className="font-mono">{selectedItem.borderWidth || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={16}
                        value={selectedItem.borderWidth || 0}
                        onChange={(e) => updateSelected({ borderWidth: Number(e.target.value), borderColor: selectedItem.borderColor || '#1e1b4b' })}
                        className="w-full accent-[#7d2ae8]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Border color</span>
                      <input
                        type="color"
                        value={selectedItem.borderColor || '#1e1b4b'}
                        onChange={(e) => updateSelected({ borderColor: e.target.value })}
                        className="w-7 h-6 rounded border border-slate-300 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Corner rounding</span>
                        <span className="font-mono">{selectedItem.borderRadius ?? 12}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedItem.borderRadius ?? 12}
                        onChange={(e) => updateSelected({ borderRadius: Number(e.target.value) })}
                        className="w-full accent-[#7d2ae8]"
                      />
                    </div>
                  </div>
                )}

                {activePopover === 'qr' && selectedItem && selectedItem.type === 'qrcode' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold block mb-1">Target URL or Text</label>
                      <input
                        type="text"
                        value={selectedItem.qrValue || selectedItem.content || ''}
                        onChange={(e) => updateSelected({ qrValue: e.target.value, content: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-[#7d2ae8]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">QR Foreground</span>
                      <input
                        type="color"
                        value={selectedItem.color || '#1e1b4b'}
                        onChange={(e) => updateSelected({ color: e.target.value })}
                        className="w-7 h-6 rounded border border-slate-300 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {activePopover === 'chart' && selectedItem && selectedItem.type === 'chart' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold block mb-1">Chart Title</label>
                      <input
                        type="text"
                        value={selectedItem.content || ''}
                        onChange={(e) => updateSelected({ content: e.target.value })}
                        className="w-full px-2.5 py-1 rounded border border-slate-300 text-xs outline-none focus:border-[#7d2ae8]"
                      />
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {(selectedItem.chartData || DEFAULT_CHART_DATA).map((d, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={d.color}
                            onChange={(e) => {
                              const next = [...(selectedItem.chartData || DEFAULT_CHART_DATA)];
                              next[idx] = { ...next[idx], color: e.target.value };
                              updateSelected({ chartData: next });
                            }}
                            className="w-5 h-5 rounded border border-slate-300 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={d.label}
                            onChange={(e) => {
                              const next = [...(selectedItem.chartData || DEFAULT_CHART_DATA)];
                              next[idx] = { ...next[idx], label: e.target.value };
                              updateSelected({ chartData: next });
                            }}
                            className="w-16 px-1.5 py-0.5 rounded border border-slate-300 text-[11px]"
                          />
                          <input
                            type="number"
                            value={d.value}
                            onChange={(e) => {
                              const next = [...(selectedItem.chartData || DEFAULT_CHART_DATA)];
                              next[idx] = { ...next[idx], value: Number(e.target.value) || 0 };
                              updateSelected({ chartData: next });
                            }}
                            className="flex-1 px-1.5 py-0.5 rounded border border-slate-300 text-[11px] font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activePopover === 'filters' && selectedItem && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'Original', f: { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0 } },
                        { label: 'Vivid', f: { brightness: 110, contrast: 120, saturate: 145, blur: 0, grayscale: 0 } },
                        { label: 'Noir', f: { brightness: 95, contrast: 135, saturate: 100, blur: 0, grayscale: 100 } },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => updateSelected({ imageFilters: preset.f })}
                          className="py-1.5 rounded border border-slate-200 hover:bg-purple-50 hover:border-[#7d2ae8] text-[11px] font-semibold cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    {(
                      [
                        ['brightness', 50, 160, '%'],
                        ['contrast', 50, 160, '%'],
                        ['saturate', 0, 200, '%'],
                        ['blur', 0, 12, 'px'],
                      ] as const
                    ).map(([key, min, max, unit]) => (
                      <div key={key}>
                        <div className="flex justify-between text-[11px] capitalize">
                          <span>{key}</span>
                          <span className="font-mono">
                            {selectedItem.imageFilters?.[key] ?? (key === 'blur' ? 0 : 100)}
                            {unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={selectedItem.imageFilters?.[key] ?? (key === 'blur' ? 0 : 100)}
                          onChange={(e) =>
                            updateSelected({
                              imageFilters: {
                                brightness: selectedItem.imageFilters?.brightness ?? 100,
                                contrast: selectedItem.imageFilters?.contrast ?? 100,
                                saturate: selectedItem.imageFilters?.saturate ?? 100,
                                blur: selectedItem.imageFilters?.blur ?? 0,
                                grayscale: selectedItem.imageFilters?.grayscale ?? 0,
                                [key]: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full accent-[#7d2ae8]"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activePopover === 'crop' && selectedItem && selectedItem.type === 'image' && (
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[11px]">
                        <span>Crop Zoom</span>
                        <span className="font-mono">{Math.round((selectedItem.imageCrop?.scale ?? 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={100}
                        max={250}
                        value={Math.round((selectedItem.imageCrop?.scale ?? 1) * 100)}
                        onChange={(e) =>
                          updateSelected({
                            imageCrop: {
                              scale: Number(e.target.value) / 100,
                              offsetX: selectedItem.imageCrop?.offsetX ?? 0,
                              offsetY: selectedItem.imageCrop?.offsetY ?? 0,
                            },
                          })
                        }
                        className="w-full accent-[#7d2ae8]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px]">
                        <span>Pan X</span>
                        <span className="font-mono">{selectedItem.imageCrop?.offsetX ?? 0}%</span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={selectedItem.imageCrop?.offsetX ?? 0}
                        onChange={(e) =>
                          updateSelected({
                            imageCrop: {
                              scale: selectedItem.imageCrop?.scale ?? 1,
                              offsetX: Number(e.target.value),
                              offsetY: selectedItem.imageCrop?.offsetY ?? 0,
                            },
                          })
                        }
                        className="w-full accent-[#7d2ae8]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px]">
                        <span>Pan Y</span>
                        <span className="font-mono">{selectedItem.imageCrop?.offsetY ?? 0}%</span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={selectedItem.imageCrop?.offsetY ?? 0}
                        onChange={(e) =>
                          updateSelected({
                            imageCrop: {
                              scale: selectedItem.imageCrop?.scale ?? 1,
                              offsetX: selectedItem.imageCrop?.offsetX ?? 0,
                              offsetY: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-[#7d2ae8]"
                      />
                    </div>
                    <button
                      onClick={() => updateSelected({ imageCrop: { scale: 1, offsetX: 0, offsetY: 0 } })}
                      className="w-full py-1.5 rounded border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold cursor-pointer"
                    >
                      Reset Crop
                    </button>
                  </div>
                )}

                {activePopover === 'position' && selectedItem && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <button
                        onClick={() => reorderLayer(selectedItem.id, 'forward')}
                        className="py-1.5 px-2 rounded border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" /> Bring forward
                      </button>
                      <button
                        onClick={() => reorderLayer(selectedItem.id, 'backward')}
                        className="py-1.5 px-2 rounded border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" /> Send backward
                      </button>
                      <button
                        onClick={() => reorderLayer(selectedItem.id, 'front')}
                        className="py-1.5 px-2 rounded border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ChevronsUp className="w-3.5 h-3.5" /> To front
                      </button>
                      <button
                        onClick={() => reorderLayer(selectedItem.id, 'back')}
                        className="py-1.5 px-2 rounded border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ChevronsDown className="w-3.5 h-3.5" /> To back
                      </button>
                    </div>
                    <div className="border-t border-slate-100 pt-2">
                      <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Align to page</div>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        {(['top', 'middle', 'bottom', 'left', 'center', 'right'] as const).map((a) => (
                          <button
                            key={a}
                            onClick={() => alignSelectedToPage(a)}
                            className="py-1 rounded border border-slate-200 hover:bg-purple-50 hover:border-[#7d2ae8] capitalize cursor-pointer"
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activePopover === 'bg' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold">Custom Color</span>
                      <input
                        type="color"
                        value={activePage.backgroundColor}
                        onChange={(e) =>
                          updateActivePage((p) => ({ ...p, backgroundColor: e.target.value, backgroundGradient: undefined }))
                        }
                        className="w-8 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {['#ffffff', '#f8fafc', '#090a16', '#f5f3ff', '#7d2ae8', '#00c4cc', '#f97316', '#ec4899', '#10b981', '#1e1b4b', '#fafaf9', '#18181b'].map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            updateActivePage((p) => ({ ...p, backgroundColor: c, backgroundGradient: undefined }))
                          }
                          className="w-7 h-7 rounded-full border border-slate-300 hover:scale-110 cursor-pointer"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GRID OVERVIEW VIEW OR MAIN ARTBOARD VIEWPORT */}
          {isGridView ? (
            <div className="flex-1 overflow-y-auto p-8 bg-[#ebedf0]">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">All Pages ({pages.length})</h3>
                  <button
                    onClick={() => setIsGridView(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#7d2ae8] text-white text-xs font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {pages.map((pg, idx) => (
                    <div
                      key={pg.id}
                      onClick={() => {
                        setActivePageIndex(idx);
                        setIsGridView(false);
                      }}
                      className={`p-3 rounded-2xl bg-white border-2 cursor-pointer transition-all hover:shadow-lg ${
                        idx === activePageIndex ? 'border-[#7d2ae8] shadow-md' : 'border-transparent hover:border-purple-300'
                      }`}
                    >
                      <div
                        className="w-full aspect-square rounded-lg border border-slate-200 relative overflow-hidden mb-2"
                        style={{ background: pg.backgroundGradient || pg.backgroundColor }}
                      >
                        <div
                          className="origin-top-left pointer-events-none"
                          style={{
                            width: `${baseArtboardSize.width}px`,
                            height: `${baseArtboardSize.height}px`,
                            transform: `scale(${165 / Math.max(baseArtboardSize.width, baseArtboardSize.height)})`,
                          }}
                        >
                          {pg.items
                            .filter((i) => !i.isHidden)
                            .map((item) => (
                              <div
                                key={item.id}
                                className="absolute"
                                style={{
                                  left: `${item.x}px`,
                                  top: `${item.y}px`,
                                  width: item.width ? `${item.width}px` : undefined,
                                  height: item.height ? `${item.height}px` : undefined,
                                  opacity: item.opacity ?? 1,
                                  transform: `rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                                }}
                              >
                                {item.type === 'text' ? (
                                  Math.abs(item.textCurve || 0) >= 5 ? (
                                    <svg
                                      viewBox={`0 0 ${item.width || 300} ${Math.max(80, (item.fontSize || 24) * 3.5)}`}
                                      className="w-full overflow-visible pointer-events-none"
                                    >
                                      <defs>
                                        <path
                                          id={`grid-curve-${pg.id}-${item.id}`}
                                          d={`M 0 ${(item.fontSize || 24) * 1.4} Q ${(item.width || 300) / 2} ${
                                            (item.fontSize || 24) * 1.4 - ((item.textCurve || 0) / 100) * Math.min((item.width || 300) * 0.45, 90)
                                          } ${item.width || 300} ${(item.fontSize || 24) * 1.4}`}
                                        />
                                      </defs>
                                      <text
                                        fill={item.color}
                                        fontSize={item.fontSize || 24}
                                        fontFamily={item.fontFamily}
                                        fontWeight={item.fontWeight}
                                        fontStyle={item.fontStyle}
                                      >
                                        <textPath href={`#grid-curve-${pg.id}-${item.id}`} startOffset="50%" textAnchor="middle">
                                          {formatDisplayText(item)}
                                        </textPath>
                                      </text>
                                    </svg>
                                  ) : (
                                    <div
                                      className="whitespace-pre-wrap px-1 leading-tight w-full"
                                      style={{
                                        color: item.color,
                                        fontSize: item.fontSize ? `${item.fontSize}px` : undefined,
                                        fontFamily: item.fontFamily,
                                        fontWeight: item.fontWeight,
                                        textAlign: item.textAlign,
                                        ...getTextEffectStyle(item),
                                      }}
                                    >
                                      {formatDisplayText(item)}
                                    </div>
                                  )
                                ) : item.type === 'image' && item.imageUrl ? (
                                  <div
                                    className="w-full h-full overflow-hidden"
                                    style={{ borderRadius: item.magicCutout ? '9999px' : `${item.borderRadius ?? 0}px` }}
                                  >
                                    <img
                                      src={item.imageUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      style={{
                                        transform: `translate(${item.imageCrop?.offsetX ?? 0}%, ${item.imageCrop?.offsetY ?? 0}%) scale(${item.imageCrop?.scale ?? 1})`,
                                        filter: item.imageFilters
                                          ? `brightness(${item.imageFilters.brightness}%) contrast(${item.imageFilters.contrast}%) saturate(${item.imageFilters.saturate}%) blur(${item.imageFilters.blur}px) grayscale(${item.imageFilters.grayscale}%)`
                                          : undefined,
                                      }}
                                    />
                                  </div>
                                ) : item.type === 'sticker' ? (
                                  <div className="w-full h-full flex items-center justify-center" style={{ fontSize: `${item.fontSize || 48}px` }}>{item.content}</div>
                                ) : item.type === 'qrcode' || item.type === 'chart' ? (
                                  <QrAndChartRenderer item={item} />
                                ) : (
                                  <ShapeRenderer item={item} />
                                )}
                              </div>
                            ))}
                          <svg
                            viewBox={`0 0 ${baseArtboardSize.width} ${baseArtboardSize.height}`}
                            className="absolute inset-0 w-full h-full pointer-events-none"
                          >
                            {pg.strokes.map((s) => {
                              if (s.points.length < 2) return null;
                              const d = s.points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
                              return (
                                <path
                                  key={s.id}
                                  d={d}
                                  fill="none"
                                  stroke={s.color}
                                  strokeWidth={s.width}
                                  strokeOpacity={s.opacity}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              );
                            })}
                          </svg>
                        </div>
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">
                          {pg.items.length} layers
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                        <span>Page {idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicatePage(idx);
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500"
                            title="Duplicate page"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(idx);
                            }}
                            className="p-1 hover:bg-rose-50 rounded text-rose-500"
                            title="Delete page"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddPage}
                    className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#7d2ae8] text-slate-500 hover:text-[#7d2ae8] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs font-bold">Add page</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={viewportRef}
              onClick={() => {
                if (marquee && (Math.abs(marquee.curX - marquee.startX) > 6 || Math.abs(marquee.curY - marquee.startY) > 6)) return;
                setSelectedIds([]);
                setEditingItemId(null);
                setActivePopover(null);
                setContextMenu(null);
              }}
              className="flex-1 overflow-auto flex flex-col items-center justify-center p-8 relative"
            >
              {/* Page Toolbar directly above the artboard (matches real Canva!) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between text-xs text-slate-600 mb-2 shrink-0"
                style={{ width: `${Math.round(baseArtboardSize.width * scaleFactor)}px`, minWidth: '280px' }}
              >
                <span className="font-semibold text-slate-700 truncate">
                  Page {activePageIndex + 1} {activePage.title ? `— ${activePage.title}` : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMovePage(activePageIndex, -1)}
                    disabled={activePageIndex === 0}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                    title="Move page up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMovePage(activePageIndex, 1)}
                    disabled={activePageIndex === pages.length - 1}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                    title="Move page down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicatePage(activePageIndex)}
                    className="p-1 rounded hover:bg-slate-200 cursor-pointer"
                    title="Duplicate page"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePage(activePageIndex)}
                    className="p-1 rounded hover:bg-rose-100 text-rose-600 cursor-pointer"
                    title="Delete / Clear page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleAddPage}
                    className="p-1 rounded hover:bg-purple-100 text-[#7d2ae8] cursor-pointer"
                    title="Add page"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ARTBOARD WRAPPER WITH OPTIONAL X + Y RULERS */}
              <div className="relative">
                {showRulers && (
                  <>
                    <div
                      className="h-5 bg-white border border-slate-300 mb-1 flex justify-between items-center px-1 text-[9px] font-mono text-slate-500"
                      style={{ width: `${Math.round(baseArtboardSize.width * scaleFactor)}px` }}
                    >
                      <span>0</span>
                      <span>{Math.round(dimensions.width / 2)}</span>
                      <span>{dimensions.width}px</span>
                    </div>
                    <div
                      className="w-5 bg-white border border-slate-300 absolute -left-6 top-6 flex flex-col justify-between items-center py-1 text-[8px] font-mono text-slate-500"
                      style={{ height: `${Math.round(baseArtboardSize.height * scaleFactor)}px` }}
                    >
                      <span>0</span>
                      <span className="-rotate-90">{Math.round(dimensions.height / 2)}</span>
                      <span>{dimensions.height}</span>
                    </div>
                  </>
                )}

                {/* ACTUAL ARTBOARD (SUPPORTS DIRECT SIDEBAR DRAG-AND-DROP + FILE DROP) */}
                <div
                  ref={artboardRef}
                  data-testid="canva-artboard"
                  onMouseDown={handleArtboardMouseDown}
                  onDragEnter={(e) => {
                    e.preventDefault();
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
                    if (!artboardRef.current) return;
                    const rect = artboardRef.current.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / scaleFactor;
                    const y = (e.clientY - rect.top) / scaleFactor;

                    let payload: SidebarDragPayload | null = activeSidebarDragRef.current;
                    if (!payload && e.dataTransfer) {
                      const raw = e.dataTransfer.getData('application/canva-drag-payload');
                      if (raw) {
                        try {
                          payload = JSON.parse(raw) as SidebarDragPayload;
                        } catch {}
                      }
                    }

                    if (payload) {
                      const box = getDragBoxSize(payload);
                      setDropPreview({ x, y, ...box });
                    } else {
                      setDropPreview({ x, y, width: 180, height: 140, label: 'Drop to add' });
                    }
                  }}
                  onDragLeave={(e) => {
                    if (!artboardRef.current) return;
                    const related = e.relatedTarget as Node | null;
                    if (!related || !artboardRef.current.contains(related)) {
                      setDropPreview(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDropPreview(null);
                    if (!artboardRef.current) return;
                    const rect = artboardRef.current.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / scaleFactor;
                    const y = (e.clientY - rect.top) / scaleFactor;

                    let payload: SidebarDragPayload | null = activeSidebarDragRef.current;
                    if (!payload) {
                      const raw =
                        e.dataTransfer.getData('application/canva-drag-payload') ||
                        e.dataTransfer.getData('text/plain');
                      if (raw) {
                        try {
                          const parsed = JSON.parse(raw);
                          if (parsed && typeof parsed.kind === 'string') {
                            payload = parsed as SidebarDragPayload;
                          }
                        } catch {}
                      }
                    }

                    if (payload) {
                      activeSidebarDragRef.current = null;
                      setActiveSidebarDrag(null);
                      switch (payload.kind) {
                        case 'shape':
                          handleAddShape(payload.shapeKind, { x, y });
                          showToast(`Dropped ${payload.label}`);
                          return;
                        case 'sticker':
                          handleAddSticker(payload.emoji, { x, y });
                          showToast(`Dropped sticker ${payload.emoji}`);
                          return;
                        case 'text':
                          handleAddText(payload.textRole, { x, y });
                          showToast(`Dropped ${payload.label}`);
                          return;
                        case 'font_pairing': {
                          const pair = FONT_PAIRINGS.find((fp) => fp.id === payload?.pairId);
                          if (pair) {
                            handleAddFontPairing(pair, { x, y });
                            showToast(`Dropped "${pair.name}" typography`);
                          }
                          return;
                        }
                        case 'badge':
                          handleAddBadge(payload.badge, { x, y });
                          showToast(`Dropped "${payload.badge.label}"`);
                          return;
                        case 'chart':
                          handleAddChart(payload.chartKind, { x, y });
                          showToast(`Dropped ${payload.label}`);
                          return;
                        case 'qrcode':
                          handleAddQrCode(payload.url, { x, y });
                          showToast('Dropped Scannable QR Code');
                          return;
                        case 'image':
                          handleAddImageToCanvas(payload.url, payload.name, {
                            x,
                            y,
                            borderRadius: payload.borderRadius,
                            magicCutout: payload.magicCutout,
                          });
                          showToast(`Dropped "${payload.name}"`);
                          return;
                        case 'template': {
                          const tpl = allAvailableTemplates.find((t) => t.id === payload?.templateId);
                          if (tpl) handleLoadTemplate(tpl);
                          return;
                        }
                      }
                    }

                    const assetJson = e.dataTransfer.getData('application/canva-asset');
                    if (assetJson) {
                      try {
                        const parsed = JSON.parse(assetJson) as UploadedAsset;
                        handleAddImageToCanvas(parsed.url, parsed.name, { x, y });
                        return;
                      } catch {}
                    }
                    if (e.dataTransfer.files.length > 0) {
                      handleUploadFiles(e.dataTransfer.files, { x, y });
                    }
                  }}
                  className={`relative shadow-2xl transition-shadow rounded-sm border ${
                    dropPreview || activeSidebarDrag
                      ? 'border-[#7d2ae8] ring-2 ring-[#7d2ae8]/40'
                      : 'border-slate-300'
                  } ${
                    activeRailTab === 'draw' ? 'cursor-crosshair' : copiedStyle ? 'cursor-copy' : ''
                  }`}
                  style={{
                    width: `${baseArtboardSize.width}px`,
                    height: `${baseArtboardSize.height}px`,
                    background: activePage.backgroundGradient || activePage.backgroundColor,
                    transform: `scale(${scaleFactor})`,
                    transformOrigin: 'top center',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.18), 0 2px 10px -2px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Print Margins Overlay */}
                  {showMargins && (
                    <div className="absolute inset-7 border border-dashed border-cyan-500/60 pointer-events-none z-40" />
                  )}

                  {/* Active Sidebar Drag-and-Drop Ghost Placement Guide */}
                  {dropPreview && (
                    dropPreview.isTemplate ? (
                      <div className="absolute inset-2 border-2 border-dashed border-[#7d2ae8] bg-[#7d2ae8]/10 rounded-lg pointer-events-none z-50 flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-lg bg-[#7d2ae8] text-white text-xs font-bold shadow-lg">
                          Drop to apply {dropPreview.label.replace('Template: ', '')}
                        </span>
                      </div>
                    ) : (
                      (() => {
                        const clamped = computeArtboardDropPosition(
                          dropPreview.x,
                          dropPreview.y,
                          dropPreview.width,
                          dropPreview.height,
                          baseArtboardSize.width,
                          baseArtboardSize.height
                        );
                        return (
                          <div
                            className="absolute border-2 border-dashed border-[#7d2ae8] bg-[#7d2ae8]/12 rounded-lg pointer-events-none z-50 flex items-center justify-center"
                            style={{
                              left: `${clamped.x}px`,
                              top: `${clamped.y}px`,
                              width: `${dropPreview.width}px`,
                              height: `${dropPreview.height}px`,
                            }}
                          >
                            <span className="px-2 py-0.5 rounded bg-[#7d2ae8] text-white text-[10px] font-bold shadow-sm whitespace-nowrap">
                              {dropPreview.label} ({clamped.x}, {clamped.y})
                            </span>
                          </div>
                        );
                      })()
                    )
                  )}

                  {/* Smart Snap Guidelines */}
                  {snapGuides.x !== undefined && (
                    <div
                      className="absolute top-0 bottom-0 w-[1px] bg-pink-500 pointer-events-none z-50"
                      style={{ left: `${snapGuides.x}px` }}
                    />
                  )}
                  {snapGuides.y !== undefined && (
                    <div
                      className="absolute left-0 right-0 h-[1px] bg-pink-500 pointer-events-none z-50"
                      style={{ top: `${snapGuides.y}px` }}
                    />
                  )}

                  {/* CANVAS ELEMENTS */}
                  {items.map((item) => {
                    if (item.isHidden) return null;
                    const isSelected = selectedIds.includes(item.id);
                    const isPrimarySelected = selectedId === item.id;
                    const isEditing = editingItemId === item.id;
                    const animClass = getAnimationClass(item.animation);

                    return (
                      <div
                        key={item.id}
                        onMouseDown={(e) => {
                          if (activeRailTab === 'draw') return;
                          startInteraction(e, item, 'drag');
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (item.isLocked) return;
                          if (item.type === 'image') {
                            setSelectedId(item.id);
                            setActivePopover('crop');
                          } else if (item.type === 'text' || item.type === 'shape' || item.type === 'badge') {
                            setEditingItemId(item.id);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!selectedIds.includes(item.id)) setSelectedId(item.id);
                          setContextMenu({ x: e.clientX, y: e.clientY, itemId: item.id });
                        }}
                        className={`absolute select-none ${
                          item.isLocked ? 'cursor-not-allowed' : copiedStyle ? 'cursor-copy' : 'cursor-move'
                        } ${animClass} ${
                          isSelected
                            ? item.isLocked
                              ? 'ring-2 ring-amber-400'
                              : item.groupId
                              ? 'ring-2 ring-dashed ring-[#7d2ae8]'
                              : 'ring-2 ring-[#7d2ae8]'
                            : 'hover:ring-1 hover:ring-purple-300'
                        }`}
                        style={{
                          left: `${item.x}px`,
                          top: `${item.y}px`,
                          width: item.width ? `${item.width}px` : undefined,
                          height: item.height ? `${item.height}px` : undefined,
                          opacity: item.opacity ?? 1,
                          transform: `rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${
                            item.flipY ? -1 : 1
                          })`,
                        }}
                      >
                        {/* ELEMENT RENDERING BY TYPE */}
                        {item.type === 'text' && (
                          !isEditing && Math.abs(item.textCurve || 0) >= 5 ? (
                            <svg
                              viewBox={`0 0 ${item.width || 300} ${Math.max(80, (item.fontSize || 24) * 3.5)}`}
                              className="w-full overflow-visible pointer-events-none"
                            >
                              <defs>
                                <path
                                  id={`svg-curve-${item.id}`}
                                  d={`M 0 ${(item.fontSize || 24) * 1.4} Q ${(item.width || 300) / 2} ${
                                    (item.fontSize || 24) * 1.4 - ((item.textCurve || 0) / 100) * Math.min((item.width || 300) * 0.45, 90)
                                  } ${item.width || 300} ${(item.fontSize || 24) * 1.4}`}
                                />
                              </defs>
                              <text
                                fill={item.color}
                                fontSize={item.fontSize || 24}
                                fontFamily={item.fontFamily}
                                fontWeight={item.fontWeight}
                                fontStyle={item.fontStyle}
                              >
                                <textPath href={`#svg-curve-${item.id}`} startOffset="50%" textAnchor="middle">
                                  {formatDisplayText(item)}
                                </textPath>
                              </text>
                            </svg>
                          ) : (
                            <div
                              contentEditable={isEditing}
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                updateItemById(item.id, { content: e.currentTarget.innerText || '' }, true);
                                setEditingItemId(null);
                              }}
                              onKeyDown={(e) => {
                                if (isEditing && e.key === 'Escape') {
                                  e.stopPropagation();
                                  (e.currentTarget as HTMLElement).blur();
                                }
                              }}
                              onMouseDown={(e) => {
                                if (isEditing) e.stopPropagation();
                              }}
                              className="outline-none whitespace-pre-wrap px-1 leading-tight w-full"
                              style={{
                                color: item.color,
                                fontSize: item.fontSize ? `${item.fontSize}px` : undefined,
                                fontFamily: item.fontFamily,
                                fontWeight: item.fontWeight,
                                fontStyle: item.fontStyle,
                                textDecoration: item.textDecoration,
                                textTransform: item.textTransform,
                                textAlign: item.textAlign,
                                letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : undefined,
                                lineHeight: item.lineHeight || 1.2,
                                ...getTextEffectStyle(item),
                              }}
                            >
                              {isEditing ? item.content : formatDisplayText(item)}
                            </div>
                          )
                        )}

                        {(item.type === 'shape' || item.type === 'badge') && (
                          <ShapeRenderer
                            item={item}
                            isEditing={isEditing}
                            onFinishEdit={(val) => {
                              updateItemById(item.id, { content: val }, true);
                              setEditingItemId(null);
                            }}
                          />
                        )}

                        {item.type === 'sticker' && (
                          <div
                            className="w-full h-full flex items-center justify-center leading-none"
                            style={{ fontSize: `${item.fontSize || 48}px`, color: item.color }}
                          >
                            {item.content}
                          </div>
                        )}

                        {(item.type === 'qrcode' || item.type === 'chart') && (
                          <QrAndChartRenderer item={item} />
                        )}

                        {item.type === 'image' && item.imageUrl && (
                          <div
                            className="w-full h-full overflow-hidden"
                            style={{ borderRadius: item.magicCutout ? '9999px' : `${item.borderRadius ?? 0}px` }}
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.content}
                              draggable={false}
                              className="w-full h-full object-cover"
                              style={{
                                transform: `translate(${item.imageCrop?.offsetX ?? 0}%, ${item.imageCrop?.offsetY ?? 0}%) scale(${item.imageCrop?.scale ?? 1})`,
                                filter: item.imageFilters
                                  ? `brightness(${item.imageFilters.brightness}%) contrast(${item.imageFilters.contrast}%) saturate(${item.imageFilters.saturate}%) blur(${item.imageFilters.blur}px) grayscale(${item.imageFilters.grayscale}%)`
                                  : undefined,
                              }}
                            />
                          </div>
                        )}

                        {/* CANVA SELECTION HANDLES: 4 CORNERS + ROTATE + FLOATING PILL */}
                        {isPrimarySelected && selectedIds.length === 1 && !isEditing && (
                          <>
                            {!item.isLocked && (
                              <>
                                <div
                                  onMouseDown={(e) => startInteraction(e, item, 'resize-nw')}
                                  className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#7d2ae8] rounded-full shadow-xs cursor-nwse-resize z-30"
                                />
                                <div
                                  onMouseDown={(e) => startInteraction(e, item, 'resize-ne')}
                                  className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#7d2ae8] rounded-full shadow-xs cursor-nesw-resize z-30"
                                />
                                <div
                                  onMouseDown={(e) => startInteraction(e, item, 'resize-sw')}
                                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#7d2ae8] rounded-full shadow-xs cursor-nesw-resize z-30"
                                />
                                <div
                                  onMouseDown={(e) => startInteraction(e, item, 'resize-se')}
                                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#7d2ae8] rounded-full shadow-xs cursor-nwse-resize z-30"
                                />

                                {/* Side width handle */}
                                <div
                                  onMouseDown={(e) => startInteraction(e, item, 'resize-e')}
                                  className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-1.5 h-4 bg-white border border-[#7d2ae8] rounded-full cursor-ew-resize z-30"
                                />

                                {/* Bottom Rotate Handle */}
                                <div
                                  onMouseDown={(e) => startInteraction(e, item, 'rotate')}
                                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border border-slate-300 hover:border-[#7d2ae8] text-slate-700 rounded-full shadow-md flex items-center justify-center cursor-grab z-30"
                                  title="Rotate (Hold Shift to snap 15°)"
                                >
                                  <RotateCw className="w-3 h-3" />
                                </div>
                              </>
                            )}

                            {/* Floating Quick Action Pill (Crisp White Canva Pill) */}
                            <div
                              onMouseDown={(e) => e.stopPropagation()}
                              className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white text-slate-700 px-2.5 py-1 rounded-full shadow-lg border border-slate-200 text-[10px] z-50 whitespace-nowrap"
                            >
                              {interaction?.mode === 'rotate' && (
                                <span className="font-mono text-[#7d2ae8] font-semibold pr-1">{item.rotation || 0}°</span>
                              )}
                              <button
                                onClick={() => duplicateItems([item])}
                                className="hover:text-[#7d2ae8] cursor-pointer p-0.5"
                                title="Duplicate (Ctrl+D)"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <div className="w-[1px] h-3 bg-slate-200 mx-0.5" />
                              <button
                                onClick={() => updateSelected({ isLocked: !item.isLocked })}
                                className="hover:text-amber-600 cursor-pointer p-0.5"
                                title={item.isLocked ? 'Unlock' : 'Lock'}
                              >
                                {item.isLocked ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3" />}
                              </button>
                              <div className="w-[1px] h-3 bg-slate-200 mx-0.5" />
                              <button
                                onClick={deleteSelected}
                                className="hover:text-rose-600 cursor-pointer p-0.5"
                                title="Delete (Del)"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                  {/* FREEHAND DRAW SVG OVERLAY */}
                  <svg
                    viewBox={`0 0 ${baseArtboardSize.width} ${baseArtboardSize.height}`}
                    className="absolute inset-0 w-full h-full pointer-events-none z-30"
                  >
                    {activePage.strokes.map((s) => {
                      if (s.points.length < 2) return null;
                      const d = s.points.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
                      return (
                        <path
                          key={s.id}
                          d={d}
                          fill="none"
                          stroke={s.color}
                          strokeWidth={s.width}
                          strokeOpacity={s.opacity}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    })}

                    {isDrawingStroke && drawTool !== 'eraser' && activeStrokePoints.length > 1 && (
                      <path
                        d={activeStrokePoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')}
                        fill="none"
                        stroke={drawColor}
                        strokeWidth={drawTool === 'highlighter' ? drawWidth * 2.5 : drawTool === 'marker' ? drawWidth * 1.6 : drawWidth}
                        strokeOpacity={drawTool === 'highlighter' ? 0.42 : 1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>

                  {/* MARQUEE BOX DRAG SELECTION OVERLAY */}
                  {marquee && (Math.abs(marquee.curX - marquee.startX) > 4 || Math.abs(marquee.curY - marquee.startY) > 4) && (
                    <div
                      className="absolute border border-[#7d2ae8] bg-[#7d2ae8]/12 pointer-events-none z-50 rounded-xs"
                      style={{
                        left: `${Math.min(marquee.startX, marquee.curX)}px`,
                        top: `${Math.min(marquee.startY, marquee.curY)}px`,
                        width: `${Math.abs(marquee.curX - marquee.startX)}px`,
                        height: `${Math.abs(marquee.curY - marquee.startY)}px`,
                      }}
                    />
                  )}
                </div>

                {/* BELOW-PAGE FULL-WIDTH ADD PAGE BAR (Exact match to canva.com/design/play) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddPage();
                  }}
                  style={{ width: `${Math.round(baseArtboardSize.width * scaleFactor)}px`, minWidth: '280px' }}
                  className="mt-4 py-2 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#7d2ae8] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add page</span>
                </button>
              </div>
            </div>
          )}

          {/* PAGE NOTES DRAWER */}
          {isNotesOpen && (
            <div className="h-28 bg-white border-t border-slate-200 px-4 py-2 flex flex-col shrink-0">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Presenter Notes — Page {activePageIndex + 1}</span>
                <button onClick={() => setIsNotesOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={activePage.notes}
                onChange={(e) => updateActivePage((p) => ({ ...p, notes: e.target.value }), false)}
                placeholder="Write talking points or caption reminders for this page..."
                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none focus:border-[#7d2ae8] resize-none"
              />
            </div>
          )}

          {/* TIMER POPOVER (matches canva.com/design/play footer timer) */}
          {isTimerOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-12 left-20 z-50 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 text-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-[#7d2ae8]" />
                  <span>Presentation Timer</span>
                </span>
                <button onClick={() => setIsTimerOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-2xl font-mono font-bold text-center text-slate-900 tabular-nums py-1 bg-slate-50 rounded-lg border border-slate-200">
                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                {[60, 300, 600].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds(sec);
                    }}
                    className="py-1 rounded-md bg-slate-100 hover:bg-purple-50 text-slate-700 font-semibold cursor-pointer"
                  >
                    {sec / 60} min
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimerRunning((r) => !r)}
                  className="flex-1 py-1.5 rounded-lg bg-[#7d2ae8] hover:bg-[#6b21a8] text-white text-xs font-semibold cursor-pointer"
                >
                  {timerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(300);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* 4. SINGLE-LINE CANVA BOTTOM FOOTER STATUS BAR */}
          <footer className="h-10 bg-white border-t border-slate-200 px-4 flex items-center justify-between gap-4 text-xs text-slate-600 shrink-0 select-none">
            <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
              <button
                onClick={() => setIsNotesOpen((n) => !n)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md font-medium whitespace-nowrap cursor-pointer ${
                  isNotesOpen ? 'bg-purple-50 text-[#7d2ae8] font-semibold' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <StickyNote className="w-3.5 h-3.5" />
                <span>Notes</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTimerOpen((t) => !t);
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md font-medium whitespace-nowrap cursor-pointer ${
                  isTimerOpen || timerRunning ? 'bg-purple-50 text-[#7d2ae8] font-semibold' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span className="tabular-nums">
                  {timerRunning
                    ? `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`
                    : 'Timer'}
                </span>
              </button>

              <span className="text-slate-200 hidden md:inline">|</span>

              <button
                onClick={() => setIsResizeModalOpen(true)}
                className="hidden md:inline font-mono text-[11px] text-slate-500 hover:text-[#7d2ae8] tabular-nums whitespace-nowrap cursor-pointer"
                title="Click to resize"
              >
                {dimensions.width} × {dimensions.height} px
              </button>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
              {/* Zoom Slider + Percentage Selector */}
              <input
                type="range"
                min={40}
                max={200}
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-24 accent-[#7d2ae8] hidden sm:block"
              />
              <select
                value={zoomLevel}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'fit') {
                    handleFitZoom();
                  } else {
                    setZoomLevel(Number(val));
                  }
                }}
                aria-label="Zoom options"
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-700 tabular-nums outline-none cursor-pointer"
              >
                {[42, 50, 75, 100, 125, 150, 200].map((pct) => (
                  <option key={pct} value={pct}>
                    {pct}%
                  </option>
                ))}
                {![42, 50, 75, 100, 125, 150, 200].includes(zoomLevel) && (
                  <option value={zoomLevel}>{zoomLevel}%</option>
                )}
              </select>
              <button
                onClick={handleFitZoom}
                className="px-2 py-1 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer font-semibold whitespace-nowrap"
              >
                Fit
              </button>

              <span className="text-slate-200">|</span>

              {/* Page Pager */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-md px-2 py-1 border border-slate-200 tabular-nums">
                <button
                  onClick={() => {
                    setActivePageIndex((i) => Math.max(0, i - 1));
                    setSelectedId(null);
                  }}
                  disabled={activePageIndex === 0}
                  className="px-1 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                >
                  ◀
                </button>
                <span className="text-[11px] font-semibold text-slate-700 px-1">
                  {activePageIndex + 1} / {pages.length}
                </span>
                <button
                  onClick={() => {
                    setActivePageIndex((i) => Math.min(pages.length - 1, i + 1));
                    setSelectedId(null);
                  }}
                  disabled={activePageIndex >= pages.length - 1}
                  className="px-1 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                >
                  ▶
                </button>
              </div>

              <button
                onClick={() => setIsGridView((g) => !g)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer font-semibold whitespace-nowrap ${
                  isGridView ? 'bg-purple-100 text-[#7d2ae8]' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Grid view</span>
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* RIGHT-CLICK CONTEXT MENU (Clean Canva White Menu) */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 text-xs text-slate-800"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 220), top: Math.min(contextMenu.y, window.innerHeight - 300) }}
        >
          <button
            onClick={() => {
              const targets = selectedItemsList.length > 0 ? selectedItemsList : items.filter((i) => i.id === contextMenu.itemId);
              if (targets.length > 0) setClipboardItems(deepClone(targets));
              setContextMenu(null);
              showToast('Copied');
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex justify-between cursor-pointer"
          >
            <span>Copy</span> <span className="text-slate-400 font-mono">Ctrl+C</span>
          </button>
          <button
            onClick={() => {
              const targets = selectedItemsList.length > 0 ? selectedItemsList : items.filter((i) => i.id === contextMenu.itemId);
              duplicateItems(targets);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex justify-between cursor-pointer"
          >
            <span>Duplicate</span> <span className="text-slate-400 font-mono">Ctrl+D</span>
          </button>
          {selectedIds.length > 1 && (
            <button
              onClick={() => {
                handleGroupSelected();
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex justify-between text-[#7d2ae8] font-medium cursor-pointer"
            >
              <span>Group</span> <span className="text-slate-400 font-mono">Ctrl+G</span>
            </button>
          )}
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => {
              reorderLayer(contextMenu.itemId, 'front');
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 cursor-pointer"
          >
            Bring to front
          </button>
          <button
            onClick={() => {
              reorderLayer(contextMenu.itemId, 'forward');
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 cursor-pointer"
          >
            Bring forward
          </button>
          <button
            onClick={() => {
              reorderLayer(contextMenu.itemId, 'backward');
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 cursor-pointer"
          >
            Send backward
          </button>
          <button
            onClick={() => {
              reorderLayer(contextMenu.itemId, 'back');
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 cursor-pointer"
          >
            Send to back
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => {
              deleteSelected();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 flex justify-between cursor-pointer"
          >
            <span>Delete</span> <span className="text-slate-400 font-mono">Del</span>
          </button>
        </div>
      )}

      {/* RESIZE & MAGIC SWITCH MODAL (Canva Light Surface) */}
      {isResizeModalOpen && (
        <div
          onClick={() => setIsResizeModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 text-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Resize & Magic Switch</span>
              </div>
              <button onClick={() => setIsResizeModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Preset Canvas Dimensions</div>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                {RESIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleResizeDocument(preset.width, preset.height, preset.label)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs cursor-pointer transition-all ${
                      dimensions.width === preset.width && dimensions.height === preset.height
                        ? 'border-[#7d2ae8] bg-purple-50 text-[#7d2ae8]'
                        : 'border-slate-200 bg-slate-50 hover:border-purple-300 text-slate-700'
                    }`}
                  >
                    <span className="font-semibold">{preset.label}</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {preset.width} × {preset.height} px
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Magic Switch Copy Transforms */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-[#7d2ae8]" />
                <span>Magic Switch Copy Transforms</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  onClick={() => handleMagicCopySwitch('uppercase')}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 font-semibold cursor-pointer"
                >
                  ALL CAPS
                </button>
                <button
                  onClick={() => handleMagicCopySwitch('titlecase')}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Title Case
                </button>
                <button
                  onClick={() => handleMagicCopySwitch('concise')}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Make Concise
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="text-xs font-bold text-slate-700">Custom Size (px)</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customW}
                  onChange={(e) => setCustomW(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7d2ae8]"
                  placeholder="Width"
                />
                <span className="text-slate-400">×</span>
                <input
                  type="number"
                  value={customH}
                  onChange={(e) => setCustomH(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#7d2ae8]"
                  placeholder="Height"
                />
                <button
                  onClick={() => {
                    const w = Math.max(200, Math.min(4000, parseInt(customW, 10) || 1080));
                    const h = Math.max(200, Math.min(4000, parseInt(customH, 10) || 1080));
                    handleResizeDocument(w, h, 'Custom Size');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#7d2ae8] hover:bg-[#6b21a8] text-white text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE & REAL DOWNLOAD MODAL (Canva Light Surface) */}
      {isShareModalOpen && (
        <div
          onClick={() => setIsShareModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 text-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="font-bold text-sm text-slate-900">Download & Share Design</div>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">File type</label>
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none focus:border-[#7d2ae8]"
                >
                  <option value="PNG">PNG · Real raster image (lossless)</option>
                  <option value="JPG">JPG · Compressed raster photo</option>
                  <option value="PDF">PDF · Multi-page printable document</option>
                  <option value="SVG">SVG · Scalable vector XML</option>
                  <option value="JSON">JSON · CanvaDocV3 project backup</option>
                </select>
              </div>

              {(downloadFormat === 'PNG' || downloadFormat === 'JPG' || downloadFormat === 'PDF') && (
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Resolution Scale</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setExportScale(1)}
                      className={`py-1.5 rounded-lg border font-mono text-[11px] cursor-pointer ${
                        exportScale === 1 ? 'border-[#7d2ae8] bg-purple-50 text-[#7d2ae8] font-semibold' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      1x ({dimensions.width}×{dimensions.height})
                    </button>
                    <button
                      onClick={() => setExportScale(2)}
                      className={`py-1.5 rounded-lg border font-mono text-[11px] cursor-pointer ${
                        exportScale === 2 ? 'border-[#7d2ae8] bg-purple-50 text-[#7d2ae8] font-semibold' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      2x ({dimensions.width * 2}×{dimensions.height * 2})
                    </button>
                  </div>
                </div>
              )}

              {(downloadFormat === 'PNG' || downloadFormat === 'SVG') && (
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                    className="rounded accent-[#7d2ae8]"
                  />
                  <span>Transparent background</span>
                </label>
              )}

              {downloadFormat === 'PDF' && pages.length > 1 && (
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={exportAllPages}
                    onChange={(e) => setExportAllPages(e.target.checked)}
                    className="rounded accent-[#7d2ae8]"
                  />
                  <span>Export all {pages.length} pages into PDF</span>
                </label>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-2.5 rounded-xl bg-[#7d2ae8] hover:bg-[#6b21a8] text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Rendering design...' : `Download ${downloadFormat}`}</span>
              </button>

              <button
                onClick={() => {
                  const sharePayload = btoa(unescape(encodeURIComponent(JSON.stringify({ title: docTitle, dimensions }))));
                  const link = `${window.location.origin}/?design=${sharePayload.slice(0, 32)}`;
                  navigator.clipboard.writeText(link);
                  setCopiedShareLink(true);
                  showToast('Copied view link to clipboard');
                  setTimeout(() => setCopiedShareLink(false), 2000);
                }}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-[#7d2ae8]" />}
                <span>{copiedShareLink ? 'Link copied!' : 'Copy view link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {isShortcutsModalOpen && (
        <div
          onClick={() => setIsShortcutsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 text-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#7d2ae8]" />
                <span>Canva Keyboard Shortcuts</span>
              </div>
              <button onClick={() => setIsShortcutsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {[
                ['Undo / Redo', 'Ctrl+Z / Ctrl+Y'],
                ['Select All', 'Ctrl+A'],
                ['Multi-select (Click / Box)', 'Shift+Click / Drag Canvas'],
                ['Group / Ungroup', 'Ctrl+G / Ctrl+Shift+G'],
                ['Copy / Paste Element', 'Ctrl+C / Ctrl+V'],
                ['Duplicate Element', 'Ctrl+D'],
                ['Delete Selected', 'Delete / Backspace'],
                ['Nudge 1px / 10px', 'Arrow / Shift+Arrow'],
                ['Bring Forward / Send Backward', 'Ctrl+] / Ctrl+['],
                ['Zoom In / Out / Reset', 'Ctrl++ / Ctrl+- / Ctrl+0'],
                ['Toggle Rulers', 'Shift+R'],
                ['Deselect / Exit Present', 'Escape'],
              ].map(([action, key]) => (
                <div key={action} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700">{action}</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-[#7d2ae8] font-semibold">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PRESENTATION SLIDESHOW MODE (100% PARITY) */}
      {isPresentMode && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6">
          <div className="absolute top-5 right-6 flex items-center gap-3">
            <button
              onClick={() => setShowPresentNotes((n) => !n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                showPresentNotes ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" /> Notes
            </button>
            <span className="text-xs font-mono text-slate-400">
              Slide {activePageIndex + 1} / {pages.length}
            </span>
            <button
              onClick={() => setIsPresentMode(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" /> Exit (Esc)
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActivePageIndex((i) => Math.max(0, i - 1))}
              disabled={activePageIndex === 0}
              className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-700"
              style={{
                width: `${baseArtboardSize.width}px`,
                height: `${baseArtboardSize.height}px`,
                background: activePage.backgroundGradient || activePage.backgroundColor,
              }}
            >
              {activePage.items
                .filter((i) => !i.isHidden)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`absolute ${getAnimationClass(item.animation)}`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: item.width ? `${item.width}px` : undefined,
                      height: item.height ? `${item.height}px` : undefined,
                      opacity: item.opacity ?? 1,
                      transform: `rotate(${item.rotation || 0}deg) scaleX(${item.flipX ? -1 : 1}) scaleY(${item.flipY ? -1 : 1})`,
                    }}
                  >
                    {item.type === 'text' ? (
                      Math.abs(item.textCurve || 0) >= 5 ? (
                        <svg
                          viewBox={`0 0 ${item.width || 300} ${Math.max(80, (item.fontSize || 24) * 3.5)}`}
                          className="w-full overflow-visible pointer-events-none"
                        >
                          <defs>
                            <path
                              id={`pres-curve-${item.id}`}
                              d={`M 0 ${(item.fontSize || 24) * 1.4} Q ${(item.width || 300) / 2} ${
                                (item.fontSize || 24) * 1.4 - ((item.textCurve || 0) / 100) * Math.min((item.width || 300) * 0.45, 90)
                              } ${item.width || 300} ${(item.fontSize || 24) * 1.4}`}
                            />
                          </defs>
                          <text
                            fill={item.color}
                            fontSize={item.fontSize || 24}
                            fontFamily={item.fontFamily}
                            fontWeight={item.fontWeight}
                            fontStyle={item.fontStyle}
                          >
                            <textPath href={`#pres-curve-${item.id}`} startOffset="50%" textAnchor="middle">
                              {formatDisplayText(item)}
                            </textPath>
                          </text>
                        </svg>
                      ) : (
                        <div
                          className="whitespace-pre-wrap px-1 leading-tight w-full"
                          style={{
                            color: item.color,
                            fontSize: item.fontSize ? `${item.fontSize}px` : undefined,
                            fontFamily: item.fontFamily,
                            fontWeight: item.fontWeight,
                            fontStyle: item.fontStyle,
                            textDecoration: item.textDecoration,
                            textTransform: item.textTransform,
                            textAlign: item.textAlign,
                            letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : undefined,
                            lineHeight: item.lineHeight || 1.2,
                            ...getTextEffectStyle(item),
                          }}
                        >
                          {formatDisplayText(item)}
                        </div>
                      )
                    ) : item.type === 'image' && item.imageUrl ? (
                      <div
                        className="w-full h-full overflow-hidden"
                        style={{ borderRadius: item.magicCutout ? '9999px' : `${item.borderRadius ?? 0}px` }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.content}
                          className="w-full h-full object-cover"
                          style={{
                            transform: `translate(${item.imageCrop?.offsetX ?? 0}%, ${item.imageCrop?.offsetY ?? 0}%) scale(${item.imageCrop?.scale ?? 1})`,
                            filter: item.imageFilters
                              ? `brightness(${item.imageFilters.brightness}%) contrast(${item.imageFilters.contrast}%) saturate(${item.imageFilters.saturate}%) blur(${item.imageFilters.blur}px) grayscale(${item.imageFilters.grayscale}%)`
                              : undefined,
                          }}
                        />
                      </div>
                    ) : item.type === 'sticker' ? (
                      <div className="w-full h-full flex items-center justify-center leading-none" style={{ fontSize: `${item.fontSize || 48}px`, color: item.color }}>
                        {item.content}
                      </div>
                    ) : item.type === 'qrcode' || item.type === 'chart' ? (
                      <QrAndChartRenderer item={item} />
                    ) : (
                      <ShapeRenderer item={item} />
                    )}
                  </div>
                ))}

              {/* Presentation Mode Freehand Draw Strokes Overlay */}
              <svg
                viewBox={`0 0 ${baseArtboardSize.width} ${baseArtboardSize.height}`}
                className="absolute inset-0 w-full h-full pointer-events-none z-30"
              >
                {activePage.strokes.map((s) => {
                  if (s.points.length < 2) return null;
                  const d = s.points.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
                  return (
                    <path
                      key={s.id}
                      d={d}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={s.width}
                      strokeOpacity={s.opacity}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}
              </svg>
            </div>

            <button
              onClick={() => setActivePageIndex((i) => Math.min(pages.length - 1, i + 1))}
              disabled={activePageIndex >= pages.length - 1}
              className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {showPresentNotes && (
            <div className="mt-5 max-w-xl w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-200">
              <div className="text-[10px] font-bold uppercase text-purple-400 mb-1">Speaker Notes — Page {activePageIndex + 1}</div>
              <div>{activePage.notes || 'No presenter notes for this slide.'}</div>
            </div>
          )}
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
