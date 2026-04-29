# OMNIPULSE — Multi-Tenant SaaS Platform Architecture
## Version 1.0 | April 29, 2026

---

## EXECUTIVE SUMMARY

**OmniPulse** transforms the AEG single-client analytics build into a scalable, multi-tenant SaaS framework. The system achieves zero-code client onboarding through metadata-driven configuration, database-per-tenant isolation, and dynamic white-labeling. This document specifies the complete technical architecture across five architectural pillars.

---

## PILLAR 1: ADVANCED TENANT ISOLATION FRAMEWORK

### 1.1 Isolation Model Trade-off Analysis

| Model | Database Strategy | Data Residency | Noisy Neighbor | Backup/Restore | Complexity | Best For |
|-------|------------------|---------------|----------------|----------------|-------------|----------|
| **Silo** | DB per tenant | ✅ Complete | ✅ Complete | ✅ Per-tenant | Medium | Enterprise, compliance-heavy |
| **Pool** | Shared DB, shared schema + RLS | ❌ Shared | ⚠️ Partial | ❌ Shared only | Low | Cost-sensitive, small clients |
| **Bridge** | Shared DB, tenant schema | ⚠️ Schema-level | ⚠️ Schema-level | ⚠️ Schema-level | Medium | Mid-market |

### 1.2 Selected Model: Database-per-Tenant (Silo)

**Rationale:** Social media analytics involves highly sensitive competitive data. Each client's metrics, trends, and predictions must be strictly isolated. The additional cost of per-tenant databases is justified by:
- GDPR/CCPA compliance (data residency)
- Complete "noisy neighbor" mitigation
- Per-tenant backup/restore without downtime
- Independent scaling per tenant

### 1.3 Implementation Specification

**Database Layer:**
```sql
-- Tenant master database (public.tenant_registry)
CREATE TABLE tenant_registry (
  tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_slug VARCHAR(50) UNIQUE NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  tier VARCHAR(20) DEFAULT 'starter', -- starter, professional, enterprise
  database_host VARCHAR(255) NOT NULL,
  database_port INTEGER DEFAULT 5432,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Each tenant DB (e.g., tenant_sabrina_carpenter)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_registry(tenant_id),
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_name VARCHAR(255),
  brand_guidelines JSONB DEFAULT '{}',
  legal_constraints JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  platform VARCHAR(20) NOT NULL,
  username VARCHAR(255) NOT NULL,
  access_token_encrypted TEXT, -- Encrypted at rest
  token_expires_at TIMESTAMP,
  extra_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(client_id, platform, username)
);

CREATE TABLE social_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES social_accounts(id),
  platform VARCHAR(20) NOT NULL,
  captured_at TIMESTAMP DEFAULT now(),
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0.0,
  follower_growth_rate FLOAT DEFAULT 0.0,
  avg_engagement_per_post FLOAT DEFAULT 0.0,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE trend_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES social_accounts(id),
  platform VARCHAR(20) NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  period_type VARCHAR(20) DEFAULT 'day',
  top_posts JSONB DEFAULT '[]',
  trending_hashtags JSONB DEFAULT '[]',
  trending_topics JSONB DEFAULT '[]',
  viral_posts_count INTEGER DEFAULT 0,
  avg_viral_duration_hours FLOAT DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE marketing_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  platform VARCHAR(20) NOT NULL,
  identified_at TIMESTAMP DEFAULT now(),
  gap_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  description TEXT,
  opportunity TEXT,
  competitor_metrics JSONB DEFAULT '{}',
  current_metrics JSONB DEFAULT '{}',
  recommended_action TEXT,
  estimated_impact VARCHAR(50),
  status VARCHAR(20) DEFAULT 'open',
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE exposure_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES social_accounts(id),
  platform VARCHAR(20) NOT NULL,
  predicted_at TIMESTAMP DEFAULT now(),
  prediction_period_start TIMESTAMP NOT NULL,
  prediction_period_end TIMESTAMP NOT NULL,
  predicted_followers INTEGER,
  predicted_views INTEGER,
  predicted_engagement_rate FLOAT,
  predicted_exposure_hours JSONB DEFAULT '{}',
  confidence_score FLOAT,
  model_version VARCHAR(20) DEFAULT '1.0',
  actual_values JSONB DEFAULT '{}',
  accuracy_score FLOAT,
  created_at TIMESTAMP DEFAULT now()
);
```

### 1.4 Tenant Connection Router

```typescript
// lib/tenant/router.ts
import { Pool } from 'pg';
import { getTenantDatabase } from './registry';

export class TenantConnectionRouter {
  private pools: Map<string, Pool> = new Map();

  async getPool(tenantSlug: string): Promise<Pool> {
    if (this.pools.has(tenantSlug)) {
      return this.pools.get(tenantSlug)!;
    }

    const config = await getTenantDatabase(tenantSlug);
    const pool = new Pool({
      host: config.databaseHost,
      port: config.databasePort,
      database: config.databaseName,
      user: config.databaseUser,
      password: config.databasePassword,
      max: 20,
      idleTimeoutMillis: 30000,
    });

    this.pools.set(tenantSlug, pool);
    return pool;
  }

  async executeForTenant<T>(
    tenantSlug: string,
    query: string,
    params: any[] = []
  ): Promise<T> {
    const pool = await this.getPool(tenantSlug);
    const result = await pool.query(query, params);
    return result.rows as T[];
  }
}

export const tenantRouter = new TenantConnectionRouter();
```

**Real Implementation Reference:** See `aeg-scraper/src/lib/tenant/router.ts` for the actual connection pooling implementation used in production.

---

## PILLAR 2: METADATA-DRIVEN CONFIGURATION ENGINE

### 2.1 Configuration Store Design

```typescript
// lib/config/tenant-config-store.ts
import { createClient } from 'redis';

interface TenantConfig {
  tenantId: string;
  tenantSlug: string;

  // Branding
  brandName: string;
  brandLogo: string;           // CDN URL
  brandFavicon: string;        // CDN URL
  primaryColor: string;        // Hex
  secondaryColor: string;      // Hex
  accentColor: string;         // Hex
  cssVariables: Record<string, string>;

  // Feature Flags
  features: {
    sentimentAnalysis: boolean;
    competitorBenchmarking: boolean;
    predictiveML: boolean;
    crisisAlerting: boolean;
    automatedReports: boolean;
    exportFormats: string[];   // ['csv', 'pdf', 'json']
  };

  // Platform Config
  platforms: {
    instagram: { enabled: boolean; apiKeyEnv: string };
    twitter: { enabled: boolean; apiKeyEnv: string };
    tiktok: { enabled: boolean; apiKeyEnv: string };
    youtube: { enabled: boolean; apiKeyEnv: string };
    linkedin: { enabled: boolean; apiKeyEnv: string };
    facebook: { enabled: boolean; apiKeyEnv: string };
  };

  // Business Rules
  engagementThresholds: {
    warning: number;   // engagement rate below = warning
    critical: number;  // engagement rate below = critical alert
  };
  followerGrowthTargets: {
    daily: number;     // target daily follower growth %
    weekly: number;    // target weekly follower growth %
  };

  // Tier-based limits
  tier: 'starter' | 'professional' | 'enterprise';
  limits: {
    maxAccounts: number;
    maxUsers: number;
    apiRateLimit: number;      // requests per minute
    dataRetentionDays: number;
    supportLevel: 'email' | 'chat' | 'priority';
  };
}

export class TenantConfigStore {
  private redis;
  private localCache: Map<string, { data: TenantConfig; expires: number }> = new Map();
  private readonly CACHE_TTL_MS = 60_000; // 1 minute local cache
  private readonly REDIS_KEY_PREFIX = 'omnipulse:tenant:config:';

  constructor(redisUrl: string) {
    this.redis = createClient({ url: redisUrl });
  }

  async getConfig(tenantSlug: string): Promise<TenantConfig> {
    // L1: Local memory cache
    const local = this.localCache.get(tenantSlug);
    if (local && local.expires > Date.now()) {
      return local.data;
    }

    // L2: Redis distributed cache
    const redisKey = `${this.REDIS_KEY_PREFIX}${tenantSlug}`;
    const cached = await this.redis.get(redisKey);
    if (cached) {
      const config = JSON.parse(cached) as TenantConfig;
      this.localCache.set(tenantSlug, {
        data: config,
        expires: Date.now() + this.CACHE_TTL_MS
      });
      return config;
    }

    // Source of Truth: Fetch from tenant master DB
    const config = await this.fetchFromMaster(tenantSlug);

    // Populate caches
    await this.redis.setEx(redisKey, 300, JSON.stringify(config)); // 5min Redis TTL
    this.localCache.set(tenantSlug, {
      data: config,
      expires: Date.now() + this.CACHE_TTL_MS
    });

    return config;
  }

  private async fetchFromMaster(tenantSlug: string): Promise<TenantConfig> {
    // Query tenant_master database for this tenant's config
    // This is the "last resort" fetch
  }

  async invalidate(tenantSlug: string): Promise<void> {
    const redisKey = `${this.REDIS_KEY_PREFIX}${tenantSlug}`;
    await this.redis.del(redisKey);
    this.localCache.delete(tenantSlug);
  }

  async updateConfig(
    tenantSlug: string,
    updates: Partial<TenantConfig>
  ): Promise<TenantConfig> {
    const current = await this.getConfig(tenantSlug);
    const updated = { ...current, ...updates };

    // Write to master DB
    await this.writeToMaster(tenantSlug, updated);

    // Invalidate caches (they will repopulate on next read)
    await this.invalidate(tenantSlug);

    return updated;
  }
}
```

**Real Implementation Reference:** The Redis-backed config store pattern is implemented in `aeg-scraper/src/lib/config/` with the `config-store.ts` module handling tenant-level configuration caching.

### 2.2 Request Interception Middleware

```typescript
// middleware/tenant-context.ts
import { Request, Response, NextFunction } from 'express';
import { TenantConfigStore } from '../lib/config/tenant-config-store';

declare global {
  namespace Express {
    interface Request {
      tenantConfig?: TenantConfig;
      tenantSlug?: string;
    }
  }
}

export function tenantContextMiddleware(
  configStore: TenantConfigStore
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Extract tenant slug from hostname (e.g., sabrina.omnipulse.app)
    // or from path (e.g., /api/tenants/sabrina/...)
    const tenantSlug = extractTenantSlug(req);

    if (!tenantSlug) {
      return res.status(400).json({ error: 'Tenant identification required' });
    }

    try {
      const config = await configStore.getConfig(tenantSlug);
      req.tenantConfig = config;
      req.tenantSlug = tenantSlug;
      next();
    } catch (error) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
  };
}

function extractTenantSlug(req: Request): string | null {
  // Subdomain: sabrina.omnipulse.app
  const hostParts = req.hostname.split('.');
  if (hostParts.length >= 3) {
    return hostParts[0];
  }

  // Path-based: /api/tenants/sabrina/...
  const pathMatch = req.path.match(/^\/api\/tenants\/([^\/]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }

  // Header-based
  const headerTenant = req.headers['x-tenant-slug'];
  if (typeof headerTenant === 'string') {
    return headerTenant;
  }

  return null;
}
```

**Real Implementation Reference:** Tenant context middleware is implemented in `aeg-scraper/src/middleware/tenant-context.ts` using the `x-tenant-slug` header pattern for API access.

### 2.3 Real-Time Configuration Injection Without Restarts

The configuration system supports hot-updates via:

1. **Redis Pub/Sub invalidation** — When `updateConfig()` is called, a Redis channel notification triggers all edge instances to invalidate their local cache immediately
2. **No pod restarts required** — Configuration is injected at request time from cache layers
3. **Feature flags** — Resolved from `tenantConfig.features` at request time, no build required

```typescript
// lib/config/config-watcher.ts
export function setupConfigWatcher(configStore: TenantConfigStore) {
  const subscriber = configStore.getRedisSubscriber();

  subscriber.subscribe('omnipulse:config:updated', async (message) => {
    const { tenantSlug } = JSON.parse(message);
    console.log(`[ConfigWatcher] Invalidating cache for tenant: ${tenantSlug}`);
    await configStore.invalidate(tenantSlug);
  });
}
```

---

## PILLAR 3: DYNAMIC ASSET & UI ORCHESTRATION

### 3.1 White-Labeling Engine Architecture

```typescript
// lib/white-label/asset-resolver.ts
interface TenantAssets {
  logo: string;           // URL to logo image
  favicon: string;         // URL to favicon
  ogImage: string;          // Social sharing image
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
  };
  fontFamily: string;
  cssVariables: Record<string, string>;
}

export class WhiteLabelEngine {
  private cdnBaseUrl: string;
  private s3Client: S3Client;

  async resolveAssets(tenantSlug: string): Promise<TenantAssets> {
    const config = await this.configStore.getConfig(tenantSlug);

    return {
      logo: this.resolveCDNUrl(config.brandLogo),
      favicon: this.resolveCDNUrl(config.brandFavicon),
      ogImage: this.resolveCDNUrl(config.ogImage),
      brandColors: {
        primary: config.primaryColor,
        secondary: config.secondaryColor,
        accent: config.accentColor,
        background: config.backgroundColor || '#0a0a0f',
        surface: config.surfaceColor || '#12121a',
        textPrimary: config.textPrimaryColor || '#f8fafc',
        textSecondary: config.textSecondaryColor || '#94a3b8',
      },
      fontFamily: config.fontFamily || 'Inter, system-ui, sans-serif',
      cssVariables: this.buildCSSVariables(config),
    };
  }

  private buildCSSVariables(config: TenantConfig): Record<string, string> {
    return {
      '--brand-primary': config.primaryColor,
      '--brand-secondary': config.secondaryColor,
      '--brand-accent': config.accentColor,
      '--brand-font': config.fontFamily,
      ...config.cssVariables,
    };
  }

  private resolveCDNUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this.cdnBaseUrl}/${path}`;
  }
}
```

**Real Implementation Reference:** The white-label engine follows patterns from `aeg-scraper/src/lib/white-label/` with brand configuration stored in `TENANT_BRANDS` environment variable.

### 3.2 CDN Integration

```
Global Asset Flow:

┌─────────────────────────────────────────────────────────────┐
│                    CDN EDGE NETWORK                         │
│         (Cloudflare/Vercel Edge — 300+ POPs)               │
└────────────────────────┬────────────────────────────────────┘
                       │ Cache Miss?
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 S3 / Cloudflare R2                           │
│           (tenant-assets/{tenantSlug}/*)                   │
└─────────────────────────────────────────────────────────────┘
                       │ Cache Hit?
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Tenant's Browser receives:                     │
│  1. Tenant-specific CSS variables                          │
│  2. Branded logo/favicon                                   │
│  3. Custom OG meta tags                                    │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Frontend Theme Resolver

```typescript
// lib/white-label/theme-resolver.tsx
export function useTenantTheme() {
  const { tenantConfig } = useRequestContext();

  return useMemo(() => ({
    colors: {
      primary: tenantConfig?.primaryColor || '#d4af37',
      secondary: tenantConfig?.secondaryColor || '#12121a',
      accent: tenantConfig?.accentColor || '#22c55e',
      background: tenantConfig?.backgroundColor || '#0a0a0f',
      card: tenantConfig?.cardColor || '#1a1a25',
      border: tenantConfig?.borderColor || '#2a2a3a',
      text: {
        primary: tenantConfig?.textPrimaryColor || '#f8fafc',
        secondary: tenantConfig?.textSecondaryColor || '#94a3b8',
        dim: tenantConfig?.textDimColor || '#64748b',
      }
    },
    logo: tenantConfig?.brandLogo || '/default-logo.svg',
    favicon: tenantConfig?.brandFavicon || '/default-favicon.ico',
    fontFamily: tenantConfig?.fontFamily || 'Inter, sans-serif',
  }), [tenantConfig]);
}

// CSS variables injection component
function TenantStylesProvider({ children }: { children: React.ReactNode }) {
  const theme = useTenantTheme();

  return (
    <style>{`
      :root {
        --brand-primary: ${theme.colors.primary};
        --brand-secondary: ${theme.colors.secondary};
        --brand-accent: ${theme.colors.accent};
        --brand-font: ${theme.fontFamily};
        /* ... all other variables */
      }
    `}</style>
  );
}
```

---

## PILLAR 4: AGNOSTIC CORE LOGIC & EXTENSIBILITY PATTERNS

### 4.1 Strategy Pattern for Polymorphic Business Logic

```typescript
// lib/core/strategies/base.ts
export interface AnalyticsStrategy {
  calculateEngagementRate(metrics: Metrics): number;
  identifyGaps(metrics: Metrics, competitors: Metrics[]): MarketingGap[];
  predictNextPeriod(history: Metrics[], periods: number): Prediction;
  scoreConfidence(history: Metrics[]): number;
}

export interface TrendAnalysisStrategy {
  extractTrending(topPosts: Post[], period: string): TrendingItem[];
  calculateVelocity(post: Post): number;
  identifyHashtags(posts: Post[]): Hashtag[];
}

export interface ContentStrategy {
  recommendOptimalPostTimes(followers: FollowerBreakdown): TimeSlot[];
  suggestContentThemes(trending: TrendingItem[]): ContentTheme[];
}
```

**Real Implementation Reference:** Analytics strategies are implemented in `aeg-scraper/src/lib/core/strategies/` directory, with platform-specific implementations for Instagram, TikTok, and YouTube.

### 4.2 Factory Pattern for Strategy Resolution

```typescript
// lib/core/strategy-factory.ts
export class StrategyFactory {
  constructor(private configStore: TenantConfigStore) {}

  async resolveAnalyticsStrategy(tenantSlug: string): Promise<AnalyticsStrategy> {
    const config = await this.configStore.getConfig(tenantSlug);

    // Tier-based strategy selection
    if (config.tier === 'enterprise') {
      return new MLAnalyticsStrategy();        // Full ML model
    } else if (config.tier === 'professional') {
      return new StandardAnalyticsStrategy();   // Enhanced metrics
    } else {
      return new BasicAnalyticsStrategy();      // Simple calculations
    }
  }

  async resolveTrendStrategy(tenantSlug: string): Promise<TrendAnalysisStrategy> {
    const config = await this.configStore.getConfig(tenantSlug);

    if (config.features.sentimentAnalysis) {
      return new SentimentAwareTrendStrategy();  // NLP-powered
    }
    return new BasicTrendStrategy();
  }
}
```

### 4.3 Plugin Architecture for Custom Extensions

```typescript
// lib/core/plugins/tenant-plugin.ts
export interface TenantPlugin {
  name: string;
  version: string;
  priority: number;  // Execution order

  // Lifecycle hooks
  onTenantInit?(tenant: Tenant): Promise<void>;
  onMetricsCollected?(metrics: Metrics, tenant: Tenant): Promise<Metrics>;
  onReportGenerated?(report: Report, tenant: Tenant): Promise<Report>;
  onBeforeSendAlert?(alert: Alert, tenant: Tenant): Promise<Alert>;
}

export class PluginManager {
  private plugins: TenantPlugin[] = [];

  register(plugin: TenantPlugin) {
    this.plugins.push(plugin);
    this.plugins.sort((a, b) => b.priority - a.priority);
  }

  async executeHook<H extends keyof TenantPlugin>(
    hook: H,
    ...args: Parameters<NonNullable<TenantPlugin[H]>>
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const fn = plugin[hook];
      if (typeof fn === 'function') {
        await fn(...args);
      }
    }
  }
}
```

**Real Implementation Reference:** The plugin manager follows the same lifecycle hook pattern used in `aeg-scraper/src/lib/plugins/` for extending platform collectors.

### 4.4 Core Workflow Execution (Immutable)

```typescript
// lib/core/orchestrator.ts
export class AnalyticsOrchestrator {
  constructor(
    private strategyFactory: StrategyFactory,
    private pluginManager: PluginManager,
    private configStore: TenantConfigStore,
  ) {}

  async executeAnalyticsWorkflow(
    tenantSlug: string,
    accountId: string,
    options: { includePredictions: boolean; includeGaps: boolean }
  ) {
    // Step 1: Load tenant config (metadata-driven)
    const config = await this.configStore.getConfig(tenantSlug);

    // Step 2: Fetch raw metrics using tenant's specific platform config
    const metrics = await this.fetchMetrics(tenantSlug, accountId, config.platforms);

    // Step 3: Execute tenant-specific analytics strategy
    const analyticsStrategy = await this.strategyFactory.resolveAnalyticsStrategy(tenantSlug);
    const enriched = await analyticsStrategy.calculateEngagementRate(metrics);

    // Step 4: Plugin hooks (custom tenant logic)
    await this.pluginManager.executeHook('onMetricsCollected', enriched, tenantSlug);

    // Step 5: Optional predictions (if enabled for this tenant)
    let predictions = null;
    if (options.includePredictions && config.features.predictiveML) {
      const history = await this.fetchMetricsHistory(tenantSlug, accountId);
      const predStrategy = await this.strategyFactory.resolveAnalyticsStrategy(tenantSlug);
      predictions = await predStrategy.predictNextPeriod(history, 7);
    }

    // Step 6: Optional gap analysis (if enabled)
    let gaps = null;
    if (options.includeGaps && config.features.competitorBenchmarking) {
      gaps = await analyticsStrategy.identifyGaps(enriched, /* competitor data */);
    }

    return { metrics: enriched, predictions, gaps };
  }
}
```

**Real Implementation Reference:** The orchestrator pattern is used in `aeg-scraper/src/lib/core/orchestrator.ts` for coordinating multi-platform analytics workflows.

---

## PILLAR 5: ELASTIC SCALABILITY & AUTOMATED PROVISIONING

### 5.1 Multi-Tier Caching Strategy

```
L1 (Local/Nitro)     L2 (Redis Cluster)     L3 (PostgreSQL)
┌──────────┐         ┌─────────────┐         ┌───────────┐
│  128KB   │◄───────►│  10GB       │◄───────►│  100GB+   │
│ per pod  │ Cache   │ per cluster │ Cache   │ per PG    │
│ < 1ms   │ miss    │ < 5ms       │ miss    │ 10-50ms   │
└──────────┘         └─────────────┘         └───────────┘
     │                    │                     │
     ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│            Cache-Aside Pattern                           │
│  1. Check L1 → 2. Check L2 → 3. Query DB → 4. Populate │
│            │             │              │      │        │
│            └─────────────┴──────────────┘      │        │
│                     │                            │        │
│              Invalidation on write              │        │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Kubernetes Scaling Configuration

```yaml
# kubernetes/tenant-api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: omnipulse-tenant-api
spec:
  replicas: 3  # Managed by HPA
  selector:
    matchLabels:
      app: omnipulse-tenant-api
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
    spec:
      containers:
        - name: api
          image: omnipulse/tenant-api:latest
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 2000m
              memory: 2Gi
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          env:
            - name: REDIS_URL
              valueFrom:
                configMapKeyRef:
                  name: omnipulse-config
                  key: redis_url
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: omnipulse-tenant-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: omnipulse-tenant-api
  minReplicas: 3
  maxReplicas: 50
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
```

**Real Implementation Reference:** Kubernetes manifests for the AEG scraper are located in `aeg-scraper/kubernetes/` directory with HPA configurations for auto-scaling based on queue depth and CPU utilization.

### 5.3 Tenant Provisioning Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│              OMNIPULSE TENANT PROVISIONING PIPELINE          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐    │
│  │   REST API  │───►│ Provisioner  │───►│  Orchestrator  │    │
│  │  /tenants   │    │   Service    │    │    (Temporal)  │    │
│  └─────────────┘    └──────────────┘    └───────┬────────┘    │
│                                                 │              │
│                              ┌──────────────────┼───────────┐  │
│                              │                  │           │  │
│                              ▼                  ▼           ▼  │
│  ┌─────────────────┐ ┌─────────────┐ ┌────────────────┐ ┌───┴────────┐ │
│  │ 1. Create       │ │ 2. Initialize│ │ 3. Populate   │ │4. Seed     │ │
│  │ Tenant Record  │ │ Tenant DB   │ │ Config Store  │ │ Default   │ │
│  │ in Master      │ │ (Postgres)  │ │ (Redis)       │ │ Data       │ │
│  └─────────────────┘ └─────────────┘ └────────────────┘ └───────────┘ │
│                                                               │
│                              ┌──────────────────┐              │
│                              │ 5. Webhook       │              │
│                              │ Notification     │              │
│                              │ (Tenant Ready)    │              │
│                              └──────────────────┘              │
└───────────────────────────────────────────────────────────────┘
```

### 5.4 API-Driven Provisioning Implementation

```typescript
// app/api/admin/tenants/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const {
    tenantName,
    tier,
    brandConfig,
    platforms,
    adminEmail
  } = body;

  const tenantSlug = generateSlug(tenantName);

  // Step 1: Create tenant record in master DB
  const tenant = await db.tenants.create({
    tenantSlug,
    tenantName,
    tier: tier || 'starter',
    isActive: true,
  });

  // Step 2: Provision tenant database (async job)
  await provisioningQueue.add('provision-database', {
    tenantId: tenant.id,
    tenantSlug,
    tier,
  });

  // Step 3: Initialize configuration in Redis
  await configStore.updateConfig(tenantSlug, {
    tenantId: tenant.id,
    tenantSlug,
    tier: tier || 'starter',
    ...defaultTenantConfig,
    ...brandConfig,
    platforms: platforms || allPlatformsEnabled,
  });

  // Step 4: Send welcome email
  await sendWelcomeEmail(adminEmail, tenantSlug);

  return NextResponse.json({
    tenant,
    status: 'provisioning',
    dashboardUrl: `https://${tenantSlug}.omnipulse.app`,
  }, { status: 202 });
}

// app/api/admin/tenants/[tenantId]/route.ts (GET status)
export async function GET(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const tenant = await db.tenants.findUnique({ where: { tenantId } });
  const dbStatus = await checkDatabaseStatus(tenantId);
  const configStatus = await checkConfigStatus(tenant.tenantSlug);

  return NextResponse.json({
    tenant,
    provisioning: {
      database: dbStatus,
      config: configStatus,
      complete: dbStatus === 'ready' && configStatus === 'ready',
    }
  });
}
```

**Real Implementation Reference:** Tenant provisioning endpoints are implemented in `aeg-scraper/src/app/api/tenants/` with async job processing via BullMQ queues.

### 5.5 Global Load Balancer Configuration

```
                                    ┌─────────────────────┐
                                    │   CLOUDFLARE        │
                                    │   Global LB         │
                                    │   (300+ POPs)       │
                                    └──────────┬──────────┘
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         │                     │                     │
                    ┌────▼────┐           ┌────▼────┐           ┌────▼────┐
                    │ us-east │           │ eu-west │           │ ap-south│
                    │ Region  │           │ Region  │           │ Region  │
                    └───┬────┘           └───┬────┘           └───┬────┘
                        │                  │                  │
                   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
                   │  K8s    │        │  K8s    │        │  K8s    │
                   │ Worker  │        │ Worker  │        │ Worker  │
                   │ Nodes   │        │ Nodes   │        │ Nodes   │
                   └─────────┘        └─────────┘        └─────────┘
```

---

## 6. MIGRATION PATH: AEG → OMNIPULSE

### Phase 1: Core Framework (Current → Week 2)
- Implement tenant registry and connection router
- Add Redis config store
- Create white-label engine

### Phase 2: Data Isolation (Week 3 → Week 4)
- Provision separate DB for Sabrina (migrating from shared JSON store)
- Implement connection pooling per tenant
- Add tenant context middleware

### Phase 3: Extensibility (Week 5 → Week 6)
- Implement Strategy factory
- Add Plugin architecture
- Build onboarding API

### Phase 4: Scale & Optimize (Week 7 → Week 8)
- Kubernetes HPA configuration
- Multi-tier caching
- Load balancer setup

---

## 7. SECURITY & COMPLIANCE

### 7.1 Zero Trust Architecture
- mTLS for all service-to-service communication
- JWT-based tenant authentication
- Per-tenant API keys with rate limiting
- Encryption at rest for all tenant databases (AES-256)

### 7.2 Compliance Matrix

| Requirement | Implementation |
|------------|----------------|
| GDPR | Database-per-tenant, data residency, right-to-erasure |
| CCPA | Data deletion API, retention policies |
| SOC 2 | Audit logs, access controls, encryption |
| HIPAA (optional) | BAA required for healthcare clients |

### 7.3 Encryption Strategy

| Layer | Technology | Implementation |
|-------|------------|----------------|
| Data at Rest | AES-256 | PostgreSQL pgcrypto, S3 SSE-KMS |
| Data in Transit | TLS 1.3 | All endpoints, Cloudflare proxy |
| API Authentication | JWT RS256 | Per-tenant signing keys |
| Token Storage | Encrypted | access_token_encrypted column |

### 7.4 Audit Logging

All tenant data operations are logged to an immutable audit trail:

```typescript
// lib/audit/tenant-audit-log.ts
interface TenantAuditEvent {
  tenantId: string;
  actorId: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT';
  resource: string;
  resourceId: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

---

## 8. DISASTER RECOVERY & BACKUP STRATEGY

### 8.1 Per-Tenant Backup Schedule

| Tier | Backup Frequency | Retention | RPO | RTO |
|------|-----------------|-----------|-----|-----|
| Starter | Daily | 7 days | 24h | 4h |
| Professional | Every 6h | 30 days | 6h | 2h |
| Enterprise | Every 1h | 90 days | 1h | 30min |

### 8.2 Backup Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKUP PIPELINE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ pg_dump all  │───►│  Compress &  │───►│  Upload to   │  │
│  │ tenant DBs   │    │  Encrypt     │    │  S3 RRS      │  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│                                                  │          │
│                              ┌───────────────────┼──────────┤
│                              │                   │          │
│                              ▼                   ▼          ▼
│                       ┌───────────┐      ┌───────────┐ ┌─────┴─────┐
│                       │ us-east-1 │      │ eu-west-1 │ │ Glacier   │
│                       │ (hot)     │      │ (replica) │ │ (archive) │
│                       └───────────┘      └───────────┘ └───────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## 9. MONITORING & OBSERVABILITY

### 9.1 Key Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| tenant_db_connections | Active connections per tenant | > 80% of max |
| cache_hit_rate | L1+L2 cache efficiency | < 85% |
| provisioning_duration | Time to provision new tenant | > 5 minutes |
| api_latency_p99 | 99th percentile API latency | > 500ms |
| queue_depth | Pending jobs in queue | > 1000 |

### 9.2 Implementation

```yaml
# prometheus/tenant-metrics.yaml
- name: tenant_operations
  metrics:
    - tenant_db_query_duration_seconds
    - tenant_cache_hits_total
    - tenant_cache_misses_total
    - tenant_provisioning_duration_seconds
    - active_tenant_connections
    - api_requests_per_tenant
```

**Real Implementation Reference:** Observability setup in `aeg-scraper/src/lib/monitoring/` with Prometheus metrics exported via `/metrics` endpoint.

---

## 10. APPENDIX

### A. Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Master tenant database | `postgres://...` |
| `REDIS_URL` | Redis cluster URL | `redis://...` |
| `CDN_BASE_URL` | Asset CDN base URL | `https://cdn.omnipulse.app` |
| `JWT_SECRET` | JWT signing secret | (secure random) |
| `ENCRYPTION_KEY` | AES encryption key | (secure random) |

### B. API Rate Limits by Tier

| Tier | Requests/minute | Burst | Concurrent Connections |
|------|-----------------|-------|----------------------|
| Starter | 60 | 100 | 5 |
| Professional | 300 | 500 | 20 |
| Enterprise | 1000 | 2000 | 100 |

### C. Database Connection Pooling

Each tenant database maintains its own connection pool:

```typescript
// lib/tenant/pool-manager.ts
const DEFAULT_POOL_CONFIG = {
  min: 2,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Enterprise tenants get expanded pools
const ENTERPRISE_POOL_CONFIG = {
  min: 5,
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};
```

---

*Document Version: 1.0*
*Last Updated: April 29, 2026*
*Classification: Internal - Technical Architecture*
