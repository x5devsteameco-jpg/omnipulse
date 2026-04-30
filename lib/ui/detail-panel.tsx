'use client';

import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  width?: number;
}

export const DetailPanel = memo(function DetailPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actions,
  width = 420,
}: DetailPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 150,
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width,
              maxWidth: '90vw',
              background: '#0a0a12',
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
              zIndex: 151,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fafafa', margin: 0 }}>{title}</h2>
                {subtitle && <p style={{ fontSize: 12, color: '#71717a', margin: '4px 0 0' }}>{subtitle}</p>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {actions}
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: 'none',
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#71717a',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const InlineEdit = memo(function InlineEdit({
  value,
  onSave,
  children,
  className = '',
  style = {},
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = useCallback(() => {
    setEditValue(value);
    setIsEditing(true);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const save = useCallback(() => {
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, value, onSave]);

  const cancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: '#fafafa',
          outline: 'none',
          width: '100%',
          ...style,
        }}
      />
    );
  }

  return (
    <span
      onDoubleClick={startEditing}
      className={className}
      style={{
        cursor: 'text',
        borderBottom: '1px dashed rgba(255, 255, 255, 0.15)',
        ...style,
      }}
      title="Double-click to edit"
    >
      {children || value}
    </span>
  );
});

interface CopyButtonProps {
  value: string;
  className?: string;
}

export const CopyButton = memo(function CopyButton({ value, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  }, [value]);

  return (
    <button
      onClick={handleCopy}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 11,
        color: copied ? '#22c55e' : '#71717a',
        padding: '2px 6px',
        borderRadius: 4,
        opacity: 0,
        transition: 'opacity 0.2s, color 0.2s',
      }}
      title="Copy to clipboard"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
});

export default DetailPanel;
