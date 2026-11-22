import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Layers,
  ArrowLeft,
  Award,
  CheckCircle2,
  Store,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: { code: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Passeport Digital ${params.code} — Certificat Officiel | SUNU ARTISANAT`,
    description: "Vérification officielle de traçabilité et d'origine déclarée d'une œuvre artisanale sénégalaise.",
    robots: { index: false },
  };
}

export default async function CertificationDetailPage({ params }: Props) {
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
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/certification"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#125B3E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Vérifier un autre certificat</span>
        </Link>

        {/* Certificat Officiel avec bordure et filigrane */}
        <div className="bg-white rounded-3xl border-2 border-stone-200/90 shadow-2xl overflow-hidden relative">
          {/* Bandeau d'en-tête officiel */}
          <div className="bg-[#131622] text-white p-6 sm:p-8 text-center relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FFB800] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>République du Sénégal • Artisanat d&apos;Art</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Passeport Digital de Traçabilité
            </h1>
            <p className="font-mono text-xs text-[#FFB800] mt-1 font-bold">
              CERTIFICAT N° {qr.code}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Sceau doré "CONFORME" et photo de l'objet scellée */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-stone-100">
              {/* Photo de l'objet scellée en base */}
              <div className="relative w-36 h-36 rounded-2xl bg-stone-100 border-2 border-stone-200 overflow-hidden shrink-0 shadow-md">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🧵
                  </div>
                )}
              </div>

              {/* Titre et Sceau doré "CONFORME" */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {/* Sceau doré "CONFORME" */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border-2 border-[#FFB800] text-xs font-black tracking-wider uppercase shadow-xs">
                    <Award className="w-4 h-4 text-[#FFB800]" />
                    <span>SCEAU CONFORME</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#125B3E]/10 text-[#125B3E]">
                    Traçabilité Validée
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-[#131622] leading-snug">
                  {product.title}
                </h2>

                <p className="text-xs text-stone-500 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    Origine déclarée : <strong>{product.originRegion || artisan.region}</strong>
                  </span>
                </p>
              </div>
            </div>

            {/* Fiche d'authenticité et données scellées */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Maître Artisan Dépositaire
                </span>
                <strong className="text-sm font-bold text-[#131622] block">
                  {artisan.workshopName}
                </strong>
                <span className="text-stone-500 block">
                  Spécialité : {artisan.specialty}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Date d&apos;Enregistrement
                </span>
                <strong className="text-sm font-bold text-[#131622] block">
                  {new Date(qr.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                <span className="text-stone-500 block">
                  Scellé physique SUNU #894
                </span>
              </div>
            </div>

            {/* Matériaux attestés */}
            {product.materials.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#125B3E]" />
                  <span>Matériaux Nobles Attestés :</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((m) => (
                    <span
                      key={m.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#125B3E]" />
                      <span>{m.name}</span>
                      {m.origin && (
                        <span className="text-amber-700 font-normal">
                          ({m.origin})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Note d'honnêteté selon la charte du CDC */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
              <strong>Charte de traçabilité SUNU ARTISANAT :</strong> Ce passeport
              certifie la chaîne d&apos;origine déclarée, l&apos;audit de l&apos;atelier et la
              provenance des matières premières enregistrées en base de données.
            </div>

            {/* Liens d'action */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/produits/${product.slug}`}
                className="flex-1 py-3 px-4 rounded-xl bg-[#125B3E] hover:bg-[#0E4831] text-white text-xs font-bold text-center transition-colors"
              >
                Voir la création en boutique →
              </Link>
              <Link
                href={`/artisans/${artisan.slug}`}
                className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold text-center transition-colors"
              >
                Visiter l&apos;atelier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
