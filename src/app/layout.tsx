import type { Metadata } from "next";
import { Manrope, Space_Grotesk, Geist } from "next/font/google";

import { SessionProvider } from "@/components/providers/session-provider";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "AI-Based Tuition Media",
  description:
    "A smart tutor and guardian matching platform built with Next.js, Express, PostgreSQL, Prisma, JWT, and NextAuth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} bg-background text-foreground antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
