import { NextRequest, NextResponse } from 'next/server';
import { getCampaignManager } from '@/lib/campaigns';

interface CampaignParams {
  params: Promise<{ campaignId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: CampaignParams
) {
  try {
    const { campaignId } = await params;
    const url = new URL(request.url);
    const revenueAttributed = parseFloat(url.searchParams.get('revenue') || '0');

    const manager = getCampaignManager();
    const performance = manager.getPerformance(campaignId, revenueAttributed);

    if (!performance) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ performance });

  } catch (error) {
    console.error('[CampaignsAPI] GET campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: CampaignParams
) {
  try {
    const { campaignId } = await params;
    const updates = await request.json();

    const manager = getCampaignManager();
    const updated = manager.updateCampaign(campaignId, updates);

    if (!updated) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign: updated });

  } catch (error) {
    console.error('[CampaignsAPI] PATCH campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: CampaignParams
) {
  try {
    const { campaignId } = await params;
    const manager = getCampaignManager();
    const updated = manager.updateCampaign(campaignId, { status: 'cancelled' });

    if (!updated) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Campaign cancelled successfully',
    });

  } catch (error) {
    console.error('[CampaignsAPI] DELETE campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
