import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const client = db.getClient(clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const accounts = db.getAccounts(clientId);

    const totalFollowers = accounts.reduce((sum, acc) => {
      const latestMetrics = db.getMetrics(acc.id)[0];
      return sum + (latestMetrics?.followersCount || 0);
    }, 0);

    const totalEngagement = accounts.reduce((sum, acc) => {
      const latestMetrics = db.getMetrics(acc.id)[0];
      return sum + (latestMetrics?.engagementRate || 0);
    }, 0) / (accounts.length || 1);

    const totalViews = accounts.reduce((sum, acc) => {
      const latestMetrics = db.getMetrics(acc.id)[0];
      return sum + (latestMetrics?.viewsCount || 0);
    }, 0);

    const platformBreakdown = accounts.map(acc => {
      const latestMetrics = db.getMetrics(acc.id)[0];
      const recentMetrics = db.getMetrics(acc.id).slice(0, 7);
      return {
        platform: acc.platform,
        username: acc.username,
        followers: latestMetrics?.followersCount || 0,
        engagement: latestMetrics?.engagementRate || 0,
        posts: latestMetrics?.postsCount || 0,
        views: latestMetrics?.viewsCount || 0,
        trends: recentMetrics.map(m => ({
          date: m.capturedAt,
          engagement: m.engagementRate,
          followers: m.followersCount
        }))
      };
    });

    const predictions = accounts.flatMap(acc =>
      db.getPredictions(acc.id).map(p => ({
        accountId: acc.id,
        platform: acc.platform,
        predictedAt: p.predictedAt,
        predictedFollowers: p.predictedFollowers,
        predictedEngagement: p.predictedEngagementRate,
        confidence: p.confidenceScore
      }))
    );

    const gaps = db.getGaps(clientId).filter(g => g.status !== 'dismissed');
    const gapsBySeverity = gaps.reduce((acc, gap) => {
      acc[gap.severity] = (acc[gap.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      clientId,
      clientName: client.name,
      period,
      summary: {
        totalFollowers,
        avgEngagement: Math.round(totalEngagement * 100) / 100,
        totalViews,
        engagementTrend: 0,
        accountCount: accounts.length,
        openGaps: gaps.filter(g => g.status === 'open').length,
        criticalGaps: gaps.filter(g => g.severity === 'critical').length
      },
      platformBreakdown,
      predictions: predictions.slice(0, 20),
      gaps,
      gapsBySeverity,
      generatedAt: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
  }
}