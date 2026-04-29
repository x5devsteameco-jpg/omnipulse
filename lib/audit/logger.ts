export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'LOGOUT' | 'CONFIG_CHANGE';

export interface AuditEvent {
  id: string;
  tenantId: string;
  actorId?: string;
  actorEmail?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  durationMs?: number;
  status: 'success' | 'failure' | 'pending';
  errorMessage?: string;
}

export interface AuditQuery {
  tenantId: string;
  actorId?: string;
  action?: AuditAction;
  resource?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  totalEvents: number;
  byAction: Record<AuditAction, number>;
  byResource: Record<string, number>;
  recentActors: Array<{ actorId: string; count: number }>;
}

export class AuditLogger {
  private events: AuditEvent[] = [];
  private readonly MAX_EVENTS = 10000;

  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const fullEvent: AuditEvent = {
      ...event,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.events.push(fullEvent);

    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    return fullEvent;
  }

  query(query: AuditQuery): AuditEvent[] {
    let results = this.events.filter((e) => e.tenantId === query.tenantId);

    if (query.actorId) {
      results = results.filter((e) => e.actorId === query.actorId);
    }

    if (query.action) {
      results = results.filter((e) => e.action === query.action);
    }

    if (query.resource) {
      results = results.filter((e) => e.resource === query.resource);
    }

    if (query.from) {
      const fromDate = new Date(query.from);
      results = results.filter((e) => new Date(e.timestamp) >= fromDate);
    }

    if (query.to) {
      const toDate = new Date(query.to);
      results = results.filter((e) => new Date(e.timestamp) <= toDate);
    }

    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const offset = query.offset || 0;
    const limit = query.limit || 100;

    return results.slice(offset, offset + limit);
  }

  getSummary(tenantId: string, days: number = 7): AuditSummary {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recentEvents = this.events.filter(
      (e) => e.tenantId === tenantId && new Date(e.timestamp) >= cutoff
    );

    const byAction: Record<AuditAction, number> = {
      CREATE: 0, READ: 0, UPDATE: 0, DELETE: 0, EXPORT: 0,
      LOGIN: 0, LOGOUT: 0, CONFIG_CHANGE: 0,
    };

    const byResource: Record<string, number> = {};
    const actorCounts: Record<string, number> = {};

    for (const event of recentEvents) {
      byAction[event.action]++;
      byResource[event.resource] = (byResource[event.resource] || 0) + 1;

      if (event.actorId) {
        actorCounts[event.actorId] = (actorCounts[event.actorId] || 0) + 1;
      }
    }

    const recentActors = Object.entries(actorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([actorId, count]) => ({ actorId, count }));

    return {
      totalEvents: recentEvents.length,
      byAction,
      byResource,
      recentActors,
    };
  }

  exportToJSON(query: AuditQuery): string {
    const events = this.query(query);
    return JSON.stringify(events, null, 2);
  }

  exportToCSV(query: AuditQuery): string {
    const events = this.query(query);

    if (events.length === 0) {
      return 'id,tenantId,actorId,actorEmail,action,resource,resourceId,ipAddress,timestamp,status\n';
    }

    const headers = [
      'id', 'tenantId', 'actorId', 'actorEmail', 'action',
      'resource', 'resourceId', 'ipAddress', 'timestamp', 'status',
    ];

    const rows = events.map((e) =>
      headers.map((h) => {
        const val = e[h as keyof AuditEvent];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return String(val ?? '');
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  getStats(): { totalEvents: number; tenantCount: number } {
    const tenantIds = new Set(this.events.map((e) => e.tenantId));
    return {
      totalEvents: this.events.length,
      tenantCount: tenantIds.size,
    };
  }
}

let auditLoggerInstance: AuditLogger | null = null;

export function getAuditLogger(): AuditLogger {
  if (!auditLoggerInstance) {
    auditLoggerInstance = new AuditLogger();
  }
  return auditLoggerInstance;
}
