import type { Metrics, MarketingGap, GapAnalysis } from './types';

interface GapThresholds {
  audienceOverlap: number;
  engagementDiff: number;
  contentGap: number;
  timingGap: number;
}

const DEFAULT_THRESHOLDS: GapThresholds = {
  audienceOverlap: 0.3,
  engagementDiff: 0.2,
  contentGap: 0.25,
  timingGap: 0.15,
};

export interface GapAnalyzerConfig {
  thresholds: GapThresholds;
  competitorLookbackDays: number;
  minSampleSize: number;
}

export class MarketingGapAnalyzer {
  private config: GapAnalyzerConfig;

  constructor(config?: Partial<GapAnalyzerConfig>) {
    this.config = {
      thresholds: config?.thresholds || DEFAULT_THRESHOLDS,
      competitorLookbackDays: config?.competitorLookbackDays || 30,
      minSampleSize: config?.minSampleSize || 10,
    };
  }

  identifyGaps(
    brandId: string,
    accountId: string,
    platform: string,
    currentMetrics: Metrics,
    competitorMetrics?: Metrics[]
  ): GapAnalysis[] {
    const gaps: GapAnalysis[] = [];

    if (competitorMetrics && competitorMetrics.length >= this.config.minSampleSize) {
      gaps.push(...this.analyzeAudienceOverlap(brandId, accountId, platform, currentMetrics, competitorMetrics));
      gaps.push(...this.analyzeEngagementGap(brandId, accountId, platform, currentMetrics, competitorMetrics));
      gaps.push(...this.analyzeContentGap(brandId, accountId, platform, currentMetrics, competitorMetrics));
    }

    gaps.push(...this.analyzeTimingGap(brandId, accountId, platform, currentMetrics));
    gaps.push(...this.analyzePlatformOpportunity(brandId, accountId, platform, currentMetrics));

    return gaps.sort((a, b) => b.severity - a.severity);
  }

  private analyzeAudienceOverlap(
    brandId: string,
    accountId: string,
    platform: string,
    current: Metrics,
    competitors: Metrics[]
  ): GapAnalysis[] {
    const gaps: GapAnalysis[] = [];

    const avgFollowers = this.average(competitors.map((c) => c.followersCount));
    const currentFollowers = current.followersCount;

    const overlapRatio = Math.min(currentFollowers, avgFollowers) / Math.max(currentFollowers, avgFollowers);
    const uniqueAudiencePercent = (1 - overlapRatio) * 100;

    if (uniqueAudiencePercent > this.config.thresholds.audienceOverlap * 100) {
      gaps.push({
        gapType: 'audience_overlap',
        severity: uniqueAudiencePercent > 50 ? 0.9 : uniqueAudiencePercent > 30 ? 0.7 : 0.5,
        description: `Only ${(overlapRatio * 100).toFixed(0)}% audience overlap with competitors`,
        opportunity: `${uniqueAudiencePercent.toFixed(0)}% of competitor audience is not following your account`,
        recommendedAction: 'Run targeted follower acquisition campaigns focusing on competitor audience segments',
        estimatedImpact: `${(uniqueAudiencePercent * current.followersCount * 0.1).toFixed(0)} potential new followers`,
      });
    }

    return gaps;
  }

  private analyzeEngagementGap(
    brandId: string,
    accountId: string,
    platform: string,
    current: Metrics,
    competitors: Metrics[]
  ): GapAnalysis[] {
    const gaps: GapAnalysis[] = [];

    const avgEngagement = this.average(competitors.map((c) => c.engagementRate));
    const engagementDiff = avgEngagement - current.engagementRate;

    if (engagementDiff > this.config.thresholds.engagementDiff) {
      const severity = engagementDiff > 0.1 ? 0.9 : engagementDiff > 0.05 ? 0.7 : 0.5;
      gaps.push({
        gapType: 'competitor',
        severity,
        description: `Your engagement rate (${current.engagementRate.toFixed(2)}%) is ${(engagementDiff * 100).toFixed(1)}% lower than competitors`,
        opportunity: 'Improving engagement to match competitor average could increase visibility by 15-25%',
        recommendedAction: 'Analyze top-performing competitor content and test similar formats. Focus on interactive content types.',
        estimatedImpact: `+${(engagementDiff * 100).toFixed(1)}% engagement rate potential`,
      });
    }

    return gaps;
  }

  private analyzeContentGap(
    brandId: string,
    accountId: string,
    platform: string,
    current: Metrics,
    competitors: Metrics[]
  ): GapAnalysis[] {
    const gaps: GapAnalysis[] = [];

    const avgPosts = this.average(competitors.map((c) => c.postsCount));
    const postDiff = avgPosts - current.postsCount;

    if (postDiff > this.config.thresholds.contentGap * avgPosts) {
      gaps.push({
        gapType: 'content_gap',
        severity: postDiff > avgPosts * 0.5 ? 0.8 : 0.5,
        description: `Posting frequency is ${((postDiff / avgPosts) * 100).toFixed(0)}% lower than competitors`,
        opportunity: 'Increasing posting frequency within optimal engagement windows could grow audience by 8-12%',
        recommendedAction: 'Develop a content calendar and batch create content. Use scheduling tools.',
        estimatedImpact: `${(postDiff * 0.1).toFixed(0)} additional posts could yield ${((postDiff * 0.1 * current.followerGrowthRate)).toFixed(0)} new followers/month`,
      });
    }

    return gaps;
  }

  private analyzeTimingGap(
    brandId: string,
    accountId: string,
    platform: string,
    current: Metrics
  ): GapAnalysis[] {
    const gaps: GapAnalysis[] = [];

    if (current.avgEngagementPerPost < current.engagementRate * current.followersCount * 0.01 * 0.5) {
      gaps.push({
        gapType: 'timing_gap',
        severity: 0.6,
        description: 'Average engagement per post suggests suboptimal posting times',
        opportunity: 'Posts at peak audience activity times could increase engagement by 20-35%',
        recommendedAction: 'Analyze when your audience is most active. Use platform insights to determine optimal posting windows.',
        estimatedImpact: '+25% engagement potential',
      });
    }

    return gaps;
  }

  private analyzePlatformOpportunity(
    brandId: string,
    accountId: string,
    platform: string,
    current: Metrics
  ): GapAnalysis[] {
    const gaps: GapAnalysis[] = [];

    if (current.followersCount > 100000 && platform === 'instagram') {
      gaps.push({
        gapType: 'platform_opportunity',
        severity: 0.7,
        description: 'Large Instagram following but limited cross-platform presence',
        opportunity: 'Content cross-posting to TikTok and YouTube could leverage existing audience',
        recommendedAction: 'Repurpose top Instagram Reels for TikTok. Create YouTube Shorts from existing content.',
        estimatedImpact: 'Potential 30-50% audience growth on secondary platforms',
      });
    }

    return gaps;
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  toMarketingGaps(
    brandId: string,
    accountId: string,
    platform: string,
    analyses: GapAnalysis[]
  ): MarketingGap[] {
    return analyses.map((analysis, index) => ({
      id: `gap_${Date.now()}_${index}`,
      brandId,
      accountId,
      platform,
      gapType: analysis.gapType as MarketingGap['gapType'],
      severity: this.severityToLevel(analysis.severity),
      title: this.generateTitle(analysis),
      description: analysis.description,
      opportunity: analysis.opportunity,
      recommendedAction: analysis.recommendedAction,
      estimatedImpact: analysis.estimatedImpact,
      status: 'open' as const,
      identifiedAt: new Date().toISOString(),
    }));
  }

  private severityToLevel(severity: number): MarketingGap['severity'] {
    if (severity >= 0.8) return 'critical';
    if (severity >= 0.6) return 'high';
    if (severity >= 0.4) return 'medium';
    return 'low';
  }

  private generateTitle(analysis: GapAnalysis): string {
    const titles: Record<string, string> = {
      audience_overlap: 'Audience Overlap Opportunity',
      content_gap: 'Content Frequency Gap',
      timing_gap: 'Posting Time Optimization Opportunity',
      competitor: 'Competitive Engagement Gap',
      platform_opportunity: 'Cross-Platform Expansion Opportunity',
    };
    return titles[analysis.gapType] || 'Marketing Gap Identified';
  }
}

let gapAnalyzerInstance: MarketingGapAnalyzer | null = null;

export function getGapAnalyzer(config?: Partial<GapAnalyzerConfig>): MarketingGapAnalyzer {
  if (!gapAnalyzerInstance) {
    gapAnalyzerInstance = new MarketingGapAnalyzer(config);
  }
  return gapAnalyzerInstance;
}
