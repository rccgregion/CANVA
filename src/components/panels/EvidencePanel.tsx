import React, { useState } from 'react';
import {
  Sparkles,
  Code2,
  Network,
  Download,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Layers,
  FileText,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { useREA, EvidenceTab } from '../../context/REAContext';
import { EvidenceItem, StructureNode } from '../../types/rea';

export const EvidencePanel: React.FC = () => {
  const {
    activeEvidenceTab,
    setActiveEvidenceTab,
    isEvidencePanelCollapsed,
    setIsEvidencePanelCollapsed,
    evidence,
    codeFiles,
    structure,
    artifacts,
    timeline,
    selectedCodeFileId,
    setSelectedCodeFileId,
    setIsDeepImproveModalOpen,
    isClone100PercentUpgraded,
  } = useREA();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<StructureNode | null>(structure.nodes[0] || null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [zoom, setZoom] = useState(1);

  const selectedFile = codeFiles.find((f) => f.id === selectedCodeFileId) || codeFiles[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = (name: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isEvidencePanelCollapsed) {
    return (
      <aside className="w-12 bg-[#090b14]/95 border-l border-purple-900/20 flex flex-col items-center py-3 gap-3 shrink-0 select-none">
        <button
          onClick={() => setIsEvidencePanelCollapsed(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 transition-colors"
          title="Open Information Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="w-6 h-[1px] bg-slate-800 my-1" />

        {[
          { id: 'evidence', icon: Sparkles, label: 'Discovered Features' },
          { id: 'code', icon: Code2, label: 'React Code' },
          { id: 'structure', icon: Network, label: 'Visual Layout' },
          { id: 'artifacts', icon: Download, label: 'Exported Files' },
          { id: 'timeline', icon: Clock, label: 'Step History' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeEvidenceTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveEvidenceTab(tab.id as EvidenceTab);
                setIsEvidencePanelCollapsed(false);
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
              title={tab.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </aside>
    );
  }

  return (
    <aside className="w-96 bg-[#0a0c16]/95 border-l border-purple-900/20 flex flex-col shrink-0 select-none overflow-hidden h-full">
      {/* Header Tabs */}
      <div className="p-3 border-b border-purple-900/20 flex items-center justify-between gap-1 bg-[#0d0f1e] shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'evidence', label: 'Features' },
            { id: 'code', label: 'Code' },
            { id: 'structure', label: 'Layout Map' },
            { id: 'artifacts', label: 'Downloads' },
            { id: 'timeline', label: 'History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveEvidenceTab(tab.id as EvidenceTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                activeEvidenceTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsEvidencePanelCollapsed(true)}
          className="p-1 rounded text-slate-400 hover:text-white shrink-0"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Deep Extract / Improve Callout */}
      <div className="px-3 pt-2.5 pb-1 shrink-0">
        <button
          onClick={() => setIsDeepImproveModalOpen(true)}
          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm ${
            isClone100PercentUpgraded
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-gradient-to-r from-purple-950/60 to-pink-950/60 border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isClone100PercentUpgraded ? '100% Replication Active' : 'Improve Clone to 100%'}</span>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/40 text-purple-300">
            {isClone100PercentUpgraded ? 'Extracted' : 'Deep Scan'}
          </span>
        </button>
      </div>

      {/* Tab 1: Features Discovered */}
      {activeEvidenceTab === 'evidence' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Recreated Features ({evidence.length})
          </div>

          {evidence.map((item) => {
            const isExp = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-purple-900/30 bg-[#0e1022] overflow-hidden hover:border-purple-500/40 transition-colors"
              >
                <div
                  onClick={() => setExpandedId(isExp ? null : item.id)}
                  className="p-3 cursor-pointer flex items-start justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                        100% Recreated
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-100">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.summary}</p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                      isExp ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {isExp && (
                  <div className="p-3 pt-0 border-t border-purple-900/20 text-xs space-y-2 bg-[#090b16]">
                    <div>
                      <div className="text-[10px] text-purple-300 font-semibold mb-0.5">WHERE IT APPLIES</div>
                      <div className="text-[11px] text-slate-300">{item.location}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold mb-0.5">HOW IT WORKS</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.detailedFinding}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: React Code */}
      {activeEvidenceTab === 'code' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2.5 bg-[#0c0e1c] border-b border-purple-900/20 flex items-center justify-between text-xs">
            <span className="font-semibold text-purple-300 truncate">
              {selectedFile?.filename || 'Component.tsx'}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => selectedFile && handleCopy(selectedFile.code)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#14162a] hover:bg-purple-950/60 border border-purple-900/40 text-xs text-purple-200"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
              <button
                onClick={() => selectedFile && handleDownload(selectedFile.filename, selectedFile.code)}
                className="p-1 rounded bg-[#14162a] hover:bg-purple-950/60 text-slate-400 hover:text-white"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 font-mono text-[11px] text-slate-200 leading-relaxed bg-[#06070d]">
            <pre>
              <code>{selectedFile?.code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Visual Layout Map */}
      {activeEvidenceTab === 'structure' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2.5 bg-[#0c0e1c] border-b border-purple-900/20 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Visual App Blueprint</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((prev) => Math.min(prev + 0.15, 1.8))}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((prev) => Math.max(prev - 0.15, 0.6))}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setZoom(1)} className="p-1 rounded text-slate-400 hover:text-white">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-[#07080f] overflow-hidden flex items-center justify-center p-2">
            <svg
              className="w-full h-full transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
              viewBox="0 0 500 400"
            >
              {structure.edges.map((edge) => {
                const sNode = structure.nodes.find((n) => n.id === edge.source);
                const tNode = structure.nodes.find((n) => n.id === edge.target);
                if (!sNode || !tNode) return null;
                return (
                  <line
                    key={edge.id}
                    x1={sNode.x}
                    y1={sNode.y}
                    x2={tNode.x}
                    y2={tNode.y}
                    stroke="rgba(168, 85, 247, 0.4)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                );
              })}

              {structure.nodes.map((node) => {
                const isSel = selectedNode?.id === node.id;
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                    transform={`translate(${node.x}, ${node.y})`}
                  >
                    <circle
                      r={isSel ? 18 : 14}
                      fill={node.type === 'entrypoint' ? '#9333ea' : '#3b82f6'}
                      stroke={isSel ? '#ffffff' : 'rgba(255,255,255,0.3)'}
                      strokeWidth={isSel ? 3 : 1}
                      className="filter drop-shadow(0 0 8px rgba(168,85,247,0.4))"
                    />
                    <text
                      y={26}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="9"
                      fontFamily="sans-serif"
                      className="select-none font-bold"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {selectedNode && (
              <div className="absolute bottom-2 left-2 right-2 p-3 rounded-xl bg-[#0e1022]/95 border border-purple-500/40 backdrop-blur-md text-xs shadow-xl">
                <div className="font-bold text-white mb-0.5">{selectedNode.label}</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{selectedNode.details}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Downloads */}
      {activeEvidenceTab === 'artifacts' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Ready Files ({artifacts.length})
          </div>
          {artifacts.map((art) => (
            <div
              key={art.id}
              className="p-3 rounded-xl border border-purple-900/30 bg-[#0e1022] space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{art.name}</div>
                  <div className="text-[11px] text-purple-400">{art.type}</div>
                </div>
                <button
                  onClick={() => handleDownload(art.name, '// Downloaded from REA')}
                  className="p-2 rounded-lg bg-[#14162a] hover:bg-purple-950/60 text-purple-300 hover:text-white"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">{art.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: History */}
      {activeEvidenceTab === 'timeline' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            What the Cloner Did
          </div>
          <div className="relative pl-4 border-l border-purple-900/30 space-y-3">
            {timeline.map((event) => (
              <div key={event.id} className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-[#0a0c16]" />
                <div className="text-xs font-bold text-white">{event.title}</div>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{event.detail}</p>
                <div className="text-[10px] text-slate-500 mt-1">{event.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
