'use client';

import { motion } from 'framer-motion';

interface MarketingGap {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  platform?: string;
  gapType?: string;
}

interface GapsPanelProps {
  gaps: MarketingGap[];
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  critical: { bg: 'rgba(244, 63, 94, 0.08)', border: 'rgba(244, 63, 94, 0.3)', text: '#f43f5e', glow: 'rgba(244, 63, 94, 0.15)' },
  high: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b', glow: 'rgba(245, 158, 11, 0.15)' },
  medium: { bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.3)', text: '#d4af37', glow: 'rgba(212, 175, 55, 0.15)' },
  low: { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6', glow: 'rgba(59, 130, 246, 0.15)' },
};

export default function GapsPanel({ gaps }: GapsPanelProps) {
  const sortedGaps = [...gaps].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
      className="section"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="section-header">
        <h3 className="section-title">Marketing Gaps</h3>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          {gaps.filter(g => g.severity === 'critical').length} critical
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedGaps.map((gap, index) => {
          const style = SEVERITY_STYLES[gap.severity] || SEVERITY_STYLES.medium;
          return (
            <motion.div
              key={gap.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, type: 'spring', stiffness: 300 }}
              whileHover={{ x: 4, transition: { type: 'spring', stiffness: 400 } }}
              className="gap-item"
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 4,
                height: '100%',
                background: style.text,
                boxShadow: `0 0 12px ${style.glow}`,
              }} />
              <div className="gap-header">
                <h4 className="gap-type" style={{ color: style.text }}>{gap.title}</h4>
                <span style={{
                  fontSize: 10,
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: style.glow,
                  color: style.text,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  border: `1px solid ${style.border}`,
                }}>
                  {gap.severity}
                </span>
              </div>
              <p className="gap-description" style={{ paddingLeft: 0 }}>{gap.description}</p>
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                borderRadius: 8,
                borderLeft: `3px solid ${style.text}`,
              }}>
                <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
                  Recommended Action
                </span>
                <span style={{ fontSize: 13, color: 'var(--gold-primary)', fontWeight: 500 }}>
                  {gap.recommendation}
                </span>
              </div>
              {(gap.platform || gap.gapType) && (
                <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                  {gap.gapType && (
                    <span style={{
                      fontSize: 9,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                    }}>
                      {gap.gapType.replace('_', ' ')}
                    </span>
                  )}
                  {gap.platform && (
                    <span style={{
                      fontSize: 9,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                    }}>
                      {gap.platform}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}