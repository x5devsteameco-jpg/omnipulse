export type TenantTier = 'starter' | 'professional' | 'enterprise';

export type SupportLevel = 'email' | 'chat' | 'priority';

export interface TenantLimits {
  maxAccounts: number;
  maxUsers: number;
  apiRateLimit: number;
  dataRetentionDays: number;
  supportLevel: SupportLevel;
}

export interface TenantFeatureFlags {
  sentimentAnalysis: boolean;
  competitorBenchmarking: boolean;
  predictiveML: boolean;
  crisisAlerting: boolean;
  automatedReports: boolean;
  exportFormats: ('csv' | 'pdf' | 'json')[];
}

export interface PlatformConfig {
  enabled: boolean;
  apiKeyEnv: string;
}

export interface TenantPlatforms {
  instagram: PlatformConfig;
  twitter: PlatformConfig;
  tiktok: PlatformConfig;
  youtube: PlatformConfig;
  linkedin: PlatformConfig;
  facebook: PlatformConfig;
}

export interface EngagementThresholds {
  warning: number;
  critical: number;
}

export interface FollowerGrowthTargets {
  daily: number;
  weekly: number;
}

export interface TenantConfig {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  tier: TenantTier;
  isActive: boolean;

  brandName: string;
  brandLogo: string;
  brandFavicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  textDimColor: string;
  fontFamily: string;
  cssVariables: Record<string, string>;

  features: TenantFeatureFlags;
  platforms: TenantPlatforms;

  engagementThresholds: EngagementThresholds;
  followerGrowthTargets: FollowerGrowthTargets;

  limits: TenantLimits;

  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  tier: TenantTier;
  isActive: boolean;
  databaseHost?: string;
  databasePort?: number;
  databaseName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  tenantId: string;
  name: string;
  contactEmail?: string;
  contactName?: string;
  brandGuidelines: Record<string, unknown>;
  legalConstraints: Record<string, unknown>;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandUser {
  id: string;
  brandId: string;
  email: string;
  name?: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_TENANT_CONFIG: Omit<TenantConfig, 'tenantId' | 'tenantSlug' | 'tenantName' | 'tier'> = {
  isActive: true,
  brandName: 'OmniPulse',
  brandLogo: '/logo.svg',
  brandFavicon: '/favicon.ico',
  primaryColor: '#d4af37',
  secondaryColor: '#12121a',
  accentColor: '#22c55e',
  backgroundColor: '#09090b',
  surfaceColor: '#18181b',
  borderColor: '#3f3f46',
  textPrimaryColor: '#fafafa',
  textSecondaryColor: '#a1a1aa',
  textDimColor: '#71717a',
  fontFamily: 'Inter, system-ui, sans-serif',
  cssVariables: {},
  features: {
    sentimentAnalysis: false,
    competitorBenchmarking: false,
    predictiveML: false,
    crisisAlerting: false,
    automatedReports: false,
    exportFormats: ['csv'],
  },
  platforms: {
    instagram: { enabled: true, apiKeyEnv: 'INSTAGRAM_ACCESS_TOKEN' },
    twitter: { enabled: true, apiKeyEnv: 'TWITTER_BEARER_TOKEN' },
    tiktok: { enabled: true, apiKeyEnv: 'TIKTOK_ACCESS_TOKEN' },
    youtube: { enabled: true, apiKeyEnv: 'YOUTUBE_API_KEY' },
    linkedin: { enabled: true, apiKeyEnv: 'LINKEDIN_ACCESS_TOKEN' },
    facebook: { enabled: true, apiKeyEnv: 'FACEBOOK_ACCESS_TOKEN' },
  },
  engagementThresholds: {
    warning: 2.0,
    critical: 1.0,
  },
  followerGrowthTargets: {
    daily: 0.5,
    weekly: 3.0,
  },
  limits: {
    maxAccounts: 10,
    maxUsers: 5,
    apiRateLimit: 60,
    dataRetentionDays: 90,
    supportLevel: 'email',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const TIER_LIMITS: Record<TenantTier, TenantLimits> = {
  starter: {
    maxAccounts: 10,
    maxUsers: 5,
    apiRateLimit: 60,
    dataRetentionDays: 90,
    supportLevel: 'email',
  },
  professional: {
    maxAccounts: 50,
    maxUsers: 25,
    apiRateLimit: 300,
    dataRetentionDays: 365,
    supportLevel: 'chat',
  },
  enterprise: {
    maxAccounts: 500,
    maxUsers: 100,
    apiRateLimit: 1000,
    dataRetentionDays: 730,
    supportLevel: 'priority',
  },
};
