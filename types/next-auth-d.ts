import { DefaultSession } from "next-auth";

declare module "next-auth" {
  export interface Session extends DefaultSession {
    user: {
      role: string;
    } & DefaultSession["user"];
  }
}
