# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-01T00:00:00Z
**Branch:** main

## OVERVIEW

Real-time mutual fund valuation tracker (基估宝). Next.js 16 App Router, pure JavaScript (JSX, no TypeScript), static export to GitHub Pages. Glassmorphism UI with heavy custom CSS variables (3557-line globals.css). All data via JSONP/script injection to external Chinese financial APIs (天天基金, 东方财富, 腾讯财经). localStorage as primary database; Supabase for optional cloud sync.

## STRUCTURE

```
real-time-fund/
├── app/                          # Next.js App Router root
│   ├── page.jsx                  # MONOLITHIC SPA entry (~8000+ lines) — ALL state + logic here
│   ├── layout.jsx                # Root layout (theme init, PWA, GA, Toaster)
│   ├── globals.css               # Tailwind v4 + glassmorphism CSS variables (~3557 lines)
│   ├── api/fund.js               # ALL external data fetching (~954 lines, JSONP + script injection)
│   ├── components/               # 62 app-specific UI components (modals, cards, tables, charts)
│   ├── stores/                   # Zustand state management (storageStore, userStore)
│   ├── providers/                # React context providers (QueryClientProvider)
│   ├── lib/                      # Core utilities: supabase, get-query-client, query-keys, tradingCalendar, valuationTimeseries, fundHelpers, dailyEarnings, asyncHelper
│   ├── hooks/                    # Custom hooks: useBodyScrollLock, useFundFuzzyMatcher
│   └── assets/                   # Static images (GitHub SVG, donation QR codes)
├── components/ui/                # 15 shadcn/ui primitives (accordion, button, dialog, drawer, etc.)
├── lib/utils.js                  # cn() helper only (clsx + tailwind-merge)
├── public/                       # Static: allFund.json, PWA manifest, service worker, icon
├── doc/                          # Documentation: localStorage schema, Supabase SQL, dev group QR, Edge Function ts
├── .github/workflows/            # CI/CD: nextjs.yml (GitHub Pages), docker-ci.yml (Docker build)
├── .husky/                       # Pre-commit: lint-staged → ESLint
├── Dockerfile                    # Multi-stage: Node 22 build → Nginx Alpine serve
├── docker-compose.yml            # Docker Compose config
├── entrypoint.sh                 # Runtime env var placeholder replacement
├── nginx.conf                    # Nginx config (port 3000, SPA fallback)
├── next.config.js                # Static export, reactStrictMode, reactCompiler
├── jsconfig.json                 # Path aliases: @/* → ./*
├── eslint.config.mjs             # ESLint flat config: next/core-web-vitals
├── postcss.config.mjs            # Tailwind v4 PostCSS plugin
├── components.json               # shadcn/ui config (new-york, JSX, RSC)
└── package.json                  # Node >= 20.9.0, lint-staged, husky, Zustand
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Fund valuation logic | `app/api/fund.js` | JSONP to 天天基金, script injection to 腾讯财经 |
| Main UI orchestration | `app/page.jsx` | Monolithic — all useState, business logic, rendering (~8000 lines) |
| Fund card display | `app/components/FundCard.jsx` | Individual fund card with holdings |
| Desktop table | `app/components/PcFundTable.jsx` | PC-specific table layout |
| Holding calculations | `app/lib/fundHelpers.js` | Fund helpers: profit/loss, fund code operations |
| Daily earnings | `app/lib/dailyEarnings.js` | Daily earnings calculation utilities |
| Cloud sync | `app/lib/supabase.js` + page.jsx sync functions | Supabase auth + data sync |
| Storage state management | `app/stores/storageStore.js` + React hook `useStorageStore` | Zustand-based localStorage wrapper with sync detection |
| Auth state | `app/stores/userStore.js` | Zustand store for Supabase user session |
| Stores public API | `app/stores/index.js` | Barrel export: useStorageStore, useUserStore, getAuthUser, setAuthUser, clearAuthUser |
| Trading/DCA | `app/components/TradeModal.jsx`, `DcaModal.jsx` | Buy/sell, dollar-cost averaging |
| Fund fuzzy search | `app/hooks/useFundFuzzyMatcher.js` | Fuse.js based name/code matching |
| OCR import | `app/page.jsx` (processFiles) | Tesseract.js + LLM parsing |
| Valuation intraday chart | `app/lib/valuationTimeseries.js` | localStorage time-series |
| Trading calendar | `app/lib/tradingCalendar.js` | Chinese holiday detection via CDN |
| Async utilities | `app/lib/asyncHelper.js` | Async/promise helper functions |
| Request caching | TanStack Query (`app/lib/get-query-client.js`, `app/lib/query-keys.js`) | Dedup + staleTime/gcTime |
| Query provider | `app/providers/query-client-provider.jsx` | TanStack Query provider setup |
| UI primitives | `components/ui/` | shadcn/ui — accordion, dialog, drawer, select, etc. |
| Global styles | `app/globals.css` | CSS variables, glassmorphism, responsive |
| CI/CD | `.github/workflows/nextjs.yml` | Build + deploy to GitHub Pages |
| Docker | `Dockerfile`, `docker-compose.yml` | Multi-stage build with runtime env injection |
| localStorage schema | `doc/localStorage 数据结构.md` | Full documentation of stored data shapes |
| Supabase schema | `doc/supabase.sql` | Database tables for cloud sync |

## CONVENTIONS

- **JavaScript only** — no TypeScript. `tsx: false` in shadcn config.
- **No src/ directory** — app/, components/, lib/ at root level.
- **Static export** — `output: 'export'` in next.config.js. No server-side runtime.
- **JSONP + script injection** — all external API calls bypass CORS via `<script>` tags, not fetch().
- **localStorage-first** — all user data stored locally; Supabase sync is optional/secondary.
- **Zustand state management** — `zustand@5.0.12` for all persistent state. Two main stores:
  - `useStorageStore` — wraps localStorage with sync detection via signature functions (`getFundCodesSignature`, `getTagsStoreSignature`)
  - `useUserStore` — maintains Supabase user session in memory
- **Unified Data Access** — **Strict Requirement**: ALL `localStorage` reads/writes MUST use `useStorageStore` hook (React) or `useStorageStore.getState()` (non-React code). Never use `window.localStorage` directly for business data. Exported from `app/stores/index.js`.
  - **React component**: `const { funds, setItem } = useStorageStore();`
  - **Non-React code**: `useStorageStore.getState().setItem(key, val)` or use public API helpers like `setAuthUser()`, `getAuthUser()`
  - **Sync callback**: Page injects callback via `setOnSync()` to trigger cloud sync on data changes
- **Monolithic page.jsx** — entire app state and logic in one file (~8000 lines). Coordinates all stores and components via props.
- **PC-only layout** — Only `PcFundTable` is used; mobile-specific components have been removed.
- **shadcn/ui conventions** — new-york style, CSS variables enabled, Lucide icons, path aliases (`@/components`, `@/lib/utils`).
- **Linting only** — ESLint + lint-staged on pre-commit. No Prettier, no auto-formatting.
- **React Compiler** — `reactCompiler: true` in next.config.js (experimental auto-memoization).

## STORE PATTERNS & API

### **useStorageStore** (Zustand + localStorage)

**Storage Keys** (synced to Supabase when present):
- `funds`, `tags`, `favorites`, `groups`, `collapsedCodes`, `collapsedTrends`, `collapsedEarnings`, `refreshMs`, `holdings`, `groupHoldings`, `pendingTrades`, `transactions`, `dcaPlans`, `customSettings`, `fundDailyEarnings`

**Usage in React:**
```javascript
import { useStorageStore } from '@/app/stores';

export function MyComponent() {
  const { funds, groups, setItem, getItem } = useStorageStore();
  
  // Read state
  const holdingsData = getItem('holdings', {});
  
  // Write state (triggers sync if storeOnSync callback set)
  setItem('holdings', { ...holdingsData, fund123: { shares: 100 } });
}
```

**Usage in non-React code** (e.g., callbacks, async handlers):
```javascript
import { useStorageStore, getAuthUser, setAuthUser } from '@/app/stores';

// Read non-reactive
const currentUser = getAuthUser();
const funds = useStorageStore.getState().getItem('funds', []);

// Write and sync
useStorageStore.getState().setItem('funds', newFundsArray); // triggers onSync callback
```

**Sync Detection** — Store detects changes via signature functions:
- `getFundCodesSignature(funds)` — checks fund codes, jzrq (valuation date), dwjz (net value)
- `getTagsStoreSignature(tags)` — checks tag IDs, names, fund codes

### **useUserStore** (Supabase auth)
```javascript
import { useUserStore } from '@/app/stores';

// In React
const { user } = useUserStore();

// Outside React
import { getAuthUser, setAuthUser } from '@/app/stores';
getAuthUser(); // Current user
setAuthUser(newUser); // Update session
```

## ANTI-PATTERNS (THIS PROJECT)

- **No test infrastructure** — zero test files, no test framework, no test scripts.
- **Dual ESLint configs** — both `.eslintrc.json` (legacy) and `eslint.config.mjs` (flat) exist. Flat config is active.
- **`--legacy-peer-deps`** — Dockerfile uses this flag, indicating peer dependency conflicts.
- **Console statements** — 20 console.error/warn/log across codebase (mostly error logging in page.jsx).
- **1 eslint-disable comment** — `react-hooks/exhaustive-deps` in HoldingEditModal.
- **Hardcoded API keys** — `app/api/fund.js` lines 911-914 contain plaintext API keys for LLM service.
- **Empty catch blocks** — several `catch (e) {}` blocks that swallow errors silently.

## UNIQUE STYLES

- **Glassmorphism design** — frosted glass effect via `backdrop-filter: blur()` + semi-transparent backgrounds.
- **CSS variable system** — 50+ CSS custom properties for colors, spacing, transitions in globals.css.
- **Runtime env injection** — Docker entrypoint replaces `__PLACEHOLDER__` strings in static JS/HTML at container start.
- **JSONP everywhere** — financial APIs (天天基金, 腾讯财经) accessed via script tag injection, not fetch().
- **OCR + LLM import** — Tesseract.js OCR → LLM text parsing → fund code extraction.
- **Multiple IDE configs** — .cursor/, .qoder/, .trae/ directories suggest active AI-assisted development.
- **Zustand persistence** — Signature-based change detection enables selective cloud sync without polling.
- **62 UI components** — Rich component library for modals, charts, tables, and specialized fund operations.
- **Supabase Edge Functions** — Optional OCR analysis function deployed edgeward for API key security.

## COMMANDS

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Static export to out/
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix

# Docker
docker build -t real-time-fund .
docker run -d -p 3000:3000 --env-file .env real-time-fund
docker compose up -d

# Environment
cp env.example .env.local   # Copy template, fill NEXT_PUBLIC_* values
```

## NOTES

- **Fund code format**: 6-digit numeric codes (e.g., 110022). Stored in localStorage key `localFunds`.
- **Data sources**: 天天基金 (valuation JSONP), 东方财富 (holdings HTML parsing), 腾讯财经 (stock quotes script injection).
- **Deployment**: GitHub Actions auto-deploys main → GitHub Pages. Also supports Vercel, Cloudflare Pages, Docker.
- **Node requirement**: >= 20.9.0 (enforced in package.json engines).
- **License**: AGPL-3.0 — derivative works must be open-sourced under same license.
- **Chinese UI** — all user-facing text is Chinese (zh-CN). README is bilingual (Chinese primary).
