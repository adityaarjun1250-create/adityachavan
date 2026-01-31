
import React from 'react';
import { JarvisState } from '../types';

interface ControlsProps {
  onVoiceToggle: () => void;
  isVoiceActive: boolean;
  jarvisState: JarvisState;
  inputText: string;
  onInputChange: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  onVoiceToggle, 
  isVoiceActive, 
  jarvisState, 
  inputText, 
  onInputChange,
  onSend,
  autoSpeak,
  onToggleAutoSpeak
}) => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 w-full bg-black/40 backdrop-blur-xl border border-cyan-500/30 p-2 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Voice Mode Button */}
        <button
          onClick={onVoiceToggle}
          title={isVoiceActive ? "Deactivate Neural Link" : "Activate Neural Link"}
          className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 border ${
            isVoiceActive 
              ? 'border-red-500 bg-red-950/30 text-red-500 animate-pulse' 
              : 'border-cyan-500/30 bg-black/50 text-cyan-500 hover:border-cyan-500 hover:bg-cyan-500/10'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        {/* Text Input Area */}
        <form onSubmit={onSend} className="flex-1 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={jarvisState === JarvisState.THINKING ? "Processing Neural Command..." : "Command Jarvis..."}
            disabled={jarvisState === JarvisState.THINKING}
            className="flex-1 bg-transparent text-cyan-100 px-4 py-3 focus:outline-none font-mono transition-all placeholder-cyan-900 text-sm"
          />
          <button 
            type="submit"
            disabled={jarvisState === JarvisState.THINKING || !inputText.trim()}
            className="w-12 h-12 flex items-center justify-center bg-cyan-600 hover:bg-cyan-400 text-black rounded-xl transition-all disabled:opacity-20 shadow-[0_0_15px_rgba(6,182,212,0.4)] group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={autoSpeak} 
              onChange={onToggleAutoSpeak}
              className="hidden"
            />
            <div className={`w-8 h-4 rounded-full transition-colors relative border ${autoSpeak ? 'bg-cyan-500/20 border-cyan-500' : 'bg-gray-900 border-gray-700'}`}>
               <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all ${autoSpeak ? 'left-4.5 bg-cyan-400' : 'left-0.5 bg-gray-600'}`}></div>
            </div>
            <span className="text-[9px] orbitron tracking-widest text-cyan-700 group-hover:text-cyan-400 transition-colors uppercase font-bold">
              Neural Audio: {autoSpeak ? 'Active' : 'Muted'}
            </span>
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${jarvisState === JarvisState.IDLE ? 'bg-cyan-500' : 'bg-yellow-500 animate-ping'}`}></div>
          <span className="text-[9px] orbitron tracking-widest text-cyan-900 uppercase font-black">
            Core Status: {jarvisState}
          </span>
        </div>
      </div>
      
      <p className="text-[8px] text-cyan-950 font-mono tracking-tighter uppercase opacity-50">
        Jarvis version 5.0 // Advanced Heuristic Intelligence // Visual Synthesis Protocol Enabled
      </p>
    </div>
  );
};

export default Controls;
