
import React from 'react';
import { Message } from '../types';

interface TerminalOutputProps {
  messages: Message[];
  onSpeak: (text: string) => void;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ messages, onSpeak }) => {
  return (
    <div className="space-y-8 font-mono pb-8">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 border-2 border-cyan-500/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 border border-cyan-500 rounded-full"></div>
          </div>
          <div className="text-cyan-600 italic tracking-widest text-xs uppercase">
            > Neural Link Stable<br/>
            > मराठी किंवा इंग्रजीत आज्ञा द्या<br/>
            > Awaiting Command
          </div>
        </div>
      )}
      
      {messages.map((m, i) => (
        <div key={i} className={`flex flex-col group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
          <div className="flex items-center gap-4 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border ${
              m.role === 'user' 
                ? 'bg-green-500/10 border-green-500/40 text-green-500' 
                : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
            }`}>
              {m.role === 'user' ? 'G' : 'J'}
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${
                m.role === 'user' ? 'text-green-500/60' : 'text-cyan-400/60'
              }`}>
                {m.role === 'user' ? 'GUEST' : 'JARVIS'}
              </span>
              <span className="text-[8px] opacity-30 font-mono">
                {m.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {m.role === 'jarvis' && m.content !== '...' && m.content !== '' && (
              <button 
                onClick={() => onSpeak(m.content)}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-1.5 hover:bg-cyan-500 hover:text-black rounded-md"
                title="Vocalize"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            )}
          </div>
          
          <div className={`text-sm leading-relaxed max-w-3xl ml-12 ${
            m.role === 'user' ? 'text-white/90' : 'text-cyan-100'
          }`}>
             {m.content === '...' && !m.imageUrl && (
               <div className="flex items-center gap-1">
                 <div className="w-1 h-1 bg-cyan-400 animate-bounce"></div>
                 <div className="w-1 h-1 bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-1 h-1 bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
               </div>
             )}
             
             {m.imageUrl ? (
               <div className="flex flex-col gap-4">
                 <div className="relative group/img max-w-2xl">
                    <div className="absolute -inset-0.5 bg-cyan-500 opacity-20 blur group-hover/img:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-black/40 shadow-2xl">
                        <img 
                          src={m.imageUrl} 
                          alt="Neural Synthesis" 
                          className="w-full h-auto transition-transform duration-700 group-hover/img:scale-[1.02]"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                           <div className="bg-black/60 backdrop-blur-md text-[8px] text-cyan-400 px-2 py-1 rounded border border-cyan-500/30 uppercase tracking-tighter">
                             Visual Render Complete
                           </div>
                           <div className="bg-cyan-500 text-[8px] text-black font-black px-2 py-1 rounded uppercase tracking-tighter">
                             IMAGEN v2.5
                           </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <button 
                            onClick={() => window.open(m.imageUrl, '_blank')}
                            className="text-[10px] text-cyan-400 hover:text-white uppercase tracking-widest font-bold"
                          >
                            [ Open Full HUD View ]
                          </button>
                        </div>
                    </div>
                 </div>
                 {m.content && m.content !== '...' && (
                   <div className="text-xs text-cyan-300 font-mono border-l-2 border-cyan-500 pl-4 py-2 bg-cyan-500/5 rounded-r-lg max-w-2xl animate-in fade-in duration-700">
                     <span className="opacity-50 mr-2 tracking-tighter">[DESCRIPTION]</span>
                     {m.content}
                   </div>
                 )}
               </div>
             ) : (
               m.content !== '...' && m.content
             )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TerminalOutput;
