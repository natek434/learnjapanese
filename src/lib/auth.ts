import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig, Session } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  mode: z.enum(["login", "register"]).default("login")
});

export type SessionUser = NonNullable<Session["user"]>;
export type AppSession = Session;

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/sign-in"
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        mode: { label: "Mode", type: "hidden" }
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw ?? {});
        if (!parsed.success) {
          throw new Error(parsed.error.flatten().formErrors.join("\n"));
        }
        const { email, password, name, mode } = parsed.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (mode === "register") {
          if (existingUser) {
            throw new Error("An account with that email already exists.");
          }
          if (!name) {
            throw new Error("Please provide a display name.");
          }
          const passwordHash = await hash(password, 10);
          const user = await prisma.user.create({
            data: {
              email,
              name,
              passwordHash,
              settings: {
                create: {}
              }
            }
          });
          return user;
        }

        if (!existingUser || !existingUser.passwordHash) {
          throw new Error("Invalid email or password.");
        }

        const passwordMatches = await compare(password, existingUser.passwordHash);
        if (!passwordMatches) {
          throw new Error("Invalid email or password.");
        }

        return existingUser;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = (token.picture as string | null | undefined) ?? session.user.image;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.picture = user.image ?? token.picture;
      }
      return token;
    }
  }
};

const { auth: authFn, signIn, signOut, handlers } = NextAuth(authOptions);

export const auth = authFn;
export { signIn, signOut };
export const { GET, POST } = handlers;
