
import React from 'react';
import { Thread } from '../types';

interface SidebarProps {
  threads: Thread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onClearChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  threads, 
  activeThreadId, 
  onSelectThread, 
  onNewThread,
  onClearChat,
  isOpen,
  onToggle
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-72 h-full bg-black/80 border-r border-cyan-500/30 backdrop-blur-xl flex flex-col z-[100] transition-all duration-300">
      <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
        <button 
          onClick={onNewThread}
          className="flex-1 flex items-center gap-2 bg-cyan-950/40 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 py-2.5 px-4 rounded-xl transition-all font-mono text-xs uppercase tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Protocol
        </button>
        <button 
          onClick={onToggle}
          className="ml-2 p-2 text-cyan-700 hover:text-cyan-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        <div className="px-3 py-2 text-[10px] text-cyan-900 font-bold uppercase tracking-widest">Neural History</div>
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`w-full text-left p-3 rounded-lg transition-all group flex items-center gap-3 border ${
              activeThreadId === thread.id 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-100' 
                : 'border-transparent text-cyan-700 hover:bg-white/5 hover:text-cyan-400'
            }`}
          >
            <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="truncate flex-1 font-mono text-[11px] uppercase tracking-tighter">
              {thread.title}
            </span>
          </button>
        ))}

        {activeThreadId && (
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to wipe the current neural buffer? This action is irreversible.")) {
                onClearChat();
              }
            }}
            className="w-full mt-6 flex items-center gap-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 p-3 rounded-lg border border-transparent hover:border-red-500/30 transition-all font-mono text-[9px] uppercase tracking-[0.2em] group"
          >
            <svg className="w-4 h-4 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Purge Buffer
          </button>
        )}
      </div>

      <div className="p-4 border-t border-cyan-500/20 bg-cyan-950/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-bold text-black text-xs">A</div>
          <div className="flex flex-col">
            <div className="text-[10px] text-cyan-100 font-bold uppercase">GUEST_USER</div>
            <div className="text-[8px] text-cyan-700 font-mono">AUTH: LEVEL_0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
