import { NextResponse } from 'next/server';
import { getConfigStore } from '@/lib/config';
import { getTenantRouter } from '@/lib/tenant';
import { getKPIManager } from '@/lib/kpi';
import { getCampaignManager } from '@/lib/campaigns';
import { getRateLimiter } from '@/lib/rate-limit';
import { getAuditLogger } from '@/lib/audit';
import { getWebhookManager } from '@/lib/webhooks';
import { getPluginManager } from '@/lib/plugins';

export async function GET() {
  const startTime = Date.now();

  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.3.0',
    environment: process.env.NODE_ENV || 'development',
    services: {} as Record<string, unknown>,
  };

  try {
    const configStore = getConfigStore();
    const router = getTenantRouter();
    const kpiManager = getKPIManager();
    const campaignManager = getCampaignManager();
    const rateLimiter = getRateLimiter();
    const auditLogger = getAuditLogger();
    const webhookManager = getWebhookManager();
    const pluginManager = getPluginManager();

    const cacheStats = configStore.getLocalCacheStats();
    const routerStats = router.getPoolStats();
    const kpiStats = kpiManager.getStats();
    const campaignStats = campaignManager.getStats();
    const rateLimitStats = rateLimiter.getStats();
    const auditStats = auditLogger.getStats();
    const webhookStats = webhookManager.getStats();
    const plugins = pluginManager.getPlugins();

    checks.services = {
      configStore: {
        status: 'healthy',
        cachedTenants: cacheStats.size,
      },
      tenantRouter: {
        status: 'healthy',
        activePools: routerStats.activePools,
        tenantCount: routerStats.tenantCount,
      },
      kpiManager: {
        status: 'healthy',
        totalKPIs: kpiStats.totalKPIs,
        totalMetrics: kpiStats.totalMetrics,
        totalSnapshots: kpiStats.totalSnapshots,
      },
      campaignManager: {
        status: 'healthy',
        totalCampaigns: campaignStats.totalCampaigns,
        activeCampaigns: campaignStats.activeCampaigns,
        totalSpend: campaignStats.totalSpend,
      },
      rateLimiter: {
        status: 'healthy',
        entries: rateLimitStats.entries,
        tenants: rateLimitStats.tenants,
      },
      auditLogger: {
        status: 'healthy',
        totalEvents: auditStats.totalEvents,
        tenantCount: auditStats.tenantCount,
      },
      webhookManager: {
        status: 'healthy',
        totalEndpoints: webhookStats.totalEndpoints,
        activeEndpoints: webhookStats.activeEndpoints,
        totalDeliveries: webhookStats.totalDeliveries,
      },
      pluginManager: {
        status: 'healthy',
        registeredPlugins: plugins.length,
        plugins: plugins.map((p) => ({ name: p.name, version: p.version })),
      },
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      ...checks,
      responseTimeMs: responseTime,
    });

  } catch (error) {
    checks.status = 'unhealthy';
    checks.services = {
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(checks, { status: 503 });
  }
}
