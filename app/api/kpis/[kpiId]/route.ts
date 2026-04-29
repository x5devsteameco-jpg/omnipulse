import { NextRequest, NextResponse } from 'next/server';
import { getKPIManager } from '@/lib/kpi';
import { DEFAULT_KPI_DISPLAY_CONFIG } from '@/lib/types/kpi';

interface KPIParams {
  params: Promise<{ kpiId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: KPIParams
) {
  try {
    const { kpiId } = await params;
    const kpiManager = getKPIManager();

    const kpi = await kpiManager.getKPI(kpiId);
    if (!kpi) {
      return NextResponse.json(
        { error: 'KPI not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const from = url.searchParams.get('from') || undefined;
    const to = url.searchParams.get('to') || undefined;

    const metrics = await kpiManager.getMetrics(kpi.id, kpi.id, from, to);
    const aggregatedValue = kpiManager.aggregateMetrics(metrics, kpi.aggregationMethod);
    const formattedValue = kpiManager.formatMetricValue(
      aggregatedValue,
      kpi.metricType,
      kpi.displayConfig
    );

    return NextResponse.json({
      kpi,
      currentValue: aggregatedValue,
      formattedValue,
      dataPoints: metrics.length,
    });

  } catch (error) {
    console.error('[KPIsAPI] GET kpi error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: KPIParams
) {
  try {
    const { kpiId } = await params;
    const updates = await request.json();
    const kpiManager = getKPIManager();

    const existing = await kpiManager.getKPI(kpiId);
    if (!existing) {
      return NextResponse.json(
        { error: 'KPI not found' },
        { status: 404 }
      );
    }

    const allowedUpdates = [
      'name', 'slug', 'description', 'metricType', 'aggregationMethod',
      'platformSource', 'displayConfig', 'calculationConfig', 'isActive'
    ];

    const filteredUpdates: Record<string, unknown> = {};
    for (const key of allowedUpdates) {
      if (key in updates) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updated = await kpiManager.updateKPI(kpiId, filteredUpdates);

    return NextResponse.json({
      kpi: updated,
      message: 'KPI updated successfully',
    });

  } catch (error) {
    console.error('[KPIsAPI] PATCH kpi error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: KPIParams
) {
  try {
    const { kpiId } = await params;
    const kpiManager = getKPIManager();

    const deleted = await kpiManager.deleteKPI(kpiId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'KPI not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'KPI deleted successfully',
    });

  } catch (error) {
    console.error('[KPIsAPI] DELETE kpi error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
