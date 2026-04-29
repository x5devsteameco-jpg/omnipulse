'use client';

import { motion } from 'framer-motion';

interface Account {
  id: string;
  platform: string;
  username: string;
  followersCount: number;
  engagementRate: number;
}

interface Metric {
  capturedAt: string;
  followersCount: number;
  engagementRate: number;
  viewsCount: number;
  postsCount: number;
}

interface PlatformSelectorProps {
  accounts: Account[];
  metrics: Metric[];
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

const platformColors: Record<string, string> = {
  Instagram: 'var(--accent-rose)',
  Twitter: 'var(--accent-cyan)',
  TikTok: 'var(--text-primary)',
  YouTube: 'var(--accent-rose)',
  LinkedIn: 'var(--accent-blue)',
  Facebook: 'var(--accent-blue)',
};

export default function PlatformSelector({ accounts, metrics }: PlatformSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="section"
      style={{
        marginBottom: 32,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="section-header">
        <h3 className="section-title">Platform Overview</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {accounts.map(acc => (
            <span key={acc.id} style={{
              fontSize: 10,
              padding: '4px 10px',
              borderRadius: 20,
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}>
              {acc.platform}
            </span>
          ))}
        </div>
      </div>
      <div className="platform-grid">
        {accounts.map((account, index) => {
          const accountMetrics = metrics.filter(m =>
            m.capturedAt &&
            account.followersCount > 0
          );
          const currentFollowers = account.followersCount;
          const currentEngagement = account.engagementRate;
          const platformColor = platformColors[account.platform] || 'var(--gold-primary)';

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, type: 'spring', stiffness: 300 }}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400 } }}
              className="platform-card"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              <div className="platform-name" style={{ marginBottom: 16 }}>
                <span style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${platformColor} 0%, ${platformColor}99 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#fff',
                }}>
                  {account.platform[0]}
                </span>
                <span style={{ fontWeight: 600 }}>{account.platform}</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  color: 'var(--accent-emerald)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 8px',
                  borderRadius: 20,
                  fontWeight: 600,
                }}>
                  ↑ Live
                </span>
              </div>
              <div className="metric-bar" style={{ marginBottom: 10 }}>
                <span className="metric-label">Followers</span>
                <div className="metric-fill">
                  <motion.div
                    className="metric-fill-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((currentFollowers / 1000000) * 100, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + 0.1 * index }}
                    style={{ background: platformColor }}
                  />
                </div>
                <span className="metric-value">{formatNumber(currentFollowers)}</span>
              </div>
              <div className="metric-bar" style={{ marginBottom: 10 }}>
                <span className="metric-label">Engagement</span>
                <div className="metric-fill">
                  <motion.div
                    className="metric-fill-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentEngagement / 10) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + 0.1 * index }}
                    style={{ background: 'var(--accent-emerald)' }}
                  />
                </div>
                <span className="metric-value" style={{ color: 'var(--accent-emerald)' }}>{currentEngagement.toFixed(1)}%</span>
              </div>
              <div className="metric-bar">
                <span className="metric-label">Posts</span>
                <div className="metric-fill">
                  <motion.div
                    className="metric-fill-bar"
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 0.8, delay: 0.4 + 0.1 * index }}
                    style={{ background: 'var(--gold-primary)' }}
                  />
                </div>
                <span className="metric-value">{accountMetrics[0]?.postsCount || 0}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}