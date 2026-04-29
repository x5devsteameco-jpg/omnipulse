import { NextRequest, NextResponse } from 'next/server';
import { getWebhookManager, type WebhookEvent } from '@/lib/webhooks';

interface TenantWebhooksParams {
  params: Promise<{ tenantId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: TenantWebhooksParams
) {
  try {
    const { tenantId } = await params;
    const webhookManager = getWebhookManager();

    const endpoints = webhookManager.getEndpointsByTenant(tenantId);

    return NextResponse.json({
      endpoints,
      count: endpoints.length,
    });

  } catch (error) {
    console.error('[WebhooksAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: TenantWebhooksParams
) {
  try {
    const { tenantId } = await params;
    const body = await request.json();

    const { url, events, secret } = body;

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'url and events array are required' },
        { status: 400 }
      );
    }

    const validEvents: WebhookEvent[] = [
      'tenant.created',
      'tenant.activated',
      'tenant.deactivated',
      'metrics.collected',
      'gap.identified',
      'gap.resolved',
      'campaign.started',
      'campaign.completed',
      'prediction.generated',
      'alert.triggered',
      'report.generated',
    ];

    const invalidEvents = events.filter((e: string) => !validEvents.includes(e as WebhookEvent));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    const webhookManager = getWebhookManager();
    const endpoint = await webhookManager.registerEndpoint(
      tenantId,
      url,
      events as WebhookEvent[],
      secret
    );

    return NextResponse.json({ endpoint }, { status: 201 });

  } catch (error) {
    console.error('[WebhooksAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
