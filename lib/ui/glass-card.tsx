'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: 'gold' | 'emerald' | 'rose' | 'none';
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  padding = 'md',
  hover = false,
  glow = 'none',
  onClick,
}: GlassCardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const glowStyles = {
    gold: 'hover:shadow-[var(--shadow-glow-gold)]',
    emerald: 'hover:shadow-[var(--shadow-glow-emerald)]',
    rose: 'hover:shadow-[var(--shadow-glow-rose)]',
    none: '',
  };

  const baseStyles = `
    relative overflow-hidden
    bg-[var(--glass-bg)] backdrop-blur-[12px]
    border border-[var(--glass-border)]
    rounded-[var(--radius-xl)]
    transition-all duration-[var(--duration-normal)]
  `;

  const hoverStyles = hover
    ? `
      cursor-pointer
      hover:bg-[var(--glass-hover)]
      hover:border-[var(--border-strong)]
      ${glowStyles[glow]}
      active:scale-[0.98]
    `
    : '';

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {glow !== 'none' && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${
              glow === 'gold' ? 'rgba(212, 175, 55, 0.1)' :
              glow === 'emerald' ? 'rgba(16, 185, 129, 0.1)' :
              glow === 'rose' ? 'rgba(244, 63, 94, 0.1)' : 'transparent'
            } 0%, transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
