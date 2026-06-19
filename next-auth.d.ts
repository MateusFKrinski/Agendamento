import "src/next-auth";
import "next-auth/jwt";

declare module "src/next-auth" {
  interface User {
    id: string;
    isAdmin: boolean;
    firstLogin: boolean;
    passwordResetRequired: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      isAdmin: boolean;
      firstLogin: boolean;
      passwordResetRequired: boolean;
      permissions?: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
    firstLogin: boolean;
    passwordResetRequired: boolean;
    permissions?: string[];
  }
}
