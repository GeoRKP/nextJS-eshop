import NextAuth from "next-auth";
import { prisma } from "./db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts";
import { authConfig } from "./auth.config";
import { verifyGuestToken } from "./lib/guest-token";

// Refresh ban/suspension status from DB at most once per this interval
const BAN_SYNC_INTERVAL_MS = 60 * 1000; // 60 seconds

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) {
          return null;
        }
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string, deletedAt: null },
        });

        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          if (isMatch) {
            // Banned / actively suspended users cannot establish a session.
            // We treat this as a failed login (return null) — proxy + layout
            // also enforce the ban for users with already-issued sessions.
            if (user.isBanned) return null;
            if (user.suspendedUntil && user.suspendedUntil > new Date()) {
              return null;
            }

            // Generate name from email if user has default "NO_NAME"
            let name = user.name;
            if (name === "NO_NAME") {
              name = user.email.split("@")[0];
              await prisma.user.update({
                where: { id: user.id },
                data: { name },
              });
            }

            return {
              id: user.id,
              email: user.email,
              name,
              role: user.role,
              isGuest: user.isGuest,
            };
          }
        }
        return null;
      },
    }),
    // Guest checkout: sessions for shadow accounts are minted exclusively via a
    // short-lived HMAC token issued server-side by `continueAsGuest` — guests
    // have no password, so the normal credentials flow can never sign them in.
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {
        token: { type: "text" },
      },
      async authorize(credentials) {
        const userId = verifyGuestToken(credentials?.token as string | undefined);
        if (!userId) return null;

        const user = await prisma.user.findFirst({
          where: { id: userId, isGuest: true, deletedAt: null },
        });
        if (!user) return null;
        if (user.isBanned) return null;
        if (user.suspendedUntil && user.suspendedUntil > new Date()) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isGuest: true,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // SECURITY: prevent open redirect attacks via callbackUrl.
    // Reject any redirect to a different origin than our own.
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Same-origin relative paths are safe
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // malformed URL — fall through
      }
      return baseUrl;
    },
    async session({ session, user, trigger, token }: any) {
      session.user.id = token.sub as string;
      session.user.role = token.role as string;
      session.user.name = token.name as string;
      session.user.isGuest = Boolean(token.isGuest);
      session.user.isBanned = Boolean(token.isBanned);
      session.user.suspendedUntil = (token.suspendedUntil as string | null) ?? null;
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
    async jwt({ token, user, session, trigger }: any) {
      if (user) {
        token.role = user.role;
        token.isGuest = Boolean((user as { isGuest?: boolean }).isGuest);
        token.isBanned = false;
        token.suspendedUntil = null;
        token.banSyncedAt = Date.now();
      }

      // Periodically refresh ban/suspension status from DB so admin actions
      // take effect within BAN_SYNC_INTERVAL_MS without invalidating the JWT.
      const lastSync = (token.banSyncedAt as number | undefined) ?? 0;
      const isStale = Date.now() - lastSync > BAN_SYNC_INTERVAL_MS;
      if (token.sub && (trigger === "update" || isStale)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub as string },
            select: { isBanned: true, suspendedUntil: true, role: true, isGuest: true },
          });
          if (dbUser) {
            token.isBanned = dbUser.isBanned;
            token.suspendedUntil = dbUser.suspendedUntil
              ? dbUser.suspendedUntil.toISOString()
              : null;
            token.role = dbUser.role;
            token.isGuest = dbUser.isGuest;
            token.banSyncedAt = Date.now();
          }
        } catch {
          // Fail open — DB hiccup must not lock everyone out.
        }
      }

      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token;
    },
  },
});
