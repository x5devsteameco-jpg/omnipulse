import type { Metrics, TrendData, MarketingGap, Prediction } from '@/lib/analytics/types';
import type { TenantTier } from '@/lib/types/tenant';

export interface AnalyticsStrategy {
  calculateEngagementRate(metrics: Metrics): number;
  identifyGaps(metrics: Metrics, competitors?: Metrics[]): GapResult[];
  predictFollowers(historical: Metrics[], periods: number): PredictionResult;
  scoreConfidence(historical: Metrics[]): number;
  getPriority(): number;
}

export interface GapResult {
  type: 'audience_overlap' | 'content_gap' | 'timing_gap' | 'competitor' | 'platform_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendedAction: string;
}

export interface PredictionResult {
  value: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

export class BasicAnalyticsStrategy implements AnalyticsStrategy {
  getPriority(): number {
    return 1;
  }

  calculateEngagementRate(metrics: Metrics): number {
    const totalEngagement = metrics.likesCount + metrics.commentsCount + metrics.sharesCount;
    const reach = metrics.followersCount || 1;
    return (totalEngagement / reach) * 100;
  }

  identifyGaps(metrics: Metrics, competitors?: Metrics[]): GapResult[] {
    const gaps: GapResult[] = [];

    if (metrics.engagementRate < 2) {
      gaps.push({
        type: 'content_gap',
        severity: 'medium',
        title: 'Low Engagement Rate',
        description: `Engagement rate of ${metrics.engagementRate.toFixed(2)}% is below industry average`,
        recommendedAction: 'Test different content formats and posting times',
      });
    }

    if (metrics.followerGrowthRate < 0.5) {
      gaps.push({
        type: 'platform_opportunity',
        severity: 'low',
        title: 'Slow Follower Growth',
        description: 'Follower growth rate is below optimal threshold',
        recommendedAction: 'Increase posting frequency and explore collaboration opportunities',
      });
    }

    return gaps;
  }

  predictFollowers(historical: Metrics[], periods: number): PredictionResult {
    if (historical.length < 2) {
      return { value: historical[0]?.followersCount || 0, confidence: 0.3, trend: 'stable' };
    }

    const growthRates: number[] = [];
    for (let i = 1; i < historical.length; i++) {
      const prev = historical[i - 1].followersCount;
      const curr = historical[i].followersCount;
      if (prev > 0) {
        growthRates.push((curr - prev) / prev);
      }
    }

    const avgGrowthRate = growthRates.length > 0
      ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length
      : 0;

    const latest = historical[historical.length - 1].followersCount;
    const predicted = latest * Math.pow(1 + avgGrowthRate, periods);

    const trend = avgGrowthRate > 0.01 ? 'up' : avgGrowthRate < -0.01 ? 'down' : 'stable';
    const confidence = Math.min(0.8, historical.length / 20);

    return { value: Math.round(predicted), confidence, trend };
  }

  scoreConfidence(historical: Metrics[]): number {
    if (historical.length < 3) return 0.3;
    if (historical.length >= 30) return 0.9;

    return 0.3 + (historical.length / 30) * 0.6;
  }
}

export class StandardAnalyticsStrategy extends BasicAnalyticsStrategy {
  getPriority(): number {
    return 2;
  }

  calculateEngagementRate(metrics: Metrics): number {
    const base = super.calculateEngagementRate(metrics);
    const followerBonus = Math.min(metrics.followerGrowthRate * 0.1, 0.5);
    return base * (1 + followerBonus);
  }

  predictFollowers(historical: Metrics[], periods: number): PredictionResult {
    const base = super.predictFollowers(historical, periods);
    return {
      ...base,
      confidence: Math.min(base.confidence * 1.1, 0.92),
    };
  }
}

export class MLAnalyticsStrategy extends StandardAnalyticsStrategy {
  getPriority(): number {
    return 3;
  }

  predictFollowers(historical: Metrics[], periods: number): PredictionResult {
    if (historical.length < 14) {
      return super.predictFollowers(historical, periods);
    }

    const base = super.predictFollowers(historical, periods);

    const recentMomentum = this.calculateMomentum(historical);
    const acceleration = this.calculateAcceleration(historical);

    const adjustment = 1 + (recentMomentum * acceleration * 0.001);
    const adjustedValue = base.value * adjustment;

    return {
      value: Math.round(adjustedValue),
      confidence: Math.min(base.confidence * 1.15, 0.95),
      trend: base.trend,
    };
  }

  scoreConfidence(historical: Metrics[]): number {
    const base = super.scoreConfidence(historical);
    if (historical.length >= 30) {
      return Math.min(base * 1.1, 0.98);
    }
    return base;
  }

  private calculateMomentum(historical: Metrics[]): number {
    if (historical.length < 7) return 0;

    const recent = historical.slice(-7);
    const earlier = historical.slice(-14, -7);

    const recentAvg = recent.reduce((s, m) => s + m.followerGrowthRate, 0) / recent.length;
    const earlierAvg = earlier.length > 0
      ? earlier.reduce((s, m) => s + m.followerGrowthRate, 0) / earlier.length
      : recentAvg;

    return recentAvg - earlierAvg;
  }

  private calculateAcceleration(historical: Metrics[]): number {
    if (historical.length < 14) return 0;

    const growthRates = historical.slice(-7).map((m) => m.followerGrowthRate);
    const earlier = historical.slice(-14, -7).map((m) => m.followerGrowthRate);

    const recentTrend = this.linearTrend(growthRates);
    const earlierTrend = this.linearTrend(earlier);

    return recentTrend - earlierTrend;
  }

  private linearTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }
}

export class StrategyFactory {
  private static instance: StrategyFactory;

  static getInstance(): StrategyFactory {
    if (!StrategyFactory.instance) {
      StrategyFactory.instance = new StrategyFactory();
    }
    return StrategyFactory.instance;
  }

  resolveAnalyticsStrategy(tier: TenantTier): AnalyticsStrategy {
    switch (tier) {
      case 'enterprise':
        return new MLAnalyticsStrategy();
      case 'professional':
        return new StandardAnalyticsStrategy();
      default:
        return new BasicAnalyticsStrategy();
    }
  }

  resolveForMetricsCount(metricsCount: number, tier: TenantTier): AnalyticsStrategy {
    if (tier === 'enterprise' || (tier === 'professional' && metricsCount >= 14)) {
      return new MLAnalyticsStrategy();
    }
    if (tier === 'professional' || metricsCount >= 7) {
      return new StandardAnalyticsStrategy();
    }
    return new BasicAnalyticsStrategy();
  }
}

export function getAnalyticsStrategy(tier: TenantTier): AnalyticsStrategy {
  return StrategyFactory.getInstance().resolveAnalyticsStrategy(tier);
}
