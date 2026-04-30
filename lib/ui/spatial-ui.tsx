'use client';

import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface SpatialCardProps {
  children: React.ReactNode;
  baseZ?: number;
  hoverZ?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SpatialCard = memo(function SpatialCard({
  children,
  baseZ = 500,
  hoverZ = 650,
  className = '',
  style = {},
}: SpatialCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [translateZ, setTranslateZ] = useState(0);

  useEffect(() => {
    const targetZ = isHovered ? hoverZ - baseZ : 0;
    setTranslateZ(targetZ);
  }, [isHovered, baseZ, hoverZ]);

  return (
    <motion.div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `translateZ(${translateZ}px)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
});

interface ZLayerProps {
  z: number;
  perspective?: number;
  children: React.ReactNode;
  className?: string;
}

export const ZLayer = memo(function ZLayer({
  z,
  perspective = 1000,
  children,
  className = '',
}: ZLayerProps) {
  return (
    <div
      className={className}
      style={{
        transform: `translateZ(${z}px)`,
        transformStyle: 'preserve-3d',
        perspective,
      }}
    >
      {children}
    </div>
  );
});

interface SpatialContainerProps {
  enabled?: boolean;
  perspective?: number;
  rotateX?: number;
  rotateY?: number;
  children: React.ReactNode;
  className?: string;
}

export const SpatialContainer = memo(function SpatialContainer({
  enabled = true,
  perspective = 1200,
  rotateX = -8,
  rotateY = 2,
  children,
  className = '',
}: SpatialContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = ((e.clientX - centerX) / rect.width) * 2;
      const offsetY = ((e.clientY - centerY) / rect.height) * 2;
      setMouseOffset({ x: offsetX, y: offsetY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const currentRotateX = rotateX + mouseOffset.y * 2;
  const currentRotateY = rotateY + mouseOffset.x * 2;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        perspective,
        perspectiveOrigin: 'center',
      }}
    >
      <motion.div
        style={{
          transformStyle: 'preserve-3d',
          rotateX: currentRotateX,
          rotateY: currentRotateY,
          transition: 'rotateX 0.1s ease, rotateY 0.1s ease',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
});

interface ActivityRingProps {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
  thickness?: number;
  className?: string;
}

export const ActivityRing = memo(function ActivityRing({
  segments,
  size = 80,
  thickness = 6,
  className = '',
}: ActivityRingProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth={thickness}
        />
        {segments.map((seg, i) => {
          const offset = segments.slice(0, i).reduce((acc, s) => acc + (s.value / 100) * circumference, 0);
          const dashLength = (seg.value / 100) * circumference;
          const dashOffset = circumference - offset;
          return (
            <motion.circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
            />
          );
        })}
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}>
        {segments.slice(0, 1).map((seg) => (
          <span key={seg.label} style={{ fontSize: 14, fontWeight: 700, color: seg.color }}>
            {seg.value}%
          </span>
        ))}
      </div>
    </div>
  );
});

interface TimeAwareGradientProps {
  className?: string;
}

export const TimeAwareGradient = memo(function TimeAwareGradient({ className = '' }: TimeAwareGradientProps) {
  const [gradient, setGradient] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      setGradient('radial-gradient(ellipse at 30% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)');
    } else if (hour >= 12 && hour < 18) {
      setGradient('radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.04) 0%, transparent 50%)');
    } else if (hour >= 18 && hour < 22) {
      setGradient('radial-gradient(ellipse at 20% 60%, rgba(139, 92, 246, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 40%, rgba(6, 182, 212, 0.04) 0%, transparent 50%)');
    } else {
      setGradient('radial-gradient(ellipse at 30% 40%, rgba(212, 175, 55, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(139, 92, 246, 0.04) 0%, transparent 50%)');
    }
  }, []);

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        background: gradient,
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'background 2s ease',
      }}
    />
  );
});

export default SpatialCard;
