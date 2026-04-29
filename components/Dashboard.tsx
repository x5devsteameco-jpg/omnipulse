'use client';

import { motion } from 'framer-motion';
import { KPICard } from '../lib/ui/kpi-card';
import TrendsPanel from './TrendsPanel';
import PredictionsPanel from './PredictionsPanel';
import GapsPanel from './GapsPanel';
import PlatformSelector from './PlatformSelector';

interface Account {
  id: string;
  platform: string;
  username: string;
  followersCount: number;
  engagementRate: number;
}

interface DashboardProps {
  clientId: string;
  accounts: Account[];
  metrics: Array<{
    capturedAt: string;
    followersCount: number;
    engagementRate: number;
    viewsCount: number;
    postsCount: number;
  }>;
  trends: Array<{
    topic: string;
    postsCount: number;
    engagement: number;
    velocity: number;
    timestamp: string;
  }>;
  predictions: Array<{
    predictedFollowers: number;
    predictedEngagement: number;
    predictedPosts: number;
    confidence: number;
    period: string;
    trendDirection: 'up' | 'down' | 'stable';
  }>;
  gaps: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
}

export default function Dashboard({
  clientId,
  accounts,
  metrics,
  trends,
  predictions,
  gaps
}: DashboardProps) {
  const totalFollowers = accounts.reduce((sum, acc) => sum + acc.followersCount, 0);
  const avgEngagement = accounts.reduce((sum, acc) => sum + acc.engagementRate, 0) / (accounts.length || 1);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">OmniPulse</div>
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
          <h1 className="page-title">OmniPulse Analytics</h1>
        </motion.div>

        <div className="stats-grid">
          <KPICard
            label="Total Followers"
            value={totalFollowers}
            change={12.4}
            changeLabel="vs last month"
            format="compact"
            color="var(--gold-primary)"
            sparklineData={[4200000, 4350000, 4480000, 4520000, 4610000, 4780000]}
            trend="up"
          />
          <KPICard
            label="Avg Engagement Rate"
            value={avgEngagement}
            change={0.8}
            changeLabel="vs last month"
            format="percentage"
            color="var(--accent-emerald)"
            sparklineData={[3.2, 3.4, 3.5, 3.6, 3.8, 4.0]}
            trend="up"
          />
          <KPICard
            label="Marketing Gaps"
            value={gaps.length}
            changeLabel={`${gaps.filter(g => g.severity === 'critical').length} critical`}
            format="compact"
            color={gaps.some(g => g.severity === 'critical') ? 'var(--accent-rose)' : 'var(--accent-emerald)'}
            sparklineData={[8, 7, 6, 5, 5, gaps.length]}
            trend={gaps.some(g => g.severity === 'critical') ? 'down' : 'up'}
          />
        </div>

        <PlatformSelector accounts={accounts} metrics={metrics} />

        <TrendsPanel trends={trends} />

        <PredictionsPanel predictions={predictions} />

        <GapsPanel gaps={gaps} />
      </main>
    </div>
  );
}