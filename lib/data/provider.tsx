'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface Platform {
  platform: string;
  color: string;
  followers: number;
  engagement: number;
  isActive: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'completed' | 'paused' | 'draft';
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  cpa: number;
  roas: number;
  spend: number;
  startDate?: string;
  endDate?: string;
}

export interface KPIMetric {
  id: string;
  name: string;
  value: number | string;
  change: string;
  changeValue: number;
  trend: 'up' | 'down' | 'neutral' | 'alert';
  color: string;
  format: 'number' | 'currency' | 'percent' | 'compact';
  sparklineData?: number[];
}

export interface Gap {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'content' | 'format' | 'engagement' | 'audience' | 'platform';
  recommendation: string;
  detectedAt: string;
  status: 'open' | 'addressed' | 'dismissed';
}

export interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  followers: number;
  isActive: boolean;
  lastSync: string;
  connectedVia: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  deliveries: number;
  failures: number;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  resource: string;
  timestamp: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface TenantStats {
  totalFollowers: number;
  avgEngagement: number;
  campaignROAS: number;
  activeCrisisAlerts: number;
  sentimentScore: number;
  monthlyRevenue: number;
}

export interface BrandProfile {
  id: string;
  name: string;
  label: string;
  description: string;
  imageInitials: string;
  stats: Array<{ label: string; value: string | number }>;
}

interface DataState {
  platforms: Platform[];
  campaigns: Campaign[];
  kpis: KPIMetric[];
  gaps: Gap[];
  accounts: SocialAccount[];
  webhooks: Webhook[];
  auditLogs: AuditLogEntry[];
  tenantStats: TenantStats | null;
  brandProfile: BrandProfile | null;
  isLoading: boolean;
  lastUpdated: string | null;
  error: string | null;
}

interface DataContextValue {
  state: DataState;
  setPlatforms: (data: Platform[]) => void;
  setCampaigns: (data: Campaign[]) => void;
  setKPIs: (data: KPIMetric[]) => void;
  setGaps: (data: Gap[]) => void;
  setAccounts: (data: SocialAccount[]) => void;
  setWebhooks: (data: Webhook[]) => void;
  setAuditLogs: (data: AuditLogEntry[]) => void;
  setTenantStats: (data: TenantStats | null) => void;
  setBrandProfile: (data: BrandProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const initialState: DataState = {
  platforms: [],
  campaigns: [],
  kpis: [],
  gaps: [],
  accounts: [],
  webhooks: [],
  auditLogs: [],
  tenantStats: null,
  brandProfile: null,
  isLoading: false,
  lastUpdated: null,
  error: null,
};

export function DataProvider({ children, tenantId }: { children: React.ReactNode; tenantId?: string }) {
  const [state, setState] = useState<DataState>(initialState);

  const setPlatforms = useCallback((data: Platform[]) => {
    setState((prev) => ({ ...prev, platforms: data, lastUpdated: new Date().toISOString() }));
  }, []);

  const setCampaigns = useCallback((data: Campaign[]) => {
    setState((prev) => ({ ...prev, campaigns: data, lastUpdated: new Date().toISOString() }));
  }, []);

  const setKPIs = useCallback((data: KPIMetric[]) => {
    setState((prev) => ({ ...prev, kpis: data, lastUpdated: new Date().toISOString() }));
  }, []);

  const setGaps = useCallback((data: Gap[]) => {
    setState((prev) => ({ ...prev, gaps: data, lastUpdated: new Date().toISOString() }));
  }, []);

  const setAccounts = useCallback((data: SocialAccount[]) => {
    setState((prev) => ({ ...prev, accounts: data, lastUpdated: new Date().toISOString() }));
  }, []);

  const setWebhooks = useCallback((data: Webhook[]) => {
    setState((prev) => ({ ...prev, webhooks: data, lastUpdated: new Date().toISOString() }));
  }, []);

  const setAuditLogs = useCallback((data: AuditLogEntry[]) => {
    setState((prev) => ({ ...prev, auditLogs: data, lastUpdated: new Date().toISOString() }));
  }, []);

  const setTenantStats = useCallback((data: TenantStats | null) => {
    setState((prev) => ({ ...prev, tenantStats: data }));
  }, []);

  const setBrandProfile = useCallback((data: BrandProfile | null) => {
    setState((prev) => ({ ...prev, brandProfile: data }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const refreshAll = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      if (tenantId) {
        const [metricsRes, campaignsRes, kpisRes, gapsRes, webhooksRes, auditRes] = await Promise.allSettled([
          fetch(`/api/metrics/${tenantId}`),
          fetch(`/api/campaigns/by-brand/${tenantId}`),
          fetch(`/api/kpis/by-brand/${tenantId}`),
          fetch(`/api/gaps/${tenantId}`),
          fetch(`/api/webhooks/by-tenant/${tenantId}`),
          fetch(`/api/audit/by-tenant/${tenantId}/summary`),
        ]);

        if (metricsRes.status === 'fulfilled') {
          const d = await metricsRes.value.json();
          setPlatforms(d.platforms || []);
        }
        if (campaignsRes.status === 'fulfilled') {
          const d = await campaignsRes.value.json();
          setCampaigns(d.campaigns || []);
        }
        if (kpisRes.status === 'fulfilled') {
          const d = await kpisRes.value.json();
          setKPIs(d.kpis || []);
        }
        if (gapsRes.status === 'fulfilled') {
          const d = await gapsRes.value.json();
          setGaps(d.gaps || []);
        }
        if (webhooksRes.status === 'fulfilled') {
          const d = await webhooksRes.value.json();
          setWebhooks(d.webhooks || []);
        }
        if (auditRes.status === 'fulfilled') {
          const d = await auditRes.value.json();
          setAuditLogs(d.logs || []);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [tenantId, setPlatforms, setCampaigns, setKPIs, setGaps, setWebhooks, setAuditLogs, setError]);

  const value = useMemo(() => ({
    state,
    setPlatforms,
    setCampaigns,
    setKPIs,
    setGaps,
    setAccounts,
    setWebhooks,
    setAuditLogs,
    setTenantStats,
    setBrandProfile,
    setLoading,
    setError,
    refreshAll,
  }), [state, setPlatforms, setCampaigns, setKPIs, setGaps, setAccounts, setWebhooks, setAuditLogs, setTenantStats, setBrandProfile, setLoading, setError, refreshAll]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataProvider;
