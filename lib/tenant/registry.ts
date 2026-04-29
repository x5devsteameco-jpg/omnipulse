export interface TenantRecord {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  tier: 'starter' | 'professional' | 'enterprise';
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  databaseUser: string;
  databasePassword: string;
  isActive: boolean;
  createdAt: string;
}

const TENANT_STORE: Map<string, TenantRecord> = new Map([
  ['default', {
    tenantId: 'tenant_default',
    tenantSlug: 'default',
    tenantName: 'OmniPulse',
    tier: 'enterprise',
    databaseHost: process.env.DB_HOST || 'localhost',
    databasePort: parseInt(process.env.DB_PORT || '5432'),
    databaseName: 'omnipulse_default',
    databaseUser: process.env.DB_USER || 'omnipulse',
    databasePassword: process.env.DB_PASSWORD || '',
    isActive: true,
    createdAt: new Date().toISOString(),
  }],
]);

function generateTenantId(): string {
  return `tenant_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

export async function getTenantRegistry(): Promise<TenantRecord[]> {
  return Array.from(TENANT_STORE.values());
}

export async function getTenantBySlug(slug: string): Promise<TenantRecord | null> {
  return TENANT_STORE.get(slug) || null;
}

export async function createTenant(
  data: Omit<TenantRecord, 'tenantId' | 'createdAt'>
): Promise<TenantRecord> {
  const tenant: TenantRecord = {
    ...data,
    tenantId: generateTenantId(),
    createdAt: new Date().toISOString(),
  };
  TENANT_STORE.set(data.tenantSlug, tenant);
  return tenant;
}
