# Omnipulse — Visual Audit & Remediation Report
**Date:** April 30, 2026 | **Auditor:** Kilo | **Reference:** Linear.app benchmark

---

## Audit Findings — 12 Critical Gaps

| # | Gap | Severity | Linear Reference | Fix Required |
|---|-----|----------|------------------|---------------|
| 1 | **No login portal** — Dashboard loads directly without auth | CRITICAL | Linear requires `/login` before app access | Add login page + protected routes |
| 2 | **Hardcoded fake data throughout** — Sabrina Carpenter brand, follower counts, campaign metrics all fabricated | CRITICAL | Linear has real user/org data from connected accounts | DataProvider integration (APIs wired, data is null until real tokens) |
| 3 | **No real imagery** — Brand hero shows "SC" initials in gradient box, no actual photos | CRITICAL | Linear uses real customer avatars, product screenshots, UI mockups | Replace gradient box with real brand image or professional placeholder |
| 4 | **Zero onboarding flow** — OnboardingWizard exists but doesn't guide real setup | HIGH | Linear has `/intake`, multi-step setup, Slack/email connect | Wire OnboardingWizard properly: connect platforms → authorize → configure → go live |
| 5 | **No real-time activity feed** — "System Healthy" indicator is static, no live pulse | HIGH | Linear Pulse shows live issue activity, agent actions, member updates | Wire LiveIndicator to real API data, show recent activity stream |
| 6 | **No changelog** — Zero content marketing, no release notes page | HIGH | Linear has `/changelog` with dated entries, version history | Add `/changelog` page with feature releases |
| 7 | **Sidebar collapses but reveals nothing special** — Collapse animation exists but content is plain | MEDIUM | Linear sidebar shows issue counts, cycles, quick actions | Enhance sidebar with real nav counts, quick-create buttons, workspace switcher |
| 8 | **No keyboard shortcut help overlay** — Cmd+K command palette exists but no visible shortcuts guide | MEDIUM | Linear shows `?` keyboard shortcut overlay | Add keyboard shortcut modal (press `?`) |
| 9 | **Brand logo treatment is bare** — Logo shows "O" in gradient circle, no proper SVG logo | MEDIUM | Linear has full logo + wordmark SVG | Add proper Omnipulse SVG logo |
| 10 | **Campaign table uses static fake data** — CAMPAIGNS array hardcoded in page.tsx | HIGH | Linear shows real issue/project data from connected tools | Move campaigns to API route, show loading skeletons |
| 11 | **No mobile polish** — `hide-desktop`/`hide-mobile` classes exist but mobile layout is rough | MEDIUM | Linear has polished mobile nav, responsive tables | Audit mobile tab bar, card stacking, touch targets |
| 12 | **No empty states for real sections** — Gaps/Accounts show hardcoded items, not real data | HIGH | Linear shows contextual empty states when no data connected | Wire SmartEmptyState to each section, show connect-first messaging |

---

## Immediate Actions

### Fix 1: Add Login Portal
```
app/login/page.tsx — New file
- Email/password form (mock auth)
- "Continue with Google" placeholder button
- Redirect to / on success
- Protected route: if no session, redirect to /login
```

### Fix 2: Real Imagery
```
- Replace "SC" gradient box with brand image
- Use Unsplash professional headshot or brand asset
- Fallback: use PlatformIcon for platform logos
```

### Fix 3: Remove Hardcoded Fake Data
```
- DataProvider returns null/empty arrays until real APIs connected
- Show "Connect your accounts" CTA instead of fake metrics
- Each tab: if data null, show SmartEmptyState
```

### Fix 4: Wire OnboardingWizard Properly
```
- Step 1: Connect first platform (auth flow)
- Step 2: Configure account settings
- Step 3: Set alert thresholds
- Step 4: Invite team members
- Step 5: Launch
```

### Fix 5: Real-time Activity Feed
```
- API route: /api/activity/recent
- Returns last 20 actions (logins, data syncs, alerts, exports)
- LiveIndicator pulses when new activity
- Scrollable activity stream in sidebar
```

### Fix 6: Add Changelog Page
```
app/changelog/page.tsx — New file
- Timeline of feature releases
- Dated entries (use today's date v2.1.0)
- Categories: Features, Fixes, UI, Performance
```

### Fix 7: Enhance Sidebar
```
- Show issue/project counts per nav item
- Quick-create button (+ icon)
- Workspace switcher dropdown
- Active indicator with counts
```

### Fix 8: Keyboard Shortcut Modal
```
- Press "?" anywhere to open
- Shows all shortcuts: Cmd+K, Cmd+B, Esc, G+O, G+C, etc.
- Framer-motion scale-in modal
```

### Fix 9: Proper Logo SVG
```
- Create public/logo.svg with Omnipulse wordmark
- Replace gradient "O" with <Image src="/logo.svg" />
```

### Fix 10: Campaign Data from API
```
- Remove CAMPAIGNS array from page.tsx
- Use useData().state.campaigns
- Fetch from /api/campaigns/by-brand/[tenantId]
- Show SkeletonTable while loading
```

### Fix 11: Mobile Polish Pass
```
- Audit all hide-desktop/hide-mobile breakpoints
- Test on 375px viewport
- Ensure touch targets ≥44px
- Tab bar: fixed bottom on mobile
```

### Fix 12: Wire SmartEmptyState
```
- Overview: "Connect your social accounts to see metrics"
- Campaigns: "Launch your first campaign"
- KPIs: "Connect accounts to track KPIs"
- Gaps: "All systems nominal"
- Accounts: "Connect your first platform"
- Webhooks: "Set up webhooks for real-time alerts"
- Audit: "Activity will appear here"
```

---

## Not Done in This Pass (Future)
- Real login persistence (NextAuth.js)
- Real OAuth flows for Instagram/TikTok/Twitter
- Real data sync from social platform APIs
- Email notifications / webhook delivery
- Multi-tenant user management
