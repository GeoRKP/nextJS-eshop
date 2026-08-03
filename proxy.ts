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

const ADMIN_PATH = /^(?:\/en)?\/admin(?:\/|$)/;

function buildBlockedUrl(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = req.nextUrl.pathname.startsWith("/en") ? "/en/blocked" : "/blocked";
  url.search = "";
  return url;
}

function buildUnauthorizedUrl(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = req.nextUrl.pathname.startsWith("/en")
    ? "/en/unauthorized"
    : "/unauthorized";
  url.search = "";
  return url;
}

export default async function proxy(req: NextRequest) {
  // Run intl middleware. This is NOT wrapped in NextAuth's middleware, so no
  // `authorized` callback runs here — the only auth this layer does is the
  // ban redirect below. Route protection is enforced per page/action.
  const response = intlMiddleware(req);

  // Set sessionCartId cookie if not present. Only read server-side (never by
  // client JS), so lock it down: httpOnly + sameSite + secure in production.
  if (!req.cookies.get("sessionCartId")) {
    const sessionCartId = crypto.randomUUID();
    response.cookies.set("sessionCartId", sessionCartId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
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

      // Cheap first line for the admin subtree, so an unauthorized request is
      // turned away before any page code runs. NOT the authoritative check:
      // this reads the role off the JWT cookie, which only refreshes on the
      // jwt callback's schedule, and middleware is the wrong place to be the
      // last word on authorization. requireAdmin() in each page/layout and
      // assertAdmin() in each action remain the enforcing layer.
      if (ADMIN_PATH.test(pathname) && token?.role !== "admin") {
        return NextResponse.redirect(buildUnauthorizedUrl(req));
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
