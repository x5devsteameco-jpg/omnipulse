import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogger } from '@/lib/audit';

interface TenantAuditParams {
  params: Promise<{ tenantId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: TenantAuditParams
) {
  try {
    const { tenantId } = await params;
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    const logger = getAuditLogger();
    const summary = logger.getSummary(tenantId, days);

    return NextResponse.json({
      summary,
      periodDays: days,
    });

  } catch (error) {
    console.error('[AuditAPI] GET summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
