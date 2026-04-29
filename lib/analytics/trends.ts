import type { Metrics, TrendData, TrendVelocity } from './types';

export interface TrendStrategy {
  extractTrending(trendData: TrendData): TrendVelocity[];
  calculateVelocity(post: TrendData['topPosts'][0]): number;
  identifyHashtags(trendData: TrendData): string[];
  calculateMomentum(trendData: TrendData): number;
}

export class BasicTrendStrategy implements TrendStrategy {
  extractTrending(trendData: TrendData): TrendVelocity[] {
    const hashtagMap = new Map<string, { count: number; velocity: number }>();

    for (const post of trendData.topPosts) {
      const hashtags = this.extractHashtags(post.content);
      for (const hashtag of hashtags) {
        const existing = hashtagMap.get(hashtag) || { count: 0, velocity: 0 };
        hashtagMap.set(hashtag, {
          count: existing.count + 1,
          velocity: existing.velocity + this.calculateVelocity(post),
        });
      }
    }

    return Array.from(hashtagMap.entries())
      .map(([hashtag, data]) => ({
        hashtag,
        currentVelocity: data.velocity,
        previousVelocity: data.velocity * 0.85,
        acceleration: data.velocity * 0.15,
        isAccelerating: true,
      }))
      .sort((a, b) => b.currentVelocity - a.currentVelocity);
  }

  calculateVelocity(post: TrendData['topPosts'][0]): number {
    const totalEngagement = post.likes + post.comments + post.shares;
    const hoursAgo = this.hoursSince(post.postedAt);
    if (hoursAgo === 0) return totalEngagement;
    return totalEngagement / hoursAgo;
  }

  identifyHashtags(trendData: TrendData): string[] {
    const hashtagCounts = new Map<string, number>();

    for (const post of trendData.topPosts) {
      const hashtags = this.extractHashtags(post.content);
      for (const hashtag of hashtags) {
        hashtagCounts.set(hashtag, (hashtagCounts.get(hashtag) || 0) + 1);
      }
    }

    return Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([hashtag]) => hashtag);
  }

  calculateMomentum(trendData: TrendData): number {
    if (trendData.topPosts.length === 0) return 0;

    const totalEngagement = trendData.topPosts.reduce(
      (sum, post) => sum + post.likes + post.comments + post.shares,
      0
    );

    const avgEngagement = totalEngagement / trendData.topPosts.length;
    const viralRatio = trendData.viralPostsCount / trendData.topPosts.length;

    return avgEngagement * viralRatio * (trendData.engagementVelocity + 1);
  }

  protected extractHashtags(content: string): string[] {
    const matches = content.match(/#[\w]+/g);
    return matches ? matches.map((h) => h.toLowerCase()) : [];
  }

  private hoursSince(dateStr: string): number {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.max(1, (now.getTime() - date.getTime()) / (1000 * 60 * 60));
  }
}

export class SentimentAwareTrendStrategy extends BasicTrendStrategy {
  identifyHashtags(trendData: TrendData): string[] {
    const hashtagScores = new Map<string, { count: number; avgSentiment: number }>();

    for (const post of trendData.topPosts) {
      const hashtags = this.extractHashtags(post.content);
      const sentiment = this.estimateSentiment(post);

      for (const hashtag of hashtags) {
        const existing = hashtagScores.get(hashtag) || { count: 0, avgSentiment: 0 };
        hashtagScores.set(hashtag, {
          count: existing.count + 1,
          avgSentiment: (existing.avgSentiment * existing.count + sentiment) / (existing.count + 1),
        });
      }
    }

    return Array.from(hashtagScores.entries())
      .filter(([, data]) => data.avgSentiment > 0)
      .sort((a, b) => b[1].avgSentiment * b[1].count - a[1].avgSentiment * a[1].count)
      .slice(0, 20)
      .map(([hashtag]) => hashtag);
  }

  protected estimateSentiment(post: TrendData['topPosts'][0]): number {
    const positiveWords = ['love', 'amazing', 'best', 'great', 'awesome', 'beautiful', 'incredible'];
    const negativeWords = ['hate', 'worst', 'bad', 'terrible', 'awful', 'horrible', 'sucks'];

    const content = post.content.toLowerCase();
    let score = 0;

    for (const word of positiveWords) {
      if (content.includes(word)) score += 0.2;
    }
    for (const word of negativeWords) {
      if (content.includes(word)) score -= 0.2;
    }

    const engagementRatio = post.likes / (post.comments + 1);
    if (engagementRatio > 10) score += 0.1;
    if (engagementRatio < 2) score -= 0.1;

    return Math.max(-1, Math.min(1, score));
  }
}

let trendStrategyInstance: TrendStrategy | null = null;

export function getTrendStrategy(sentimentAware: boolean = false): TrendStrategy {
  if (!trendStrategyInstance) {
    trendStrategyInstance = sentimentAware
      ? new SentimentAwareTrendStrategy()
      : new BasicTrendStrategy();
  }
  return trendStrategyInstance;
}
