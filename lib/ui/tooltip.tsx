'use client';

import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const variantStyles = {
  default: {
    background: 'var(--bg-card)',
    border: 'var(--border-default)',
    text: 'var(--text-primary)',
  },
  success: {
    background: 'var(--accent-emerald-glow)',
    border: 'var(--accent-emerald)',
    text: '#10b981',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.15)',
    border: 'var(--accent-amber)',
    text: '#f59e0b',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: 'var(--accent-rose)',
    text: '#f43f5e',
  },
  info: {
    background: 'rgba(59, 130, 246, 0.15)',
    border: 'var(--accent-blue)',
    text: '#3b82f6',
  },
};

export const Tooltip = memo(function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  variant = 'default',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let x = 0;
        let y = 0;

        switch (placement) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom;
            break;
          case 'left':
            x = rect.left;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right;
            y = rect.top + rect.height / 2;
            break;
        }

        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  }, [delay, placement]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const variantStyle = variantStyles[variant];

  const getTransform = () => {
    switch (placement) {
      case 'top':
        return 'translateX(-50%) translateY(-100%)';
      case 'bottom':
        return 'translateX(-50%)';
      case 'left':
        return 'translateX(-100%) translateY(-50%)';
      case 'right':
        return 'translateY(-50%)';
      default:
        return 'translateX(-50%)';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: coords.x,
              top: coords.y,
              transform: getTransform(),
              zIndex: 10000,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: variantStyle.background,
                border: `1px solid ${variantStyle.border}`,
                borderRadius: 8,
                padding: '8px 12px',
                maxWidth: 280,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: variantStyle.text,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

interface TooltipProviderProps {
  children: React.ReactNode;
}

export const TooltipProvider = memo(function TooltipProvider({
  children,
}: TooltipProviderProps) {
  return <div>{children}</div>;
});

export default Tooltip;
