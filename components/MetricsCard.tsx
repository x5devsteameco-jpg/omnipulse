'use client';

import { motion } from 'framer-motion';

interface MetricsCardProps {
  label: string;
  value: number;
  sub: string;
  color: string;
  delay?: number;
  format?: 'number' | 'percent';
}

function formatValue(val: number, fmt: string): string {
  if (fmt === 'percent') return `${val.toFixed(2)}%`;
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toString();
}

export default function MetricsCard({ label, value, sub, color, delay = 0.1, format = 'number' }: MetricsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
    >
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ color }}>{formatValue(value, format)}</p>
      <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '8px 0 0', letterSpacing: 0.5 }}>{sub}</p>
    </motion.div>
  );
}