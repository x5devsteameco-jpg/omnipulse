import type { TenantTier } from '@/lib/types/tenant';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const TIER_CONFIGS: Record<TenantTier, RateLimitConfig> = {
  starter: { windowMs: 60_000, maxRequests: 60 },
  professional: { windowMs: 60_000, maxRequests: 300 },
  enterprise: { windowMs: 60_000, maxRequests: 1000 },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterMs?: number;
}

export class MultiTenantRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private configCache: Map<string, RateLimitConfig> = new Map();

  getConfig(tier: TenantTier): RateLimitConfig {
    if (!this.configCache.has(tier)) {
      this.configCache.set(tier, TIER_CONFIGS[tier]);
    }
    return this.configCache.get(tier)!;
  }

  check(tenantSlug: string, tier: TenantTier = 'starter'): RateLimitResult {
    const config = this.getConfig(tier);
    const key = this.getKey(tenantSlug);
    const now = Date.now();

    let entry = this.store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = {
        count: 0,
        resetAt: now + config.windowMs,
      };
    }

    entry.count++;
    this.store.set(key, entry);

    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (!allowed) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(entry.resetAt),
        retryAfterMs: entry.resetAt - now,
      };
    }

    return {
      allowed: true,
      remaining,
      resetAt: new Date(entry.resetAt),
    };
  }

  checkSlidingWindow(tenantSlug: string, tier: TenantTier = 'starter'): RateLimitResult {
    const config = this.getConfig(tier);
    const key = this.getKey(tenantSlug, 'sliding');
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let entries = this.store.get(key) as unknown as { count: number; resetAt: number; timestamps: number[] } | undefined;

    if (!entries || entries.resetAt <= now) {
      entries = { count: 0, resetAt: now + config.windowMs, timestamps: [] };
    }

    entries.timestamps = entries.timestamps.filter((t) => t > windowStart);
    entries.timestamps.push(now);
    entries.count = entries.timestamps.length;
    entries.resetAt = now + config.windowMs;

    this.store.set(key, entries as unknown as RateLimitEntry);

    const allowed = entries.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entries.count);

    if (!allowed) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(entries.resetAt),
        retryAfterMs: config.windowMs,
      };
    }

    return {
      allowed: true,
      remaining,
      resetAt: new Date(entries.resetAt),
    };
  }

  reset(tenantSlug: string): void {
    const keys = [
      this.getKey(tenantSlug),
      this.getKey(tenantSlug, 'sliding'),
    ];
    keys.forEach((k) => this.store.delete(k));
  }

  private getKey(tenantSlug: string, type: string = 'fixed'): string {
    return `ratelimit:${type}:${tenantSlug}`;
  }

  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt <= now) {
        this.store.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  getStats(): { entries: number; tenants: number } {
    return {
      entries: this.store.size,
      tenants: new Set(Array.from(this.store.keys()).map((k) => k.split(':')[2])).size,
    };
  }
}

let rateLimiterInstance: MultiTenantRateLimiter | null = null;

export function getRateLimiter(): MultiTenantRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new MultiTenantRateLimiter();
  }
  return rateLimiterInstance;
}
