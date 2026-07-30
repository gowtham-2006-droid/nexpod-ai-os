'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkingOrb, OrbState } from 'thinking-orbs';
import { api } from '@/lib/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_CHIPS = [
  'Pod fleet status?',
  'Any active alerts?',
  'What is NexPod?',
];

const ORB_STATE_OPTIONS: { id: OrbState; label: string }[] = [
  { id: 'listening', label: 'Listening' },
  { id: 'solving', label: 'Thinking' },
  { id: 'searching', label: 'Searching' },
  { id: 'composing', label: 'Composing' },
  { id: 'working', label: 'Working' },
  { id: 'shaping', label: 'Shaping' },
];

function ChatPanel({
  isOpen,
  onClose,
  orbState,
  setOrbState,
}: {
  isOpen: boolean;
  onClose: () => void;
  orbState: OrbState;
  setOrbState: (state: OrbState) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: content.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.postChat(
        newMessages.map((m) => ({ role: m.role, content: m.content }))
      );
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I couldn\'t connect to the server. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999998]"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] z-[999999] flex flex-col
              bg-background/95 backdrop-blur-2xl border-l border-border
              shadow-[-20px_0_60px_rgba(0,0,0,0.4)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-foreground/5 border border-border flex items-center justify-center overflow-hidden shadow-sm">
                  <ThinkingOrb state={isLoading ? 'solving' : orbState} size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground font-mono tracking-tight flex items-center gap-2">
                    NexPod AI
                  </h2>
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Online · Thinking Orb Active
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg bg-secondary hover:bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-8">
                  <div className="relative p-3 rounded-3xl bg-secondary/40 border border-border/80 shadow-inner flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                    <ThinkingOrb state={orbState} size={64} />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-foreground font-mono">
                      NexPod AI Assistant
                    </p>
                    <p className="text-xs text-muted-foreground font-mono max-w-[270px] leading-relaxed">
                      Powered by real-time particle-based thinking orbs. Ask anything about NexPod.
                    </p>
                  </div>

                  {/* Orb State Selector Chips */}
                  <div className="w-full pt-1 space-y-2">
                    <p className="text-[10px] text-muted-foreground/70 font-mono uppercase tracking-wider font-semibold">
                      Orb Animation Mode
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5 max-w-[320px] mx-auto">
                      {ORB_STATE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setOrbState(option.id)}
                          className={`px-2.5 py-1 text-[10px] font-mono rounded-full border transition-all cursor-pointer ${
                            orbState === option.id
                              ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                              : 'bg-secondary/70 hover:bg-accent text-muted-foreground border-border'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Starter Chips */}
                  <div className="w-full pt-2 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground/70 font-mono uppercase tracking-wider font-semibold mb-2">
                      Suggested Queries
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {STARTER_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => sendMessage(chip)}
                          className="px-3 py-1.5 text-[11px] font-mono text-muted-foreground bg-secondary hover:bg-accent border border-border hover:border-foreground/20 rounded-full transition-all cursor-pointer hover:text-foreground"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[88%] flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.role === 'assistant' && (
                      <div className="h-6 w-6 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                        <ThinkingOrb state="working" size={20} />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed font-mono ${
                        msg.role === 'user'
                          ? 'bg-foreground text-background rounded-br-md'
                          : 'bg-secondary text-foreground/90 border border-border rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest block mb-1">
                          NexPod AI
                        </span>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3 bg-secondary/80 border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <ThinkingOrb state="solving" size={20} />
                    <div>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest font-mono block">
                        NexPod AI
                      </span>
                      <span className="text-xs text-foreground/80 font-mono animate-pulse">
                        Solving query & generating response...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 border-t border-border bg-background/60"
            >
              <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-3 py-1 focus-within:border-foreground/30 transition-colors">
                <div className="shrink-0 flex items-center justify-center">
                  <ThinkingOrb state={input ? 'listening' : 'working'} size={20} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask NexPod AI..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-foreground text-[13px] font-mono placeholder:text-muted-foreground/50 outline-none py-2 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8 rounded-lg bg-foreground/10 hover:bg-foreground/20 border border-border flex items-center justify-center text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground/40 font-mono text-center mt-2">
                Powered by Groq · llama-3.3-70b-versatile · thinking-orbs
              </p>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AIChatSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>('listening');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Floating Trigger Button with ThinkingOrb */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[9999] h-16 w-16 rounded-full 
          bg-background text-foreground border border-border
          shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]
          dark:shadow-[0_8px_30px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_8px_40px_rgba(255,255,255,0.2)]
          flex items-center justify-center cursor-pointer overflow-hidden
          transition-all duration-300 hover:scale-105 active:scale-95 group
          ${isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100'}`}
        aria-label="Open AI Chat"
      >
        {/* Pulse aura */}
        <span className="absolute inset-0 rounded-full bg-foreground/10 animate-ping opacity-30" />
        
        {/* ThinkingOrb (64px) embedded */}
        <div className="relative z-10 flex items-center justify-center">
          <ThinkingOrb state={orbState} size={64} />
        </div>
      </button>

      {/* Portal-rendered sidebar */}
      {mounted &&
        createPortal(
          <ChatPanel
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            orbState={orbState}
            setOrbState={setOrbState}
          />,
          document.body
        )}
    </>
  );
}

