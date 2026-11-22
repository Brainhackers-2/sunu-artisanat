import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
  });

  if (!page || !page.isPublished) {
    return { title: "Page non trouvée" };
  }

  return {
    title: `${page.title} | SUNU ARTISANAT`,
    description: page.content.slice(0, 160),
  };
}

export default async function DynamicCustomPage({ params }: Props) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
  });

  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="relative w-36 h-10">
            <Image src="/images/logo.png" alt="SUNU ARTISANAT" fill className="object-contain" priority />
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-stone-600 hover:text-[#125B3E] inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        <article className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
          <header className="space-y-3 pb-6 border-b border-stone-100">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#131622]">{page.title}</h1>
            <div className="flex items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Mis à jour le {new Date(page.updatedAt).toLocaleDateString("fr-FR")}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                Page Publiée
              </span>
            </div>
          </header>

          <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {page.content}
          </div>
        </article>
      </main>

      {/* Footer minimaliste */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        <p>© 2026 SUNU ARTISANAT. Plateforme nationale de l&apos;artisanat d&apos;art sénégalais.</p>
      </footer>
    </div>
  );
}
