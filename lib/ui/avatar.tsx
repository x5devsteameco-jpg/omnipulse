'use client';

import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 50%)`;
}

export function Avatar({
  src,
  alt,
  name = '',
  size = 'md',
  status,
  className = '',
}: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusStyles = {
    online: 'bg-[var(--color-success)]',
    offline: 'bg-[var(--color-text-dim)]',
    away: 'bg-[var(--color-warning)]',
    busy: 'bg-[var(--color-error)]',
  };

  const statusSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const hasImage = src && src.length > 0;

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`
          ${sizeStyles[size]}
          rounded-full overflow-hidden
          flex items-center justify-center font-medium
          ${!hasImage ? 'text-white' : ''}
        `}
        style={!hasImage && name ? { backgroundColor: stringToColor(name) } : undefined}
      >
        {hasImage ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name || '?')}</span>
        )}
      </div>
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2 ring-[var(--color-surface)]
            ${statusSize[size]}
            ${statusStyles[status]}
          `}
        />
      )}
    </div>
  );
}
