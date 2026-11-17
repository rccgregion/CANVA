import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Trash2,
  FileCode,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useREA } from '../../context/REAContext';

export const LeftSidebar: React.FC = () => {
  const {
    targets,
    activeTargetId,
    selectTarget,
    deleteTarget,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setIsNewModalOpen,
    setActiveEvidenceTab,
    setIsDeepImproveModalOpen,
  } = useREA();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTargets = targets.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isSidebarCollapsed) {
    return (
      <aside className="w-14 bg-[#0a0c16]/95 border-r border-purple-900/20 flex flex-col items-center py-3 gap-3 shrink-0 select-none">
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 transition-colors"
          title="Expand Menu"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30"
          title="Clone New App"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsDeepImproveModalOpen(true)}
          className="w-9 h-9 rounded-xl bg-purple-950/70 border border-purple-500/50 flex items-center justify-center text-purple-200 hover:text-white hover:bg-purple-900 transition-colors"
          title="Improve Clone & Extract Hidden Assets"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
        </button>

        <div className="flex flex-col gap-2 w-full px-2 mt-2">
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTarget(t.id)}
              className={`w-9 h-9 mx-auto rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                t.id === activeTargetId
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
              title={t.name}
            >
              {t.name.charAt(0)}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-[#0a0c16]/95 border-r border-purple-900/20 flex flex-col shrink-0 select-none overflow-hidden">
      {/* Top Header */}
      <div className="p-3 border-b border-purple-900/20 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">Cloned Applications</span>
        <button
          onClick={() => setIsSidebarCollapsed(true)}
          className="p-1 rounded text-slate-400 hover:text-slate-200"
          title="Collapse"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Action Buttons */}
      <div className="p-3 pb-2 space-y-2">
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 border border-purple-400/30 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Clone Another App</span>
        </button>

        <button
          onClick={() => setIsDeepImproveModalOpen(true)}
          className="w-full py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer hover:text-white"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Improve & Extract Assets</span>
        </button>
      </div>

      {/* Simple Search */}
      <div className="px-3 pb-2">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search cloned apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121424] border border-purple-900/30 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Target Apps List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1.5 pb-4">
        <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider px-2 pt-1 mb-1">
          Available Clones
        </div>

        {filteredTargets.map((target) => {
          const isActive = target.id === activeTargetId;
          return (
            <div
              key={target.id}
              onClick={() => selectTarget(target.id)}
              className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-purple-950/60 border border-purple-500/50 text-white shadow-sm'
                  : 'hover:bg-[#121424] border border-transparent text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isActive ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {target.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate flex items-center gap-1">
                    <span>{target.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{target.description}</div>
                </div>
              </div>

              {targets.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTarget(target.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400"
                  title="Remove"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* View Code & Files Shortcut */}
        <div className="pt-3">
          <button
            onClick={() => setActiveEvidenceTab('code')}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#121424] transition-colors"
          >
            <FileCode className="w-4 h-4 text-purple-400" />
            <span>View Cloned React Code</span>
          </button>
        </div>
      </div>

      {/* Engine Status at bottom */}
      <div className="p-3 border-t border-purple-900/20 bg-[#080911] text-xs text-slate-400">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-slate-200">REA Engine Functional</span>
        </div>
        <p className="text-[11px] text-slate-500">229 tools active · Ready to clone</p>
      </div>
    </aside>
  );
};
