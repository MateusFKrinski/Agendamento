import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      firstLogin: boolean;
      passwordResetRequired: boolean;
      permissions?: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    isAdmin: boolean;
    firstLogin: boolean;
    passwordResetRequired: boolean;
  }
}
