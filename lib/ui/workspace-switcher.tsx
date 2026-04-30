'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Building2 } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  tier: 'starter' | 'pro' | 'enterprise';
  isActive: boolean;
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspaceId: string;
  onSwitch: (workspaceId: string) => void;
}

const TIER_LABELS = {
  starter: { label: 'Starter', color: '#71717a' },
  pro: { label: 'Pro', color: '#3b82f6' },
  enterprise: { label: 'Enterprise', color: '#d4af37' },
};

export const WorkspaceSwitcher = memo(function WorkspaceSwitcher({
  workspaces,
  currentWorkspaceId,
  onSwitch,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 8,
          background: isOpen ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          color: '#fafafa',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: 'linear-gradient(135deg, #d4af37, #22c55e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Building2 size={12} style={{ color: '#000' }} />
        </div>
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current?.name || 'Omnipulse'}
        </span>
        <ChevronDown size={14} style={{ color: '#71717a', transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              minWidth: 220,
              background: '#12121c',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              padding: 6,
              zIndex: 200,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ padding: '4px 8px 8px', fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Workspaces
            </div>
            {workspaces.map((ws) => {
              const tier = TIER_LABELS[ws.tier];
              return (
                <button
                  key={ws.id}
                  onClick={() => { onSwitch(ws.id); setIsOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: ws.id === currentWorkspaceId ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: 'linear-gradient(135deg, #d4af37, #22c55e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Building2 size={12} style={{ color: '#000' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: '#fafafa', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ws.name}
                    </p>
                    <p style={{ fontSize: 10, color: tier.color, margin: 0 }}>
                      {tier.label}
                    </p>
                  </div>
                  {ws.id === currentWorkspaceId && (
                    <Check size={14} style={{ color: '#d4af37', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default WorkspaceSwitcher;
