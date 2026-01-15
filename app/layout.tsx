import type { Metadata, Viewport } from "next";
import { Allura } from 'next/font/google';
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

// Optimize font loading with next/font
const allura = Allura({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-script',
});

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
  alternates: {
    canonical: "https://athymetoheal.org",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
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
  verification: {
    google: 'google-site-verification-placeholder',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={allura.variable}>
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
