import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/contexts/sidebarContext";
import { AppSidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { authOptions } from "@/lib/auth/auth";
import React from "react";
import { SessionProvider } from "@/providers/sessionProvider";
import { ScrollShadow } from "@heroui/react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.firstLogin) {
    redirect("/auth/change-password?reason=first-login");
  } else if (session.user.passwordResetRequired) {
    redirect("/auth/change-password?reason=password-reset");
  }

  return (
    <SessionProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header />
            <ScrollShadow hideScrollBar>
              <div className="flex-1 flex justify-center overflow-y-auto px-6 py-8 pb-10">
                {children}
              </div>
            </ScrollShadow>
          </div>
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}
