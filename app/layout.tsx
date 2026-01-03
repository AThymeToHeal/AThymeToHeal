import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "A Thyme to Heal LLC - Natural Herbal Remedies & Wellness",
  description: "Your trusted source for natural herbal remedies and wellness solutions. Discover the healing power of nature with A Thyme to Heal.",
  keywords: "herbal remedies, natural wellness, holistic health, herbal medicine, wellness solutions",
  openGraph: {
    title: "A Thyme to Heal LLC",
    description: "Natural herbal remedies and wellness solutions",
    url: "https://athymetoheal.org",
    siteName: "A Thyme to Heal",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
