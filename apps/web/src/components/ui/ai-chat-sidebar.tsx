'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

function ChatPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
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

  // Close on Escape
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
              bg-black/80 backdrop-blur-2xl border-l border-white/[0.08]
              shadow-[−30px_0_60px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center shadow-lg">
                  <span className="text-sm">⚡</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white font-mono tracking-tight">
                    NexPod AI
                  </h2>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Online · Groq LLM
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-primary/20 border border-white/[0.08] flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-white/80 font-mono">
                      NexPod AI Assistant
                    </p>
                    <p className="text-xs text-white/40 font-mono max-w-[260px] leading-relaxed">
                      Ask about pod status, alerts, inventory, or anything about the NexPod platform.
                    </p>
                  </div>

                  {/* Starter Chips */}
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {STARTER_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        className="px-3 py-1.5 text-[11px] font-mono text-white/70 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-full transition-all cursor-pointer hover:text-white"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed font-mono ${
                      msg.role === 'user'
                        ? 'bg-primary/20 text-white border border-primary/20 rounded-br-md'
                        : 'bg-white/[0.05] text-white/90 border border-white/[0.06] rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <span className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest block mb-1">
                        NexPod AI
                      </span>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.05] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                    <span className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest font-mono block mb-1.5">
                      NexPod AI
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 border-t border-white/[0.08] bg-black/40"
            >
              <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-1 focus-within:border-primary/30 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask NexPod AI..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white text-[13px] font-mono placeholder:text-white/25 outline-none py-2 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/20 flex items-center justify-center text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </button>
              </div>
              <p className="text-[9px] text-white/20 font-mono text-center mt-2">
                Powered by Groq · llama-3.3-70b-versatile
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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[9999] h-14 w-14 rounded-full 
          bg-gradient-to-br from-emerald-500 to-primary 
          shadow-[0_8px_32px_rgba(0,200,83,0.3)] hover:shadow-[0_8px_40px_rgba(0,200,83,0.5)]
          flex items-center justify-center cursor-pointer
          transition-all duration-300 hover:scale-110 active:scale-95
          border border-white/10 group
          ${isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100'}`}
        aria-label="Open AI Chat"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-40" />
        {/* Icon */}
        <svg
          className="w-6 h-6 text-white relative z-10 group-hover:rotate-12 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01" />
          <path d="M12 10h.01" />
          <path d="M16 10h.01" />
        </svg>
      </button>

      {/* Portal-rendered sidebar */}
      {mounted &&
        createPortal(
          <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />,
          document.body
        )}
    </>
  );
}
