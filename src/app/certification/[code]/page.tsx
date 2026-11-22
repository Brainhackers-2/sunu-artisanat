import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface Props {
  params: { code: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Certification ${params.code} | Sunu Artisanat`,
    description: "Vérification de l'origine déclarée d'un produit artisanal sénégalais.",
    robots: { index: false },
  };
}

export default async function CertificationPage({ params }: Props) {
  const qr = await prisma.qRCode.findUnique({
    where: { code: params.code, isActive: true },
    include: {
      product: {
        include: {
          artisan: true,
          images: { where: { isPrimary: true }, take: 1 },
          materials: true,
        },
      },
    },
  });

  if (!qr) notFound();

  const { product } = qr;
  const artisan = product.artisan;

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🌍</div>
        <h1 className="text-2xl font-extrabold text-gray-900">Certification de traçabilité</h1>
        <p className="text-sm text-gray-500 mt-2">
          Ce document atteste de l'<strong>origine déclarée</strong> par l'artisan.
          <br />
          Il certifie la <strong>traçabilité</strong>, non l'authenticité absolue.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {product.images[0] && (
          <div className="relative aspect-video w-full bg-gray-50">
            <Image
              src={product.images[0].url}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{product.title}</h2>

          <div className="flex items-center gap-2 mb-4">
            {artisan.verified && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                ✓ Atelier vérifié
              </span>
            )}
            {artisan.isDemo && (
              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                🎭 Données de démonstration
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Artisan</p>
              <Link href={`/artisans/${artisan.slug}`} className="font-semibold text-[var(--color-primary)] hover:underline">
                {artisan.workshopName}
              </Link>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Région</p>
              <p className="font-semibold text-gray-800">{artisan.region}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Spécialité</p>
              <p className="font-semibold text-gray-800">{artisan.specialty}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Origine déclarée</p>
              <p className="font-semibold text-gray-800">{qr.declaredOrigin}</p>
            </div>
          </div>

          {product.materials.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Matériaux déclarés</p>
              <ul className="flex flex-wrap gap-2">
                {product.materials.map((m) => (
                  <li key={m.id} className="bg-amber-50 text-amber-800 text-xs px-2 py-1 rounded-full border border-amber-200">
                    {m.name}
                    {m.origin && ` · ${m.origin}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-mono">N° Série : {qr.serialNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Enregistré le {new Date(qr.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      {artisan.isDemo && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800 mb-6">
          ⚠️ Ce produit est une <strong>donnée de démonstration</strong>. Il ne correspond pas à un produit réel.
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">ℹ️ À propos de la traçabilité Sunu Artisanat</p>
        <p>
          Les informations sont <strong>déclarées par l'artisan</strong> et vérifiées lors de son inscription.
          Sunu Artisanat certifie la <strong>traçabilité de l'atelier</strong>, pas l'authenticité absolue de chaque pièce.
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link href={`/boutique/${product.slug}`} className="text-[var(--color-primary)] hover:underline text-sm">
          ← Retour à la fiche produit
        </Link>
      </div>
    </main>
  );
}
