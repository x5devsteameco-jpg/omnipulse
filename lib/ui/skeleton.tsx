'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'shimmer' | 'pulse' | 'none';
  style?: React.CSSProperties;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
  style,
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded-[var(--radius-sm)] h-3',
    circular: 'rounded-full',
    rectangular: 'rounded-[var(--radius-md)]',
    card: 'rounded-[var(--radius-xl)]',
  };

  const animationStyles = {
    shimmer: `
      bg-[length:200%_100%]
      animate-[shimmer_1.5s_ease-in-out_infinite]
      bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-hover)] to-[var(--bg-surface)]
    `,
    pulse: 'animate-[pulse-glow_2s_ease-in-out_infinite] bg-[var(--bg-surface)]',
    none: 'bg-[var(--bg-surface)]',
  };

  const combinedStyle: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : '100%'),
    height: height ?? (variant === 'text' ? '0.75rem' : '100%'),
    ...style,
  };

  return (
    <div
      className={`${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={combinedStyle}
    />
  );
}

interface SkeletonCardProps {
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}

export function SkeletonCard({
  showAvatar = true,
  lines = 3,
  className = '',
}: SkeletonCardProps) {
  return (
    <div
      className={`
        bg-[var(--glass-bg)] backdrop-blur-[12px]
        border border-[var(--glass-border)]
        rounded-[var(--radius-xl)] p-5
        space-y-4
        ${className}
      `}
    >
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-2 flex-1">
            <Skeleton width="60%" height={12} />
            <Skeleton width="40%" height={10} />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width={i === lines - 1 ? '70%' : '100%'}
            height={10}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = '',
}: SkeletonTableProps) {
  return (
    <div
      className={`
        bg-[var(--glass-bg)] backdrop-blur-[12px)]
        border border-[var(--glass-border)]
        rounded-[var(--radius-xl)] overflow-hidden
        ${className}
      `}
    >
      <div className="divide-y divide-[var(--border-subtle)]">
        <div className="flex gap-4 p-4 border-b border-[var(--border-subtle)]">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={10} width={`${100 / columns}%`} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="rectangular"
                height={10}
                width={`${100 / columns}%`}
                animation={colIndex === 0 ? 'none' : 'shimmer'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
