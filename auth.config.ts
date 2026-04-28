import type { NextAuthConfig } from "next-auth";
import { PROTECTED_PATHS } from "@/lib/constants";

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
  callbacks: {
    authorized({ request, auth }: any) {
      const { pathname } = request.nextUrl;

      if (!auth && PROTECTED_PATHS.some((p) => p.test(pathname))) return false;

      return true;
    },
  },
};
