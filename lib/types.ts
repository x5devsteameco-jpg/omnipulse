export type SocialPlatform = 'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin';
export type GapType = 'content_gap' | 'timing_gap' | 'audience_gap' | 'format_gap';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type GapStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';

export interface AccountMetrics {
  platform: string;
  username: string;
  followers: number;
  following: number;
  posts: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  views: number;
  reach: number;
  impressions: number;
  lastUpdated: string;
}

export interface TrendingItem {
  topic: string;
  postsCount: number;
  engagement: number;
  velocity: number;
  timestamp: string;
}

export interface Prediction {
  predictedFollowers: number;
  predictedEngagement: number;
  predictedPosts: number;
  confidence: number;
  period: string;
  trendDirection: string;
}

export interface GapAnalysis {
  contentGaps: string[];
  timingGaps: string[];
  audienceGaps: string[];
  formatGaps: string[];
  recommendations: string[];
}

export interface FollowerBreakdown {
  demographics: Record<string, number>;
  locations: Record<string, number>;
  ageGroups: Record<string, number>;
  genderSplit: Record<string, number>;
  activeHours: Record<string, number>;
}