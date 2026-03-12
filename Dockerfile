FROM node:20-alpine AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install --legacy-peer-deps

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .env.production .env.production
RUN npx prisma generate
ENV NODE_ENV=production
RUN npm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p .next/cache && chown nextjs:nodejs .next/cache
RUN mkdir -p uploads && chown nextjs:nodejs uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
