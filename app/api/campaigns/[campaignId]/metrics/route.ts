import { NextRequest, NextResponse } from 'next/server';
import { getCampaignManager } from '@/lib/campaigns';

interface CampaignMetricsParams {
  params: Promise<{ campaignId: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: CampaignMetricsParams
) {
  try {
    const { campaignId } = await params;
    const body = await request.json();

    const { accountId, metrics } = body;

    if (!accountId || !metrics) {
      return NextResponse.json(
        { error: 'accountId and metrics are required' },
        { status: 400 }
      );
    }

    const manager = getCampaignManager();
    const record = manager.recordMetrics(campaignId, accountId, metrics);

    if (!record) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const roi = manager.calculateROI(campaignId);

    return NextResponse.json({
      record,
      currentROI: roi,
    }, { status: 201 });

  } catch (error) {
    console.error('[CampaignsAPI] POST metrics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: CampaignMetricsParams
) {
  try {
    const { campaignId } = await params;

    const manager = getCampaignManager();
    const campaign = manager.getCampaign(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const performance = manager.getPerformance(campaignId);

    return NextResponse.json({
      campaign,
      metrics: performance?.metrics || [],
      roi: performance?.roi || null,
    });

  } catch (error) {
    console.error('[CampaignsAPI] GET metrics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
