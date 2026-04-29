import { NextRequest, NextResponse } from 'next/server';
import { getTenantBySlug } from '../../../../../lib/tenant/registry';

interface Params {
  params: Promise<{ tenantId: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const { tenantId } = await params;

    const tenant = await getTenantBySlug(tenantId);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 }
    );
  }
}
