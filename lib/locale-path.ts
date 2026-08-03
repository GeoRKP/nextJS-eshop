// Locale-aware path building for server components.
//
// `redirect()` takes a raw path, so redirecting to "/sign-in" from
// /en/payment-method dropped the visitor onto the Greek page — and the
// callbackUrl then sent them back to the Greek step. Run paths through this
// first (a no-op on the default locale, which has no prefix):
//
//   redirect(await localePath("/sign-in", { callbackUrl: "/payment-method" }))
//
// Deliberately returns a string rather than redirecting itself: TypeScript only
// narrows control flow on a *synchronous* never-returning call, so an
// `await redirectHelper()` would leave the code after it looking reachable.
import { getLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";

export async function localePath(
  pathname: string,
  options?: { callbackUrl?: string }
): Promise<string> {
  const locale = await getLocale();

  const query = options?.callbackUrl
    ? {
        callbackUrl: getPathname({ href: options.callbackUrl, locale }),
      }
    : undefined;

  return getPathname({
    href: query ? { pathname, query } : pathname,
    locale,
  });
}
