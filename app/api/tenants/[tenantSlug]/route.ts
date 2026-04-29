import { NextRequest, NextResponse } from 'next/server';
import { getConfigStore } from '@/lib/config';

interface TenantParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: TenantParams
) {
  try {
    const { tenantSlug } = await params;
    const configStore = getConfigStore();

    const config = await configStore.getConfig(tenantSlug);
    if (!config) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tenant: {
        id: config.tenantId,
        slug: config.tenantSlug,
        name: config.tenantName,
        tier: config.tier,
        isActive: config.isActive,
        brandName: config.brandName,
      },
      config: {
        features: config.features,
        platforms: config.platforms,
        limits: config.limits,
        engagementThresholds: config.engagementThresholds,
        followerGrowthTargets: config.followerGrowthTargets,
      },
      branding: {
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        accentColor: config.accentColor,
        backgroundColor: config.backgroundColor,
        surfaceColor: config.surfaceColor,
        borderColor: config.borderColor,
        textPrimaryColor: config.textPrimaryColor,
        textSecondaryColor: config.textSecondaryColor,
        fontFamily: config.fontFamily,
      },
    });

  } catch (error) {
    console.error('[TenantsAPI] GET tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: TenantParams
) {
  try {
    const { tenantSlug } = await params;
    const updates = await request.json();
    const configStore = getConfigStore();

    const existing = await configStore.getConfig(tenantSlug);
    if (!existing) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const allowedUpdates = [
      'brandName', 'primaryColor', 'secondaryColor', 'accentColor',
      'backgroundColor', 'surfaceColor', 'borderColor', 'textPrimaryColor',
      'textSecondaryColor', 'fontFamily', 'cssVariables', 'features',
      'platforms', 'engagementThresholds', 'followerGrowthTargets', 'isActive'
    ];

    const filteredUpdates: Record<string, unknown> = {};
    for (const key of allowedUpdates) {
      if (key in updates) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updated = await configStore.updateConfig(tenantSlug, filteredUpdates);

    return NextResponse.json({
      tenant: {
        id: updated.tenantId,
        slug: updated.tenantSlug,
        name: updated.tenantName,
        tier: updated.tier,
        isActive: updated.isActive,
      },
      message: 'Tenant updated successfully',
    });

  } catch (error) {
    console.error('[TenantsAPI] PATCH tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: TenantParams
) {
  try {
    const { tenantSlug } = await params;
    const configStore = getConfigStore();

    const existing = await configStore.getConfig(tenantSlug);
    if (!existing) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    await configStore.invalidate(tenantSlug);

    return NextResponse.json({
      message: `Tenant "${tenantSlug}" deleted successfully`,
    });

  } catch (error) {
    console.error('[TenantsAPI] DELETE tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
