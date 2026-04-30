'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, useSpring } from 'framer-motion';

interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

interface ThemeEngineConfig {
  accentColor: string;
  accentGlowIntensity: number;
  blurIntensity: number;
  glassOpacity: number;
  borderRadiusBase: number;
  borderRadiusLarge: number;
  animationSpeedFactor: number;
  springStiffness: number;
  springDamping: number;
  shadowIntensity: number;
  spacingScale: number;
  fontPreset: FontPreset;
}

type FontPreset = 'futuristic' | 'editorial' | 'minimal' | 'technical';

interface ThemeEngineContextValue {
  config: ThemeEngineConfig;
  updateConfig: (partial: Partial<ThemeEngineConfig>) => void;
  getSpringConfig: () => SpringConfig;
  cssVariables: Record<string, string>;
  resolvedFontFamily: { display: string; body: string; mono: string; accent: string };
  resetToDefaults: () => void;
  exportPreset: () => ThemeEngineConfig;
  importPreset: (preset: ThemeEngineConfig) => void;
}

const DEFAULT_CONFIG: ThemeEngineConfig = {
  accentColor: '#d4af37',
  accentGlowIntensity: 40,
  blurIntensity: 12,
  glassOpacity: 4,
  borderRadiusBase: 12,
  borderRadiusLarge: 20,
  animationSpeedFactor: 1.0,
  springStiffness: 400,
  springDamping: 25,
  shadowIntensity: 100,
  spacingScale: 100,
  fontPreset: 'futuristic',
};

const FONT_FAMILIES: Record<FontPreset, { display: string; body: string; mono: string; accent: string }> = {
  futuristic: {
    display: "'Fraunces Variable', serif",
    body: "'Geist Variable', sans-serif",
    mono: "'JetBrains Mono Variable', monospace",
    accent: "'Syne Variable', sans-serif",
  },
  editorial: {
    display: "'Playfair Display', serif",
    body: "'Source Serif 4', serif",
    mono: "'IBM Plex Mono', monospace",
    accent: "'Playfair Display', serif",
  },
  minimal: {
    display: "'Inter Variable', sans-serif",
    body: "'Inter Variable', sans-serif",
    mono: "'JetBrains Mono Variable', monospace",
    accent: "'Inter Variable', sans-serif",
  },
  technical: {
    display: "'JetBrains Mono Variable', monospace",
    body: "'IBM Plex Mono', monospace",
    mono: "'JetBrains Mono Variable', monospace",
    accent: "'IBM Plex Mono', monospace",
  },
};

const STORAGE_KEY = 'omnipulse-theme-engine';

const ThemeEngineContext = createContext<ThemeEngineContextValue | null>(null);

function generateCssVariables(config: ThemeEngineConfig): Record<string, string> {
  const fontFamily = FONT_FAMILIES[config.fontPreset];
  const speedFactor = 1 / config.animationSpeedFactor;

  return {
    '--accent-color': config.accentColor,
    '--accent-glow-intensity': `${config.accentGlowIntensity}%`,
    '--blur-intensity': `${config.blurIntensity}px`,
    '--glass-opacity': `${config.glassOpacity}%`,
    '--border-radius-base': `${config.borderRadiusBase}px`,
    '--border-radius-large': `${config.borderRadiusLarge}px`,
    '--animation-speed-factor': String(speedFactor),
    '--spring-stiffness': String(config.springStiffness),
    '--spring-damping': String(config.springDamping),
    '--shadow-intensity': `${config.shadowIntensity}%`,
    '--spacing-scale': `${config.spacingScale}%`,
    '--font-display': fontFamily.display,
    '--font-body': fontFamily.body,
    '--font-mono': fontFamily.mono,
    '--font-accent': fontFamily.accent,
    '--motion-base': '1s',
    '--motion-fast': `calc(0.2s * ${speedFactor})`,
    '--motion-normal': `calc(0.4s * ${speedFactor})`,
    '--motion-slow': `calc(0.6s * ${speedFactor})`,
    '--motion-spring': `calc(0.3s * ${speedFactor})`,
  };
}

export function ThemeEngineProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeEngineConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  const updateConfig = useCallback((partial: Partial<ThemeEngineConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const getSpringConfig = useCallback((): SpringConfig => {
    return {
      stiffness: config.springStiffness,
      damping: config.springDamping,
    };
  }, [config.springStiffness, config.springDamping]);

  const cssVariables = useMemo(() => generateCssVariables(config), [config]);
  const resolvedFontFamily = useMemo(() => FONT_FAMILIES[config.fontPreset], [config.fontPreset]);

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const exportPreset = useCallback(() => {
    return { ...config };
  }, [config]);

  const importPreset = useCallback((preset: ThemeEngineConfig) => {
    setConfig({ ...DEFAULT_CONFIG, ...preset });
  }, []);

  return (
    <ThemeEngineContext.Provider
      value={{
        config,
        updateConfig,
        getSpringConfig,
        cssVariables,
        resolvedFontFamily,
        resetToDefaults,
        exportPreset,
        importPreset,
      }}
    >
      {children}
    </ThemeEngineContext.Provider>
  );
}

export function useThemeEngine(): ThemeEngineContextValue {
  const context = useContext(ThemeEngineContext);
  if (!context) {
    throw new Error('useThemeEngine must be used within a ThemeEngineProvider');
  }
  return context;
}

interface AccentColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export const AccentColorPicker = memo(function AccentColorPicker({
  value,
  onChange,
  className = '',
}: AccentColorPickerProps) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 80 }}>
        Accent Color
      </label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 40,
          height: 32,
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          background: 'transparent',
        }}
      />
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
        {value.toUpperCase()}
      </span>
    </div>
  );
});

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

export const SliderControl = memo(function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  className = '',
}: SliderControlProps) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</label>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: 4,
          borderRadius: 2,
          appearance: 'none',
          background: `linear-gradient(to right, var(--accent-color) ${((value - min) / (max - min)) * 100}%, var(--border-default) ${((value - min) / (max - min)) * 100}%)`,
          cursor: 'pointer',
        }}
      />
    </div>
  );
});

interface FontPresetSelectorProps {
  value: FontPreset;
  onChange: (preset: FontPreset) => void;
  className?: string;
}

const FONT_PRESET_LABELS: Record<FontPreset, string> = {
  futuristic: 'Fraunces + Geist',
  editorial: 'Playfair + Source Serif',
  minimal: 'Inter',
  technical: 'JetBrains Mono',
};

export const FontPresetSelector = memo(function FontPresetSelector({
  value,
  onChange,
  className = '',
}: FontPresetSelectorProps) {
  const presets: FontPreset[] = ['futuristic', 'editorial', 'minimal', 'technical'];

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Font Pairing</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: value === preset ? '2px solid var(--accent-color)' : '2px solid var(--border-default)',
              background: value === preset ? 'var(--accent-color)' : 'transparent',
              color: value === preset ? 'var(--bg-void)' : 'var(--text-secondary)',
              fontSize: 11,
              fontFamily: 'var(--font-accent)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {FONT_PRESET_LABELS[preset]}
          </button>
        ))}
      </div>
    </div>
  );
});

interface ThemeEnginePanelProps {
  className?: string;
}

export const ThemeEnginePanel = memo(function ThemeEnginePanel({
  className = '',
}: ThemeEnginePanelProps) {
  const { config, updateConfig, resetToDefaults } = useThemeEngine();

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: 20,
        background: 'var(--bg-surface)',
        borderRadius: 'var(--border-radius-large)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Visual Theme Engine
        </h3>
        <button
          onClick={resetToDefaults}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--border-default)',
            background: 'transparent',
            color: 'var(--text-tertiary)',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      <AccentColorPicker
        value={config.accentColor}
        onChange={(color) => updateConfig({ accentColor: color })}
      />

      <SliderControl
        label="Accent Glow"
        value={config.accentGlowIntensity}
        min={0}
        max={100}
        unit="%"
        onChange={(v) => updateConfig({ accentGlowIntensity: v })}
      />

      <SliderControl
        label="Blur Intensity"
        value={config.blurIntensity}
        min={0}
        max={32}
        step={2}
        unit="px"
        onChange={(v) => updateConfig({ blurIntensity: v })}
      />

      <SliderControl
        label="Glass Opacity"
        value={config.glassOpacity}
        min={0}
        max={20}
        unit="%"
        onChange={(v) => updateConfig({ glassOpacity: v })}
      />

      <SliderControl
        label="Border Radius"
        value={config.borderRadiusBase}
        min={4}
        max={24}
        step={2}
        unit="px"
        onChange={(v) => updateConfig({ borderRadiusBase: v, borderRadiusLarge: v + 8 })}
      />

      <SliderControl
        label="Animation Speed"
        value={config.animationSpeedFactor * 100}
        min={50}
        max={300}
        step={10}
        unit="%"
        onChange={(v) => updateConfig({ animationSpeedFactor: v / 100 })}
      />

      <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16 }}>
        <p style={{ margin: '0 0 12px', fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Spring Physics
        </p>
        <SliderControl
          label="Stiffness"
          value={config.springStiffness}
          min={100}
          max={600}
          step={50}
          onChange={(v) => updateConfig({ springStiffness: v })}
        />
        <SliderControl
          label="Damping"
          value={config.springDamping}
          min={10}
          max={40}
          onChange={(v) => updateConfig({ springDamping: v })}
        />
      </div>

      <SliderControl
        label="Shadow Intensity"
        value={config.shadowIntensity}
        min={0}
        max={200}
        step={10}
        unit="%"
        onChange={(v) => updateConfig({ shadowIntensity: v })}
      />

      <SliderControl
        label="Spacing Scale"
        value={config.spacingScale}
        min={80}
        max={150}
        step={5}
        unit="%"
        onChange={(v) => updateConfig({ spacingScale: v })}
      />

      <FontPresetSelector
        value={config.fontPreset}
        onChange={(preset) => updateConfig({ fontPreset: preset })}
      />
    </div>
  );
});

export default ThemeEngineProvider;
