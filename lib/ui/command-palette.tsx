'use client';

import React, { memo, useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, ArrowRight, Settings, LayoutDashboard, BarChart3, Webhook, Users, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const CommandPalette = memo(function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'overview',
      label: 'Go to Overview',
      description: 'View dashboard summary and key metrics',
      icon: <LayoutDashboard size={16} />,
      action: () => { onNavigate('overview'); onClose(); },
      category: 'Navigation',
      keywords: ['home', 'dashboard', 'summary'],
    },
    {
      id: 'campaigns',
      label: 'Go to Campaigns',
      description: 'Track campaign ROI and performance',
      icon: <BarChart3 size={16} />,
      action: () => { onNavigate('campaigns'); onClose(); },
      category: 'Navigation',
      keywords: ['campaign', 'roi', 'ads', 'marketing'],
    },
    {
      id: 'kpis',
      label: 'Go to KPIs',
      description: 'Monitor key performance indicators',
      icon: <BarChart3 size={16} />,
      action: () => { onNavigate('kpis'); onClose(); },
      category: 'Navigation',
      keywords: ['kpi', 'metrics', 'performance'],
    },
    {
      id: 'gaps',
      label: 'Go to Gaps',
      description: 'Identify content and audience gaps',
      icon: <AlertTriangle size={16} />,
      action: () => { onNavigate('gaps'); onClose(); },
      category: 'Navigation',
      keywords: ['gap', 'analysis', 'opportunity'],
    },
    {
      id: 'accounts',
      label: 'Go to Accounts',
      description: 'Manage connected social accounts',
      icon: <Users size={16} />,
      action: () => { onNavigate('accounts'); onClose(); },
      category: 'Navigation',
      keywords: ['account', 'social', 'platform'],
    },
    {
      id: 'webhooks',
      label: 'Go to Webhooks',
      description: 'Configure webhook endpoints',
      icon: <Webhook size={16} />,
      action: () => { onNavigate('webhooks'); onClose(); },
      category: 'Navigation',
      keywords: ['webhook', 'integration', 'event'],
    },
    {
      id: 'audit',
      label: 'Go to Audit',
      description: 'View audit logs and activity',
      icon: <FileText size={16} />,
      action: () => { onNavigate('audit'); onClose(); },
      category: 'Navigation',
      keywords: ['audit', 'log', 'history'],
    },
    {
      id: 'settings',
      label: 'Go to Settings',
      description: 'Configure tenant settings',
      icon: <Settings size={16} />,
      action: () => { onNavigate('settings'); onClose(); },
      category: 'Navigation',
      keywords: ['settings', 'config', 'preferences'],
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some((k) => k.includes(searchLower))
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filteredCommands[selectedIndex]?.action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '15vh',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 560,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <Search size={18} style={{ color: 'var(--text-dim)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-md)',
                fontFamily: 'inherit',
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                background: 'var(--bg-surface)',
                borderRadius: 6,
                fontSize: 'var(--text-xs)',
                color: 'var(--text-dim)',
              }}
            >
              <Command size={12} />
              <span>K</span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                color: 'var(--text-dim)',
                display: 'flex',
                borderRadius: 6,
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
            {Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div
                  style={{
                    padding: '8px 20px',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  {category}
                </div>
                {items.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const isSelected = globalIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 20px',
                        background: isSelected ? 'var(--bg-hover)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? 'var(--gold-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        {cmd.icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 'var(--text-md)',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                          }}
                        >
                          {cmd.label}
                        </div>
                        {cmd.description && (
                          <div
                            style={{
                              fontSize: 'var(--text-sm)',
                              color: 'var(--text-dim)',
                              marginTop: 2,
                            }}
                          >
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <ChevronRight size={16} style={{ color: 'var(--text-dim)' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div
                style={{
                  padding: 32,
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontSize: 'var(--text-md)',
                }}
              >
                No commands found
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 16,
              padding: '12px 20px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
              <span style={{ padding: '2px 6px', background: 'var(--bg-hover)', borderRadius: 4 }}>↑</span>
              <span style={{ padding: '2px 6px', background: 'var(--bg-hover)', borderRadius: 4 }}>↓</span>
              <span>navigate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
              <span style={{ padding: '2px 6px', background: 'var(--bg-hover)', borderRadius: 4 }}>↵</span>
              <span>select</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
              <span style={{ padding: '2px 6px', background: 'var(--bg-hover)', borderRadius: 4 }}>esc</span>
              <span>close</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default CommandPalette;
