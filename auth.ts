import NextAuth from "next-auth";
import { prisma } from "./db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) {
          return null;
        }
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        });

        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          if (isMatch) {
            // Generate name from email if user has default "NO_NAME"
            let name = user.name;
            if (name === "NO_NAME") {
              name = user.email.split("@")[0];
              await prisma.user.update({
                where: { id: user.id },
                data: { name },
              });
            }

            return {
              id: user.id,
              email: user.email,
              name,
              role: user.role,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // SECURITY: prevent open redirect attacks via callbackUrl.
    // Reject any redirect to a different origin than our own.
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Same-origin relative paths are safe
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // malformed URL — fall through
      }
      return baseUrl;
    },
    async session({ session, user, trigger, token }: any) {
      session.user.id = token.sub as string;
      session.user.role = token.role as string;
      session.user.name = token.name as string;
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
    async jwt({ token, user, session, trigger }: any) {
      if (user) {
        token.role = user.role;
      }

      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token;
    },
  },
});
