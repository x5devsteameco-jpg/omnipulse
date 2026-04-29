import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const limit = parseInt(searchParams.get('limit') || '100');

    let startDate: Date;
    const now = new Date();
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const allMetrics = db.getMetrics(accountId);
    const metricsHistory = allMetrics
      .filter(m => new Date(m.capturedAt) >= startDate)
      .slice(0, limit);

    const trends = db.getTrends(accountId);
    const trendHistory = trends
      .filter(t => new Date(t.periodStart) >= startDate)
      .slice(0, limit);

    return NextResponse.json({
      accountId,
      period,
      startDate: startDate.toISOString(),
      metricsHistory,
      trendHistory,
      dataPoints: metricsHistory.length + trendHistory.length
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}