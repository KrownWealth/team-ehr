import "./globals.css";
import { cn, ThemeProvider } from "@/lib";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { ReactQueryProvider } from "./provider";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: "#012201",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <NextTopLoader
              color="#012201"
              showSpinner={false}
              easing="ease"
              height={3}
            />
            {children}
          </ReactQueryProvider>

          <Toaster
            position="top-right"
            expand={false}
            richColors
            duration={4000}
          />

          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
          {process.env.NEXT_PUBLIC_GTM_ID && (
            <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
