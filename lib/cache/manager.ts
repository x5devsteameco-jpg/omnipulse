export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MockRedisClient {
  private cache: Map<string, CacheEntry<unknown>>;
  private hitCount: number;
  private missCount: number;

  constructor() {
    this.cache = new Map();
    this.hitCount = 0;
    this.missCount = 0;
    this.cleanup();
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map((key) => this.get<T>(key)));
  }

  async mset(entries: Array<{ key: string; value: unknown; ttl?: number }>): Promise<void> {
    await Promise.all(
      entries.map(({ key, value, ttl }) => this.set(key, value, ttl ?? 300))
    );
  }

  async incr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) ?? 0;
    const next = current + 1;
    await this.set(key, next);
    return next;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const entry = this.cache.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
  }

  async ttl(key: string): Promise<number> {
    const entry = this.cache.get(key);
    if (!entry) return -1;
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -1;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.cache.keys()).filter((key) => regex.test(key));
  }

  async flushdb(): Promise<void> {
    this.cache.clear();
  }

  async dbsize(): Promise<number> {
    return this.cache.size;
  }

  getStats(): { hitCount: number; missCount: number; hitRate: number; size: number } {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0;
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
    };
  }

  private cleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60000);
  }
}

export class CacheManager {
  private client: MockRedisClient;
  private defaultTTL: number = 300;

  constructor() {
    this.client = new MockRedisClient();
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const prefixedKey = this.prefixKey(key, options?.prefix);
    return this.client.get<T>(prefixedKey);
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const prefixedKey = this.prefixKey(key, options?.prefix);
    const ttl = options?.ttl ?? this.defaultTTL;
    await this.client.set(prefixedKey, value, ttl);
  }

  async del(key: string, options?: CacheOptions): Promise<void> {
    const prefixedKey = this.prefixKey(key, options?.prefix);
    await this.client.del(prefixedKey);
  }

  async invalidatePattern(pattern: string, prefix?: string): Promise<void> {
    const fullPattern = this.prefixKey(pattern, prefix);
    const keys = await this.client.keys(fullPattern);
    await Promise.all(keys.map((key) => this.client.del(key)));
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async cachedQuery<T>(
    queryKey: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<{ data: T; fromCache: boolean }> {
    const cached = await this.get<T>(queryKey, options);

    if (cached !== null) {
      return { data: cached, fromCache: true };
    }

    const data = await fetchFn();
    await this.set(queryKey, data, options);
    return { data, fromCache: false };
  }

  getStats() {
    return this.client.getStats();
  }

  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  private prefixKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }
}

const globalCacheManager = new CacheManager();

export function getCacheManager(): CacheManager {
  return globalCacheManager;
}

export function createTenantCache(tenantId: string): CacheManager {
  const tenantCache = new CacheManager();
  tenantCache.setDefaultTTL(300);
  return tenantCache;
}

export default CacheManager;
