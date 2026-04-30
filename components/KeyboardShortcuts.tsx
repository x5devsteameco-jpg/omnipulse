'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Open command palette' },
  { keys: ['⌘', 'B'], label: 'Toggle sidebar' },
  { keys: ['⌘', 'T'], label: 'Toggle theme panel' },
  { keys: ['⌘', '/'], label: 'Show keyboard shortcuts' },
  { keys: ['Esc'], label: 'Close modal / Go back' },
  { keys: ['G', 'O'], label: 'Go to Overview' },
  { keys: ['G', 'C'], label: 'Go to Campaigns' },
  { keys: ['G', 'K'], label: 'Go to KPIs' },
  { keys: ['G', 'G'], label: 'Go to Gaps' },
  { keys: ['G', 'A'], label: 'Go to Accounts' },
  { keys: ['G', 'W'], label: 'Go to Webhooks' },
  { keys: ['G', 'U'], label: 'Go to Audit' },
  { keys: ['G', 'S'], label: 'Go to Settings' },
  { keys: ['?'], label: 'Show this help' },
];

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = SHORTCUTS.filter((s) =>
    s.label.toLowerCase().includes(search.toLowerCase()) ||
    s.keys.join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '80vh',
              background: '#12121c',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', margin: 0 }}>
                Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#71717a',
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search shortcuts..."
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 8,
                    color: '#fafafa',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Shortcuts list */}
            <div style={{ padding: '12px 20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {filtered.map((shortcut, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#a1a1aa' }}>{shortcut.label}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {shortcut.keys.map((key, j) => (
                        <kbd
                          key={j}
                          style={{
                            padding: '3px 7px',
                            borderRadius: 6,
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: '#fafafa',
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <p style={{ textAlign: 'center', color: '#71717a', fontSize: 13, padding: '24px 0' }}>
                  No shortcuts found for &quot;{search}&quot;
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
