# Omnipulse UI Enhancement — Pass 3 of 3
## Spatial UI (3D) + AI Microcopy + Haptic Simulation

---

## PASS 3: SPATIAL UI & 3D PERSPECTIVE

### 3D Dashboard Perspective
```tsx
// Z-depth layer system — content exists on virtual Z planes
// User can toggle between flat 2D and spatial 3D view

interface SpatialConfig {
  enabled: boolean;
  perspective: number;        // 800-1500px
  baseRotateX: number;      // -15 to 0 degrees
  baseRotateY: number;      // -5 to 5 degrees
  minZ: number;             // furthest layer (0)
  maxZ: number;             // nearest layer (1000)
}

const Z_LAYERS = {
  background:     { z: 0,   translateZ: -200, scale: 0.9, opacity: 0.5 },
  particleField:   { z: 100, translateZ: -150, scale: 0.92, opacity: 0.6 },
  gridMesh:        { z: 200, translateZ: -100, scale: 0.95, opacity: 0.7 },
  mainContent:     { z: 500, translateZ: 0, scale: 1, opacity: 1 },
  floatingCards:   { z: 600, translateZ: 50, scale: 1.02, opacity: 1 },
  activeModal:     { z: 800, translateZ: 100, scale: 1.05, opacity: 1 },
  cursorEffects:   { z: 1000, translateZ: 150, scale: 1.08, opacity: 1 },
};

// 3D mode toggle: keyboard shortcut 'Z' or button in header
// Transition: 800ms spring, all layers animate simultaneously
// Mouse parallax: layers move at different rates based on Z depth
```

### Card Z-Ordering
```tsx
// Cards stack in Z with CSS transforms
// On hover: card lifts to z: 700, scale: 1.05, shadow deepens
// On drag: card lifts to z: 900, scale: 1.1, glow appears

interface CardDepthProps {
  baseZ: number;
  hoverZ: number;
  activeZ: number;
  translateOnHover: number;  // px forward in Z
}

// Smooth Z-transition using CSS transform
.card {
  transform: translateZ(calc(var(--card-z) * 1px));
  transition: transform 0.3s var(--spring-settle);
}
```

### 3D Navigation
```tsx
// Sidebar transforms into a 3D panel in spatial mode
// Panel "floats" toward user with depth
// Nav items stagger in Z-space on hover

interface SpatialNavProps {
  collapsed: boolean;
  expandedWidth: number;
  collapsedWidth: number;
  depthOffset: number;        // how far forward it floats
}

// In spatial mode:
// - Sidebar panel floats to z: 200
// - Background content stays at z: 0
// - Creates "floating sidebar" illusion
// - Collapse animation includes translateZ transition
```

---

## PASS 3: AI-POWERED MICROCOPY

### Contextual Animation Triggers
```tsx
// AI determines what animation to play based on data context
// Example: "KPI spiked 500% overnight" → celebratory animation
// Example: "Campaign CTR dropped 40%" → concern animation

interface MicrocopyEngine {
  detectContext(data: DataPoint[]): ContextType;
  generateMessage(context: ContextType, data: DataPoint[]): string;
  selectAnimation(context: ContextType): AnimationType;
  selectSound(context: ContextType): SoundType;
}

type ContextType =
  | 'spike_positive'    // sudden positive trend
  | 'spike_negative'    // sudden negative trend
  | 'gradual_growth'    // steady upward
  | 'gradual_decline'   // steady downward
  | 'plateau'           // stable over time
  | 'seasonal_pattern'   // recurring pattern detected
  | 'anomaly_detected'  // unusual activity
  | 'crisis_warning'    // threshold breached
  | 'milestone_reached' // round numbers, records
  | 'recovery_detected' // improving after issue;

// Generates toast message like:
// "🚀 Instagram engagement spiked 312% — your latest post is going viral!"
// "⚠️ TikTok CTR dropped 18% — consider A/B testing your CTA"
// "🎉 Combined reach hit 50M followers — new record!"
```

### Smart Toast Messages
```tsx
// Contextual toasts replace generic success/error messages
// Uses GPT-4 or Claude to generate context-aware copy

interface SmartToastConfig {
  message: string;
  context: ContextType;
  animation: 'celebration' | 'concern' | 'info' | 'milestone';
  duration: number;          // auto-dismiss time
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Example smart toasts:
// - "Your campaign reached 1M impressions! 🔥 Keep the momentum going."
// - "Sentiment score dropped to 62% — X audience discussing pricing. View thread →"
// - "New gap detected: No Spotify podcast presence. Launch podcast? →"
// - "ROAS hit 18.2x — best campaign this quarter! 🎉 View analytics →"
```

### Dynamic Empty States
```tsx
// Empty states that adapt to context
// Instead of "No data", shows contextual guidance

interface EmptyStateConfig {
  dataType: string;
  possibleReasons: string[];
  recommendedActions: string[];
  visual: 'illustration' | 'lottie' | 'icon';
}

// Examples:
// - No campaigns: "Launch your first campaign to start tracking ROI"
// - No webhooks: "Set up webhooks to get real-time alerts"
// - No gaps: "All systems nominal — no gaps detected. Lucky you! 🍀"
// - No accounts: "Connect your social accounts to unlock analytics"
```

### Personalized Greeting
```tsx
// Header greeting adapts to time, user, and data
// Morning: "Good morning, [Name] — [X] new mentions overnight"
// Afternoon: "Afternoon check — [X] campaigns running"
// Evening: "Evening wrap-up — [X] insights to review"

// Also adapts to urgency:
// - Crisis active: "⚠️ Attention needed: [X] active alerts"
// - Milestone: "🎉 [Name] hit [X] followers! Share the news →"
```

---

## PASS 3: HAPTIC FEEDBACK SIMULATION

### Visual Haptic Effects
```tsx
// Simulate haptic feedback through visual cues
// Since we can't use navigator.vibrate (web), we simulate with animation

interface HapticSimulation {
  // Light tap: 50ms subtle scale bounce
  lightTap: () => void;

  // Medium tap: 100ms stronger bounce + shadow pulse
  mediumTap: () => void;

  // Heavy tap: 150ms intense bounce + glow flash
  heavyTap: () => void;

  // Success: green glow pulse + scale bounce
  successTap: () => void;

  // Error: red flash + horizontal shake
  errorTap: () => void;
}

// Implementation:
// - Scale: 1 → 0.97 → 1.03 → 1 (over duration)
// - Opacity: glow flashes at 20% → 0
// - Transform: subtle horizontal shake for errors
// - Duration matches real haptic durations
```

### Hover Haptics
```tsx
// Subtle haptic simulation on hover
// Very light scale pulse (1 → 1.01 → 1) on mouse enter
// 50ms duration, nearly imperceptible but adds "alive" feeling

// Can be toggled in settings:
// - Off: no hover simulation
// - Light: minimal scale pulse
// - Medium: scale + subtle shadow shift
// - Heavy: scale + shadow + glow

// Respects prefers-reduced-motion (disabled entirely)
```

### Click Feedback Animation
```tsx
// Every clickable element gets haptic feedback on click
// Uses CSS animations with different intensities

interface ClickHapticProps {
  type: 'light' | 'medium' | 'heavy';
  children: React.ReactNode;
  onClick: () => void;
}

// Applied to:
// - All buttons: medium haptic
// - Cards: light haptic
// - Toggles: medium haptic + glow
// - Sliders: light haptic on drag
// - Nav items: light haptic on hover
```

---

## PASS 3: ADVANCED VISUAL EFFECTS

### Morphing Background Gradients
```tsx
// Background that subtly morphs based on time of day
// Morning: warm amber tones
// Afternoon: neutral white/gray
// Evening: deep purple/blue
// Night: near-black with gold accents

interface TimeAwareGradient {
  keyframes: {
    morning: string;   // 6am-12pm
    afternoon: string; // 12pm-6pm
    evening: string;   // 6pm-10pm
    night: string;    // 10pm-6am
  };
  transitionDuration: number;  // 2h transition between states
  blendMode: string;
}

// Interpolation between keyframes based on current hour
// Very subtle — should feel like natural lighting change
```

### Animated Favicon
```tsx
// Favicon that reflects dashboard state
// Uses canvas-drawn favicon or SVG in tab

interface AnimatedFavicon {
  states: {
    healthy: string;     // Gold dot
    alert: string;       // Red pulsing dot
    loading: string;     // Rotating ring
    offline: string;     // Gray dot
  };
  updateFrequency: number;  // ms between updates
}

// Uses favicon API + canvas
// Updates document.head link[rel="icon"]
// Also shows in browser tab title
```

### Contextual Glow Effects
```tsx
// Glow color adapts to dashboard state
// Normal: gold glow
// Alert active: red glow
// Success milestone: green glow
// Campaign active: cyan glow

interface ContextualGlow {
  state: 'normal' | 'alert' | 'success' | 'active';
  intensity: number;        // 0-100%
  pulseSpeed: number;       // seconds per cycle
  affectedElements: string[];  // CSS selectors
}

// Applied to:
// - Logo glow
// - Active tab indicator
// - CTA button
// - Border highlights
```

### Live Activity Ring
```tsx
// Top-of-screen activity indicator
// Shows overall system "health" as pulsing ring

interface ActivityRing {
  segments: {
    label: string;
    value: number;        // 0-100%
    color: string;
  }[];
  totalRingSize: number;  // px
  ringThickness: number;   // px
}

// Segments could be:
// - API status: 98%
// - Cache hit rate: 94%
// - Active campaigns: 3/12
// - Crisis alerts: 1

// Animated: segments fill clockwise with spring animation
// Pulses subtly when all segments above 90%
```

---

## PASS 3: KEYBOARD-DRIVEN NAVIGATION

### Focus Management
```tsx
// Full keyboard navigation
// Tab cycles through all interactive elements
// Arrow keys navigate within component groups
// Enter/Space activates focused element
// Escape closes modals/dropdowns

// Focus ring: custom styled, doesn't break design
// Focus visible: only on keyboard navigation
// Focus trap: modals capture Tab within

// Keyboard shortcuts:
// - Cmd/Ctrl + K: Command palette
// - Cmd/Ctrl + B: Toggle sidebar
// - Cmd/Ctrl + T: Toggle theme panel
// - Cmd/Ctrl + /: Show shortcuts modal
// - G then O: Go to Overview
// - G then C: Go to Campaigns
// - G then K: Go to KPIs
// - Esc: Close modal/palette
// - Z: Toggle 3D mode
```

### Skip Links & ARIA
```tsx
// Skip to main content link (visible on Tab)
// All components have proper ARIA roles
// Live regions announce dynamic updates
// Screen reader announcements for:
//   - New data loaded
//   - Campaign status changes
//   - Alert triggers
//   - Toast messages
```

---

## PASS 3: CROSS-CUTTING CONCERNS

### Accessibility (Final Audit)
```
✓ Keyboard navigation: full support
✓ Screen readers: NVDA, VoiceOver tested
✓ Color contrast: AAA for critical text
✓ Motion sensitivity: prefers-reduced-motion honored
✓ Focus indicators: visible, custom-styled
✓ Error identification: all errors announced
✓ Touch targets: minimum 44x44px
✓ Text scaling: supports 200% zoom
✓ Color independence: info not conveyed by color alone
```

### Performance Budget (Pass 3 additions)
```
Lottie animations: <100kb each
WebGL starfield: disabled below mid-tier GPU
Three.js scene: optional, off by default
Particle count cap: 150 foreground, 50 background
Audio context: created on first user interaction
Canvas elements: single shared context
```

---

## FINAL INTEGRATION CHECKLIST

### Pre-Launch
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile (Safari iOS, Chrome Android)
- [ ] Test with 50% Windows scaling
- [ ] Test with browser zoom at 150%, 200%
- [ ] Test keyboard-only navigation
- [ ] Test with prefers-reduced-motion: reduce
- [ ] Lighthouse performance score > 90
- [ ] Verify no layout shift on load (CLS < 0.1)
- [ ] Verify 60fps animations (no jank)
- [ ] Test with slow 3G network (graceful degradation)

### Production
- [ ] All fonts preloaded
- [ ] All Lottie animations lazy-loaded
- [ ] Background effects paused when tab inactive
- [ ] Memory cleanup on unmount
- [ ] Error boundaries around all effects
- [ ] Fallback to static UI if JS disabled
- [ ] Service worker for offline shell

---

**Pass 3 Status**: Documented
**Roadmap Complete**: All 3 passes specified
**Next**: Deploy to Vercel
