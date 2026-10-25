import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'obsidian-ember',
    name: 'Obsidian Ember',
    tagline: 'Matte Carbon Slate & Radiant Ember Orange',
    badge: 'Pro Dark',
    preview: '#121212 / #ff5722'
  },
  {
    id: 'screener-classic',
    name: 'Screener Slate',
    tagline: 'Natural & Clean Financial Minimalist',
    badge: 'Standard',
    preview: '#0f172a / #3b82f6'
  },
  {
    id: 'terminal-elite',
    name: 'Cyber Matrix',
    tagline: 'OLED Pitch Black & Neon Emerald',
    badge: 'OLED Pro',
    preview: '#05070a / #00f5a0'
  },
  {
    id: 'fintech-mint',
    name: 'Apex Mint',
    tagline: 'Graphite Slate & Electric Jade',
    badge: 'Modern',
    preview: '#090d16 / #10b981'
  },
  {
    id: 'institutional-navy',
    name: 'Sovereign Navy',
    tagline: 'Deep Navy & Imperial Amber',
    badge: 'Sovereign',
    preview: '#0a192f / #f59e0b'
  },
  {
    id: 'ivory-minimalist',
    name: 'Ivory Minimal',
    tagline: 'Warm Paper Ivory & Cobalt Daylight',
    badge: 'Light Mode',
    preview: '#f8f9fa / #2563eb'
  }
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('analysis_ui_theme');
    if (saved === 'zerodha-kite') return 'obsidian-ember';
    return saved || 'obsidian-ember';
  });

  useEffect(() => {
    localStorage.setItem('analysis_ui_theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
