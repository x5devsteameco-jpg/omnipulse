import { NextRequest, NextResponse } from 'next/server';
import { getConfigStore } from '@/lib/config';
import type { TenantConfig } from '@/lib/types/tenant';

declare global {
  namespace Express {
    interface Request {
      tenantConfig?: TenantConfig | null;
      tenantSlug?: string;
    }
  }
}

export interface TenantContext {
  tenantConfig: TenantConfig | null;
  tenantSlug: string | null;
  isValid: boolean;
}

export function extractTenantSlug(request: NextRequest): string | null {
  const url = new URL(request.url);

  const pathMatch = url.pathname.match(/^\/api\/tenants\/([^\/]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }

  const headerTenant = request.headers.get('x-tenant-slug');
  if (typeof headerTenant === 'string' && headerTenant.length > 0) {
    return headerTenant;
  }

  const hostname = url.hostname;
  const hostParts = hostname.split('.');

  if (hostParts.length >= 3) {
    const subdomain = hostParts[0];
    if (subdomain !== 'www' && subdomain !== 'api') {
      return subdomain;
    }
  }

  const queryTenant = url.searchParams.get('tenant');
  if (typeof queryTenant === 'string' && queryTenant.length > 0) {
    return queryTenant;
  }

  return null;
}

export async function resolveTenantContext(
  request: NextRequest
): Promise<TenantContext> {
  const tenantSlug = extractTenantSlug(request);

  if (!tenantSlug) {
    return {
      tenantConfig: null,
      tenantSlug: null,
      isValid: false,
    };
  }

  try {
    const configStore = getConfigStore();
    const tenantConfig = await configStore.getConfig(tenantSlug);

    return {
      tenantConfig,
      tenantSlug,
      isValid: tenantConfig !== null && tenantConfig.isActive,
    };
  } catch (error) {
    console.error(`[TenantContext] Failed to resolve tenant: ${tenantSlug}`, error);
    return {
      tenantConfig: null,
      tenantSlug,
      isValid: false,
    };
  }
}

export function withTenantContext(
  handler: (request: NextRequest, context: TenantContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = await resolveTenantContext(request);

    if (!context.isValid && request.method !== 'GET') {
      return NextResponse.json(
        {
          error: 'Tenant not found or inactive',
          tenantSlug: context.tenantSlug,
        },
        { status: 404 }
      );
    }

    return handler(request, context);
  };
}

export function requireTenantConfig(
  handler: (request: NextRequest, context: TenantContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = await resolveTenantContext(request);

    if (!context.tenantConfig) {
      return NextResponse.json(
        {
          error: 'Tenant configuration not found',
          tenantSlug: context.tenantSlug,
        },
        { status: 404 }
      );
    }

    if (!context.tenantConfig.isActive) {
      return NextResponse.json(
        {
          error: 'Tenant is inactive',
          tenantSlug: context.tenantSlug,
        },
        { status: 403 }
      );
    }

    return handler(request, context);
  };
}

export function getTenantHeaders(tenantSlug: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (tenantSlug) {
    headers['x-tenant-slug'] = tenantSlug;
  }
  return headers;
}
