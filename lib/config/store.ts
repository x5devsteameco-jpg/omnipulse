export interface TenantConfig {
  tenantId: string;
  tenantSlug: string;
  tier: 'starter' | 'professional' | 'enterprise';
  brandName: string;
  brandLogo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  features: {
    sentimentAnalysis: boolean;
    competitorBenchmarking: boolean;
    predictiveML: boolean;
    crisisAlerting: boolean;
    automatedReports: boolean;
  };
  brandFont?: string;
  supportEmail?: string;
  maxAccounts?: number;
  maxUsers?: number;
  dataRetentionDays?: number;
}

interface CacheEntry {
  data: TenantConfig;
  expires: number;
}

const DEFAULT_CONFIG: TenantConfig = {
  tenantId: 'tenant_default',
  tenantSlug: 'default',
  tier: 'enterprise',
  brandName: 'OmniPulse',
  brandLogo: '/logo.svg',
  primaryColor: '#1a1a1a',
  secondaryColor: '#2d2d2d',
  accentColor: '#d4af37',
  features: {
    sentimentAnalysis: true,
    competitorBenchmarking: true,
    predictiveML: true,
    crisisAlerting: true,
    automatedReports: true,
  },
  brandFont: 'Inter, system-ui, sans-serif',
  supportEmail: 'support@omnipulse.ai',
  maxAccounts: 100,
  maxUsers: 50,
  dataRetentionDays: 365,
};

const TENANT_CONFIGS: Map<string, TenantConfig> = new Map([
  ['default', DEFAULT_CONFIG],
]);

export class TenantConfigStore {
  private localCache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL_MS = 60_000;
  private redisClient: unknown = null;

  async getConfig(tenantSlug: string): Promise<TenantConfig> {
    const cached = this.localCache.get(tenantSlug);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const fromStore = TENANT_CONFIGS.get(tenantSlug);
    if (fromStore) {
      this.localCache.set(tenantSlug, {
        data: fromStore,
        expires: Date.now() + this.CACHE_TTL_MS,
      });
      return fromStore;
    }

    const defaultConfig = { ...DEFAULT_CONFIG, tenantSlug };
    TENANT_CONFIGS.set(tenantSlug, defaultConfig);
    this.localCache.set(tenantSlug, {
      data: defaultConfig,
      expires: Date.now() + this.CACHE_TTL_MS,
    });
    return defaultConfig;
  }

  async updateConfig(
    tenantSlug: string,
    updates: Partial<TenantConfig>
  ): Promise<TenantConfig> {
    const current = await this.getConfig(tenantSlug);
    const updated: TenantConfig = {
      ...current,
      ...updates,
      tenantId: current.tenantId,
      tenantSlug: current.tenantSlug,
    };
    TENANT_CONFIGS.set(tenantSlug, updated);
    this.localCache.set(tenantSlug, {
      data: updated,
      expires: Date.now() + this.CACHE_TTL_MS,
    });
    return updated;
  }

  async invalidate(tenantSlug: string): Promise<void> {
    this.localCache.delete(tenantSlug);
  }
}

export const configStore = new TenantConfigStore();
