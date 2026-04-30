'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  FileJson,
  Table,
  X,
  Check,
  Loader2,
  ChevronDown,
} from 'lucide-react';

type ExportFormat = 'csv' | 'json' | 'xlsx';

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  fileSize?: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    format: 'csv',
    label: 'CSV',
    description: 'Comma-separated values for Excel, Google Sheets',
    icon: <Table size={20} />,
    fileSize: '~150 KB',
  },
  {
    format: 'json',
    label: 'JSON',
    description: 'Structured data for programmatic access',
    icon: <FileJson size={20} />,
    fileSize: '~280 KB',
  },
  {
    format: 'xlsx',
    label: 'Excel',
    description: 'Native Excel format with formatting preserved',
    icon: <FileText size={20} />,
    fileSize: '~320 KB',
  },
];

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, dataType: string) => void;
  dataTypes?: Array<{ id: string; label: string }>;
  defaultDataType?: string;
}

export const ExportModal = memo(function ExportModal({
  isOpen,
  onClose,
  onExport,
  dataTypes = [
    { id: 'analytics', label: 'Analytics Overview' },
    { id: 'campaigns', label: 'Campaign Performance' },
    { id: 'metrics', label: 'Metrics History' },
    { id: 'audit', label: 'Audit Logs' },
  ],
  defaultDataType = 'analytics',
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [selectedDataType, setSelectedDataType] = useState(defaultDataType);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    onExport(selectedFormat, selectedDataType);

    setIsExporting(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  }, [selectedFormat, selectedDataType, onExport, onClose]);

  const selectedOption = EXPORT_OPTIONS.find((o) => o.format === selectedFormat);
  const selectedTypeLabel = dataTypes.find((d) => d.id === selectedDataType)?.label;

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
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 480,
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
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'var(--gold-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                }}
              >
                <Download size={20} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  Export Data
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    margin: 0,
                  }}
                >
                  Download your data in multiple formats
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                border: 'none',
                background: 'var(--bg-surface)',
                color: 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Data Type
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{selectedTypeLabel}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: 4,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        zIndex: 10,
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {dataTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSelectedDataType(type.id);
                            setShowDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background:
                              selectedDataType === type.id
                                ? 'var(--gold-primary)20'
                                : 'transparent',
                            border: 'none',
                            color:
                              selectedDataType === type.id
                                ? 'var(--gold-primary)'
                                : 'var(--text-primary)',
                            fontSize: 14,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          {selectedDataType === type.id && (
                            <Check
                              size={14}
                              style={{ marginRight: 8 }}
                            />
                          )}
                          {type.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Export Format
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {EXPORT_OPTIONS.map((option) => (
                  <button
                    key={option.format}
                    onClick={() => setSelectedFormat(option.format)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      padding: '16px 12px',
                      background:
                        selectedFormat === option.format
                          ? option.format === 'csv'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : option.format === 'json'
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)'
                          : 'var(--bg-surface)',
                      border: `2px solid ${
                        selectedFormat === option.format
                          ? option.format === 'csv'
                            ? '#22c55e'
                            : option.format === 'json'
                            ? '#3b82f6'
                            : '#f59e0b'
                          : 'var(--border-default)'
                      }`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)' }}>
                      {option.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {option.label}
                    </span>
                    {option.fileSize && (
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--text-dim)',
                        }}
                      >
                        {option.fileSize}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: 'var(--bg-surface)',
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  {selectedOption.description}
                </p>
              </motion.div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              padding: '20px 24px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
          >
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 10,
                border: '1px solid var(--border-default)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || showSuccess}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: showSuccess ? '#22c55e' : 'var(--gold-primary)',
                color: '#000',
                fontSize: 14,
                fontWeight: 600,
                cursor: isExporting || showSuccess ? 'default' : 'pointer',
              }}
            >
              {isExporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Exporting...
                </>
              ) : showSuccess ? (
                <>
                  <Check size={16} />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export {selectedOption?.label}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default ExportModal;
