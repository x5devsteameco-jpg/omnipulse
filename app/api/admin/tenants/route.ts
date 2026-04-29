import { NextRequest, NextResponse } from 'next/server';
import { getTenantRegistry, createTenant, getTenantBySlug } from '../../../../lib/tenant/registry';

export async function GET(): Promise<NextResponse> {
  try {
    const tenants = await getTenantRegistry();
    return NextResponse.json({ tenants });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const { tenantSlug, tenantName, tier, databaseHost, databasePort, databaseName, databaseUser, databasePassword, isActive } = body;

    if (!tenantSlug || !tenantName || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantSlug, tenantName, tier' },
        { status: 400 }
      );
    }

    const existing = await getTenantBySlug(tenantSlug);
    if (existing) {
      return NextResponse.json(
        { error: 'Tenant with this slug already exists' },
        { status: 409 }
      );
    }

    const tenant = await createTenant({
      tenantSlug,
      tenantName,
      tier,
      databaseHost: databaseHost || 'localhost',
      databasePort: databasePort || 5432,
      databaseName: databaseName || tenantSlug,
      databaseUser: databaseUser || 'omnipulse',
      databasePassword: databasePassword || '',
      isActive: isActive ?? true,
    });

    return NextResponse.json({ tenant }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}
