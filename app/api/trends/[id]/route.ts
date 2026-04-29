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
    const period = searchParams.get('period') || 'week';

    const account = db.getAccount(accountId);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const recentTrends = db.getTrends(accountId);

    if (recentTrends.length > 0) {
      return NextResponse.json({
        accountId,
        platform: account.platform,
        username: account.username,
        trends: recentTrends,
        count: recentTrends.length
      });
    }

    const scraper = new SocialMediaScraper();
    const trending = await scraper.fetchTrendingContent(account.username, account.platform, period);

    const now = new Date();
    const periodMs = period === 'day' ? 86400000 : period === 'week' ? 7 * 86400000 : period === 'month' ? 30 * 86400000 : 365 * 86400000;

    const savedTrend = db.createTrend({
      accountId: account.id,
      platform: account.platform,
      periodStart: new Date(now.getTime() - periodMs).toISOString(),
      periodEnd: now.toISOString(),
      periodType: period,
      trendingTopics: trending.map(t => t.topic),
      trendingHashtags: trending.filter(t => t.topic.startsWith('#')).map(t => t.topic),
      viralPostsCount: trending.filter(t => t.engagement > 1000).length,
      rawData: trending
    });

    return NextResponse.json({
      accountId,
      platform: account.platform,
      username: account.username,
      period,
      trends: [savedTrend],
      trendingItems: trending,
      count: trending.length
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}