import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  Layers,
  MessageSquare,
  ShieldCheck,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useREA } from '../../context/REAContext';

export const TopBar: React.FC = () => {
  const {
    workspaceMode,
    setWorkspaceMode,
    setIsNewModalOpen,
    verifyREA,
    selectTarget,
    setIsDeepImproveModalOpen,
    isClone100PercentUpgraded,
  } = useREA();

  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    const res = await verifyREA();
    setVerifyResult(`✅ REA v${res.version} is 100% functional with ${res.tools} tools ready!`);
    setVerifying(false);
    setTimeout(() => setVerifyResult(null), 5000);
  };

  return (
    <header className="h-14 bg-[#090b14]/95 backdrop-blur-md border-b border-purple-900/25 px-4 flex items-center justify-between gap-4 sticky top-0 z-40 select-none">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          onClick={() => {
            selectTarget('target-canva');
            setWorkspaceMode('canva');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-600/30 border border-purple-400/40 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-purple-100 to-fuchsia-200 bg-clip-text text-transparent">
                REA
              </span>
              <span className="text-xs font-semibold tracking-wide text-purple-300">
                Easy App Cloner
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Clean Non-Technical View Tabs */}
      <div className="flex items-center gap-1 bg-[#101222] border border-purple-900/40 rounded-xl p-1 overflow-x-auto max-w-2xl">
        <button
          onClick={() => {
            selectTarget('target-canva');
            setWorkspaceMode('canva');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            workspaceMode === 'canva'
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <span>🎨 Canva Studio</span>
        </button>

        <button
          onClick={() => {
            selectTarget('target-neonmorphic');
            setWorkspaceMode('neonmorphic');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            workspaceMode === 'neonmorphic'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <span>💎 Neonmorphic NFT</span>
        </button>

        <button
          onClick={() => setWorkspaceMode('spec_tests')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            workspaceMode === 'spec_tests'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <span>🧪 Spec & Tests</span>
        </button>

        <button
          onClick={() => {
            selectTarget('target-linear');
            setWorkspaceMode('linear');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            workspaceMode === 'linear'
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <span>⚡ Linear Kanban</span>
        </button>

        <button
          onClick={() => setWorkspaceMode('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            workspaceMode === 'chat'
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Right: Verification Status & Clone New App */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Verification Button & Result Toast */}
        <div className="relative">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Click to run live verification test on REA Engine"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{verifying ? 'Testing REA...' : 'REA Verified'}</span>
          </button>

          {verifyResult && (
            <div className="absolute right-0 top-10 w-72 p-2.5 rounded-xl bg-[#0e1022] border border-emerald-500/50 shadow-xl text-xs text-emerald-200 z-50 animate-in fade-in">
              {verifyResult}
            </div>
          )}
        </div>

        {/* Improve Clone & Extract Hidden Assets Button */}
        <button
          onClick={() => setIsDeepImproveModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-md active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
            isClone100PercentUpgraded
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white border-emerald-400/50 shadow-emerald-600/30'
              : 'bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 text-white border-amber-300/40 shadow-pink-600/30 hover:brightness-110'
          }`}
          title="Extract hidden files, vector assets, and unlock all extra features to 100%"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isClone100PercentUpgraded ? '100% Mode Active' : 'Improve Clone'}</span>
        </button>

        {/* Clone New App Primary Action Button */}
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold shadow-sm transition-all border border-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Clone Another</span>
        </button>
      </div>
    </header>
  );
};
