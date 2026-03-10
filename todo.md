# Mobile Homepage UI Bugs — Fix Guide

> 3 bugs to fix. Each section contains: the problem, exact file/line, current code, and the fix.

---

## Bug 1: Pagination Badge "01 / 04" Overlaps the "ΛΕΠΤΟΜΕΡΕΙΕΣ" Button Border

### Problem
The slide counter ("01 / 04") in the bottom-right of the hero carousel sits at `bottom-6` (24px from section bottom). The CTA buttons ("ΑΓΟΡΑΣΤΕ ΤΩΡΑ" + "ΛΕΠΤΟΜΕΡΕΙΕΣ") are inside a container with `pb-24` (96px padding-bottom). On mobile (h-[400px]), the buttons stack vertically (`flex-col`) making them taller, and the counter badge overlaps the bottom border of the "ΛΕΠΤΟΜΕΡΕΙΕΣ" button.

### File
`components/shared/hero-carousel.tsx`

### Current Code — Slide counter (lines 176-185)
```tsx
{/* Slide counter — bottom right */}
{total > 1 && (
  <div className="absolute bottom-6 right-5 md:right-10 text-white/60 text-sm font-heading tracking-wider">
    <span className="text-white font-bold">
      {String(current + 1).padStart(2, "0")}
    </span>
    {" / "}
    {String(total).padStart(2, "0")}
  </div>
)}
```

### Current Code — Slide indicators (lines 158-173)
```tsx
<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 min-h-[44px]">
```

### Current Code — Content container (line 98)
```tsx
<div className="relative h-full wrapper flex flex-col justify-end pb-24 md:pb-24">
```

### Fix
Move the slide counter and slide indicators DOWN to avoid overlapping the CTA buttons on mobile:
- Line 160: change `bottom-6` → `bottom-2 md:bottom-6`
- Line 178: change `bottom-6` → `bottom-2 md:bottom-6`

This pushes them to 8px from bottom on mobile (clear of the buttons) while keeping 24px on desktop.

---

## Bug 2: Bottom Nav Search Button Not Vertically Centered

### Problem
The floating orange search button (56px circle) in the mobile bottom navigation uses `-mt-5` (20px negative margin) to rise above the nav bar. It doesn't sit symmetrically elevated — it's too close to the nav bar baseline compared to where it should float.

### File
`components/shared/header/mobile-bottom-nav.tsx`

### Current Code (lines 64-75)
```tsx
if (tab.action && "isCenter" in tab && tab.isCenter) {
  return (
    <button
      key={tab.key}
      onClick={tab.action}
      className="flex flex-col items-center justify-center"
    >
      <div className="bg-brand-accent text-white rounded-full h-14 w-14 flex items-center justify-center -mt-5 ring-4 ring-background shadow-card-glow hover:bg-brand-accent-dark transition-colors">
        <Icon className="h-[22px] w-[22px]" />
      </div>
    </button>
  );
}
```

### Context
- Nav bar height: `h-[68px]` (line 59)
- Button size: `h-14 w-14` (56px)
- Current offset: `-mt-5` (20px up = 1.25rem)

### Fix
- Line 71: change `-mt-5` → `-mt-7` (28px up = 1.75rem)

This raises the button higher so its center sits roughly at the top edge of the nav bar, making it symmetrically elevated.

---

## Bug 3: Features Grid ("ΔΩΡΕΑΝ ΑΠΟΣΤΟΛΗ" κλπ.) Overlaps the Hero Carousel

### Problem
The ValuePropositions section uses `-mt-8 md:-mt-10` (negative top margin) which pulls it UP by 32-40px to deliberately overlap the hero carousel. On mobile (where carousel is only 400px tall) this creates an ugly overlap where the features card covers part of the carousel's bottom content area and indicators.

### File
`components/shared/value-propositions.tsx`

### Current Code (line 11)
```tsx
<section className="relative z-10 -mt-8 md:-mt-10">
```

### Context
- Hero carousel heights: `h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]`
- The hero section is `<section className="relative w-full">` (hero-carousel.tsx line 65)
- Carousel has absolute indicators at `bottom-6` (or `bottom-2` after Bug 1 fix)
- The `.wrapper` class adds `py-5` (20px vertical padding)

### Fix
- Line 11: change `className="relative z-10 -mt-8 md:-mt-10"` → `className="relative z-10 mt-6 md:mt-8"`

This removes the negative margin entirely and adds positive spacing (24px mobile, 32px desktop) so the features section sits clearly BELOW the carousel in normal document flow.

---

## Files Summary

| Bug | File | Lines to Change |
|-----|------|-----------------|
| 1 — Pagination badge overlap | `components/shared/hero-carousel.tsx` | 160, 178 |
| 2 — Search button centering | `components/shared/header/mobile-bottom-nav.tsx` | 71 |
| 3 — Features overlapping carousel | `components/shared/value-propositions.tsx` | 11 |

## Testing Checklist
After fixing, verify on mobile viewport (375px width):
- [x] Slide counter "01 / 04" does NOT overlap the "ΛΕΠΤΟΜΕΡΕΙΕΣ" button
- [x] Slide indicator pills are visible and not overlapping buttons
- [x] Orange search button in bottom nav is symmetrically elevated above the nav bar
- [x] Features card sits clearly below the hero carousel with visible gap
- [x] No layout shift or overflow on any viewport from 320px to 768px
- [x] Desktop (1024px+) layout is not negatively affected by any changes
