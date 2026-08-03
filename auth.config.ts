import type { NextAuthConfig } from "next-auth";

// No `authorized` callback here on purpose. It only runs when NextAuth is
// composed as the middleware (`export { auth as middleware }`), and proxy.ts
// runs the next-intl middleware instead — so a route list here would enforce
// nothing while looking like it did. Access control lives at the page/layout
// and server-action layer: requireAdmin/requireUserId/assertAdmin.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // refresh JWT once per day on activity
  },
  providers: [],
  callbacks: {},
};
