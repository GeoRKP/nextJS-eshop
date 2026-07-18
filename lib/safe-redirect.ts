/**
 * Sanitize a user-supplied callbackUrl to prevent open-redirect attacks.
 * Only same-origin relative paths are allowed: the value must start with a
 * single "/" and not "//" (protocol-relative) or "/\" (which some browsers
 * treat as a scheme-relative URL). Anything else falls back to the home page.
 */
export function safeCallbackUrl(
  callbackUrl: string | undefined | null,
  fallback = "/"
): string {
  if (!callbackUrl) return fallback;
  if (!callbackUrl.startsWith("/")) return fallback;
  if (callbackUrl.startsWith("//") || callbackUrl.startsWith("/\\")) {
    return fallback;
  }
  return callbackUrl;
}
