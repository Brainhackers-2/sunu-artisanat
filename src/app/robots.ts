import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sunu-artisanat.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/boutique", "/artisans", "/categories", "/histoire", "/a-propos", "/avis", "/contact", "/certification"],
        disallow: ["/admin", "/atelier", "/compte", "/commande", "/panier", "/suivi", "/api", "/recherche"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
