export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: Record<string, string>;
}

export interface ExportResult {
  filename: string;
  mimeType: string;
  data: string;
  sizeBytes: number;
}

export class DataExporter {
  exportToJSON(data: unknown[], filename: string): ExportResult {
    const json = JSON.stringify(data, null, 2);
    return {
      filename: `${filename}.json`,
      mimeType: 'application/json',
      data: json,
      sizeBytes: Buffer.byteLength(json, 'utf8'),
    };
  }

  exportToCSV(data: Record<string, unknown>[], filename: string): ExportResult {
    if (data.length === 0) {
      return {
        filename: `${filename}.csv`,
        mimeType: 'text/csv',
        data: '',
        sizeBytes: 0,
      };
    }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.map((h) => this.escapeCSV(h)).join(',');

    const rows = data.map((row) =>
      headers.map((h) => {
        const value = row[h];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return this.escapeCSV(JSON.stringify(value));
        return this.escapeCSV(String(value));
      }).join(',')
    );

    const csv = [csvHeaders, ...rows].join('\n');

    return {
      filename: `${filename}.csv`,
      mimeType: 'text/csv',
      data: csv,
      sizeBytes: Buffer.byteLength(csv, 'utf8'),
    };
  }

  async exportToPDF(
    htmlContent: string,
    filename: string
  ): Promise<ExportResult> {
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; }
    h1 { color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    .metric { font-size: 24px; font-weight: bold; color: #d4af37; }
    .footer { margin-top: 40px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  ${htmlContent}
  <div class="footer">
    Generated on ${new Date().toLocaleString()} | OmniPulse Analytics
  </div>
</body>
</html>
    `.trim();

    return {
      filename: `${filename}.html`,
      mimeType: 'text/html',
      data: pdfContent,
      sizeBytes: Buffer.byteLength(pdfContent, 'utf8'),
    };
  }

  generateReport(
    title: string,
    metrics: Record<string, unknown>[],
    summary: Record<string, unknown>,
    options?: { includeCharts?: boolean }
  ): string {
    const rows = metrics.map((m) =>
      `<tr>${Object.values(m).map((v) => `<td>${v}</td>`).join('')}</tr>`
    ).join('');

    const summaryRows = Object.entries(summary)
      .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
      .join('');

    return `
      <h1>${title}</h1>
      <h2>Summary</h2>
      <table>
        ${summaryRows}
      </table>
      <h2>Detailed Metrics</h2>
      <table>
        <thead>
          <tr>${Object.keys(metrics[0] || {}).map((k) => `<th>${k}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

let dataExporterInstance: DataExporter | null = null;

export function getDataExporter(): DataExporter {
  if (!dataExporterInstance) {
    dataExporterInstance = new DataExporter();
  }
  return dataExporterInstance;
}
