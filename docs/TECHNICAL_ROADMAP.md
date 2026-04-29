# OmniPulse — Technical Roadmap v1.0
## Multi-Tenant SaaS Social Media Analytics Platform

**Document Version:** 1.0
**Date:** April 29, 2026
**Classification:** Internal — Technical Planning

---

## EXECUTIVE SUMMARY

This roadmap details the technical implementation plan for OmniPulse, a multi-tenant SaaS platform enabling brands to manage portfolios of talent profiles with customizable KPIs, real-time analytics, and dynamic white-labeling. The roadmap covers tech stack selection, database schema design for dynamic metrics, UI/UX wireframes for the client portal, and global scaling strategy.

---

## 1. TECH STACK RECOMMENDATION

### 1.1 Core Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend Framework** | Next.js 15 + React 19 | Server components, streaming SSR, edge runtime support |
| **Styling** | Tailwind CSS 4 + CSS Variables | Dynamic theming per tenant, minimal runtime |
| **State Management** | Zustand + React Query | Lightweight, tenant-isolated state, server cache sync |
| **Backend** | Next.js API Routes + tRPC | Type-safe APIs, automatic client inference |
| **Database (Per-Tenant)** | Neon PostgreSQL (Serverless) | Branching per tenant, auto-scaling, zero cold starts |
| **Master Database** | Neon PostgreSQL | Tenant registry, billing, master config |
| **Cache/Layer 2** | Upstash Redis | Serverless Redis, per-tenant key isolation |
| **Queue/Jobs** | Trigger.dev | Type-safe background jobs, managed infrastructure |
| **Auth** | Clerk | Multi-tenant support, role-based access, hosted UI |
| **Deployment** | Vercel | Edge functions, global CDN, automatic scaling |
| **File Storage** | Cloudflare R2 | S3-compatible, egress-free on Vercel |
| **Monitoring** | Axiom + Sentry | Log aggregation, error tracking, audit trail |

### 1.2 Platform API Integrations

| Platform | API | Auth Method |
|----------|-----|------------|
| Instagram | Graph API | OAuth 2.0 (long-lived tokens) |
| TikTok | Marketing API | OAuth 2.0 |
| YouTube | Data API v3 | API Key + OAuth |
| Twitter/X | API v2 | OAuth 2.0 (App-only or User context) |
| LinkedIn | Marketing API | OAuth 2.0 |
| Facebook | Graph API | OAuth 2.0 |

### 1.3 Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Edge       │  │  Edge       │  │  Global     │             │
│  │  Functions  │  │  Middleware │  │  CDN        │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    VERCEL SERVERLESS                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Next.js Application (App Router)              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │  Pages    │  │  API      │  │  Static  │  │  Image   │  │ │
│  │  │  (RSC)    │  │  Routes   │  │  Assets  │  │  Optimize│  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────┼──────────────────────────────┐   │
│  │              DATA LAYER (Per-Tenant)                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │  Neon       │  │  Upstash   │  │  R2        │         │   │
│  │  │  PostgreSQL │  │  Redis     │  │  Storage   │         │   │
│  │  │  (Branches) │  │  (Keys)    │  │  (Assets)  │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. DATABASE SCHEMA FOR DYNAMIC METRICS

### 2.1 Design Principles

1. **Schema Flexibility** — Custom KPIs per client without schema migrations
2. **Metric Normalization** — All platforms normalized to a common metric model
3. **Audit Trail** — Every metric change timestamped with source attribution
4. **Partitioning** — Time-series data partitioned by month for query performance

### 2.2 Master Database Schema (Tenant Registry)

```sql
-- lib/db/master/schema.sql

-- Tenants (master record)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(20) DEFAULT 'starter', -- starter, professional, enterprise
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant database connections
CREATE TABLE tenant_databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_name VARCHAR(100) NOT NULL,
  connection_string TEXT NOT NULL, -- Encrypted
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant configurations
CREATE TABLE tenant_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, config_key)
);

-- Brands (clients within a tenant)
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_name VARCHAR(255),
  brand_guidelines JSONB DEFAULT '{}',
  legal_constraints JSONB DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Brand users (multi-tenant auth)
CREATE TABLE brand_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer', -- admin, editor, viewer
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, email)
);

-- Invitations
CREATE TABLE brand_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer',
  invited_by UUID NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 Per-Tenant Database Schema (Dynamic Metrics)

```sql
-- lib/db/tenant/schema.sql

-- Social accounts (platform-agnostic)
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL, -- instagram, tiktok, youtube, twitter, linkedin, facebook
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  account_type VARCHAR(20) DEFAULT 'profile', -- profile, hashtag, location
  access_token_encrypted TEXT, -- AES-256 encrypted
  token_expires_at TIMESTAMPTZ,
  refresh_token_encrypted TEXT,
  extra_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, platform, username)
);

-- Dynamic KPI definitions per brand
CREATE TABLE kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  metric_type VARCHAR(50) NOT NULL, -- counter, gauge, rate, percentage, currency
  aggregation_method VARCHAR(20) DEFAULT 'sum', -- sum, avg, min, max, last
  platform_source VARCHAR(20)[], -- Which platforms contribute to this KPI
  calculation_config JSONB DEFAULT '{}', -- Custom calculation rules
  display_config JSONB DEFAULT '{
    "format": "number",
    "precision": 0,
    "prefix": "",
    "suffix": "",
    "colorThresholds": []
  }',
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, slug)
);

-- Raw metrics (flexible schema for platform-specific data)
CREATE TABLE metrics_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  kpi_definition_id UUID REFERENCES kpi_definitions(id) ON DELETE SET NULL,
  platform VARCHAR(20) NOT NULL,
  metric_name VARCHAR(100) NOT NULL, -- e.g., 'followers_count', 'engagement_rate'
  metric_value JSONB NOT NULL, -- Flexible: number, object, array
  value_numeric FLOAT, -- Extracted numeric for queries
  captured_at TIMESTAMPTZ DEFAULT now(),
  source_batch_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Partitioned metrics for time-series queries
CREATE TABLE metrics_timeseries (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  kpi_definition_id UUID,
  platform VARCHAR(20) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  value_numeric FLOAT,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  aggregation JSONB, -- Aggregated values if period > 1 day
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (account_id, period_start, metric_name)
) PARTITION BY RANGE (period_start);

-- Create monthly partitions
CREATE TABLE metrics_timeseries_2026_01 PARTITION OF metrics_timeseries
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE metrics_timeseries_2026_02 PARTITION OF metrics_timeseries
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... etc

-- Aggregated metric snapshots (daily/hourly rollups)
CREATE TABLE metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  kpi_definition_id UUID REFERENCES kpi_definitions(id) ON DELETE SET NULL,
  snapshot_type VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly, monthly
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metrics JSONB NOT NULL, -- Denormalized for fast reads
  delta_from_previous JSONB, -- Change from previous period
  percent_change JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, snapshot_type, period_start)
);

-- Trends (extracted from time-series)
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  top_posts JSONB DEFAULT '[]',
  trending_hashtags JSONB DEFAULT '[]',
  trending_topics JSONB DEFAULT '[]',
  viral_posts_count INTEGER DEFAULT 0,
  avg_viral_duration_hours FLOAT DEFAULT 0,
  engagement_velocity FLOAT DEFAULT 0, -- Posts per hour with > threshold engagement
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, platform, period_start)
);

-- Marketing gaps
CREATE TABLE marketing_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  gap_type VARCHAR(50) NOT NULL, -- audience_overlap, content_gap, timing_gap, competitor
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  title VARCHAR(255) NOT NULL,
  description TEXT,
  opportunity TEXT,
  competitor_metrics JSONB DEFAULT '{}',
  current_metrics JSONB DEFAULT '{}',
  recommended_action TEXT,
  estimated_impact VARCHAR(50),
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, dismissed
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  kpi_definition_id UUID REFERENCES kpi_definitions(id) ON DELETE SET NULL,
  platform VARCHAR(20) NOT NULL,
  prediction_type VARCHAR(50) DEFAULT 'followers', -- followers, engagement, reach, revenue
  prediction_period_start TIMESTAMPTZ NOT NULL,
  prediction_period_end TIMESTAMPTZ NOT NULL,
  predicted_value FLOAT NOT NULL,
  predicted_range_low FLOAT,
  predicted_range_high FLOAT,
  confidence_score FLOAT, -- 0-1
  model_version VARCHAR(20) DEFAULT '1.0',
  model_features JSONB, -- Features used in prediction
  actual_value FLOAT, -- Filled when period completes
  accuracy_score FLOAT, -- Calculated after actual known
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns (ROI tracking)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  budget_total FLOAT,
  talent_account_ids UUID[] DEFAULT '{}',
  platform_target VARCHAR(20)[],
  kpi_targets JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, completed, cancelled
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign performance (actual vs target)
CREATE TABLE campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  metrics JSONB NOT NULL, -- Platform-specific metrics at time of record
  delta_from_target JSONB, -- Actual vs KPI targets
  attribution_source VARCHAR(50), -- How this was attributed to campaign
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 Dynamic KPI Configuration Example

```typescript
// Example: A beverage brand tracking reach and sentiment
{
  "brandId": "uuid-beverage-brand",
  "kpis": [
    {
      "name": "Total Social Reach",
      "slug": "total_reach",
      "metricType": "gauge",
      "aggregationMethod": "sum",
      "platformSource": ["instagram", "tiktok", "youtube", "twitter"],
      "calculationConfig": {
        "formula": "sum(platforms.map(p => p.followers_count + p.reach))"
      },
      "displayConfig": {
        "format": "compact", // e.g., "1.2M"
        "precision": 1,
        "colorThresholds": [
          { "min": 0, "max": 1000000, "color": "red" },
          { "min": 1000000, "max": 10000000, "color": "yellow" },
          { "min": 10000000, "color": "green" }
        ]
      }
    },
    {
      "name": "Sentiment Score",
      "slug": "sentiment_score",
      "metricType": "percentage",
      "aggregationMethod": "avg",
      "platformSource": ["instagram", "twitter"],
      "calculationConfig": {
        "formula": "avg(platforms.map(p => p.positive_mentions / p.total_mentions)) * 100"
      }
    }
  ]
}

// Example: An apparel brand tracking conversion and sales
{
  "brandId": "uuid-apparel-brand",
  "kpis": [
    {
      "name": "Affiliate Conversion Rate",
      "slug": "conversion_rate",
      "metricType": "percentage",
      "aggregationMethod": "avg",
      "platformSource": ["instagram", "tiktok"],
      "calculationConfig": {
        "formula": "sum(clicks) / sum(impressions) * 100"
      }
    },
    {
      "name": "Estimated Revenue",
      "slug": "estimated_revenue",
      "metricType": "currency",
      "aggregationMethod": "sum",
      "platformSource": ["instagram", "tiktok", "youtube"],
      "calculationConfig": {
        "formula": "sum(platforms.map(p => p.conversions * p.average_order_value))",
        "currency": "USD"
      }
    }
  ]
}
```

---

## 3. UI/UX WIREFRAME SUGGESTIONS

### 3.1 Design System Foundation

```css
/* lib/ui/design-system.css */

/* Dynamic CSS Variables per Tenant */
:root {
  /* Brand Colors (injected per tenant) */
  --brand-primary: var(--tenant-primary, #d4af37);
  --brand-secondary: var(--tenant-secondary, #12121a);
  --brand-accent: var(--tenant-accent, #22c55e);
  --brand-font: var(--tenant-font, 'Inter', system-ui, sans-serif);

  /* Semantic Tokens */
  --color-background: #09090b;
  --color-surface: #18181b;
  --color-surface-elevated: #27272a;
  --color-border: #3f3f46;
  --color-text-primary: #fafafa;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;

  /* Status Colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);
}
```

### 3.2 Client Portal — Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
│  ┌─────────┐  ┌──────────────────────────────────────┐  ┌────────────────┐  │
│  │  LOGO   │  │  Brand: Sabrina Carpenter        ▼   │  │  User Menu     │  │
│  │ (White-  │  │  ────────────────────────────────────│  │  Avatar ▼      │  │
│  │  Label)  │  │  Talent Portfolio ▼ | Campaigns ▼  │  │                │  │
│  └─────────┘  └──────────────────────────────────────┘  └────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  CUSTOMIZABLE KPI RIBBON (Draggable & Reorderable)                   │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐         │    │
│  │  │  Reach    │  │ Sentiment │  │ Engagement│  │  Revenue  │   + Add │    │
│  │  │  124.5M  │  │   +12.3%  │  │   8.7%    │  │  $2.4M    │   KPI   │    │
│  │  │   ▲ 2.1% │  │   ▲ 1.2%  │  │   ▼ 0.3%  │  │   ▲ 15%   │         │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────┐    │
│  │  PERFORMANCE CHART               │  │  TALENT PORTFOLIO              │    │
│  │  ┌──────────────────────────────┐│  │  ┌─────────────────────────────┐│    │
│  │  │     📈                        ││  │  │ │ Sabrina Carpenter      ● ││    │
│  │  │   Line chart with            ││  │  │ │ IG: 60M  TT: 40M        ││    │
│  │  │   customizable date range    ││  │  │ │ Engagement: 8.7%        ││    │
│  │  │   Multi-platform overlay     ││  │  │ │ Sentiment: +12.3%       ││    │
│  │  │   Zoom & pan enabled         ││  │  │ ├─────────────────────────┤│    │
│  │  │                              ││  │  │ │ Taylor Swift        ○  ││    │
│  │  │   [IG] [TT] [YT] [TW] [All] ││  │  │ │ IG: 280M  TT: 50M       ││    │
│  │  └──────────────────────────────┘│  │  │ └─────────────────────────┘│    │
│  │  [7D] [30D] [90D] [Custom]      │  │  └─────────────────────────────┘    │
│  └──────────────────────────────────┘  └─────────────────────────────────┘    │
│                                                                              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────┐    │
│  │  MARKETING GAPS                  │  │  ACTIVE CAMPAIGNS               │    │
│  │  ┌──────────────────────────────┐│  │  ┌─────────────────────────────┐│    │
│  │  │ 🔴 TikTok audience 18-24     ││  │  │ Era's Tour Promo           ││    │
│  │  │    underserved by 34%       ││  │  │ 12 days left │ 67% of goal ││    │
│  │  │    [View Details]           ││  │  │ [████████░░░░░░░] 67%     ││    │
│  │  ├──────────────────────────────┤│  │  ├─────────────────────────────┤│    │
│  │  │ 🟡 Instagram Reels vs Stories││  │  │ Album Launch Campaign       │    │
│  │  │    Reels underperforming     ││  │  │ 3 days left │ 89% of goal ││    │
│  │  │    [View Details]           ││  │  │ [██████████░░░░] 89%      ││    │
│  │  ├──────────────────────────────┤│  │  └─────────────────────────────┘│    │
│  │  │ 🟢 YouTube Shorts opportunity││  │                                 │    │
│  │  │    Emerging platform gap     ││  │  [+ New Campaign]               │    │
│  │  │    [View Details]           ││  │                                 │    │
│  │  └──────────────────────────────┘│  │                                 │    │
│  │  [Filter: All ▼] [Sort: Impact ▼│  └─────────────────────────────────┘    │
│  └──────────────────────────────────┘                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Talent Profile Detail View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Portfolio                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐  Sabrina Carpenter                                          │
│  │             │  @sabrinacarpenter  ● Instagram Verified                    │
│  │   Avatar    │  60.2M followers │ 892 posts │ Joined 2013                   │
│  │   (150x150) │  ─────────────────────────────────────────────               │
│  │             │  [Instagram] [TikTok] [YouTube] [Spotify] [Twitter]       │
│  └─────────────┘                                                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  PLATFORM BREAKDOWN                    Date Range: [Last 30 Days ▼]  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │  Instagram   │  │    TikTok    │  │   YouTube    │  │ Twitter  │ │    │
│  │  │  60.2M  ▲2%  │  │  40.1M  ▲8%  │  │  12.5M  ▲5% │  │  6.2M ▲1%│ │    │
│  │  │  8.7%  eng   │  │  12.3%  eng  │  │  4.2%   eng  │  │  2.1% eng│ │    │
│  │  │  97.5K posts │  │  1.2K videos │  │  342 videos  │  │  45.2K   │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  CROSS-PLATFORM PERFORMANCE GRAPH                                     │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │                         📈                                       │ │    │
│  │  │                                                                 │ │    │
│  │  │  Combined reach trend line with platform breakdown              │ │    │
│  │  │  Toggle: [Reach] [Engagement] [Followers] [Sentiment]          │ │    │
│  │  │                                                                 │ │    │
│  │  │  Hover to see per-platform values at any point                  │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  │  Drag to select range for detailed analysis                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  TOP PERFORMING CONTENT     │  │  AUDIENCE INSIGHTS                    │ │
│  │  ┌─────────────────────────┐│  │  ┌─────────────────────────────────┐  │ │
│  │  │ 1. "Espresso" Reel      ││  │  │ Demographics                    │  │ │
│  │  │    4.2M likes │ 89K comments│ │  │ ████████████░░░░░░ Female 65% │  │ │
│  │  ├─────────────────────────┤│  │  │ ██████░░░░░░░░░░░░░ Male 35%  │  │ │
│  │  │ 2. Tour Announcement    ││  │  │                                 │  │ │
│  │  │    3.8M likes │ 67K comments│ │  │ Age Distribution                │  │ │
│  │  ├─────────────────────────┤│  │  │ ███░░░ 13-17: 15%              │  │ │
│  │  │ 3. GRAMMY Win Story    ││  │  │ ██████░░░░ 18-24: 34%          │  │ │
│  │  │    3.1M likes │ 102K comments│ │  │ █████████░░░ 25-34: 38%      │  │ │
│  │  └─────────────────────────┘│  │  │ ███░░░ 35-44: 13%             │  │ │
│  │  [View All Content →]       │  │  └─────────────────────────────────┘  │ │
│  └─────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  CAMPAIGNS FEATURING THIS TALENT                                     │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │  Era's Tour Promo  │  Mar 15 - Apr 30  │  ● Active  │  67% ROI  │ │    │
│  │  │  Album Launch      │  May 1 - May 30  │  ○ Upcoming │  —       │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  │  [+ Add to Campaign]                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 KPI Configuration Panel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Configure KPIs for: Sabrina Carpenter                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ACTIVE KPIs                                          [+ Add Custom KPI]    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ≡  Total Reach           gauge │ sum │ IG, TT, YT, TW  │ [⚙] [🗑] │    │
│  │  ≡  Engagement Rate       %     │ avg │ All platforms   │ [⚙] [🗑] │    │
│  │  ≡  Follower Growth        %     │ avg │ All platforms   │ [⚙] [🗑] │    │
│  │  ≡  Sentiment Score        %     │ avg │ IG, TW          │ [⚙] [🗑] │    │
│  │  ≡  Avg. Likes/Post        #     │ avg │ IG, TT          │ [⚙] [🗑] │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  KPI EDITOR                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  KPI Name:                                                            │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │ Total Reach                                                    │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  │                                                                       │    │
│  │  Slug: total_reach (auto-generated, editable)                        │    │
│  │                                                                       │    │
│  │  Description:                                                        │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │ Combined followers + potential reach across all platforms    │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  │                                                                       │    │
│  │  Metric Type:                                                         │    │
│  │  (●) Counter  ( ) Gauge  ( ) Rate  ( ) Percentage  ( ) Currency     │    │
│  │                                                                       │    │
│  │  Aggregation Method:                                                  │    │
│  │  (●) Sum  ( ) Average  ( ) Min  ( ) Max  ( ) Last Value            │    │
│  │                                                                       │    │
│  │  Source Platforms:                                                    │    │
│  │  ☑ Instagram  ☑ TikTok  ☑ YouTube  ☑ Twitter  ☐ LinkedIn  ☐ Facebook │    │
│  │                                                                       │    │
│  │  Display Format:                                                      │    │
│  │  Format: [Compact Number ▼]  Precision: [1 ▼]                        │    │
│  │  Prefix: [    ]  Suffix: [  ]                                        │    │
│  │                                                                       │    │
│  │  Color Thresholds:                                                    │    │
│  │  ┌────────┬────────┬────────────┐                                     │    │
│  │  │  Min   │  Max   │   Color   │                                     │    │
│  │  ├────────┼────────┼────────────┤                                     │    │
│  │  │   0    │  10M   │ 🔴 Red     │ [x]                                  │    │
│  │  │  10M   │  50M   │ 🟡 Yellow  │ [x]                                  │    │
│  │  │  50M   │  ∞     │ 🟢 Green   │ [x]                                  │    │
│  │  └────────┴────────┴────────────┘                                     │    │
│  │  [+ Add Threshold]                                                     │    │
│  │                                                                       │    │
│  │  Preview:                                                              │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │                    124.5M (Green)                             │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  │                                                                       │    │
│  │                              [Cancel]  [Save KPI]                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Component Library Structure

```typescript
// lib/ui/components/

export { DashboardShell }        // Main layout with header, nav, content
export { KPICard }               // Draggable KPI display card
export { KPICardEditor }         // KPI configuration modal
export { KPIRibbon }             // Horizontal scrollable KPI strip
export { MetricChart }           // Time-series chart (recharts-based)
export { PlatformBreakdown }     // Per-platform metric cards
export { TalentCard }            // Talent portfolio item
export { TalentProfileView }     // Full talent detail page
export { GapCard }               // Marketing gap summary card
export { GapDetailPanel }       // Marketing gap analysis
export { CampaignCard }          // Campaign progress card
export { CampaignBuilder }      // Multi-step campaign creation
export { AudienceInsights }      // Demographics visualization
export { ContentGrid }           // Top content display
export { DateRangePicker }      // Flexible date selection
export { PlatformToggle }        // Multi-platform filter
export { TenantSwitcher }       // Brand/talent switcher dropdown
export { WhiteLabelProvider }    // CSS variable injection context
export { useTenantTheme }        // Hook for dynamic theming
export { useKPIs }               // Hook for KPI data fetching
export { useTalent }             // Hook for talent profile data
```

---

## 4. GLOBAL SCALING STRATEGY

### 4.1 Multi-Region Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE GLOBAL NETWORK                          │
│                      (300+ PoPs, Automatic Routing)                        │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────────────┐
        │                            │                                    │
        ▼                            ▼                                    ▼
┌───────────────┐          ┌───────────────┐                 ┌───────────────┐
│   US-East      │          │   EU-West     │                 │   AP-South    │
│   (Primary)    │◄────────►│  (Replica)    │                 │  (Replica)    │
└───────┬───────┘          └───────┬───────┘                 └───────┬───────┘
        │                          │                                    │
        ▼                          ▼                                    ▼
┌───────────────┐          ┌───────────────┐                 ┌───────────────┐
│  Vercel       │          │  Vercel       │                 │  Vercel       │
│  Enterprise   │          │  Enterprise   │                 │  Enterprise   │
│  (us-east-1)  │          │  (eu-west-1)  │                 │  (ap-south-1) │
└───────┬───────┘          └───────┬───────┘                 └───────┬───────┘
        │                          │                                    │
        ▼                          ▼                                    ▼
┌───────────────┐          ┌───────────────┐                 ┌───────────────┐
│  Neon DB      │          │  Neon DB      │                 │  Neon DB      │
│  (Read       │          │  (Read       │                 │  (Read       │
│   Replicas)  │          │   Replicas)  │                 │   Replicas)  │
└───────────────┘          └───────────────┘                 └───────────────┘
        │                          │                                    │
        └──────────────────────────┼────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │     CRDB Global Database      │
                    │   (CockroachDB for master     │
                    │    tenant registry + billing)│
                    └──────────────────────────────┘
```

### 4.2 Global Load Balancer Configuration

```yaml
# cloudflare/load-balancer.yaml
# Terraform configuration for Cloudflare Load Balancer

resource "cloudflare_load_balancer" "omnipulse" {
  name         = "omnipulse-global"
  fallback_pool_id = cloudflare_load_balancer_pool.us_east.id
  description  = "Global load balancer for OmniPulse SaaS"

  # Geo-based routing
  steering_policy = "geo"

  # Pop pools with weight-based traffic distribution
  pools = [
    cloudflare_load_balancer_pool.us_east.id,
    cloudflare_load_balancer_pool.eu_west.id,
    cloudflare_load_balancer_pool.ap_south.id,
  ]

  # Country to pool mapping
  # North America → US-East
  # Europe → EU-West
  # Asia-Pacific → AP-South
  # Default → US-East

  ttl            = 60
  proxied        = true
  enabled        = true
}

resource "cloudflare_load_balancer_pool" "us_east" {
  name = "us-east-omniplulse"
  monitor = cloudflare_load_balancer_monitor.http.id
  origins {
    name    = "vercel-us-east"
    address = "omnipulse-us-east.vercel.app"
    weight  = 1.0
  }
}

resource "cloudflare_load_balancer_pool" "eu_west" {
  name = "eu-west-omniplulse"
  monitor = cloudflare_load_balancer_monitor.http.id
  origins {
    name    = "vercel-eu-west"
    address = "omnipulse-eu-west.vercel.app"
    weight  = 1.0
  }
}

resource "cloudflare_load_balancer_pool" "ap_south" {
  name = "ap-south-omniplulse"
  monitor = cloudflare_load_balancer_monitor.http.id
  origins {
    name    = "vercel-ap-south"
    address = "omnipulse-ap-south.vercel.app"
    weight  = 1.0
  }
}

resource "cloudflare_load_balancer_monitor" "http" {
  type             = "https"
  method           = "GET"
  port             = 443
  path             = "/health"
  interval         = 30
  timeout          = 10
  retries          = 3
  expected_body    = "healthy"
}
```

### 4.3 Multi-Tenant Data Isolation at Scale

```typescript
// lib/tenant/scalable-router.ts

interface TenantRoutingConfig {
  // Regional routing based on tenant's primary region
  regionForTenant: Map<string, 'us-east' | 'eu-west' | 'ap-south'>;

  // Connection pool per region
  pools: Map<string, Pool>;
}

export class ScalableTenantRouter {
  private config: TenantRoutingConfig;
  private neon: NeonQueryFunctionV2;

  constructor(neon: NeonQueryFunctionV2) {
    this.neon = neon;
    this.config = new TenantRoutingConfig();
  }

  // Resolve tenant to regional endpoint
  async getRegionalEndpoint(tenantSlug: string): Promise<URL> {
    // Check in-memory cache first
    const cached = this.regionCache.get(tenantSlug);
    if (cached) return cached;

    // Query master DB for tenant's preferred region
    const result = await this.neon`
      SELECT preferred_region FROM tenants WHERE slug = ${tenantSlug}
    `;

    const region = result[0]?.preferred_region || 'us-east';
    const endpoint = this.getRegionalEndpointURL(region);

    this.regionCache.set(tenantSlug, endpoint);
    return endpoint;
  }

  // Get or create pool for region
  private async getPool(region: string): Promise<Pool> {
    if (this.config.pools.has(region)) {
      return this.config.pools.get(region)!;
    }

    const connectionString = await this.getConnectionString(region);
    const pool = new Pool({
      connectionString,
      max: 10, // Lower per-pool limit since we have multiple pools
      idleTimeoutMillis: 30000,
    });

    this.config.pools.set(region, pool);
    return pool;
  }

  // Execute query for specific tenant
  async executeForTenant<T>(
    tenantSlug: string,
    query: string,
    params: any[] = []
  ): Promise<T[]> {
    // Get tenant's region
    const endpoint = await this.getRegionalEndpoint(tenantSlug);

    // Get or create pool for that region
    const pool = await this.getPool(endpoint.hostname);

    // Set search_path to tenant's schema
    const tenantQuery = `SET search_path TO tenant_${tenantSlug}; ${query}`;
    const result = await pool.query(tenantQuery, params);

    return result.rows as T[];
  }

  // For serverless: use Neon branching instead of connection pooling
  async executeWithNeonBranch<T>(
    tenantSlug: string,
    query: (client: NeonQueryFunctionV2) => Promise<T[]>
  ): Promise<T[]> {
    // Create isolated branch for this tenant
    const branch = await this.neon`CREATE BRANCH IF NOT EXISTS ${`tenant_${tenantSlug}`}`;

    try {
      return await query(this.neon);
    } finally {
      // Branch auto-cleanup after idle timeout
    }
  }
}
```

### 4.4 Horizontal Scaling Configuration

```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: omnipulse-api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: omnipulse-api
  minReplicas: 3
  maxReplicas: 100
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 70
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 10
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60

---
# kubernetes/pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: omnipulse-api-pdb
  namespace: production
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: omnipulse-api
```

### 4.5 Rate Limiting Per Tenant

```typescript
// lib/rate-limit/multi-tenant-limiter.ts

interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  maxRequests: number;    // Max requests per window
  keyGenerator: (req: Request) => string;  // How to identify tenant
}

const TIER_LIMITS = {
  starter: { windowMs: 60_000, maxRequests: 60 },
  professional: { windowMs: 60_000, maxRequests: 300 },
  enterprise: { windowMs: 60_000, maxRequests: 1000 },
} as const;

export class MultiTenantRateLimiter {
  private redis: Redis;
  private configStore: TenantConfigStore;

  constructor(redis: Redis, configStore: TenantConfigStore) {
    this.redis = redis;
    this.configStore = configStore;
  }

  async checkLimit(req: Request): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    const config = await this.configStore.getConfig(tenantSlug);
    const tier = config.tier || 'starter';
    const { windowMs, maxRequests } = TIER_LIMITS[tier];

    const key = `ratelimit:${tenantSlug}:${Math.floor(Date.now() / windowMs)}`;

    const [current, ttl] = await Promise.all([
      this.redis.incr(key),
      this.redis.ttl(key),
    ]);

    const remaining = Math.max(0, maxRequests - current);
    const resetAt = new Date(Date.now() + (ttl > 0 ? ttl * 1000 : windowMs));

    return {
      allowed: current <= maxRequests,
      remaining,
      resetAt,
    };
  }

  // Redis sliding window algorithm for precise rate limiting
  async checkSlidingWindow(req: Request): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    const config = await this.configStore.getConfig(tenantSlug);
    const tier = config.tier || 'starter';
    const { windowMs, maxRequests } = TIER_LIMITS[tier];

    const now = Date.now();
    const windowStart = now - windowMs;
    const key = `ratelimit:sliding:${tenantSlug}`;

    // Remove old entries
    await this.redis.zRemRangeByScore(key, 0, windowStart);

    // Count current requests in window
    const current = await this.redis.zCard(key);

    if (current < maxRequests) {
      // Add this request
      await this.redis.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
      await this.redis.expire(key, Math.ceil(windowMs / 1000));
    }

    const remaining = Math.max(0, maxRequests - current - 1);
    const resetAt = new Date(now + windowMs);

    return {
      allowed: current < maxRequests,
      remaining,
      resetAt,
    };
  }
}
```

### 4.6 Caching Strategy for Global Performance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OMNIPULSE CACHING HIERARCHY                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  L1: Vercel Edge Cache (CDN)                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  TTL: 60 seconds (public), 5 minutes (authenticated)                  ││
│  │  Scope: Static assets, public dashboards (with auth header strip)     ││
│  │  Invalidation: On-demand via purge API                                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  L2: Upstash Redis (Regional)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  TTL: 5 minutes (config), 15 minutes (metrics), 1 hour (trends)      ││
│  │  Scope: Tenant-specific data, user sessions, feature flags            ││
│  │  Pattern: Cache-aside with write-through for configs                   ││
│  │  Key Format: omnipulse:{tenant}:{data_type}:{id}                       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  L3: Neon PostgreSQL (Per-Tenant)                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Connection: Branch per tenant (Neon serverless)                      ││
│  │  Prepared statements cached per connection                             ││
│  │  Read replicas for query-heavy tenants                                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  CACHE COHERSCENCE:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Write → Invalidate L1 & L2 → Async write to L3                       ││
│  │  Read  → L1 miss → L2 miss → L3 → Populate L2 → Populate L1 (if public)││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. IMPLEMENTATION PHASES

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up Neon database with multi-tenant schema
- [ ] Implement TenantConfigStore with Redis
- [ ] Build white-label CSS variable injection system
- [ ] Create base UI component library (Button, Card, Input, etc.)
- [ ] Implement Clerk authentication with multi-tenant support
- [ ] Build tenant onboarding API (`POST /api/tenants`)

### Phase 2: Core Features (Weeks 5-8)
- [ ] Implement TenantConnectionRouter for per-tenant DB access
- [ ] Build dynamic KPI definition and storage system
- [ ] Create customizable dashboard with drag-and-drop KPIs
- [ ] Implement talent profile management (CRUD)
- [ ] Build platform account connection flow
- [ ] Create metrics aggregation and time-series storage

### Phase 3: Analytics (Weeks 9-12)
- [ ] Implement cross-platform analytics engine
- [ ] Build trend extraction and visualization
- [ ] Create marketing gap identification algorithm
- [ ] Implement prediction models (followers, engagement)
- [ ] Build campaign ROI tracking
- [ ] Create customizable chart components

### Phase 4: Enterprise Features (Weeks 13-16)
- [ ] Multi-region deployment configuration
- [ ] Global load balancer setup
- [ ] Advanced rate limiting per tenant
- [ ] Audit logging system
- [ ] Data export (CSV, PDF, JSON)
- [ ] Webhook notifications for alerts

### Phase 5: Optimization (Weeks 17-20)
- [ ] Performance optimization and profiling
- [ ] Cache warming for high-traffic tenants
- [ ] CDN optimization
- [ ] Database query optimization
- [ ] Monitoring and alerting refinement
- [ ] Load testing and chaos engineering

---

## 6. SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to First Dashboard | < 5 min | Onboarding flow completion |
| API P99 Latency | < 200ms | APM tracking |
| Cache Hit Rate | > 90% | Redis metrics |
| Dashboard Load Time | < 2s (P95) | Real user monitoring |
| Tenant Provisioning | < 30s | Automated provisioning |
| Uptime | 99.95% | External monitoring |
| Error Rate | < 0.1% | Error tracking |

---

*Document Version: 1.0*
*Last Updated: April 29, 2026*
*Classification: Internal - Technical Planning*
