'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowUp, ArrowDown, RefreshCw, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const CHANGELOG = [
  {
    date: 'April 30, 2026',
    version: 'v2.1.0',
    category: 'Features',
    title: 'Immersive UI Integration',
    description: 'Canvas particle field, cursor glow effects, floating orbs, time-aware gradients, and theme customization engine. Click the Settings icon in the header to open the Visual Theme Engine.',
    icon: Zap,
    color: '#d4af37',
  },
  {
    date: 'April 29, 2026',
    version: 'v2.0.0',
    category: 'UI Enhancement',
    title: 'Motion System + Spatial UI',
    description: '3D tilt cards, spring physics lab, color harmony engine, haptic feedback simulation, Lottie animations (MorphIcon, LoadingOrbit, SuccessBurst), and Z-layer spatial depth system.',
    icon: RefreshCw,
    color: '#22c55e',
  },
  {
    date: 'April 29, 2026',
    version: 'v1.7.0',
    category: 'Features',
    title: 'Backlog Sprint Complete',
    description: 'BentoGrid layout, 6-step GuidedTour, 12-placement Tooltips, DraggableList with framer-motion reorder, Real-time LiveIndicator, AnimatedNumber count-up, ExportModal (CSV/JSON/Excel), VirtualTable with virtualized scrolling.',
    icon: ArrowUp,
    color: '#3b82f6',
  },
  {
    date: 'April 28, 2026',
    version: 'v1.6.0',
    category: 'Polish',
    title: 'Phase 1-3 Complete',
    description: 'Full design system tokens (WCAG AA), ARIA accessibility (skip links, roles, labels, keyboard shortcuts), Light/Dark/System theme toggle with persistence, mobile sidebar with collapse animation, OnboardingWizard auto-trigger.',
    icon: CheckCircle,
    color: '#10b981',
  },
  {
    date: 'April 27, 2026',
    version: 'v1.5.0',
    category: 'Optimization',
    title: 'Command Palette + Cache Layer',
    description: 'Lucide React icons, fuzzy search CommandPalette with keyboard navigation, Skeleton loading states, MockRedisClient with TTL, Light/Dark mode toggle.',
    icon: Clock,
    color: '#f59e0b',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Features: '#d4af37',
  'UI Enhancement': '#22c55e',
  Fixes: '#ef4444',
  Polish: '#3b82f6',
  Optimization: '#f59e0b',
  Performance: '#8b5cf6',
};

export default function ChangelogPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #030307 0%, #0a0a12 50%, #050510 100%)',
      padding: '64px 24px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #d4af37, #22c55e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Zap size={24} style={{ color: '#000' }} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fafafa', margin: '0 0 12px' }}>
            Changelog
          </h1>
          <p style={{ fontSize: 16, color: '#71717a', margin: 0 }}>
            Track Omnipulse releases, features, and improvements.
          </p>
        </motion.div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: 28,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'rgba(255, 255, 255, 0.06)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {CHANGELOG.map((entry, index) => {
              const Icon = entry.icon;
              return (
                <motion.div
                  key={entry.version}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{ display: 'flex', gap: 24, paddingBottom: 48 }}
                >
                  {/* Icon dot */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: entry.color + '20',
                      border: `2px solid ${entry.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={22} style={{ color: entry.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: entry.color,
                        background: entry.color + '15',
                        padding: '3px 8px',
                        borderRadius: 4,
                      }}>
                        {entry.category}
                      </span>
                      <span style={{ fontSize: 11, color: '#71717a' }}>{entry.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', margin: 0 }}>
                        {entry.title}
                      </h3>
                      <span style={{
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#71717a',
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}>
                        {entry.version}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>
                      {entry.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
