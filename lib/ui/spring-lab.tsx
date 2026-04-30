'use client';

import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

interface SpringLabProps {
  className?: string;
}

const SPRING_PRESETS = {
  crisp: { stiffness: 600, damping: 35, mass: 0.8 },
  smooth: { stiffness: 280, damping: 24, mass: 1.2 },
  bouncy: { stiffness: 400, damping: 12, mass: 0.9 },
  heavy: { stiffness: 280, damping: 30, mass: 1.4 },
  subtle: { stiffness: 600, damping: 40, mass: 0.7 },
};

type SpringPresetKey = keyof typeof SPRING_PRESETS;

export const SpringLab = memo(function SpringLab({ className = '' }: SpringLabProps) {
  const [preset, setPreset] = useState<SpringPresetKey>('bouncy');
  const [config, setConfig] = useState(SPRING_PRESETS[preset]);
  const [isAnimating, setIsAnimating] = useState(false);

  const scale = useMotionValue(1);
  const x = useMotionValue(0);

  const springConfig: SpringConfig = {
    stiffness: config.stiffness,
    damping: config.damping,
    mass: config.mass,
  };

  const scaleSpring = useSpring(scale, springConfig);
  const xSpring = useSpring(x, springConfig);

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    scale.set(0.9);
    x.set(-10);
    setTimeout(() => {
      scale.set(1.05);
      x.set(10);
    }, 100);
    setTimeout(() => {
      scale.set(0.98);
      x.set(-5);
    }, 200);
    setTimeout(() => {
      scale.set(1);
      x.set(0);
      setIsAnimating(false);
    }, 400);
  }, [scale, x]);

  const handlePresetChange = (key: SpringPresetKey) => {
    setPreset(key);
    setConfig(SPRING_PRESETS[key]);
    triggerAnimation();
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(Object.keys(SPRING_PRESETS) as SpringPresetKey[]).map((key) => (
          <button
            key={key}
            onClick={() => handlePresetChange(key)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: preset === key ? '2px solid var(--accent-color)' : '2px solid var(--border-default)',
              background: preset === key ? 'var(--accent-color)' : 'transparent',
              color: preset === key ? 'var(--bg-void)' : 'var(--text-secondary)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {key}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            Stiffness: {config.stiffness}
          </label>
          <input
            type="range"
            min={100}
            max={700}
            step={10}
            value={config.stiffness}
            onChange={(e) => setConfig((c) => ({ ...c, stiffness: Number(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            Damping: {config.damping}
          </label>
          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={config.damping}
            onChange={(e) => setConfig((c) => ({ ...c, damping: Number(e.target.value) }))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <button
        onClick={triggerAnimation}
        disabled={isAnimating}
        style={{
          padding: '12px 20px',
          borderRadius: 12,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          cursor: isAnimating ? 'not-allowed' : 'pointer',
          fontSize: 13,
          fontFamily: 'var(--font-mono)',
          opacity: isAnimating ? 0.6 : 1,
        }}
      >
        Trigger Spring Animation
      </button>

      <motion.div
        style={{
          scale: scaleSpring,
          x: xSpring,
          translateX: '-50%',
          margin: '0 auto',
          width: 120,
          height: 120,
          borderRadius: 16,
          background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-emerald) 100%)',
          boxShadow: '0 0 40px var(--accent-glow-intensity)',
        }}
      />
    </div>
  );
});

interface ColorHarmonyProps {
  baseColor: string;
  onChange: (harmony: ColorHarmony) => void;
  className?: string;
}

export interface ColorHarmony {
  base: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  destructive: string;
}

function hexToHsl(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateHarmony(base: string, mode: string): ColorHarmony {
  const [h, s, l] = hexToHsl(base);
  const harmonies: Record<string, [number, number, number]> = {
    complement: [h + 180, s, l],
    triad: [h + 120, s, l],
    analogous: [h + 30, s, l],
    'split-complement': [h + 150, s, l],
    tetrad: [h + 90, s, l],
  };
  const [h2, s2, l2] = harmonies[mode] || [h, s, l];
  return {
    base,
    primary: base,
    secondary: hslToHex(h2, s2, l2),
    accent: hslToHex(h2, Math.min(s2 + 10, 100), Math.min(l2 + 10, 100)),
    muted: hslToHex(h, s * 0.3, l * 1.2),
    destructive: hslToHex(0, s * 0.8, l * 0.7),
  };
}

export const ColorHarmony = memo(function ColorHarmony({ baseColor, onChange, className = '' }: ColorHarmonyProps) {
  const [mode, setMode] = useState('analogous');
  const [harmony, setHarmony] = useState<ColorHarmony>(() => generateHarmony(baseColor, mode));

  useEffect(() => {
    const h = generateHarmony(baseColor, mode);
    setHarmony(h);
    onChange(h);
  }, [baseColor, mode, onChange]);

  const modes = ['analogous', 'complement', 'triad', 'split-complement', 'tetrad'];
  const swatches = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'muted', label: 'Muted' },
    { key: 'destructive', label: 'Error' },
  ];

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: mode === m ? '1px solid var(--accent-color)' : '1px solid var(--border-default)',
              background: mode === m ? 'var(--accent-color)' : 'transparent',
              color: mode === m ? 'var(--bg-void)' : 'var(--text-tertiary)',
              fontSize: 10,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {m}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {swatches.map((swatch) => (
          <div key={swatch.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: harmony[swatch.key as keyof ColorHarmony],
                border: '1px solid var(--border-default)',
              }}
            />
            <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{swatch.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default SpringLab;
