'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: 'gold' | 'emerald' | 'rose' | 'none';
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  glow = 'none',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    borderRadius: 'var(--radius-lg)',
    transition: 'all var(--duration-fast)',
    outline: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.5 : 1,
    border: 'none',
    fontFamily: 'inherit',
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: 'var(--gradient-gold)',
      color: 'var(--text-inverse)',
    },
    secondary: {
      background: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
      background: 'var(--accent-rose)',
      color: 'white',
    },
    success: {
      background: 'var(--accent-emerald)',
      color: 'white',
    },
  };

  const glowStyles = {
    gold: { boxShadow: 'var(--shadow-glow-gold)' },
    emerald: { boxShadow: 'var(--shadow-glow-emerald)' },
    rose: { boxShadow: 'var(--shadow-glow-rose)' },
    none: {},
  };

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { height: 32, paddingLeft: 12, paddingRight: 12, fontSize: 'var(--text-sm)', gap: 6 },
    md: { height: 40, paddingLeft: 16, paddingRight: 16, fontSize: 'var(--text-base)', gap: 8 },
    lg: { height: 48, paddingLeft: 24, paddingRight: 24, fontSize: 'var(--text-md)', gap: 10 },
  };

  const combinedStyle = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...glowStyles[glow],
  };

  return (
    <button
      style={combinedStyle}
      className={className}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span style={{ flexShrink: 0 }}>{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !isLoading && (
        <span style={{ flexShrink: 0 }}>{rightIcon}</span>
      )}
    </button>
  );
}
