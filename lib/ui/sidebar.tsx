'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Target,
  AlertTriangle,
  Users,
  Webhook,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: BarChart3 },
  { id: 'kpis', label: 'KPIs', icon: Target },
  { id: 'gaps', label: 'Gaps', icon: AlertTriangle },
  { id: 'accounts', label: 'Accounts', icon: Users },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'audit', label: 'Audit', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const NavItemComponent = memo(function NavItemComponent({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: isCollapsed ? '12px' : '10px 16px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 500,
        background: isActive ? 'var(--gold-primary)' + '20' : 'transparent',
        color: isActive ? 'var(--gold-primary)' : 'var(--text-secondary)',
        transition: 'all 0.2s ease',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--bg-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {item.badge && !isCollapsed && (
        <span
          style={{
            marginLeft: 'auto',
            padding: '2px 8px',
            borderRadius: 10,
            background: 'var(--accent-rose)',
            color: 'white',
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          {item.badge}
        </span>
      )}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 20,
            borderRadius: 2,
            background: 'var(--gold-primary)',
          }}
        />
      )}
    </button>
  );
});

export const Sidebar = memo(function Sidebar({
  activeTab,
  onTabChange,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const handleTabChange = useCallback(
    (tabId: string) => {
      onTabChange(tabId);
    },
    [onTabChange]
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: 'calc(100vh - 73px)',
        position: 'sticky',
        top: 73,
        background: 'var(--bg-deep)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      <nav
        style={{
          flex: 1,
          padding: collapsed ? '16px 12px' : '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItemComponent
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            isCollapsed={collapsed}
            onClick={() => handleTabChange(item.id)}
          />
        ))}
      </nav>

      <div
        style={{
          padding: collapsed ? '12px' : '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
        }}
      >
        <button
          onClick={onToggleCollapse}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: collapsed ? 40 : 32,
            height: 32,
            borderRadius: 8,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--gold-primary)';
            e.currentTarget.style.color = 'var(--gold-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-dim)';
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div
        style={{
          padding: collapsed ? '12px' : '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: collapsed ? '8px' : '8px 12px',
            borderRadius: 8,
            background: 'var(--bg-surface)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Activity size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
          {!collapsed && (
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              System Healthy
            </span>
          )}
        </div>
      </div>
    </motion.aside>
  );
});

export default Sidebar;
