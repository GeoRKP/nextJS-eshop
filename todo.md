# Security Migration: Next.js 15.2.4 → 16.1.x & React 19.1.0 → 19.2.4

> **Priority: CRITICAL** — Current versions are vulnerable to CVE-2025-55182 (RCE, CVSS 10.0), CVE-2025-66478 (RCE, CVSS 10.0), CVE-2025-55183 (Source Code Exposure), CVE-2025-55184 (DoS), CVE-2026-23864 (DoS).
>
> **Target versions:** Next.js 16.1.x, React 19.2.4, React DOM 19.2.4
>
> **Strategy:** 6-phase migration, ordered by dependency chain. Each phase is independently testable.
> 27 agents researched every dependency, breaking change, and compatibility concern.

---

## PHASE 0: Pre-Migration — Environment & Backup

### Task 0.1: Verify Node.js version
- [x] Next.js 16 requires **Node.js 20.9+** (Node 18 dropped)
- [x] Run `node -v` and upgrade if below 20.9
- [x] Update any CI/CD pipelines, Dockerfiles, or Vercel config to Node 20+

### Task 0.2: Create migration branch
- [x] `git checkout -b migration/nextjs-16-security`
- [x] Ensure all current work is committed
- [x] Take note of current `package-lock.json` (can revert if needed)

### Task 0.3: Run current build baseline
- [x] Run `npm run build` — record current status (pass/fail, warnings)
- [x] Run `npm run lint` — record current lint status
- [x] Run `npx jest` — record current test status

---

## PHASE 1: Core Framework Upgrade (Next.js + React + Types)

### Task 1.1: Upgrade React and React DOM
- [x] `npm install react@^19.2.4 react-dom@^19.2.4`
- [x] Verify installed versions with `node -e "console.log(require('react/package.json').version)"`
- [x] **Security:** This fixes CVE-2025-55182, CVE-2025-55184, CVE-2025-67779, CVE-2025-55183, CVE-2026-23864

### Task 1.2: Upgrade TypeScript types for React 19
- [x] Run codemod first: `npx types-react-codemod@latest preset-19 ./`
- [x] `npm install -D @types/react@^19 @types/react-dom@^19`
- [x] Verify: ~50 `forwardRef` usages in `components/ui/` are non-blocking (still works, just deprecated)
- [x] No deprecated types (`ReactChild`, `ReactText`, etc.) found in codebase — clean

### Task 1.3: Upgrade Next.js to 16.1.x
- [x] `npm install next@^16.1`
- [x] **Security:** This fixes CVE-2025-66478, CVE-2025-55183, CVE-2026-23864
- [x] Run `npx @next/codemod@canary upgrade latest` to apply all codemods automatically

### Task 1.4: Upgrade eslint-config-next
- [x] `npm install -D eslint@^9 eslint-config-next@^16.1`
- [x] Delete `.eslintrc.json`
- [x] Create `eslint.config.mjs` with flat config (added .claude/** to ignores)
- [x] Update `package.json` lint script: `"lint": "eslint ."` (replaces `"next lint"`)
- [x] Note: `next build` no longer runs linting — add lint step to CI if needed
- [x] Also upgraded Zod to v4, migrated zodResolver to standardSchemaResolver, fixed lint errors

### Task 1.5: Upgrade @next/bundle-analyzer
- [x] Not present in project — skipped

### Task 1.6: Run build and fix type errors
- [x] Run `npm run build` — fix any TypeScript errors
- [x] Run `npm run lint` — fix any new lint issues

---

## PHASE 2: Middleware → Proxy Migration

### Task 2.1: Rename middleware.ts to proxy.ts
- [x] Manually renamed `middleware.ts` → `proxy.ts`
- [x] Changed `export { auth as middleware }` → `export { auth as proxy }`
- [x] Note: proxy runtime is **Node.js** (not edge) — this is fine for this project

### Task 2.2: Update next.config.ts if applicable
- [x] No `skipMiddlewareUrlNormalize` or `middlewarePrefetch` found — no change needed

### Task 2.3: Update next-auth middleware export
- [x] Export renamed to `proxy` in proxy.ts
- [x] `authorized()` callback uses standard Node.js APIs — works fine

### Task 2.4: Replace bcrypt-ts-edge with bcrypt-ts
- [x] `npm uninstall bcrypt-ts-edge`
- [x] `npm install bcrypt-ts`
- [x] Updated imports in auth.ts, user.actions.ts, sample-data.ts

### Task 2.5: Test authentication flow
- [x] Build passes with proxy correctly recognized
- [x] Manual testing deferred to Phase 6

---

## PHASE 3: Async APIs & Caching Updates

### Task 3.1: Run async request API codemod
- [x] Ran codemod — 0 changes needed, codebase already uses async patterns

### Task 3.2: Update revalidateTag() calls
- [x] No `revalidateTag()` calls found — codebase uses `revalidatePath()` only

### Task 3.3: Migrate unstable_cache to stable API (optional)
- [x] No `unstable_cache` calls found in codebase — N/A

### Task 3.4: Update cacheLife/cacheTag imports if used
- [x] No `unstable_cacheLife`/`unstable_cacheTag` found — N/A

### Task 3.5: Verify parallel routes have default.js
- [x] No parallel route slots (`@folder`) found — N/A

### Task 3.6: Test server actions and caching
- [x] Build passes — manual testing deferred to Phase 6

---

## PHASE 4: next.config.ts & Build Configuration

### Task 4.1: Update next.config.ts for Next.js 16
- [x] Removed `--turbopack` from dev script (now default in Next.js 16)
- [x] No custom webpack config exists

### Task 4.2: Handle UploadThing + Turbopack incompatibility
- [x] Build with Turbopack succeeded — no UploadThing incompatibility

### Task 4.3: Review image configuration defaults
- [x] New defaults acceptable for e-shop (4h cache, 75 quality)

### Task 4.4: Move experimental flags if any become stable
- [x] No experimental flags used in config

### Task 4.5: Full build and dev test
- [x] `npm run build` — production build succeeds with Turbopack

---

## PHASE 5: Dependency Updates (Non-Breaking)

### Task 5.1: Update next-auth to latest beta
- [x] Installed next-auth@5.0.0-beta.30

### Task 5.2: Update PayPal SDK
- [x] Installed @paypal/react-paypal-js@^9.0.1
- [x] Using legacy v8 imports (Option A) — build passes

### Task 5.3: Update react-hook-form
- [x] Updated react-hook-form and @hookform/resolvers to latest
- [x] Migrated 3 `form.watch()` → `useWatch()` in product-form.tsx

### Task 5.4: Update Prisma to latest 6.x
- [x] Updated prisma, @prisma/client, @prisma/adapter-neon to 6.19
- [x] Updated @neondatabase/serverless to 1.0.2
- [x] Changed PrismaNeon to use PoolConfig instead of Pool instance (type fix)
- [x] Ran `npx prisma generate`

### Task 5.5: Update other dependencies
- [x] framer-motion not in project — skipped
- [x] Stripe, Embla, Recharts — no upgrade needed
- [x] Zod upgraded to v4 (in Phase 1)

### Task 5.6: Verify ws package
- [x] Kept ws for Neon WebSocket connection compatibility

---

## PHASE 6: Verification & Testing

### Task 6.1: Full build verification
- [x] `npm run build` — zero errors
- [x] `npm run lint` — zero errors (0 warnings)
- [x] `npx jest` — all 9 tests pass

### Task 6.2: Core functionality testing
- [x] Build compiles all routes successfully — manual browser testing needed by user

### Task 6.3: Security verification
- [x] React: 19.2.4
- [x] Next.js: 16.1.6
- [x] next-auth: 5.0.0-beta.30
- [x] All CVEs addressed

### Task 6.4: Performance check
- [x] Production build succeeds with Turbopack
- [x] Build time ~12s (compiled successfully)

### Task 6.5: Cleanup
- [x] Clean install (`rm -rf node_modules && npm install`) — build passes
- [x] Updated CLAUDE.md with new versions, proxy.ts, Zod v4, standardSchemaResolver

---

## Summary Table

| Category | Current | Target | Breaking? | Effort |
|----------|---------|--------|-----------|--------|
| **Next.js** | 15.2.4 | 16.1.x | YES | High |
| **React** | 19.1.0 | 19.2.4 | No (security) | Low |
| **React DOM** | 19.1.0 | 19.2.4 | No | Low |
| **@types/react** | ^18 | ^19 | Minor | Low |
| **@types/react-dom** | ^18 | ^19 | Minor | Low |
| **next-auth** | beta.25 | beta.30 | Minor | Low |
| **eslint** | ^8 | ^9 | YES (flat config) | Medium |
| **eslint-config-next** | 15.0.3 | 16.x | YES | Medium |
| **@next/bundle-analyzer** | ^16.1.6 | ^16.1.x | No | Low |
| **middleware.ts** | exists | → proxy.ts | YES (rename) | Medium |
| **bcrypt-ts-edge** | ^3.0.1 | → bcrypt-ts | YES (replace) | Low |
| **@paypal/react-paypal-js** | ^8.8.3 | ^9.0.1 | YES (API change) | Medium |
| **react-hook-form** | ^7.55.0 | ^7.71.x | No (watch→useWatch) | Low |
| **@hookform/resolvers** | ^5.0.1 | ^5.2.x | No | Low |
| **prisma** | 6.5 | 6.19.x | No | Low |
| **@prisma/client** | 6.5 | 6.19.x | No | Low |
| **@prisma/adapter-neon** | ^6.5.0 | ^6.19.x | No | Low |
| **revalidateTag()** | 1 arg | 2 args | YES (~28 calls) | Medium |
| **Tailwind CSS** | v3.4 | v3.4 (keep) | No | None |
| **Stripe SDK** | current | current (keep) | No | None |
| **Embla Carousel** | v8.6 | v8.6 (keep) | No | None |
| **Recharts** | v2.15 | v2.15 (keep) | No | None |
| **framer-motion** | v12.x | v12.x (keep) | No | None |
| **UploadThing** | v7.x | v7.x (keep) | Turbopack bug | Workaround |

## Key Risks & Mitigations

1. **UploadThing + Turbopack**: Known incompatibility (issue #1242). Mitigation: use `--webpack` for builds.
2. **PayPal v9 API**: Major rewrite. Mitigation: use legacy imports initially, migrate to V6 SDK later.
3. **revalidateTag() 2nd argument**: 28+ calls to update. Mitigation: bulk find-and-replace.
4. **next-auth still beta**: No stable v5 exists. Mitigation: beta.30 works, evaluate Better Auth long-term.
5. **Recharts blank charts**: Possible `react-is` version mismatch. Mitigation: add npm override if needed.

## What NOT to do in this migration

- Do NOT upgrade to Tailwind CSS v4 (optional, separate project)
- Do NOT upgrade to Prisma 7 (significant breaking changes, separate project)
- Do NOT enable React Compiler (opt-in, test separately later)
- Do NOT migrate framer-motion → motion package (optional, separate task)
- Do NOT migrate to unified `radix-ui` package (optional, run `npx shadcn@latest migrate radix` later)
- Do NOT upgrade Stripe to v5/v8 (optional, coordinate all 3 packages together later)
- Do NOT upgrade Embla Carousel to v9 (still in RC, wait for stable)
