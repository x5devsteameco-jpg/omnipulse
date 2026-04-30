'use client';

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RealTimeMetrics {
  label: string;
  value: number;
  previousValue: number;
  format?: 'number' | 'percent' | 'currency';
  icon?: React.ReactNode;
}

interface LiveIndicatorProps {
  isLive?: boolean;
  lastUpdate?: Date;
}

export const LiveIndicator = memo(function LiveIndicator({
  isLive = true,
  lastUpdate,
}: LiveIndicatorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 10px',
        background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
        border: `1px solid ${isLive ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-default)'}`,
        borderRadius: 20,
      }}
    >
      <motion.div
        animate={isLive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isLive ? '#10b981' : 'var(--text-dim)',
          boxShadow: isLive ? '0 0 8px #10b981' : 'none',
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: isLive ? '#10b981' : 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {isLive ? 'Live' : 'Offline'}
      </span>
      {lastUpdate && (
        <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
          {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
});

interface UseRealTimeUpdatesOptions {
  interval?: number;
  onUpdate?: (data: Record<string, number>) => void;
}

export function useRealTimeUpdates(
  initialData: Record<string, number>,
  options: UseRealTimeUpdatesOptions = {}
) {
  const { interval = 5000, onUpdate } = options;
  const [data, setData] = useState(initialData);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [delta, setDelta] = useState<Record<string, number>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const simulateUpdate = useCallback(() => {
    setData((prev) => {
      const newDelta: Record<string, number> = {};
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        const currentValue = updated[key];
        const change = (Math.random() - 0.5) * (currentValue * 0.02);
        updated[key] = Math.max(0, currentValue + change);
        newDelta[key] = change;
      });

      setDelta(newDelta);
      setLastUpdate(new Date());
      onUpdate?.(updated);
      return updated;
    });
  }, [onUpdate]);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(simulateUpdate, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, interval, simulateUpdate]);

  const pause = useCallback(() => setIsLive(false), []);
  const resume = useCallback(() => setIsLive(true), []);
  const toggle = useCallback(() => setIsLive((prev) => !prev), []);

  return {
    data,
    delta,
    isLive,
    lastUpdate,
    pause,
    resume,
    toggle,
  };
}

interface AnimatedNumberProps {
  value: number;
  format?: 'number' | 'percent' | 'currency';
  duration?: number;
}

export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  format = 'number',
  duration = 500,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOutQuart;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatValue = (val: number) => {
    switch (format) {
      case 'percent':
        return val.toFixed(1) + '%';
      case 'currency':
        return '$' + val.toLocaleString('en-US', { maximumFractionDigits: 0 });
      default:
        return val >= 1000000
          ? (val / 1000000).toFixed(1) + 'M'
          : val >= 1000
          ? (val / 1000).toFixed(1) + 'K'
          : val.toFixed(0);
    }
  };

  return <span>{formatValue(displayValue)}</span>;
});

interface PulseIndicatorProps {
  value: number;
  threshold?: number;
  direction?: 'above' | 'below';
}

export const PulseIndicator = memo(function PulseIndicator({
  value,
  threshold = 0,
  direction = 'above',
}: PulseIndicatorProps) {
  const isActive =
    direction === 'above' ? value > threshold : value < threshold;

  return (
    <motion.div
      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: isActive ? 'var(--accent-emerald)' : 'var(--text-dim)',
      }}
    />
  );
});

export default useRealTimeUpdates;
