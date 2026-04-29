import type { TenantConfig } from '@/lib/types/tenant';

export interface TenantAssets {
  logo: string;
  favicon: string;
  ogImage: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceElevated: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textDim: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fontFamily: string;
  cssVariables: Record<string, string>;
}

export interface ThemeConfig {
  colors: TenantAssets['brandColors'];
  logo: string;
  favicon: string;
  fontFamily: string;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  spacing: {
    1: string;
    2: string;
    3: string;
    4: string;
    6: string;
    8: string;
    12: string;
  };
}

export class WhiteLabelEngine {
  private cdnBaseUrl: string;

  constructor(cdnBaseUrl?: string) {
    this.cdnBaseUrl = cdnBaseUrl || process.env.CDN_BASE_URL || '';
  }

  resolveAssets(config: TenantConfig): TenantAssets {
    return {
      logo: this.resolveCDNUrl(config.brandLogo),
      favicon: this.resolveCDNUrl(config.brandFavicon),
      ogImage: this.resolveCDNUrl(config.brandLogo),
      brandColors: {
        primary: config.primaryColor,
        secondary: config.secondaryColor,
        accent: config.accentColor,
        background: config.backgroundColor,
        surface: config.surfaceColor,
        surfaceElevated: this.lightenColor(config.surfaceColor, 0.05),
        border: config.borderColor,
        textPrimary: config.textPrimaryColor,
        textSecondary: config.textSecondaryColor,
        textDim: config.textDimColor,
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: config.fontFamily,
      cssVariables: this.buildCSSVariables(config),
    };
  }

  resolveTheme(config: TenantConfig): ThemeConfig {
    const assets = this.resolveAssets(config);
    return {
      colors: assets.brandColors,
      logo: assets.logo,
      favicon: assets.favicon,
      fontFamily: assets.fontFamily,
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
      },
    };
  }

  buildCSSVariables(config: TenantConfig): Record<string, string> {
    return {
      '--brand-primary': config.primaryColor,
      '--brand-secondary': config.secondaryColor,
      '--brand-accent': config.accentColor,
      '--brand-font': config.fontFamily,
      '--color-background': config.backgroundColor,
      '--color-surface': config.surfaceColor,
      '--color-border': config.borderColor,
      '--color-text-primary': config.textPrimaryColor,
      '--color-text-secondary': config.textSecondaryColor,
      '--color-text-dim': config.textDimColor,
      ...config.cssVariables,
    };
  }

  generateCSSFromTheme(theme: ThemeConfig): string {
    const { colors, fontFamily, borderRadius, spacing } = theme;
    return `
      :root {
        --brand-primary: ${colors.primary};
        --brand-secondary: ${colors.secondary};
        --brand-accent: ${colors.accent};
        --brand-font: ${fontFamily};
        --color-background: ${colors.background};
        --color-surface: ${colors.surface};
        --color-surface-elevated: ${colors.surfaceElevated};
        --color-border: ${colors.border};
        --color-text-primary: ${colors.textPrimary};
        --color-text-secondary: ${colors.textSecondary};
        --color-text-dim: ${colors.textDim};
        --color-success: ${colors.success};
        --color-warning: ${colors.warning};
        --color-error: ${colors.error};
        --color-info: ${colors.info};
        --radius-sm: ${borderRadius.sm};
        --radius-md: ${borderRadius.md};
        --radius-lg: ${borderRadius.lg};
        --radius-xl: ${borderRadius.xl};
        --space-1: ${spacing[1]};
        --space-2: ${spacing[2]};
        --space-3: ${spacing[3]};
        --space-4: ${spacing[4]};
        --space-6: ${spacing[6]};
        --space-8: ${spacing[8]};
        --space-12: ${spacing[12]};
      }

      body {
        font-family: var(--brand-font);
        background-color: var(--color-background);
        color: var(--color-text-primary);
      }
    `;
  }

  private resolveCDNUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path;
    return `${this.cdnBaseUrl}/${path}`;
  }

  private lightenColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
    const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(255 * amount));
    const b = Math.min(255, (num & 0x0000ff) + Math.round(255 * amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}

let whiteLabelEngineInstance: WhiteLabelEngine | null = null;

export function getWhiteLabelEngine(cdnBaseUrl?: string): WhiteLabelEngine {
  if (!whiteLabelEngineInstance) {
    whiteLabelEngineInstance = new WhiteLabelEngine(cdnBaseUrl);
  }
  return whiteLabelEngineInstance;
}
