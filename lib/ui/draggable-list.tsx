'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { GripVertical, TrendingUp, TrendingDown } from 'lucide-react';

interface DraggableItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  color?: string;
  icon?: React.ReactNode;
}

interface DraggableListProps {
  items: DraggableItem[];
  onReorder?: (items: DraggableItem[]) => void;
  onItemClick?: (item: DraggableItem) => void;
}

interface DraggableRowProps {
  item: DraggableItem;
  onClick?: () => void;
}

const DraggableRow = memo(function DraggableRow({ item, onClick }: DraggableRowProps) {
  const dragControls = useDragControls();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 12,
        cursor: onClick ? 'pointer' : 'default',
        touchAction: 'none',
      }}
      onClick={onClick}
    >
      <div
        style={{
          cursor: 'grab',
          color: 'var(--text-dim)',
          display: 'flex',
          alignItems: 'center',
        }}
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical size={16} />
      </div>

      {item.color && (
        <div
          style={{
            width: 4,
            height: 32,
            borderRadius: 2,
            background: item.color,
          }}
        />
      )}

      {item.icon && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          {item.icon}
        </div>
      )}

      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {item.title}
        </p>
        {item.subtitle && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-dim)',
              margin: 0,
            }}
          >
            {item.subtitle}
          </p>
        )}
      </div>

      {item.value && (
        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {item.value}
          </p>
          {item.change && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              {item.changeType === 'up' && (
                <TrendingUp size={10} style={{ color: 'var(--accent-emerald)' }} />
              )}
              {item.changeType === 'down' && (
                <TrendingDown size={10} style={{ color: 'var(--accent-rose)' }} />
              )}
              <span
                style={{
                  fontSize: 11,
                  color:
                    item.changeType === 'up'
                      ? 'var(--accent-emerald)'
                      : item.changeType === 'down'
                      ? 'var(--accent-rose)'
                      : 'var(--text-dim)',
                  fontWeight: 500,
                }}
              >
                {item.change}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
});

export const DraggableList = memo(function DraggableList({
  items: initialItems,
  onReorder,
  onItemClick,
}: DraggableListProps) {
  const [items, setItems] = useState(initialItems);

  const handleReorder = useCallback(
    (newOrder: DraggableItem[]) => {
      setItems(newOrder);
      onReorder?.(newOrder);
    },
    [onReorder]
  );

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={handleReorder}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 0,
        margin: 0,
        listStyle: 'none',
      }}
    >
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          style={{ listStyle: 'none' }}
        >
          <DraggableRow
            item={item}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
});

export default DraggableList;
