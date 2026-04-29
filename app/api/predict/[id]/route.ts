import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import SocialMediaScraper from '@/lib/scraper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'next_week';

    const account = db.getAccount(accountId);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const historicalMetrics = db.getMetrics(accountId).slice(0, 30).reverse();

    const historicalData = historicalMetrics.map(m => ({
      followers: m.followersCount,
      following: m.followingCount,
      posts: m.postsCount,
      engagement_rate: m.engagementRate,
      views: m.viewsCount,
      timestamp: m.capturedAt
    }));

    const scraper = new SocialMediaScraper();
    const prediction = await scraper.predictNextPeriod(account.username, historicalData, account.platform);

    const now = new Date();
    let periodEnd: Date;
    switch (period) {
      case 'next_day':
        periodEnd = new Date(now.getTime() + 86400000);
        break;
      case 'next_week':
        periodEnd = new Date(now.getTime() + 7 * 86400000);
        break;
      case 'next_month':
        periodEnd = new Date(now.getTime() + 30 * 86400000);
        break;
      case 'next_quarter':
        periodEnd = new Date(now.getTime() + 90 * 86400000);
        break;
      default:
        periodEnd = new Date(now.getTime() + 7 * 86400000);
    }

    const savedPrediction = db.createPrediction({
      accountId: account.id,
      platform: account.platform,
      predictionPeriodStart: now.toISOString(),
      predictionPeriodEnd: periodEnd.toISOString(),
      predictedFollowers: prediction.predicted_followers,
      
      predictedEngagementRate: prediction.predicted_engagement,
      confidenceScore: prediction.confidence,
      modelVersion: '1.0'
    });

    return NextResponse.json({
      accountId,
      platform: account.platform,
      username: account.username,
      prediction: {
        ...prediction,
        period,
        periodEnd: periodEnd.toISOString()
      },
      predictionId: savedPrediction.id
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate prediction' }, { status: 500 });
  }
}