'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'milestone';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

interface MicrocopyEngine {
  detectContext?: (data: any) => string;
  generateMessage?: (context: string, data: any) => string;
}

const DEFAULT_MICROCOPY: Record<string, string> = {
  spike_positive: 'Trend spike detected — metrics going up!',
  spike_negative: 'Trend shift detected — review needed.',
  milestone_reached: 'Milestone reached!',
  crisis_warning: 'Alert: threshold breached.',
  recovery_detected: 'Recovery detected — metrics normalizing.',
  anomaly_detected: 'Anomaly detected in data stream.',
};

export function generateSmartMessage(context: string): string {
  return DEFAULT_MICROCOPY[context] || 'Update from Omnipulse.';
}

interface ContextualGreetingProps {
  name?: string;
  time?: Date;
  className?: string;
}

export function ContextualGreeting({ name = 'there', time = new Date(), className = '' }: ContextualGreetingProps) {
  const hour = time.getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';

  return (
    <span className={className}>
      {greeting}, {name}
    </span>
  );
}

interface SmartEmptyStateProps {
  dataType: string;
  className?: string;
}

const EMPTY_STATE_MESSAGES: Record<string, { title: string; description: string }> = {
  campaigns: { title: 'No campaigns yet', description: 'Launch your first campaign to start tracking ROI' },
  webhooks: { title: 'No webhooks configured', description: 'Set up webhooks to receive real-time alerts' },
  gaps: { title: 'No gaps detected', description: 'All systems nominal — lucky you!' },
  accounts: { title: 'No accounts connected', description: 'Connect your social accounts to unlock analytics' },
  audit_logs: { title: 'No audit logs', description: 'Activity will appear here as events occur' },
};

export function SmartEmptyState({ dataType, className = '' }: SmartEmptyStateProps) {
  const message = EMPTY_STATE_MESSAGES[dataType] || { title: 'No data', description: 'Data will appear here once available' };

  return (
    <div className={className} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48,
      gap: 16,
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'var(--bg-surface)',
        border: '1px dashed var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth={1.5}>
          <circle cx={12} cy={12} r={10} />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>{message.title}</p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>{message.description}</p>
      </div>
    </div>
  );
}

export default ToastProvider;
