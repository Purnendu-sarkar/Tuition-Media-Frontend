import NextAuth, { type DefaultSession } from "next-auth";
import type { JWT } from "@auth/core/jwt";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { serverEnv } from "@/lib/server-env";

const credentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: DefaultSession["user"] & {
      id: string;
      role: "TUTOR" | "GUARDIAN" | "ADMIN";
    };
  }

  interface User {
    accessToken?: string;
    role?: "TUTOR" | "GUARDIAN" | "ADMIN";
  }
}

type SessionToken = JWT & {
  accessToken?: string;
  id?: string;
  role?: "TUTOR" | "GUARDIAN" | "ADMIN";
};

const providers: Provider[] = [
  Credentials({
    name: "Email login",
    credentials: {
      email: {
        label: "Email",
        type: "email",
      },
      password: {
        label: "Password",
        type: "password",
      },
    },
    async authorize(credentials) {
      const parsedCredentials = credentialSchema.safeParse(credentials);

      if (!parsedCredentials.success) {
        return null;
      }

      const response = await fetch(`${serverEnv.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedCredentials.data),
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        data: {
          accessToken: string;
          user: {
            id: string;
            name: string;
            email: string;
            role: "TUTOR" | "GUARDIAN" | "ADMIN";
            image: string | null;
          };
        };
      };

      return {
        id: payload.data.user.id,
        name: payload.data.user.name,
        email: payload.data.user.email,
        image: payload.data.user.image,
        role: payload.data.user.role,
        accessToken: payload.data.accessToken,
      };
    },
  }),
];

if (serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: serverEnv.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers,
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isAuthenticated = Boolean(session?.user);
      const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isAuthRoute =
        nextUrl.pathname.startsWith("/signin") || nextUrl.pathname.startsWith("/signup");

      if (isDashboardRoute || isAdminRoute) {
        return isAuthenticated;
      }

      if (isAuthRoute && isAuthenticated) {
        if (session?.user?.role === "ADMIN") {
          return Response.redirect(new URL("/admin/dashboard", nextUrl));
        }
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user, account }) {
      const sessionToken = token as SessionToken;

      if (user) {
        sessionToken.id = user.id;
        sessionToken.role = user.role ?? "TUTOR";
        sessionToken.accessToken = user.accessToken;
      }

      if (account?.provider === "google" && !sessionToken.role) {
        sessionToken.role = "TUTOR";
      }

      return sessionToken;
    },
    session({ session, token }) {
      const sessionToken = token as SessionToken;

      if (session.user) {
        session.user.id = sessionToken.id ?? "";
        session.user.role = sessionToken.role ?? "TUTOR";
      }

      session.accessToken = sessionToken.accessToken;
      return session;
    },
  },
});
