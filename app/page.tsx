'use client';

import Dashboard from '../components/Dashboard';

export default function OmniPulsePage() {
  const mockAccounts = [
    { id: '1', platform: 'Instagram', username: 'aeg_official', followersCount: 284500, engagementRate: 4.2 },
    { id: '2', platform: 'TikTok', username: 'aeg_official', followersCount: 512000, engagementRate: 6.8 },
    { id: '3', platform: 'YouTube', username: 'AEGOriginals', followersCount: 156000, engagementRate: 3.1 },
    { id: '4', platform: 'X (Twitter)', username: 'aeg_official', followersCount: 89400, engagementRate: 1.9 },
    { id: '5', platform: 'LinkedIn', username: 'AEG Entertainment', followersCount: 34200, engagementRate: 2.8 },
  ];

  const mockMetrics = [
    { capturedAt: '2026-04-01', followersCount: 276000, engagementRate: 3.8, viewsCount: 1150000, postsCount: 44 },
    { capturedAt: '2026-04-08', followersCount: 279000, engagementRate: 4.0, viewsCount: 1180000, postsCount: 46 },
    { capturedAt: '2026-04-15', followersCount: 281000, engagementRate: 4.1, viewsCount: 1190000, postsCount: 47 },
    { capturedAt: '2026-04-22', followersCount: 283000, engagementRate: 4.2, viewsCount: 1200000, postsCount: 48 },
  ];

  const mockTrends = [
    { topic: '#CinematicUniverse', postsCount: 12400, engagement: 45200, velocity: 12.4, timestamp: '2026-04-29' },
    { topic: '#AEGOriginals', postsCount: 8900, engagement: 32100, velocity: 8.7, timestamp: '2026-04-29' },
    { topic: '#Season4Coming', postsCount: 5600, engagement: 28400, velocity: 23.1, timestamp: '2026-04-29' },
    { topic: '#MarcusChen', postsCount: 3400, engagement: 18600, velocity: 5.2, timestamp: '2026-04-29' },
    { topic: '#BehindTheScenes', postsCount: 2100, engagement: 12400, velocity: 15.3, timestamp: '2026-04-29' },
  ];

  const mockPredictions = [
    { predictedFollowers: 1145200, predictedEngagement: 4.12, predictedPosts: 52, confidence: 0.85, period: '30 days', trendDirection: 'up' as const },
    { predictedFollowers: 1210000, predictedEngagement: 4.25, predictedPosts: 60, confidence: 0.72, period: '90 days', trendDirection: 'up' as const },
    { predictedFollowers: 1080000, predictedEngagement: 3.95, predictedPosts: 48, confidence: 0.65, period: '30 days', trendDirection: 'down' as const },
    { predictedFollowers: 1165000, predictedEngagement: 4.30, predictedPosts: 55, confidence: 0.78, period: '60 days', trendDirection: 'up' as const },
    { predictedFollowers: 1190000, predictedEngagement: 4.15, predictedPosts: 58, confidence: 0.70, period: '90 days', trendDirection: 'stable' as const },
    { predictedFollowers: 1150000, predictedEngagement: 4.20, predictedPosts: 51, confidence: 0.82, period: '30 days', trendDirection: 'up' as const },
  ];

  const mockGaps = [
    {
      id: '1',
      title: 'TikTok Engagement Decline',
      description: 'Average watch time dropped 18% over the past 30 days despite increased posting frequency.',
      severity: 'high' as const,
      recommendation: 'Focus on first 3 seconds hook optimization and trend participation. Increase duet/stitch content.',
    },
    {
      id: '2',
      title: 'LinkedIn Content Gap',
      description: 'Only 24 posts in Q1 vs industry benchmark of 60+. Missing thought leadership opportunities.',
      severity: 'medium' as const,
      recommendation: 'Publish 2 industry insight articles weekly. Partner with influencers for LinkedIn Live sessions.',
    },
    {
      id: '3',
      title: 'Cross-Platform Amplification',
      description: 'YouTube Shorts not being repurposed for TikTok and Instagram Reels.',
      severity: 'medium' as const,
      recommendation: 'Create vertical cut-downs of YouTube content for Reels and Shorts. Implement automated cross-posting workflow.',
    },
    {
      id: '4',
      title: 'X (Twitter) Negative Sentiment',
      description: 'Sentiment score dropped to 34% positive. High volume of complaint posts about release schedule.',
      severity: 'critical' as const,
      recommendation: 'Launch community management initiative. Create dedicated feedback channel. Post official responses to top complaints.',
    },
    {
      id: '5',
      title: 'Instagram Story Underutilization',
      description: 'Only 12% of followers view Stories. Industry average is 25%.',
      severity: 'low' as const,
      recommendation: 'Add more interactive stickers, polls, and countdowns. Post Stories 3x daily during peak hours.',
    },
  ];

  return (
    <Dashboard
      clientId="aeg-default"
      accounts={mockAccounts}
      metrics={mockMetrics}
      trends={mockTrends}
      predictions={mockPredictions}
      gaps={mockGaps}
    />
  );
}
