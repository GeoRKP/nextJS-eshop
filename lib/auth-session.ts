import { cache } from "react";
import { auth } from "@/auth";

// Request-level deduplication of auth() calls using React cache()
// Multiple calls to getAuthSession() within the same request will only
// decrypt the JWT once.
export const getAuthSession = cache(async () => await auth());
