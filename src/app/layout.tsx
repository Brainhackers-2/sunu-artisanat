import type { Metadata, Viewport } from "next";
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
    description: "Découvrez et commandez des pièces d'artisanat sénégalais authentiques avec traçabilité vérifiée.",
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
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
