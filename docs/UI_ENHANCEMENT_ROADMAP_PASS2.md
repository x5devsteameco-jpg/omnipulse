# Omnipulse UI Enhancement — Pass 2 of 3
## Advanced Customization Engine + WebGL Immersion + Audio Reactive

---

## PASS 2: ADVANCED CUSTOMIZATION ENGINE

### Spring Physics Laboratory
```tsx
// Live spring tuning panel — users test physics in real-time
interface SpringLabProps {
  children: React.ReactNode;  // Test card that responds to spring changes
}

// Spring visualization: shows mass, stiffness, damping as interactive graph
// User drags sliders, card animates in real-time with new spring values
// Preset profiles: "Crisp", "Smooth", "Bouncy", "Heavy", "Subtle"
// Save custom profiles to localStorage
```

### Preset Manager
```tsx
interface PresetManagerProps {
  currentConfig: ThemeEngineConfig;
  onSave: (name: string) => void;
  onLoad: (preset: SavedPreset) => void;
  onDelete: (name: string) => void;
  presets: SavedPreset[];
}

interface SavedPreset {
  id: string;
  name: string;
  config: ThemeEngineConfig;
  createdAt: string;
  isBuiltIn: boolean;  // true for factory presets
}

// Factory presets:
// - "Omnipulse Dark" — current defaults
// - "Platinum Light" — light mode, subtle blue accents
// - "Neon Night" — high contrast, cyan/violet glow
// - "Minimal Pro" — reduced motion, minimal shadows
// - "Editorial" — warm amber, Serif typography
// - "Brutalist" — raw black, bold geometry

// Export/import as JSON file for sharing
```

### Animation Speed Dial
```tsx
// Global speed multiplier applied to ALL animations
// 50% = half speed (slow-mo), 200% = double speed (snappy)
// Affects framer-motion transition durations, spring stiffness scaling
// Stored in CSS var --animation-speed-factor

// Live preview: test card does spring settle animation on each change
// Speed = 0.5 → durations double
// Speed = 2.0 → durations halve
```

### Color Harmony Engine
```tsx
// Auto-generate harmonious color palettes from base accent
interface ColorHarmonyConfig {
  baseColor: string;          // HSL manipulation
  harmonyMode: 'complement' | 'triad' | 'analogous' | 'split-complement' | 'tetrad';
  saturationBoost: number;    // 0-1
  lightnessRange: [number, number];
}

// Generates:
// - Primary, secondary, accent, muted, destructive from base
// - All platform colors harmonized to match brand
// - Status colors (success/warning/error/info) in same hue family
// - Preview swatch showing all colors together
```

### Border Radius & Spacing Scale
```tsx
// Visual radius adjuster — drag handles on card preview to see changes
// Common presets:
// - "Soft"    → border-radius: 20px, cards: 24px
// - "Medium"  → border-radius: 12px, cards: 16px
// - "Sharp"   → border-radius: 4px, cards: 8px
// - "Pill"    → border-radius: 9999px, buttons: 9999px
// - "Circle"  → border-radius: 50%

// Spacing scale: 80%-150% multiplier applied to all --space-* tokens
```

### Advanced Glassmorphism Controls
```tsx
// Granular glass control beyond simple blur slider
interface GlassControls {
  blurIntensity: number;     // 0-32px
  bgOpacity: number;          // 0-20%
  borderOpacity: number;      // 0-30%
  saturationBoost: number;    // 100-200%
  brightnessBoost: number;     // 90-110%
  animationSpeed: 'static' | 'slow' | 'normal';  // shimmer speed
}

// Tiers still exist: glass-tier-0 through glass-tier-4
// But users can override individual properties
```

### Typography Customization Panel
```tsx
// Live font preview panel
interface TypographyPanelProps {
  fontPreset: FontPreset;
  onChange: (preset: FontPreset) => void;
  customOverrides?: {
    displayFont?: string;
    bodyFont?: string;
    monoFont?: string;
  };
}

// Font preview shows:
// - All headings (H1-H6) in selected font
// - Body paragraph in selected font
// - Metrics/numbers in mono font
// - Labels/tags in accent font

// Weight slider: shows scale from 100-900 in real-time
// Letter-spacing control for display vs body
```

---

## PASS 2: IMMERSIVE ELEMENTS

### WebGL Canvas Starfield
```tsx
// Heavy particle effect — 150 stars, depth-layered parallax
// Uses canvas with requestAnimationFrame for 60fps
// Mouse parallax: foreground moves faster than background
// Optional: user can toggle on/off via keyboard shortcut

interface StarfieldConfig {
  starCount: number;         // 50-200
  depthLayers: number;       // 3 layers
  parallaxFactor: number;    // how much layers move on scroll
  color: string;             // base star color
  twinkleSpeed: number;      // 0.01-0.05
  fadeOnIdle: boolean;       // dims after 10s no interaction
}
```

### Lottie Animation Integration
```tsx
// LottiePlayer component wrapping react-lottie-player
// Built-in animations for common states:

interface LottieAnimations {
  // Loading states
  loadingOrbit:    // Gold orbital dots, 30kb
  loadingPulse:    // Pulse ring, 20kb
  loadingShimmer:  // Shimmer sweep, 25kb

  // Success states
  successCheck:    // Morphing checkmark, 40kb
  successBurst:     // Particle burst, 50kb

  // Error states
  errorShake:      // Shake + X mark, 30kb
  errorPulse:      // Warning pulse, 25kb

  // Empty states
  emptyPlatform:    // Platform icon subtle bounce, 35kb
  emptyChart:       // Chart outline draw, 40kb

  // Ambient
  ambientBlob:      // Morphing gradient blob, 100kb
  ambientWave:       // Sound wave visualization, 80kb
}

// All animations respect prefers-reduced-motion
// All have gold brand color variants
```

### SVG Morphing System
```tsx
// IconMorph component — morphs between two SVG paths
// Uses framer-motion or custom path interpolation

interface IconMorphProps {
  paths: {
    default: string;   // SVG path d attribute
    hover?: string;
    active?: string;
    disabled?: string;
  };
  duration?: number;
  easing?: string;
}

// Built-in morphs:
// - Nav icons: outline ↔ filled
// - Trend arrows: up ↔ down ↔ neutral
// - Platform logos: subtle pulse animation
// - Status indicators: dot ↔ ring pulse
// - Actions: plus ↔ x (close button)
// - Play/pause button morph
```

### Background Shader Effects
```tsx
// Three.js or CSS-only shader implementations:

// 1. Animated gradient mesh (CSS-only, lightweight)
interface GradientMeshShader {
  colors: string[];           // 4 point colors
  animationSpeed: number;     // rotation speed
  turbulence: number;        // distortion amount
  // Uses CSS conic-gradient + rotation animation
}

// 2. Flowing noise pattern (SVG feTurbulence)
interface NoiseFlowShader {
  baseFrequency: number;     // 0.01-0.1
  numOctaves: number;        // 3-6
  animateSpeed: number;      // 0.1-1.0
  blendMode: string;          // overlay/screen/multiply
  opacity: number;           // 0.02-0.08
  // Uses SVG feTurbulence + feDisplacementMap
}

// 3. Light leak effect (CSS radial gradients)
interface LightLeakShader {
  colors: string[];          // warm colors
  positions: Array<{x: number, y: number}>;
  breatheSpeed: number;      // 4-10s cycle
  // Radial gradients that expand/contract
```

### Ambient Sound Design (Web Audio API)
```tsx
// Sonification — data-driven audio feedback

interface SonificationConfig {
  enabled: boolean;
  hoverFeedback: boolean;     // subtle tick on hover
  clickFeedback: boolean;     // soft click on click
  alertFeedback: boolean;     // chime on new alert
  dataToneMapping: {
    metric: 'frequency' | 'volume' | 'panning';
    highValue: number;        // Hz for high values
    lowValue: number;         // Hz for low values
  };
}

// Hover: 800Hz sine, 20ms, -20dB
// Click: 1000Hz sine, 30ms, -15dB
// Alert: Chord (C4-E4-G4), 200ms, -10dB
// Trend up: Rising arpeggio
// Trend down: Falling arpeggio
// Loading: Very subtle 60Hz hum (almost subliminal)

// All audio synthesized via Web Audio API — no audio files
// User toggle in settings to disable
// Respects system accessibility audio settings
```

### Particle Effects (Continued)
```tsx
// Floating Orb Variants
interface OrbVariant {
  size: number;              // diameter in px
  color: string;             // RGBA
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  animationDuration: number; // 15-30s
  animationDelay: number;   // 0-10s
  blurAmount: number;        // 20-60px
}

// Default setup:
// - Orb 1: Gold, top-left, 25s, 0.3s delay
// - Orb 2: Violet, top-right, 20s, 2s delay
// - Orb 3: Cyan, bottom-center, 30s, 5s delay

// All orbs: radial gradient, blur filter, fixed position
// Animation: CSS keyframes (translate + scale)
// Pointer-events: none
```

### Grain Texture System
```tsx
// Film grain overlay — always present but subtle
// SVG feTurbulence filter, applied to fixed overlay

interface GrainConfig {
  intensity: number;         // 0.02-0.08
  baseFrequency: number;    // 0.6-1.2
  animationSpeed: number;   // 0 = static, 0.05 = animated
}

// Static grain (performance friendly):
// - baseFrequency: 0.8
// - intensity: 0.04
// - animationSpeed: 0

// Animated grain (subtle flicker):
// - baseFrequency: 0.65
// - intensity: 0.035
// - animationSpeed: 0.02

// Applied to: ::before pseudo-element on body
// Pointer-events: none
// Mix-blend-mode: overlay or multiply
// Z-index: 9999 (above everything)
```

---

## PASS 2: TECH STACK ADDITIONS

```bash
# For Pass 2
npm install three @react-three/fiber @react-three/drei  # WebGL (optional, heavy)
npm install @lottiefiles/react-lottie-player            # Lottie player
npm install framer-motion                              # already installed
```

```tsx
// Integration example for Lottie
import { Player, Controls } from '@lottiefiles/react-lottie-player';

<LottiePlayer
  src="/animations/success-check.json"
  autoplay={false}
  loop={false}
  style={{ width: 64, height: 64 }}
/>
```

---

## PASS 2: CROSS-CUTTING CONCERNS

### Performance Guards
```tsx
// All heavy effects gated behind:
// 1. User preference (settings toggle)
// 2. Hardware detection (GPU tier)
// 3. prefers-reduced-motion
// 4. Battery saver mode (navigator.getBattery)
// 5. PerformanceObserver (frame rate < 30 = disable effects)

function shouldEnableHeavyEffects(): boolean {
  if (prefersReducedMotion) return false;
  if (getBatteryLevel() < 0.2) return false;
  if (GPU tier === 'low') return false;
  if (currentFPS < 30) return false;
  return true;
}
```

### Accessibility Audit
```
✓ All animations have reduced-motion fallbacks
✓ Color contrast maintained (WCAG AA minimum)
✓ Focus indicators visible on all interactive elements
✓ Screen reader announcements for dynamic content
✓ Keyboard navigation for all interactions
✓ Audio can be disabled globally
✓ prefers-reduced-motion respected throughout
✓ No autoplay animations without user consent
```

---

**Pass 2 Status**: Documented
**Pass 3**: Spatial UI (3D Dashboard) + AI Microcopy + Haptic Simulation
