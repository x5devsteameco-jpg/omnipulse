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

const PLATFORMS = [
  { platform: 'Instagram', icon: '📸', color: '#E4405F', followers: 2800000, engagement: 5.2 },
  { platform: 'TikTok', icon: '🎵', color: '#000000', followers: 5200000, engagement: 8.4 },
  { platform: 'YouTube', icon: '▶️', color: '#FF0000', followers: 2100000, engagement: 4.1 },
  { platform: 'X (Twitter)', icon: '𝕏', color: '#1DA1F2', followers: 1900000, engagement: 2.3 },
  { platform: 'Spotify', icon: '🎧', color: '#1DB954', followers: 8000000, engagement: 0 },
  { platform: 'Facebook', icon: '👥', color: '#1877F2', followers: 1100000, engagement: 1.8 },
];

const CAMPAIGNS = [
  { name: 'Short n Sweet Album Launch', platform: 'Instagram', status: 'completed', impressions: 45000000, clicks: 890000, ctr: 1.98, cpm: 1.00, cpa: 3.60, roas: 12.5, spend: 45000 },
  { name: 'World Tour 2025 Promo', platform: 'TikTok', status: 'active', impressions: 28000000, clicks: 620000, ctr: 2.21, cpm: 1.14, cpa: 3.81, roas: 11.2, spend: 32000 },
  { name: "Man's Best Friend Drop", platform: 'Spotify', status: 'active', impressions: 15000000, clicks: 340000, ctr: 2.27, cpm: 1.20, cpa: 3.46, roas: 15.8, spend: 18000 },
  { name: 'Grammy Campaign', platform: 'Multi', status: 'completed', impressions: 72000000, clicks: 1450000, ctr: 2.01, cpm: 1.18, cpa: 4.72, roas: 18.2, spend: 85000 },
];

const GAPS = [
  { id: '1', title: 'Spotify Podcast Gap', description: 'No podcast presence despite 35M monthly listeners.', severity: 'critical', type: 'content', recommendation: 'Launch podcast series with exclusive content.' },
  { id: '2', title: 'YouTube Shorts Underutilization', description: 'Only 12% of YouTube content repurposed for Shorts.', severity: 'high', type: 'format', recommendation: 'Convert tour content to 60-second shorts.' },
  { id: '3', title: 'X Sentiment Drop', description: 'Sentiment at 62% following ticket pricing controversy.', severity: 'critical', type: 'engagement', recommendation: 'Launch community response initiative.' },
  { id: '4', title: 'Brazil Market Gap', description: '3rd largest fan base but lowest engagement rate.', severity: 'medium', type: 'audience', recommendation: 'Portuguese-language content series.' },
];

const KPIs = [
  { name: 'Total Followers', value: '61.1M', change: '+8.2%', color: '#d4af37' },
  { name: 'Avg Engagement', value: '4.36%', change: '+0.6pp', color: '#22c55e' },
  { name: 'Campaign ROAS', value: '14.2x', change: '+2.4x', color: '#22c55e' },
  { name: 'Crisis Alerts', value: '1', change: 'Active', color: '#f43f5e' },
  { name: 'Sentiment Score', value: '78%', change: '+6%', color: '#22c55e' },
  { name: 'Monthly Revenue', value: '$485K', change: '+15.5%', color: '#d4af37' },
];

const WEBHOOKS = [
  { url: 'https://api.sabrinacarpenter.com/webhooks', events: ['gap.identified', 'prediction.generated'], active: true, deliveries: 1247, failures: 3 },
  { url: 'https://analytics.manager.com/webhooks', events: ['metrics.collected', 'alert.triggered'], active: true, deliveries: 8942, failures: 12 },
  { url: 'https://crm.recordlabel.com/webhooks', events: ['campaign.started', 'campaign.completed'], active: false, deliveries: 456, failures: 89 },
];

const AUDIT_LOGS = [
  { action: 'CONFIG_CHANGE', user: 'admin@omnipulse.com', resource: 'Tenant: sabrina-carpenter', timestamp: '2 min ago', details: 'Updated crisis alerting threshold' },
  { action: 'EXPORT', user: 'analyst@omnipulse.com', resource: 'Report: Q1_2026', timestamp: '15 min ago', details: 'Exported 2,847 records as CSV' },
  { action: 'CREATE', user: 'admin@omnipulse.com', resource: 'Campaign: World Tour 2025', timestamp: '1 hour ago', details: 'Campaign created with $32,000 budget' },
  { action: 'ALERT_TRIGGERED', user: 'system', resource: 'Gap: X Sentiment Drop', timestamp: '2 hours ago', details: 'Automated alert sent to Slack' },
  { action: 'LOGIN', user: 'manager@omnipulse.com', resource: 'Session', timestamp: '3 hours ago', details: 'Successful login' },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function DashboardContent() {
  const { theme } = useTenantTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [health] = useState({ status: 'healthy', uptime: 99.97, requests: 894234, cacheHit: 94.2 });
  const [rateLimit] = useState({ limit: 1000, remaining: 847 });

  const totalFollowers = PLATFORMS.reduce((sum, p) => sum + p.followers, 0);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'kpis', label: 'KPIs' },
    { id: 'gaps', label: 'Gaps' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'audit', label: 'Audit' },
    { id: 'settings', label: 'Settings' },
  ];

  const bgSurface = theme?.colors?.surface || '#18181b';
  const bgBg = theme?.colors?.background || '#09090b';
  const border = theme?.colors?.border || '#3f3f46';
  const textPrimary = theme?.colors?.textPrimary || '#fafafa';
  const textSecondary = theme?.colors?.textSecondary || '#a1a1aa';
  const textDim = theme?.colors?.textDim || '#71717a';
  const primary = theme?.colors?.primary || '#d4af37';
  const accent = theme?.colors?.accent || '#22c55e';

  const cardStyle = {
    padding: 24,
    borderRadius: 16,
    background: bgSurface + '99',
    backdropFilter: 'blur(20px)',
    border: '1px solid ' + border,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, ' + bgBg + ' 0%, ' + bgSurface + ' 50%, ' + bgBg + ' 100%)', color: textPrimary, fontFamily: theme?.fontFamily || 'Inter, sans-serif' }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0 }`}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid ' + border, padding: '16px 32px', background: bgBg + 'e6', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, ' + primary + ', ' + accent + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#000' }}>O</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: textPrimary }}>{SABRINA_TENANT_CONFIG.brandName}</h1>
              <p style={{ fontSize: 10, color: textDim, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Enterprise Multi-Tenant</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ padding: '6px 14px', borderRadius: 8, background: bgSurface, border: '1px solid ' + border }}>
              <span style={{ fontSize: 11, color: textDim }}>Rate: </span>
              <span style={{ fontSize: 11, color: primary, fontWeight: 600 }}>{rateLimit.remaining}/{rateLimit.limit}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 12, color: textDim }}>{health.status}</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1600, margin: '0 auto', padding: 32 }}>
        {/* Tenant Badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: primary + '15', border: '1px solid ' + primary + '30', marginBottom: 24 }}>
          <span style={{ fontSize: 10, color: textDim, textTransform: 'uppercase' }}>Tenant:</span>
          <span style={{ fontSize: 12, color: primary, fontWeight: 600 }}>sabrina-carpenter</span>
          <span style={{ fontSize: 10, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 4 }}>Active</span>
        </motion.div>

        {/* Talent Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...cardStyle, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, background: 'radial-gradient(circle at center, ' + primary + '08 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, position: 'relative' }}>
            <div style={{ width: 100, height: 100, borderRadius: 20, background: 'linear-gradient(135deg, ' + primary + ', ' + accent + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, boxShadow: '0 0 40px ' + primary + '40', flexShrink: 0 }}>SC</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: textPrimary }}>Sabrina Carpenter</h2>
                <span style={{ fontSize: 9, padding: '4px 10px', borderRadius: 20, background: primary + '20', border: '1px solid ' + primary + '40', color: primary, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>Grammy Winner</span>
              </div>
              <p style={{ fontSize: 14, color: textSecondary, margin: '0 0 16px' }}>Island Records (Universal) Age 26 World Tour 2025-2026</p>
              <div style={{ display: 'flex', gap: 24 }}>
                <div><p style={{ fontSize: 20, fontWeight: 700, color: primary, margin: 0 }}>2</p><p style={{ fontSize: 10, color: textDim, margin: 0, textTransform: 'uppercase' }}>Grammy Wins</p></div>
                <div><p style={{ fontSize: 20, fontWeight: 700, color: primary, margin: 0 }}>2</p><p style={{ fontSize: 10, color: textDim, margin: 0, textTransform: 'uppercase' }}>Billboard #1</p></div>
                <div><p style={{ fontSize: 20, fontWeight: 700, color: primary, margin: 0 }}>61.1M</p><p style={{ fontSize: 10, color: textDim, margin: 0, textTransform: 'uppercase' }}>Combined Reach</p></div>
                <div><p style={{ fontSize: 20, fontWeight: 700, color: primary, margin: 0 }}>7</p><p style={{ fontSize: 10, color: textDim, margin: 0, textTransform: 'uppercase' }}>Studio Albums</p></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', background: activeTab === tab.id ? primary + '20' : bgSurface, color: activeTab === tab.id ? primary : textSecondary, transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: textPrimary }}>Platform Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {PLATFORMS.map((p) => (
                    <div key={p.platform} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: p.color + '20', border: '1px solid ' + p.color + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{p.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{p.platform}</span>
                        </div>
                        <div style={{ height: 4, background: border + '40', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: (p.engagement / 10) * 100 + '%', background: p.color, borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: 0 }}>{formatNumber(p.followers)}</p>
                        <p style={{ fontSize: 10, color: textDim, margin: 0 }}>{p.engagement}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: textPrimary }}>Key Metrics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {KPIs.slice(0, 4).map((kpi) => (
                      <div key={kpi.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: textSecondary }}>{kpi.name}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: kpi.color }}>{kpi.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <motion.div key="campaigns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: textPrimary }}>Campaign ROI Tracking</h3>
                  <button style={{ padding: '8px 16px', borderRadius: 8, background: primary, color: '#000', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>+ New Campaign</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid ' + border }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Campaign</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Impressions</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>CTR</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>CPM</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>CPA</th>
                      <th style={{ textAlign: 'right', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CAMPAIGNS.map((c) => (
                      <tr key={c.name} style={{ borderBottom: '1px solid ' + border + '40' }}>
                        <td style={{ padding: '14px 8px' }}><div style={{ fontWeight: 500, color: textPrimary }}>{c.name}</div><div style={{ fontSize: 10, color: textDim }}>{c.platform}</div></td>
                        <td style={{ padding: '14px 8px' }}><span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase', background: c.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', color: c.status === 'active' ? '#10b981' : '#3b82f6' }}>{c.status}</span></td>
                        <td style={{ padding: '14px 8px', textAlign: 'right', color: textPrimary }}>{formatNumber(c.impressions)}</td>
                        <td style={{ padding: '14px 8px', textAlign: 'right', color: textPrimary }}>{c.ctr.toFixed(2)}%</td>
                        <td style={{ padding: '14px 8px', textAlign: 'right', color: textPrimary }}>${c.cpm.toFixed(2)}</td>
                        <td style={{ padding: '14px 8px', textAlign: 'right', color: textPrimary }}>${c.cpa.toFixed(2)}</td>
                        <td style={{ padding: '14px 8px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{c.roas.toFixed(1)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* KPIs */}
          {activeTab === 'kpis' && (
            <motion.div key="kpis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {KPIs.map((kpi, i) => (
                  <motion.div key={kpi.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={cardStyle}>
                    <span style={{ fontSize: 11, color: textDim, textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.name}</span>
                    <p style={{ fontSize: 28, fontWeight: 700, color: kpi.color, margin: '12px 0 8px' }}>{kpi.value}</p>
                    <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>{kpi.change}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* GAPS */}
          {activeTab === 'gaps' && (
            <motion.div key="gaps" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {GAPS.map((gap) => {
                const colors = { critical: '#f43f5e', high: '#f59e0b', medium: '#d4af37', low: '#3b82f6' };
                const color = colors[gap.severity as keyof typeof colors] || colors.medium;
                return (
                  <div key={gap.id} style={{ padding: 24, borderRadius: 16, background: color + '15', border: '1px solid ' + color + '40', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: color }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingLeft: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: textPrimary }}>{gap.title}</h4>
                          <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 20, background: color + '20', color: color, textTransform: 'uppercase', fontWeight: 700 }}>{gap.severity}</span>
                          <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, background: bgSurface, color: textDim, textTransform: 'uppercase' }}>{gap.type}</span>
                        </div>
                        <p style={{ fontSize: 13, color: textSecondary, margin: '0 0 16px', lineHeight: 1.6 }}>{gap.description}</p>
                        <div style={{ padding: 12, borderRadius: 8, background: bgBg + '80', border: '1px solid ' + color + '40' }}>
                          <p style={{ fontSize: 10, color: primary, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Recommendation</p>
                          <p style={{ fontSize: 13, color: textPrimary, margin: 0 }}>{gap.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ACCOUNTS */}
          {activeTab === 'accounts' && (
            <motion.div key="accounts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: textPrimary }}>Connected Accounts</h3>
                  <button style={{ padding: '8px 16px', borderRadius: 8, background: primary, color: '#000', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>+ Add Account</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {PLATFORMS.map((p) => (
                    <div key={p.platform} style={{ padding: 20, borderRadius: 12, background: bgBg + '60', border: '1px solid ' + border + '40' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: p.color + '20', border: '1px solid ' + p.color + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{p.icon}</div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: 0 }}>{p.platform}</p>
                          <p style={{ fontSize: 10, color: textDim, margin: 0 }}>{formatNumber(p.followers)} followers</p>
                        </div>
                        <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div><p style={{ fontSize: 16, fontWeight: 600, color: '#10b981', margin: 0 }}>{p.engagement}%</p><p style={{ fontSize: 9, color: textDim, margin: 0, textTransform: 'uppercase' }}>Engagement</p></div>
                        <div><p style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: 0 }}>Active</p><p style={{ fontSize: 9, color: textDim, margin: 0, textTransform: 'uppercase' }}>Status</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* WEBHOOKS */}
          {activeTab === 'webhooks' && (
            <motion.div key="webhooks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: textPrimary }}>Webhook Manager</h3>
                    <p style={{ fontSize: 12, color: textDim, margin: '4px 0 0' }}>Event-driven notifications with HMAC signatures</p>
                  </div>
                  <button style={{ padding: '8px 16px', borderRadius: 8, background: primary, color: '#000', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>+ Add Webhook</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {WEBHOOKS.map((wh) => (
                    <div key={wh.url} style={{ padding: 16, borderRadius: 12, background: bgBg + '60', border: '1px solid ' + border + '40' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: wh.active ? '#10b981' : '#f43f5e' }} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: textPrimary, fontFamily: 'monospace' }}>{wh.url}</span>
                        </div>
                        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: wh.active ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', color: wh.active ? '#10b981' : '#f43f5e', fontWeight: 600 }}>{wh.active ? 'ACTIVE' : 'INACTIVE'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div><span style={{ fontSize: 10, color: textDim }}>Events:</span> <span style={{ fontSize: 11, color: textSecondary }}>{wh.events.join(', ')}</span></div>
                        <div><span style={{ fontSize: 10, color: textDim }}>Deliveries:</span> <span style={{ fontSize: 11, color: '#10b981' }}>{wh.deliveries.toLocaleString()}</span></div>
                        <div><span style={{ fontSize: 10, color: textDim }}>Failures:</span> <span style={{ fontSize: 11, color: wh.failures > 10 ? '#f43f5e' : textSecondary }}>{wh.failures}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* AUDIT */}
          {activeTab === 'audit' && (
            <motion.div key="audit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: textPrimary }}>Audit Logs</h3>
                    <p style={{ fontSize: 12, color: textDim, margin: '4px 0 0' }}>Complete queryable audit trail with export</p>
                  </div>
                  <button style={{ padding: '8px 16px', borderRadius: 8, background: bgSurface, border: '1px solid ' + border, color: textPrimary, fontWeight: 500, fontSize: 12, cursor: 'pointer' }}>Export CSV</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid ' + border }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Action</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>User</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Resource</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Details</th>
                      <th style={{ textAlign: 'right', padding: '10px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AUDIT_LOGS.map((log) => (
                      <tr key={log.timestamp} style={{ borderBottom: '1px solid ' + border + '40' }}>
                        <td style={{ padding: '12px 8px' }}><span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', fontWeight: 600 }}>{log.action}</span></td>
                        <td style={{ padding: '12px 8px', color: textSecondary }}>{log.user}</td>
                        <td style={{ padding: '12px 8px', color: textPrimary }}>{log.resource}</td>
                        <td style={{ padding: '12px 8px', color: textDim, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: textDim }}>{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 24px', color: textPrimary }}>Tenant Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                  <div><p style={{ fontSize: 11, color: textDim, marginBottom: 4, textTransform: 'uppercase' }}>Tenant ID</p><p style={{ fontSize: 13, color: textPrimary, fontFamily: 'monospace' }}>{SABRINA_TENANT_CONFIG.tenantId}</p></div>
                  <div><p style={{ fontSize: 11, color: textDim, marginBottom: 4, textTransform: 'uppercase' }}>Slug</p><p style={{ fontSize: 13, color: textPrimary, fontFamily: 'monospace' }}>{SABRINA_TENANT_CONFIG.tenantSlug}</p></div>
                  <div><p style={{ fontSize: 11, color: textDim, marginBottom: 4, textTransform: 'uppercase' }}>Tier</p><p style={{ fontSize: 13, color: primary, fontWeight: 600, textTransform: 'capitalize' }}>{SABRINA_TENANT_CONFIG.tier}</p></div>
                  <div><p style={{ fontSize: 11, color: textDim, marginBottom: 4, textTransform: 'uppercase' }}>Status</p><p style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Active</p></div>
                </div>
                <div style={{ paddingTop: 24, borderTop: '1px solid ' + border, marginBottom: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: textPrimary }}>Feature Flags</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {Object.entries(SABRINA_TENANT_CONFIG.features).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: value ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)', border: '1px solid ' + (value ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: value ? '#10b981' : '#f43f5e' }}>{value ? 'yes' : 'no'}</div>
                        <span style={{ fontSize: 12, color: textSecondary, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ paddingTop: 24, borderTop: '1px solid ' + border }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: textPrimary }}>Platform Configuration</h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(SABRINA_TENANT_CONFIG.platforms).map(([key, config]) => (
                      <span key={key} style={{ padding: '6px 12px', borderRadius: 8, background: config.enabled ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', border: '1px solid ' + (config.enabled ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'), color: config.enabled ? '#10b981' : '#f43f5e', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{key} {config.enabled ? 'yes' : 'no'}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Health */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginTop: 24, padding: 16, borderRadius: 12, background: bgSurface + '99', backdropFilter: 'blur(20px)', border: '1px solid ' + border, display: 'flex', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 11, color: textDim }}>Uptime:</span><span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>{health.uptime}%</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 11, color: textDim }}>Requests:</span><span style={{ fontSize: 11, color: textPrimary }}>{formatNumber(health.requests)}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 11, color: textDim }}>Cache Hit:</span><span style={{ fontSize: 11, color: textPrimary }}>{health.cacheHit}%</span></div>
        </motion.div>
      </main>
    </div>
  );
}

export default function MultiTenantDashboard() {
  return (
    <TenantStylesProvider tenantConfig={SABRINA_TENANT_CONFIG}>
      <DashboardContent />
    </TenantStylesProvider>
  );
}
