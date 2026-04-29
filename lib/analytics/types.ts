export interface Metrics {
  followersCount: number;
  followingCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  viewsCount: number;
  postsCount: number;
  engagementRate: number;
  followerGrowthRate: number;
  avgEngagementPerPost: number;
}

export interface MarketingGap {
  id: string;
  brandId: string;
  accountId: string;
  platform: string;
  gapType: 'audience_overlap' | 'content_gap' | 'timing_gap' | 'competitor' | 'platform_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  opportunity: string;
  competitorMetrics?: Record<string, number>;
  currentMetrics?: Record<string, number>;
  recommendedAction: string;
  estimatedImpact?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  identifiedAt: string;
  resolvedAt?: string;
}

export interface Prediction {
  id: string;
  accountId: string;
  platform: string;
  predictionType: 'followers' | 'engagement' | 'reach' | 'views';
  predictedValue: number;
  predictedRangeLow?: number;
  predictedRangeHigh?: number;
  confidenceScore: number;
  modelVersion: string;
  predictionPeriodStart: string;
  predictionPeriodEnd: string;
  actualValue?: number;
  accuracyScore?: number;
  predictedAt: string;
}

export interface TrendData {
  id: string;
  accountId: string;
  platform: string;
  periodStart: string;
  periodEnd: string;
  topPosts: Array<{
    postId: string;
    content: string;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    postedAt: string;
  }>;
  trendingHashtags: Array<{
    hashtag: string;
    count: number;
    velocity: number;
  }>;
  trendingTopics: Array<{
    topic: string;
    mentions: number;
    sentiment: number;
  }>;
  viralPostsCount: number;
  avgViralDurationHours: number;
  engagementVelocity: number;
}

export interface AnalyticsResult {
  metrics: Metrics;
  trends?: TrendData;
  gaps?: MarketingGap[];
  predictions?: Prediction[];
  calculatedAt: string;
}

export interface TrendVelocity {
  hashtag: string;
  currentVelocity: number;
  previousVelocity: number;
  acceleration: number;
  isAccelerating: boolean;
}

export interface GapAnalysis {
  gapType: string;
  severity: number;
  description: string;
  opportunity: string;
  recommendedAction: string;
  estimatedImpact: string;
}
