import { NextRequest, NextResponse } from 'next/server';
import { getConfigStore } from '@/lib/config';
import { getTenantRouter } from '@/lib/tenant';
import { DEFAULT_TENANT_CONFIG, TIER_LIMITS } from '@/lib/types/tenant';
import type { TenantTier } from '@/lib/types/tenant';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateId(): string {
  return `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

interface CreateTenantRequest {
  tenantName: string;
  tier?: TenantTier;
  brandName?: string;
  brandConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logo?: string;
    favicon?: string;
    fontFamily?: string;
  };
  adminEmail: string;
  adminName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTenantRequest = await request.json();
    const { tenantName, tier = 'starter', brandName, brandConfig, adminEmail, adminName } = body;

    if (!tenantName || !adminEmail) {
      return NextResponse.json(
        { error: 'tenantName and adminEmail are required' },
        { status: 400 }
      );
    }

    const tenantSlug = generateSlug(tenantName);
    const configStore = getConfigStore();
    const router = getTenantRouter();

    const existingConfig = await configStore.getConfig(tenantSlug);
    if (existingConfig) {
      return NextResponse.json(
        { error: `Tenant slug "${tenantSlug}" already exists` },
        { status: 409 }
      );
    }

    const tierLimits = TIER_LIMITS[tier];
    const now = new Date().toISOString();

    const tenantConfig = {
      ...DEFAULT_TENANT_CONFIG,
      tenantId: generateId(),
      tenantSlug,
      tenantName,
      tier,
      limits: tierLimits,
      brandName: brandName || tenantName,
      createdAt: now,
      updatedAt: now,
      ...(brandConfig && {
        primaryColor: brandConfig.primaryColor,
        secondaryColor: brandConfig.secondaryColor,
        accentColor: brandConfig.accentColor,
        brandLogo: brandConfig.logo,
        brandFavicon: brandConfig.favicon,
        fontFamily: brandConfig.fontFamily,
      }),
    };

    await configStore.setConfig(tenantSlug, tenantConfig);

    await router.registerTenant({
      id: tenantConfig.tenantId,
      slug: tenantSlug,
      name: tenantName,
      tier,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      tenant: {
        id: tenantConfig.tenantId,
        slug: tenantSlug,
        name: tenantName,
        tier,
        isActive: true,
      },
      config: {
        tenantSlug,
        brandName: tenantConfig.brandName,
        tier,
        limits: tierLimits,
      },
      status: 'provisioning',
      dashboardUrl: `https://${tenantSlug}.omnipulse.app`,
      message: 'Tenant provisioned successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('[TenantsAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const router = getTenantRouter();
    const tenants = await router.listTenants();

    return NextResponse.json({
      tenants,
      count: tenants.length,
    });

  } catch (error) {
    console.error('[TenantsAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
