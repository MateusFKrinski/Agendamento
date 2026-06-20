import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { Toast } from "@heroui/react";
import { ThemeProvider } from "@/providers/themeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agendamento",
  description: "Sistema de agendamento de consultas externas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Toast.Provider placement="top" />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
