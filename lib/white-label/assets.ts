export interface TenantAssets {
  logo: string;
  favicon: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
  };
  fontFamily: string;
  cssVariables: Record<string, string>;
}

import { configStore } from '../config/store';

export class WhiteLabelEngine {
  async resolveAssets(tenantSlug: string): Promise<TenantAssets> {
    const config = await configStore.getConfig(tenantSlug);

    return {
      logo: config.brandLogo || '/logo.svg',
      favicon: '/favicon.ico',
      brandColors: {
        primary: config.primaryColor,
        secondary: config.secondaryColor,
        accent: config.accentColor,
        background: '#0a0a0a',
        surface: '#1a1a1a',
        textPrimary: '#ffffff',
        textSecondary: '#a0a0a0',
      },
      fontFamily: config.brandFont || 'Inter, system-ui, sans-serif',
      cssVariables: {
        '--brand-primary': config.primaryColor,
        '--brand-secondary': config.secondaryColor,
        '--brand-accent': config.accentColor,
        '--brand-bg': '#0a0a0a',
        '--brand-surface': '#1a1a1a',
        '--brand-text': '#ffffff',
        '--brand-text-dim': '#a0a0a0',
      },
    };
  }
}

export const whiteLabelEngine = new WhiteLabelEngine();
