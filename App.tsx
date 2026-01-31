
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { JarvisState, Message, Thread } from './types';
import HologramFace from './components/HologramFace';
import TerminalOutput from './components/TerminalOutput';
import Controls from './components/Controls';
import Sidebar from './components/Sidebar';
import { encode, decode, decodeAudioData } from './utils/audioUtils';

const App: React.FC = () => {
  const [jarvisState, setJarvisState] = useState<JarvisState>(JarvisState.IDLE);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('jarvis_threads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          messages: t.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setThreads(parsed);
        if (parsed.length > 0) setActiveThreadId(parsed[0].id);
      } catch (e) {
        console.error("Failed to load threads", e);
      }
    }
  }, []);

  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('jarvis_threads', JSON.stringify(threads));
    }
  }, [threads]);

  const activeThread = threads.find(t => t.id === activeThreadId) || null;
  const messages = activeThread?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewThread = (initialTitle: string = "नवीन संभाषण") => {
    const newThread: Thread = {
      id: Date.now().toString(),
      title: initialTitle,
      messages: [],
      createdAt: new Date()
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    return newThread.id;
  };

  const clearActiveThread = () => {
    if (!activeThreadId) return;
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [] } : t));
  };

  const addMessage = (role: 'user' | 'jarvis', content: string, imageUrl?: string) => {
    let currentId = activeThreadId;
    if (!currentId) {
      currentId = createNewThread(content.slice(0, 30) + "...");
    }

    setThreads(prev => prev.map(t => {
      if (t.id === currentId) {
        const newMessages = [...t.messages, { role, content, imageUrl, timestamp: new Date() }];
        const newTitle = t.messages.length === 0 && role === 'user' ? content.slice(0, 30) : t.title;
        return { ...t, messages: newMessages, title: newTitle };
      }
      return t;
    }));
  };

  const updateLastJarvisMessage = (content: string, imageUrl?: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        const newMessages = [...t.messages];
        for (let i = newMessages.length - 1; i >= 0; i--) {
          if (newMessages[i].role === 'jarvis') {
            newMessages[i] = { ...newMessages[i], content, imageUrl: imageUrl || newMessages[i].imageUrl };
            break;
          }
        }
        return { ...t, messages: newMessages };
      }
      return t;
    }));
  };

  const initOutputContext = () => {
    if (!outputAudioContextRef.current) {
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const playAudioChunk = async (base64Audio: string) => {
    initOutputContext();
    const ctx = outputAudioContextRef.current!;
    setJarvisState(JarvisState.SPEAKING);
    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
    const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const updateLevel = () => {
      if (sourcesRef.current.has(source)) {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 128);
        requestAnimationFrame(updateLevel);
      }
    };
    updateLevel();
    source.addEventListener('ended', () => {
      sourcesRef.current.delete(source);
      if (sourcesRef.current.size === 0) {
         setJarvisState(JarvisState.IDLE);
         setAudioLevel(0);
      }
    });
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
    sourcesRef.current.add(source);
  };

  const speakText = async (text: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Respond in a natural voice. Text: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) await playAudioChunk(base64Audio);
    } catch (err) {
      console.error("TTS Error:", err);
    }
  };

  useEffect(() => {
    if (threads.length === 0) {
      const initialGreeting = "प्रणाली सक्रीय आहे. JARVIS core 5.0 initialized. Neural history archives ready. मी आपली काय मदत करू शकतो, सर?";
      const tid = createNewThread("स्वागत सत्र");
      setTimeout(() => {
        setThreads(prev => prev.map(t => t.id === tid ? { ...t, messages: [{ role: 'jarvis', content: initialGreeting, timestamp: new Date() }] } : t));
        if (autoSpeak) speakText(initialGreeting);
      }, 500);
    }
  }, []);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentInput = inputText;
    setInputText('');
    setJarvisState(JarvisState.THINKING);
    addMessage('user', currentInput);

    const isImageRequest = /\b(generate|create|draw|make|show|picture|image|graphic|photo|चित्र|फोटो|बनवा)\b/i.test(currentInput);

    if (isImageRequest) {
      addMessage('jarvis', '...'); 
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: `${currentInput}. Provide a very brief 1-sentence description in the text response.` }] }
        });

        let foundImage = false;
        let imageUrl = "";
        let textResponse = "";
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            foundImage = true;
          } else if (part.text) {
            textResponse += part.text;
          }
        }
        if (foundImage) {
          updateLastJarvisMessage(textResponse || "Visual synthesis successful.", imageUrl);
          if (autoSpeak && textResponse) speakText(textResponse);
        } else {
          updateLastJarvisMessage("त्रुटी: व्हिज्युअल सिंथेसिस अयशस्वी.");
        }
      } catch (err) {
        updateLastJarvisMessage("Visual array error. Synthesis aborted.");
      } finally {
        setJarvisState(JarvisState.IDLE);
      }
    } else {
      addMessage('jarvis', '...');
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const stream = await ai.models.generateContentStream({
          model: 'gemini-3-flash-preview',
          contents: currentInput,
          config: {
            thinkingConfig: { thinkingBudget: 0 },
            systemInstruction: "You are JARVIS. You fully support Marathi (Devanagari script) and English. Respond in the language the user uses. Be sophisticated, fast, and helpful. Use respectful Marathi honorifics like 'सर' or 'साहेब' when addressing the user."
          }
        });
        let fullReply = "";
        for await (const chunk of stream) {
          fullReply += chunk.text || "";
          updateLastJarvisMessage(fullReply);
        }
        if (autoSpeak && fullReply) await speakText(fullReply);
      } catch (err) {
        updateLastJarvisMessage("Error: Neural link unstable.");
      } finally {
        if (sourcesRef.current.size === 0) setJarvisState(JarvisState.IDLE);
      }
    }
  };

  const startLiveSession = async () => {
    if (sessionPromiseRef.current) return;
    initOutputContext();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setJarvisState(JarvisState.IDLE);
            setIsAudioActive(true);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setAudioLevel(rms * 5);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromiseRef.current?.then((session: any) => { session.sendRealtimeInput({ media: pcmBlob }); });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.turnComplete) setJarvisState(JarvisState.IDLE);
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) await playAudioChunk(base64Audio);
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Jarvis Live Error:', e),
          onclose: () => { setIsAudioActive(false); setJarvisState(JarvisState.IDLE); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: `You are JARVIS. You support both Marathi and English. Respond in the language used by the user. If the user speaks Marathi, reply in polished, respectful Marathi.`,
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error('Failed to start Jarvis Voice:', err);
    }
  };

  const stopLiveSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((session: any) => session.close());
      sessionPromiseRef.current = null;
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsAudioActive(false);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black grid-bg flex">
      <div className="scanline pointer-events-none"></div>
      
      <Sidebar 
        threads={threads} 
        activeThreadId={activeThreadId} 
        onSelectThread={setActiveThreadId} 
        onNewThread={() => createNewThread()} 
        onClearChat={clearActiveThread}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 relative flex flex-col h-full overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black italic tracking-tighter orbitron glitch-text uppercase">JARVIS</h1>
            <div className="text-[10px] opacity-60 flex gap-4 mt-1 font-mono">
              <span>CORE: 5.0.PLATFORM</span>
              <span>STATUS: {jarvisState}</span>
              <span className="text-cyan-400">SESSION: {activeThread?.title.toUpperCase() || 'INITIALIZING'}</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <HologramFace state={jarvisState} audioLevel={audioLevel} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-32 pb-48 z-40 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <TerminalOutput messages={messages} onSpeak={speakText} />
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 z-50 bg-gradient-to-t from-black via-black/95 to-transparent">
          <Controls 
            onVoiceToggle={isAudioActive ? stopLiveSession : startLiveSession} 
            isVoiceActive={isAudioActive} 
            jarvisState={jarvisState} 
            inputText={inputText} 
            onInputChange={setInputText} 
            onSend={handleSendText} 
            autoSpeak={autoSpeak} 
            onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)} 
          />
        </div>

        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-[60] p-2 bg-black/50 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-all pointer-events-auto"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
