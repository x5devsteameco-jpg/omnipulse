'use client';

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

interface BentoItem {
  id: string;
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  color?: string;
  span?: 'col-1' | 'col-2' | 'col-3' | 'row-2';
  icon?: React.ReactNode;
}

interface BentoGridProps {
  items: BentoItem[];
  columns?: number;
}

const BentoCard = memo(function BentoCard({
  item,
  index,
}: {
  item: BentoItem;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const spanClass = item.span || 'col-1';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`bento-item ${spanClass}`}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 16,
        border: '1px solid var(--border-default)',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {item.color && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 3,
            background: item.color,
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {item.title}
          </span>
          {item.icon && (
            <span style={{ color: 'var(--text-tertiary)' }}>{item.icon}</span>
          )}
        </div>

        <div>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 8px',
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
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color:
                    item.changeType === 'up'
                      ? 'var(--accent-emerald)'
                      : item.changeType === 'down'
                      ? 'var(--accent-rose)'
                      : 'var(--text-tertiary)',
                }}
              >
                {item.change}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export const BentoGrid = memo(function BentoGrid({
  items,
  columns = 3,
}: BentoGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 16,
      }}
    >
      {items.map((item, index) => (
        <BentoCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
});

export default BentoGrid;
