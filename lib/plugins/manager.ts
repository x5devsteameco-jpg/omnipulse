import type { TenantTier } from '@/lib/types/tenant';

export type PluginHook =
  | 'onTenantInit'
  | 'onTenantActivate'
  | 'onTenantDeactivate'
  | 'onMetricsCollected'
  | 'onMetricsProcessed'
  | 'onReportGenerated'
  | 'onBeforeSendAlert'
  | 'onCampaignCreated'
  | 'onCampaignCompleted'
  | 'onGapIdentified'
  | 'onPredictionGenerated';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  tier: TenantTier;
  isActive: boolean;
}

export interface Metrics {
  followersCount: number;
  followingCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  viewsCount: number;
  postsCount: number;
  engagementRate: number;
  followerGrowthRate: number;
  avgEngagementPerPost: number;
}

export interface Report {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  generatedAt: string;
  metrics?: Record<string, unknown>;
}

export interface Alert {
  id: string;
  tenantId: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

export interface MarketingGap {
  id: string;
  tenantId: string;
  type: string;
  severity: string;
  title: string;
  description: string;
}

export interface Prediction {
  id: string;
  tenantId: string;
  accountId: string;
  predictionType: string;
  predictedValue: number;
  confidenceScore: number;
}

export interface TenantPlugin {
  name: string;
  version: string;
  priority: number;
  hooks: PluginHook[];

  onTenantInit?(tenant: Tenant): Promise<void>;
  onTenantActivate?(tenant: Tenant): Promise<void>;
  onTenantDeactivate?(tenant: Tenant): Promise<void>;
  onMetricsCollected?(tenantId: string, accountId: string, metrics: Metrics): Promise<Metrics>;
  onMetricsProcessed?(tenantId: string, accountId: string, metrics: Metrics): Promise<void>;
  onReportGenerated?(tenantId: string, report: Report): Promise<Report>;
  onBeforeSendAlert?(tenantId: string, alert: Alert): Promise<Alert>;
  onCampaignCreated?(tenantId: string, campaign: Campaign): Promise<void>;
  onCampaignCompleted?(tenantId: string, campaign: Campaign): Promise<void>;
  onGapIdentified?(tenantId: string, gap: MarketingGap): Promise<void>;
  onPredictionGenerated?(tenantId: string, prediction: Prediction): Promise<void>;
}

export class PluginManager {
  private plugins: TenantPlugin[] = [];
  private enabledHooks: Set<PluginHook> = new Set();

  constructor() {
    this.enabledHooks.add('onTenantInit');
    this.enabledHooks.add('onMetricsCollected');
    this.enabledHooks.add('onReportGenerated');
  }

  register(plugin: TenantPlugin): void {
    for (const hook of plugin.hooks) {
      this.enabledHooks.add(hook);
    }

    this.plugins.push(plugin);
    this.plugins.sort((a, b) => b.priority - a.priority);

    console.log(`[PluginManager] Registered plugin: ${plugin.name} v${plugin.version}`);
  }

  unregister(pluginName: string): boolean {
    const index = this.plugins.findIndex((p) => p.name === pluginName);
    if (index !== -1) {
      this.plugins.splice(index, 1);
      return true;
    }
    return false;
  }

  getPlugins(): TenantPlugin[] {
    return [...this.plugins];
  }

  isHookEnabled(hook: PluginHook): boolean {
    return this.enabledHooks.has(hook);
  }

  async executeHook<H extends PluginHook>(
    hook: H,
    ...args: Parameters<NonNullable<TenantPlugin[H]>>
  ): Promise<void> {
    if (!this.enabledHooks.has(hook)) {
      return;
    }

    for (const plugin of this.plugins) {
      const fn = plugin[hook] as ((...args: Parameters<NonNullable<TenantPlugin[H]>>) => Promise<void>) | undefined;
      if (typeof fn === 'function') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (fn as any)(...args);
        } catch (error) {
          console.error(`[PluginManager] Error in plugin ${plugin.name} hook ${hook}:`, error);
        }
      }
    }
  }

  async onTenantInit(tenant: Tenant): Promise<void> {
    await this.executeHook('onTenantInit', tenant);
  }

  async onTenantActivate(tenant: Tenant): Promise<void> {
    await this.executeHook('onTenantActivate', tenant);
  }

  async onTenantDeactivate(tenant: Tenant): Promise<void> {
    await this.executeHook('onTenantDeactivate', tenant);
  }

  async onMetricsCollected(tenantId: string, accountId: string, metrics: Metrics): Promise<Metrics> {
    let result = metrics;
    for (const plugin of this.plugins) {
      if (typeof plugin.onMetricsCollected === 'function') {
        result = await plugin.onMetricsCollected(tenantId, accountId, result);
      }
    }
    return result;
  }

  async onMetricsProcessed(tenantId: string, accountId: string, metrics: Metrics): Promise<void> {
    await this.executeHook('onMetricsProcessed', tenantId, accountId, metrics);
  }

  async onReportGenerated(tenantId: string, report: Report): Promise<Report> {
    let result = report;
    for (const plugin of this.plugins) {
      if (typeof plugin.onReportGenerated === 'function') {
        result = await plugin.onReportGenerated(tenantId, result);
      }
    }
    return result;
  }

  async onBeforeSendAlert(tenantId: string, alert: Alert): Promise<Alert> {
    let result = alert;
    for (const plugin of this.plugins) {
      if (typeof plugin.onBeforeSendAlert === 'function') {
        result = await plugin.onBeforeSendAlert(tenantId, result);
      }
    }
    return result;
  }

  async onCampaignCreated(tenantId: string, campaign: Campaign): Promise<void> {
    await this.executeHook('onCampaignCreated', tenantId, campaign);
  }

  async onCampaignCompleted(tenantId: string, campaign: Campaign): Promise<void> {
    await this.executeHook('onCampaignCompleted', tenantId, campaign);
  }

  async onGapIdentified(tenantId: string, gap: MarketingGap): Promise<void> {
    await this.executeHook('onGapIdentified', tenantId, gap);
  }

  async onPredictionGenerated(tenantId: string, prediction: Prediction): Promise<void> {
    await this.executeHook('onPredictionGenerated', tenantId, prediction);
  }
}

let pluginManagerInstance: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!pluginManagerInstance) {
    pluginManagerInstance = new PluginManager();
  }
  return pluginManagerInstance;
}

export function registerPlugin(plugin: TenantPlugin): void {
  getPluginManager().register(plugin);
}

export function createSentimentPlugin(): TenantPlugin {
  return {
    name: 'sentiment-analysis',
    version: '1.0.0',
    priority: 10,
    hooks: ['onMetricsCollected'],
    async onMetricsCollected(tenantId, accountId, metrics) {
      const estimatedSentiment = 0.75;
      const adjustedEngagement = metrics.engagementRate * (1 + estimatedSentiment * 0.2);
      return {
        ...metrics,
        engagementRate: adjustedEngagement,
        avgEngagementPerPost: metrics.avgEngagementPerPost * (1 + estimatedSentiment * 0.15),
      };
    },
  };
}

export function createCompetitorBenchmarkPlugin(): TenantPlugin {
  return {
    name: 'competitor-benchmark',
    version: '1.0.0',
    priority: 5,
    hooks: ['onGapIdentified'],
    async onGapIdentified(tenantId, gap) {
      console.log(`[CompetitorBenchmark] Gap identified for tenant ${tenantId}:`, gap.title);
    },
  };
}
