import type { Tenant } from '@/lib/types/tenant';

interface PoolConfig {
  min: number;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

const ENTERPRISE_POOL_CONFIG: PoolConfig = {
  min: 5,
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

interface TenantDatabaseEntry {
  tenantId: string;
  branchName: string;
  connectionString: string;
  isPrimary: boolean;
}

export interface TenantRegistry {
  getTenant(tenantSlug: string): Promise<Tenant | null>;
  getTenantById(tenantId: string): Promise<Tenant | null>;
  createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant>;
  updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant>;
  listTenants(): Promise<Tenant[]>;
  getTenantDatabase(tenantSlug: string): Promise<TenantDatabaseEntry | null>;
  createTenantDatabase(tenantId: string, tenantSlug: string): Promise<TenantDatabaseEntry>;
}

interface MockTenantEntry extends Tenant {
  databaseConfig?: DatabaseConfig;
}

export class TenantConnectionRouter {
  private pools: Map<string, unknown> = new Map();
  private registry: Map<string, MockTenantEntry> = new Map();
  private databases: Map<string, TenantDatabaseEntry> = new Map();
  private poolConfigs: Map<string, PoolConfig> = new Map();

  constructor() {
    this.poolConfigs.set('starter', DEFAULT_POOL_CONFIG);
    this.poolConfigs.set('professional', DEFAULT_POOL_CONFIG);
    this.poolConfigs.set('enterprise', ENTERPRISE_POOL_CONFIG);
  }

  async getPoolConfig(tenantSlug: string): Promise<PoolConfig> {
    const tenant = await this.getTenantInfo(tenantSlug);
    const tier = tenant?.tier || 'starter';
    return this.poolConfigs.get(tier) || DEFAULT_POOL_CONFIG;
  }

  private async getTenantInfo(tenantSlug: string): Promise<MockTenantEntry | null> {
    return this.registry.get(tenantSlug) || null;
  }

  async executeForTenant<T>(
    tenantSlug: string,
    query: string,
    params: unknown[] = []
  ): Promise<T[]> {
    const tenant = await this.getTenantInfo(tenantSlug);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantSlug}`);
    }

    console.log(`[TenantRouter] Executing query for tenant: ${tenantSlug}`);
    console.log(`[TenantRouter] Query: ${query.substring(0, 100)}...`);
    console.log(`[TenantRouter] Params: ${JSON.stringify(params)}`);

    return [] as T[];
  }

  async registerTenant(tenant: MockTenantEntry): Promise<void> {
    this.registry.set(tenant.slug, tenant);
  }

  async getTenant(tenantSlug: string): Promise<Tenant | null> {
    return this.registry.get(tenantSlug) || null;
  }

  async listTenants(): Promise<Tenant[]> {
    return Array.from(this.registry.values());
  }

  async setTenantDatabase(
    tenantSlug: string,
    db: TenantDatabaseEntry
  ): Promise<void> {
    this.databases.set(tenantSlug, db);
  }

  async getTenantDatabase(tenantSlug: string): Promise<TenantDatabaseEntry | null> {
    return this.databases.get(tenantSlug) || null;
  }

  closePool(tenantSlug: string): void {
    this.pools.delete(tenantSlug);
  }

  closeAllPools(): void {
    this.pools.clear();
  }

  getPoolStats(): { activePools: number; tenantCount: number } {
    return {
      activePools: this.pools.size,
      tenantCount: this.registry.size,
    };
  }
}

let routerInstance: TenantConnectionRouter | null = null;

export function getTenantRouter(): TenantConnectionRouter {
  if (!routerInstance) {
    routerInstance = new TenantConnectionRouter();
  }
  return routerInstance;
}

export function resetTenantRouter(): void {
  if (routerInstance) {
    routerInstance.closeAllPools();
  }
  routerInstance = null;
}
