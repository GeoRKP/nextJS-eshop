import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Skip ban-redirect on these paths so blocked users can still see /blocked,
// reach auth flows (sign-out via menu lives under /api/auth, already excluded
// by matcher), and not get stuck in a redirect loop.
const SKIP_BAN_REDIRECT = [
  /^(?:\/en)?\/blocked\/?$/,
  /^(?:\/en)?\/sign-in/,
  /^(?:\/en)?\/sign-up/,
  /^(?:\/en)?\/forgot-password/,
  /^(?:\/en)?\/reset-password/,
];

function buildBlockedUrl(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = req.nextUrl.pathname.startsWith("/en") ? "/en/blocked" : "/blocked";
  url.search = "";
  return url;
}

export default async function proxy(req: NextRequest) {
  // Run intl middleware (auth is handled by NextAuth's authorized callback in auth.config.ts)
  const response = intlMiddleware(req);

  // Set sessionCartId cookie if not present
  if (!req.cookies.get("sessionCartId")) {
    const sessionCartId = crypto.randomUUID();
    response.cookies.set("sessionCartId", sessionCartId);
  }

  // Expose pathname to layouts/server components via header so they can
  // implement context-aware checks (e.g. avoid redirect loops on /blocked).
  response.headers.set("x-pathname", req.nextUrl.pathname);

  // Banned / suspended user redirect — applies to all matched paths except
  // those listed in SKIP_BAN_REDIRECT.
  const { pathname } = req.nextUrl;
  if (!SKIP_BAN_REDIRECT.some((re) => re.test(pathname))) {
    try {
      const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      });
      if (token) {
        const isSuspended =
          token.suspendedUntil &&
          new Date(token.suspendedUntil as string) > new Date();
        if (token.isBanned || isSuspended) {
          return NextResponse.redirect(buildBlockedUrl(req));
        }
      }
    } catch {
      // Fail open — token decode errors must not lock everyone out.
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
