'use client';

import { motion } from 'framer-motion';

interface TrendingItem {
  topic: string;
  postsCount: number;
  engagement: number;
  velocity: number;
  timestamp: string;
}

interface TrendsPanelProps {
  trends: TrendingItem[];
}

export default function TrendsPanel({ trends }: TrendsPanelProps) {
  const sortedTrends = [...trends].sort((a, b) => b.engagement - a.engagement).slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="section"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="section-header">
        <h3 className="section-title">Trending Topics</h3>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{sortedTrends.length} topics</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedTrends.map((trend, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.01, x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 18px',
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: 'var(--gold-primary)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                {trend.topic}
              </span>
              <span style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 20,
                background: 'var(--bg-hover)',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {trend.postsCount} posts
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 15, color: 'var(--gold-primary)', fontWeight: 600, display: 'block' }}>
                  {trend.engagement.toLocaleString()}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>engagement</span>
              </div>
              <span style={{
                fontSize: 12,
                color: trend.velocity > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 6,
                background: trend.velocity > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              }}>
                {trend.velocity > 0 ? '↑' : '↓'} {Math.abs(trend.velocity).toFixed(1)}/day
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}