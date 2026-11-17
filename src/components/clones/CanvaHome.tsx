import React, { useMemo, useState } from 'react';
import {
  Home,
  FolderKanban,
  LayoutTemplate,
  Crown,
  Grid2X2,
  Plus,
  Search,
  Sparkles,
  FileImage,
  Presentation,
  Smartphone,
  Youtube,
  FileText,
  RectangleHorizontal,
  ArrowRight,
  SlidersHorizontal,
  FlaskConical,
} from 'lucide-react';
import { useREA } from '../../context/REAContext';
import { RESIZE_PRESETS, TEMPLATES_CATALOG } from './canva/presets';

const STORAGE_KEY = 'canva_cleanroom_draft_v2';

type HomeSection = 'home' | 'projects' | 'templates' | 'brand';

export const CanvaHome: React.FC = () => {
  const { setWorkspaceMode, setPendingCanvaPreset, setIsDeepImproveModalOpen } = useREA();
  const [section, setSection] = useState<HomeSection>('home');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const savedDraft = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const page0 = Array.isArray(parsed.pages) ? parsed.pages[0] : null;
      const textItems = Array.isArray(page0?.items)
        ? page0.items.filter((i: any) => i.type === 'text' || i.type === 'badge')
        : [];
      const primaryText = textItems.sort((a: any, b: any) => (b.fontSize || 0) - (a.fontSize || 0))[0];
      return {
        title: parsed.docTitle || 'Untitled Design',
        width: parsed.dimensions?.width || 1080,
        height: parsed.dimensions?.height || 1080,
        label: parsed.dimensions?.label || 'Instagram Post (Square)',
        pageCount: Array.isArray(parsed.pages) ? parsed.pages.length : 1,
        layerCount: Array.isArray(page0?.items) ? page0.items.length : 0,
        bgColor: page0?.backgroundGradient || page0?.backgroundColor || '#ffffff',
        previewHeadline: primaryText?.content || parsed.docTitle || 'Untitled Design',
        previewAccent: primaryText?.color || '#1e1b4b',
      };
    } catch {
      return null;
    }
  }, []);

  const formatMeta = [
    { ...RESIZE_PRESETS[0], shortTitle: 'Instagram Post', color: 'from-violet-600 to-fuchsia-500', icon: FileImage },
    { ...RESIZE_PRESETS[3], shortTitle: 'Presentation', color: 'from-amber-500 to-orange-500', icon: Presentation },
    { ...RESIZE_PRESETS[1], shortTitle: 'Story / Reel', color: 'from-pink-500 to-rose-500', icon: Smartphone },
    { ...RESIZE_PRESETS[2], shortTitle: 'Video Thumbnail', color: 'from-red-500 to-rose-600', icon: Youtube },
    { ...RESIZE_PRESETS[4], shortTitle: 'Flyer & Print', color: 'from-cyan-500 to-teal-500', icon: FileText },
    { ...RESIZE_PRESETS[5], shortTitle: 'Web Banner', color: 'from-blue-600 to-indigo-600', icon: RectangleHorizontal },
  ];

  const filteredTemplates = TEMPLATES_CATALOG.filter((tpl) => {
    const catOk = selectedCategory === 'All' || tpl.category === selectedCategory;
    const q = query.trim().toLowerCase();
    const qOk = !q || tpl.title.toLowerCase().includes(q) || tpl.category.toLowerCase().includes(q);
    return catOk && qOk;
  });

  const openBlankFormat = (preset: { width: number; height: number; label: string }) => {
    setPendingCanvaPreset({
      dimensions: { width: preset.width, height: preset.height, label: preset.label },
      title: `Untitled ${preset.label}`,
      resetBlank: true,
    });
    setWorkspaceMode('canva');
  };

  const openTemplate = (tplId: string, title: string) => {
    setPendingCanvaPreset({ templateId: tplId, title });
    setWorkspaceMode('canva');
  };

  return (
    <div className="h-screen w-screen flex bg-[#f8f9fc] text-slate-900 overflow-hidden font-sans select-none">
      {/* Left Canva Navigation Rail */}
      <aside className="w-[228px] bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-5">
          {/* Canva Script Logo */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setSection('home')}
              className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#00c4cc] via-[#5c33ff] to-[#7d2ae8] bg-clip-text text-transparent font-display cursor-pointer"
            >
              Canva
            </button>
          </div>

          {/* Primary Create Button */}
          <button
            onClick={() => openBlankFormat(RESIZE_PRESETS[0])}
            className="w-full py-2.5 px-4 rounded-xl bg-[#8b3dff] hover:bg-[#7d2ae8] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create a design</span>
          </button>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'projects', label: 'Projects', icon: FolderKanban },
              { id: 'templates', label: 'Templates', icon: LayoutTemplate },
              { id: 'brand', label: 'Brand', icon: Crown },
            ].map((nav) => {
              const Icon = nav.icon;
              const active = section === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setSection(nav.id as HomeSection)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#f1ebfe] text-[#7d2ae8] font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#7d2ae8]' : 'text-slate-500'}`} />
                  <span>{nav.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Workspace Utilities */}
        <div className="space-y-1.5 pt-4 border-t border-slate-200">
          <button
            onClick={() => {
              setPendingCanvaPreset(null);
              setWorkspaceMode('canva');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span>Resume Current Design</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#7d2ae8]" />
          </button>
          <button
            onClick={() => setWorkspaceMode('spec_tests')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Spec & Verification</span>
          </button>
          <button
            onClick={() => setIsDeepImproveModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>REA Workspace Tools</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Utility Strip */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between gap-6 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <button onClick={() => setSection('templates')} className="hover:text-slate-900 whitespace-nowrap cursor-pointer">
              Templates
            </button>
            <button onClick={() => openBlankFormat(RESIZE_PRESETS[3])} className="hover:text-slate-900 whitespace-nowrap cursor-pointer">
              Presentations
            </button>
            <button onClick={() => openBlankFormat(RESIZE_PRESETS[0])} className="hover:text-slate-900 whitespace-nowrap cursor-pointer">
              Social
            </button>
            <button onClick={() => openBlankFormat(RESIZE_PRESETS[4])} className="hover:text-slate-900 whitespace-nowrap cursor-pointer">
              Print
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setPendingCanvaPreset(null);
                setWorkspaceMode('canva');
              }}
              className="px-4 py-2 rounded-xl bg-[#8b3dff] hover:bg-[#7d2ae8] text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              Open Design Editor
            </button>
          </div>
        </header>

        <div className="max-w-6xl w-full mx-auto px-8 py-7 space-y-9">
          {/* Canva Signature Teal-to-Violet Hero Banner */}
          <section
            className="rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(125deg, #00c4cc 0%, #5a32fa 46%, #7d2ae8 100%)' }}
          >
            <div className="max-w-2xl mx-auto text-center space-y-5 relative z-10">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display">
                What will you design today?
              </h1>

              {/* Search Input */}
              <div className="relative max-w-xl mx-auto">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search templates, social posts, presentations..."
                  className="w-full h-11 bg-white text-slate-900 placeholder-slate-400 rounded-xl pl-11 pr-4 text-sm outline-none shadow-md focus:ring-2 focus:ring-white/60"
                />
              </div>

              {/* Format Quick-Create Chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                {formatMeta.map((fmt) => {
                  const Icon = fmt.icon;
                  return (
                    <button
                      key={fmt.label}
                      onClick={() => openBlankFormat(fmt)}
                      className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/95 group-hover:scale-105 shadow-md flex items-center justify-center transition-transform">
                        <Icon className="w-5 h-5 text-[#7d2ae8]" />
                      </div>
                      <span className="text-xs font-medium text-white/95 whitespace-nowrap">
                        {fmt.shortTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Recent Designs */}
          {(section === 'home' || section === 'projects') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 font-display">Recent designs</h2>
                <button
                  onClick={() => openBlankFormat(RESIZE_PRESETS[0])}
                  className="text-xs font-semibold text-[#7d2ae8] hover:underline cursor-pointer"
                >
                  New blank canvas
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Live Draft Card */}
                {savedDraft && (
                  <div
                    onClick={() => {
                      setPendingCanvaPreset(null);
                      setWorkspaceMode('canva');
                    }}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-[#7d2ae8] overflow-hidden cursor-pointer transition-all hover:shadow-md"
                  >
                    <div
                      className="h-40 p-4 flex flex-col justify-between relative border-b border-slate-100"
                      style={{ background: savedDraft.bgColor }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-[#7d2ae8] w-max">
                        Saved Draft · {savedDraft.layerCount} layers
                      </span>
                      <div
                        className="text-base font-extrabold leading-tight line-clamp-2 font-display"
                        style={{ color: savedDraft.previewAccent }}
                      >
                        {savedDraft.previewHeadline}
                      </div>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#7d2ae8]">
                        {savedDraft.title}
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums">
                        {savedDraft.width} × {savedDraft.height} px · {savedDraft.pageCount} pages
                      </div>
                    </div>
                  </div>
                )}

                {/* Featured Editable Designs */}
                {TEMPLATES_CATALOG.slice(0, savedDraft ? 3 : 4).map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => openTemplate(tpl.id, tpl.title)}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-[#7d2ae8] overflow-hidden cursor-pointer transition-all hover:shadow-md"
                  >
                    <div
                      className={`h-40 p-4 bg-gradient-to-br ${tpl.previewBg} flex flex-col justify-between ${
                        tpl.previewDarkText ? 'text-stone-900' : 'text-white'
                      }`}
                    >
                      <span className="text-[11px] font-semibold tracking-wide opacity-85">
                        {tpl.previewBadge}
                      </span>
                      <div className="text-lg font-extrabold leading-tight font-display">
                        {tpl.previewHeadline}
                      </div>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#7d2ae8]">
                        {tpl.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {tpl.category} · 1080 × 1080 px
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Templates Gallery */}
          <section className="space-y-4 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 font-display">Templates for you</h2>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                {['All', 'Summer Sale', 'Tech', 'Music', 'Quote', 'Minimal', 'Business'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => openTemplate(tpl.id, tpl.title)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-[#7d2ae8] overflow-hidden cursor-pointer transition-all hover:shadow-md flex flex-col"
                >
                  <div
                    className={`h-44 p-5 bg-gradient-to-br ${tpl.previewBg} flex flex-col justify-between ${
                      tpl.previewDarkText ? 'text-stone-900' : 'text-white'
                    }`}
                  >
                    <span className="text-xs font-semibold opacity-80">{tpl.previewBadge}</span>
                    <div className="text-2xl font-extrabold font-display leading-tight">
                      {tpl.previewHeadline}
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-[#7d2ae8]">
                        {tpl.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {tpl.category} · {tpl.items.length} editable layers
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#7d2ae8] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>Customize</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
