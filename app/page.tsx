'use client';

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Target,
  AlertTriangle,
  Users,
  Webhook,
  FileText,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Command,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  HelpCircle,
  Keyboard,
} from 'lucide-react';
import { TenantStylesProvider, useTenantTheme, useThemeMode } from '../lib/ui/theme-provider';
import { PlatformIcon, PlatformIconWithBg } from '../lib/ui/platform-icons';
import { CommandPalette } from '../lib/ui/command-palette';
import { OnboardingWizard } from '../lib/ui/onboarding-wizard';
import { Skeleton, SkeletonCard, SkeletonTable } from '../lib/ui/skeleton';
import { AnimatedBackground } from '../lib/ui/immersive-background';
import { CursorGlow, GlowTrail } from '../lib/ui/cursor-effects';
import { TimeAwareGradient } from '../lib/ui/spatial-ui';
import { ToastProvider } from '../lib/ui/microcopy';
import { ThemeEngineProvider, ThemeEnginePanel } from '../lib/ui/theme-engine';
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
  { platform: 'Instagram', color: '#E4405F', followers: 2800000, engagement: 5.2 },
  { platform: 'TikTok', color: '#000000', followers: 5200000, engagement: 8.4 },
  { platform: 'YouTube', color: '#FF0000', followers: 2100000, engagement: 4.1 },
  { platform: 'X (Twitter)', color: '#1DA1F2', followers: 1900000, engagement: 2.3 },
  { platform: 'Spotify', color: '#1DB954', followers: 8000000, engagement: 0 },
  { platform: 'Facebook', color: '#1877F2', followers: 1100000, engagement: 1.8 },
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
  { name: 'Total Followers', value: '61.1M', change: '+8.2%', trend: 'up', color: '#d4af37' },
  { name: 'Avg Engagement', value: '4.36%', change: '+0.6pp', trend: 'up', color: '#22c55e' },
  { name: 'Campaign ROAS', value: '14.2x', change: '+2.4x', trend: 'up', color: '#22c55e' },
  { name: 'Crisis Alerts', value: '1', change: 'Active', trend: 'alert', color: '#f43f5e' },
  { name: 'Sentiment Score', value: '78%', change: '+6%', trend: 'up', color: '#22c55e' },
  { name: 'Monthly Revenue', value: '$485K', change: '+15.5%', trend: 'up', color: '#d4af37' },
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

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: BarChart3 },
  { id: 'kpis', label: 'KPIs', icon: Target },
  { id: 'gaps', label: 'Gaps', icon: AlertTriangle },
  { id: 'accounts', label: 'Accounts', icon: Users },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'audit', label: 'Audit', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: BarChart3 },
  { id: 'kpis', label: 'KPIs', icon: Target },
  { id: 'gaps', label: 'Gaps', icon: AlertTriangle },
  { id: 'accounts', label: 'Accounts', icon: Users },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'audit', label: 'Audit', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

const TrendIcon = memo(({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp size={14} aria-label="Trending up" />;
  if (trend === 'down') return <TrendingDown size={14} aria-label="Trending down" />;
  if (trend === 'alert') return <AlertTriangle size={14} aria-label="Alert" />;
  return <Minus size={14} aria-label="No change" />;
});
TrendIcon.displayName = 'TrendIcon';

const StatusBadge = memo(({ status }: { status: string }) => (
  <span
    role="status"
    aria-label={`Status: ${status}`}
    style={{
      fontSize: 10,
      padding: '3px 8px',
      borderRadius: 4,
      fontWeight: 600,
      textTransform: 'uppercase',
      background: status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
      color: status === 'active' ? '#10b981' : '#3b82f6',
    }}
  >
    {status}
  </span>
));
StatusBadge.displayName = 'StatusBadge';

const SeverityBadge = memo(({ severity }: { severity: string }) => {
  const colors: Record<string, string> = { critical: '#f43f5e', high: '#f59e0b', medium: '#d4af37', low: '#3b82f6' };
  const color = colors[severity] || colors.medium;
  return (
    <span
      role="alert"
      aria-label={`Severity: ${severity}`}
      style={{
        fontSize: 9,
        padding: '3px 10px',
        borderRadius: 20,
        background: color + '20',
        color: color,
        textTransform: 'uppercase',
        fontWeight: 700,
      }}
    >
      {severity}
    </span>
  );
});
SeverityBadge.displayName = 'SeverityBadge';

const PlatformRow = memo(({ platform }: { platform: typeof PLATFORMS[0] }) => {
  const { theme } = useTenantTheme();
  const bgBg = theme?.colors?.background || '#09090b';
  const border = theme?.colors?.border || '#3f3f46';
  const textPrimary = theme?.colors?.textPrimary || '#fafafa';
  const textDim = theme?.colors?.textDim || '#71717a';

  return (
    <div role="listitem" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <PlatformIconWithBg platform={platform.platform} size={40} iconSize={16} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{platform.platform}</span>
        </div>
        <div role="progressbar" aria-valuenow={platform.engagement} aria-valuemin={0} aria-valuemax={10} style={{ height: 4, background: border + '40', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: (platform.engagement / 10) * 100 + '%', background: platform.color, borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: 0 }}>{formatNumber(platform.followers)}</p>
        <p style={{ fontSize: 10, color: textDim, margin: 0 }}>{platform.engagement}%</p>
      </div>
    </div>
  );
});
PlatformRow.displayName = 'PlatformRow';

const KPICard = memo(({ kpi, index }: { kpi: typeof KPIs[0]; index: number }) => (
  <motion.div
    role="region"
    aria-label={`${kpi.name}: ${kpi.value}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    style={{
      padding: 24,
      borderRadius: 16,
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--border-default)',
    }}
  >
    <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.name}</span>
    <p style={{ fontSize: 28, fontWeight: 700, color: kpi.color, margin: '12px 0 8px' }}>{kpi.value}</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <TrendIcon trend={kpi.trend} />
      <span style={{ fontSize: 11, color: kpi.trend === 'alert' ? '#f43f5e' : '#10b981', fontWeight: 600 }}>{kpi.change}</span>
    </div>
  </motion.div>
));
KPICard.displayName = 'KPICard';

function DashboardContent() {
  const { theme } = useTenantTheme();
  const { mode, setMode, resolvedMode } = useThemeMode();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [health] = useState({ status: 'healthy', uptime: 99.97, requests: 894234, cacheHit: 94.2 });
  const [rateLimit] = useState({ limit: 1000, remaining: 847 });

  const bgSurface = theme?.colors?.surface || '#18181b';
  const bgBg = theme?.colors?.background || '#09090b';
  const border = theme?.colors?.border || '#3f3f46';
  const textPrimary = theme?.colors?.textPrimary || '#fafafa';
  const textSecondary = theme?.colors?.textSecondary || '#a1a1aa';
  const textDim = theme?.colors?.textDim || '#71717a';
  const primary = theme?.colors?.primary || '#d4af37';
  const accent = theme?.colors?.accent || '#22c55e';

  const cardStyle = useMemo(
    () => ({
      padding: 24,
      borderRadius: 16,
      background: bgSurface + '99',
      backdropFilter: 'blur(20px)',
      border: '1px solid ' + border,
    }),
    [bgSurface, border]
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('omnipulse-onboarding-complete');
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsOnboardingOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsCommandPaletteOpen(true);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      setIsSidebarCollapsed((prev) => !prev);
    }
    if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
      setIsOnboardingOpen(false);
      setIsMobileMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleNavigate = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem('omnipulse-onboarding-complete', 'true');
    setIsOnboardingOpen(false);
  }, []);

  const cycleTheme = useCallback(() => {
    const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  }, [mode, setMode]);

  const ThemeModeIcon = useMemo(() => {
    if (resolvedMode === 'light') return <Sun size={16} />;
    if (resolvedMode === 'dark') return <Moon size={16} />;
    return <Monitor size={16} />;
  }, [resolvedMode]);

  return (
    <ThemeEngineProvider>
      <ToastProvider>
        <AnimatedBackground type="all" particleCount={50} orbCount={4} />
        <CursorGlow size={32} lag={60} />
        <GlowTrail dotCount={10} />
        <TimeAwareGradient />
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, ' + bgBg + ' 0%, ' + bgSurface + ' 50%, ' + bgBg + ' 100%)',
            color: textPrimary,
            fontFamily: theme?.fontFamily || 'Inter, sans-serif',
          }}
        >
          <a href="#main-content" className="skip-link">Skip to main content</a>

          <header
        role="banner"
        style={{
          borderBottom: '1px solid ' + border,
          padding: '16px 32px',
          background: bgBg + 'e6',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="hide-desktop"
              aria-label="Open menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 8,
                border: '1px solid ' + border,
                background: 'transparent',
                color: textPrimary,
                cursor: 'pointer',
              }}
            >
              <Menu size={20} />
            </button>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, ' + primary + ', ' + accent + ')',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                color: '#000',
              }}
              aria-hidden="true"
            >
              O
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: textPrimary }}>{SABRINA_TENANT_CONFIG.brandName}</h1>
              <p style={{ fontSize: 10, color: textDim, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
                Enterprise Multi-Tenant
              </p>
            </div>
          </div>

          <nav role="navigation" aria-label="Header actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Open command palette"
              aria-keyshortcuts="Control+K Meta+K"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: bgSurface,
                border: '1px solid ' + border,
                cursor: 'pointer',
                color: textDim,
                fontSize: 12,
              }}
            >
              <Search size={14} />
              <span className="hide-mobile">Search...</span>
              <kbd className="hide-mobile" style={{ padding: '2px 6px', background: 'var(--bg-hover)', borderRadius: 4, fontSize: 10 }}>
                <Command size={10} />K
              </kbd>
            </button>

            <button
              onClick={cycleTheme}
              aria-label={`Current theme: ${resolvedMode}. Click to change.`}
              aria-keyshortcuts="Control+Shift+T"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 8,
                background: bgSurface,
                border: '1px solid ' + border,
                cursor: 'pointer',
                color: textSecondary,
              }}
            >
              {ThemeModeIcon}
            </button>

            <button
              onClick={() => setIsOnboardingOpen(true)}
              aria-label="Open help and onboarding"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 8,
                background: bgSurface,
                border: '1px solid ' + border,
                cursor: 'pointer',
                color: textSecondary,
              }}
            >
              <HelpCircle size={16} />
            </button>

            <button
              onClick={() => setShowThemePanel(!showThemePanel)}
              aria-label="Toggle theme engine panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 8,
                background: showThemePanel ? primary + '20' : bgSurface,
                border: '1px solid ' + (showThemePanel ? primary + '40' : border),
                cursor: 'pointer',
                color: showThemePanel ? primary : textSecondary,
              }}
            >
              <Settings size={16} />
            </button>

            <div
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: bgSurface,
                border: '1px solid ' + border,
              }}
            >
              <span style={{ fontSize: 11, color: textDim }}>Rate: </span>
              <span style={{ fontSize: 11, color: primary, fontWeight: 600 }}>{rateLimit.remaining}/{rateLimit.limit}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                role="status"
                aria-label="System status: healthy"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                }}
              />
              <span className="hide-mobile" style={{ fontSize: 12, color: textDim }}>{health.status}</span>
            </div>
          </nav>
        </div>
      </header>

      <div style={{ display: 'flex', maxWidth: 1600, margin: '0 auto' }}>
        <aside
          role="navigation"
          aria-label="Main navigation"
          className="hide-mobile"
          style={{
            width: isSidebarCollapsed ? 72 : 240,
            minHeight: 'calc(100vh - 73px)',
            position: 'sticky',
            top: 73,
            background: 'var(--bg-deep)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.2s ease',
            overflow: 'hidden',
          }}
        >
          <nav style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={isSidebarCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: isSidebarCollapsed ? 12 : '10px 16px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    background: isActive ? primary + '20' : 'transparent',
                    color: isActive ? primary : textSecondary,
                    transition: 'all 0.2s',
                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                    width: '100%',
                  }}
                >
                  <Icon size={18} aria-hidden="true" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      style={{
                        position: 'absolute',
                        left: 0,
                        width: 3,
                        height: 20,
                        borderRadius: 2,
                        background: primary,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-keyshortcuts="Control+B"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: textDim,
                cursor: 'pointer',
              }}
            >
              {isSidebarCollapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span style={{ marginLeft: 8, fontSize: 11 }}>Collapse</span></>}
            </button>
          </div>

          <div style={{ padding: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 8,
                borderRadius: 8,
                background: 'var(--bg-surface)',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              }}
            >
              <Activity size={14} style={{ color: 'var(--accent-emerald)' }} aria-hidden="true" />
              {!isSidebarCollapsed && <span style={{ fontSize: 11, color: textDim }}>System Healthy</span>}
            </div>
          </div>
        </aside>

        {isMobileMenuOpen && (
          <div
            className="hide-desktop"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              background: 'rgba(0,0,0,0.5)',
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              style={{
                width: 280,
                height: '100vh',
                background: 'var(--bg-elevated)',
                borderRight: '1px solid var(--border-default)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontWeight: 600 }}>Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" style={{ background: 'none', border: 'none', color: textPrimary, cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <nav style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        background: isActive ? primary + '20' : 'transparent',
                        color: isActive ? primary : textSecondary,
                        width: '100%',
                        textAlign: 'left',
                      }}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </div>
        )}

        <main
          id="main-content"
          role="main"
          style={{ flex: 1, padding: 32, maxWidth: isSidebarCollapsed ? 'calc(100% - 72px)' : 'calc(100% - 240px)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 12,
              background: primary + '15',
              border: '1px solid ' + primary + '30',
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 10, color: textDim, textTransform: 'uppercase' }}>Tenant:</span>
            <span style={{ fontSize: 12, color: primary, fontWeight: 600 }}>sabrina-carpenter</span>
            <span role="status" style={{ fontSize: 10, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 4 }}>Active</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ ...cardStyle, marginBottom: 32, position: 'relative', overflow: 'hidden' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 400,
                height: 400,
                background: 'radial-gradient(circle at center, ' + primary + '08 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, position: 'relative' }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, ' + primary + ', ' + accent + ')',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  fontWeight: 700,
                  boxShadow: '0 0 40px ' + primary + '40',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                SC
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: textPrimary }}>Sabrina Carpenter</h2>
                  <span
                    style={{
                      fontSize: 9,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: primary + '20',
                      border: '1px solid ' + primary + '40',
                      color: primary,
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: 0.5,
                    }}
                  >
                    Grammy Winner
                  </span>
                </div>
                <p style={{ fontSize: 14, color: textSecondary, margin: '0 0 16px' }}>Island Records (Universal) Age 26 World Tour 2025-2026</p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 700, color: primary, margin: 0 }}>2</p>
                    <p style={{ fontSize: 10, color: textDim, margin: 0, textTransform: 'uppercase' }}>Grammy Wins</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 700, color: primary, margin: 0 }}>2</p>
                    <p style={{ fontSize: 10, color: textDim, margin: 0, textTransform: 'uppercase' }}>Billboard #1</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 700, color: primary, margin: 0 }}>61.1M</p>
                    <p style={{ fontSize: 10, color: textDim, margin: 0, textTransform: 'uppercase' }}>Combined Reach</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 700, color: primary, margin: 0 }}>7</p>
                    <p style={{ fontSize: 10, color: textDim, margin: 0, textTransform: 'uppercase' }}>Studio Albums</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <nav role="tablist" aria-label="Dashboard sections" style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    background: isActive ? primary + '20' : bgSurface,
                    color: isActive ? primary : textSecondary,
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={14} aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                role="tabpanel"
                id="panel-overview"
                aria-labelledby="tab-overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}
              >
                <div style={cardStyle}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: textPrimary }}>Platform Breakdown</h3>
                  {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <Skeleton variant="rectangular" width={40} height={40} />
                          <div style={{ flex: 1 }}><Skeleton width="60%" height={12} /></div>
                          <Skeleton width={60} height={20} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {PLATFORMS.map((p) => <PlatformRow key={p.platform} platform={p} />)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={cardStyle}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: textPrimary }}>Key Metrics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {KPIs.slice(0, 4).map((kpi) => (
                        <div key={kpi.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: textSecondary }}>{kpi.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <TrendIcon trend={kpi.trend} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: kpi.color }}>{kpi.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'campaigns' && (
              <motion.div key="campaigns" role="tabpanel" id="panel-campaigns" aria-labelledby="tab-campaigns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: textPrimary }}>Campaign ROI Tracking</h3>
                    <button
                      style={{ padding: '8px 16px', borderRadius: 8, background: primary, color: '#000', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      aria-label="Create new campaign"
                    >
                      <Plus size={14} aria-hidden="true" /> New Campaign
                    </button>
                  </div>
                  {isLoading ? (
                    <SkeletonTable rows={4} columns={7} />
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }} role="table">
                      <thead>
                        <tr style={{ borderBottom: '1px solid ' + border }}>
                          <th scope="col" style={{ textAlign: 'left', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Campaign</th>
                          <th scope="col" style={{ textAlign: 'left', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Status</th>
                          <th scope="col" style={{ textAlign: 'right', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Impressions</th>
                          <th scope="col" style={{ textAlign: 'right', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>CTR</th>
                          <th scope="col" style={{ textAlign: 'right', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>CPM</th>
                          <th scope="col" style={{ textAlign: 'right', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>CPA</th>
                          <th scope="col" style={{ textAlign: 'right', padding: '12px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>ROAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CAMPAIGNS.map((c) => (
                          <tr key={c.name} style={{ borderBottom: '1px solid ' + border + '40' }}>
                            <td style={{ padding: '14px 8px' }}><div style={{ fontWeight: 500, color: textPrimary }}>{c.name}</div><div style={{ fontSize: 10, color: textDim }}>{c.platform}</div></td>
                            <td style={{ padding: '14px 8px' }}><StatusBadge status={c.status} /></td>
                            <td style={{ padding: '14px 8px', textAlign: 'right', color: textPrimary }}>{formatNumber(c.impressions)}</td>
                            <td style={{ padding: '14px 8px', textAlign: 'right', color: textPrimary }}>{c.ctr.toFixed(2)}%</td>
                            <td style={{ padding: '14px 8px', textAlign: 'right', color: textPrimary }}>${c.cpm.toFixed(2)}</td>
                            <td style={{ padding: '14px 8px', textAlign: 'right', color: textPrimary }}>${c.cpa.toFixed(2)}</td>
                            <td style={{ padding: '14px 8px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{c.roas.toFixed(1)}x</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'kpis' && (
              <motion.div key="kpis" role="tabpanel" id="panel-kpis" aria-labelledby="tab-kpis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ ...cardStyle, padding: 24 }}>
                          <Skeleton width="50%" height={12} />
                          <Skeleton width="40%" height={32} style={{ margin: '12px 0 8px' }} />
                          <Skeleton width="30%" height={12} />
                        </div>
                      ))
                    : KPIs.map((kpi, i) => <KPICard key={kpi.name} kpi={kpi} index={i} />)}
                </div>
              </motion.div>
            )}

            {activeTab === 'gaps' && (
              <motion.div key="gaps" role="tabpanel" id="panel-gaps" aria-labelledby="tab-gaps" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{ ...cardStyle, padding: 24 }}>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                          <Skeleton width="60%" height={20} />
                          <Skeleton width={80} height={20} />
                        </div>
                        <Skeleton width="100%" height={40} />
                      </div>
                    ))
                  : GAPS.map((gap) => {
                      const colors: Record<string, string> = { critical: '#f43f5e', high: '#f59e0b', medium: '#d4af37', low: '#3b82f6' };
                      const color = colors[gap.severity] || colors.medium;
                      return (
                        <div key={gap.id} style={{ padding: 24, borderRadius: 16, background: color + '15', border: '1px solid ' + color + '40', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: color }} aria-hidden="true" />
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingLeft: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: textPrimary }}>{gap.title}</h4>
                                <SeverityBadge severity={gap.severity} />
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

            {activeTab === 'accounts' && (
              <motion.div key="accounts" role="tabpanel" id="panel-accounts" aria-labelledby="tab-accounts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: textPrimary }}>Connected Accounts</h3>
                    <button style={{ padding: '8px 16px', borderRadius: 8, background: primary, color: '#000', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Plus size={14} aria-hidden="true" /> Add Account
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                    {isLoading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} style={{ ...cardStyle, padding: 20 }}>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                              <Skeleton variant="rectangular" width={36} height={36} />
                              <div style={{ flex: 1 }}><Skeleton width="60%" height={14} /><Skeleton width="40%" height={10} style={{ marginTop: 4 }} /></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><Skeleton width={50} height={20} /><Skeleton width={50} height={20} /></div>
                          </div>
                        ))
                      : PLATFORMS.map((p) => (
                          <div key={p.platform} style={{ padding: 20, borderRadius: 12, background: bgBg + '60', border: '1px solid ' + border + '40' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                              <PlatformIconWithBg platform={p.platform} size={36} iconSize={14} />
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: 0 }}>{p.platform}</p>
                                <p style={{ fontSize: 10, color: textDim, margin: 0 }}>{formatNumber(p.followers)} followers</p>
                              </div>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginLeft: 'auto' }} aria-label="Connected" />
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

            {activeTab === 'webhooks' && (
              <motion.div key="webhooks" role="tabpanel" id="panel-webhooks" aria-labelledby="tab-webhooks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: textPrimary }}>Webhook Manager</h3>
                      <p style={{ fontSize: 12, color: textDim, margin: '4px 0 0' }}>Event-driven notifications with HMAC signatures</p>
                    </div>
                    <button style={{ padding: '8px 16px', borderRadius: 8, background: primary, color: '#000', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Plus size={14} aria-hidden="true" /> Add Webhook
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} style={{ ...cardStyle, padding: 16 }}><Skeleton width="100%" height={20} /></div>
                        ))
                      : WEBHOOKS.map((wh) => (
                          <div key={wh.url} style={{ padding: 16, borderRadius: 12, background: bgBg + '60', border: '1px solid ' + border + '40' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span role="status" style={{ width: 8, height: 8, borderRadius: '50%', background: wh.active ? '#10b981' : '#f43f5e' }} aria-label={wh.active ? 'Active' : 'Inactive'} />
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

            {activeTab === 'audit' && (
              <motion.div key="audit" role="tabpanel" id="panel-audit" aria-labelledby="tab-audit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: textPrimary }}>Audit Logs</h3>
                      <p style={{ fontSize: 12, color: textDim, margin: '4px 0 0' }}>Complete queryable audit trail with export</p>
                    </div>
                    <button style={{ padding: '8px 16px', borderRadius: 8, background: bgSurface, border: '1px solid ' + border, color: textPrimary, fontWeight: 500, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={14} aria-hidden="true" /> Export CSV
                    </button>
                  </div>
                  {isLoading ? (
                    <SkeletonTable rows={5} columns={5} />
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }} role="table">
                      <thead>
                        <tr style={{ borderBottom: '1px solid ' + border }}>
                          <th scope="col" style={{ textAlign: 'left', padding: '10px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Action</th>
                          <th scope="col" style={{ textAlign: 'left', padding: '10px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>User</th>
                          <th scope="col" style={{ textAlign: 'left', padding: '10px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Resource</th>
                          <th scope="col" style={{ textAlign: 'left', padding: '10px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Details</th>
                          <th scope="col" style={{ textAlign: 'right', padding: '10px 8px', color: textDim, fontWeight: 500, textTransform: 'uppercase', fontSize: 10 }}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {AUDIT_LOGS.map((log, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid ' + border + '40' }}>
                            <td style={{ padding: '12px 8px' }}><span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', fontWeight: 600 }}>{log.action}</span></td>
                            <td style={{ padding: '12px 8px', color: textSecondary }}>{log.user}</td>
                            <td style={{ padding: '12px 8px', color: textPrimary }}>{log.resource}</td>
                            <td style={{ padding: '12px 8px', color: textDim, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', color: textDim }}>{log.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" role="tabpanel" id="panel-settings" aria-labelledby="tab-settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 24px', color: textPrimary }}>Tenant Configuration</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 24 }}>
                    <div>
                      <p style={{ fontSize: 11, color: textDim, marginBottom: 4, textTransform: 'uppercase' }}>Tenant ID</p>
                      <p style={{ fontSize: 13, color: textPrimary, fontFamily: 'monospace' }}>{SABRINA_TENANT_CONFIG.tenantId}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: textDim, marginBottom: 4, textTransform: 'uppercase' }}>Slug</p>
                      <p style={{ fontSize: 13, color: textPrimary, fontFamily: 'monospace' }}>{SABRINA_TENANT_CONFIG.tenantSlug}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: textDim, marginBottom: 4, textTransform: 'uppercase' }}>Tier</p>
                      <p style={{ fontSize: 13, color: primary, fontWeight: 600, textTransform: 'capitalize' }}>{SABRINA_TENANT_CONFIG.tier}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: textDim, marginBottom: 4, textTransform: 'uppercase' }}>Status</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={14} style={{ color: '#10b981' }} aria-hidden="true" />
                        <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Active</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ paddingTop: 24, borderTop: '1px solid ' + border, marginBottom: 24 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: textPrimary }}>Feature Flags</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      {Object.entries(SABRINA_TENANT_CONFIG.features).map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: value ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)', border: '1px solid ' + (value ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {value ? <CheckCircle2 size={12} style={{ color: '#10b981' }} aria-hidden="true" /> : <XCircle size={12} style={{ color: '#f43f5e' }} aria-hidden="true" />}
                          </div>
                          <span style={{ fontSize: 12, color: textSecondary, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ paddingTop: 24, borderTop: '1px solid ' + border }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: textPrimary }}>Platform Configuration</h4>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {Object.entries(SABRINA_TENANT_CONFIG.platforms).map(([key, config]) => (
                        <span key={key} style={{ padding: '6px 12px', borderRadius: 8, background: config.enabled ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', border: '1px solid ' + (config.enabled ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'), color: config.enabled ? '#10b981' : '#f43f5e', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {config.enabled ? <CheckCircle2 size={12} aria-hidden="true" /> : <XCircle size={12} aria-hidden="true" />}
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            role="contentinfo"
            aria-label="System health"
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 12,
              background: bgSurface + '99',
              backdropFilter: 'blur(20px)',
              border: '1px solid ' + border,
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={14} style={{ color: '#10b981' }} aria-hidden="true" />
              <span style={{ fontSize: 11, color: textDim }}>Uptime:</span>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>{health.uptime}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={14} style={{ color: primary }} aria-hidden="true" />
              <span style={{ fontSize: 11, color: textDim }}>Requests:</span>
              <span style={{ fontSize: 11, color: textPrimary }}>{formatNumber(health.requests)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={14} style={{ color: 'var(--accent-cyan)' }} aria-hidden="true" />
              <span style={{ fontSize: 11, color: textDim }}>Cache Hit:</span>
              <span style={{ fontSize: 11, color: textPrimary }}>{health.cacheHit}%</span>
            </div>
            <button
              onClick={() => setIsLoading(true)}
              aria-label="Refresh data"
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: textDim,
                display: 'flex',
              }}
            >
              <RefreshCw size={14} />
            </button>
          </motion.div>
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
        {showThemePanel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
              position: 'fixed',
              top: 80,
              right: 32,
              width: 320,
              zIndex: 200,
            }}
          >
            <ThemeEnginePanel />
          </motion.div>
        )}
      </div>
      </ToastProvider>
    </ThemeEngineProvider>
  );
}

export default function MultiTenantDashboard() {
  return (
    <TenantStylesProvider tenantConfig={SABRINA_TENANT_CONFIG}>
      <DashboardContent />
    </TenantStylesProvider>
  );
}
