import { NextRequest, NextResponse } from 'next/server';
import { getCampaignManager } from '@/lib/campaigns';

interface BrandParams {
  params: Promise<{ brandId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: BrandParams
) {
  try {
    const { brandId } = await params;
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const manager = getCampaignManager();

    let campaigns = manager.getCampaignsByBrand(brandId);

    if (status) {
      campaigns = campaigns.filter((c) => c.status === status);
    }

    return NextResponse.json({
      campaigns,
      count: campaigns.length,
    });

  } catch (error) {
    console.error('[CampaignsAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: BrandParams
) {
  try {
    const { brandId } = await params;
    const body = await request.json();

    const { name, description, startDate, endDate, budgetTotal, talentAccountIds, platformTargets, kpiTargets, createdBy } = body;

    if (!name || !startDate || !createdBy) {
      return NextResponse.json(
        { error: 'name, startDate, and createdBy are required' },
        { status: 400 }
      );
    }

    const manager = getCampaignManager();
    const campaign = manager.createCampaign({
      brandId,
      name,
      description,
      startDate,
      endDate,
      budgetTotal,
      talentAccountIds: talentAccountIds || [],
      platformTargets: platformTargets || [],
      kpiTargets: kpiTargets || {},
      createdBy,
    });

    return NextResponse.json({ campaign }, { status: 201 });

  } catch (error) {
    console.error('[CampaignsAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
