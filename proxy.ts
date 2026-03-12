import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(req: NextRequest) {
  // Run intl middleware (auth is handled by NextAuth's authorized callback in auth.config.ts)
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
