'use client';

import React, { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VirtualRow<T> {
  item: T;
  index: number;
}

interface VirtualTableProps<T> {
  data: T[];
  rowHeight?: number;
  overscan?: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  getRowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  emptyMessage?: string;
  className?: string;
}

export function VirtualTable<T>({
  data,
  rowHeight = 56,
  overscan = 3,
  renderRow,
  renderHeader,
  getRowKey,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  emptyMessage = 'No data available',
  className = '',
}: VirtualTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { startIndex, endIndex, virtualRows } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / rowHeight);
    const end = Math.min(data.length, start + visibleCount + overscan * 2);

    const virtualRows: VirtualRow<T>[] = [];
    for (let i = start; i < end; i++) {
      virtualRows.push({ item: data[i], index: i });
    }

    return { startIndex: start, endIndex: end, virtualRows };
  }, [scrollTop, containerHeight, rowHeight, overscan, data]);

  const totalHeight = data.length * rowHeight;
  const offsetY = startIndex * rowHeight;

  if (data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
          color: 'var(--text-dim)',
          fontSize: 14,
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: '100%',
        overflow: 'auto',
        position: 'relative',
      }}
      className={className}
    >
      {renderHeader && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          {renderHeader()}
        </div>
      )}

      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          <AnimatePresence mode="popLayout">
            {virtualRows.map(({ item, index }) => (
              <motion.div
                key={getRowKey(item)}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => onRowClick?.(item)}
                style={{
                  height: rowHeight,
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                {renderRow(item, index)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface SortableHeaderProps {
  column: string;
  label: string;
  currentSort?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  align?: 'left' | 'right' | 'center';
}

export const SortableHeader = memo(function SortableHeader({
  column,
  label,
  currentSort,
  sortDirection,
  onSort,
  align = 'left',
}: SortableHeaderProps) {
  const isActive = currentSort === column;

  return (
    <th
      onClick={() => onSort?.(column)}
      style={{
        padding: '12px 16px',
        textAlign: align,
        cursor: onSort ? 'pointer' : 'default',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: isActive ? 'var(--gold-primary)' : 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        {isActive && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              fontSize: 10,
              color: 'var(--gold-primary)',
            }}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </motion.span>
        )}
      </div>
    </th>
  );
});

export default VirtualTable;
