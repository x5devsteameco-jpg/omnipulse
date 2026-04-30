# Omnipulse Data Architecture

## Principle: Zero Fake Filler — Production-Ready Integration Layer

All data in Omnipulse flows through typed interfaces. Mock data is structurally identical to live API responses so integration requires only swapping the data source.

## Data Flow

```
Real Integration (Future):
  Social APIs → API Routes → Data Layer → Components

Current Development:
  MockGenerators → Data Layer → Components (same shape)
```

## Type Interfaces

```ts
// All interfaces mirror what real APIs would return
interface Platform {
  platform: string;
  color: string;
  followers: number;
  engagement: number;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'completed' | 'paused' | 'draft';
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  cpa: number;
  roas: number;
  spend: number;
  startDate?: string;
  endDate?: string;
}

interface KPIMetric {
  id: string;
  name: string;
  value: number | string;
  change: string;
  changeValue: number;
  trend: 'up' | 'down' | 'neutral' | 'alert';
  color: string;
  format: 'number' | 'currency' | 'percent' | 'compact';
  sparklineData?: number[];
}

interface Gap {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'content' | 'format' | 'engagement' | 'audience' | 'platform';
  recommendation: string;
  detectedAt: string;
  status: 'open' | 'addressed' | 'dismissed';
}

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  followers: number;
  isActive: boolean;
  lastSync: string;
  connectedVia: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  deliveries: number;
  failures: number;
  createdAt: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  resource: string;
  timestamp: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

interface TenantStats {
  totalFollowers: number;
  avgEngagement: number;
  campaignROAS: number;
  activeCrisisAlerts: number;
  sentimentScore: number;
  monthlyRevenue: number;
}
```

## Mock Data Generator

```ts
// lib/data/mock-generators.ts
// Replace these generators with real API calls when tokens are available

import type { Platform, Campaign, KPIMetric, Gap, SocialAccount, Webhook, AuditLogEntry } from './types';

export function generateMockPlatforms(): Platform[] {
  return [
    { platform: 'Instagram', color: '#E4405F', followers: 0, engagement: 0 },
    { platform: 'TikTok', color: '#000000', followers: 0, engagement: 0 },
    { platform: 'YouTube', color: '#FF0000', followers: 0, engagement: 0 },
    { platform: 'X (Twitter)', color: '#1DA1F2', followers: 0, engagement: 0 },
    { platform: 'Spotify', color: '#1DB954', followers: 0, engagement: 0 },
    { platform: 'Facebook', color: '#1877F2', followers: 0, engagement: 0 },
  ];
}

export function generateMockCampaigns(): Campaign[] {
  return [];
}

export function generateMockKPIs(): KPIMetric[] {
  return [];
}

export function generateMockGaps(): Gap[] {
  return [];
}

export function generateMockAccounts(): SocialAccount[] {
  return [];
}

export function generateMockWebhooks(): Webhook[] {
  return [];
}

export function generateMockAuditLogs(): AuditLogEntry[] {
  return [];
}

export function generateMockTenantStats() {
  return null; // null = no data yet
}
```

## API Route Integration Map

| Data Type | API Route | Returns |
|----------|----------|---------|
| Platforms | `GET /api/metrics/[id]` | Platform[] |
| Campaigns | `GET /api/campaigns/by-brand/[brandId]` | Campaign[] |
| KPIs | `GET /api/kpis/by-brand/[brandId]` | KPIMetric[] |
| Gaps | `GET /api/gaps/[clientId]` | Gap[] |
| Accounts | `GET /api/metrics/[id]/history` | SocialAccount[] |
| Webhooks | `GET /api/webhooks/by-tenant/[tenantId]` | Webhook[] |
| Audit Logs | `GET /api/audit/by-tenant/[tenantId]/summary` | AuditLogEntry[] |
| Tenant Stats | `GET /api/tenants/[tenantSlug]` | TenantStats |

## Integration Checklist

- [ ] Instagram API token → fetch real follower counts + engagement
- [ ] TikTok API token → fetch real metrics
- [ ] Twitter/X API token → fetch real mentions + sentiment
- [ ] YouTube API key → fetch real subscriber counts + views
- [ ] Spotify API token → fetch real follower + stream data
- [ ] Facebook API token → fetch real page metrics
- [ ] Connect API routes to data generators (remove mock fallback)
