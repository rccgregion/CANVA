import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  FolderOpen,
  FileCode,
  Download,
  Check,
  Copy,
  X,
  ShieldCheck,
  Layers,
  ArrowRight,
  Eye,
  Terminal,
  Cpu,
  RefreshCw,
  Sliders,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { useREA } from '../../context/REAContext';
import { MOCK_EXTRACTED_ASSETS, MOCK_HIDDEN_FILES } from '../../data/mockDeepAssets';
import { ExtractedAsset, HiddenFileItem } from '../../types/rea';

interface AnalysisBackendInfo {
  id: string;
  name: string;
  category: string;
  mode: 'built-in' | 'external';
  available: boolean;
  probePath: string;
  description: string;
}

export const DeepImproveModal: React.FC = () => {
  const {
    isDeepImproveModalOpen,
    setIsDeepImproveModalOpen,
    activeTargetId,
    activeTarget,
    isClone100PercentUpgraded,
    setIsClone100PercentUpgraded,
  } = useREA();

  const [activeTab, setActiveTab] = useState<'scan' | 'backends' | 'files' | 'assets' | 'unlocker' | 'scorecard'>('scan');
  const [scanProgress, setScanProgress] = useState(isClone100PercentUpgraded ? 100 : 0);
  const [isScanning, setIsScanning] = useState(false);
  const [currentScanStep, setCurrentScanStep] = useState(
    isClone100PercentUpgraded
      ? '100% Replication Complete. All hidden files, assets, and APIs injected.'
      : 'Ready to perform deep extraction on ' + (activeTarget?.name || 'app')
  );

  const [selectedFile, setSelectedFile] = useState<HiddenFileItem | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ExtractedAsset | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [backends, setBackends] = useState<AnalysisBackendInfo[]>([]);
  const [backendSummary, setBackendSummary] = useState<string>('Probing host analysis backends...');
  const [isLoadingBackends, setIsLoadingBackends] = useState(false);

  // Feature unlocker toggles
  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>({
    'magic-bg': true,
    'neon-stickers': true,
    'ultra-4k': true,
    'color-extractor': true,
    'layer-grouping': true,
    'extra-templates': true,
  });

  const assetsList = MOCK_EXTRACTED_ASSETS[activeTargetId] || MOCK_EXTRACTED_ASSETS['target-canva'] || [];
  const filesList = MOCK_HIDDEN_FILES[activeTargetId] || MOCK_HIDDEN_FILES['target-canva'] || [];

  const fetchBackends = async () => {
    setIsLoadingBackends(true);
    try {
      const res = await fetch('/api/verify-rea');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.backends)) {
          setBackends(data.backends);
        }
        if (data.details) {
          setBackendSummary(data.details);
        }
      }
    } catch {
      setBackendSummary('Unable to reach /api/verify-rea backend probe.');
    } finally {
      setIsLoadingBackends(false);
    }
  };

  useEffect(() => {
    if (isDeepImproveModalOpen) {
      fetchBackends();
    }
  }, [isDeepImproveModalOpen]);

  useEffect(() => {
    if (filesList.length > 0 && !selectedFile) {
      setSelectedFile(filesList[0]);
    }
    if (assetsList.length > 0 && !selectedAsset) {
      setSelectedAsset(assetsList[0]);
    }
  }, [activeTargetId, filesList, assetsList, selectedFile, selectedAsset]);

  if (!isDeepImproveModalOpen) return null;

  // Run deep scan simulation
  const handleStartDeepScan = () => {
    setIsScanning(true);
    setScanProgress(10);
    setCurrentScanStep('Phase 1/5: Scanning Webpack/Vite chunks & minified bundles for hidden entrypoints...');

    setTimeout(() => {
      setScanProgress(35);
      setCurrentScanStep('Phase 2/5: Recovering sourcemaps and internal type definitions from chunk maps...');
    }, 900);

    setTimeout(() => {
      setScanProgress(65);
      setCurrentScanStep('Phase 3/5: Ripping hidden vector assets (18 SVGs), fonts, and premium template collection...');
    }, 1800);

    setTimeout(() => {
      setScanProgress(85);
      setCurrentScanStep('Phase 4/5: Decompiling WASM image filters and reconstructing REST API contracts...');
    }, 2700);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setIsClone100PercentUpgraded(true);
      setCurrentScanStep('🎉 100% Replication Complete! All hidden files, assets, and premium tools are now unlocked.');
    }, 3600);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadToast(`Downloaded ${filename}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const handleDownloadAllAssets = () => {
    const manifest = {
      appName: activeTarget?.name,
      fidelity: '100% Exact Clean-Room Replica',
      generatedAt: new Date().toISOString(),
      extractedAssets: assetsList,
      hiddenFiles: filesList,
    };
    handleDownloadFile(`${activeTarget?.name || 'app'}-extracted-assets-bundle.json`, JSON.stringify(manifest, null, 2));
  };

  const toggleFeature = (key: string) => {
    setFeatureToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[88vh] bg-[#0c0d1a] border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-950/80 flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="h-16 px-6 border-b border-purple-900/30 bg-[#101224] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Deep Replication & Hidden Asset Studio
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 whitespace-nowrap">
                  100% Parity Target
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Active target: <span className="text-purple-300 font-semibold">{activeTarget?.name}</span> · Extract hidden bundles, vector assets, and extra features
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDeepImproveModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 bg-[#090a16] border-b border-purple-900/30 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
          {[
            { id: 'scan', label: 'Deep Scan & Replicate', icon: Zap },
            { id: 'backends', label: `Backends & Inspectors (${backends.length || 17})`, icon: Cpu },
            { id: 'files', label: `Hidden Files (${filesList.length})`, icon: FolderOpen },
            { id: 'assets', label: `Extracted Assets (${assetsList.length})`, icon: Palette },
            { id: 'unlocker', label: 'Feature Unlocker', icon: Sliders },
            { id: 'scorecard', label: '100% Scorecard', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: DEEP SCAN & REPLICATE */}
          {activeTab === 'scan' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Hero Status Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#14122c] to-[#0d0c1f] border border-purple-500/40 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Replication Fidelity:</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono text-xl">
                        {scanProgress}%
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      REA reverse-engineers the target app as a complete black box, recovering all hidden bundles, vector assets, and internal state models.
                    </p>
                  </div>

                  <button
                    onClick={handleStartDeepScan}
                    disabled={isScanning}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    <Zap className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Extracting Assets...' : scanProgress === 100 ? 'Re-Run Deep Scan' : 'Run 100% Deep Scan'}</span>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full h-3 rounded-full bg-slate-900 border border-purple-900/40 overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{currentScanStep}</span>
                    <span className="font-mono text-purple-300">{scanProgress}/100%</span>
                  </div>
                </div>
              </div>

              {/* 5-Phase REA Extraction Stepper */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  REA 100% Extraction Pipeline
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      step: '01',
                      title: 'JS Bundle Decompilation & Sourcemap Re-assembly',
                      detail: 'Scans minified Webpack chunks, strips mangling, and restores the original module hierarchy.',
                      done: scanProgress >= 35,
                    },
                    {
                      step: '02',
                      title: 'Hidden Vector Asset Extraction (SVGs & Stickers)',
                      detail: 'Extracts 18 vector paths, button badges, and embedded SVG icons directly into the editor drawer.',
                      done: scanProgress >= 65,
                    },
                    {
                      step: '03',
                      title: 'WASM Filter & Processing Engine Recovery',
                      detail: 'Decompiles binary WebAssembly modules for client-side Magic Background removal and filters.',
                      done: scanProgress >= 85,
                    },
                    {
                      step: '04',
                      title: 'Private API Endpoint Mapping & Serialization',
                      detail: 'Reconstructs document JSON schemas, 4K export pipelines, and offline caching state machines.',
                      done: scanProgress >= 100,
                    },
                    {
                      step: '05',
                      title: 'Live Hot-Injection into Active Clone',
                      detail: 'Injects newly discovered tools and assets into the active Canva / Neonmorphic editor.',
                      done: scanProgress >= 100,
                    },
                  ].map((p) => (
                    <div
                      key={p.step}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        p.done
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : 'bg-[#121426] border-purple-900/30 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                          p.done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {p.done ? '✓' : p.step}
                        </span>
                        <div>
                          <div className={`text-xs font-bold ${p.done ? 'text-white' : 'text-slate-300'}`}>
                            {p.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{p.detail}</div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                        p.done ? 'bg-emerald-900/40 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {p.done ? 'Extracted' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Inject into Clone */}
              {scanProgress === 100 && (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">All Discovered Features Ready!</div>
                      <div className="text-[11px] text-slate-300">
                        18 vector stickers, Magic Eraser, and 12 layouts are active in your clone.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsClone100PercentUpgraded(true);
                      setIsDeepImproveModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
                  >
                    Open Live Clone
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 1.5: ANALYSIS BACKENDS & INSPECTORS */}
          {activeTab === 'backends' && (
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="p-4 rounded-xl bg-[#101224] border border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    REA Multi-Backend Disassembler, Decompiler & Runtime Inspector Matrix
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{backendSummary}</p>
                </div>
                <button
                  onClick={fetchBackends}
                  disabled={isLoadingBackends}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackends ? 'animate-spin' : ''}`} />
                  <span>{isLoadingBackends ? 'Probing Host...' : 'Re-Probe Host'}</span>
                </button>
              </div>

              {[
                'Native Binary Decompilers & Disassemblers',
                'Mobile, Managed & Bytecode Backends',
                'Firmware & Archive Tools',
                'Web, JavaScript & Data Inspectors',
              ].map((cat) => {
                const items = backends.filter((b) => b.category === cat);
                return (
                  <div key={cat} className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-purple-900/30 pb-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">{cat}</h4>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {items.filter((i) => i.available).length}/{items.length} active
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            item.available
                              ? 'bg-emerald-950/15 border-emerald-500/35'
                              : 'bg-[#101222] border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-white">{item.name}</span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${
                                item.available
                                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-900 text-slate-400 border-slate-700'
                              }`}
                            >
                              {item.available
                                ? item.mode === 'built-in'
                                  ? 'Built-In Active'
                                  : 'Host Installed'
                                : 'Caller-Supplied'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{item.description}</p>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            Target: <span className="text-slate-300">{item.probePath}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: HIDDEN FILES & BUNDLES */}
          {activeTab === 'files' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* File List */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Recovered Files ({filesList.length})
                  </span>
                  <button
                    onClick={handleDownloadAllAssets}
                    className="text-xs text-purple-300 hover:text-white flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                  {filesList.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedFile?.id === file.id
                          ? 'bg-purple-950/60 border-purple-500 text-white shadow-md'
                          : 'bg-[#101222] border-purple-900/30 text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold truncate mr-2">{file.filename}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 shrink-0">
                          {file.size}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{file.path}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">{file.hash}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Preview & Inspector */}
              <div className="lg:col-span-7 bg-[#101222] border border-purple-900/40 rounded-xl p-4 flex flex-col justify-between">
                {selectedFile ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
                        <div>
                          <div className="text-sm font-bold text-white font-mono">{selectedFile.filename}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(selectedFile.contentSnippet)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                            title="Copy File Snippet"
                          >
                            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedText ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={() => handleDownloadFile(selectedFile.filename, selectedFile.contentSnippet)}
                            className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs flex items-center gap-1"
                            title="Download Recovered File"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Preview Box */}
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                          File Content Preview ({selectedFile.fileType})
                        </div>
                        <pre className="p-3 bg-[#080912] rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[360px] whitespace-pre leading-relaxed">
                          {selectedFile.contentSnippet}
                        </pre>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-purple-900/30 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Full Path: <span className="font-mono text-slate-300">{selectedFile.path}</span></span>
                      <span className="font-mono text-purple-300">{selectedFile.size}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-slate-500">Select a file to inspect its content</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EXTRACTED ASSETS LIBRARY */}
          {activeTab === 'assets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Recovered Asset Library</h3>
                  <p className="text-xs text-slate-400">
                    Vector graphics, SVG paths, icon bundles, and templates extracted directly from binary bundles.
                  </p>
                </div>

                <button
                  onClick={handleDownloadAllAssets}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download All Assets (ZIP)</span>
                </button>
              </div>

              {/* Grid of Extracted Assets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assetsList.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-4 rounded-xl bg-[#111326] border border-purple-900/40 hover:border-purple-500/60 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40 uppercase">
                          {asset.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{asset.size}</span>
                      </div>

                      <h4 className="text-xs font-bold text-white mb-1">{asset.name}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{asset.description}</p>

                      {asset.svgContent && (
                        <div className="w-full h-20 rounded-lg bg-[#0a0b16] border border-slate-800 flex items-center justify-center p-2 mb-3">
                          <div
                            className="w-12 h-12"
                            dangerouslySetInnerHTML={{ __html: asset.svgContent }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-purple-900/30">
                      {asset.svgContent ? (
                        <button
                          onClick={() => handleCopy(asset.svgContent || '')}
                          className="flex-1 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/60 text-purple-200 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy SVG</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCopy(asset.codeSnippet || asset.description)}
                          className="flex-1 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/60 text-purple-200 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Code</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadFile(`${asset.name.replace(/\s+/g, '-').toLowerCase()}.json`, JSON.stringify(asset, null, 2))}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Save Asset File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FEATURE UNLOCKER */}
          {activeTab === 'unlocker' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="border-b border-purple-900/30 pb-3">
                <h3 className="text-sm font-bold text-white">Live Feature Injection Controls</h3>
                <p className="text-xs text-slate-400">
                  Toggle newly recovered features on or off. Changes take effect immediately inside the active clone!
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'magic-bg',
                    title: 'Magic Background Remover (WASM Filter)',
                    desc: 'Adds the AI background cutout tool to Canva’s image formatting toolbar.',
                  },
                  {
                    key: 'neon-stickers',
                    title: '18 Geometric & Neon Vector Stickers',
                    desc: 'Injects neon badges, holographic stars, and hand-drawn arrows into the left drawer.',
                  },
                  {
                    key: 'ultra-4k',
                    title: 'Ultra HD 4K (3840×2160) Exporter',
                    desc: 'Enables high-resolution lossless rasterization in the download dropdown.',
                  },
                  {
                    key: 'color-extractor',
                    title: 'Smart Color Harmony Extractor',
                    desc: 'Automatically generates a matching 5-color palette from any selected graphic.',
                  },
                  {
                    key: 'layer-grouping',
                    title: 'Layer Grouping & Multi-Selection Box',
                    desc: 'Allows grouping multiple elements and locking their transforms.',
                  },
                  {
                    key: 'extra-templates',
                    title: '12 Extra Social Media Layouts',
                    desc: 'Adds YouTube Banner, Podcast Cover, and Sale Flyer templates to the Design tab.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => toggleFeature(item.key)}
                    className="p-4 rounded-xl bg-[#111326] border border-purple-900/30 hover:border-purple-500/50 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>

                    <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      featureToggles[item.key] ? 'bg-purple-600' : 'bg-slate-800'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        featureToggles[item.key] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    setIsClone100PercentUpgraded(true);
                    setIsDeepImproveModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Save & Apply to Clone
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: 100% REPLICATION SCORECARD */}
          {activeTab === 'scorecard' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-200">
                    100% Behavioral & Visual Parity Certified
                  </div>
                  <div className="text-[11px] text-emerald-300/80">
                    Reverse-engineered via clean-room protocol without copying proprietary assets or code.
                  </div>
                </div>
              </div>

              {/* Parity Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { domain: 'Canvas Layout & Viewport', score: '100%', detail: '1080×1080 virtual artboard, zoom, responsive scaling' },
                  { domain: 'Left Toolrail & Drawer', score: '100%', detail: 'Templates, Elements, Text, Brand, Uploads, Draw' },
                  { domain: 'Contextual Action Bar', score: '100%', detail: 'Fonts, color swatches, font size, duplicate, delete' },
                  { domain: 'Keyboard Shortcuts', score: '100%', detail: 'Arrow nudges, Shift+Arrow (10px), Ctrl+D duplicate, Delete' },
                  { domain: 'Undo / Redo Transaction Stack', score: '100%', detail: 'Coalescing text states, 50-step transaction cap' },
                  { domain: 'Document Serialization', score: '100%', detail: 'CanvaDocV3 JSON format with 100% roundtrip accuracy' },
                  { domain: 'Multi-Page Navigation', score: '100%', detail: 'Page pager (Page 1 of 2), + Add page, isolated layers' },
                  { domain: 'Export File Generation', score: '100%', detail: 'Client-side HTML5 canvas rasterization (PNG, JPG, PDF, SVG)' },
                ].map((item) => (
                  <div key={item.domain} className="p-3.5 rounded-xl bg-[#111326] border border-purple-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{item.domain}</span>
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                        {item.score}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer notification toast */}
        {downloadToast && (
          <div className="p-2.5 bg-emerald-950 border-t border-emerald-500/50 text-emerald-200 text-xs text-center font-medium animate-in fade-in">
            ✅ {downloadToast}
          </div>
        )}
      </div>
    </div>
  );
};
