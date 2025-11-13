"use client";

import { useState, useRef, useEffect, FC, FormEvent } from "react";
import { BrainCircuit, Send, Sparkles } from "lucide-react";
import { getGameResponse } from "@/lib/gemini";
import type { Content } from "@google/generative-ai";

// Определяем тип для сообщений в чате, он совместим с типом Content из SDK
type ChatMessage = Content;

// Типизируем пропсы для компонента сообщения
interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageComponent: FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.role === "model";
  const textContent = Array.isArray(message.parts) ? message.parts[0].text : '';

  return (
    <div className={`flex ${isAi ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-xl p-4 rounded-lg shadow-lg ${
          isAi
            ? "bg-zinc-800/50 backdrop-blur-sm border border-neon-purple/20 text-left"
            : "bg-neon-green/10 backdrop-blur-sm border border-neon-green/20 text-right"
        }`}
      >
        <p
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: textContent.replace(/\*\*(.*?)\*\*/g, '<strong class="text-neon-green">$1</strong>') }}
        ></p>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [xp, setXp] = useState<number>(0);
  const [currentMode, setCurrentMode] = useState<string | null>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [xpGained, setXpGained] = useState<number>(0);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);
  
  useEffect(() => {
    if (xpGained > 0) {
      const timer = setTimeout(() => setXpGained(0), 1500);
      return () => clearTimeout(timer);
    }
  }, [xpGained]);

  const parseXp = (responseText: string) => {
    const xpMatch = responseText.match(/\*\*XP: \+(\d+)\*\*/);
    if (xpMatch && xpMatch[1]) {
      const newXp = parseInt(xpMatch[1], 10);
      setXp((prevXp) => prevXp + newXp);
      setXpGained(newXp);
    }
  };

  const handleSend = async (promptOverride?: string) => {
    const userPrompt = promptOverride || input;
    if (!userPrompt.trim()) return;

    setIsLoading(true);
    setInput("");

    const newUserMessage: ChatMessage = {
      role: "user",
      parts: [{ text: userPrompt }],
    };
    
    const newChatHistory = promptOverride 
      ? [...chatHistory] 
      : [...chatHistory, newUserMessage];

    setChatHistory(newChatHistory);
    
    const responseText = await getGameResponse(newChatHistory, userPrompt);
    
    const aiMessage: ChatMessage = {
      role: "model",
      parts: [{ text: responseText }],
    };

    setChatHistory((prev) => [...prev, aiMessage]);
    parseXp(responseText);
    setIsLoading(false);
  };
  
  const selectMode = (mode: string, initialPrompt: string) => {
    setCurrentMode(mode);
    setChatHistory([]);
    handleSend(initialPrompt);
  };

  return (
    <main className="flex flex-col h-screen bg-zinc-950 p-4 max-w-3xl mx-auto">
      <header className="flex justify-between items-center p-4 border-b border-neon-purple/20 bg-zinc-900/50 backdrop-blur-sm rounded-t-lg">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-neon-green" size={32} />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-purple">
            NeuroVibe
          </h1>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-md border border-neon-green/20">
            <Sparkles className="text-neon-green" size={20} />
            <span className="text-lg font-bold text-white">{xp} XP</span>
          </div>
          {xpGained > 0 && (
            <div className="absolute -top-8 right-0 text-neon-green font-bold text-lg animate-ping-once">
              +{xpGained} XP
            </div>
          )}
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 bg-black/20 custom-scrollbar">
        {chatHistory.map((msg, index) => (
          <ChatMessageComponent key={index} message={msg} />
        ))}
        {isLoading && (
           <div className="flex justify-start mb-4">
             <div className="max-w-xl p-4 rounded-lg shadow-lg bg-zinc-800/50 backdrop-blur-sm border border-neon-purple/20">
               <div className="flex items-center gap-2 text-zinc-400">
                 <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></div>
                 <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse [animation-delay:0.2s]"></div>
                 <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse [animation-delay:0.4s]"></div>
               </div>
             </div>
           </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <footer className="p-4 bg-zinc-900/50 backdrop-blur-sm rounded-b-lg">
        {currentMode === null ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => selectMode("words", "Начни режим СЛОВА")}
              className="p-4 bg-zinc-800 rounded-lg text-center font-bold hover:bg-neon-green hover:text-black transition-all duration-300 border border-neon-green/30"
            >
              Слова
            </button>
            <button 
              onClick={() => selectMode("story", "Начни режим ИСТОРИЯ")}
              className="p-4 bg-zinc-800 rounded-lg text-center font-bold hover:bg-neon-purple hover:text-black transition-all duration-300 border border-neon-purple/30"
            >
              История
            </button>
            <button
               onClick={() => selectMode("associations", "Начни режим АССОЦИАЦИИ")}
              className="p-4 bg-zinc-800 rounded-lg text-center font-bold hover:bg-zinc-600 transition-all duration-300 border border-zinc-500/30"
            >
              Ассоциации
            </button>
          </div>
        ) : (
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleSend(); }}>
            <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg border border-neon-purple/20 focus-within:border-neon-purple">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? "NeuroVibe думает..." : "Твой ответ..."}
                disabled={isLoading}
                className="w-full bg-transparent focus:outline-none p-2"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-3 bg-neon-purple rounded-md hover:bg-neon-purple/80 disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        )}
      </footer>
    </main>
  );
}
