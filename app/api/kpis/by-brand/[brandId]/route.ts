import { NextRequest, NextResponse } from 'next/server';
import { getKPIManager } from '@/lib/kpi';
import { DEFAULT_KPI_DISPLAY_CONFIG, PRESET_KPI_TEMPLATES } from '@/lib/types/kpi';
import type { KPIDefinition } from '@/lib/types/kpi';

interface KPIRequest {
  name: string;
  slug: string;
  description?: string;
  metricType: 'counter' | 'gauge' | 'rate' | 'percentage' | 'currency';
  aggregationMethod: 'sum' | 'avg' | 'min' | 'max' | 'last';
  platformSource: string[];
  displayConfig?: {
    format?: 'number' | 'compact' | 'currency' | 'percentage';
    precision?: number;
    prefix?: string;
    suffix?: string;
    colorThresholds?: { min: number; max: number; color: string }[];
  };
  calculationConfig?: Record<string, unknown>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const kpiManager = getKPIManager();

    const kpis = await kpiManager.getKPIsByBrand(brandId);

    return NextResponse.json({
      kpis,
      count: kpis.length,
    });

  } catch (error) {
    console.error('[KPIsAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const body: KPIRequest = await request.json();

    const { name, slug, description, metricType, aggregationMethod, platformSource, displayConfig, calculationConfig } = body;

    if (!name || !slug || !metricType || !aggregationMethod) {
      return NextResponse.json(
        { error: 'name, slug, metricType, and aggregationMethod are required' },
        { status: 400 }
      );
    }

    const kpiManager = getKPIManager();

    const existingKPIs = await kpiManager.getKPIsByBrand(brandId);
    const slugExists = existingKPIs.some((kpi) => kpi.slug === slug);
    if (slugExists) {
      return NextResponse.json(
        { error: `KPI with slug "${slug}" already exists for this brand` },
        { status: 409 }
      );
    }

    const kpi = await kpiManager.createKPI(brandId, {
      name,
      slug,
      description: description || '',
      metricType,
      aggregationMethod,
      platformSource: platformSource || [],
      calculationConfig: calculationConfig || {},
      displayConfig: { ...DEFAULT_KPI_DISPLAY_CONFIG, ...displayConfig },
      isActive: true,
      createdBy: 'system',
    });

    return NextResponse.json({ kpi }, { status: 201 });

  } catch (error) {
    console.error('[KPIsAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const { templateId, customizations } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'templateId is required' },
        { status: 400 }
      );
    }

    const template = PRESET_KPI_TEMPLATES.find((t) => t.slug === templateId);
    if (!template) {
      return NextResponse.json(
        { error: `Template "${templateId}" not found` },
        { status: 404 }
      );
    }

    const kpiManager = getKPIManager();
    const existingKPIs = await kpiManager.getKPIsByBrand(brandId);
    const slugExists = existingKPIs.some((kpi) => kpi.slug === template.slug);
    if (slugExists) {
      return NextResponse.json(
        { error: `KPI with slug "${template.slug}" already exists for this brand` },
        { status: 409 }
      );
    }

    const kpi = await kpiManager.createKPI(brandId, {
      name: customizations?.name || template.name,
      slug: template.slug,
      description: customizations?.description || template.description,
      metricType: template.metricType,
      aggregationMethod: template.aggregationMethod,
      platformSource: customizations?.platformSource || [],
      calculationConfig: customizations?.calculationConfig || {},
      displayConfig: customizations?.displayConfig || DEFAULT_KPI_DISPLAY_CONFIG,
      isActive: true,
      createdBy: 'system',
    });

    return NextResponse.json({
      kpi,
      message: `KPI created from template "${template.name}"`,
    }, { status: 201 });

  } catch (error) {
    console.error('[KPIsAPI] PUT from template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
