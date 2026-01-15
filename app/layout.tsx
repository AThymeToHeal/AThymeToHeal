import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#023020',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://athymetoheal.org'),
  title: {
    default: "A Thyme to Heal - Natural Herbal Remedies & Wellness",
    template: "%s | A Thyme to Heal"
  },
  description: "Your trusted source for natural herbal remedies and wellness solutions. Discover the healing power of nature with A Thyme to Heal.",
  keywords: "herbal remedies, natural wellness, holistic health, herbal medicine, wellness solutions",
  authors: [{ name: "A Thyme to Heal" }],
  creator: "A Thyme to Heal",
  publisher: "A Thyme to Heal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "A Thyme to Heal",
    description: "Natural herbal remedies and wellness solutions",
    url: "https://athymetoheal.org",
    siteName: "A Thyme to Heal",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "A Thyme to Heal",
    description: "Natural herbal remedies and wellness solutions",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
