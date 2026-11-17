import React, { useState } from 'react';
import { X, Sparkles, Globe, Layers, Check } from 'lucide-react';
import { useREA } from '../../context/REAContext';
import { TargetType } from '../../types/rea';

export const NewInvestigationModal: React.FC = () => {
  const { isNewModalOpen, setIsNewModalOpen, startNewInvestigation, setWorkspaceMode } = useREA();

  const [targetName, setTargetName] = useState('Canva');
  const [targetPath, setTargetPath] = useState('https://www.canva.com');
  const [goal, setGoal] = useState('Clone the graphic design editor, left toolbars, templates, and interactive artboard.');

  if (!isNewModalOpen) return null;

  const popularClones = [
    {
      name: 'Canva',
      url: 'https://www.canva.com',
      desc: 'Graphic design editor with templates, text tools, stickers, and export.',
    },
    {
      name: 'Neonmorphic',
      url: 'https://neonmorphic.art',
      desc: 'Cyberpunk dark NFT marketplace with live bidding, wallet, and creators.',
    },
    {
      name: 'Linear',
      url: 'https://linear.app',
      desc: 'Sleek dark-mode task board with drag-and-drop columns.',
    },
    {
      name: 'Spotify',
      url: 'https://open.spotify.com',
      desc: 'Music player with playlists, album view, and audio controls.',
    },
    {
      name: 'Figma',
      url: 'https://www.figma.com',
      desc: 'Collaborative canvas whiteboard with shapes and drawing tools.',
    },
  ];

  const handleSelectPreset = (p: typeof popularClones[0]) => {
    setTargetName(p.name);
    setTargetPath(p.url);
    setGoal(`Clone ${p.name}'s frontend interface, navigation, and features.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startNewInvestigation({
      name: targetName,
      type: 'web' as TargetType,
      path: targetPath,
      goal,
      depth: 'balanced',
      focus: ['ui', 'layout'],
    });
    setIsNewModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0d0f1e] border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/30 flex items-center justify-between bg-gradient-to-r from-purple-950/50 to-[#0e1022]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Clone Any App or Website</h2>
              <p className="text-xs text-purple-300/80">
                Choose a popular app or type any website to recreate its interface
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick 1-Click Popular Apps */}
          <div>
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2 block">
              1-Click Popular Apps to Clone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {popularClones.map((p, idx) => {
                const isSelected = targetName === p.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-400 text-white shadow-md shadow-purple-950/40'
                        : 'bg-[#121426] border-purple-900/30 text-slate-300 hover:border-purple-600/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{p.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target App Name & URL */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-200 mb-1.5 block">App or Website Name</label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. Canva, Netflix, Notion..."
                required
                className="w-full bg-[#121426] border border-purple-900/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/80"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-200 mb-1.5 block">Website Address (Optional)</label>
              <input
                type="text"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-[#121426] border border-purple-900/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/80 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-200 mb-1.5 block">What do you want to clone?</label>
              <textarea
                rows={2}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe what features, screens, or layout to copy..."
                className="w-full bg-[#121426] border border-purple-900/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500/80 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Clone App Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
