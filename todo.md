# Security Migration: Next.js 15.2.4 → 16.1.5+ & React 19.1.0 → 19.2.4

> **Priority: CRITICAL** — Current versions are vulnerable to:
> - **CVE-2025-55182** (RCE, CVSS 10.0) — Remote Code Execution via React Server Components Flight protocol. Actively exploited in the wild.
> - **CVE-2025-66478** (RCE, CVSS 10.0) — Remote Code Execution via RSC. Fixed in Next.js 16.0.7.
> - **CVE-2025-55183** (Source Code Exposure, CVSS 5.3) — Leaks compiled source of Server Functions. Fixed in Next.js 16.0.10.
> - **CVE-2025-55184 / CVE-2025-67779** (DoS, CVSS 7.5) — Infinite loop hangs server. Fixed in Next.js 16.0.10.
> - **CVE-2026-23864** (DoS, CVSS 7.5) — Server Action DoS. Fixed in React 19.2.4 & Next.js 16.1.5.
>
> **Target versions:** Next.js 16.1.5+ (covers all CVEs), React 19.2.4, React DOM 19.2.4
>
> **Strategy:** 7-phase migration, ordered by dependency chain. Each phase is independently testable.
> **Research:** 42 agents scanned every file, dependency, breaking change, and compatibility concern.

---

## PHASE 0: Pre-Migration — Environment & Backup

### Task 0.1: Verify Node.js version
- [x] Next.js 16 requires **Node.js 20.9+** (Node 18 dropped) — **v24.13.0** ✅
- [x] Run `node -v` and upgrade if below 20.9
- [x] Update any CI/CD pipelines, Dockerfiles, or Vercel config to Node 20+
- [x] Browser requirements: Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+

### Task 0.2: Create migration branch
- [x] `git checkout -b dev-main-plus-16`
- [x] Ensure all current work is committed
- [x] Take note of current `package-lock.json` (can revert if needed)

### Task 0.3: Run current build baseline
- [x] Run `npm run build` — record current status (pass/fail, warnings) — **PASS** ✅
- [x] Run `npm run lint` — record current lint status — **PASS** (2 warnings) ✅
- [x] Run `npx jest` — record current test status — **9/9 PASS** ✅

---

## PHASE 1: Core Framework Upgrade (Next.js + React + Types)

### Task 1.1: Upgrade React and React DOM
- [x] `npm install react@^19.2.4 react-dom@^19.2.4` — **19.2.4** ✅
- [x] Verify: `node -e "console.log(require('react/package.json').version)"` → 19.2.4+
- [x] **Security:** Fixes CVE-2025-55182, CVE-2025-55184, CVE-2025-67779, CVE-2025-55183, CVE-2026-23864

### Task 1.2: Upgrade TypeScript types for React 19
- [x] `npm install -D @types/react@^19 @types/react-dom@^19` — **19.2.14 / 19.2.3** ✅
- [x] Run codemod: `npx types-react-codemod@latest preset-19 ./`
- [x] Key changes:
  - `useRef` requires explicit argument (`useRef<T>(null)` instead of `useRef<T>()`)
  - `ReactElement` type parameter changed (3 → 2 params)
  - `forwardRef` still works but deprecated (components now accept `ref` as prop)
- [x] ~40 shadcn/ui files use `forwardRef` — **non-breaking**, just deprecated warnings
- [x] Verify no `ReactChild`, `ReactText`, `ReactFragment` types used (removed in @types/react@19)

### Task 1.3: Upgrade Next.js to 16.1.5+
- [x] `npm install next@^16.1` — **16.1.6** ✅
- [x] **Security:** Fixes CVE-2025-66478, CVE-2025-55183, CVE-2026-23864
- [x] May need `--legacy-peer-deps` if next-auth peer dep fails
- [x] Run all codemods at once: `npx @next/codemod@canary upgrade latest`
  - This handles: middleware→proxy, async APIs, unstable_ prefix removal, ESLint migration

### Task 1.4: Upgrade @next/bundle-analyzer
- [x] `npm install -D @next/bundle-analyzer@^16.1` ✅
- [x] Current: `^16.1.6` in devDeps — likely already compatible

### Task 1.5: Quick build smoke test
- [x] `npm run build` — revalidateTag errors (expected, fix in Phase 3) ✅
- [x] Categorize errors by type for systematic fixing

---

## PHASE 2: Breaking Changes — Middleware → Proxy + ESLint

### Task 2.1: Rename middleware.ts to proxy.ts
- [x] Run codemod: `npx @next/codemod@canary middleware-to-proxy .`
- [x] Or manually:
  - Rename file: `middleware.ts` → `proxy.ts`
  - Rename function: `export default async function middleware(req)` → `export default async function proxy(req)`
  - `createIntlMiddleware` import and usage stays unchanged
  - `config` export with `matcher` stays unchanged
- [x] **Runtime change:** proxy runs on **Node.js** (not edge) — this is fine for this project
- [x] **Known bug:** proxy.ts may not execute behind some reverse proxies (GitHub #86122). If deploying behind Cloudflare/Traefik, test thoroughly
- [x] **next-intl:** v4.8.3+ supports proxy.ts pattern — no upgrade needed

### Task 2.2: Update next.config.ts proxy-related flags
- [x] If using `skipMiddlewareUrlNormalize` → rename to `skipProxyUrlNormalize`
- [x] If using `experimental.middlewareClientMaxBodySize` → rename to `experimental.proxyClientMaxBodySize`
- [x] **Current config uses NONE of these** — no change needed

### Task 2.3: Verify NextAuth works with proxy.ts
- [x] The `authorized()` callback in `auth.config.ts` runs server-side — compatible with Node.js runtime
- [x] Auth is NOT composed as middleware export — it uses NextAuth's `authorized` callback pattern
- [x] No changes to `auth.ts` or `auth.config.ts` needed for the proxy rename
- [x] Verify sessionCartId cookie still sets in `proxy.ts`

### Task 2.4: Replace bcrypt-ts-edge with bcrypt-ts
- [x] `npm uninstall bcrypt-ts-edge`
- [x] `npm install bcrypt-ts`
- [x] Update imports in **3 files**:
  - `auth.ts`: `import { compareSync } from "bcrypt-ts-edge"` → `"bcrypt-ts"` ✅
  - `lib/actions/user.actions.ts`: `import { hashSync } from "bcrypt-ts-edge"` → `"bcrypt-ts"` ✅
  - `db/sample-data.ts`: `import { hashSync } from "bcrypt-ts-edge"` → `"bcrypt-ts"` ✅
- [x] Reason: Edge runtime not used in proxy.ts; bcrypt-ts-edge unmaintained (last update May 2023)

### Task 2.5: Migrate ESLint to v9 flat config
- [x] `npm install -D eslint@^9 eslint-config-next@^16.1` — **9.39.4 / 16.1.6** ✅
- [x] Delete `.eslintrc.json`
- [x] Create `eslint.config.mjs` (flat config with core-web-vitals + typescript)
- [x] Update `package.json` lint script: `"lint": "eslint ."` (replaces `"next lint"`)
- [x] Disabled React Compiler lint rules (static-components, preserve-manual-memoization, refs)
- [x] Note: `next build` NO LONGER runs linting — add lint step to CI if needed
- [x] Also upgraded zod to v4.3.6 (required by eslint-plugin-react-hooks@7, backward-compat via zod/v3)

### Task 2.6: Test Phase 2
- [x] `npm run lint` — **0 errors, 19 warnings** ✅
- [ ] `npm run build` — will test after Phase 3 (revalidateTag fix needed)
- [ ] Test sign-in / sign-out flow (manual)
- [ ] Test protected routes redirect (manual)
- [ ] Test admin access (manual)
- [ ] Test guest cart cookie (manual)

---

## PHASE 3: Async APIs & Caching Updates

### Task 3.1: Verify async request APIs (ALREADY COMPLIANT)
**Agent scan result:** All 10 page files with params, all 10 with searchParams, all 6 layouts, all 7 API routes, and all 30 generateMetadata functions already use the correct `Promise<>` type + `await` pattern. **No changes needed.**
- [x] Confirm: already compliant ✅
- [x] Run `npx next typegen` to generate `PageProps`, `LayoutProps`, `RouteContext` type helpers ✅

### Task 3.2: Update revalidateTag() calls (BREAKING — ~25 calls)
- [x] Updated ALL 25 `revalidateTag()` calls to include `"max"` as second argument ✅
- [x] Also upgraded zod to v4.3.6 and changed all `from "zod"` imports to `from "zod/v3"` for backward compat
- [x] Upgraded `@hookform/resolvers` to v5.2.2 (supports zod v4 types)
- [x] **Build passes** ✅

### Task 3.3: Verify no parallel route slots exist
- [x] No `@`-prefixed route folders found — **no action needed** ✅

### Task 3.4: Optional — Migrate unstable_cache to `"use cache"` directive
- [x] **Kept `unstable_cache` for now** — migrate to `"use cache"` later when next-intl compatibility improves

### Task 3.5: Test server actions and caching
- [ ] Test add-to-cart → verify cart badge updates (manual)
- [ ] Test admin product CRUD → verify product listing updates (manual)
- [ ] Test order placement → verify order appears in dashboard (manual)
- [ ] Test review submission → verify review appears on product page (manual)

---

## PHASE 4: next.config.ts & Build Configuration

### Task 4.1: Update dev script (Turbopack is now default)
- [x] Change `package.json`: `"dev": "next dev --turbopack"` → `"dev": "next dev"` ✅
- [x] The `--turbopack` flag is redundant in Next.js 16 (Turbopack is default for both dev and build)

### Task 4.2: Review experimental options in next.config.ts
- [x] `experimental.optimizePackageImports` — kept for Webpack fallback builds ✅
- [x] React Compiler: NOT enabling ✅

### Task 4.3: Update image configuration (ACTION REQUIRED)
- [x] **Added `qualities: [75]`** to `next.config.ts` images config ✅
- [x] **Migrated `priority` → `preload`** in 5 files ✅
- [x] Default cache/size changes — acceptable for e-shop ✅

### Task 4.4: Handle potential UploadThing + Turbopack issue
- [x] Turbopack build passes with UploadThing — **no workaround needed** ✅

### Task 4.5: Verify standalone output mode
- [x] `output: "standalone"` still supported — no change needed ✅

### Task 4.6: Full build and dev verification
- [x] `npm run build` — **zero errors** ✅
- [ ] `npm run dev` — verify dev server starts (manual)
- [ ] `npm start` — verify production server works (manual)

---

## PHASE 5: Dependency Updates

### Task 5.1: Update next-auth to latest beta
- [x] `npm install next-auth@beta --legacy-peer-deps` — **5.0.0-beta.30** ✅
- [x] Supports Next.js 16 peer dep ✅

### Task 5.2: Update react-hook-form — watch() → useWatch()
- [x] `npm install react-hook-form@latest @hookform/resolvers@latest` ✅
- [x] Migrated 3 `form.watch()` calls to `useWatch()` in `components/admin/product-form.tsx` ✅

### Task 5.3: Update Prisma to latest 6.x
- [x] **REVERTED to Prisma 6.5** — Prisma 6.19 causes build timeouts with Neon adapter
- [x] Kept `@auth/prisma-adapter@^2.8.0` (compatible)
- [x] Prisma 6.19+ upgrade deferred to separate task (investigate Neon adapter compatibility)

### Task 5.4: Update PayPal SDK (if payment is active)
- [x] **Kept v8** — minimal approach, no breaking changes needed ✅

### Task 5.5: Update other dependencies (safe upgrades)
- [x] `framer-motion@latest` upgraded ✅
- [x] Stripe packages upgraded (stripe@^20.4, @stripe/stripe-js@^8.9, @stripe/react-stripe-js@^5.6) ✅
- [x] Zod upgraded to v4.3.6 (required by eslint-plugin-react-hooks@7) ✅
- [x] Embla Carousel, Recharts, lucide-react: no upgrade needed ✅

### Task 5.6: Client component state-in-transition audit (React 19.2 behavioral change)
- [x] `components/shared/coupon-input.tsx` — moved `setCode("")` outside transition ✅
- [x] `app/[locale]/(auth)/sign-in/credentials-signin-form.tsx` — moved `setServerError` outside transition ✅
- [x] `app/[locale]/(auth)/sign-up/sign-up-form.tsx` — moved `setServerError` outside transition ✅
- [x] `components/shared/delete-dialog.tsx` — moved `setIsOpen` outside transition ✅
- [x] `components/shared/product/add-to-cart-button.tsx` — moved `setAdded` outside transition ✅

---

## PHASE 6: Verification & Testing

### Task 6.1: Full build verification
- [x] `npm run build` — **zero errors** ✅
- [x] `npm run lint` — **0 errors, 18 warnings** ✅
- [x] `npx jest` — **9/9 tests pass** ✅

### Task 6.2: Core functionality smoke test (MANUAL)
- [ ] Homepage loads (el + en locales)
- [ ] Product listing and search work
- [ ] Product detail page renders (images, price, reviews)
- [ ] Add to cart works (guest cart with sessionCartId cookie)
- [ ] Add to cart works (authenticated user)
- [ ] Checkout flow: shipping → payment → place order
- [ ] Stripe payment completes
- [ ] PayPal payment completes (if enabled)
- [ ] Admin dashboard loads (recharts renders)
- [ ] Admin product CRUD with image upload (UploadThing)
- [ ] Admin order management
- [ ] Admin user management
- [ ] User profile page
- [ ] User orders page
- [ ] User wishlist page
- [ ] User addresses CRUD
- [ ] Language switching (el ↔ en) throughout all pages
- [ ] Coupon code application

### Task 6.3: Security verification
- [x] React **19.2.4** ✅ (fixes CVE-2025-55182, CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)
- [x] Next.js **16.1.6** ✅ (fixes CVE-2025-66478, CVE-2025-55183, CVE-2026-23864)
- [ ] Protected routes redirect unauthenticated users to /sign-in (manual)
- [ ] Admin routes return 403/redirect for non-admin users (manual)
- [ ] Stripe webhook processes correctly with signature verification (manual)

### Task 6.4: Performance verification
- [x] Production build completes with Turbopack ✅
- [ ] Dev server starts with Turbopack (manual)
- [ ] HMR responds within 1-2s (manual)
- [ ] No console errors in browser (manual)

### Task 6.5: Edge cases (MANUAL)
- [ ] Direct URL navigation to protected routes
- [ ] Browser back/forward navigation
- [ ] Page refresh on dynamic routes
- [ ] 404 page works for invalid routes
- [ ] Unauthorized page works

---

## PHASE 7: Cleanup & Documentation

### Task 7.1: Code cleanup
- [x] Remove any unused packages from `package.json` — clean ✅
- [x] Remove `--turbopack` from dev script — done in Phase 4 ✅
- [x] Verify `package.json` versions match installed versions ✅
- [x] Delete any `@next-codemod-error` comments — none found ✅
- [x] Remove any `UnsafeUnwrapped*` type casts — none found ✅
- [x] Auto-fixed 10 unused eslint-disable directives ✅

### Task 7.2: Update CLAUDE.md
- [x] Update tech stack versions (Next.js 16, React 19.2) ✅
- [x] Update commands (lint uses `eslint .` via flat config) ✅
- [x] Note middleware → proxy rename ✅
- [x] Note ESLint flat config, Zod v4, bcrypt-ts, revalidateTag changes ✅

### Task 7.3: Final verification
- [x] `npm run build` — **zero errors** ✅
- [x] `npm run lint` — **0 errors, 8 warnings** ✅
- [x] `npx jest` — **9/9 pass** ✅
- [ ] `npm run dev` — verify manually
- [ ] Ready for merge / deploy

---

## Summary Table

| Category | Current | Target | Breaking? | Effort |
|----------|---------|--------|-----------|--------|
| **Next.js** | 15.2.4 | 16.1.5+ | YES | High |
| **React** | 19.1.0 | 19.2.4 | No (security) | Low |
| **React DOM** | 19.1.0 | 19.2.4 | No | Low |
| **@types/react** | ^18 | ^19 | Minor | Low |
| **@types/react-dom** | ^18 | ^19 | Minor | Low |
| **next-auth** | beta.25 | beta.30 | Peer dep | Low |
| **eslint** | ^8 | ^9 | YES (flat config) | Medium |
| **eslint-config-next** | 15.0.3 | 16.x | YES | Medium |
| **@next/bundle-analyzer** | ^16.1.6 | ^16.1.x | No | Low |
| **middleware.ts** | exists | → proxy.ts | YES (rename) | Medium |
| **bcrypt-ts-edge** | ^3.0.1 | → bcrypt-ts | YES (replace) | Low |
| **react-hook-form** | ^7.55.0 | ^7.71.x | watch→useWatch | Low |
| **prisma** | 6.5 | 6.19.x | No | Low |
| **@prisma/client** | 6.5 | 6.19.x | No | Low |
| **@prisma/adapter-neon** | ^6.5.0 | ^6.19.x | No | Low |
| **@auth/prisma-adapter** | ^2.8.0 | ^2.11.x | No | Low |
| **revalidateTag()** | 1 arg | 2 args required | YES (~23 calls) | Medium |
| **Image priority** | priority | → preload | YES (5 files) | Low |
| **Image qualities** | implicit | explicit required | YES (config) | Low |
| **Tailwind CSS** | v3.4 | v3.4 (keep) | No | None |
| **Stripe SDK** | current | safe to upgrade | No | Optional |
| **Embla Carousel** | v8.6 | v8.6 (keep) | No | None |
| **Recharts** | v2.15 | v2.15 (keep) | No | None |
| **framer-motion** | v12.x | v12.x (keep) | No | None |
| **UploadThing** | v7.x | v7.x (keep) | Turbopack? | Check |

## Key Risks & Mitigations

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **UploadThing + Turbopack build** | Medium | Use `--webpack` for production builds if needed |
| 2 | **revalidateTag() 2nd argument** | High | ~23 calls — bulk find-and-replace, test each action |
| 3 | **next-auth still beta** | Medium | beta.30 works; evaluate Better Auth migration long-term |
| 4 | **proxy.ts behind reverse proxy** | Low | GitHub #86122 — test in deployment environment |
| 5 | **Recharts blank charts** | Low | Add `overrides: { "react-is": "^19.1.0" }` if needed |
| 6 | **State updates inside transitions** | Medium | 5 files need audit — test for re-render issues |
| 7 | **Image priority deprecation** | Low | 5 files — simple prop rename |

## Codebase Readiness (Agent Scan Results)

| Area | Files Scanned | Status | Notes |
|------|--------------|--------|-------|
| Async params/searchParams | 17 pages | COMPLIANT | All use `Promise<>` + `await` |
| Async cookies()/headers() | 3 server action calls | COMPLIANT | All use `await cookies()` |
| generateMetadata | 30 functions | COMPLIANT | All properly await params |
| Layouts | 6 files | COMPLIANT | Only locale layout uses params, already awaits |
| API routes | 7 files | COMPLIANT | uploads/[...path] already uses Promise params |
| Server actions | 11 files | COMPLIANT | cookies() awaited, revalidateTag needs 2nd arg |
| Client components | 80 files | 5 files need audit | State updates inside transitions |
| Middleware | 1 file | NEEDS RENAME | middleware.ts → proxy.ts |
| Image priority prop | 5 files | NEEDS UPDATE | priority → preload |

## What NOT to do in this migration

- Do NOT upgrade to **Tailwind CSS v4** (17 gradient renames, HSL→OKLCH, config overhaul — separate project)
- Do NOT upgrade to **Prisma 7** (ESM-only, new config file, new import paths — separate project)
- Do NOT enable **React Compiler** (opt-in, requires babel plugin, test separately)
- Do NOT migrate **framer-motion → motion** package (optional, 11 import changes — separate task)
- Do NOT migrate to **unified `radix-ui` package** (optional, `npx shadcn@latest migrate radix` later)
- Do NOT migrate to **Better Auth** (evaluate after stabilizing on Next.js 16)
- Do NOT adopt **`"use cache"` directive** (next-intl incompatibility with getTranslations, wait for next/root-params API)
- Do NOT upgrade **Embla Carousel to v9** (still in RC, significant breaking changes)
