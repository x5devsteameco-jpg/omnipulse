'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { getWhiteLabelEngine, type ThemeConfig } from '@/lib/white-label/engine';
import type { TenantConfig } from '@/lib/types/tenant';

interface ThemeContextValue {
  theme: ThemeConfig;
  tenantConfig: TenantConfig | null;
  cssVariables: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface TenantStylesProviderProps {
  children: React.ReactNode;
  tenantConfig: TenantConfig | null;
}

export function TenantStylesProvider({
  children,
  tenantConfig,
}: TenantStylesProviderProps) {
  const value = useMemo(() => {
    if (!tenantConfig) {
      return {
        theme: null as unknown as ThemeConfig,
        tenantConfig: null,
        cssVariables: {},
      };
    }

    const engine = getWhiteLabelEngine();
    const theme = engine.resolveTheme(tenantConfig);
    const cssVariables = engine.buildCSSVariables(tenantConfig);

    return {
      theme,
      tenantConfig,
      cssVariables,
    };
  }, [tenantConfig]);

  const cssString = useMemo(() => {
    if (!value.theme) return '';
    const engine = getWhiteLabelEngine();
    return engine.generateCSSFromTheme(value.theme);
  }, [value.theme]);

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
