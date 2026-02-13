import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SupabaseProvider } from "@/components/supabase-provider"
import { SettingsProvider } from "@/contexts/settings-context"
import { Toaster } from "@/components/ui/toaster"
import { SkipLink } from "@/components/shared/SkipLink"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: {
    default: "EduSphere AI - AI-Powered Course Creation Platform",
    template: "%s | EduSphere AI"
  },
  description: "Create professional video courses in minutes with AI-powered course generation. Transform your content into engaging educational videos with automated narration, animations, and captions.",
  keywords: ["AI courses", "video courses", "online education", "course creation", "AI education", "e-learning", "educational videos"],
  authors: [{ name: "EduSphere AI" }],
  creator: "EduSphere AI",
  publisher: "EduSphere AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://edusphere.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://edusphere.ai",
    title: "EduSphere AI - AI-Powered Course Creation Platform",
    description: "Create professional video courses in minutes with AI-powered course generation.",
    siteName: "EduSphere AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduSphere AI - AI-Powered Course Creation Platform",
    description: "Create professional video courses in minutes with AI-powered course generation.",
    creator: "@edusphereai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-black text-white antialiased`}>
        <SkipLink />
        <SupabaseProvider>
          <SettingsProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              <div id="main-content">
                {children}
              </div>
              <Toaster />
            </ThemeProvider>
          </SettingsProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
