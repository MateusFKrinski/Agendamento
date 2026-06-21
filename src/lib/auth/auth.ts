import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth/permissions";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  trustHost: true,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user || user.deletedAt) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.hashPassword,
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          firstLogin: user.firstLogin,
          passwordResetRequired: user.passwordResetRequired,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.firstLogin = user.firstLogin;
        token.passwordResetRequired = user.passwordResetRequired;

        if (!user.isAdmin) {
          const perms = await getUserPermissions(user.id);
          token.permissions = [...perms];
        }
      }

      if (trigger === "update" && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            isAdmin: true,
            firstLogin: true,
            passwordResetRequired: true,
            deletedAt: true,
          },
        });

        if (!freshUser || freshUser.deletedAt) {
          throw new Error("Usuário não encontrado");
        }

        token.isAdmin = freshUser.isAdmin;
        token.firstLogin = freshUser.firstLogin;
        token.passwordResetRequired = freshUser.passwordResetRequired;

        if (!freshUser.isAdmin) {
          const perms = await getUserPermissions(token.id as string);
          token.permissions = [...perms];
        } else {
          token.permissions = [];
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.isAdmin = token.isAdmin as boolean;
      session.user.firstLogin = token.firstLogin as boolean;
      session.user.passwordResetRequired =
        token.passwordResetRequired as boolean;
      session.user.permissions = token.permissions as string[] | undefined;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};
