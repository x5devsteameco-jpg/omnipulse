'use client';

import { motion } from 'framer-motion';
import { ThemeProvider } from '../lib/white-label/theme';

interface PlatformMetrics {
  platform: string;
  followers: number;
  engagement: number;
  views: number;
  posts: number;
  trend: 'up' | 'down' | 'stable';
}

interface TrendingContent {
  id: string;
  title: string;
  platform: string;
  engagements: number;
  impressions: number;
  trend: 'up' | 'down' | 'stable';
}

interface MarketingGap {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  affectedPlatforms: string[];
}

interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  confidence: 'high' | 'medium' | 'low';
  timeframe: string;
}

interface PageProps {
  params?: Promise<{ tenantSlug?: string }>;
}

const MOCK_PLATFORMS: PlatformMetrics[] = [
  { platform: 'Instagram', followers: 284500, engagement: 4.2, views: 1200000, posts: 48, trend: 'up' },
  { platform: 'TikTok', followers: 512000, engagement: 6.8, views: 3500000, posts: 62, trend: 'up' },
  { platform: 'YouTube', followers: 156000, engagement: 3.1, views: 890000, posts: 12, trend: 'stable' },
  { platform: 'X (Twitter)', followers: 89400, engagement: 1.9, views: 420000, posts: 156, trend: 'down' },
  { platform: 'LinkedIn', followers: 34200, engagement: 2.8, views: 185000, posts: 24, trend: 'up' },
];

const MOCK_TRENDING: TrendingContent[] = [
  { id: '1', title: 'Behind the Scenes: Season 4 Prep', platform: 'TikTok', engagements: 45200, impressions: 890000, trend: 'up' },
  { id: '2', title: 'Character Spotlight: Marcus Chen', platform: 'Instagram', engagements: 32100, impressions: 520000, trend: 'up' },
  { id: '3', title: 'Director Commentary Ep. 12', platform: 'YouTube', engagements: 18400, impressions: 245000, trend: 'stable' },
  { id: '4', title: 'Fan Art Feature: Universe 7', platform: 'X (Twitter)', engagements: 8900, impressions: 156000, trend: 'up' },
  { id: '5', title: 'Industry Insights: Q1 2026', platform: 'LinkedIn', engagements: 4200, impressions: 38000, trend: 'up' },
];

const MOCK_HASHTAGS = [
  { tag: '#CinematicUniverse', posts: 12400, trend: 12.4 },
  { tag: '#AEGOriginals', posts: 8900, trend: 8.7 },
  { tag: '#Season4Coming', posts: 5600, trend: 23.1 },
  { tag: '#MarcusChen', posts: 3400, trend: 5.2 },
  { tag: '#FoundationalWealth', posts: 2100, trend: -2.1 },
];

const MOCK_GAPS: MarketingGap[] = [
  {
    id: '1',
    title: 'TikTok Engagement Decline',
    description: 'Average watch time dropped 18% over the past 30 days despite increased posting frequency.',
    severity: 'high',
    recommendation: 'Focus on first 3 seconds hook optimization and trend participation. Increase duet/stitch content.',
    affectedPlatforms: ['TikTok'],
  },
  {
    id: '2',
    title: 'LinkedIn Content Gap',
    description: 'Only 24 posts in Q1 vs industry benchmark of 60+. Missing thought leadership opportunities.',
    severity: 'medium',
    recommendation: 'Publish 2 industry insight articles weekly. Partner with influencers for LinkedIn Live sessions.',
    affectedPlatforms: ['LinkedIn'],
  },
  {
    id: '3',
    title: 'Cross-Platform Amplification',
    description: 'YouTube Shorts not being repurposed for TikTok and Instagram Reels.',
    severity: 'medium',
    recommendation: 'Create vertical cut-downs of YouTube content for Reels and Shorts. Implement automated cross-posting workflow.',
    affectedPlatforms: ['YouTube', 'Instagram', 'TikTok'],
  },
  {
    id: '4',
    title: 'X (Twitter) Negative Sentiment',
    description: 'Sentiment score dropped to 34% positive. High volume of complaint posts about release schedule.',
    severity: 'critical',
    recommendation: 'Launch community management initiative. Create dedicated feedback channel. Post official responses to top complaints.',
    affectedPlatforms: ['X (Twitter)'],
  },
  {
    id: '5',
    title: 'Instagram Story Underutilization',
    description: 'Only 12% of followers view Stories. Industry average is 25%.',
    severity: 'low',
    recommendation: 'Add more interactive stickers, polls, and countdowns. Post Stories 3x daily during peak hours.',
    affectedPlatforms: ['Instagram'],
  },
];

const MOCK_PREDICTIONS: Prediction[] = [
  { metric: 'Total Followers', current: 1076100, predicted: 1145200, confidence: 'high', timeframe: 'Next 30 Days' },
  { metric: 'Avg Engagement Rate', current: 3.76, predicted: 4.12, confidence: 'medium', timeframe: 'Next 30 Days' },
  { metric: 'Total Impressions', current: 6195000, predicted: 6850000, confidence: 'high', timeframe: 'Next Quarter' },
  { metric: 'Video Views', current: 3500000, predicted: 3200000, confidence: 'low', timeframe: 'Next 30 Days' },
];

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  critical: { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
  high: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' },
  medium: { bg: 'rgba(196, 163, 90, 0.08)', border: 'rgba(196, 163, 90, 0.3)', text: '#c4a35a' },
  low: { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
};

const CONFIDENCE_STYLES: Record<string, { color: string; label: string }> = {
  high: { color: '#10b981', label: 'High Confidence' },
  medium: { color: '#f59e0b', label: 'Medium Confidence' },
  low: { color: '#ef4444', label: 'Low Confidence' },
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'stable' }) {
  if (direction === 'up') return <span style={{ color: '#10b981' }}>↑</span>;
  if (direction === 'down') return <span style={{ color: '#ef4444' }}>↓</span>;
  return <span style={{ color: '#8a816f' }}>→</span>;
}

export default function OmniPulsePage({ params }: PageProps) {
  const tenantSlug = 'default';
  const brandName = 'OmniPulse';
  const accentGold = '#d4af37';

  const totalFollowers = MOCK_PLATFORMS.reduce((sum, p) => sum + p.followers, 0);
  const avgEngagement = MOCK_PLATFORMS.reduce((sum, p) => sum + p.engagement, 0) / MOCK_PLATFORMS.length;
  const totalViews = MOCK_PLATFORMS.reduce((sum, p) => sum + p.views, 0);
  const totalGaps = MOCK_GAPS.length;
  const criticalGaps = MOCK_GAPS.filter(g => g.severity === 'critical').length;

  return (
    <ThemeProvider
      tenantSlug={tenantSlug}
      theme={{
        brandName,
        accentColor: accentGold,
        primaryColor: '#1a1a1a',
        secondaryColor: '#2d2d2d',
      }}
    >
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">{brandName} Analytics</div>
        <nav className="sidebar-nav">
          <a className="nav-item active">Dashboard</a>
          <a className="nav-item">Accounts</a>
          <a className="nav-item">Trends</a>
          <a className="nav-item">Predictions</a>
          <a className="nav-item">Marketing Gaps</a>
          <a className="nav-item">Analytics</a>
        </nav>
      </aside>
      <main className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="page-subtitle">Social Analytics</p>
          <h1 className="page-title">{brandName} Social Media Dashboard</h1>
        </motion.div>

        <div className="stats-grid">
          {[
            { label: 'Total Followers', value: formatNumber(totalFollowers), sub: '+12.4% vs last month', color: 'var(--accent-gold)' },
            { label: 'Avg Engagement Rate', value: `${avgEngagement.toFixed(2)}%`, sub: '+0.8pp vs last month', color: 'var(--accent-green)' },
            { label: 'Marketing Gaps', value: totalGaps.toString(), sub: `${criticalGaps} critical`, color: criticalGaps > 0 ? 'var(--accent-red)' : 'var(--accent-green)' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="stat-card"
            >
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value" style={{ color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '8px 0 0', letterSpacing: 0.5 }}>{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="section"
          >
            <h3 className="section-title">Current Exposure Rates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {MOCK_PLATFORMS.map((platform) => (
                <div key={platform.platform} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{platform.platform}</span>
                      <TrendIcon direction={platform.trend} />
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(platform.engagement / 10) * 100}%`,
                          background: platform.trend === 'up' ? 'var(--accent-green)' : platform.trend === 'down' ? 'var(--accent-red)' : 'var(--accent-gold)',
                          borderRadius: 3,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginLeft: 24, textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-gold)', margin: 0 }}>{platform.engagement}%</p>
                    <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0 }}>engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="section"
          >
            <h3 className="section-title">Trending Hashtags</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_HASHTAGS.map((hashtag) => (
                <div key={hashtag.tag} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{hashtag.tag}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{formatNumber(hashtag.posts)} posts</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: hashtag.trend > 0 ? '#10b981' : '#ef4444',
                    }}>
                      {hashtag.trend > 0 ? '+' : ''}{hashtag.trend}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="section"
          style={{ marginBottom: 32 }}
        >
          <h3 className="section-title">Top Performing Content</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Platform</th>
                  <th>Engagements</th>
                  <th>Impressions</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRENDING.map((content) => (
                  <tr key={content.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{content.title}</td>
                    <td><span className={`badge badge-${content.platform.replace(/[^a-z]/gi, '_').toLowerCase()}`} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{content.platform}</span></td>
                    <td>{formatNumber(content.engagements)}</td>
                    <td>{formatNumber(content.impressions)}</td>
                    <td>
                      <TrendIcon direction={content.trend} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="section"
          >
            <h3 className="section-title">Predictions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {MOCK_PREDICTIONS.map((pred) => (
                <div key={pred.metric} style={{
                  padding: 16,
                  background: 'var(--bg-secondary)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>{pred.metric}</span>
                    <span style={{
                      fontSize: 10,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: `${CONFIDENCE_STYLES[pred.confidence].color}15`,
                      color: CONFIDENCE_STYLES[pred.confidence].color,
                      fontWeight: 600,
                    }}>
                      {CONFIDENCE_STYLES[pred.confidence].label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatNumber(pred.predicted)}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      from {formatNumber(pred.current)}
                    </span>
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '6px 0 0' }}>{pred.timeframe}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="section"
          >
            <h3 className="section-title">Marketing Gaps</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_GAPS.map((gap) => {
                const style = SEVERITY_STYLES[gap.severity];
                return (
                  <div
                    key={gap.id}
                    style={{
                      padding: 16,
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{gap.title}</h4>
                      <span style={{
                        fontSize: 9,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        color: style.text,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}>
                        {gap.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.6 }}>{gap.description}</p>
                    <div style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 10, color: 'var(--accent-gold)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>Recommendation</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{gap.recommendation}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                      {gap.affectedPlatforms.map((p) => (
                        <span key={p} style={{
                          fontSize: 9,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-dim)',
                          textTransform: 'uppercase',
                        }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="section"
        >
          <h3 className="section-title">Platform Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {MOCK_PLATFORMS.map((platform) => (
              <div
                key={platform.platform}
                style={{
                  padding: 20,
                  background: 'var(--bg-secondary)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-gold)', margin: '0 0 16px' }}>{platform.platform}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {formatNumber(platform.followers)}
                    </p>
                    <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Followers</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-green)', margin: 0 }}>{platform.engagement}%</p>
                    <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Engagement</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>{formatNumber(platform.views)}</p>
                    <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Views</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>{platform.posts}</p>
                    <p style={{ fontSize: 9, color: 'var(--text-dim)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Posts</p>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                  <TrendIcon direction={platform.trend} />
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                    {platform.trend === 'up' ? 'Growing' : platform.trend === 'down' ? 'Declining' : 'Stable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
    </ThemeProvider>
  );
}
