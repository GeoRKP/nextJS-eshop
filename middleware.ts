import createIntlMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedPaths = [
  /^(?:\/en)?\/shipping-address/,
  /^(?:\/en)?\/payment-method/,
  /^(?:\/en)?\/place-order/,
  /^(?:\/en)?\/profile/,
  /^(?:\/en)?\/user\/(.*)/,
  /^(?:\/en)?\/order\/(.*)/,
  /^(?:\/en)?\/admin/,
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check auth for protected routes
  if (protectedPaths.some((p) => p.test(pathname))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Run intl middleware
  const response = intlMiddleware(req);

  // Set sessionCartId cookie if not present
  if (!req.cookies.get("sessionCartId")) {
    const sessionCartId = crypto.randomUUID();
    response.cookies.set("sessionCartId", sessionCartId);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
