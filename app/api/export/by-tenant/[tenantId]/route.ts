import { NextRequest, NextResponse } from 'next/server';
import { getDataExporter } from '@/lib/export';
import { getAuditLogger } from '@/lib/audit';

interface ExportParams {
  params: Promise<{ tenantId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: ExportParams
) {
  try {
    const { tenantId } = await params;
    const url = new URL(request.url);

    const format = (url.searchParams.get('format') || 'csv') as 'csv' | 'json' | 'pdf';
    const resource = url.searchParams.get('resource') || 'audit';
    const from = url.searchParams.get('from') || undefined;
    const to = url.searchParams.get('to') || undefined;

    const auditLogger = getAuditLogger();
    const exporter = getDataExporter();

    if (resource === 'audit') {
      const events = auditLogger.query({
        tenantId,
        from,
        to,
        limit: 10000,
      });

      const result = format === 'json'
        ? exporter.exportToJSON(events, `audit-export-${tenantId}`)
        : exporter.exportToCSV(events as unknown as Record<string, unknown>[], `audit-export-${tenantId}`);

      return new NextResponse(result.data, {
        headers: {
          'Content-Type': result.mimeType,
          'Content-Disposition': `attachment; filename="${result.filename}"`,
        },
      });
    }

    return NextResponse.json(
      { error: `Unknown resource: ${resource}` },
      { status: 400 }
    );

  } catch (error) {
    console.error('[ExportAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
