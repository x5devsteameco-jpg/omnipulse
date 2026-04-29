export type WebhookEvent =
  | 'tenant.created'
  | 'tenant.activated'
  | 'tenant.deactivated'
  | 'metrics.collected'
  | 'gap.identified'
  | 'gap.resolved'
  | 'campaign.started'
  | 'campaign.completed'
  | 'prediction.generated'
  | 'alert.triggered'
  | 'report.generated';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  tenantId: string;
  data: Record<string, unknown>;
  metadata?: {
    source?: string;
    version?: string;
    signature?: string;
  };
}

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  failureCount: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  payload: WebhookPayload;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  deliveredAt: string;
  durationMs: number;
}

export class WebhookManager {
  private endpoints: Map<string, WebhookEndpoint> = new Map();
  private deliveries: Map<string, WebhookDelivery[]> = new Map();
  private readonly MAX_DELIVERIES_PER_WEBHOOK = 100;

  async registerEndpoint(
    tenantId: string,
    url: string,
    events: WebhookEvent[],
    secret?: string
  ): Promise<WebhookEndpoint> {
    const endpoint: WebhookEndpoint = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tenantId,
      url,
      events,
      secret,
      isActive: true,
      createdAt: new Date().toISOString(),
      failureCount: 0,
    };

    this.endpoints.set(endpoint.id, endpoint);
    this.deliveries.set(endpoint.id, []);

    console.log(`[WebhookManager] Registered endpoint: ${endpoint.id} for tenant ${tenantId}`);
    return endpoint;
  }

  async unregisterEndpoint(webhookId: string): Promise<boolean> {
    return this.endpoints.delete(webhookId);
  }

  async updateEndpoint(
    webhookId: string,
    updates: Partial<Pick<WebhookEndpoint, 'url' | 'events' | 'isActive'>>
  ): Promise<WebhookEndpoint | null> {
    const existing = this.endpoints.get(webhookId);
    if (!existing) return null;

    const updated: WebhookEndpoint = {
      ...existing,
      ...updates,
    };

    this.endpoints.set(webhookId, updated);
    return updated;
  }

  async trigger(event: WebhookEvent, tenantId: string, data: Record<string, unknown>): Promise<void> {
    const matchingEndpoints = Array.from(this.endpoints.values()).filter(
      (endpoint) =>
        endpoint.tenantId === tenantId &&
        endpoint.isActive &&
        endpoint.events.includes(event)
    );

    if (matchingEndpoints.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      tenantId,
      data,
      metadata: {
        source: 'omnipulse',
        version: '1.0',
      },
    };

    const deliveryPromises = matchingEndpoints.map((endpoint) =>
      this.deliverToEndpoint(endpoint, payload)
    );

    await Promise.allSettled(deliveryPromises);
  }

  private async deliverToEndpoint(endpoint: WebhookEndpoint, payload: WebhookPayload): Promise<void> {
    const startTime = Date.now();

    const delivery: WebhookDelivery = {
      id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      webhookId: endpoint.id,
      payload,
      deliveredAt: new Date().toISOString(),
      durationMs: 0,
    };

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-OmniPulse-Event': payload.event,
        'X-OmniPulse-Timestamp': payload.timestamp,
      };

      if (endpoint.secret) {
        const signature = this.generateSignature(payload, endpoint.secret);
        headers['X-OmniPulse-Signature'] = signature;
      }

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      delivery.responseStatus = response.status;
      delivery.responseBody = await response.text().catch(() => undefined);
      delivery.durationMs = Date.now() - startTime;

      if (!response.ok) {
        endpoint.failureCount++;
        console.error(`[WebhookManager] Delivery failed to ${endpoint.url}: ${response.status}`);
      } else {
        endpoint.failureCount = 0;
        endpoint.lastTriggeredAt = new Date().toISOString();
      }

    } catch (error) {
      delivery.error = error instanceof Error ? error.message : 'Unknown error';
      delivery.durationMs = Date.now() - startTime;
      endpoint.failureCount++;
      console.error(`[WebhookManager] Delivery error to ${endpoint.url}:`, error);
    }

    this.addDelivery(endpoint.id, delivery);
  }

  private generateSignature(payload: WebhookPayload, secret: string): string {
    const data = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const msg = encoder.encode(data);

    let hash = 0;
    for (let i = 0; i < msg.length; i++) {
      hash = ((hash << 5) - hash) + msg[i];
      hash = hash & hash;
    }

    return `sha256=${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }

  private addDelivery(webhookId: string, delivery: WebhookDelivery): void {
    const deliveries = this.deliveries.get(webhookId) || [];
    deliveries.push(delivery);

    if (deliveries.length > this.MAX_DELIVERIES_PER_WEBHOOK) {
      deliveries.shift();
    }

    this.deliveries.set(webhookId, deliveries);
  }

  getEndpoint(webhookId: string): WebhookEndpoint | null {
    return this.endpoints.get(webhookId) || null;
  }

  getEndpointsByTenant(tenantId: string): WebhookEndpoint[] {
    return Array.from(this.endpoints.values()).filter((e) => e.tenantId === tenantId);
  }

  getDeliveries(webhookId: string, limit: number = 10): WebhookDelivery[] {
    const deliveries = this.deliveries.get(webhookId) || [];
    return deliveries.slice(-limit);
  }

  getStats(): { totalEndpoints: number; totalDeliveries: number; activeEndpoints: number } {
    const endpoints = Array.from(this.endpoints.values());
    let totalDeliveries = 0;

    for (const deliveries of this.deliveries.values()) {
      totalDeliveries += deliveries.length;
    }

    return {
      totalEndpoints: endpoints.length,
      activeEndpoints: endpoints.filter((e) => e.isActive).length,
      totalDeliveries,
    };
  }
}

let webhookManagerInstance: WebhookManager | null = null;

export function getWebhookManager(): WebhookManager {
  if (!webhookManagerInstance) {
    webhookManagerInstance = new WebhookManager();
  }
  return webhookManagerInstance;
}
