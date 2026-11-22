import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DynamicTheme } from "@/components/theme/DynamicTheme";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import SunuVoiceBot from "@/components/ai/SunuVoiceBot";
import FloatingButtons from "@/components/layout/FloatingButtons";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#125B3E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "SUNU ARTISANAT — Le savoir-faire sénégalais au cœur de votre quotidien",
    template: "%s | SUNU ARTISANAT",
  },
  description:
    "Marketplace de valorisation, de numérisation et de traçabilité de l'artisanat d'art sénégalais. Thiès, Casamance, Dakar, Saint-Louis.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "SUNU ARTISANAT — Marketplace d'artisanat d'art sénégalais",
    description: "Découvrez et commandez des pièces d'artisanat sénégalais avec traçabilité d'origine déclarée.",
    siteName: "SUNU ARTISANAT",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Logo officiel SUNU ARTISANAT",
      },
    ],
    locale: "fr_SN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <DynamicTheme />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[#FAF8F5]">
        <AuthProvider>
          <SiteNav />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          {/* Boutons flottants : WhatsApp + Sunu Bot (Section 8.1 CDC) */}
          <FloatingButtons />
          {/* Assistant vocal (montré dans FloatingButtons via dialog) */}
          <SunuVoiceBot />
        </AuthProvider>
      </body>
    </html>
  );
}
