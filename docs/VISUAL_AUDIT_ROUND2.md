# Omnipulse Visual Enhancement — Audit Round 2
**Date:** April 30, 2026 | **Reference Sites:** Stripe Dashboard, Vercel Dashboard, Notion, Superlist, Linear

---

## Audit Round 2 — 12 More Gaps

### Visual Polish Gaps (from reference research)

| # | Gap | Severity | Reference | Fix |
|---|-----|----------|-----------|-----|
| 13 | **No announcements/banner** — No top banner for new features, maintenance, or status | HIGH | Vercel has status banners, Notion has "New" badges | Add `<AnnouncementBanner>` — dismissible, shows "v2.2 Now Live" |
| 14 | **No workspace switcher** — No dropdown to switch between tenants/accounts | HIGH | Linear has workspace selector top-left | Add `<WorkspaceSwitcher>` dropdown with tenant list |
| 15 | **No command bar / quick actions** — Cmd+K exists but shows only search, not inline actions | MEDIUM | Linear Cmd+K shows commands, Notion has `/` slash commands | Enhance CommandPalette with action commands (Create Campaign, Export, etc.) |
| 16 | **No right-side panel / detail view** — Clicking an item should show detail slide-in panel | HIGH | Linear right-panel for issue details, Notion side panel | Add `<DetailPanel>` that slides in from right on item click |
| 17 | **No inline editing** — Metrics and labels are display-only, not editable | MEDIUM | Notion everywhere inline-edit, Linear double-click to edit | Make KPI values, campaign names, gap titles editable inline |
| 18 | **No drag-to-reorder on sidebar nav** — Nav items are fixed order | LOW | Superlist drag-to-reorder lists | Allow sidebar nav item reordering via drag handle |
| 19 | **No "what's new" popover** — No small popover showing recent changes | MEDIUM | Linear has "Updated 2h ago" badge on features | Add `<WhatsNewPopover>` triggered from nav icon |
| 20 | **No table density toggle** — Table shows default density, no compact/comfortable/spacious | MEDIUM | Linear has density toggle in tables | Add `<DensityToggle>` to VirtualTable headers |
| 21 | **No sticky headers in tables** — Table headers scroll away | MEDIUM | Most data tables have sticky headers | Make VirtualTable headers `position: sticky` |
| 22 | **No column resize on tables** — Column widths are fixed | MEDIUM | Linear tables have draggable column widths | Add resize handles to SortableHeader |
| 23 | **No pinned columns on tables** — No ability to pin first column (name) | LOW | Excel-like pinned first column | Add `pinned` prop to VirtualTable columns |
| 24 | **No CSV/JSON quick download buttons** — Export requires modal flow | MEDIUM | Stripe has direct download buttons per table | Add download icons per table column header |

### Functional Gaps (from reference research)

| # | Gap | Severity | Reference | Fix |
|---|-----|----------|-----------|-----|
| 25 | **No @mentions in inputs** — Can't @mention a user in notes/comments | LOW | Linear, Notion support @mentions | Add @mention autocomplete in textarea fields |
| 26 | **No date shortcuts** — Date picker doesn't have "Today", "Yesterday", "Last 7 days" | MEDIUM | Linear date shortcuts | Add preset buttons to date pickers |
| 27 | **No copy-to-clipboard on all fields** — Metric values should be copyable | MEDIUM | Vercel dashboard has copy icons on values | Add copy icon on hover for metric values, IDs, URLs |
| 28 | **No "share" or "link copy"** — No way to share a deep link to a specific campaign | LOW | Linear share button copies link | Add share button to each section that generates a URL |

---

## Immediate Priority Fixes

### Fix #13: Announcement Banner
```tsx
// Top banner that shows "What's new" or status
// Dismissible, stores dismissed state in localStorage
// Shows on every page until dismissed
// Variants: 'info' (blue), 'success' (green), 'warning' (amber), 'new-feature' (gold)
```

### Fix #14: Workspace Switcher
```tsx
// Dropdown in header, left side
// Shows tenant name + tier badge
// For multi-account: lists all connected accounts
// Click to switch — reloads dashboard with selected tenant context
// Uses tenantRegistry.getAll() to populate list
```

### Fix #16: Detail Panel
```tsx
// Slides in from right on item click
// 400px wide, fixed overlay on mobile
// Header: item name + close button
// Body: full item details, editable fields
// Footer: action buttons (Edit, Delete, Archive)
// Used for: Campaign details, Account details, Gap full info, Webhook config
```

### Fix #17: Inline Editing
```tsx
// Double-click on editable text → transforms to input
// Enter to save, Esc to cancel
// Used for: KPI names, campaign names, gap titles, webhook labels
// Visual: text → input with same styling, subtle border appears
```

### Fix #20: Sticky Table Headers
```tsx
// VirtualTable header row: position: sticky; top: 0
// Z-index above scrollable body content
// Background matches card background (blur)
```

### Fix #22: Column Resize
```tsx
// Add resize handle (6px wide strip on right edge of each header cell)
// Drag to resize, updates column widths in localStorage
// Min width: 80px per column
// Shows resize cursor on hover
```

### Fix #27: Copy-to-Clipboard
```tsx
// On hover over metric values, IDs, API keys: show copy icon
// Click → copies to clipboard → shows brief "Copied!" tooltip
// Use navigator.clipboard.writeText()
```

---

## Next Pass Priorities

1. **Command Palette v2** — Add action commands (Create Campaign, Export, Invite User, etc.)
2. **@Mentions** — Autocomplete for user/brand names in textarea fields
3. **Date Presets** — Quick buttons for common date ranges
4. **Share Links** — Deep link generation for each section
5. **Density Toggle** — Compact / Default / Spacious table view modes
