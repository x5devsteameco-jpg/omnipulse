# AEG Scraper — Agent Directive

> Agent: Kairos Vale — X5 Constellation
> Project: AEG (Autonomous Exposure Guardian) Social Media Analytics Platform
> Live: https://aeg-scraper.vercel.app

## Project Overview

AEG is a standalone Next.js 15 + React 19 application deployed on Vercel. It provides multi-platform social media analytics, trending analysis, marketing gap identification, and predictive analytics.

**Project Root:** `/home/x5con1/aeg-scraper`

## Critical Files

| File | Purpose | When to Update |
|------|---------|----------------|
| `docs/BUILD_SUMMARY.md` | **SINGLE SOURCE OF TRUTH** for AEG architecture | AFTER EVERY CHANGE |
| `docs/MULTI_TENANT_ARCHITECTURE.md` | OmniPulse 5-pillar architecture spec | When modifying tenant isolation |
| `docs/TECHNICAL_ROADMAP.md` | Tech stack, DB schema, UI wireframes, scaling strategy | When updating roadmap |
| `lib/scraper.ts` | SocialMediaScraper class with all platform integrations | When adding platforms |
| `lib/db.ts` | JSON file-based data layer | When modifying data schema |
| `lib/types.ts` | TypeScript interfaces | When adding data models |
| `app/api/*/route.ts` | API route handlers | When modifying endpoints |

## Build Summary Update Protocol

**MANDATORY:** After ANY code change to the AEG project, update `docs/BUILD_SUMMARY.md`:

1. **Version bump** — Increment patch version (e.g., 1.0.0 → 1.0.1)
2. **Change log** — Append new entry in Implementation Roadmap section
3. **Component inventory** — Update if new components added
4. **API reference** — Update if routes modified
5. **Validation** — Update Final Validation section if testing done

### Update Template

```markdown
### Change Log (append to Implementation Roadmap)

| Date | Change | By |
|------|--------|----|
| YYYY-MM-DD | Description of change | Kairos |
```

## Project Conventions

### Route Patterns
- `{id}` — refers to account ID
- `{clientId}` — refers to client ID
- `{gapId}` — refers to marketing gap ID
- `by-client/[clientId]` — nested route for client-specific queries

### Data Storage
- All data stored in `/tmp/aeg-data/*.json`
- Files: `clients.json`, `accounts.json`, `metrics.json`, `trends.json`, `gaps.json`, `predictions.json`
- **WARNING:** Data is EPHEMERAL on Vercel serverless — use Vercel Postgres for production persistence

### API Token Management
- Tokens stored in environment variables
- Platform → Variable mapping:
  - Instagram: `INSTAGRAM_ACCESS_TOKEN`
  - Twitter: `TWITTER_BEARER_TOKEN`
  - TikTok: `TIKTOK_ACCESS_TOKEN`
  - YouTube: `YOUTUBE_API_KEY`
  - LinkedIn: `LINKEDIN_ACCESS_TOKEN`
  - Facebook: `FACEBOOK_ACCESS_TOKEN`

## Run Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `vercel` | Deploy to Vercel |
| `vercel --prod` | Deploy to production |

## When to Wake

- Any PR or commit to `/home/x5con1/aeg-scraper/`
- Any message from Devon about AEG features
- Any token update for social media APIs
- Any deployment issue notification

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026-04-29 | OmniPulse Phase 5: StrategyFactory, PluginManager (11 hooks), WebhookManager, Health endpoints |
| 1.3.0 | 2026-04-29 | OmniPulse Phase 3-4: Analytics engine (trends, gaps, predictions), Campaign ROI tracking, Rate limiter, Audit logger, Data exporter |
| 1.2.0 | 2026-04-29 | OmniPulse Phase 1-2 implementation: TenantConfigStore, WhiteLabelEngine, UI library, KPI Manager, tenant API routes, middleware |
| 1.1.0 | 2026-04-29 | OmniPulse multi-tenant architecture: technical roadmap, dynamic KPI schema, UI wireframes, global scaling strategy |
| 1.0.0 | 2026-04-29 | Initial build — 11 API routes, 6 components, deployed to Vercel |