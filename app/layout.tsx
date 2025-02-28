import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Historical Map",
    template: "%s - Historical Map",
  },
  description: "Explore historical events on an interactive map.",
  authors: [{ name: "Leytox" }],
  keywords: ["history", "map", "historical events", "interactive map"],
  openGraph: {
    title: "Historical Map",
    description: "Explore historical events on an interactive map.",
    url: "https://your-deployment.vercel.app",
    siteName: "Historical Map",
    images: [
      {
        url: "https://your-deployment.vercel.app/og.png",
        width: 1200,
        height: 630,
        alt: "Historical Map OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Historical Map",
    description: "Explore historical events on an interactive map.",
    images: ["https://your-deployment.vercel.app/og.png"],
    creator: "@Leytox",
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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
