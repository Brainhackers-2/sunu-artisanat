import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, QrCode, Share2 } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: { numero: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Confirmation ${params.numero} | Sunu Artisanat`,
    description: "Votre commande a été enregistrée. Suivez son avancement en temps réel.",
    robots: "noindex",
  };
}

const STATUS_LABELS: Record<string, { label: string; emoji: string }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", emoji: "⏳" },
  PAID: { label: "Payée", emoji: "✅" },
  ACCEPTED: { label: "Acceptée par l'artisan", emoji: "👍" },
  IN_PREPARATION: { label: "En préparation", emoji: "🔨" },
  SHIPPED: { label: "Expédiée", emoji: "🚚" },
  DELIVERED: { label: "Livrée", emoji: "🏠" },
  CANCELLED: { label: "Annulée", emoji: "❌" },
};

export default async function CommandeConfirmationPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.numero },
    include: {
      subOrders: {
        include: {
          artisan: { select: { workshopName: true, slug: true, region: true } },
          items: {
            include: {
              product: {
                select: {
                  title: true,
                  slug: true,
                  priceFCFA: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          delivery: true,
        },
      },
      payments: { take: 1 },
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!order) notFound();

  const payment = order.payments[0];
  const isSimulated = payment?.isSimulated ?? true;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Bannière de succès */}
      <div className="bg-gradient-to-br from-[#125B3E] to-emerald-700 text-white rounded-3xl p-8 text-center mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFB800_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10">
          <CheckCircle2 className="w-14 h-14 mx-auto mb-4 text-[#FFB800]" />
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Commande enregistrée !
          </h1>
          <p className="text-emerald-100 text-sm max-w-lg mx-auto mb-4">
            Merci pour votre soutien à l'artisanat sénégalais. Votre commande a été transmise aux ateliers concernés.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-xl font-mono text-sm font-bold">
            <Package className="w-4 h-4" />
            {order.orderNumber}
          </div>
          {order.isDemo && (
            <p className="mt-3 text-xs text-amber-200">
              🎭 Commande de démonstration — non commerciale
            </p>
          )}
        </div>
      </div>

      {/* Info paiement */}
      {isSimulated && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
          <strong>⚠️ Paiement Simulation :</strong> Cette commande utilise le mode de paiement simulé à des fins de démonstration. Aucun montant réel n'a été débité.
        </div>
      )}

      {/* Résumé de la commande */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-xs text-stone-500 font-medium mb-1">Total commande</p>
          <p className="text-xl font-extrabold text-[#125B3E]">
            {order.totalAmountFCFA.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-xs text-stone-500 font-medium mb-1">Statut paiement</p>
          <p className="text-sm font-bold text-stone-900">
            {payment ? (
              payment.isSimulated ? "✅ Simulé (Démo)" : "✅ " + payment.status
            ) : "⏳ En attente"}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-xs text-stone-500 font-medium mb-1">Nombre d'ateliers</p>
          <p className="text-xl font-extrabold text-stone-900">
            {order.subOrders.length} atelier{order.subOrders.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Sous-commandes par atelier */}
      <div className="space-y-5 mb-8">
        <h2 className="text-lg font-bold text-stone-900">
          Détail des expéditions
        </h2>

        {order.subOrders.map((sub) => {
          const statusInfo = STATUS_LABELS[sub.status] ?? { label: sub.status, emoji: "📦" };
          return (
            <div key={sub.id} className="bg-white border border-stone-200 rounded-2xl p-5">
              {/* En-tête sous-commande */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-3 border-b border-stone-100">
                <div>
                  <Link
                    href={`/artisans/${sub.artisan.slug}`}
                    className="font-bold text-stone-900 hover:text-[#125B3E] transition"
                  >
                    {sub.artisan.workshopName}
                  </Link>
                  <p className="text-xs text-stone-400">📍 {sub.artisan.region}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full font-medium">
                    {statusInfo.emoji} {statusInfo.label}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">{sub.subOrderNumber}</span>
                </div>
              </div>

              {/* Articles */}
              <div className="space-y-2 mb-3">
                {sub.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-800">
                        {item.quantity}×
                      </span>
                      <Link href={`/boutique/${item.product.slug}`} className="text-stone-700 hover:underline">
                        {item.product.title}
                      </Link>
                    </div>
                    <span className="text-stone-900 font-semibold whitespace-nowrap">
                      {(item.unitPriceFCFA * item.quantity).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
              </div>

              {/* Sous-total */}
              <div className="flex justify-between text-sm font-bold border-t border-stone-100 pt-3">
                <span className="text-stone-700">Sous-total {sub.artisan.workshopName}</span>
                <span className="text-[#125B3E]">{sub.subTotalFCFA.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <p className="font-bold text-stone-900 mb-1">Suivre votre commande</p>
          <p className="text-xs text-stone-500">
            Conservez le lien de suivi pour accéder à votre commande sans compte.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {order.trackingToken && (
            <Link
              href={`/suivi/${order.trackingToken}`}
              className="flex items-center gap-2 bg-[#125B3E] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition min-h-[48px]"
            >
              <Package className="w-4 h-4" />
              Suivre ma commande
            </Link>
          )}
          <Link
            href="/boutique"
            className="flex items-center gap-2 border border-stone-300 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:border-stone-400 transition min-h-[48px]"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>

      {/* QR Code info */}
      <div className="mt-6 flex items-start gap-3 bg-[#125B3E]/5 border border-[#125B3E]/20 rounded-2xl p-4 text-sm">
        <QrCode className="w-5 h-5 text-[#125B3E] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#125B3E]">Traçabilité QR Code incluse</p>
          <p className="text-stone-600 text-xs mt-1">
            Chaque création livrée est accompagnée de son QR Code de traçabilité. Scannez-le pour vérifier l'origine déclarée, les matériaux et l'atelier.
          </p>
        </div>
      </div>
    </main>
  );
}
