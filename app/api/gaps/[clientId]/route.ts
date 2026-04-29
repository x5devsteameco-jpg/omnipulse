import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';
    const severity = searchParams.get('severity');

    let gaps = db.getGaps(clientId);

    if (status !== 'all') {
      gaps = gaps.filter(g => g.status === status);
    }
    if (severity) {
      gaps = gaps.filter(g => g.severity === severity);
    }

    return NextResponse.json({
      clientId,
      gaps,
      count: gaps.length,
      openCount: gaps.filter(g => g.status === 'open').length,
      criticalCount: gaps.filter(g => g.severity === 'critical').length
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch gaps' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const body = await request.json();
    const { platform, gapType, severity, description, opportunity, recommendedAction, competitorMetrics, currentMetrics } = body;

    if (!platform || !gapType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gap = db.createGap({
      clientId,
      platform,
      gapType,
      severity: severity || 'medium',
      description,
      opportunity,
      recommendedAction,
      competitorMetrics: competitorMetrics || {},
      currentMetrics: currentMetrics || {}
    });

    return NextResponse.json({ gap }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create gap' }, { status: 500 });
  }
}