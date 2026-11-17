import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Search,
  Filter,
  Code2,
  Terminal,
  Cpu,
  FileCode,
  Binary,
  Layers,
  Copy,
  Check,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useREA } from '../../context/REAContext';

export const InvestigationMode: React.FC = () => {
  const { activeTarget, codeFiles, evidence, timeline, isAgentThinking } = useREA();

  const [activeTab, setActiveTab] = useState<'pseudocode' | 'strings' | 'symbols' | 'disassembly'>('pseudocode');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedFile = codeFiles[selectedFileIdx] || codeFiles[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mockStrings = [
    { offset: '0x000142a0', section: '.rodata', value: 'PRAGMA key = "x\'%s\'";', category: 'SQLCipher' },
    { offset: '0x00014310', section: '.rodata', value: 'PRAGMA cipher_compatibility = 4;', category: 'SQLCipher' },
    { offset: '0x00014580', section: '.rodata', value: 'attachments.noindex', category: 'Filesystem' },
    { offset: '0x00014600', section: '.rodata', value: 'https://chat.signal.org/v1/messages', category: 'API Endpoint' },
    { offset: '0x00014720', section: '.rodata', value: 'VAULT_LICENSE_SIG_V2', category: 'Auth' },
    { offset: '0x00014800', section: '.rodata', value: 'expand 32-byte k', category: 'ChaCha20 Constant' },
    { offset: '0x00014940', section: '.rodata', value: 'PTRACE_TRACEME failed with code %d', category: 'Anti-Debug' },
    { offset: '0x00014a10', section: '.rodata', value: 'contextBridge.exposeInMainWorld', category: 'Electron Security' },
  ];

  const mockSymbols = [
    { name: 'openEncryptedDatabase', address: '0x00004e20', size: 148, type: 'FUNC', bind: 'GLOBAL' },
    { name: 'vault_verify_license_token', address: '0x00005a20', size: 312, type: 'FUNC', bind: 'GLOBAL' },
    { name: 'init_chacha20_context', address: '0x00006140', size: 184, type: 'FUNC', bind: 'LOCAL' },
    { name: 'vault_security_preflight', address: '0x00004f10', size: 92, type: 'FUNC', bind: 'GLOBAL' },
    { name: 'registerAttachmentHandlers', address: '0x000072b0', size: 220, type: 'FUNC', bind: 'GLOBAL' },
    { name: 'getOrCreateDatabaseSalt', address: '0x00008400', size: 116, type: 'FUNC', bind: 'LOCAL' },
  ];

  const mockDisassembly = [
    { addr: '0x00004f10', bytes: '55', asm: 'push   rbp' },
    { addr: '0x00004f11', bytes: '48 89 e5', asm: 'mov    rbp, rsp' },
    { addr: '0x00004f14', bytes: 'bf 00 00 00 00', asm: 'mov    edi, 0x0   ; PTRACE_TRACEME' },
    { addr: '0x00004f19', bytes: '31 f6', asm: 'xor    esi, esi' },
    { addr: '0x00004f1b', bytes: 'ba 01 00 00 00', asm: 'mov    edx, 0x1' },
    { addr: '0x00004f20', bytes: 'e8 fb fe ff ff', asm: 'call   ptrace@plt' },
    { addr: '0x00004f25', bytes: '85 c0', asm: 'test   eax, eax' },
    { addr: '0x00004f27', bytes: '79 0f', asm: 'jns    0x4f38' },
    { addr: '0x00004f29', bytes: 'bf 09 00 00 00', asm: 'mov    edi, 0x9   ; SIGKILL' },
    { addr: '0x00004f2e', bytes: 'e8 cd fe ff ff', asm: 'call   raise@plt' },
    { addr: '0x00004f33', bytes: 'b8 ff ff ff ff', asm: 'mov    eax, -0x1' },
    { addr: '0x00004f38', bytes: '5d', asm: 'pop    rbp' },
    { addr: '0x00004f39', bytes: 'c3', asm: 'ret' },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#080911] overflow-hidden">
      {/* Left Column: Live Agent Reasoning Stream */}
      <div className="w-full md:w-5/12 border-r border-purple-900/20 flex flex-col h-full bg-[#090a14]">
        {/* Stream Header */}
        <div className="p-3 border-b border-purple-900/20 flex items-center justify-between bg-[#0e101f]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-200 font-display">
              Live Agent Reasoning Stream
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-1 rounded text-xs flex items-center gap-1 px-2 transition-colors ${
                isPaused
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                  : 'bg-purple-950/50 text-purple-300 border border-purple-800/30'
              }`}
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Progress Pipeline */}
        <div className="p-3 border-b border-purple-900/20 bg-[#080912] space-y-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Investigation Pipeline
          </div>
          <div className="space-y-1.5">
            {[
              { name: '1. Ingestion & Format Check', status: 'done', detail: 'Verified architecture & headers' },
              { name: '2. Symbol Indexing & XREFs', status: 'done', detail: 'Found 42 exports, 182 imports' },
              { name: '3. Decompilation & AST', status: isAgentThinking ? 'active' : 'done', detail: 'Reconstructing C/TS modules' },
              { name: '4. Cryptographic Validation', status: 'done', detail: 'PBKDF2 and ChaCha20 mapped' },
              { name: '5. Attack Surface Synthesis', status: activeTarget?.status === 'completed' ? 'done' : 'pending', detail: 'Compiling security report' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded bg-[#101222] border border-purple-900/20"
              >
                <div className="flex items-center gap-2">
                  {step.status === 'done' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : step.status === 'active' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                  )}
                  <span className={`font-medium ${step.status === 'done' ? 'text-slate-200' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{step.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Execution Stream Log */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono">
          <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-2">
            Execution Log (REA v6.8.0 Stdio)
          </div>

          {timeline.map((event) => (
            <div
              key={event.id}
              className="p-2.5 rounded-lg bg-[#0c0e1a] border border-purple-900/30 space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-purple-300 font-semibold">{event.title}</span>
                <span className="text-slate-500">{event.timestamp}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{event.detail}</p>
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-purple-900/20 text-slate-500">
                <span className="text-purple-400">{event.tool}</span>
                <span>{event.durationMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Current Findings & Decompiler */}
      <div className="flex-1 flex flex-col h-full bg-[#07080f] overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-3 border-b border-purple-900/20 bg-[#0d0f1e] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-[#121426] p-0.5 rounded-lg border border-purple-900/30">
            {[
              { id: 'pseudocode', label: 'Decompiled Code', icon: Code2 },
              { id: 'strings', label: 'Extracted Strings', icon: FileCode },
              { id: 'symbols', label: 'Symbol Table', icon: Layers },
              { id: 'disassembly', label: 'Disassembly (ASM)', icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Filter */}
          <div className="relative flex items-center">
            <Search className="w-3 h-3 absolute left-2.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter findings..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-[#121424] border border-purple-900/30 rounded-md pl-7 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Tab 1: Decompiled Pseudocode */}
        {activeTab === 'pseudocode' && selectedFile && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* File Switcher Bar */}
            <div className="px-4 py-2 bg-[#0a0c18] border-b border-purple-900/20 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto">
                {codeFiles.map((f, idx) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFileIdx(idx)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      selectedFileIdx === idx
                        ? 'bg-purple-950/80 text-purple-200 border border-purple-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.filename}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedFile.code)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#121426] hover:bg-purple-950/50 border border-purple-900/30 text-slate-300 text-xs font-mono transition-colors"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleDownload(selectedFile.filename, selectedFile.code)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#121426] hover:bg-purple-950/50 border border-purple-900/30 text-slate-300 text-xs font-mono transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Code Body with Line Numbers */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-[#06070d]">
              <table className="w-full border-collapse">
                <tbody>
                  {selectedFile.code.split('\n').map((line, idx) => {
                    const lineNo = idx + 1;
                    const matchesSearch = filterQuery && line.toLowerCase().includes(filterQuery.toLowerCase());
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-purple-950/30 ${matchesSearch ? 'bg-amber-950/40 text-amber-200' : ''}`}
                      >
                        <td className="w-10 pr-4 text-right text-slate-600 select-none text-[11px] border-r border-slate-800/60">
                          {lineNo}
                        </td>
                        <td className="pl-4 whitespace-pre">{line}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Extracted Strings */}
        {activeTab === 'strings' && (
          <div className="flex-1 overflow-auto p-4">
            <div className="rounded-lg border border-purple-900/30 overflow-hidden bg-[#0a0c18]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#101224] text-purple-300 border-b border-purple-900/30 text-[11px]">
                  <tr>
                    <th className="p-2.5">Offset</th>
                    <th className="p-2.5">Section</th>
                    <th className="p-2.5">String Value</th>
                    <th className="p-2.5">Inferred Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20 text-slate-300">
                  {mockStrings
                    .filter((s) => !filterQuery || s.value.toLowerCase().includes(filterQuery.toLowerCase()))
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-purple-950/20">
                        <td className="p-2.5 text-slate-500">{item.offset}</td>
                        <td className="p-2.5 text-purple-400">{item.section}</td>
                        <td className="p-2.5 text-slate-100 font-semibold">{item.value}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[10px]">
                            {item.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Symbol Table */}
        {activeTab === 'symbols' && (
          <div className="flex-1 overflow-auto p-4">
            <div className="rounded-lg border border-purple-900/30 overflow-hidden bg-[#0a0c18]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#101224] text-purple-300 border-b border-purple-900/30 text-[11px]">
                  <tr>
                    <th className="p-2.5">Symbol Name</th>
                    <th className="p-2.5">Virtual Address</th>
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Bind</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20 text-slate-300">
                  {mockSymbols
                    .filter((s) => !filterQuery || s.name.toLowerCase().includes(filterQuery.toLowerCase()))
                    .map((sym, idx) => (
                      <tr key={idx} className="hover:bg-purple-950/20">
                        <td className="p-2.5 font-semibold text-slate-100">{sym.name}</td>
                        <td className="p-2.5 text-cyan-400">{sym.address}</td>
                        <td className="p-2.5 text-slate-400">{sym.size} bytes</td>
                        <td className="p-2.5 text-purple-400">{sym.type}</td>
                        <td className="p-2.5 text-slate-500">{sym.bind}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Disassembly ASM */}
        {activeTab === 'disassembly' && (
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 bg-[#06070d]">
            <table className="w-full border-collapse">
              <thead className="text-[11px] text-purple-400 border-b border-purple-900/30 text-left">
                <tr>
                  <th className="pb-2 pl-2">Address</th>
                  <th className="pb-2">Opcode Bytes</th>
                  <th className="pb-2">Instruction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/10">
                {mockDisassembly.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-950/30">
                    <td className="py-1.5 pl-2 text-cyan-400">{row.addr}</td>
                    <td className="py-1.5 text-slate-500">{row.bytes}</td>
                    <td className="py-1.5 text-slate-100 font-semibold">{row.asm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
