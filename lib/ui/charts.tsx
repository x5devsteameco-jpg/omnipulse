'use client';

import React, { useMemo } from 'react';

interface DataPoint {
  date: string;
  value: number;
  [key: string]: string | number;
}

interface MetricChartProps {
  data: DataPoint[];
  dataKey?: string;
  series?: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  variant?: 'line' | 'area' | 'bar';
  animate?: boolean;
}

export function MetricChart({
  data,
  dataKey = 'value',
  series,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  variant = 'line',
  animate = true,
}: MetricChartProps) {
  const colors = useMemo(() => ({
    primary: 'var(--gold-primary)',
    secondary: 'var(--text-secondary)',
    accent: 'var(--accent-emerald)',
    grid: 'var(--border-default)',
    tooltip: 'var(--bg-surface)',
  }), []);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          height,
        }}
      >
        <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>No data available</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const maxValue = Math.max(...chartData.map((d) => {
    if (series) {
      return Math.max(...series.map((s) => Number((d as Record<string, unknown>)[s.dataKey]) || 0));
    }
    return Number((d as Record<string, unknown>)[dataKey]) || 0;
  }));

  const minValue = Math.min(...chartData.map((d) => {
    if (series) {
      return Math.min(...series.map((s) => Number((d as Record<string, unknown>)[s.dataKey]) || 0));
    }
    return Number((d as Record<string, unknown>)[dataKey]) || 0;
  }));

  const yAxisDomain = [
    Math.floor(minValue * 0.9),
    Math.ceil(maxValue * 1.1),
  ];

  const formatValue = (val: number): string => {
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
    return val.toFixed(0);
  };

  const chartSeries = series || [{ dataKey, name: 'Value', color: colors.primary }];

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        padding: 'var(--space-4)',
        height: height + 60,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        {showLegend && (
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            {chartSeries.map((s) => (
              <div key={s.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: s.color || colors.primary,
                  }}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${1000} ${height}`} preserveAspectRatio="none">
          {showGrid && (
            <g>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = ratio * height;
                return (
                  <line
                    key={ratio}
                    x1="0"
                    y1={y}
                    x2="1000"
                    y2={y}
                    stroke={colors.grid}
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                );
              })}
            </g>
          )}

          {chartSeries.map((s, seriesIndex) => {
            const points = chartData.map((d, i) => {
              const value = Number((d as Record<string, unknown>)[s.dataKey]) || 0;
              const x = (i / (chartData.length - 1)) * 1000;
              const y = height - ((value - yAxisDomain[0]) / (yAxisDomain[1] - yAxisDomain[0])) * height;
              return { x, y, value };
            });

            const linePath = points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ');

            const areaPath = variant !== 'line' ? `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z` : '';

            const color = s.color || (seriesIndex === 0 ? colors.primary : colors.accent);

            return (
              <g key={s.dataKey}>
                {variant === 'area' && (
                  <path
                    d={areaPath}
                    fill={color}
                    fillOpacity="0.1"
                  />
                )}
                <path
                  d={linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {variant === 'line' && points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill={color}
                    stroke="var(--bg-surface)"
                    strokeWidth="2"
                    style={{ opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {showTooltip && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
            <span>{chartData[0]?.dateLabel}</span>
            <span>{chartData[chartData.length - 1]?.dateLabel}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
          {formatValue(yAxisDomain[1])} max
        </span>
      </div>
    </div>
  );
}
