'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Zap, TrendingUp, Shield, Bell, BarChart3, Users, Globe } from 'lucide-react';

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Campaign ROI Tracking',
    description: 'Measure every impression, click, and conversion across Instagram, TikTok, YouTube, X, Spotify, and Facebook in real-time.',
    color: '#d4af37',
  },
  {
    icon: Zap,
    title: 'Predictive Intelligence',
    description: 'ML-powered forecasts predict your next viral post, optimal posting time, and follower growth trajectory.',
    color: '#22c55e',
  },
  {
    icon: Shield,
    title: 'Crisis Alerting',
    description: 'Sentiment drops and negative spikes trigger instant Slack alerts before they become PR emergencies.',
    color: '#ef4444',
  },
  {
    icon: BarChart3,
    title: 'Gap Analysis',
    description: 'AI identifies content format gaps, audience untapped segments, and platform opportunities with actionable recommendations.',
    color: '#8b5cf6',
  },
  {
    icon: Bell,
    title: 'Real-time Webhooks',
    description: 'Push metrics to any endpoint. Automate responses to campaign milestones, follower milestones, and crisis events.',
    color: '#06b6d4',
  },
  {
    icon: Users,
    title: 'Multi-account Management',
    description: 'Manage 500+ social accounts from a single pane. Bulk actions, unified analytics, and cross-platform comparison.',
    color: '#f59e0b',
  },
];

const STATS = [
  { value: '61M+', label: 'Combined Reach Tracked' },
  { value: '18.2x', label: 'Best Campaign ROAS' },
  { value: '94.2%', label: 'Cache Hit Rate' },
  { value: '<200ms', label: 'API Response Time' },
];

const TRUSTED_BY = [
  { name: 'OpenAI', logo: 'https://images.ctfassets.net/spoqsaf9291f/4MHGeZRO6fDOLPVyJsLoyQ/73cf5bcef2edb384dc8989ebddd7975e/Company_openai__Colorway_White.svg' },
  { name: 'Vercel', logo: 'https://images.ctfassets.net/spoqsaf9291f/4Q8UO6GLVXAipkW53CHm33/8ccdeeb5bf1834ead706299d665eac72/Company_Vercel__Colorway_White.svg' },
  { name: 'Figma', logo: 'https://images.ctfassets.net/spoqsaf9291f/5JgmuggsW4KO8pYqbKUUeW/9d4781445ff35516224384dc1c4f417c/figma-white.svg' },
  { name: 'Ramp', logo: 'https://images.ctfassets.net/spoqsaf9291f/1DEacqNIZ316cGgB4hhZRL/d77ff0228469f25ee2c76af41ef2e6ac/Company_Ramp__Colorway_White.svg' },
  { name: 'Nvidia', logo: 'https://images.ctfassets.net/spoqsaf9291f/1Y4mbag3O14GsqnVtxgyZn/93c685d16fde556fff58eeeade5b49a7/Company_Nvidia__Colorway_White.svg' },
  { name: 'Toyota', logo: 'https://images.ctfassets.net/spoqsaf9291f/6tqMLcpPUToUSnubKnHkuZ/22f1df2d90af8a807f6fb8b39525215e/toyota.svg' },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#030307', color: '#fafafa', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 32px',
        background: 'rgba(3, 3, 7, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 1280,
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #d4af37, #22c55e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#000' }}>O</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Omnipulse</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#features" style={{ fontSize: 14, color: '#a1a1aa', textDecoration: 'none' }}>Features</a>
          <a href="#changelog" style={{ fontSize: 14, color: '#a1a1aa', textDecoration: 'none' }}>Changelog</a>
          <Link href="/changelog" style={{ fontSize: 14, color: '#a1a1aa', textDecoration: 'none' }}>Docs</Link>
          <Link href="/login" style={{ fontSize: 14, color: '#a1a1aa', textDecoration: 'none' }}>Sign in</Link>
          <Link href="/login" style={{
            padding: '8px 20px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #d4af37, #b8962e)',
            color: '#000',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '120px 32px', textAlign: 'center', maxWidth: 1280, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 20,
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 12, color: '#d4af37', fontWeight: 500 }}>v2.1 — Immersive UI Now Live</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 700,
            lineHeight: 1.1,
            margin: '0 auto 24px',
            maxWidth: 900,
            background: 'linear-gradient(135deg, #fafafa 0%, #a1a1aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Platinum Social Intelligence
          </h1>

          <p style={{
            fontSize: 20,
            color: '#71717a',
            margin: '0 auto 48px',
            maxWidth: 560,
            lineHeight: 1.6,
          }}>
            Track ROI across every platform. Predict viral moments before they happen.
            Catch crises before they explode. Omnipulse is the intelligence layer for elite social teams.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              padding: '14px 28px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #d4af37, #b8962e)',
              color: '#000',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}>
              Start for free <ArrowRight size={16} />
            </Link>
            <Link href="/changelog" style={{
              padding: '14px 28px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fafafa',
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
            }}>
              See what&apos;s new
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 24,
            marginTop: 80,
            padding: '40px 48px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 20,
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#d4af37', margin: '0 0 4px', fontFamily: 'JetBrains Mono, monospace' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 12, color: '#71717a', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Trusted By */}
      <section style={{ padding: '40px 32px', borderTop: '1px solid rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 32 }}>
          Trusted by teams at
        </p>
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', maxWidth: 900, margin: '0 auto' }}>
          {TRUSTED_BY.map((brand) => (
            <img
              key={brand.name}
              src={brand.logo}
              alt={brand.name}
              style={{ height: 24, opacity: 0.4, filter: 'brightness(0) invert(1)' }}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <h2 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 16px' }}>
            Everything you need to dominate social
          </h2>
          <p style={{ fontSize: 16, color: '#71717a', maxWidth: 500, margin: '0 auto' }}>
            From campaign tracking to crisis prediction, Omnipulse gives you the intelligence edge.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02, y: -4 }}
                style={{
                  padding: 28,
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = feature.color + '40';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 40px ${feature.color}15`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: feature.color + '15',
                  border: `1px solid ${feature.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', color: '#fafafa' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.6, margin: 0 }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Changelog preview */}
      <section id="changelog" style={{ padding: '80px 32px', background: 'rgba(255, 255, 255, 0.01)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16px' }}>
            Shipped recently
          </h2>
          <p style={{ fontSize: 16, color: '#71717a', margin: '0 0 48px' }}>
            Follow our progress as we build the future of social intelligence.
          </p>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { date: 'April 30, 2026', version: 'v2.1.0', title: 'Immersive UI — Cursor glow, particle fields, floating orbs', tag: 'Features', color: '#d4af37' },
              { date: 'April 29, 2026', version: 'v2.0.0', title: '3D tilt cards, spring physics lab, haptic feedback, Lottie animations', tag: 'UI Enhancement', color: '#22c55e' },
              { date: 'April 29, 2026', version: 'v1.7.0', title: 'BentoGrid, GuidedTour, DraggableList, RealTime updates, ExportModal', tag: 'Features', color: '#3b82f6' },
            ].map((entry) => (
              <Link
                key={entry.version}
                href="/changelog"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212, 175, 55, 0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: entry.color + '15',
                  border: `1px solid ${entry.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CheckCircle size={20} style={{ color: entry.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: entry.color, background: entry.color + '15', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                      {entry.tag}
                    </span>
                    <span style={{ fontSize: 11, color: '#71717a' }}>{entry.date}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#fafafa', margin: 0, fontWeight: 500 }}>{entry.title}</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#71717a', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>
                    {entry.version}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link href="/changelog" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 32,
            fontSize: 14,
            color: '#d4af37',
            textDecoration: 'none',
          }}>
            View full changelog <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 16px' }}>
            Ready to see everything?
          </h2>
          <p style={{ fontSize: 16, color: '#71717a', margin: '0 0 40px' }}>
            Connect your social accounts and get instant intelligence across every platform.
          </p>
          <Link href="/login" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '16px 32px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #d4af37, #b8962e)',
            color: '#000',
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Open your dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 32px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        maxWidth: 1280,
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #d4af37, #22c55e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>O</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Omnipulse</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <Link href="/changelog" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>Changelog</Link>
            <Link href="/login" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>Dashboard</Link>
            <a href="mailto:getstarted@omnipulse.com" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ fontSize: 12, color: '#4b5563', margin: 0 }}>
            © 2026 Omnipulse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
