import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogger, type AuditAction } from '@/lib/audit';

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

    const actorId = url.searchParams.get('actorId') || undefined;
    const actionParam = url.searchParams.get('action');
    const action = actionParam as AuditAction | undefined;
    const resource = url.searchParams.get('resource') || undefined;
    const from = url.searchParams.get('from') || undefined;
    const to = url.searchParams.get('to') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const logger = getAuditLogger();
    const events = logger.query({
      tenantId,
      actorId,
      action,
      resource,
      from,
      to,
      limit,
      offset,
    });

    return NextResponse.json({
      events,
      count: events.length,
    });

  } catch (error) {
    console.error('[AuditAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: TenantAuditParams
) {
  try {
    const { tenantId } = await params;
    const body = await request.json();

    const { action, resource, resourceId, metadata, actorId, actorEmail } = body;

    if (!action || !resource) {
      return NextResponse.json(
        { error: 'action and resource are required' },
        { status: 400 }
      );
    }

    const logger = getAuditLogger();
    const event = logger.log({
      tenantId,
      action,
      resource,
      resourceId,
      metadata,
      actorId,
      actorEmail,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    });

    return NextResponse.json({ event }, { status: 201 });

  } catch (error) {
    console.error('[AuditAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
