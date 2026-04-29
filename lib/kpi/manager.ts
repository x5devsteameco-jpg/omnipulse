import type { KPIDefinition, KPIMetric, KPISnapshot } from '@/lib/types/kpi';
import type {
  MetricType,
  AggregationMethod,
  DisplayConfig,
} from '@/lib/types/kpi';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

interface KPIStore {
  kpis: Map<string, KPIDefinition>;
  metrics: Map<string, KPIMetric[]>;
  snapshots: Map<string, KPISnapshot[]>;
}

class InMemoryKPIStore implements KPIStore {
  kpis = new Map<string, KPIDefinition>();
  metrics = new Map<string, KPIMetric[]>();
  snapshots = new Map<string, KPISnapshot[]>();
}

const store = new InMemoryKPIStore();

export class KPIManager {
  async createKPI(
    brandId: string,
    data: Omit<KPIDefinition, 'id' | 'brandId' | 'createdAt' | 'updatedAt'>
  ): Promise<KPIDefinition> {
    const now = new Date().toISOString();
    const kpi: KPIDefinition = {
      ...data,
      id: generateId('kpi'),
      brandId,
      createdAt: now,
      updatedAt: now,
    };

    store.kpis.set(kpi.id, kpi);
    return kpi;
  }

  async getKPI(kpiId: string): Promise<KPIDefinition | null> {
    return store.kpis.get(kpiId) || null;
  }

  async getKPIsByBrand(brandId: string): Promise<KPIDefinition[]> {
    return Array.from(store.kpis.values()).filter(
      (kpi) => kpi.brandId === brandId && kpi.isActive
    );
  }

  async updateKPI(
    kpiId: string,
    updates: Partial<Omit<KPIDefinition, 'id' | 'brandId' | 'createdAt'>>
  ): Promise<KPIDefinition | null> {
    const existing = store.kpis.get(kpiId);
    if (!existing) return null;

    const updated: KPIDefinition = {
      ...existing,
      ...updates,
      id: existing.id,
      brandId: existing.brandId,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    store.kpis.set(kpiId, updated);
    return updated;
  }

  async deleteKPI(kpiId: string): Promise<boolean> {
    const existing = store.kpis.get(kpiId);
    if (!existing) return false;

    const softDeleted: KPIDefinition = {
      ...existing,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
    store.kpis.set(kpiId, softDeleted);
    return true;
  }

  async recordMetric(
    accountId: string,
    kpiDefinitionId: string,
    platform: string,
    metricName: string,
    value: number
  ): Promise<KPIMetric> {
    const now = new Date().toISOString();
    const metric: KPIMetric = {
      id: generateId('met'),
      accountId,
      kpiDefinitionId,
      platform,
      metricName,
      metricValue: value,
      valueNumeric: value,
      capturedAt: now,
      createdAt: now,
    };

    const key = `${accountId}:${kpiDefinitionId}`;
    const existing = store.metrics.get(key) || [];
    existing.push(metric);
    store.metrics.set(key, existing);

    return metric;
  }

  async getMetrics(
    accountId: string,
    kpiDefinitionId: string,
    from?: string,
    to?: string
  ): Promise<KPIMetric[]> {
    const key = `${accountId}:${kpiDefinitionId}`;
    let metrics = store.metrics.get(key) || [];

    if (from) {
      metrics = metrics.filter((m) => m.capturedAt >= from);
    }
    if (to) {
      metrics = metrics.filter((m) => m.capturedAt <= to);
    }

    return metrics.sort(
      (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    );
  }

  async createSnapshot(
    brandId: string,
    accountId: string,
    kpiDefinitionId: string,
    snapshotType: 'hourly' | 'daily' | 'weekly' | 'monthly',
    periodStart: string,
    periodEnd: string,
    metricsData: Record<string, number>
  ): Promise<KPISnapshot> {
    const metrics = await this.getMetrics(accountId, kpiDefinitionId, periodStart, periodEnd);

    const previousPeriodStart = new Date(
      new Date(periodStart).getTime() - (new Date(periodEnd).getTime() - new Date(periodStart).getTime())
    ).toISOString();

    const previousMetrics = await this.getMetrics(
      accountId,
      kpiDefinitionId,
      previousPeriodStart,
      periodStart
    );

    const currentAvg =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.valueNumeric || 0), 0) / metrics.length
        : 0;

    const previousAvg =
      previousMetrics.length > 0
        ? previousMetrics.reduce((sum, m) => sum + (m.valueNumeric || 0), 0) /
          previousMetrics.length
        : 0;

    const delta = currentAvg - previousAvg;
    const percentChange = previousAvg !== 0 ? (delta / previousAvg) * 100 : 0;

    const snapshot: KPISnapshot = {
      id: generateId('snap'),
      brandId,
      accountId,
      kpiDefinitionId,
      snapshotType,
      periodStart,
      periodEnd,
      metrics: metricsData,
      deltaFromPrevious: { [kpiDefinitionId]: delta },
      percentChange: { [kpiDefinitionId]: percentChange },
      createdAt: new Date().toISOString(),
    };

    const snapKey = `${accountId}:${snapshotType}:${periodStart}`;
    const existing = store.snapshots.get(snapKey) || [];
    existing.push(snapshot);
    store.snapshots.set(snapKey, existing);

    return snapshot;
  }

  async getSnapshots(
    accountId: string,
    snapshotType: 'hourly' | 'daily' | 'weekly' | 'monthly',
    from?: string,
    to?: string
  ): Promise<KPISnapshot[]> {
    const snapshots: KPISnapshot[] = [];
    for (const [, snaps] of store.snapshots) {
      snapshots.push(
        ...snaps.filter(
          (s) =>
            s.accountId === accountId &&
            s.snapshotType === snapshotType &&
            (!from || s.periodStart >= from) &&
            (!to || s.periodEnd <= to)
        )
      );
    }
    return snapshots.sort(
      (a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
    );
  }

  aggregateMetrics(
    metrics: KPIMetric[],
    method: AggregationMethod
  ): number {
    if (metrics.length === 0) return 0;

    const values = metrics
      .map((m) => m.valueNumeric)
      .filter((v): v is number => v !== undefined && !isNaN(v));

    if (values.length === 0) return 0;

    switch (method) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'last':
        return values[values.length - 1];
      default:
        return values[values.length - 1];
    }
  }

  formatMetricValue(
    value: number,
    metricType: MetricType,
    displayConfig: DisplayConfig
  ): string {
    const { format, precision, prefix, suffix } = displayConfig;
    let formatted: string;

    switch (format) {
      case 'compact':
        if (Math.abs(value) >= 1e9) {
          formatted = `${(value / 1e9).toFixed(precision)}B`;
        } else if (Math.abs(value) >= 1e6) {
          formatted = `${(value / 1e6).toFixed(precision)}M`;
        } else if (Math.abs(value) >= 1e3) {
          formatted = `${(value / 1e3).toFixed(precision)}K`;
        } else {
          formatted = value.toFixed(precision);
        }
        break;
      case 'currency':
        formatted = `$${value.toLocaleString('en-US', { minimumFractionDigits: precision, maximumFractionDigits: precision })}`;
        break;
      case 'percentage':
        formatted = `${value.toFixed(precision)}%`;
        break;
      case 'number':
      default:
        formatted = value.toLocaleString('en-US', { minimumFractionDigits: precision, maximumFractionDigits: precision });
    }

    return `${prefix}${formatted}${suffix}`;
  }

  getStats(): { totalKPIs: number; totalMetrics: number; totalSnapshots: number } {
    let totalMetrics = 0;
    for (const metrics of store.metrics.values()) {
      totalMetrics += metrics.length;
    }

    let totalSnapshots = 0;
    for (const snaps of store.snapshots.values()) {
      totalSnapshots += snaps.length;
    }

    return {
      totalKPIs: store.kpis.size,
      totalMetrics,
      totalSnapshots,
    };
  }
}

let kpiManagerInstance: KPIManager | null = null;

export function getKPIManager(): KPIManager {
  if (!kpiManagerInstance) {
    kpiManagerInstance = new KPIManager();
  }
  return kpiManagerInstance;
}
