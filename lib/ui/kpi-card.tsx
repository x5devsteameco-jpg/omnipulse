'use client';

import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  format?: 'number' | 'percentage' | 'currency' | 'compact';
  trend?: 'up' | 'down' | 'stable';
  sparklineData?: number[];
  color?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  previousValue,
  change,
  changeLabel,
  format = 'compact',
  trend,
  sparklineData,
  color,
  className = '',
}: KPICardProps) {
  const displayChange = change !== undefined ? change : previousValue !== undefined && previousValue !== 0
    ? ((Number(value) - Number(previousValue)) / Number(previousValue)) * 100
    : 0;

  const effectiveTrend = trend || (displayChange > 0 ? 'up' : displayChange < 0 ? 'down' : 'stable');

  const formatValue = (val: string | number): string => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return String(val);

    switch (format) {
      case 'percentage':
        return `${num.toFixed(1)}%`;
      case 'currency':
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      case 'compact':
        if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
        if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toFixed(0);
      default:
        return num.toLocaleString();
    }
  };

  const trendColors = {
    up: 'var(--accent-emerald)',
    down: 'var(--accent-rose)',
    stable: 'var(--text-dim)',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <div
      className={className}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color || 'var(--gold-primary)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${color || 'var(--gold-primary)'}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 'var(--space-1)',
          }}>
            {label}
          </p>
          <p style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            ...(color ? { color } : {}),
          }}>
            {formatValue(value)}
          </p>

          {(displayChange !== 0 || changeLabel) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 'var(--space-2)' }}>
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: trendColors[effectiveTrend],
              }}>
                {trendIcons[effectiveTrend]} {Math.abs(displayChange).toFixed(1)}%
              </span>
              {changeLabel && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 1 && (
          <div style={{ width: 80, height: 40 }}>
            <svg width="80" height="40" viewBox="0 0 80 40" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id={`gradient-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color || 'var(--gold-primary)'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color || 'var(--gold-primary)'} stopOpacity="0" />
                </linearGradient>
              </defs>

              {(() => {
                const min = Math.min(...sparklineData);
                const max = Math.max(...sparklineData);
                const range = max - min || 1;

                const points = sparklineData.map((v, i) => ({
                  x: (i / (sparklineData.length - 1)) * 80,
                  y: 40 - ((v - min) / range) * 35,
                }));

                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaPath = `${linePath} L 80 40 L 0 40 Z`;

                return (
                  <g>
                    <path d={areaPath} fill={`url(#gradient-${label.replace(/\s+/g, '-')})`} />
                    <path
                      d={linePath}
                      fill="none"
                      stroke={color || 'var(--gold-primary)'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })()}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
