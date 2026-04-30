'use client';

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';

interface AnnouncementBannerProps {
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'new-feature';
  actionLabel?: string;
  onAction?: () => void;
  storageKey?: string;
}

const VARIANT_STYLES = {
  info: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    text: '#93c5fd',
    icon: null,
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#6ee7b7',
    icon: null,
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#fcd34d',
    icon: null,
  },
  'new-feature': {
    bg: 'rgba(212, 175, 55, 0.1)',
    border: 'rgba(212, 175, 55, 0.3)',
    text: '#f5d76e',
    icon: Zap,
  },
};

export const AnnouncementBanner = memo(function AnnouncementBanner({
  message,
  variant = 'new-feature',
  actionLabel,
  onAction,
  storageKey = 'omnipulse-banner-dismissed',
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageKey);
      setIsVisible(!dismissed);
    } catch {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // ignore
    }
  };

  const style = VARIANT_STYLES[variant];
  const Icon = style.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            overflow: 'hidden',
            background: style.bg,
            borderBottom: '1px solid ' + style.border,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '8px 24px',
            }}
          >
            {Icon && <Icon size={14} style={{ color: style.text }} />}
            <span style={{ fontSize: 13, color: style.text, fontWeight: 500 }}>
              {message}
            </span>
            {actionLabel && (
              <button
                onClick={onAction}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  background: style.text,
                  color: '#030307',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {actionLabel}
              </button>
            )}
            <button
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: style.text,
                opacity: 0.6,
                padding: 2,
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default AnnouncementBanner;
