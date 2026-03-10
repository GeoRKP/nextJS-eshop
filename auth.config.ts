import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [],
  callbacks: {
    authorized({ request, auth }: any) {
      const protectedPaths = [
        /^(?:\/en)?\/shipping-address/,
        /^(?:\/en)?\/payment-method/,
        /^(?:\/en)?\/place-order/,
        /^(?:\/en)?\/profile/,
        /^(?:\/en)?\/user\/(.*)/,
        /^(?:\/en)?\/order\/(.*)/,
        /^(?:\/en)?\/admin/,
      ];

      const { pathname } = request.nextUrl;

      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      return true;
    },
  },
};
