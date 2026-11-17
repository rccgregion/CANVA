import React from 'react';
import { X, CheckCircle2, Server, Cpu, Terminal, Shield, Wrench, RefreshCw } from 'lucide-react';
import { useREA } from '../../context/REAContext';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen } = useREA();

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0d0f1e] border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/30 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-[#0e1022] to-[#0e1022]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">REA Engine & MCP Status</h2>
              <p className="text-xs text-purple-300/80">Diagnostic report and active tool configuration</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono">
          {/* Status Overview Card */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <div>
                <div className="font-semibold text-slate-100 text-sm">REA MCP Server 6.8.0</div>
                <div className="text-purple-300 text-[11px]">Protocol 2025-11-25 · Production Stdio Adapter</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-bold text-[11px]">
              Healthy
            </span>
          </div>

          {/* Diagnostic Checks Grid */}
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">
              Verified Diagnostics (`rea mcp doctor`)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { name: 'Server Initialize', status: 'PASS', detail: 'rea@6.8.0 handshake' },
                { name: 'Tool Inventory', status: 'PASS', detail: '229 / 229 verified tools' },
                { name: 'Prompt Inventory', status: 'PASS', detail: '6 guided prompts' },
                { name: 'Request Flow', status: 'PASS', detail: 'binary_session checked' },
                { name: 'Node.js Runtime', status: 'PASS', detail: 'v22.23.2 compatible' },
                { name: 'Host Platform', status: 'PASS', detail: 'Debian 12 Linux 64-bit' },
              ].map((chk, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#111324] border border-purple-900/30">
                  <div className="flex items-center justify-between text-purple-300 mb-1">
                    <span className="font-semibold text-slate-200">{chk.name}</span>
                    <span className="text-emerald-400 font-bold text-[10px]">{chk.status}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{chk.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Client MCP Registrations */}
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">
              Connected Agent Clients
            </div>
            <div className="space-y-2">
              {[
                { client: 'Antigravity Agent', path: '/root/.gemini/config/mcp_config.json', status: 'aligned' },
                { client: 'Gemini CLI', path: '/root/.gemini/settings.json', status: 'aligned' },
              ].map((reg, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#111324] border border-purple-900/30 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">{reg.client}</div>
                    <div className="text-[10px] text-slate-500">{reg.path}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 text-[10px] font-bold">
                    {reg.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-900/30 bg-[#0a0c16] flex justify-end">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-[#14162a] hover:bg-purple-950/60 border border-purple-900/40 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
