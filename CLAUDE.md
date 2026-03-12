# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (Turbopack default in Next.js 16)
npm run build        # Production build (Turbopack)
npm start            # Start production server
npm run lint         # ESLint 9 (flat config, eslint.config.mjs)
npx jest             # Run all tests
npx jest --watch     # Run tests in watch mode
npx jest path/to/test.ts  # Run a single test file
npx prisma generate  # Regenerate Prisma client (runs automatically on postinstall)
npx prisma db push   # Push schema changes to database
```

## Tech Stack

- **Next.js 16** (App Router, Turbopack) with **React 19.2** and **TypeScript** (strict mode)
- **Prisma 6** ORM with **Neon serverless PostgreSQL** (WebSocket adapter)
- **NextAuth.js v5** (beta.30) — JWT sessions, Credentials provider, bcrypt-ts
- **next-intl v4** — i18n with Greek (el, default) and English (en)
- **Tailwind CSS** with **shadcn/ui** (Radix UI primitives)
- **Zod v4** for validation (v3 compat mode), **react-hook-form** for forms
- **Stripe** + **PayPal** for payments, **UploadThing** for file uploads
- **ESLint 9** with flat config (`eslint.config.mjs`)
- **recharts** for admin analytics charts

## Architecture

### Route Structure

Routes are localized under `app/[locale]/` using next-intl. The default locale (el) has no URL prefix (`localePrefix: "as-needed"`).

```
app/[locale]/
├── (auth)/           # sign-in, sign-up (public)
├── (root)/           # main storefront pages
│   ├── cart/, product/[slug], search, shipping-address, payment-method, place-order, order/[id]
│   ├── user/         # authenticated user pages (orders, profile)
│   └── admin/        # admin dashboard (overview, products, orders, users)
└── api/              # API routes (auth, webhooks/stripe, uploadthing, search/suggestions, sitemap)
```

Route groups `(auth)` and `(root)` share different layouts. Admin routes are protected with `requireAdmin()` from `lib/auth-guard.ts`.

### Server Actions

All server actions live in `lib/actions/` and follow this pattern:

- Marked with `"use server"`
- Validate input with Zod schemas
- Use `getTranslations()` for localized error/success messages
- Return `{ success: boolean, message: string, data?: T }`
- Call `revalidatePath()` and `revalidateTag(tag, "max")` for cache invalidation
- Errors wrapped with `formatError()` from `lib/utils`

Files: `cart.actions.ts`, `product.actions.ts`, `order.actions.ts`, `user.actions.ts`, `review-actions.ts`

### Client Component Pattern

Client components use `useTransition()` for pending states when calling server actions, `useToast()` for notifications, and `useTranslations()` for i18n. Forms use react-hook-form with `zodResolver`.

### Validation (lib/validators.ts)

Zod schemas are defined as factory functions that accept a translation function `t` for localized validation messages. Types are inferred from schemas with `z.infer<>`.

### i18n

- Translation files: `messages/el.json`, `messages/en.json`
- Routing config: `i18n/routing.ts` (locales, default locale, prefix strategy)
- Request config: `i18n/request.ts` (message loading)
- Server: `getTranslations("Namespace")` — Client: `useTranslations("Namespace")`

### Database

- Schema: `prisma/schema.prisma` with PostgreSQL + Neon adapter
- UUIDs for primary keys (`gen_random_uuid()`)
- Prices use `Decimal(12, 2)` — Prisma result extensions convert Decimals to strings for JSON serialization
- Prisma client singleton in `db/prisma.ts` with custom result transformers
- Key models: User, Product, Cart, Order, OrderItem, Review

### Proxy (proxy.ts)

Renamed from `middleware.ts` in Next.js 16 migration. Composes next-intl middleware with NextAuth. Sets `sessionCartId` cookie (UUID) for guest cart tracking. Runs on Node.js runtime (not edge).

### Components

- `components/ui/` — shadcn/ui primitives (do not edit manually; use `npx shadcn@latest add`)
- `components/shared/` — reusable components (header, product cards, pagination, checkout steps)
- `components/admin/` — admin-specific components (product form, search, user form)
- `cn()` utility for Tailwind class merging (clsx + tailwind-merge)

### Path Aliases

`@/*` maps to the project root in tsconfig.json. All imports use this alias.
