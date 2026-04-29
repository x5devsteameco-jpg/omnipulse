'use client';

import { createContext, useContext, ReactNode } from 'react';

export interface ThemeContextValue {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logo: string;
}

const DEFAULT_THEME: ThemeContextValue = {
  brandName: 'OmniPulse',
  primaryColor: '#1a1a1a',
  secondaryColor: '#2d2d2d',
  accentColor: '#d4af37',
  fontFamily: 'Inter, system-ui, sans-serif',
  logo: '/logo.svg',
};

const ThemeContext = createContext<ThemeContextValue>(DEFAULT_THEME);

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
  tenantSlug?: string;
  theme?: Partial<ThemeContextValue>;
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  const value: ThemeContextValue = {
    ...DEFAULT_THEME,
    ...theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
