'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TenantStylesProvider, useTenantTheme } from '../lib/ui/theme-provider';
import type { TenantConfig } from '../lib/types/tenant';

const SABRINA_TENANT_CONFIG: TenantConfig = {
  tenantId: 'tenant_sabrina_carpenter',
  tenantSlug: 'sabrina-carpenter',
  tenantName: 'Sabrina Carpenter',
  tier: 'enterprise',
  isActive: true,
  brandName: 'OmniPulse',
  brandLogo: '/logo.svg',
  brandFavicon: '/favicon.ico',
  primaryColor: '#d4af37',
  secondaryColor: '#12121a',
  accentColor: '#22c55e',
  backgroundColor: '#09090b',
  surfaceColor: '#18181b',
  borderColor: '#3f3f46',
  textPrimaryColor: '#fafafa',
  textSecondaryColor: '#a1a1aa',
  textDimColor: '#71717a',
  fontFamily: 'Inter, system-ui, sans-serif',
  cssVariables: {},
  features: {
    sentimentAnalysis: true,
    competitorBenchmarking: true,
    predictiveML: true,
    crisisAlerting: true,
    automatedReports: true,
    exportFormats: ['csv', 'pdf', 'json'],
  },
  platforms: {
    instagram: { enabled: true, apiKeyEnv: 'INSTAGRAM_ACCESS_TOKEN' },
    twitter: { enabled: true, apiKeyEnv: 'TWITTER_BEARER_TOKEN' },
    tiktok: { enabled: true, apiKeyEnv: 'TIKTOK_ACCESS_TOKEN' },
    youtube: { enabled: true, apiKeyEnv: 'YOUTUBE_API_KEY' },
    linkedin: { enabled: true, apiKeyEnv: 'LINKEDIN_ACCESS_TOKEN' },
    facebook: { enabled: true, apiKeyEnv: 'FACEBOOK_ACCESS_TOKEN' },
  },
  engagementThresholds: { warning: 2.0, critical: 1.0 },
  followerGrowthTargets: { daily: 0.5, weekly: 3.0 },
  limits: {
    maxAccounts: 500,
    maxUsers: 100,
    apiRateLimit: 1000,
    dataRetentionDays: 730,
    supportLevel: 'priority',
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-04-29T00:00:00Z',
};

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
  enabled: boolean;
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
  gapType: string;
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

interface TenantInfo {
  name: string;
  slug: string;
  tier: string;
  limits: {
    maxAccounts: number;
    maxUsers: number;
    apiRateLimit: number;
    dataRetentionDays: number;
  };
  features: {
    sentimentAnalysis: boolean;
    competitorBenchmarking: boolean;
    predictiveML: boolean;
    crisisAlerting: boolean;
  };
}

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

const PLATFORMS: PlatformMetrics[] = [
  { platform: 'Instagram', handle: '@sabrinacarpenter', followers: 2800000, engagement: 5.2, views: 12000000, posts: 1240, trend: 'up', color: '#E4405F', icon: '📸', enabled: true },
  { platform: 'TikTok', handle: '@sabrinacarpenter', followers: 5200000, engagement: 8.4, views: 35000000, posts: 890, trend: 'up', color: '#000000', icon: '🎵', enabled: true },
  { platform: 'YouTube', handle: 'Sabrina Carpenter Official', followers: 2100000, engagement: 4.1, views: 180000000, posts: 156, trend: 'up', color: '#FF0000', icon: '▶️', enabled: true },
  { platform: 'X (Twitter)', handle: '@SabrinaCarpenter', followers: 1900000, engagement: 2.3, views: 8500000, posts: 12400, trend: 'stable', color: '#1DA1F2', icon: '𝕏', enabled: true },
  { platform: 'Spotify', handle: 'Sabrina Carpenter', followers: 8000000, engagement: 0, views: 35000000, posts: 0, trend: 'up', color: '#1DB954', icon: '🎧', enabled: true },
  { platform: 'Facebook', handle: 'Sabrina Carpenter', followers: 1100000, engagement: 1.8, views: 4200000, posts: 680, trend: 'stable', color: '#1877F2', icon: '👥', enabled: true },
];

const TRENDING: TrendingContent[] = [
  { id: '1', title: '"Espresso" Dance Challenge', platform: 'TikTok', engagements: 2500000, impressions: 50000000, trend: 'up' },
  { id: '2', title: 'World Tour 2025 Behind The Scenes', platform: 'Instagram', engagements: 1850000, impressions: 12000000, trend: 'up' },
  { id: '3', title: '"Please Please Please" Music Video', platform: 'YouTube', engagements: 1200000, impressions: 8000000, trend: 'stable' },
  { id: '4', title: "Man's Best Friend Album Drop", platform: 'Spotify', engagements: 980000, impressions: 3500000, trend: 'up' },
  { id: '5', title: 'Grammy Win Reaction', platform: 'TikTok', engagements: 890000, impressions: 15000000, trend: 'up' },
];

const GAPS: MarketingGap[] = [
  { id: '1', title: 'Spotify Podcast Gap', description: 'No podcast presence despite 35M monthly listeners. Missing intimate fan connection medium.', severity: 'high', recommendation: 'Launch "Sabrina\'s Late Night" podcast — behind-the-scenes, musician chats, exclusive tracks.', affectedPlatforms: ['Spotify'], gapType: 'content' },
  { id: '2', title: 'YouTube Shorts Underutilization', description: 'Only 12% of YouTube content repurposed for Shorts. Missing viral growth vector.', severity: 'high', recommendation: 'Convert tour content and rehearsal clips to 60-second shorts. Target 3x weekly upload.', affectedPlatforms: ['YouTube', 'TikTok'], gapType: 'format' },
  { id: '3', title: 'X (Twitter) Negative Sentiment', description: 'Sentiment dropped to 62% positive following tour ticket pricing controversy.', severity: 'critical', recommendation: 'Launch community note response. Host Twitter Space with fan Q&A. Release official statement.', affectedPlatforms: ['X (Twitter)'], gapType: 'engagement' },
  { id: '4', title: 'Brazil Market Engagement', description: '3rd largest fan base but lowest engagement rate. Cultural context gap identified.', severity: 'medium', recommendation: 'Portuguese-language content series. Local influencer partnerships in São Paulo.', affectedPlatforms: ['Instagram', 'TikTok'], gapType: 'audience' },
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

const SABRINA_PROFILE = {
  name: 'Sabrina Carpenter',
  classification: 'Platinum — A-List Talent',
  age: 26,
  label: 'Island Records (Universal)',
  grammyWins: 2,
  billboard200: 2,
  hot100: 2,
  combinedReach: '61.1M',
  tourStatus: 'World Tour 2025-2026',
  albums: 7,
};

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  critical: { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)', text: '#f43f5e' },
  high: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#f59e0b' },
  medium: { bg: 'rgba(212, 175, 55, 0.15)', border: 'rgba(212, 175, 55, 0.4)', text: '#d4af37' },
  low: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#3b82f6' },
};

function DashboardContent() {
  const { theme, tenantConfig } = useTenantTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'competitive' | 'gaps' | 'settings'>('overview');
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const totalFollowers = PLATFORMS.reduce((sum, p) => sum + p.followers, 0);
  const avgEngagement = PLATFORMS.reduce((sum, p) => sum + p.engagement, 0) / PLATFORMS.length;
  const criticalGaps = GAPS.filter(g => g.severity === 'critical').length;

  useEffect(() => {
    async function fetchTenantInfo() {
      try {
        const res = await fetch('/api/tenants/sabrina-carpenter');
        if (res.ok) {
          const data = await res.json();
          setTenantInfo(data.tenant);
        }
      } catch (err) {
        console.error('Failed to fetch tenant info:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTenantInfo();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'content', label: 'Content' },
    { id: 'competitive', label: 'Competitive' },
    { id: 'gaps', label: 'Gaps' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme?.colors?.background || '#09090b'} 0%, ${theme?.colors?.surface || '#18181b'} 50%, #050510 100%)`,
      color: theme?.colors?.textPrimary || '#fafafa',
      fontFamily: theme?.fontFamily || 'Inter, system-ui, sans-serif',
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
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${theme?.colors?.border || '#3f3f46'}`,
        padding: '16px 32px',
        background: `rgba(${hexToRgb(theme?.colors?.background || '#09090b')}, 0.8)`,
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
              background: `linear-gradient(135deg, ${theme?.colors?.primary || '#d4af37'} 0%, ${theme?.colors?.accent || '#22c55e'} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 18,
              color: '#000',
              boxShadow: `0 0 20px ${theme?.colors?.primary || '#d4af37'}66`,
            }}>
              O
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: theme?.colors?.textPrimary }}>
                {tenantConfig?.brandName || 'OmniPulse'}
              </h1>
              <p style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
                {tenantInfo?.tier || 'Enterprise'} • Multi-Tenant
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              padding: '6px 14px',
              borderRadius: 20,
              background: `${theme?.colors?.primary || '#d4af37'}15`,
              border: `1px solid ${theme?.colors?.primary || '#d4af37'}40`,
            }}>
              <span style={{ fontSize: 11, color: theme?.colors?.primary || '#d4af37', fontWeight: 600 }}>
                {tenantInfo?.limits?.apiRateLimit || 1000} req/min
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
              <span style={{ fontSize: 12, color: theme?.colors?.textDim || '#71717a' }}>Live</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        {/* Tenant Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 12,
            background: `${theme?.colors?.primary || '#d4af37'}10`,
            border: `1px solid ${theme?.colors?.primary || '#d4af37'}30`,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 12, color: theme?.colors?.textSecondary || '#a1a1aa' }}>
            Tenant:
          </span>
          <span style={{ fontSize: 12, color: theme?.colors?.primary || '#d4af37', fontWeight: 600 }}>
            {tenantInfo?.name || 'Sabrina Carpenter'}
          </span>
          <span style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a' }}>
            ({tenantInfo?.slug || 'sabrina-carpenter'})
          </span>
        </motion.div>

        {/* Talent Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 32,
            padding: 32,
            borderRadius: 20,
            background: `${theme?.colors?.surface || '#18181b'}80`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme?.colors?.border || '#3f3f46'}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 400,
            height: 400,
            background: `radial-gradient(circle at center, ${theme?.colors?.primary || '#d4af37'}08 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, position: 'relative' }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${theme?.colors?.primary || '#d4af37'} 0%, ${theme?.colors?.accent || '#22c55e'} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 700,
              boxShadow: `0 0 40px ${theme?.colors?.primary || '#d4af37'}40`,
              flexShrink: 0,
            }}>
              SC
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: theme?.colors?.textPrimary }}>
                  {SABRINA_PROFILE.name}
                </h2>
                <span style={{
                  fontSize: 9,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: `${theme?.colors?.primary || '#d4af37'}20`,
                  border: `1px solid ${theme?.colors?.primary || '#d4af37'}40`,
                  color: theme?.colors?.primary || '#d4af37',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}>
                  🏆 Grammy Winner
                </span>
              </div>

              <p style={{ fontSize: 14, color: theme?.colors?.textSecondary || '#a1a1aa', margin: '0 0 16px' }}>
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
                    <p style={{ fontSize: 20, fontWeight: 700, color: theme?.colors?.primary || '#d4af37', margin: 0 }}>{stat.value}</p>
                    <p style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a', margin: 0, textTransform: 'uppercase' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s',
                background: activeTab === tab.id ? `${theme?.colors?.primary || '#d4af37'}20` : `${theme?.colors?.surface || '#18181b'}`,
                color: activeTab === tab.id ? theme?.colors?.primary || '#d4af37' : theme?.colors?.textSecondary || '#a1a1aa',
                borderColor: activeTab === tab.id ? `${theme?.colors?.primary || '#d4af37'}40` : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          {[
            { label: 'Total Follower Reach', value: formatNumber(totalFollowers), change: '+8.2%', color: theme?.colors?.primary || '#d4af37', sparkline: [55, 57, 58, 59, 60, 61] },
            { label: 'Avg Engagement Rate', value: `${avgEngagement.toFixed(1)}%`, change: '+0.6pp', color: theme?.colors?.accent || '#22c55e', sparkline: [4.2, 4.5, 4.8, 5.0, 5.1, 5.2] },
            { label: 'Critical Marketing Gaps', value: criticalGaps.toString(), change: `${GAPS.length} total`, color: criticalGaps > 0 ? '#f43f5e' : theme?.colors?.accent || '#22c55e', sparkline: [2, 2, 3, 1, 1, criticalGaps] },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: 24,
                borderRadius: 16,
                background: `${theme?.colors?.surface || '#18181b'}60`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme?.colors?.border || '#3f3f46'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              whileHover={{
                borderColor: `${kpi.color}60`,
                y: -2,
                boxShadow: `0 8px 30px ${kpi.color}20`
              }}
            >
              <p style={{ fontSize: 11, color: theme?.colors?.textDim || '#71717a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{kpi.label}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 32, fontWeight: 700, color: kpi.color, margin: 0 }}>{kpi.value}</p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{kpi.change}</span>
                  <svg width="60" height="24" viewBox="0 0 60 24">
                    <defs>
                      <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={kpi.color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={kpi.color} />
                      </linearGradient>
                    </defs>
                    <polyline
                      points={`${kpi.sparkline.map((v, idx) => `${idx * 12},${24 - (v / Math.max(...kpi.sparkline) * 20)}`).join(' ')}`}
                      fill="none"
                      stroke={`url(#grad-${i})`}
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

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
            >
              {/* Platform Breakdown */}
              <div style={{
                padding: 24,
                borderRadius: 16,
                background: `${theme?.colors?.surface || '#18181b'}60`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme?.colors?.border || '#3f3f46'}`,
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: theme?.colors?.textPrimary }}>Platform Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {PLATFORMS.filter(p => p.enabled).map((platform) => (
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
                          <span style={{ fontSize: 14, fontWeight: 600, color: theme?.colors?.textPrimary }}>{platform.platform}</span>
                          <span style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a' }}>{platform.handle}</span>
                          <TrendIcon direction={platform.trend} />
                        </div>
                        <div style={{ height: 6, background: `${theme?.colors?.border || '#3f3f46'}40`, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${(platform.engagement / 10) * 100}%`,
                            background: platform.color,
                            borderRadius: 3,
                          }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: theme?.colors?.textPrimary, margin: 0 }}>{formatNumber(platform.followers)}</p>
                        <p style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a', margin: 0 }}>{platform.engagement}% eng.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Content */}
              <div style={{
                padding: 24,
                borderRadius: 16,
                background: `${theme?.colors?.surface || '#18181b'}60`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme?.colors?.border || '#3f3f46'}`,
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: theme?.colors?.textPrimary }}>Trending Content</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {TRENDING.map((content, i) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: `${theme?.colors?.background || '#09090b'}60`,
                        border: `1px solid ${theme?.colors?.border || '#3f3f46'}40`,
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
                        background: `linear-gradient(135deg, ${theme?.colors?.primary || '#d4af37'} 0%, ${theme?.colors?.accent || '#22c55e'} 100%)`,
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
                        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 2px', color: theme?.colors?.textPrimary }}>{content.title}</p>
                        <p style={{ fontSize: 11, color: theme?.colors?.textDim || '#71717a', margin: 0 }}>{content.platform}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: theme?.colors?.primary || '#d4af37', margin: 0 }}>{formatNumber(content.engagements)}</p>
                        <p style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a', margin: 0 }}>engagements</p>
                      </div>
                      <TrendIcon direction={content.trend} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'competitive' && (
            <motion.div
              key="competitive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                padding: 24,
                borderRadius: 16,
                background: `${theme?.colors?.surface || '#18181b'}60`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme?.colors?.border || '#3f3f46'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: theme?.colors?.textPrimary }}>A-List Competitive Matrix</h3>
                {tenantInfo?.features?.competitorBenchmarking && (
                  <span style={{
                    fontSize: 9,
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: `${theme?.colors?.accent || '#22c55e'}20`,
                    border: `1px solid ${theme?.colors?.accent || '#22c55e'}40`,
                    color: theme?.colors?.accent || '#22c55e',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}>
                    Feature Active
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PEER_COMPARISON.map((peer) => (
                  <div
                    key={peer.name}
                    style={{
                      padding: 20,
                      borderRadius: 12,
                      background: `${theme?.colors?.background || '#09090b'}60`,
                      border: `1px solid ${theme?.colors?.border || '#3f3f46'}40`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 24,
                    }}
                  >
                    <div style={{ width: 120 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: theme?.colors?.textPrimary }}>{peer.name}</p>
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: 32 }}>
                      <div>
                        <p style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a', margin: '0 0 2px', textTransform: 'uppercase' }}>Followers</p>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: theme?.colors?.textPrimary }}>{peer.followers}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a', margin: '0 0 2px', textTransform: 'uppercase' }}>Engagement</p>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: theme?.colors?.textPrimary }}>{peer.engagement}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a', margin: '0 0 2px', textTransform: 'uppercase' }}>Trend</p>
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
            <motion.div
              key="gaps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
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
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingLeft: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: theme?.colors?.textPrimary }}>{gap.title}</h4>
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
                          <span style={{
                            fontSize: 9,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: `${theme?.colors?.surface || '#18181b'}`,
                            color: theme?.colors?.textDim || '#71717a',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                          }}>
                            {gap.gapType}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: theme?.colors?.textSecondary || '#a1a1aa', margin: '0 0 16px', lineHeight: 1.6 }}>{gap.description}</p>
                        <div style={{
                          padding: 12,
                          borderRadius: 8,
                          background: `${theme?.colors?.background || '#09090b'}80`,
                          border: `1px solid ${style.border}`,
                        }}>
                          <p style={{ fontSize: 10, color: theme?.colors?.primary || '#d4af37', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Recommendation</p>
                          <p style={{ fontSize: 13, color: theme?.colors?.textPrimary, margin: 0 }}>{gap.recommendation}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {gap.affectedPlatforms.map((p) => (
                          <span key={p} style={{
                            fontSize: 10,
                            padding: '4px 10px',
                            borderRadius: 20,
                            background: `${theme?.colors?.surface || '#18181b'}`,
                            border: `1px solid ${theme?.colors?.border || '#3f3f46'}`,
                            color: theme?.colors?.textSecondary || '#a1a1aa',
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
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                padding: 24,
                borderRadius: 16,
                background: `${theme?.colors?.surface || '#18181b'}60`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme?.colors?.border || '#3f3f46'}`,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: theme?.colors?.textPrimary }}>Tenant Configuration</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <p style={{ fontSize: 11, color: theme?.colors?.textDim || '#71717a', marginBottom: 4, textTransform: 'uppercase' }}>Tenant ID</p>
                  <p style={{ fontSize: 14, color: theme?.colors?.textPrimary, fontFamily: 'monospace' }}>{tenantConfig?.tenantId}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: theme?.colors?.textDim || '#71717a', marginBottom: 4, textTransform: 'uppercase' }}>Slug</p>
                  <p style={{ fontSize: 14, color: theme?.colors?.textPrimary, fontFamily: 'monospace' }}>{tenantConfig?.tenantSlug}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: theme?.colors?.textDim || '#71717a', marginBottom: 4, textTransform: 'uppercase' }}>Tier</p>
                  <p style={{ fontSize: 14, color: theme?.colors?.primary || '#d4af37', fontWeight: 600, textTransform: 'capitalize' }}>{tenantConfig?.tier}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: theme?.colors?.textDim || '#71717a', marginBottom: 4, textTransform: 'uppercase' }}>Status</p>
                  <p style={{ fontSize: 14, color: tenantConfig?.isActive ? '#10b981' : '#f43f5e', fontWeight: 600 }}>{tenantConfig?.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${theme?.colors?.border || '#3f3f46'}` }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: theme?.colors?.textPrimary }}>Feature Flags</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {Object.entries(tenantConfig?.features || {}).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        background: value ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                        border: `1px solid ${value ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                      }}>
                        {value ? '✓' : '✗'}
                      </div>
                      <span style={{ fontSize: 13, color: theme?.colors?.textSecondary || '#a1a1aa', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${theme?.colors?.border || '#3f3f46'}` }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: theme?.colors?.textPrimary }}>Platforms</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(tenantConfig?.platforms || {}).map(([key, config]) => (
                    <span key={key} style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: config.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                      border: `1px solid ${config.enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                      color: config.enabled ? '#10b981' : '#f43f5e',
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {key} {config.enabled ? '✓' : '✗'}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ML Predictions */}
        {tenantInfo?.features?.predictiveML && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: 24,
              padding: 24,
              borderRadius: 16,
              background: `${theme?.colors?.surface || '#18181b'}60`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme?.colors?.border || '#3f3f46'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: theme?.colors?.textPrimary }}>Exposure Predictions</h3>
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
                    background: `${theme?.colors?.background || '#09090b'}60`,
                    border: `1px solid ${theme?.colors?.border || '#3f3f46'}40`,
                  }}
                >
                  <p style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{pred.metric}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: theme?.colors?.textPrimary, margin: '0 0 4px' }}>{formatNumber(pred.predicted)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a' }}>from {formatNumber(pred.current)}</span>
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
                  <p style={{ fontSize: 10, color: theme?.colors?.textDim || '#71717a', margin: '8px 0 0' }}>{pred.timeframe}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '9, 9, 11';
}

export default function MultiTenantDashboard() {
  return (
    <TenantStylesProvider tenantConfig={SABRINA_TENANT_CONFIG}>
      <DashboardContent />
    </TenantStylesProvider>
  );
}
