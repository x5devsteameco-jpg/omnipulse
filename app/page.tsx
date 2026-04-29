'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface PlatformMetrics {
  platform: string;
  handle: string;
  followers: number;
  engagement: number;
  views: number;
  posts: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: string;
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

interface PeerComparison {
  name: string;
  followers: string;
  engagement: string;
  trend: string;
  sabrinaAdvantage: string;
}

const SABRINA_PROFILE = {
  name: 'Sabrina Carpenter',
  classification: 'Platinum — A-List Talent',
  age: 26,
  label: 'Island Records (Universal)',
  grammyWins: 2,
  billboard200: 2,
  hot100: 2,
  combinedReach: '60M+',
  tourStatus: 'World Tour 2025-2026',
  albums: 7,
};

const PLATFORMS: PlatformMetrics[] = [
  { platform: 'Instagram', handle: '@sabrinacarpenter', followers: 2800000, engagement: 5.2, views: 12000000, posts: 1240, trend: 'up', color: '#E4405F', icon: '📸' },
  { platform: 'TikTok', handle: '@sabrinacarpenter', followers: 5200000, engagement: 8.4, views: 35000000, posts: 890, trend: 'up', color: '#000000', icon: '🎵' },
  { platform: 'YouTube', handle: 'Sabrina Carpenter Official', followers: 2100000, engagement: 4.1, views: 180000000, posts: 156, trend: 'up', color: '#FF0000', icon: '▶️' },
  { platform: 'X (Twitter)', handle: '@SabrinaCarpenter', followers: 1900000, engagement: 2.3, views: 8500000, posts: 12400, trend: 'stable', color: '#1DA1F2', icon: '𝕏' },
  { platform: 'Spotify', handle: 'Sabrina Carpenter', followers: 8000000, engagement: 0, views: 35000000, posts: 0, trend: 'up', color: '#1DB954', icon: '🎧' },
  { platform: 'Facebook', handle: 'Sabrina Carpenter', followers: 1100000, engagement: 1.8, views: 4200000, posts: 680, trend: 'stable', color: '#1877F2', icon: '👥' },
];

const TRENDING: TrendingContent[] = [
  { id: '1', title: '"Espresso" Dance Challenge', platform: 'TikTok', engagements: 2500000, impressions: 50000000, trend: 'up' },
  { id: '2', title: 'World Tour 2025 Behind The Scenes', platform: 'Instagram', engagements: 1850000, impressions: 12000000, trend: 'up' },
  { id: '3', title: '"Please Please Please" Music Video', platform: 'YouTube', engagements: 1200000, impressions: 8000000, trend: 'stable' },
  { id: '4', title: "Man's Best Friend Album Drop", platform: 'Spotify', engagements: 980000, impressions: 3500000, trend: 'up' },
  { id: '5', title: 'Grammy Win Reaction', platform: 'TikTok', engagements: 890000, impressions: 15000000, trend: 'up' },
];

const HASHTAGS = [
  { tag: '#ShortNSweet', posts: 2400000, trend: 18.4 },
  { tag: '#SabrinaCarpenter', posts: 1800000, trend: 12.1 },
  { tag: '#EspressoOutNow', posts: 980000, trend: 8.7 },
  { tag: '#WorldTour2025', posts: 720000, trend: 45.2 },
  { tag: '#GrammyWinner', posts: 540000, trend: 92.1 },
];

const GAPS: MarketingGap[] = [
  {
    id: '1',
    title: 'Spotify Podcast Gap',
    description: 'No podcast presence despite 35M monthly listeners. Missing intimate fan connection medium.',
    severity: 'high',
    recommendation: 'Launch "Sabrina\'s Late Night" podcast — behind-the-scenes, musician chats, exclusive tracks.',
    affectedPlatforms: ['Spotify'],
  },
  {
    id: '2',
    title: 'YouTube Shorts Underutilization',
    description: 'Only 12% of YouTube content repurposed for Shorts. Missing viral growth vector.',
    severity: 'high',
    recommendation: 'Convert tour content and rehearsal clips to 60-second shorts. Target 3x weekly upload.',
    affectedPlatforms: ['YouTube', 'TikTok'],
  },
  {
    id: '3',
    title: 'X (Twitter) Negative Sentiment Spike',
    description: 'Sentiment dropped to 62% positive following tour ticket pricing controversy.',
    severity: 'critical',
    recommendation: 'Launch community note response. Host Twitter Space with fan Q&A. Release official statement.',
    affectedPlatforms: ['X (Twitter)'],
  },
  {
    id: '4',
    title: 'Brazil Market Engagement',
    description: '3rd largest fan base but lowest engagement rate. Cultural context gap identified.',
    severity: 'medium',
    recommendation: 'Portuguese-language content series. Local influencer partnerships in São Paulo.',
    affectedPlatforms: ['Instagram', 'TikTok'],
  },
];

const PREDICTIONS: Prediction[] = [
  { metric: 'Combined Followers', current: 61100000, predicted: 65000000, confidence: 'high', timeframe: '90 Days' },
  { metric: 'TikTok Growth Rate', current: 5200000, predicted: 5800000, confidence: 'high', timeframe: '60 Days' },
  { metric: 'Album Streaming', current: 35000000, predicted: 42000000, confidence: 'medium', timeframe: '30 Days' },
  { metric: 'Tour Gross Revenue', current: 47000000, predicted: 52000000, confidence: 'medium', timeframe: '90 Days' },
];

const PEER_COMPARISON: PeerComparison[] = [
  { name: 'Taylor Swift', followers: '250M', engagement: '3.2%', trend: '↑ 2.1%', sabrinaAdvantage: 'TikTok Growth +312%' },
  { name: 'Ariana Grande', followers: '80M', engagement: '4.1%', trend: '↓ 0.8%', sabrinaAdvantage: 'Combined Reach +18%' },
  { name: 'Olivia Rodrigo', followers: '35M', engagement: '5.8%', trend: '↑ 4.2%', sabrinaAdvantage: 'Tour Revenue +240%' },
  { name: 'Tate McRae', followers: '15M', engagement: '7.2%', trend: '↑ 12.1%', sabrinaAdvantage: 'Billboard #1 Albums +100%' },
];

function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'stable' }) {
  if (direction === 'up') return <span style={{ color: '#10b981' }}>↑</span>;
  if (direction === 'down') return <span style={{ color: '#ef4444' }}>↓</span>;
  return <span style={{ color: '#8a816f' }}>→</span>;
}

function SkeletonLine({ width = '100%', height = 16 }: { width?: string; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-hover) 50%, var(--bg-secondary) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4,
      }}
    />
  );
}

export default function SabrinaDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'competitive' | 'gaps'>('overview');
  const totalFollowers = PLATFORMS.reduce((sum, p) => sum + p.followers, 0);
  const avgEngagement = PLATFORMS.reduce((sum, p) => sum + p.engagement, 0) / PLATFORMS.length;
  const criticalGaps = GAPS.filter(g => g.severity === 'critical').length;

  const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
    critical: { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)', text: '#f43f5e' },
    high: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#f59e0b' },
    medium: { bg: 'rgba(212, 175, 55, 0.15)', border: 'rgba(212, 175, 55, 0.4)', text: '#d4af37' },
    low: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#3b82f6' },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #030307 0%, #0a0a12 50%, #050510 100%)',
      color: '#f8fafc',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 32px',
        background: 'rgba(10, 10, 18, 0.8)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 50%, #a68929 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 18,
              color: '#000',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
            }}>
              O
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                OmniPulse
              </h1>
              <p style={{ fontSize: 10, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Platinum Intelligence</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{
              padding: '8px 16px',
              borderRadius: 20,
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}>
              <span style={{ fontSize: 11, color: '#d4af37', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                🏆 Grammy Winner
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>Live</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        {/* Talent Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 32,
            padding: 32,
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 300,
            height: 300,
            background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, position: 'relative' }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 50%, #a68929 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)',
              flexShrink: 0,
            }}>
              SC
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{SABRINA_PROFILE.name}</h2>
                <span style={{
                  fontSize: 9,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#d4af37',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}>
                  Platinum A-List
                </span>
              </div>

              <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px' }}>
                {SABRINA_PROFILE.label} • Age {SABRINA_PROFILE.age} • {SABRINA_PROFILE.tourStatus}
              </p>

              <div style={{ display: 'flex', gap: 24 }}>
                {[
                  { label: 'Grammy Wins', value: SABRINA_PROFILE.grammyWins },
                  { label: 'Billboard #1 Albums', value: SABRINA_PROFILE.billboard200 },
                  { label: 'Hot 100 #1 Singles', value: SABRINA_PROFILE.hot100 },
                  { label: 'Combined Reach', value: SABRINA_PROFILE.combinedReach },
                  { label: 'Studio Albums', value: SABRINA_PROFILE.albums },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#d4af37', margin: 0 }}>{stat.value}</p>
                    <p style={{ fontSize: 10, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['overview', 'content', 'competitive', 'gaps'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                textTransform: 'capitalize',
                transition: 'all 0.2s',
                background: activeTab === tab ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === tab ? '#d4af37' : '#64748b',
                borderColor: activeTab === tab ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
              }}
            >
              {tab === 'overview' ? 'Overview' : tab === 'competitive' ? 'Competitive' : tab}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          {[
            { label: 'Total Follower Reach', value: formatNumber(totalFollowers), change: '+8.2%', color: '#d4af37', sparkline: [55, 57, 58, 59, 60, 61] },
            { label: 'Avg Engagement Rate', value: `${avgEngagement.toFixed(1)}%`, change: '+0.6pp', color: '#10b981', sparkline: [4.2, 4.5, 4.8, 5.0, 5.1, 5.2] },
            { label: 'Critical Marketing Gaps', value: criticalGaps.toString(), change: `${GAPS.length} total`, color: criticalGaps > 0 ? '#f43f5e' : '#10b981', sparkline: [2, 2, 3, 1, 1, criticalGaps] },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: 24,
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${kpi.color}40`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{kpi.label}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 32, fontWeight: 700, color: kpi.color, margin: 0 }}>{kpi.value}</p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{kpi.change}</span>
                  <svg width="60" height="24" viewBox="0 0 60 24">
                    <polyline
                      points={`${kpi.sparkline.map((v, idx) => `${idx * 12},${24 - (v / Math.max(...kpi.sparkline) * 20)}`).join(' ')}`}
                      fill="none"
                      stroke={kpi.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Platform Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                padding: 24,
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Platform Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {PLATFORMS.map((platform) => (
                  <div key={platform.platform} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${platform.color}20`,
                      border: `1px solid ${platform.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      {platform.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{platform.platform}</span>
                        <span style={{ fontSize: 10, color: '#64748b' }}>{platform.handle}</span>
                        <TrendIcon direction={platform.trend} />
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${(platform.engagement / 10) * 100}%`,
                          background: platform.color,
                          borderRadius: 3,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', margin: 0 }}>{formatNumber(platform.followers)}</p>
                      <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>{platform.engagement}% eng.</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trending Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                padding: 24,
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Trending Content</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {TRENDING.map((content, i) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      cursor: 'pointer',
                    }}
                    whileHover={{ x: 4 }}
                  >
                    <span style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 100%)',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 2px', color: '#f8fafc' }}>{content.title}</p>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{content.platform}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#d4af37', margin: 0 }}>{formatNumber(content.engagements)}</p>
                      <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>engagements</p>
                    </div>
                    <TrendIcon direction={content.trend} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'competitive' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>A-List Competitive Matrix</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PEER_COMPARISON.map((peer) => (
                <div
                  key={peer.name}
                  style={{
                    padding: 20,
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                  }}
                >
                  <div style={{ width: 120 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{peer.name}</p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', gap: 32 }}>
                    <div>
                      <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 2px', textTransform: 'uppercase' }}>Followers</p>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{peer.followers}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 2px', textTransform: 'uppercase' }}>Engagement</p>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{peer.engagement}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 2px', textTransform: 'uppercase' }}>Trend</p>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: peer.trend.startsWith('↑') ? '#10b981' : '#f43f5e' }}>{peer.trend}</p>
                    </div>
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}>
                    <p style={{ fontSize: 11, color: '#10b981', fontWeight: 600, margin: 0 }}>{peer.sabrinaAdvantage}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'gaps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {GAPS.map((gap) => {
              const style = SEVERITY_STYLES[gap.severity];
              return (
                <motion.div
                  key={gap.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 4,
                    height: '100%',
                    background: style.text,
                  }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: '#f8fafc' }}>{gap.title}</h4>
                        <span style={{
                          fontSize: 9,
                          padding: '3px 10px',
                          borderRadius: 20,
                          background: `${style.text}20`,
                          color: style.text,
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: 0.5,
                        }}>
                          {gap.severity}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.6 }}>{gap.description}</p>
                      <div style={{
                        padding: 12,
                        borderRadius: 8,
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${style.border}`,
                      }}>
                        <p style={{ fontSize: 10, color: '#d4af37', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Recommendation</p>
                        <p style={{ fontSize: 13, color: '#f8fafc', margin: 0 }}>{gap.recommendation}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {gap.affectedPlatforms.map((p) => (
                        <span key={p} style={{
                          fontSize: 10,
                          padding: '4px 10px',
                          borderRadius: 20,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 24,
            padding: 24,
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Exposure Predictions</h3>
            <div style={{
              padding: '4px 10px',
              borderRadius: 20,
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}>
              <span style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 600, textTransform: 'uppercase' }}>ML-Powered</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {PREDICTIONS.map((pred) => (
              <div
                key={pred.metric}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <p style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{pred.metric}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', margin: '0 0 4px' }}>{formatNumber(pred.predicted)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#64748b' }}>from {formatNumber(pred.current)}</span>
                  <span style={{
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: pred.confidence === 'high' ? 'rgba(16, 185, 129, 0.15)' : pred.confidence === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: pred.confidence === 'high' ? '#10b981' : pred.confidence === 'medium' ? '#f59e0b' : '#f43f5e',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {pred.confidence}
                  </span>
                </div>
                <p style={{ fontSize: 10, color: '#64748b', margin: '8px 0 0' }}>{pred.timeframe}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
