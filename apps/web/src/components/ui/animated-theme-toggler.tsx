'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Laptop } from 'lucide-react';

export function AnimatedThemeToggler() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  useEffect(() => {
    // Check initial local storage or default to dark
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | 'system' | null;
    const initialTheme = stored || 'dark';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (t: 'dark' | 'light' | 'system') => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (t === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System preference
      const matchesDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (matchesDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  };

  const toggleTheme = (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex bg-black/5 dark:bg-black/40 border border-black/10 dark:border-strokedark p-1 rounded-xl items-center relative overflow-hidden select-none">
      <button
        onClick={() => toggleTheme('light')}
        className={`relative z-10 p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          theme === 'light' ? 'text-black dark:text-white' : 'text-bodydark2 hover:text-black dark:hover:text-white'
        }`}
        title="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => toggleTheme('dark')}
        className={`relative z-10 p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          theme === 'dark' ? 'text-black dark:text-white' : 'text-bodydark2 hover:text-black dark:hover:text-white'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => toggleTheme('system')}
        className={`relative z-10 p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          theme === 'system' ? 'text-black dark:text-white' : 'text-bodydark2 hover:text-black dark:hover:text-white'
        }`}
        title="System Mode"
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>

      {/* Slide overlay indicator */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="absolute top-1 bottom-1 bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-lg pointer-events-none"
        style={{
          width: '28px',
          left: theme === 'light' ? '4px' : theme === 'dark' ? '36px' : '68px',
        }}
      />
    </div>
  );
}
