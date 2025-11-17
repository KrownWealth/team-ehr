import "./globals.css";
import { Inter, Manrope } from "next/font/google";
import { cn, ThemeProvider } from "@/lib";
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { ReactQueryProvider } from "./provider";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { Toaster } from "@/components/ui/sonner";

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

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-linear-to-br from-white via-green-50 to-green-100 antialiased",
          inter.className,
          manrope.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="light"
        >
          <ReactQueryProvider>
            <NextTopLoader
              color="#012201"
              showSpinner={false}
              easing="ease"
              height={3}
            />
            <main className="min-h-screen bg-linear-to-br from-white via-green-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
              {children}
            </main>
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
