import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  MoreHorizontal,
  Copy,
  Check,
} from 'lucide-react';

export const LinearClone: React.FC = () => {
  const [columns, setColumns] = useState([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        { id: 'LIN-101', title: 'Implement Canva export to PNG and PDF', priority: 'Urgent', tag: 'Feature' },
        { id: 'LIN-102', title: 'Add sticker search and emoji category filter', priority: 'High', tag: 'UI' },
      ],
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      tasks: [
        { id: 'LIN-103', title: 'Connect REA engine to live website scraper', priority: 'High', tag: 'Core' },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        { id: 'LIN-104', title: 'Setup REA MCP 6.8.0 Stdio Integration', priority: 'Medium', tag: 'DevOps' },
        { id: 'LIN-105', title: 'Build interactive Canva graphic editor clone', priority: 'Urgent', tag: 'Frontend' },
      ],
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [copied, setCopied] = useState(false);

  const addTask = (colId: string) => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `LIN-${Math.floor(100 + Math.random() * 900)}`,
      title: newTaskTitle,
      priority: 'High',
      tag: 'Task',
    };
    setColumns((prev) =>
      prev.map((col) => (col.id === colId ? { ...col, tasks: [newTask, ...col.tasks] } : col))
    );
    setNewTaskTitle('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080911] text-slate-100 p-4 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            L
          </div>
          <span className="font-bold text-sm tracking-wide text-white">Linear Clone · Project Tasks</span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText('// Linear Clone Code Export');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14172a] hover:bg-purple-950/60 border border-purple-900/40 text-xs text-purple-200"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Code Copied' : 'Copy Code'}</span>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto">
        {columns.map((col) => (
          <div key={col.id} className="rounded-xl bg-[#0e1022] border border-purple-900/30 p-3 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>{col.title}</span>
              <span className="text-[11px] font-mono text-slate-500">({col.tasks.length})</span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {col.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg bg-[#121428] border border-purple-900/40 hover:border-purple-500/50 space-y-2 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-purple-400">
                    <span>{task.id}</span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 text-[10px]">
                      {task.priority}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-200">{task.title}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-purple-900/20">
              <input
                type="text"
                placeholder="+ Add task and press enter..."
                value={col.id === 'todo' ? newTaskTitle : ''}
                onChange={(e) => col.id === 'todo' && setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask(col.id)}
                className="w-full bg-[#14162a] border border-purple-900/30 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500/60"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
