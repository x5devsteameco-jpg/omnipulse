import type { Metrics } from '@/lib/analytics/types';

export interface Campaign {
  id: string;
  brandId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  budgetTotal?: number;
  budgetSpent: number;
  talentAccountIds: string[];
  platformTargets: string[];
  kpiTargets: Record<string, number>;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignMetrics {
  campaignId: string;
  accountId: string;
  recordedAt: string;
  metrics: {
    impressions: number;
    reach: number;
    clicks: number;
    conversions: number;
    engagement: number;
    spend: number;
  };
  deltaFromTarget: Record<string, number>;
  attributionSource?: string;
}

export interface ROICalculation {
  campaignId: string;
  totalSpend: number;
  totalRevenue: number;
  roi: number;
  roas: number;
  cpa: number;
  cpm: number;
  ctr: number;
  conversionRate: number;
  attributableFollowers: number;
  attributableEngagement: number;
  period: string;
}

export interface CampaignPerformance {
  campaign: Campaign;
  metrics: CampaignMetrics[];
  roi: ROICalculation;
  status: 'underperforming' | 'on_track' | 'exceeding';
  insights: string[];
}

export class CampaignManager {
  private campaigns: Map<string, Campaign> = new Map();
  private campaignMetrics: Map<string, CampaignMetrics[]> = new Map();

  createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'budgetSpent' | 'status'>): Campaign {
    const now = new Date().toISOString();
    const campaign: Campaign = {
      ...data,
      id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      budgetSpent: 0,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    this.campaigns.set(campaign.id, campaign);
    this.campaignMetrics.set(campaign.id, []);

    return campaign;
  }

  getCampaign(campaignId: string): Campaign | null {
    return this.campaigns.get(campaignId) || null;
  }

  getCampaignsByBrand(brandId: string): Campaign[] {
    return Array.from(this.campaigns.values()).filter((c) => c.brandId === brandId);
  }

  getActiveCampaigns(brandId: string): Campaign[] {
    return this.getCampaignsByBrand(brandId).filter((c) => c.status === 'active');
  }

  updateCampaign(campaignId: string, updates: Partial<Campaign>): Campaign | null {
    const existing = this.campaigns.get(campaignId);
    if (!existing) return null;

    const updated: Campaign = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.campaigns.set(campaignId, updated);
    return updated;
  }

  recordMetrics(campaignId: string, accountId: string, metrics: CampaignMetrics['metrics']): CampaignMetrics | null {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return null;

    const record: CampaignMetrics = {
      campaignId,
      accountId,
      recordedAt: new Date().toISOString(),
      metrics,
      deltaFromTarget: this.calculateDeltaFromTarget(campaign, metrics),
    };

    const existing = this.campaignMetrics.get(campaignId) || [];
    existing.push(record);
    this.campaignMetrics.set(campaignId, existing);

    campaign.budgetSpent += metrics.spend;
    campaign.updatedAt = new Date().toISOString();

    return record;
  }

  calculateROI(campaignId: string, revenueAttributed: number = 0): ROICalculation | null {
    const campaign = this.campaigns.get(campaignId);
    const metrics = this.campaignMetrics.get(campaignId) || [];

    if (!campaign) return null;

    const totalSpend = campaign.budgetSpent || metrics.reduce((sum, m) => sum + m.metrics.spend, 0);
    const totalRevenue = revenueAttributed || this.estimateRevenue(metrics);
    const totalImpressions = metrics.reduce((sum, m) => sum + m.metrics.impressions, 0);
    const totalClicks = metrics.reduce((sum, m) => sum + m.metrics.clicks, 0);
    const totalConversions = metrics.reduce((sum, m) => sum + m.metrics.conversions, 0);
    const totalReach = metrics.reduce((sum, m) => sum + m.metrics.reach, 0);
    const totalEngagement = metrics.reduce((sum, m) => sum + m.metrics.engagement, 0);

    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const cpa = totalConversions > 0 ? totalSpend / totalConversions : totalSpend;
    const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return {
      campaignId,
      totalSpend,
      totalRevenue,
      roi,
      roas,
      cpa,
      cpm,
      ctr,
      conversionRate,
      attributableFollowers: Math.round(totalEngagement * 0.1),
      attributableEngagement: totalEngagement,
      period: `${campaign.startDate} to ${campaign.endDate || 'ongoing'}`,
    };
  }

  getPerformance(campaignId: string, revenueAttributed: number = 0): CampaignPerformance | null {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return null;

    const metrics = this.campaignMetrics.get(campaignId) || [];
    const roi = this.calculateROI(campaignId, revenueAttributed);
    if (!roi) return null;

    const kpiStatus = this.evaluateKPIs(campaign, metrics);
    const status = this.determineStatus(roi, kpiStatus);
    const insights = this.generateInsights(campaign, roi, metrics);

    return {
      campaign,
      metrics,
      roi,
      status,
      insights,
    };
  }

  private calculateDeltaFromTarget(campaign: Campaign, metrics: CampaignMetrics['metrics']): Record<string, number> {
    const delta: Record<string, number> = {};

    if (campaign.kpiTargets.impressions && metrics.impressions) {
      delta.impressions = ((metrics.impressions - campaign.kpiTargets.impressions) / campaign.kpiTargets.impressions) * 100;
    }
    if (campaign.kpiTargets.reach && metrics.reach) {
      delta.reach = ((metrics.reach - campaign.kpiTargets.reach) / campaign.kpiTargets.reach) * 100;
    }
    if (campaign.kpiTargets.engagement && metrics.engagement) {
      delta.engagement = ((metrics.engagement - campaign.kpiTargets.engagement) / campaign.kpiTargets.engagement) * 100;
    }
    if (campaign.kpiTargets.conversions && metrics.conversions) {
      delta.conversions = ((metrics.conversions - campaign.kpiTargets.conversions) / campaign.kpiTargets.conversions) * 100;
    }

    return delta;
  }

  private estimateRevenue(metrics: CampaignMetrics[]): number {
    const avgOrderValue = 50;
    const totalConversions = metrics.reduce((sum, m) => sum + m.metrics.conversions, 0);
    return totalConversions * avgOrderValue;
  }

  private evaluateKPIs(campaign: Campaign, metrics: CampaignMetrics[]): Record<string, 'below' | 'on' | 'above'> {
    const status: Record<string, 'below' | 'on' | 'above'> = {};

    for (const [kpi, target] of Object.entries(campaign.kpiTargets)) {
      const total = metrics.reduce((sum, m) => {
        const metricValue = m.metrics[kpi as keyof typeof m.metrics];
        return sum + (typeof metricValue === 'number' ? metricValue : 0);
      }, 0);

      if (total < target * 0.9) {
        status[kpi] = 'below';
      } else if (total > target * 1.1) {
        status[kpi] = 'above';
      } else {
        status[kpi] = 'on';
      }
    }

    return status;
  }

  private determineStatus(roi: ROICalculation, kpiStatus: Record<string, 'below' | 'on' | 'above'>): CampaignPerformance['status'] {
    const kpiValues = Object.values(kpiStatus);
    const belowCount = kpiValues.filter((s) => s === 'below').length;
    const aboveCount = kpiValues.filter((s) => s === 'above').length;

    if (roi.roi < -20 || belowCount > kpiValues.length / 2) return 'underperforming';
    if (roi.roi > 50 || aboveCount > kpiValues.length / 2) return 'exceeding';
    return 'on_track';
  }

  private generateInsights(campaign: Campaign, roi: ROICalculation, metrics: CampaignMetrics[]): string[] {
    const insights: string[] = [];

    if (roi.roi > 100) {
      insights.push(`Exceptional ROI of ${roi.roi.toFixed(0)}% — consider increasing budget for this campaign`);
    } else if (roi.roi > 0) {
      insights.push(`Positive ROI of ${roi.roi.toFixed(0)}% — campaign is profitable`);
    } else if (roi.roi > -20) {
      insights.push(`Break-even performance at ${roi.roi.toFixed(0)}% ROI — optimize for better conversion`);
    } else {
      insights.push(`Negative ROI of ${roi.roi.toFixed(0)}% — review campaign strategy and targeting`);
    }

    if (roi.cpm > 10) {
      insights.push(`High CPM of $${roi.cpm.toFixed(2)} — consider improving ad creative or audience targeting`);
    }

    if (roi.conversionRate > 5) {
      insights.push(`Strong conversion rate of ${roi.conversionRate.toFixed(2)}% — double down on high-converting content`);
    } else if (roi.conversionRate < 1) {
      insights.push(`Low conversion rate of ${roi.conversionRate.toFixed(2)}% — test new landing pages or offers`);
    }

    return insights;
  }

  getStats(): { totalCampaigns: number; activeCampaigns: number; totalSpend: number } {
    let totalSpend = 0;
    let activeCampaigns = 0;

    for (const campaign of this.campaigns.values()) {
      totalSpend += campaign.budgetSpent;
      if (campaign.status === 'active') activeCampaigns++;
    }

    return {
      totalCampaigns: this.campaigns.size,
      activeCampaigns,
      totalSpend,
    };
  }
}

let campaignManagerInstance: CampaignManager | null = null;

export function getCampaignManager(): CampaignManager {
  if (!campaignManagerInstance) {
    campaignManagerInstance = new CampaignManager();
  }
  return campaignManagerInstance;
}
