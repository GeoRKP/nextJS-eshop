# Navbar Issues - PC Screens Only

> Generated from deep analysis of 30 agents across 22+ header component files.
> All issues are specific to desktop/PC screens (md breakpoint and above).
> Focused on `category-nav-client.tsx`, `mega-menu.tsx`, and related header components.

---

## Phase 0: HIGHEST PRIORITY — "Όλες οι Κατηγορίες" Instant Hover Drill-Down

### 0.1 Redesign AllCategoriesMegaMenu — Replace Instant Hover Drill-Down with Two-Panel Layout
- [x] **File**: `components/shared/header/mega-menu.tsx` (lines 242-350, function `AllCategoriesMegaMenu`)
- **Problem**: When hovering "Όλες οι Κατηγορίες", a grid of category cards appears. Moving the mouse over ANY card instantly triggers `onMouseEnter={() => setActiveRoot(cat.id)}` (line 274) which **replaces the entire grid** with a drill-down subcategory view. There is NO delay. This makes it impossible to browse the grid — the view changes the moment the cursor touches a card.
- **Root cause**: Line 274 uses `onMouseEnter` with no delay, and lines 264-347 use a conditional render (`{!activeCat ? grid : expanded}`) that swaps the entire content.
- **UX research findings** (Baymard Institute, Nielsen Norman Group):
  - Hover delay of **300ms** is mandatory before expanding (60% of sites fail this)
  - Amazon-style **two-panel layout** is best practice: left panel always shows categories, right panel shows subcategories of hovered item
  - Click should navigate to category page, hover should only preview subcategories
  - Default state should show first category's subcategories (not empty right panel)

#### Solution: Two-Panel Layout (Amazon-style)

**Replace the current toggle view with a side-by-side layout:**

```
┌──────────────────────────────────────────────────┐
│ LEFT (w-2/5)            │ RIGHT (flex-1)          │
├─────────────────────────┼────────────────────────┤
│ ■ Γρανάζια ABS      →  │ ▸ Γρανάζια DAF/MAN     │
│   Ειδικές Κατασκευές    │ ▸ Γρανάζια Mercedes    │
│   Εξαρτήματα Αεροφρένων │ ▸ Γρανάζια Volvo       │
│   Εξαρτ. Σωληνώσεων    │                        │
│   Κατασκ. Σωλήνων       │   View All →           │
└─────────────────────────┴────────────────────────┘
```

**Implementation steps:**

1. **Change state initialization**: `useState<string | null>(categories[0]?.id ?? null)` — default to first category
2. **Add hover delay ref**: `const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)`
3. **Replace `onMouseEnter`** on category buttons with delayed handler:
   ```tsx
   onMouseEnter={() => {
     if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
     hoverTimerRef.current = setTimeout(() => setActiveRoot(cat.id), 300);
   }}
   onMouseLeave={() => {
     if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
   }}
   ```
4. **Add `onClick`** to navigate: `onClick={() => { onClose(); /* navigate via Link */ }}`
5. **Replace conditional render** (`{!activeCat ? ... : ...}`) with **flex side-by-side**:
   ```tsx
   <div className="flex gap-6 min-h-[300px]">
     {/* LEFT: Category list — always visible */}
     <div className="w-2/5 max-h-[480px] overflow-y-auto border-r border-border pr-4">
       {categories.map((cat) => (
         <button
           key={cat.id}
           className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
             activeRoot === cat.id
               ? "bg-brand-accent/10 border-l-2 border-brand-accent"
               : "hover:bg-muted/50"
           }`}
           onMouseEnter={/* delayed handler, 300ms */}
           onMouseLeave={/* clear timer */}
           onClick={/* navigate to category */}
         >
           <Icon /> <span>{cat.name}</span> <ChevronRight />
         </button>
       ))}
     </div>
     {/* RIGHT: Subcategories of active category */}
     <div className="flex-1 min-w-0 max-h-[480px] overflow-y-auto">
       {activeCat ? (
         <>
           <h4>{activeCat.name}</h4>
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
             {/* Reuse existing subcategory rendering from lines 315-344 */}
           </div>
         </>
       ) : null}
     </div>
   </div>
   ```
6. **Cleanup timer** on unmount with useEffect
7. **Keep existing subcategory rendering** (lines 315-344) — just move it into right panel

**Key design principles:**
- Left panel: Always visible, scrollable if many categories, active item highlighted
- Right panel: Shows subcategories with existing grid styling
- 300ms hover delay prevents accidental switches
- Click on category name navigates to `/search?category=...`
- First category selected by default when menu opens
- Both panels independently scrollable within max-h-[480px]

**Files to modify:**
- `components/shared/header/mega-menu.tsx` — AllCategoriesMegaMenu function (lines 242-350)

**Files for reference (do NOT modify):**
- `components/shared/header/category-nav-client.tsx` — hover delay pattern (lines 39-51)
- `components/shared/header/mega-menu.tsx` — BrandsMegaMenu has correct click-only behavior (lines 352-465)
- `components/shared/header/mobile-menu.tsx` — mobile accordion uses click-only (correct pattern)

---

## Phase 1: Critical Visual Issues (User-Facing Bugs)

### 1.1 Category Nav Overflow Clipping — Items Hidden on PC
- [x] **File**: `components/shared/header/category-nav-client.tsx` (line 79)
- **Problem**: The wrapper div has `overflow-hidden` which clips any category buttons that don't fit horizontally. With long Greek names like "Εξαρτήματα Σωληνώσεων / Ρακόρ" plus "Αγορές ανά Μάρκα" plus quick links (New Arrivals, Deals), the bar overflows and some buttons become **invisible** — especially on screens 768px-1280px.
- **Root cause**: `overflow-hidden` on `<div className="wrapper flex items-center gap-0 h-11 !py-0 overflow-hidden">`
- **Fix options**:
  1. Replace `overflow-hidden` with `overflow-x-auto` and add horizontal scroll with subtle scroll indicators (fade gradients like mobile chips)
  2. Add a "More" dropdown button that collects overflow categories
  3. Dynamically measure available width and move excess items into an overflow menu
- **Recommended**: Option 2 (overflow menu) — more professional for desktop e-commerce

### 1.2 Layout Shift on Hover — 2px Content Jump
- [x] **File**: `components/shared/header/category-nav-client.tsx` (lines 105-108, 128-131, 82-85)
- **Problem**: Category buttons use `hover:border-b-2 hover:border-brand-accent/50` which adds a 2px border on hover. With `box-sizing: border-box`, this shrinks content area by 2px, causing a visible **jump/shift** of text and icons.
- **Fix**: Always render `border-b-2 border-transparent` on all buttons, and only change the border **color** on hover/active:
  ```tsx
  // Before (causes shift):
  "hover:border-b-2 hover:border-brand-accent/50"
  // After (no shift):
  "border-b-2 border-transparent hover:border-brand-accent/50"
  ```
- **Apply to**: All category buttons, "Αγορές ανά Μάρκα" button, quick links (New Arrivals, Deals)

### 1.3 Category Labels Invisible at md Breakpoint (768-1024px)
- [x] **File**: `components/shared/header/category-nav-client.tsx` (line 115)
- **Problem**: Category text uses `hidden lg:inline` — hidden until `lg` (1024px). But the category nav bar shows at `md` (768px). Between 768-1024px, users see **icons without any labels** — confusing navigation that looks broken.
- **Also affected**: ChevronDown icons (`hidden lg:block`, line 117), "New Arrivals" text (`hidden lg:inline`, line 153), "Deals" text (`hidden lg:inline`, line 163)
- **Fix options**:
  1. Change `hidden lg:inline` to `hidden md:inline` so text shows when nav bar appears
  2. Show abbreviated text on md (first word only) and full text on lg
  3. Use a different nav layout for md (simpler horizontal scroll with full labels)
- **Recommended**: Option 1 — show labels at same breakpoint as nav bar

### 1.4 Active State Border May Be Clipped
- [x] **File**: `components/shared/header/category-nav-client.tsx` (lines 84, 107)
- **Problem**: Active buttons have `border-b-2 border-brand-accent` (the amber bottom indicator). The wrapper has `overflow-hidden` and `h-11`. If the button's bottom border is at the absolute edge, `overflow-hidden` may partially clip the 2px border.
- **Fix**: Addressed by fixing 1.1 (remove `overflow-hidden`) and 1.2 (always have border-b-2)

---

## Phase 2: Interaction & UX Issues (Desktop)

### 2.1 No Keyboard Navigation for Category Mega Menu
- [x] **File**: `components/shared/header/category-nav-client.tsx` (lines 81-141)
- **Problem**: Category buttons only have `onMouseEnter`, `onMouseLeave`, and `onClick` handlers. No keyboard support:
  - No `onKeyDown` for Enter/Space to open menu
  - No Escape to close menu
  - No Arrow Left/Right to navigate between categories
  - No Tab trapping when mega menu is open
- **Fix**: Add keyboard event handlers:
  ```tsx
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(categoryId);
    }
    if (e.key === 'Escape') setActiveCategory(null);
  }}
  ```

### 2.2 No Exit Animation on Mega Menu
- [x] **File**: `components/shared/header/mega-menu.tsx` (line 114)
- **Problem**: Mega menu has `animate-mega-reveal` enter animation (0.2s slide + fade + clipPath) but **disappears instantly** when closing (conditional render unmounts it). This creates a jarring experience.
- **Fix options**:
  1. Use CSS exit animation with `data-state` attribute and `animation-fill-mode`
  2. Delay unmount by 150ms with exit transition
  3. Use Framer Motion's `AnimatePresence` for exit animations (already installed as dependency)
- **Recommended**: Option 1 (CSS-only) to keep bundle size minimal

### 2.3 Mega Menu Backdrop Too Subtle in Dark Mode
- [x] **File**: `components/shared/header/mega-menu.tsx` (line 112)
- **Problem**: Backdrop overlay uses `bg-black/20` (20% opacity black). In dark mode, the page is already dark, making the overlay nearly invisible. Users may not realize the mega menu has a clickable backdrop.
- **Fix**: Use a dynamic opacity: `bg-black/20 dark:bg-black/40` or use the semantic backdrop variable

### 2.4 No Focus Management in Mega Menu
- [x] **File**: `components/shared/header/mega-menu.tsx`
- **Problem**: When mega menu opens, focus stays on the trigger button. Users can Tab out of the mega menu into page content behind the backdrop.
- **Fix**: Auto-focus the first link in the mega menu when it opens, and trap focus within the menu panel

### 2.5 Hover Grace Period Inconsistency
- [x] **File**: `components/shared/header/category-nav-client.tsx` (lines 48-50, 68-71)
- **Problem**: Mouse leave from nav button = 300ms delay, but mouse leave from mega menu = 200ms delay. If a user leaves the button downward toward the mega menu, they have 300ms, but if they return upward from mega menu to nav, they only have 200ms.
- **Fix**: Use consistent delay (250ms for both) or increase mega menu leave to 300ms

---

## Phase 3: Accessibility Issues (Desktop)

### 3.1 Missing ARIA Attributes on Category Buttons
- [x] **File**: `components/shared/header/category-nav-client.tsx` (lines 81-141)
- **Problem**: Category trigger buttons lack:
  - `aria-expanded={isActive}` to indicate menu state
  - `aria-haspopup="menu"` to indicate dropdown behavior
  - `aria-controls` pointing to mega menu panel id
- **Fix**: Add attributes to each category button:
  ```tsx
  <button
    aria-expanded={activeCategory === categoryId}
    aria-haspopup="menu"
    ...
  >
  ```

### 3.2 Icon-Only Buttons Missing Accessible Names
- [x] **Files**:
  - `components/shared/header/menu.tsx` — Heart/Wishlist icon (line ~19): Missing `aria-label`
  - `components/shared/header/menu.tsx` — Cart icon (line ~25): Missing `aria-label`
  - `components/shared/header/user-button.tsx` — User avatar button: Missing `aria-label`
  - `components/shared/header/mode-toggle.tsx` — Theme toggle: Missing `aria-label`
  - `components/shared/header/search-autocomplete.tsx` — Search submit button: Missing `aria-label`
- **Fix**: Add `aria-label` to each:
  ```tsx
  <Link href="/wishlist" aria-label="Wishlist">
  <Link href="/cart" aria-label="Cart">
  ```

### 3.3 Missing Menu Roles on Mega Menu Items
- [x] **File**: `components/shared/header/mega-menu.tsx`
- **Problem**: Mega menu links don't have `role="menuitem"` and the mega menu container doesn't have `role="menu"`
- **Fix**: Add roles to the menu panel and individual links

---

## Phase 4: Desktop Layout Issues

### 4.1 No 2xl Responsive Design — Wasted Space on Large Screens
- [x] **Files**: `components/shared/header/index.tsx`, `category-nav-client.tsx`, `mega-menu.tsx`
- **Problem**: All header elements max out at `max-w-7xl` (1280px). On 1920px+ screens, significant whitespace on both sides. The `2xl:` Tailwind breakpoint is never used anywhere in the codebase.
- **Fix**: Consider upgrading wrapper to `max-w-[1440px]` for header, or use `2xl:max-w-[1440px]` responsive variant. The `wrapper-wide` class already exists in globals.css but is unused.

### 4.2 Search Bar Too Narrow on Large Screens
- [x] **File**: `components/shared/header/index.tsx` (line ~41)
- **Problem**: Search bar container has `max-w-2xl` (672px). On 1920px+ screens, the search bar looks small and underutilized compared to available space.
- **Fix**: Increase to `max-w-3xl` or use responsive: `max-w-2xl xl:max-w-3xl 2xl:max-w-4xl`

### 4.3 Category Name Truncation Too Aggressive
- [x] **File**: `components/shared/header/category-nav-client.tsx` (line 115)
- **Problem**: Category names truncated at `max-w-[140px] xl:max-w-[180px]`. Greek names like "Εξαρτήματα Σωληνώσεων" are often cut off mid-word.
- **Fix**: Increase limits: `max-w-[180px] xl:max-w-[220px]` or `2xl:max-w-[260px]`. Consider tooltip on truncated text.

### 4.4 Separator Dividers Hard to See
- [x] **File**: `components/shared/header/category-nav-client.tsx` (lines 96, 126)
- **Problem**: Dividers use `bg-primary-foreground/10` (10% opacity) — barely visible between category groups
- **Fix**: Increase to `bg-primary-foreground/20` or `bg-primary-foreground/15`

---

## Phase 5: Minor Desktop Issues

### 5.1 Search Dropdown z-index Conflict with Mega Menu
- [x] **Files**: `components/shared/header/search-dropdown.tsx` (line 44), `mega-menu.tsx` (line 114)
- **Problem**: Both search dropdown and mega menu use `z-50`. If both are somehow open simultaneously (edge case), they would overlap.
- **Fix**: Ensure mutual exclusivity (close mega menu when search focuses, and vice versa), or differentiate z-index values

### 5.2 Utility Bar Contrast Issues in Dark Mode
- [x] **File**: `components/shared/header/utility-bar.tsx`
- **Problem**: Some utility bar elements use opacity-based text (e.g., `opacity-40`) which may have poor contrast in dark mode
- **Fix**: Use semantic color tokens instead of opacity for text colors

### 5.3 Mobile Menu Shows Fewer Brands Than Desktop
- [x] **Files**: `components/shared/header/mobile-menu-wrapper.tsx` (line 25: 10 brands), `category-nav-bar.tsx` (line 25: 15 brands)
- **Problem**: Mobile menu shows top 10 brands, desktop shows top 15 — inconsistent experience
- **Fix**: Use consistent count (15) or make it configurable

### 5.4 setTimeout in useEffect Without Cleanup
- [x] **File**: `components/shared/header/mobile-menu.tsx` (lines 79-85)
- **Problem**: `setTimeout(() => searchInputRef.current?.focus(), 300)` in useEffect has no cleanup — could cause memory leak if component unmounts during timeout
- **Fix**: Store timeout ref and clear on cleanup:
  ```tsx
  useEffect(() => {
    const timer = setTimeout(...);
    return () => clearTimeout(timer);
  }, [open]);
  ```

### 5.5 Manual Index Tracking in SearchDropdown
- [x] **File**: `components/shared/header/search-dropdown.tsx` (lines 39, 66-67)
- **Problem**: Uses mutable `itemIndex++` variable during render for keyboard navigation. This is an anti-pattern that can cause hydration mismatches.
- **Fix**: Pre-calculate item indices with `useMemo` or restructure the data before rendering

---

## Files Reference

| File | Issues |
|------|--------|
| `components/shared/header/category-nav-client.tsx` | 1.1, 1.2, 1.3, 1.4, 2.1, 2.5, 3.1, 4.3, 4.4 |
| `components/shared/header/mega-menu.tsx` | 2.2, 2.3, 2.4, 3.3, 5.1 |
| `components/shared/header/menu.tsx` | 3.2 |
| `components/shared/header/user-button.tsx` | 3.2 |
| `components/shared/header/mode-toggle.tsx` | 3.2 |
| `components/shared/header/search-autocomplete.tsx` | 3.2 |
| `components/shared/header/index.tsx` | 4.1, 4.2 |
| `components/shared/header/search-dropdown.tsx` | 5.1, 5.5 |
| `components/shared/header/utility-bar.tsx` | 5.2 |
| `components/shared/header/mobile-menu.tsx` | 5.4 |
| `components/shared/header/mobile-menu-wrapper.tsx` | 5.3 |
| `components/shared/header/category-nav-bar.tsx` | 5.3 |
