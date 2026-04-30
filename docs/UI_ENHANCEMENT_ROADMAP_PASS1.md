# Omnipulse UI Enhancement — Pass 1 of 3
## Motion Design System v2 + Visual Polish + Typography

---

## PASS 1: ADVANCED MOTION DESIGN v2

### Motion Philosophy
```
Omnipulse Motion Laws:
1. Every element enters with purpose — never gratuitous animation
2. Physics must feel real — springs tuned to tangible objects (cards, buttons, modals)
3. Stagger creates rhythm — 50ms between items creates perceived "flow"
4. Tilt creates depth — parallax tilt separates content planes
5. Scroll orchestrates narrative — users scroll through the data story
6. Reduced motion is sacred — all animations degrade gracefully
```

### Spring Physics Lab
```ts
// Pre-defined spring profiles for different object masses
const SPRING_PRESETS = {
  // Heavy: modals, panels — slow settle
  heavy:    { stiffness: 280, damping: 24, mass: 1.2 },
  // Medium: cards, widgets — natural feel
  medium:   { stiffness: 400, damping: 28, mass: 1.0 },
  // Light: buttons, badges — snappy
  light:    { stiffness: 560, damping: 30, mass: 0.8 },
  // Bouncy: CTAs, toggles — playful overshoot
  bouncy:   { stiffness: 400, damping: 12, mass: 0.9 },
  // Subtle: text, badges — barely there
  subtle:   { stiffness: 600, damping: 35, mass: 0.7 },
};

// Spring that reacts to user's global speed setting
function getTunedSpring(preset: keyof typeof SPRING_PRESETS, speedFactor: number) {
  const s = SPRING_PRESETS[preset];
  return {
    stiffness: s.stiffness * speedFactor,
    damping: s.damping,
    mass: s.mass,
  };
}
```

### Animation Token System
```css
:root {
  /* Base durations (multiplied by --animation-speed-factor at runtime) */
  --duration-instant:   0.08s;
  --duration-fast:      0.15s;
  --duration-normal:    0.25s;
  --duration-slow:      0.40s;
  --duration-slower:    0.60s;
  --duration-glacial:   1.00s;

  /* Spring presets (referenced via custom properties) */
  --spring-card:       cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-button:     cubic-bezier(0.34, 1.20, 0.64, 1);
  --spring-modal:      cubic-bezier(0.22, 1.00, 0.36, 1);
  --spring-settle:     cubic-bezier(0.16, 1.00, 0.30, 1);
  --spring-overshoot:  cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Stagger delays */
  --stagger-micro:     0.03s;
  --stagger-small:     0.05s;
  --stagger-medium:    0.08s;
  --stagger-large:     0.12s;
  --stagger-section:   0.20s;

  /* Motion orchestration — orchestrates multi-element reveals */
  --orchestra-fade:      translateY(12px) opacity(0→1);
  --orchestra-slide:     translateX(-20px) opacity(0→1);
  --orchestra-scale:     scale(0.95→1) opacity(0→1);
  --orchestra-blur-in:   filter blur(8px→0) opacity(0→1);
}
```

### Scroll-Triggered Orchestration
```tsx
// OrchestratedSection — reveals children with staggered scroll
interface OrchestratedSectionProps {
  children: React.ReactNode[];
  orchestraType?: 'fade' | 'slide' | 'scale' | 'blur-in';
  staggerDelay?: number;
  scrollTrigger?: 'enter' | 'exit' | 'both';
  threshold?: number;  // 0-1, how much of element visible before triggering
}

// Stagger pattern examples:
//  - Cards in grid: left-to-right, top-to-bottom (index * staggerDelay)
//  - List items: top-to-bottom (index * staggerDelay)
//  - Metrics: count up in sequence (100ms between each KPI)
//  - Charts: path draw animation (SVG stroke-dashoffset)
```

### 3D Tilt System (Enhanced)
```tsx
interface TiltSystemConfig {
  maxRotateX: number;      // ±15 default
  maxRotateY: number;      // ±15 default
  perspective: number;    // 1000px
  glareOpacity: number;   // 0.3 max
  scaleOnHover: number;   // 1.03
  resetDuration: number;  // 0.4s spring
  glareGradient: string;  // custom gradient angle + colors
}

// Shadow shifts dynamically based on tilt — simulates light from top-left
const dynamicShadow = (rotateX: number, rotateY: number) => {
  const shadowX = -rotateY * 0.5;
  const shadowY = rotateX * 0.5;
  const blur = Math.abs(rotateX) + Math.abs(rotateY);
  return `${shadowX}px ${shadowY}px ${blur * 2}px rgba(0,0,0,0.5)`;
};
```

### Entrance Choreography
```
Page Load Sequence (total ~2400ms):
├── 0ms:    Page skeleton visible
├── 100ms:  Gradient mesh background fades in
├── 200ms:  Particle field begins
├── 300ms:  Sidebar slides in from left (stagger 50ms per item)
├── 400ms:  Header fades in
├── 500ms:  Main content area scales up from 0.97
├── 600ms:  Bento grid cards enter (stagger 60ms, scale + fade)
├── 900ms:  KPI numbers begin count-up animation
├── 1200ms: Charts path-draw animation starts
├── 1500ms: Floating orbs appear
├── 1800ms: Cursor glow activates
└── 2400ms: All idle animations (orb float, shimmer) running
```

### Scroll-Linked Effects
```css
/* Parallax layers — elements move at different speeds on scroll */
.parallax-bg    { transform: translateY(calc(var(--scroll-y) * 0.1)); }
.parallax-mid   { transform: translateY(calc(var(--scroll-y) * 0.3)); }
.parallax-fg    { transform: translateY(calc(var(--scroll-y) * 0.5)); }

/* Progress indicator — scroll progress bar at top */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--gradient-gold);
  transform-origin: left;
  transform: scaleX(calc(var(--scroll-progress) * 100%));
}
```

---

## PASS 1: INTERACTIVE VISUAL POLISH

### Glassmorphism Tier System
```css
/* 5 tiers of glass — increasing blur + opacity */
.glass-tier-0 {
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.04);
}
.glass-tier-1 { /* base */ }
.glass-tier-2 { backdrop-filter: blur(16px); }
.glass-tier-3 { backdrop-filter: blur(24px); }
.glass-tier-4 { backdrop-filter: blur(32px); }

/* Glass with colored tint */
.glass-emerald { background: rgba(16, 185, 129, 0.08); }
.glass-rose    { background: rgba(244, 63, 94, 0.08); }
.glass-gold     { background: rgba(212, 175, 55, 0.08); }

/* Interactive glass states */
.glass-interactive {
  transition: all 0.2s var(--spring-settle);
}
.glass-interactive:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--glass-glow);
}
```

### Neumorphism System
```css
/* Soft UI — raised from surface */
.neu-raised {
  background: var(--bg-surface);
  box-shadow:
    6px 6px 12px rgba(0, 0, 0, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 0.03);
}

/* Sunken — pressed into surface */
.neu-sunken {
  background: var(--bg-surface);
  box-shadow:
    inset 4px 4px 8px rgba(0, 0, 0, 0.4),
    inset -4px -4px 8px rgba(255, 255, 255, 0.03);
}

/* Glow accent variant */
.neu-glow {
  box-shadow:
    0 0 20px var(--accent-glow-intensity),
    6px 6px 12px rgba(0, 0, 0, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 0.03);
}
```

### Micro-Interactions Inventory

| Interaction | Element | Behavior | Spring |
|-------------|---------|----------|--------|
| **Magnetic Hover** | All CTA buttons | Button lerps toward cursor within 80px radius, max 8px displacement | spring(150, 15) |
| **Click Ripple** | Buttons, cards | Radial wave from click point, scale 4x, opacity 1→0, 600ms | easeOut |
| **Tilt Glare** | Cards, modules | Pseudo-element gradient follows mouse, opacity tied to hover | spring(400, 30) |
| **Icon Morph** | Nav items | SVG path morphs between states (outline↔filled), 200ms | easeInOut |
| **Border Glow** | Focus states | Conic-gradient border rotates 360deg over 2s | linear |
| **Skeleton Shimmer** | Loading states | Gold gradient sweep left→right, 1.5s infinite | linear |
| **Number Count-Up** | KPIs | easeOutQuart over 2s, triggers on scroll into view | easeOutQuart |
| **Path Draw** | Charts | SVG stroke-dashoffset animates path drawing, 1.2s | easeInOut |
| **Toast Slide** | Notifications | slide-up entry (300ms), hold 4s, slide-down exit (250ms) | spring |
| **Sidebar Collapse** | Sidebar | Width animates with spring, icons remain centered | spring(300, 25) |
| **Tab Indicator** | Tab bar | Pill slides to active tab with spring lag | spring(400, 30) |
| **Slider Thumb** | Range inputs | Thumb scales 1.2x on drag, emits subtle glow | spring(200, 20) |
| **Checkbox Morph** | Checkboxes | Square → checkmark path morph, 180ms | easeOut |
| **Toggle Slide** | Toggles | Pill slides with spring overshoot, 300ms | spring(400, 12) |
| **Card Lift** | Cards on hover | translateY(-4px) + shadow expansion, 200ms | easeOut |
| **Modal Scale** | Modals | scale(0.92→1) + opacity, backdrop blur animates in | spring(400, 30) |
| **Dropdown Expand** | Menus | height auto-animate with staggered child reveals | spring(300, 25) |
| **Drag Glow** | Draggable items | Item emits glow halo while dragging, snaps back with spring | spring(300, 20) |
| **Cursor Trail** | Global mouse | 8 dots follow cursor with 80ms lag each, fade out over 400ms | spring(150, 18) |
| **Hover Ring** | Interactive cards | 3px ring expands from card center on hover, fades at edges | easeOut |

### Custom Cursor System
```tsx
interface CursorState {
  default: 'pointer' | 'grab' | 'text' | 'crosshair';
  dragging: 'grabbing';
  resizing: 'col-resize' | 'row-resize' | 'nwse-resize' | 'nesw-resize';
  disabled: 'not-allowed';
}

// Cursor glow ring — follows mouse with spring lag
interface CursorRingProps {
  size?: number;        // 24px default
  ringSize?: number;    // 40px default
  color?: string;
  ringColor?: string;
  lag?: number;         // ms delay
}
```

### Glow Trail System
```tsx
// Dots array following cursor with decreasing opacity
// 8 dots, each 50ms apart in time
// Each dot: size 2→12px as you go back in time, opacity 0.8→0.1
// Color: accent color with decreasing alpha
// Fallback: disabled when prefers-reduced-motion is set
```

### Bento Grid Enhancements
```tsx
// Bento variant types
type BentoSpan = 'col-1' | 'col-2' | 'col-3' | 'row-2' | 'row-3';

// Animation per span type:
const SPAN_ANIMATIONS = {
  'col-1': { scale: [0.95, 1], y: [20, 0], delay: index * 0.06 },
  'col-2': { scale: [0.93, 1], y: [25, 0], delay: index * 0.08 },
  'col-3': { scale: [0.90, 1], y: [30, 0], delay: index * 0.10 },
  'row-2': { scale: [0.95, 1], x: [20, 0], delay: index * 0.06 },
  'row-3': { scale: [0.93, 1], x: [25, 0], delay: index * 0.08 },
};

// Hover behavior per span
'col-1': whileHover={{ scale: 1.02, y: -4 }}
'col-2': whileHover={{ scale: 1.01, y: -6 }}  // larger cards less aggressive
'col-3': whileHover={{ scale: 1.005, y: -8 }} // largest cards most subtle
```

---

## PASS 1: TYPOGRAPHY & BRANDING

### Variable Font Stack
```
Display (H1-H3):  Fraunces Variable — optical size axis, dramatic serifs
                   wght: 100-900, opsz: 9-144, SOFT, WONK axes
Headings (H4-H6):  Syne Variable — geometric, wide tracking
                   wght: 400-800, BRACK, CONT, dxln axes
Body:              Geist Variable — neutral, humanist
                   wght: 100-900, FILL, sscr, slnt axes
Data/Metrics:      JetBrains Mono Variable — tabular numerals, coding aesthetic
                   wght: 100-800, calib, dnst axes
Labels/Tags:       Syne Mono — monospace variant for small caps labels
UI Elements:       Geist — buttons, inputs, navigation
```

### Fluid Type Scale
```css
/* 1.25 major third scale, fluid between 320px and 1440px viewport */
:root {
  --text-xs:   clamp(0.64rem,   0.58rem + 0.3vw,   0.8rem);
  --text-sm:   clamp(0.8rem,    0.73rem + 0.35vw,   1rem);
  --text-base: clamp(1rem,      0.91rem + 0.45vw,   1.25rem);
  --text-lg:   clamp(1.25rem,   1.14rem + 0.55vw,   1.563rem);
  --text-xl:   clamp(1.563rem,  1.42rem + 0.7vw,    1.953rem);
  --text-2xl:  clamp(1.953rem,  1.77rem + 0.9vw,    2.441rem);
  --text-3xl:  clamp(2.441rem,  2.21rem + 1.15vw,   3.052rem);
  --text-4xl:  clamp(3.052rem,  2.76rem + 1.46vw,   3.815rem);
}
```

### Typography Features
```css
/* Tabular numerals for metrics — prevents layout shift when numbers change */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

/* Common ligatures disabled for monospace clarity */
.no-ligatures {
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0, "calt" 0;
}

/* Optical size axis for Fraunces display type */
.display-optical {
  font-variation-settings: 'wght' 700, 'opsz' 72;
}

/* Grain/texture overlay on large display text */
.texture-display {
  background: linear-gradient(135deg, var(--gold-bright), var(--gold-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Font Pairing Presets
```tsx
const FONT_PAIRINGS = {
  futuristic: {
    display: "'Fraunces Variable', 'Fraunces', serif",
    heading: "'Syne Variable', 'Syne', sans-serif",
    body: "'Geist Variable', 'Geist', sans-serif",
    mono: "'JetBrains Mono Variable', monospace",
    accent: "'Syne Mono', monospace",
    mood: "High-contrast editorial, dramatic serifs meet geometric sans",
    preview: "Display: ABCDEFGHI / abcdefgh 0123456789",
  },
  editorial: {
    display: "'Playfair Display', serif",
    heading: "'Source Serif 4', serif",
    body: "'Source Serif 4', serif",
    mono: "'IBM Plex Mono', monospace",
    accent: "'Playfair Display', serif",
    mood: "Classic luxury, magazine-quality editorial",
  },
  brutalist: {
    display: "'Archivo Black', sans-serif",
    heading: "'Space Grotesk', sans-serif",
    body: "'IBM Plex Sans', sans-serif",
    mono: "'IBM Plex Mono', monospace",
    accent: "'Space Mono', monospace",
    mood: "Raw, bold, unapologetic contrast",
  },
  minimal: {
    display: "'Inter Variable', sans-serif",
    heading: "'Inter Variable', sans-serif",
    body: "'Inter Variable', sans-serif",
    mono: "'JetBrains Mono Variable', monospace",
    accent: "'Inter Variable', sans-serif",
    mood: "Clean utility, Swiss design precision",
  },
  technical: {
    display: "'JetBrains Mono Variable', monospace",
    heading: "'JetBrains Mono Variable', monospace",
    body: "'IBM Plex Mono', monospace",
    mono: "'JetBrains Mono Variable', monospace",
    accent: "'IBM Plex Mono', monospace",
    mood: "Data-dense, IDE-inspired, coder aesthetic",
  },
  premium: {
    display: "'Cormorant Garamond', serif",
    heading: "'Cormorant Garamond', serif",
    body: "'DM Sans', sans-serif",
    mono: "'Fira Code', monospace",
    accent: "'DM Sans', sans-serif",
    mood: "Luxury elegance, high-fashion editorial",
  },
};
```

### Text Effects
```css
/* Gradient text (display headings) */
.gradient-text {
  background: linear-gradient(
    135deg,
    var(--gold-bright) 0%,
    var(--gold-primary) 50%,
    var(--gold-dim) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glow text (hero numbers) */
.glow-text {
  color: var(--accent-color);
  text-shadow:
    0 0 10px var(--accent-glow-intensity),
    0 0 20px var(--accent-glow-intensity),
    0 0 40px var(--accent-glow-intensity);
}

/* Striped text (progress indicators) */
.striped-text {
  background: repeating-linear-gradient(
    90deg,
    var(--text-primary) 0px,
    var(--text-primary) 8px,
    transparent 8px,
    transparent 10px
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animated underline */
.animated-underline {
  position: relative;
}
.animated-underline::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--gradient-gold);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s var(--spring-settle);
}
.animated-underline:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

---

## PASS 1: COMPONENT UPGRADE SPECS

### BentoCard v2
```tsx
// Upgrade from basic hover to full tilt system
interface BentoCardV2Props {
  item: BentoItem;
  index: number;
  tiltEnabled?: boolean;
  tiltAngle?: number;
  enableGlowTrail?: boolean;
  glowColor?: string;
  onTiltChange?: (x: number, y: number) => void;
}

// Features:
//  - 3D tilt on mouse move (±tiltAngle deg on each axis)
//  - Glare pseudo-element follows mouse as light source
//  - Shadow shifts dynamically based on tilt position
//  - Scale 1.02 + translateY(-4px) on hover
//  - Glass-tier-1 base styling
//  - Entrance: opacity 0→1, y 20→0, scale 0.95→1, stagger 60ms
```

### KPICard v2
```tsx
interface KPICardV2Props {
  metric: {
    label: string;
    value: number;
    previousValue?: number;
    format: 'number' | 'currency' | 'percent' | 'compact';
    trend: 'up' | 'down' | 'neutral';
    sparklineData?: number[];
  };
  tiltEnabled?: boolean;
  countUp?: boolean;
  showSparkline?: boolean;
  accentColor?: string;
}

// Features:
//  - Count-up animation on mount (2s easeOutQuart)
//  - Tilt effect with subtle shadow
//  - Mini sparkline chart (SVG path, animated draw)
//  - Trend arrow with morph animation (up↔down↔neutral)
//  - Gold glow border pulse on positive trend
//  - Hover: scale 1.02, shadow expand
```

### Button v3
```tsx
interface ButtonV3Props {
  variant: 'primary' | 'secondary' | 'ghost' | 'outline';
  size: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
  ripple?: boolean;
  glowTrail?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

// Features:
//  - Magnetic hover (lerps toward cursor within 80px)
//  - Click ripple effect (radial wave from click point)
//  - Glow trail on hover (subtle glow follows button)
//  - Loading state: spinner morphs in, text fades
//  - Disabled state: 50% opacity, cursor not-allowed
//  - Spring: whileHover scale 1.05, whileTap scale 0.97
```

### Modal v3
```tsx
interface ModalV3Props {
  isOpen: boolean;
  onClose: () => void;
  variant: 'default' | 'glass' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}

// Features:
//  - Backdrop: blur(16px) + rgba dark overlay with fade
//  - Panel: scale(0.92→1) + opacity, spring(400, 30)
//  - Close button: scale 1.1 on hover, morph to X
//  - Focus trap: Tab cycles within modal
//  - Escape key: triggers close with scale-down exit
//  - Overlay click: ripple effect from click point
```

### Sidebar v3
```tsx
interface SidebarV3Props {
  collapsed: boolean;
  onToggle: () => void;
  activeItem: string;
  onItemSelect: (id: string) => void;
}

// Features:
//  - Collapse animation: width 260→72px, 300ms spring
//  - Items stagger on collapse (50ms between each)
//  - Active indicator: gold pill slides with spring(400, 30)
//  - Icons: SVG morph between states
//  - Tooltip: appears on hover when collapsed, 200ms delay
//  - Wave effect on active item change
```

### Input v3
```tsx
interface InputV3Props {
  variant: 'default' | 'glass' | 'neu';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

// Features:
//  - Focus: border glows with accent color
//  - Label: floats up on focus/filled, 200ms
//  - Error: border turns rose, shake animation
//  - Neumorphic inset shadow (sunken look)
//  - Char count: fades in when maxLength set
//  - Clear button: morphs in on filled state
```

### Chart v3
```tsx
interface MetricChartV3Props {
  data: DataPoint[];
  type: 'line' | 'area' | 'bar' | 'donut';
  showGrid?: boolean;
  showTooltip?: boolean;
  animatePath?: boolean;
  gradientFill?: boolean;
}

// Features:
//  - Path draw animation (stroke-dashoffset, 1.2s easeInOut)
//  - Gradient fill animates from bottom
//  - Tooltip: glassmorphic, follows cursor on line charts
//  - Grid: subtle dashed lines, fade in with stagger
//  - Hover on data point: dot scales up + glow
//  - Area charts: gradient fill animates height 0→full
```

---

## PASS 1: TECH STACK ADDITIONS

```bash
# Install these for Pass 1
npm install @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/jetbrains-mono @fontsource-variable/syne @fontsource-variable/inter
npm install framer-motion  # already installed
npm install lenis          # scroll smoothing
npm install react-colorful  # color picker
npm install @lottiefiles/react-lottie-player  # Lottie animations
```

```tsx
// Add to app/layout.tsx or page wrapper:
import { ThemeEngineProvider } from '@/lib/ui/theme-engine';
import { AnimatedBackground } from '@/lib/ui/immersive-background';
import { CursorGlow } from '@/lib/ui/cursor-effects';

export default function OmnipulseLayout({ children }) {
  return (
    <ThemeEngineProvider>
      <AnimatedBackground type="all" particleCount={40} />
      <CursorGlow size={32} lag={80} />
      {children}
    </ThemeEngineProvider>
  );
}
```

---

**Pass 1 Status**: Components built + documented
**Pass 2**: Advanced Customization Engine + WebGL Immersion + Audio Reactive
**Pass 3**: Spatial UI (3D) + AI Microcopy + Haptic Simulation
