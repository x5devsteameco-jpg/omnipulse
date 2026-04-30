import type { TenantConfig } from '@/lib/types/tenant';

interface CacheEntry {
  data: TenantConfig;
  expires: number;
}

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, ttlMs?: number): Promise<void>;
  del(key: string): Promise<number>;
  setEx(key: string, seconds: number, value: string): Promise<void>;
}

class MockRedisClient implements RedisClient {
  private store: Map<string, string> = new Map();
  private expiry: Map<string, number> = new Map();

  async get(key: string): Promise<string | null> {
    const exp = this.expiry.get(key);
    if (exp && Date.now() > exp) {
      this.store.delete(key);
      this.expiry.delete(key);
      return null;
    }
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async setEx(key: string, seconds: number, value: string): Promise<void> {
    this.store.set(key, value);
    this.expiry.set(key, Date.now() + seconds * 1000);
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.expiry.delete(key);
    return existed ? 1 : 0;
  }
}

export class TenantConfigStore {
  private redis: RedisClient;
  private localCache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL_MS = 60_000;
  private readonly REDIS_KEY_PREFIX = 'omnipulse:tenant:config:';
  private readonly REDIS_TTL_SECONDS = 300;
  private useMockRedis = true;

  constructor(_redisUrl?: string) {
    this.useMockRedis = true;
    this.redis = new MockRedisClient();
  }

  async getConfig(tenantSlug: string): Promise<TenantConfig | null> {
    const local = this.localCache.get(tenantSlug);
    if (local && local.expires > Date.now()) {
      return local.data;
    }

    const redisKey = `${this.REDIS_KEY_PREFIX}${tenantSlug}`;
    const cached = await this.redis.get(redisKey);
    if (cached) {
      const config = JSON.parse(cached) as TenantConfig;
      this.localCache.set(tenantSlug, {
        data: config,
        expires: Date.now() + this.CACHE_TTL_MS,
      });
      return config;
    }

    return null;
  }

  async setConfig(tenantSlug: string, config: TenantConfig): Promise<void> {
    const redisKey = `${this.REDIS_KEY_PREFIX}${tenantSlug}`;

    await this.redis.setEx(redisKey, this.REDIS_TTL_SECONDS, JSON.stringify(config));

    this.localCache.set(tenantSlug, {
      data: config,
      expires: Date.now() + this.CACHE_TTL_MS,
    });
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
    if (!current) {
      throw new Error(`Tenant config not found: ${tenantSlug}`);
    }

    const updated: TenantConfig = {
      ...current,
      ...updates,
      tenantId: current.tenantId,
      tenantSlug: current.tenantSlug,
      updatedAt: new Date().toISOString(),
    };

    await this.setConfig(tenantSlug, updated);
    await this.invalidate(tenantSlug);

    return updated;
  }

  async getAllConfigs(): Promise<TenantConfig[]> {
    if (this.useMockRedis) {
      const configs: TenantConfig[] = [];
      for (const [, entry] of this.localCache.entries()) {
        if (entry.expires > Date.now()) {
          configs.push(entry.data);
        }
      }
      return configs;
    }
    return [];
  }

  getLocalCacheStats(): { size: number; tenants: string[] } {
    const now = Date.now();
    const valid: string[] = [];
    for (const [slug, entry] of this.localCache.entries()) {
      if (entry.expires > now) {
        valid.push(slug);
      }
    }
    return { size: valid.length, tenants: valid };
  }
}

let configStoreInstance: TenantConfigStore | null = null;

export function getConfigStore(_redisUrl?: string): TenantConfigStore {
  if (!configStoreInstance) {
    configStoreInstance = new TenantConfigStore();
  }
  return configStoreInstance;
}

export function resetConfigStore(): void {
  configStoreInstance = null;
}
