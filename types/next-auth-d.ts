import { DefaultSession } from "next-auth";

declare module "next-auth" {
  export interface Session extends DefaultSession {
    user: {
      role: string;
      isBanned?: boolean;
      suspendedUntil?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    isBanned?: boolean;
    suspendedUntil?: string | null;
    banSyncedAt?: number;
  }
}
