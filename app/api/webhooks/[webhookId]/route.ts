import { NextRequest, NextResponse } from 'next/server';
import { getWebhookManager } from '@/lib/webhooks';

interface WebhookParams {
  params: Promise<{ webhookId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: WebhookParams
) {
  try {
    const { webhookId } = await params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const webhookManager = getWebhookManager();
    const endpoint = webhookManager.getEndpoint(webhookId);

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Webhook endpoint not found' },
        { status: 404 }
      );
    }

    const deliveries = webhookManager.getDeliveries(webhookId, limit);

    return NextResponse.json({
      endpoint,
      deliveries,
      deliveryCount: deliveries.length,
    });

  } catch (error) {
    console.error('[WebhooksAPI] GET webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: WebhookParams
) {
  try {
    const { webhookId } = await params;
    const updates = await request.json();

    const webhookManager = getWebhookManager();
    const updated = await webhookManager.updateEndpoint(webhookId, updates);

    if (!updated) {
      return NextResponse.json(
        { error: 'Webhook endpoint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ endpoint: updated });

  } catch (error) {
    console.error('[WebhooksAPI] PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: WebhookParams
) {
  try {
    const { webhookId } = await params;
    const webhookManager = getWebhookManager();

    const deleted = await webhookManager.unregisterEndpoint(webhookId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Webhook endpoint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Webhook endpoint deleted successfully',
    });

  } catch (error) {
    console.error('[WebhooksAPI] DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
