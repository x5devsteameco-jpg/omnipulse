export type MetricType = 'counter' | 'gauge' | 'rate' | 'percentage' | 'currency';
export type AggregationMethod = 'sum' | 'avg' | 'min' | 'max' | 'last';
export type DisplayFormat = 'number' | 'compact' | 'currency' | 'percentage';

export interface ColorThreshold {
  min: number;
  max: number;
  color: string;
}

export interface DisplayConfig {
  format: DisplayFormat;
  precision: number;
  prefix: string;
  suffix: string;
  colorThresholds: ColorThreshold[];
}

export interface CalculationConfig {
  formula?: string;
  currency?: string;
  sourceField?: string;
}

export interface KPIDefinition {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  description?: string;
  metricType: MetricType;
  aggregationMethod: AggregationMethod;
  platformSource: string[];
  calculationConfig: CalculationConfig;
  displayConfig: DisplayConfig;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPISnapshot {
  id: string;
  brandId: string;
  accountId: string;
  kpiDefinitionId: string;
  snapshotType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  metrics: Record<string, number>;
  deltaFromPrevious: Record<string, number>;
  percentChange: Record<string, number>;
  createdAt: string;
}

export interface KPIMetric {
  id: string;
  accountId: string;
  kpiDefinitionId: string;
  platform: string;
  metricName: string;
  metricValue: number | Record<string, unknown>;
  valueNumeric?: number;
  capturedAt: string;
  sourceBatchId?: string;
  createdAt: string;
}

export const DEFAULT_KPI_DISPLAY_CONFIG: DisplayConfig = {
  format: 'number',
  precision: 0,
  prefix: '',
  suffix: '',
  colorThresholds: [],
};

export const PRESET_KPI_TEMPLATES = [
  {
    name: 'Total Reach',
    slug: 'total_reach',
    metricType: 'gauge' as MetricType,
    aggregationMethod: 'sum' as AggregationMethod,
    description: 'Combined followers + potential reach across platforms',
  },
  {
    name: 'Engagement Rate',
    slug: 'engagement_rate',
    metricType: 'percentage' as MetricType,
    aggregationMethod: 'avg' as AggregationMethod,
    description: 'Average engagement (likes + comments + shares) / followers',
  },
  {
    name: 'Follower Growth',
    slug: 'follower_growth',
    metricType: 'rate' as MetricType,
    aggregationMethod: 'avg' as AggregationMethod,
    description: 'Daily follower growth percentage',
  },
  {
    name: 'Sentiment Score',
    slug: 'sentiment_score',
    metricType: 'percentage' as MetricType,
    aggregationMethod: 'avg' as AggregationMethod,
    description: 'Positive mentions / total mentions',
  },
  {
    name: 'Avg Likes per Post',
    slug: 'avg_likes_per_post',
    metricType: 'gauge' as MetricType,
    aggregationMethod: 'avg' as AggregationMethod,
    description: 'Average likes per post across period',
  },
  {
    name: 'Total Impressions',
    slug: 'total_impressions',
    metricType: 'counter' as MetricType,
    aggregationMethod: 'sum' as AggregationMethod,
    description: 'Total content impressions across platforms',
  },
];
