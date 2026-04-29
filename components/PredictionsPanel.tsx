'use client';

import { motion } from 'framer-motion';

interface Prediction {
  predictedFollowers: number;
  predictedEngagement: number;
  predictedPosts: number;
  confidence: number;
  period: string;
  trendDirection: string;
}

interface PredictionsPanelProps {
  predictions: Prediction[];
}

function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.4) return 'medium';
  return 'low';
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

const confidenceColors = {
  high: 'var(--accent-emerald)',
  medium: 'var(--accent-amber)',
  low: 'var(--accent-rose)',
};

const trendIcons = {
  increasing: { icon: '↑', color: 'var(--accent-emerald)' },
  decreasing: { icon: '↓', color: 'var(--accent-rose)' },
  stable: { icon: '→', color: 'var(--text-dim)' },
};

export default function PredictionsPanel({ predictions }: PredictionsPanelProps) {
  const latestPredictions = predictions.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      className="section"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="section-header">
        <h3 className="section-title">Exposure Predictions</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent-emerald)',
            boxShadow: '0 0 8px var(--accent-emerald)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>ML-powered forecast</span>
        </div>
      </div>
      <div className="prediction-grid">
        {latestPredictions.map((pred, i) => {
          const confidenceLevel = getConfidenceLevel(pred.confidence);
          const trend = trendIcons[pred.trendDirection as keyof typeof trendIcons] || trendIcons.stable;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i, type: 'spring', stiffness: 300 }}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400 } }}
              className="prediction-card"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 60,
                height: 60,
                background: `radial-gradient(circle at center, ${confidenceColors[confidenceLevel]}15 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />
              <p className="prediction-metric" style={{ color: 'var(--text-tertiary)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Followers</p>
              <p className="prediction-value" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                {formatNumber(pred.predictedFollowers)}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Confidence</span>
                <span style={{ fontSize: 10, color: confidenceColors[confidenceLevel], fontWeight: 600 }}>
                  {Math.round(pred.confidence * 100)}%
                </span>
              </div>
              <div className="confidence-bar" style={{ height: 6 }}>
                <motion.div
                  className="confidence-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pred.confidence * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + 0.1 * i }}
                  style={{ background: confidenceColors[confidenceLevel], height: '100%' }}
                />
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: 12,
                  color: trend.color,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: `${trend.color}15`,
                }}>
                  {trend.icon} {pred.period}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                  {pred.trendDirection}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}