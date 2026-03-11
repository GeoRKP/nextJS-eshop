# Remove Dark Mode — Light Only TODO

> Complete removal of dark/light mode toggle system. Keep ONLY light mode.
> 30+ agents scanned the entire codebase. Every dark mode reference is listed below.

---

## PHASE 1: Core Infrastructure (Theme System Removal)

### Task 1: Remove ThemeProvider from layout
**File:** `app/[locale]/layout.tsx`
- [x] Remove `import { ThemeProvider } from "next-themes";`
- [x] Remove `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>` wrapper
- [x] Keep `<WishlistProvider>`, `{children}`, `<Toaster />` in place (unwrap from ThemeProvider)
- [x] Remove `suppressHydrationWarning` from `<html>` tag (no longer needed without theme switching)

### Task 2: Remove darkMode from Tailwind config
**File:** `tailwind.config.ts`
- [x] Remove `darkMode: ["class"],` (line 4)

### Task 3: Remove dark theme CSS variables from globals.css
**File:** `assets/styles/globals.css`
- [x] Remove entire `.dark { ... }` block (lines ~247-288) containing all dark mode CSS variable overrides
- [x] Remove `html.dark .upload-field .text-white { color: #ffffff !important; }` rule (line ~305)
- [x] Keep the light theme `:root { ... }` block intact — this is the only theme now

### Task 4: Uninstall next-themes package
**Command:** `npm uninstall next-themes`
- [x] Run the uninstall command
- [x] Verify `next-themes` is removed from `package.json` dependencies
- [x] Verify no remaining imports of `next-themes` exist in codebase

### Task 5: Delete mode-toggle component
**File:** `components/shared/header/mode-toggle.tsx`
- [x] Delete the entire file (Sun/Moon/SunMoon icon toggle dropdown)

---

## PHASE 2: Remove Theme Usage from Non-Header Components

### Task 6: Clean stripe-payment.tsx (useTheme dependency)
**File:** `app/[locale]/(root)/order/[id]/stripe-payment.tsx`
- [x] Remove `import { useTheme } from "next-themes";` (line 9)
- [x] Remove `const { theme, systemTheme } = useTheme();` (line 31)
- [x] Simplify Stripe appearance to always use light theme: replace the theme ternary (lines 105-112) with just `theme: "stripe"` (Stripe's light theme)

---

## PHASE 3: Remove ModeToggle Usage from Header

### Task 7: Clean utility-bar.tsx
**File:** `components/shared/header/utility-bar.tsx`
- [x] Remove `import ModeToggle from "./mode-toggle";` (line 4)
- [x] Remove `<ModeToggle />` usage (line 36)

### Task 8: Clean mobile-menu.tsx
**File:** `components/shared/header/mobile-menu.tsx`
- [x] Remove `import ModeToggle from "./mode-toggle";` (line 34)
- [x] Remove `<ModeToggle />` usage (line 424)

---

## PHASE 4: Remove dark: Tailwind Classes from Components

### Task 9: Clean order-status-badge.tsx (8 dark: classes)
**File:** `components/shared/order-status-badge.tsx`
- [x] Remove `dark:text-yellow-400` (pending status)
- [x] Remove `dark:text-blue-400` (confirmed status)
- [x] Remove `dark:text-indigo-400` (processing status)
- [x] Remove `dark:text-purple-400` (shipped status)
- [x] Remove `dark:text-green-400` (delivered status)
- [x] Remove `dark:text-red-400` (cancelled status)
- [x] Remove `dark:text-orange-400` (refund_requested status)
- [x] Remove `dark:text-gray-400` (refunded status)

### Task 10: Clean order-status-timeline.tsx (8 dark: classes)
**File:** `components/shared/order-status-timeline.tsx`
- [x] Remove `dark:text-yellow-400` (pending)
- [x] Remove `dark:text-blue-400` (confirmed)
- [x] Remove `dark:text-indigo-400` (processing)
- [x] Remove `dark:text-purple-400` (shipped)
- [x] Remove `dark:text-green-400` (delivered)
- [x] Remove `dark:text-red-400` (cancelled)
- [x] Remove `dark:text-orange-400` (refund_requested)
- [x] Remove `dark:text-gray-400` (refunded)

### Task 11: Clean product-images.tsx (4 dark: classes)
**File:** `components/shared/product/product-images.tsx`
- [x] Line ~34: Remove `dark:bg-card/80` from left arrow button
- [x] Line ~34: Remove `dark:hover:bg-card` from left arrow button
- [x] Line ~41: Remove `dark:bg-card/80` from right arrow button
- [x] Line ~41: Remove `dark:hover:bg-card` from right arrow button

### Task 12: Clean product-card.tsx (2 dark: classes)
**File:** `components/shared/product/product-card.tsx`
- [x] Line ~109: Remove `dark:bg-card/90` from wishlist button (list variant)
- [x] Line ~117: Remove `dark:bg-card/90` from wishlist button (grid variant)

### Task 13: Clean product-card-wishlist.tsx (1 dark: class)
**File:** `components/shared/product/product-card-wishlist.tsx`
- [x] Line ~24: Remove `dark:bg-card/90` from wishlist button background

### Task 14: Clean add-to-cart-button.tsx (1 dark: class)
**File:** `components/shared/product/add-to-cart-button.tsx`
- [x] Line ~50: Remove `dark:text-green-400` from success state

### Task 15: Clean mega-menu.tsx (1 dark: class)
**File:** `components/shared/header/mega-menu.tsx`
- [x] Line ~132: Remove `dark:bg-black/40` from overlay backdrop

### Task 16: Clean brand-showcase-client.tsx (1 dark: class)
**File:** `components/shared/brand-showcase-client.tsx`
- [x] Line ~48: Remove `dark:invert` from brand logo images

### Task 17: Clean product detail page (2 dark: classes)
**File:** `app/[locale]/(root)/product/[slug]/page.tsx`
- [x] Line ~123: Remove `dark:text-green-400` from "in stock" text
- [x] Line ~128: Remove `dark:text-orange-400` from "low stock" text

### Task 18: Clean highlight-text.tsx (1 dark: class)
**File:** `lib/highlight-text.tsx`
- [x] Line ~28: Remove `dark:bg-yellow-800` from highlighted search text

---

## PHASE 5: Verification & Testing

### Task 19: Build verification
- [x] Run `npm run build` — ensure zero errors
- [x] Run `npm run lint` — ensure no broken imports or unused variables

### Task 20: Visual verification
- [x] Check homepage renders correctly in light mode
- [x] Check product cards display correctly
- [x] Check product detail page (stock indicators visible)
- [x] Check order status badges have correct colors
- [x] Check order status timeline colors
- [x] Check mega-menu overlay works
- [x] Check brand showcase logos are visible
- [x] Check search highlight text is visible
- [x] Check admin dashboard charts render
- [x] Check mobile menu works (no ModeToggle crash)
- [x] Check utility bar works (no ModeToggle crash)
- [x] Check Stripe payment form renders with light "stripe" theme
- [x] Check UploadThing file upload works in admin

### Task 21: Final grep verification
- [x] Run `grep -r "dark:" --include="*.tsx" --include="*.ts" --include="*.css"` and confirm ZERO results (excluding node_modules)
- [x] Run `grep -r "next-themes" --include="*.tsx" --include="*.ts"` and confirm ZERO results (excluding node_modules)
- [x] Run `grep -r "useTheme" --include="*.tsx" --include="*.ts"` and confirm ZERO results (excluding node_modules)
- [x] Run `grep -r "setTheme" --include="*.tsx" --include="*.ts"` and confirm ZERO results (excluding node_modules)

---

## Summary Table

| Phase | Tasks | Files Affected | dark: Removals |
|-------|-------|---------------|----------------|
| 1 — Infrastructure | 5 | 4 files + 1 package | Core theme system |
| 2 — Non-header cleanup | 1 | 1 file | Stripe useTheme |
| 3 — Header cleanup | 2 | 2 files | ModeToggle imports |
| 4 — Component cleanup | 10 | 10 files | ~30 dark: classes |
| 5 — Verification | 3 | — | Final checks |
| **Total** | **21** | **17 files** | **~30 classes** |

## Files Quick Reference

```
DELETE:
  components/shared/header/mode-toggle.tsx

MODIFY (infrastructure):
  app/[locale]/layout.tsx
  tailwind.config.ts
  assets/styles/globals.css
  package.json

MODIFY (remove useTheme):
  app/[locale]/(root)/order/[id]/stripe-payment.tsx

MODIFY (remove imports):
  components/shared/header/utility-bar.tsx
  components/shared/header/mobile-menu.tsx

MODIFY (remove dark: classes):
  components/shared/order-status-badge.tsx
  components/shared/order-status-timeline.tsx
  components/shared/product/product-images.tsx
  components/shared/product/product-card.tsx
  components/shared/product/product-card-wishlist.tsx
  components/shared/product/add-to-cart-button.tsx
  components/shared/header/mega-menu.tsx
  components/shared/brand-showcase-client.tsx
  app/[locale]/(root)/product/[slug]/page.tsx
  lib/highlight-text.tsx
```

## Notes

- shadcn/ui components (`components/ui/`) use CSS variables (not `dark:` classes) — they automatically work with light-only since `:root` defines all values
- Charts in admin use `hsl(var(...))` CSS variables — they work automatically with light theme
- Footer uses semantic colors (`bg-primary`, `text-primary-foreground`) — works automatically
- Cart/checkout pages have ZERO `dark:` classes — no changes needed
- Auth pages have ZERO `dark:` classes — no changes needed
- User profile/orders/addresses pages have ZERO `dark:` classes — no changes needed
- Form components (input, select, textarea, checkbox) have ZERO `dark:` classes — no changes needed
- The `brand-accent-dark` color in tailwind.config.ts is a shade name (darker gold), NOT a dark-mode class — keep it
