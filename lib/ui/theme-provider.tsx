'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getWhiteLabelEngine, type ThemeConfig } from '@/lib/white-label/engine';
import type { TenantConfig } from '@/lib/types/tenant';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeConfig;
  tenantConfig: TenantConfig | null;
  cssVariables: Record<string, string>;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const LIGHT_CSS_VARIABLES = `
  --bg-void: #f8fafc;
  --bg-deep: #f1f5f9;
  --bg-primary: #ffffff;
  --bg-elevated: #f8fafc;
  --bg-surface: #f1f5f9;
  --bg-card: #ffffff;
  --bg-hover: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --text-dim: #94a3b8;
  --text-inverse: #f8fafc;
  --border-subtle: rgba(0, 0, 0, 0.04);
  --border-default: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.12);
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(0, 0, 0, 0.08);
  --glass-hover: rgba(0, 0, 0, 0.04);
`;

const DARK_CSS_VARIABLES = `
  --bg-void: #030307;
  --bg-deep: #050510;
  --bg-primary: #0a0a12;
  --bg-elevated: #12121c;
  --bg-surface: #1a1a28;
  --bg-card: #22223a;
  --bg-hover: #2a2a40;
  --text-primary: #f8fafc;
  --text-secondary: #a1aab8;
  --text-tertiary: #6b7280;
  --text-dim: #4b5563;
  --text-inverse: #0a0a12;
  --border-subtle: rgba(255, 255, 255, 0.04);
  --border-default: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.12);
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-hover: rgba(255, 255, 255, 0.06);
`;

interface TenantStylesProviderProps {
  children: React.ReactNode;
  tenantConfig: TenantConfig | null;
}

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function TenantStylesProvider({
  children,
  tenantConfig,
}: TenantStylesProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    setSystemPreference(getSystemPreference());
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPreference(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('omnipulse-theme') as ThemeMode | null;
    if (stored) setMode(stored);
  }, []);

  const resolvedMode = mode === 'system' ? systemPreference : mode;

  useEffect(() => {
    localStorage.setItem('omnipulse-theme', mode);
    document.documentElement.setAttribute('data-theme', resolvedMode);
  }, [mode, resolvedMode]);

  const value = useMemo(() => {
    if (!tenantConfig) {
      return {
        theme: null as unknown as ThemeConfig,
        tenantConfig: null,
        cssVariables: {},
        mode,
        setMode,
        resolvedMode,
      };
    }

    const engine = getWhiteLabelEngine();
    const theme = engine.resolveTheme(tenantConfig);
    const cssVariables = engine.buildCSSVariables(tenantConfig);

    return {
      theme,
      tenantConfig,
      cssVariables,
      mode,
      setMode,
      resolvedMode,
    };
  }, [tenantConfig, mode, resolvedMode]);

  const baseCSS = useMemo(() => {
    return resolvedMode === 'dark' ? DARK_CSS_VARIABLES : LIGHT_CSS_VARIABLES;
  }, [resolvedMode]);

  const cssString = useMemo(() => {
    if (!value.theme) return baseCSS;
    const engine = getWhiteLabelEngine();
    const themeCSS = engine.generateCSSFromTheme(value.theme);
    return baseCSS + themeCSS;
  }, [value.theme, baseCSS]);

  return (
    <ThemeContext.Provider value={value}>
      <style dangerouslySetInnerHTML={{ __html: cssString }} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTenantTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTenantTheme must be used within a TenantStylesProvider');
  }
  return context;
}

export function useTenantColors() {
  const { theme } = useTenantTheme();
  return theme?.colors;
}

export function useThemeMode() {
  const { mode, setMode, resolvedMode } = useTenantTheme();
  return { mode, setMode, resolvedMode };
}
