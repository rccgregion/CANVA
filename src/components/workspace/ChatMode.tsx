import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useREA } from '../../context/REAContext';

export const ChatMode: React.FC = () => {
  const {
    activeTarget,
    messages,
    sendMessage,
    isAgentThinking,
    setWorkspaceMode,
    setActiveEvidenceTab,
  } = useREA();

  const [inputVal, setInputVal] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentThinking]);

  const handleSend = () => {
    if (!inputVal.trim() || isAgentThinking) return;
    sendMessage(inputVal);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080911] overflow-hidden relative">
      {/* Friendly Banner with 1-Click Switcher to Canva */}
      <div className="p-3.5 bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border-b border-purple-900/30 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
            C
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Canva Graphic Editor Clone is Live!</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[11px] text-purple-200/80">
              Complete with templates, draggable stickers, text editor, and instant export.
            </p>
          </div>
        </div>

        <button
          onClick={() => setWorkspaceMode('canva')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-semibold shadow-md shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all"
        >
          <span>Open Canva Clone</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, mIdx) => (
          <div key={message.id}>
            {message.sender === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-xl bg-purple-950/80 border border-purple-500/30 rounded-2xl px-4 py-2.5 text-sm text-white shadow-md">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 max-w-2xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 bg-[#101224] border border-purple-900/30 rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-300">REA AI Cloner</span>
                    <span className="text-[10px] text-slate-500">{message.timestamp}</span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {message.content}
                  </p>

                  {/* Code snippet if any */}
                  {message.codeSnippets && message.codeSnippets.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {message.codeSnippets.map((snip, sIdx) => (
                        <div key={sIdx} className="rounded-xl border border-purple-900/40 bg-[#07080f] overflow-hidden">
                          <div className="px-3 py-1.5 bg-[#0d0f1e] flex items-center justify-between text-xs border-b border-purple-900/30">
                            <span className="font-semibold text-purple-300">{snip.title}</span>
                            <button
                              onClick={() => copyCode(snip.code, sIdx)}
                              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                            >
                              {copiedIdx === sIdx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedIdx === sIdx ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="p-3 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                            <code>{snip.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* One-click suggestions */}
                  {message.quickActions && (
                    <div className="pt-2 flex flex-wrap gap-1.5 border-t border-purple-900/20">
                      {message.quickActions.map((qa, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => {
                            if (qa.includes('Canva')) {
                              setWorkspaceMode('canva');
                            } else if (qa.includes('Linear')) {
                              setWorkspaceMode('linear');
                            } else if (qa.includes('code') || qa.includes('Code')) {
                              setActiveEvidenceTab('code');
                            } else {
                              sendMessage(qa);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-950/50 hover:bg-purple-900/70 border border-purple-700/40 text-xs text-purple-200 hover:text-white transition-colors"
                        >
                          {qa}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isAgentThinking && (
          <div className="flex items-center gap-2 text-xs text-purple-300 font-medium pl-11">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>REA Agent is analyzing and rebuilding the app...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-purple-900/25 bg-[#0a0c16]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Try asking:</span>
          {['Clone Canva', 'Clone Linear', 'Verify REA Engine', 'Copy Canva React Code'].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              className="px-2.5 py-1 rounded-md bg-[#121424] hover:bg-purple-950/60 border border-purple-900/30 text-xs text-slate-300 hover:text-white shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-[#121426] border border-purple-900/40 rounded-xl px-3 py-1.5 focus-within:border-purple-500/70">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type 'clone canva', 'clone spotify', or ask anything to customize..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputVal.trim()}
            className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white disabled:opacity-40 hover:brightness-110 ml-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
