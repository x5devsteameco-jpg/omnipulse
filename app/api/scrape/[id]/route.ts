import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import SocialMediaScraper from '@/lib/scraper';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;

    const account = db.getAccount(accountId);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const scraper = new SocialMediaScraper({
      instagram: account.platform === 'instagram' ? account.accessToken || undefined : undefined,
      twitter: account.platform === 'twitter' ? account.accessToken || undefined : undefined,
      facebook: account.platform === 'facebook' ? account.accessToken || undefined : undefined,
      tiktok: account.platform === 'tiktok' ? account.accessToken || undefined : undefined,
      youtube: account.platform === 'youtube' ? account.accessToken || undefined : undefined,
      linkedin: account.platform === 'linkedin' ? account.accessToken || undefined : undefined,
    });

    const metrics = await scraper.fetchAccountMetrics(account.username, account.platform);
    const trending = await scraper.fetchTrendingContent(account.username, account.platform, 'week');
    const exposure = scraper.calculateExposureRate(metrics);

    const savedMetrics = db.createMetric({
      accountId: account.id,
      platform: account.platform,
      followersCount: metrics.followers,
      followingCount: metrics.following,
      likesCount: metrics.avgLikes * metrics.posts,
      commentsCount: metrics.avgComments * metrics.posts,
      viewsCount: metrics.views,
      postsCount: metrics.posts,
      engagementRate: metrics.engagementRate,
      avgEngagementPerPost: metrics.posts > 0 ? (metrics.avgLikes + metrics.avgComments) / metrics.posts : 0,
      rawData: metrics
    });

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    db.createTrend({
      accountId: account.id,
      platform: account.platform,
      periodStart: weekAgo.toISOString(),
      periodEnd: now.toISOString(),
      periodType: 'week',
      topPosts: trending.slice(0, 10),
      trendingTopics: trending.map(t => t.topic),
      viralPostsCount: trending.filter(t => t.engagement > 1000).length,
      rawData: { trending, exposure }
    });

    return NextResponse.json({
      metrics: savedMetrics,
      trending,
      exposure,
      scrapedAt: now.toISOString()
    });
  } catch {
    return NextResponse.json({ error: 'Failed to scrape account' }, { status: 500 });
  }
}