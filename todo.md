# AVL Truck Parts E-Shop - Performance Optimization Tasks

> Generated from deep analysis of 19 areas across the entire codebase (31 agents, 19 successful).
> Tasks are ordered by impact. Each task is self-contained and actionable.

---

## Phase 1: Critical Performance Fixes (Highest Impact)

### 1.1 Parallelize Product Detail Page Data Fetching
- [x] **File**: `app/[locale]/(root)/product/[slug]/page.tsx` (lines 24-36)
- **Problem**: 4 sequential `await` calls (`getProductBySlug`, `auth`, `getMyCart`, `isInWishlist`) create a waterfall adding 100-300ms
- **Fix**: Use `Promise.all()` for independent calls. Product must load first (others depend on `product.id`), then parallelize the rest:
  ```ts
  const product = await getProductBySlug(slug);
  const [session, cart, inWishlist] = await Promise.all([auth(), getMyCart(), isInWishlist(product.id)]);
  ```
- **Also**: Remove redundant `auth()` call — `getMyCart()` and `isInWishlist()` already call `auth()` internally

### 1.2 Add `generateStaticParams` to Product Detail Page
- [x] **File**: `app/[locale]/(root)/product/[slug]/page.tsx`
- **Problem**: Every product page is dynamically rendered at request time (no ISR/SSG)
- **Fix**: Add `generateStaticParams()` to pre-render popular products:
  ```ts
  export async function generateStaticParams() {
    const products = await prisma.product.findMany({
      select: { slug: true },
      where: { deletedAt: null },
      take: 100,
    });
    return products.map(p => ({ slug: p.slug }));
  }
  ```
- **Impact**: Reduces TTFB by 100-1000ms for static pages

### 1.3 Defer Wishlist Checks to Client Side (Enable Static Caching)
- [x] **Files**: `app/[locale]/(root)/page.tsx`, `app/[locale]/(root)/search/page.tsx`, `app/[locale]/(root)/product/[slug]/page.tsx`
- **Problem**: `getWishlistProductIds()` and `isInWishlist()` require `auth()` which forces dynamic rendering on every page. This prevents caching the homepage, search, and product pages.
- **Fix**: Move wishlist status checks to a client component that hydrates after initial render. Pass product IDs down and fetch wishlist state client-side via a lightweight API route or server action. This allows the main page content to be statically cached/ISR.
- **Impact**: Homepage and product pages become cacheable

### 1.4 Migrate Prisma Client to Neon Serverless Adapter
- [x] **File**: `db/prisma.ts`
- **Problem**: Main branch uses basic `PrismaClient()` without Neon adapter — missing WebSocket support for serverless, causing higher cold-start latency and connection issues
- **Fix**: Add Neon adapter (already implemented in worktrees `sleepy-black`/`relaxed-bose`):
  ```ts
  import { Pool, neonConfig } from "@neondatabase/serverless";
  import { PrismaNeon } from "@prisma/adapter-neon";
  import ws from "ws";
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  export const prisma = new PrismaClient({ adapter }).$extends({...});
  ```
- **Impact**: Faster cold starts, better connection pooling in serverless

### 1.5 Fix Stripe PaymentIntent Created on Every Order Page Visit
- [x] **File**: `app/[locale]/(root)/order/[id]/page.tsx` (lines 34-43)
- **Problem**: A NEW Stripe `PaymentIntent` is created every time the order page loads, even if one already exists. This generates unnecessary Stripe API calls.
- **Fix**: Store `client_secret` in database on first creation, reuse on subsequent visits. Only create new PaymentIntent if none exists for the order.

### 1.6 Eliminate Redundant `auth()` Calls Across Server Actions
- [x] **Files**: All files in `lib/actions/` (27 occurrences of `await auth()`)
- **Problem**: Multiple server actions call `auth()` independently. When a page calls multiple actions (e.g., product page calls `getMyCart()` + `isInWishlist()`), JWT is decrypted 2-3x per request.
- **Fix**:
  1. Create a `getAuthSession()` utility using React `cache()` for request-level deduplication:
     ```ts
     import { cache } from "react";
     export const getAuthSession = cache(async () => await auth());
     ```
  2. Replace all `await auth()` calls in server actions with `await getAuthSession()`
- **Impact**: Eliminates redundant JWT decryption on every request

---

## Phase 2: Database Performance

### 2.1 Add Missing Database Indexes
- [x] **File**: `prisma/schema.prisma`
- **Add the following indexes** (then run `npx prisma db push`):

**HIGH priority:**
```prisma
// Session model
@@index([userId])

// Account model
@@index([userId])

// Cart model
@@index([userId])

// CouponUsage model
@@index([couponId, userId])
@@index([userId])

// Order model (standalone for dashboard sorting)
@@index([createdAt])
@@index([createdAt, isPaid])  // dashboard aggregations
@@index([paymentMethod])       // payment method filtering

// OrderItem model
@@index([orderId])             // join performance in aggregations
```

**MEDIUM priority:**
```prisma
// Review model
@@index([userId])
@@index([productId, createdAt])  // sorted review lists

// Category model
@@index([parentId, isActive])

// CouponCategory model
@@index([categoryId])

// CouponProduct model
@@index([productId])

// ReturnRequest model
@@index([status])
@@index([status, createdAt])
```

**LOW priority:**
```prisma
// Address model
@@index([createdAt])

// Notification model
@@index([createdAt])
```

### 2.2 Fix N+1 Query in `updateOrderToPaid`
- [x] **File**: `lib/actions/order.actions.ts` (lines 264-296)
- **Problem**: Loop updates product stock one-by-one for each order item:
  ```ts
  for (const item of order.orderitems) {
    await tx.product.update({...}); // N separate updates
  }
  ```
- **Fix**: Use `updateMany()` or batch the updates
- **Also**: Remove duplicate `findFirst` after transaction (line 300-306) — return result from transaction instead

### 2.3 Add `unstable_cache` to Frequently Called Queries
- [x] **File**: `lib/actions/product.actions.ts`
- **Add caching to:**
  - `getProductBySlug()` — called on every product page view, no caching
  - `getRelatedProducts()` — regenerated on every product detail view
- **Use**: `unstable_cache` with 300s TTL and `["products"]` tag
- **Also**: Reduce existing TTLs from 3600s (1 hour) to 300s (5 min) for `getAllCategories` and `getProductPriceRange`

### 2.4 Optimize Wishlist Queries
- [x] **File**: `lib/actions/wishlist.actions.ts`
- **Problems**:
  1. `isInWishlist()` (lines 45-65): Two sequential queries (`findUnique` wishlist, then `findUnique` wishlistItem). Combine into single query with `include`.
  2. `toggleWishlist()` (lines 173-181): Calls `isInWishlist()` then `addToWishlist()`/`removeFromWishlist()` — 2-3 DB roundtrips for one toggle
  3. `getMyWishlist()` (lines 14-24): Loads entire product objects. Use `select` to fetch only needed fields (name, price, images, slug)
- **Fix**: Combine queries, use upsert pattern for toggle

### 2.5 Optimize Cart Coupon Lookups
- [x] **File**: `lib/actions/cart.actions.ts` (lines 127-140, 235-250)
- **Problem**: Coupon data is re-fetched from DB on every `addItemToCart()` and `removeItemFromCart()` call when cart has a coupon applied
- **Fix**: Extract coupon lookup to a cached helper function; or include coupon in cart query with `include`

### 2.6 Add Pagination to Review Loading
- [x] **File**: `lib/actions/review-actions.ts` (lines 114-132)
- **Problem**: `getReviews()` loads ALL reviews for a product with no pagination. Product with 1000+ reviews loads all.
- **Fix**: Add `take`/`skip` parameters with default limit of 10-20

---

## Phase 3: Bundle Size & Client-Side Performance

### 3.1 Replace Framer Motion Animation Components with CSS
- [ ] **SKIPPED** (user prefers keeping framer-motion for UI consistency) **Files**:
  - `components/shared/animated-button.tsx` — uses `motion` for tap scale (0.97). Replace with `active:scale-[0.97]` (already in design system)
  - `components/shared/product/animated-card.tsx` — hover animation. Replace with CSS `hover:scale-[1.02] transition-transform`
  - `components/shared/scroll-fade-in.tsx` — viewport-triggered fade. Replace with CSS `@keyframes` + Intersection Observer
  - `components/shared/product/animated-grid.tsx` — stagger animation. Replace with CSS stagger using `animation-delay`
  - `components/shared/page-transition.tsx` — page transitions. Consider View Transitions API
  - `components/shared/header/announcement-bar.tsx` — carousel rotation. Use CSS keyframes
- **Impact**: Could remove `framer-motion` (~50KB gzipped) from client bundle entirely or significantly reduce its usage

### 3.2 Dynamic Import Recharts for Admin Dashboard
- [x] **File**: `app/[locale]/admin/overview/charts.tsx` (line 1-18)
- **Problem**: Recharts (~145KB gzipped) is statically imported and loaded for all admin overview visitors
- **Fix**: Use `next/dynamic` with `ssr: false`:
  ```tsx
  const Charts = dynamic(() => import("./charts"), {
    loading: () => <ChartsSkeleton />,
    ssr: false,
  });
  ```
- **Also**: Wrap in `<Suspense>` with fallback skeleton in `overview/page.tsx` (lines 60-69)

### 3.3 Dynamic Import Payment SDKs
- [x] **Files**:
  - `app/[locale]/(root)/order/[id]/stripe-payment.tsx` — Stripe.js (~50KB) loaded at module level
  - `app/[locale]/(root)/order/[id]/order-details-table.tsx` — PayPal SDK (~20KB) imported unconditionally
- **Fix**: Use `next/dynamic` with `ssr: false` for both payment components. Only load when user's payment method matches.

### 3.4 Convert Pure-Presentation Client Components to Server
- [x] **Files**:
  - `components/shared/brand-showcase-client.tsx` — uses only CSS `animate-marquee`, no hooks. Convert to server component.
  - `components/shared/newsletter-form.tsx` — form doesn't submit anywhere. Remove `"use client"` or add server action.
  - `components/shared/product/product-carousel.tsx` — only uses Autoplay plugin. Check if interaction needed; if not, convert to server.

### 3.5 Fix Duplicate WishlistButton Rendering in ProductCard
- [x] **File**: `components/shared/product/product-card.tsx` (lines 113-164)
- **Problem**: WishlistButton is rendered **4 times** per card with different visibility logic. On a 20-product grid: 80 unnecessary client component instances.
- **Fix**: Render WishlistButton once per variant (grid/list) with responsive CSS for visibility toggling instead of separate component instances.

### 3.6 Add `optimizePackageImports` to Next.js Config
- [x] **File**: `next.config.ts`
- **Fix**: Add experimental config to optimize Radix UI imports (12 packages):
  ```ts
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-slider',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-select',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
      '@radix-ui/react-toast',
      '@radix-ui/react-separator',
      '@radix-ui/react-switch',
      '@radix-ui/react-popover',
      'recharts',
      'lucide-react',
    ],
  },
  ```

### 3.7 Add Image Optimization Config
- [x] **File**: `next.config.ts`
- **Fix**: Add optimized image configuration:
  ```ts
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [280, 360, 420, 480],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [{ protocol: "https", hostname: "utfs.io" }],
  },
  ```

---

## Phase 4: Rendering & Loading Performance

### 4.1 Add Suspense Boundaries to Layout Header
- [x] **File**: `app/[locale]/(root)/layout.tsx` (lines 17-28)
- **Problem**: Header components (`CategoryNavBar`, `SearchWrapper`, `MobileMenuWrapper`) fetch data without Suspense boundaries, blocking entire page render
- **Fix**: Wrap each async header section in `<Suspense>` with skeleton fallback:
  ```tsx
  <Suspense fallback={<NavbarSkeleton />}>
    <Header />
  </Suspense>
  ```

### 4.2 Add Missing `loading.tsx` Files
- [x] **Create `loading.tsx` for these routes:**
  - `app/[locale]/(root)/product/[slug]/loading.tsx` — product detail skeleton
  - `app/[locale]/(root)/shipping-address/loading.tsx`
  - `app/[locale]/(root)/payment-method/loading.tsx`
  - `app/[locale]/(root)/place-order/loading.tsx`
  - `app/[locale]/(auth)/sign-in/loading.tsx`
  - `app/[locale]/(auth)/sign-up/loading.tsx`
  - `app/[locale]/admin/products/loading.tsx`
  - `app/[locale]/admin/orders/loading.tsx`
  - `app/[locale]/admin/users/loading.tsx`
  - `app/[locale]/admin/categories/loading.tsx`
- **Impact**: Instant navigation feedback, streaming SSR

### 4.3 Add `generateMetadata` to Key Pages
- [x] **Files**:
  - `app/[locale]/(root)/product/[slug]/page.tsx` — **CRITICAL**: Product pages need dynamic metadata (title, description, OG images) for SEO and social sharing
  - `app/[locale]/(root)/page.tsx` — Homepage metadata
  - `app/[locale]/(root)/search/page.tsx` — Search results metadata with query param
- **Impact**: SEO, social sharing, Core Web Vitals

### 4.4 Move Review Loading to Server-Side
- [x] **File**: `app/[locale]/(root)/product/[slug]/review-list.tsx`
- **Problem**: Reviews load client-side in `useEffect`, causing CLS (content layout shift) and delayed content
- **Fix**: Pre-fetch reviews server-side and pass as props, or use a server component with Suspense boundary for streaming

### 4.5 Add Suspense to Admin Dashboard Sections
- [x] **File**: `app/[locale]/admin/overview/page.tsx`
- **Problem**: KPI cards, charts, recent orders, and low stock alerts all wait for 13 parallel queries before rendering anything
- **Fix**: Split `getDashboardData()` into separate server components, each wrapped in `<Suspense>` with skeleton fallback. Charts especially need their own boundary.

### 4.6 Add Admin Categories Pagination
- [x] **File**: `lib/actions/category.actions.ts` (`getAdminCategories`, line 84-94)
- **Problem**: Returns ALL categories without pagination or limit
- **Fix**: Add `take`/`skip` parameters similar to `getAllProducts()`

---

## Phase 5: Caching & Revalidation

### 5.1 Add Locale-Aware Revalidation
- [x] **Files**: ALL action files in `lib/actions/`
- **Problem**: With `localePrefix: "as-needed"`, only Greek (default) paths are revalidated. English (`/en/*`) caches become stale.
- **Fix**: For every `revalidatePath("/path")` call, also add `revalidatePath("/en/path")`:
  ```ts
  revalidatePath(`/product/${slug}`);
  revalidatePath(`/en/product/${slug}`);
  ```
- **Alternatively**: Use `revalidatePath("/[locale]/product/[slug]", "layout")` pattern

### 5.2 Implement Consistent Tag-Based Revalidation
- [x] **Files**: ALL action files in `lib/actions/`
- **Problem**: Only `product.actions.ts` uses `revalidateTag`. Other actions use only `revalidatePath`, making cache invalidation inconsistent.
- **Fix**: Add tags to all entity-related mutations:
  - Product changes → `revalidateTag("products")`
  - Category changes → `revalidateTag("categories")`
  - Review changes → `revalidateTag("reviews")`
  - Cart changes → `revalidateTag("cart")`
  - Order changes → `revalidateTag("orders")`

### 5.3 Fix Cart Revalidation Scope
- [x] **File**: `lib/actions/cart.actions.ts` (lines 96, 152, 260)
- **Problem**: Cart add/remove only revalidates the specific product page. Cart page (`/cart`), homepage, and search page may show stale stock info.
- **Fix**: Add broader revalidation on cart operations:
  ```ts
  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/cart");
  revalidateTag("products");
  ```

### 5.4 Reduce Header Data Fetching per Navigation
- [x] **Files**: `components/shared/header/category-nav-bar.tsx`, `components/shared/header/menu.tsx`
- **Problem**: `getCategoryTree()`, `getAllBrands()`, and `getMyCart()` run on every page navigation (in layout)
- **Fix**: Ensure these use `unstable_cache` with appropriate TTLs. For cart, consider client-side state management or SWR pattern.

---

## Phase 6: React Optimization

### 6.1 Add React.memo to Frequently Re-Rendered Components
- [x] **Files**:
  - `components/shared/product/rating.tsx` — pure presentation, re-renders on every parent update
  - `components/shared/product/product-price.tsx` — static display
  - `components/shared/product/product-card-skeleton.tsx` — re-renders on page change
  - `components/shared/product/product-images.tsx` — carousel re-renders on parent updates
  - `components/shared/product/product-detail-tabs.tsx` — tab re-renders on parent state change
- **Fix**: Wrap exports with `React.memo()`:
  ```tsx
  export default memo(Rating);
  ```

### 6.2 Add useMemo/useCallback to Expensive Operations
- [x] **Files**:
  - `components/shared/header/mega-menu.tsx` (line 376): Alphabetical brand grouping recalculated on every render — wrap with `useMemo`
  - `components/shared/pagination.tsx` (lines 36-58): `getPageNumbers()` called twice per render — wrap with `useMemo`
  - `components/shared/product/product-images.tsx` (lines 32-40): `goTo()` inline functions — wrap with `useCallback`
  - `components/shared/header/mobile-menu.tsx` (line 53): `toggleCategory` not memoized — wrap with `useCallback`

### 6.3 Extract Nested Function Components
- [x] **Files**:
  - `app/[locale]/(root)/place-order/place-order-form.tsx` (lines 23-38): `PlaceOrderButton` defined inside parent — extract to separate component
  - `app/[locale]/(root)/order/[id]/order-details-table.tsx` (lines 109-152): `MarkAsPaidButton` and `MarkAsDeliveredButton` nested — extract to separate files

### 6.4 Memoize Inline Style Objects
- [x] **File**: `components/shared/hero-carousel.tsx` (lines 92-116)
- **Problem**: Inline style objects `{ animationDelay: "0ms", animationFillMode: "forwards" }` create new objects on every render
- **Fix**: Extract to `useMemo` or module-level constants

---

## Phase 7: Middleware & Auth Optimization

### 7.1 Consolidate Protected Paths (DRY)
- [x] **Files**: `middleware.ts` (lines 9-17), `auth.config.ts` (lines 15-23)
- **Problem**: Same protected paths regex array duplicated in both files — maintenance risk and security vulnerability if they diverge
- **Fix**: Extract to `lib/constants.ts` and import in both files

### 7.2 Remove Duplicate Auth Check in Middleware
- [x] **Files**: `middleware.ts` (lines 23-29), `auth.config.ts` (lines 14-30)
- **Problem**: JWT validation happens twice on every protected request — once in middleware via `getToken()`, once in NextAuth `authorized` callback
- **Fix**: Remove the `getToken()` check from `middleware.ts` and rely solely on NextAuth's `authorized` callback. Or vice versa.

### 7.3 Remove Database Write from JWT Callback
- [x] **File**: `auth.ts` (lines 58-64)
- **Problem**: `prisma.user.update()` in JWT callback fires on auth events (sign-in, session updates), creating unexpected DB traffic
- **Fix**: Move name generation to user creation flow, not auth callback

---

## Phase 8: Configuration & Cleanup

### 8.1 Remove Unused Tailwind Animations
- [x] **File**: `tailwind.config.ts`
- **Remove** 6 unused animations: `scale-in`, `slide-in-right`, `slide-in-left`, `count-up`, `engine-rev`, `stagger-fade-up`
- **Also**: Remove duplicate keyframe definitions from `globals.css` (lines 314-443) that are already in `tailwind.config.ts`

### 8.2 Add HTTP Caching Headers
- [x] **File**: `next.config.ts`
- **Fix**: Add `headers()` function for static assets and images:
  ```ts
  async headers() {
    return [{
      source: '/images/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    }];
  },
  ```

### 8.3 Add Bundle Analyzer
- [x] **Install**: `npm i -D @next/bundle-analyzer`
- **File**: `next.config.ts` — wrap config with analyzer
- **File**: `package.json` — add `"analyze": "ANALYZE=true npm run build"` script
- **Purpose**: Identify largest dependencies and optimize

### 8.4 Parallelize Place Order Page Fetches
- [x] **File**: `app/[locale]/(root)/place-order/page.tsx` (lines 27-33)
- **Problem**: `getMyCart()` and `auth()` called sequentially
- **Fix**: `const [cart, session] = await Promise.all([getMyCart(), auth()]);`

### 8.5 Parallelize Order Page Fetches
- [x] **File**: `app/[locale]/(root)/order/[id]/page.tsx` (lines 25-44)
- **Problem**: `getOrderById()` and `auth()` called sequentially
- **Fix**: `const [order, session] = await Promise.all([getOrderById(id), auth()]);`

---

## Phase 9: Search & Homepage Optimization

### 9.1 Add Suspense Boundaries to Homepage Sections
- [x] **File**: `app/[locale]/(root)/page.tsx`
- **Problem**: All 10 homepage sections wait for `Promise.all()` of 4 queries before ANY content renders. No streaming.
- **Fix**: Split sections into independent server components, each wrapped in `<Suspense>`:
  ```tsx
  <HeroSection /> {/* static + featured products (cached) */}
  <ValuePropositions /> {/* fully static, no data fetch */}
  <Suspense fallback={<CategoryCardsSkeleton />}>
    <CategoryCards />
  </Suspense>
  <Suspense fallback={<ProductGridSkeleton />}>
    <ProductList products={latestProducts} />
  </Suspense>
  ```
- **Impact**: Above-the-fold content (hero, value props) renders instantly

### 9.2 Fix Redundant Wishlist Fetch in ProductList
- [x] **Files**: `app/[locale]/(root)/page.tsx` (line 28), `components/shared/product/product-list.tsx` (line 27)
- **Problem**: `getWishlistProductIds()` is called TWICE — once at the page level and again inside `ProductList`. Same DB query executed twice.
- **Fix**: Pass `wishlistIds` as prop to `ProductList` instead of fetching inside the component. Modify `ProductList` to accept optional `wishlistIds` parameter.

### 9.3 Cache `getCategoryTree()` with `unstable_cache`
- [x] **File**: `lib/actions/category.actions.ts` (lines 25-48)
- **Problem**: 3-level nested Prisma query with `_count` at each level runs on EVERY page load (used in navbar and homepage). Not cached.
- **Fix**: Wrap with `unstable_cache()`:
  ```ts
  export const getCategoryTree = unstable_cache(
    async () => { /* existing query */ },
    ["category-tree"],
    { revalidate: 300, tags: ["categories"] }
  );
  ```

### 9.4 Memoize SearchDropdown with React.memo
- [x] **File**: `components/shared/header/search-dropdown.tsx` (line 21)
- **Problem**: SearchDropdown re-renders on every keystroke even when `products` and `categories` props haven't changed
- **Fix**: Wrap export with `React.memo()` and custom comparison function

### 9.5 Extract `useSearchSuggestions` Custom Hook
- [x] **Files**: `components/shared/header/search-autocomplete.tsx`, `components/shared/header/mobile-search.tsx`
- **Problem**: Significant code duplication between desktop and mobile search — debounce logic, fetch suggestions, navigation callbacks are nearly identical
- **Fix**: Extract shared logic into `hooks/use-search-suggestions.ts`

### 9.6 Add Cache-Control Headers to Search Suggestions API
- [x] **File**: `app/api/search/suggestions/route.ts`
- **Problem**: No caching headers on suggestions endpoint. Same queries re-fetched on repeated searches.
- **Fix**: Add `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` to response headers

### 9.7 Add Functional Indexes for `unaccent()` Search
- [x] **Migration file**: Create new Prisma migration
- **Problem**: Search uses `unaccent(name) ILIKE` and `unaccent(brand) ILIKE` but no functional indexes exist for unaccented columns — full table scan
- **Fix**: Add functional indexes:
  ```sql
  CREATE INDEX idx_product_name_unaccent ON "Product" USING gin (unaccent(name) gin_trgm_ops);
  CREATE INDEX idx_product_brand_unaccent ON "Product" USING gin (unaccent(brand) gin_trgm_ops);
  ```

---

## Known Issues (From Previous Verification)

- [x] ProductPrice component shows $ instead of euro sign (components/shared/product/product-price.tsx:15) — Already fixed: uses € and formatCurrency uses EUR
- [x] Price slider step=10 too coarse for small-price products like 0.05-3 euro (search-filters.tsx:156) — Already fixed: step=1 for slider, step=0.01 for inputs
- [x] Full-text search uses 'english' config — Greek search broken — Already fixed: uses 'simple' config
- [x] Search sidebar shows flat category list, not hierarchical — Already fixed: uses hierarchical CategoryNode component
- [x] Hardcoded English "& up" in rating filter — Already fixed: uses translated "starsAndUp" key
- [x] Low stock dashboard query hardcodes threshold at 5 — Already fixed: uses `stock <= "lowStockThreshold"` per-product
- [x] slugify library converts theta to 8 instead of th — Already fixed: greekSlugify() in lib/slugify.ts extends slugify with θ→th mapping
