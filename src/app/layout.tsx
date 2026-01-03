import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import VisitorTracker from "@/components/visitor-tracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PayPerRead - Premium Content Monetization",
  description: "Monetize your written content and PDFs through timed, pay-per-session reading experiences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <VisitorTracker />
        </ThemeProvider>
        <TempoInit />
      </body>
    </html>
  );
}
