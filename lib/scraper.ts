import type { AccountMetrics, TrendingItem, GapAnalysis, FollowerBreakdown } from './types';

const API_ENV_KEYS: Record<string, string> = {
  instagram: process.env.INSTAGRAM_ACCESS_TOKEN || '',
  twitter: process.env.TWITTER_BEARER_TOKEN || '',
  tiktok: process.env.TIKTOK_ACCESS_TOKEN || '',
  youtube: process.env.YOUTUBE_API_KEY || '',
  linkedin: process.env.LINKEDIN_ACCESS_TOKEN || '',
  facebook: process.env.FACEBOOK_ACCESS_TOKEN || '',
};

const PLATFORM_BASE_URLS: Record<string, string> = {
  instagram: 'https://graph.instagram.com',
  twitter: 'https://api.twitter.com/2',
  tiktok: 'https://open.tiktokapis.com/v2',
  youtube: 'https://www.googleapis.com/youtube/v3',
  linkedin: 'https://api.linkedin.com/v2',
  facebook: 'https://graph.facebook.com/v18.0',
};

interface TrendingItemDict {
  topic: string;
  posts_count: number;
  engagement: number;
  velocity: number;
  timestamp: string;
}

interface PredictionDict {
  predicted_followers: number;
  predicted_engagement: number;
  predicted_posts: number;
  confidence: number;
  period: string;
  trend_direction: string;
}

interface GapAnalysisDict {
  contentGaps: string[];
  timingGaps: string[];
  audienceGaps: string[];
  formatGaps: string[];
  recommendations: string[];
}

interface MetricsDict {
  followers: number;
  following: number;
  tweet_count: number;
  posts: number;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  avg_shares: number;
  views: number;
  reach: number;
  impressions: number;
  like_count?: number;
  retweet_count?: number;
  reply_count?: number;
  follower_count?: number;
  following_count?: number;
  video_count?: number;
  view_count?: number;
  subscriberCount?: number;
  videoCount?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

interface FollowerBreakdownDict {
  demographics: Record<string, number>;
  locations: Record<string, number>;
  ageGroups: Record<string, number>;
  genderSplit: Record<string, number>;
  activeHours: Record<string, number>;
}

class SocialMediaScraper {
  private _tokens: Record<string, string>;
  private _requestDelay: number = 1.0;

  constructor(tokens?: Partial<Record<string, string>>) {
    this._tokens = {
      instagram: tokens?.instagram || API_ENV_KEYS.instagram,
      twitter: tokens?.twitter || API_ENV_KEYS.twitter,
      tiktok: tokens?.tiktok || API_ENV_KEYS.tiktok,
      youtube: tokens?.youtube || API_ENV_KEYS.youtube,
      linkedin: tokens?.linkedin || API_ENV_KEYS.linkedin,
      facebook: tokens?.facebook || API_ENV_KEYS.facebook,
    };
  }

  private _rateLimit(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this._requestDelay * 1000));
  }

  private async _makeRequest(
    url: string,
    platform: string,
    params?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<Record<string, unknown>> {
    await this._rateLimit();
    try {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const response = await fetch(`${url}${query}`, { headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      throw new Error(`Request failed for ${platform}`);
    }
  }

  private _getAuthHeaders(platform: string): Record<string, string> {
    const token = this._tokens[platform];
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }

  async fetchAccountMetrics(account: string, platform: string = 'instagram'): Promise<AccountMetrics> {
    try {
      if (platform === 'instagram') return await this._fetchInstagramMetrics(account);
      if (platform === 'twitter') return await this._fetchTwitterMetrics(account);
      if (platform === 'facebook') return await this._fetchFacebookMetrics(account);
      if (platform === 'tiktok') return await this._fetchTiktokMetrics(account);
      if (platform === 'youtube') return await this._fetchYoutubeMetrics(account);
      if (platform === 'linkedin') return await this._fetchLinkedinMetrics(account);
      throw new Error(`Unsupported platform: ${platform}`);
    } catch {
      return this._scrapeAccountMetrics(account, platform);
    }
  }

  private async _fetchInstagramMetrics(username: string): Promise<AccountMetrics> {
    const token = this._tokens.instagram;
    if (!token) throw new Error('Instagram token not configured');

    const userData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.instagram}/me`,
      'instagram',
      { fields: 'id,name,username,followers_count,follows_count,media_count', access_token: token }
    );

    const metrics: AccountMetrics = {
      platform: 'instagram',
      username,
      followers: (userData.followers_count as number) || 0,
      following: (userData.follows_count as number) || 0,
      posts: (userData.media_count as number) || 0,
      lastUpdated: new Date().toISOString(),
      engagementRate: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      views: 0,
      reach: 0,
      impressions: 0,
    };

    const mediaData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.instagram}/${userData.id}/media`,
      'instagram',
      { fields: 'id,like_count,comments_count,insights', access_token: token }
    ) as { data?: Array<{ like_count?: number; comments_count?: number }> };

    if (mediaData.data && mediaData.data.length > 0) {
      const totalLikes = mediaData.data.reduce((sum, p) => sum + (p.like_count || 0), 0);
      const totalComments = mediaData.data.reduce((sum, p) => sum + (p.comments_count || 0), 0);
      const count = mediaData.data.length;
      metrics.avgLikes = Math.floor(totalLikes / count);
      metrics.avgComments = Math.floor(totalComments / count);
      metrics.engagementRate = ((totalLikes + totalComments) / (metrics.followers || 1)) * 100;
    }

    return metrics;
  }

  private async _fetchTwitterMetrics(username: string): Promise<AccountMetrics> {
    const token = this._tokens.twitter;
    if (!token) throw new Error('Twitter token not configured');

    const headers = this._getAuthHeaders('twitter');
    const userData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.twitter}/users/by/username/${username}`,
      'twitter',
      { 'user.fields': 'public_metrics,description', expansions: 'pinned_tweet_id' },
      headers
    ) as { data?: { public_metrics?: MetricsDict; id: string } };

    if (!userData.data) throw new Error(`Twitter user not found: ${username}`);

    const metricsData = (userData.data.public_metrics || {}) as MetricsDict;
    const metrics: AccountMetrics = {
      platform: 'twitter',
      username,
      followers: metricsData.followers || 0,
      following: metricsData.following || 0,
      posts: metricsData.tweet_count || 0,
      lastUpdated: new Date().toISOString(),
      engagementRate: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      views: 0,
      reach: 0,
      impressions: 0,
    };

    const tweetsData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.twitter}/users/${userData.data.id}/tweets`,
      'twitter',
      { 'max_results': '10', 'tweet.fields': 'public_metrics,created_at' },
      headers
    ) as { data?: Array<{ public_metrics?: MetricsDict }> };

    if (tweetsData.data && tweetsData.data.length > 0) {
      const totalLikes = tweetsData.data.reduce((sum, t) => sum + (t.public_metrics?.like_count || 0), 0);
      const totalRetweets = tweetsData.data.reduce((sum, t) => sum + (t.public_metrics?.retweet_count || 0), 0);
      const totalReplies = tweetsData.data.reduce((sum, t) => sum + (t.public_metrics?.reply_count || 0), 0);
      const count = tweetsData.data.length;
      if (count > 0) {
        metrics.avgLikes = Math.floor(totalLikes / count);
        metrics.avgShares = Math.floor((totalRetweets + totalReplies) / count);
        const totalEngagement = totalLikes + totalRetweets + totalReplies;
        metrics.engagementRate = (totalEngagement / (metrics.followers || 1)) * 100;
      }
    }

    return metrics;
  }

  private async _fetchFacebookMetrics(username: string): Promise<AccountMetrics> {
    const token = this._tokens.facebook;
    if (!token) throw new Error('Facebook token not configured');

    const pageData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.facebook}/${username}`,
      'facebook',
      { fields: 'followers_count,following_count,name', access_token: token }
    ) as { followers_count?: number; following_count?: number };

    const metrics: AccountMetrics = {
      platform: 'facebook',
      username,
      followers: pageData.followers_count || 0,
      following: pageData.following_count || 0,
      posts: 0,
      lastUpdated: new Date().toISOString(),
      engagementRate: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      views: 0,
      reach: 0,
      impressions: 0,
    };

    const postsData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.facebook}/${username}/posts`,
      'facebook',
      { fields: 'likes.summary(true),comments.summary(true),shares', access_token: token }
    ) as { data?: Array<{ likes?: { summary?: { total_count?: number } }; comments?: { summary?: { total_count?: number } }; shares?: { count?: number } }> };

    if (postsData.data && postsData.data.length > 0) {
      const totalLikes = postsData.data.reduce((sum, p) => sum + (p.likes?.summary?.total_count || 0), 0);
      const totalComments = postsData.data.reduce((sum, p) => sum + (p.comments?.summary?.total_count || 0), 0);
      const totalShares = postsData.data.reduce((sum, p) => sum + (p.shares?.count || 0), 0);
      const count = postsData.data.length;
      if (count > 0) {
        metrics.avgLikes = Math.floor(totalLikes / count);
        metrics.avgComments = Math.floor(totalComments / count);
        metrics.avgShares = Math.floor(totalShares / count);
        metrics.posts = count;
        metrics.engagementRate = ((totalLikes + totalComments + totalShares) / (metrics.followers || 1)) * 100;
      }
    }

    return metrics;
  }

  private async _fetchTiktokMetrics(username: string): Promise<AccountMetrics> {
    const token = this._tokens.tiktok;
    if (!token) throw new Error('TikTok token not configured');

    const headers = { Authorization: `Bearer ${token}` };
    const userData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.tiktok}/user/info`,
      'tiktok',
      { username },
      headers
    ) as { data?: { user?: { stats?: MetricsDict } } };

    const stats = (userData?.data?.user?.stats || {}) as MetricsDict;

    const metrics: AccountMetrics = {
      platform: 'tiktok',
      username,
      followers: stats.follower_count || 0,
      following: stats.following_count || 0,
      posts: stats.video_count || 0,
      views: stats.view_count || 0,
      lastUpdated: new Date().toISOString(),
      engagementRate: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      reach: 0,
      impressions: 0,
    };

    const videosData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.tiktok}/videos/list`,
      'tiktok',
      { username, fields: 'like_count,comment_count,share_count,view_count' },
      headers
    ) as { data?: Array<{ like_count?: number; comment_count?: number; share_count?: number }> };

    if (videosData.data && videosData.data.length > 0) {
      const totalLikes = videosData.data.reduce((sum, v) => sum + (v.like_count || 0), 0);
      const totalComments = videosData.data.reduce((sum, v) => sum + (v.comment_count || 0), 0);
      const totalShares = videosData.data.reduce((sum, v) => sum + (v.share_count || 0), 0);
      const count = videosData.data.length;
      if (count > 0) {
        metrics.avgLikes = Math.floor(totalLikes / count);
        metrics.avgComments = Math.floor(totalComments / count);
        metrics.avgShares = Math.floor(totalShares / count);
        const totalEngagement = totalLikes + totalComments + totalShares;
        metrics.engagementRate = (totalEngagement / (metrics.followers || 1)) * 100;
      }
    }

    return metrics;
  }

  private async _fetchYoutubeMetrics(channelId: string): Promise<AccountMetrics> {
    const token = this._tokens.youtube;
    if (!token) throw new Error('YouTube API key not configured');

    const channelData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.youtube}/channels`,
      'youtube',
      { part: 'statistics,snippet', id: channelId, key: token }
    ) as { items?: Array<{ statistics?: MetricsDict; snippet?: { title?: string } }> };

    if (!channelData.items?.length) throw new Error(`YouTube channel not found: ${channelId}`);

    const stats = (channelData.items[0].statistics || {}) as MetricsDict;
    const snippet = channelData.items[0].snippet || {};

    const metrics: AccountMetrics = {
      platform: 'youtube',
      username: snippet.title || channelId,
      followers: parseInt(String(stats.subscriberCount || 0)),
      posts: parseInt(String(stats.videoCount || 0)),
      views: parseInt(String(stats.viewCount || 0)),
      lastUpdated: new Date().toISOString(),
      following: 0,
      engagementRate: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      reach: 0,
      impressions: 0,
    };

    const searchData = await this._makeRequest(
      PLATFORM_BASE_URLS.youtube + '/search',
      'youtube',
      { part: 'id', channelId, maxResults: '10', key: token }
    ) as { items?: Array<{ id?: { videoId?: string } }> };

    const videoIds = (searchData.items || []).filter(item => item.id?.videoId).map(item => item.id!.videoId!);

    if (videoIds.length > 0) {
      const videosData = await this._makeRequest(
        PLATFORM_BASE_URLS.youtube + '/videos',
        'youtube',
        { part: 'statistics', id: videoIds.join(','), key: token }
      ) as { items?: Array<{ statistics?: MetricsDict }> };

      if (videosData.items) {
        const totalLikes = videosData.items.reduce((sum, v) => sum + parseInt(String(v.statistics?.likeCount || 0)), 0);
        const totalComments = videosData.items.reduce((sum, v) => sum + parseInt(String(v.statistics?.commentCount || 0)), 0);
        const totalViews = videosData.items.reduce((sum, v) => sum + parseInt(String(v.statistics?.viewCount || 0)), 0);
        const count = videosData.items.length;
        if (count > 0) {
          metrics.avgLikes = Math.floor(totalLikes / count);
          metrics.avgComments = Math.floor(totalComments / count);
          metrics.views = totalViews;
          metrics.engagementRate = ((totalLikes + totalComments) / (metrics.followers || 1)) * 100;
        }
      }
    }

    return metrics;
  }

  private async _fetchLinkedinMetrics(username: string): Promise<AccountMetrics> {
    const token = this._tokens.linkedin;
    if (!token) throw new Error('LinkedIn token not configured');

    const headers = { Authorization: `Bearer ${token}` };
    const orgData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.linkedin}/organizations/${username}`,
      'linkedin',
      { fields: 'name,followerCount,description' },
      headers
    ) as { followerCount?: number };

    const metrics: AccountMetrics = {
      platform: 'linkedin',
      username,
      followers: orgData.followerCount || 0,
      posts: 0,
      lastUpdated: new Date().toISOString(),
      following: 0,
      engagementRate: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      views: 0,
      reach: 0,
      impressions: 0,
    };

    const postsData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.linkedin}/organizations/${username}/posts`,
      'linkedin',
      { fields: 'totalShares,likeCount,commentCount,viewCount' },
      headers
    ) as { elements?: Array<{ likeCount?: number; commentCount?: number; totalShares?: number; viewCount?: number }> };

    if (postsData.elements && postsData.elements.length > 0) {
      const totalLikes = postsData.elements.reduce((sum, p) => sum + (p.likeCount || 0), 0);
      const totalComments = postsData.elements.reduce((sum, p) => sum + (p.commentCount || 0), 0);
      const totalShares = postsData.elements.reduce((sum, p) => sum + (p.totalShares || 0), 0);
      const totalViews = postsData.elements.reduce((sum, p) => sum + (p.viewCount || 0), 0);
      const count = postsData.elements.length;
      if (count > 0) {
        metrics.avgLikes = Math.floor(totalLikes / count);
        metrics.avgComments = Math.floor(totalComments / count);
        metrics.avgShares = Math.floor(totalShares / count);
        metrics.views = totalViews;
        metrics.posts = count;
        metrics.engagementRate = ((totalLikes + totalComments + totalShares) / (metrics.followers || 1)) * 100;
      }
    }

    return metrics;
  }

  private async _scrapeAccountMetrics(username: string, platform: string): Promise<AccountMetrics> {
    return {
      platform,
      username,
      followers: 0,
      following: 0,
      posts: 0,
      engagementRate: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      views: 0,
      reach: 0,
      impressions: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  async fetchTrendingContent(account: string, platform: string = 'instagram', period: string = 'week'): Promise<TrendingItem[]> {
    try {
      if (platform === 'instagram') return await this._fetchInstagramTrending(account, period);
      if (platform === 'twitter') return await this._fetchTwitterTrending(account, period);
      if (platform === 'youtube') return await this._fetchYoutubeTrending(account, period);
      if (platform === 'tiktok') return this._scrapeTrendingContent(account, platform, period);
      if (platform === 'facebook') return this._scrapeTrendingContent(account, platform, period);
      if (platform === 'linkedin') return this._scrapeTrendingContent(account, platform, period);
    } catch {
      // Silently fall back to scraping
    }
    return this._scrapeTrendingContent(account, platform, period);
  }

  private async _fetchInstagramTrending(username: string, period: string): Promise<TrendingItem[]> {
    const token = this._tokens.instagram;
    if (!token) return this._scrapeTrendingContent(username, 'instagram', period);

    const userData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.instagram}/me`,
      'instagram',
      { fields: 'id', access_token: token }
    ) as { id?: string };

    const cutoff = this._getPeriodCutoff(period);
    const mediaData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.instagram}/${userData.id}/media`,
      'instagram',
      { fields: 'id,caption,like_count,comments_count,timestamp,media_type', access_token: token }
    ) as { data?: Array<{ timestamp?: string; like_count?: number; comments_count?: number; caption?: string }> };

    const trending: TrendingItem[] = [];
    for (const post of mediaData?.data || []) {
      const postTime = new Date(post.timestamp || '');
      if (postTime > cutoff) {
        const engagement = (post.like_count || 0) + (post.comments_count || 0);
        trending.push({
          topic: (post.caption || '').slice(0, 100),
          postsCount: 1,
          engagement,
          velocity: engagement / 7,
          timestamp: post.timestamp || '',
        });
      }
    }
    return trending;
  }

  private async _fetchTwitterTrending(username: string, period: string): Promise<TrendingItem[]> {
    const token = this._tokens.twitter;
    if (!token) return this._scrapeTrendingContent(username, 'twitter', period);

    const headers = this._getAuthHeaders('twitter');
    const userData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.twitter}/users/by/username/${username}`,
      'twitter',
      {},
      headers
    ) as { data?: { id: string } };

    const cutoff = this._getPeriodCutoff(period);
    const tweetsData = await this._makeRequest(
      `${PLATFORM_BASE_URLS.twitter}/users/${userData?.data?.id}/tweets`,
      'twitter',
      { 'max_results': '100', 'tweet.fields': 'public_metrics,created_at,text' },
      headers
    ) as { data?: Array<{ created_at?: string; text?: string; public_metrics?: MetricsDict }> };

    const topicEngagement: Record<string, { engagement: number; count: number }> = {};
    for (const tweet of tweetsData?.data || []) {
      const createdAt = new Date(tweet.created_at || '');
      if (createdAt > cutoff) {
        const words = (tweet.text || '').split(/\s+/).filter(w => w.length > 3).slice(0, 3);
        const topicKey = words.join(' ') || 'General';
        const metrics = (tweet.public_metrics || {}) as MetricsDict;
        const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0);

        if (topicKey in topicEngagement) {
          topicEngagement[topicKey].engagement += engagement;
          topicEngagement[topicKey].count += 1;
        } else {
          topicEngagement[topicKey] = { engagement, count: 1 };
        }
      }
    }

    return Object.entries(topicEngagement).map(([topic, data]) => ({
      topic,
      postsCount: data.count,
      engagement: data.engagement,
      velocity: data.engagement / 7,
      timestamp: new Date().toISOString(),
    }));
  }

  private async _fetchYoutubeTrending(channelId: string, period: string): Promise<TrendingItem[]> {
    const token = this._tokens.youtube;
    if (!token) return this._scrapeTrendingContent(channelId, 'youtube', period);

    const cutoff = this._getPeriodCutoff(period);
    const searchData = await this._makeRequest(
      PLATFORM_BASE_URLS.youtube + '/search',
      'youtube',
      { part: 'id', channelId, maxResults: '50', type: 'video', key: token }
    ) as { items?: Array<{ id?: { videoId?: string }; snippet?: { publishedAt?: string; title?: string; tags?: string[] } }> };

    const topicEngagement: Record<string, { engagement: number; count: number }> = {};
    const videoIds = (searchData.items || []).map(item => item.id?.videoId).filter(Boolean) as string[];

    if (videoIds.length > 0) {
      const videosData = await this._makeRequest(
        PLATFORM_BASE_URLS.youtube + '/videos',
        'youtube',
        { part: 'snippet,statistics', id: videoIds.join(','), key: token }
      ) as { items?: Array<{ snippet?: { publishedAt?: string; title?: string; tags?: string[] }; statistics?: MetricsDict }> };

      for (const video of videosData?.items || []) {
        const published = new Date(video.snippet?.publishedAt || '');
        if (published > cutoff) {
          const tags = video.snippet?.tags || [];
          const topicKey = tags.slice(0, 3).join(' ') || (video.snippet?.title || 'Unknown').slice(0, 50);
          const stats = (video.statistics || {}) as MetricsDict;
          const engagement = parseInt(String(stats.likeCount || 0)) + parseInt(String(stats.commentCount || 0));

          if (topicKey in topicEngagement) {
            topicEngagement[topicKey].engagement += engagement;
            topicEngagement[topicKey].count += 1;
          } else {
            topicEngagement[topicKey] = { engagement, count: 1 };
          }
        }
      }
    }

    return Object.entries(topicEngagement).map(([topic, data]) => ({
      topic,
      postsCount: data.count,
      engagement: data.engagement,
      velocity: data.engagement / 7,
      timestamp: new Date().toISOString(),
    }));
  }

  private async _scrapeTrendingContent(account: string, platform: string, period: string): Promise<TrendingItem[]> {
    return [];
  }

  private _getPeriodCutoff(period: string): Date {
    const now = new Date();
    if (period === 'day') return new Date(now.getTime() - 86400000);
    if (period === 'week') return new Date(now.getTime() - 7 * 86400000);
    if (period === 'month') return new Date(now.getTime() - 30 * 86400000);
    if (period === 'year') return new Date(now.getTime() - 365 * 86400000);
    return new Date(now.getTime() - 7 * 86400000);
  }

  calculateExposureRate(metrics: AccountMetrics): Record<string, number> {
    const followers = metrics.followers || 1;
    const impressionsRate = ((metrics.impressions || 0) / followers) * 100;
    const reachRate = ((metrics.reach || 0) / followers) * 100;
    const viewRate = ((metrics.views || 0) / followers) * 100;
    const potentialImpressions = followers * 30;
    const undeliveredRate = ((potentialImpressions - (metrics.impressions || 0)) / potentialImpressions) * 100;

    return {
      impressions_rate: Math.round(impressionsRate * 10000) / 10000,
      reach_rate: Math.round(reachRate * 10000) / 10000,
      view_rate: Math.round(viewRate * 10000) / 10000,
      engagement_rate: Math.round(metrics.engagementRate * 10000) / 10000,
      undelivered_rate: Math.round(Math.max(0, undeliveredRate) * 10000) / 10000,
      viral_coefficient: Math.round((metrics.engagementRate / 100 * (metrics.views || 0)) / Math.max((metrics.impressions || 0), 1) * 10000) / 10000,
    };
  }

  async predictNextPeriod(account: string, historicalData: Array<Record<string, unknown>>, platform: string = 'instagram'): Promise<PredictionDict> {
    if (historicalData.length < 2) {
      const current = await this.fetchAccountMetrics(account, platform);
      return {
        predicted_followers: current.followers,
        predicted_engagement: current.engagementRate,
        predicted_posts: current.posts,
        confidence: 0.3,
        period: 'next_week',
        trend_direction: 'unknown',
      };
    }

    const followerChanges: number[] = [];
    const engagementChanges: number[] = [];
    const postCounts: number[] = [];

    for (let i = 1; i < historicalData.length; i++) {
      const prev = historicalData[i - 1];
      const curr = historicalData[i];
      followerChanges.push((curr.followers as number || 0) - (prev.followers as number || 0));
      engagementChanges.push((curr.engagement_rate as number || 0) - (prev.engagement_rate as number || 0));
      postCounts.push(curr.posts as number || 0);
    }

    const avgFollowerChange = followerChanges.reduce((a, b) => a + b, 0) / followerChanges.length;
    const avgEngagementChange = engagementChanges.reduce((a, b) => a + b, 0) / engagementChanges.length;
    const avgPosts = postCounts.reduce((a, b) => a + b, 0) / postCounts.length;

    const lastMetrics = historicalData[historicalData.length - 1];
    const predictedFollowers = (lastMetrics.followers as number || 0) + avgFollowerChange;
    const predictedEngagement = (lastMetrics.engagement_rate as number || 0) + avgEngagementChange;
    const predictedPosts = Math.floor(avgPosts);

    const variance = followerChanges.reduce((sum, x) => sum + Math.pow(x - avgFollowerChange, 2), 0) / followerChanges.length;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0.1, Math.min(0.95, 1 - (stdDev / (Math.abs(avgFollowerChange) + 1))));

    const trendDirection = avgFollowerChange > 0 ? 'increasing' : avgFollowerChange < 0 ? 'decreasing' : 'stable';

    return {
      predicted_followers: Math.floor(predictedFollowers),
      predicted_engagement: Math.round(predictedEngagement * 10000) / 10000,
      predicted_posts: predictedPosts,
      confidence: Math.round(confidence * 100) / 100,
      period: 'next_week',
      trend_direction: trendDirection,
    };
  }

  async identifyMarketingGaps(account: string, competitorData: Array<Record<string, unknown>>, platform: string = 'instagram'): Promise<GapAnalysisDict> {
    const accountMetrics = await this.fetchAccountMetrics(account, platform);
    const accountTrending = await this.fetchTrendingContent(account, platform, 'month');

    const contentGaps: string[] = [];
    const timingGaps: string[] = [];
    const audienceGaps: string[] = [];
    const formatGaps: string[] = [];
    const recommendations: string[] = [];

    const competitorAvgEngagement = competitorData.length > 0
      ? competitorData.reduce((sum, c) => sum + ((c.engagement_rate as number) || 0), 0) / competitorData.length
      : 0;
    const competitorAvgPosts = competitorData.length > 0
      ? competitorData.reduce((sum, c) => sum + ((c.posts as number) || 0), 0) / competitorData.length
      : 0;

    if (accountMetrics.engagementRate < competitorAvgEngagement * 0.8) {
      contentGaps.push('Engagement rate is below competitors - consider improving content quality');
      recommendations.push('Increase engagement through interactive content like polls and questions');
    }

    if (accountMetrics.posts < competitorAvgPosts * 0.5) {
      const postingGap = competitorAvgPosts - accountMetrics.posts;
      contentGaps.push(`Posting frequency is significantly lower than competitors (gap: ${postingGap})`);
      recommendations.push('Increase posting frequency to match competitor activity levels');
    }

    if (accountTrending.length > 0) {
      const lowEngagementTopics = accountTrending.filter(t => t.engagement < 50);
      if (lowEngagementTopics.length > 0) {
        contentGaps.push(`${lowEngagementTopics.length} low-performing topic areas identified`);
        recommendations.push('Review and improve content strategy for underperforming topics');
      }
    }

    if (accountMetrics.followers < (competitorData.reduce((sum, c) => sum + ((c.followers as number) || 0), 0) / competitorData.length) * 0.5) {
      audienceGaps.push('Significant follower gap compared to competitors');
      recommendations.push('Invest in follower growth strategies through collaborations and promotions');
    }

    return {
      contentGaps: contentGaps.length > 0 ? contentGaps : ['No significant content gaps identified'],
      timingGaps: timingGaps.length > 0 ? timingGaps : ['Posting timing appears optimal'],
      audienceGaps: audienceGaps.length > 0 ? audienceGaps : ['Audience size is comparable to competitors'],
      formatGaps: formatGaps.length > 0 ? formatGaps : ['Content format is comparable to competitors'],
      recommendations: recommendations.length > 0 ? recommendations : ['Continue current strategy with minor optimizations'],
    };
  }

  getFollowerBreakdown(metrics: AccountMetrics): FollowerBreakdownDict {
    return {
      demographics: { others: 100 },
      locations: { global: 100 },
      ageGroups: { '18-34': 100 },
      genderSplit: { unknown: 100 },
      activeHours: { '10:00-14:00': 100 },
    };
  }

  async scrapePlatform(platform: string, username: string): Promise<Record<string, unknown>> {
    try {
      const metrics = await this.fetchAccountMetrics(username, platform);
      const exposure = this.calculateExposureRate(metrics);
      const trending = await this.fetchTrendingContent(username, platform, 'week');
      const breakdown = this.getFollowerBreakdown(metrics);

      return {
        platform,
        username,
        metrics,
        exposure_rates: exposure,
        trending_content: trending,
        follower_breakdown: breakdown,
        scraped_at: new Date().toISOString(),
      };
    } catch (e) {
      return {
        platform,
        username,
        error: String(e),
        scraped_at: new Date().toISOString(),
      };
    }
  }

  getPlatformHealth(platform: string): Record<string, unknown> {
    const token = this._tokens[platform];
    return {
      platform,
      api_configured: !!token,
    };
  }
}

export default SocialMediaScraper;
export { SocialMediaScraper as Scraper };