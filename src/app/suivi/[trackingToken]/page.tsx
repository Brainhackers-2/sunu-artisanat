import { getOrderByTrackingToken } from "@/actions/order";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface Props {
  params: { trackingToken: string };
  searchParams: { success?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Suivi de votre commande | Sunu Artisanat",
    description: "Consultez en direct l'état de préparation et d'expédition de vos créations.",
    robots: { index: false },
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Payée — en attente artisan", color: "bg-blue-100 text-blue-800" },
  ACCEPTED: { label: "Acceptée par l'artisan", color: "bg-indigo-100 text-indigo-800" },
  IN_PREPARATION: { label: "En préparation à l'atelier", color: "bg-purple-100 text-purple-800" },
  SHIPPED: { label: "Expédiée avec livreur", color: "bg-cyan-100 text-cyan-800" },
  DELIVERED: { label: "Livrée chez vous", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Refusée par l'artisan", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Annulée", color: "bg-gray-100 text-gray-800" },
};

export default async function SuiviCommandePage({ params, searchParams }: Props) {
  const order = await getOrderByTrackingToken(params.trackingToken);

  if (!order) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {searchParams.success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-8">
          <span className="text-4xl block mb-2">🎉</span>
          <h1 className="text-xl font-bold text-green-900 mb-1">
            Commande enregistrée avec succès !
          </h1>
          <p className="text-sm text-green-700 max-w-lg mx-auto">
            Merci pour votre soutien aux artisans sénégalais. Conservez ce lien pour suivre en
            temps réel l'avancement de chaque colis.
          </p>
        </div>
      )}

      {/* En-tête commande */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-extrabold text-gray-900">{order.orderNumber}</h1>
            {order.isDemo && (
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                🎭 Démo
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR")} à{" "}
            {new Date(order.createdAt).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">Montant total</p>
          <p className="text-xl font-black text-[var(--color-primary)]">
            {order.totalAmountFCFA.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
      </div>

      {/* Liste des sous-commandes par atelier */}
      <div className="flex flex-col gap-6">
        <h2 className="text-base font-bold text-gray-900">
          Détail des expéditions ({order.subOrders.length} colis)
        </h2>

        {order.subOrders.map((sub) => {
          const statusInfo = STATUS_LABELS[sub.status] || {
            label: sub.status,
            color: "bg-gray-100 text-gray-800",
          };

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4"
            >
              <div className="flex flex-wrap justify-between items-start gap-2 border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {sub.artisan.workshopName}
                    </span>
                    <span className="text-xs text-gray-400">({sub.artisan.region})</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{sub.subOrderNumber}</p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>

              {/* Articles de cet artisan */}
              <div className="divide-y divide-gray-100">
                {sub.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">
                            🧵
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.product.title}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × {item.unitPriceFCFA.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      {item.totalPriceFCFA.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
              </div>

              {/* Livraison & Suivi */}
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <span className="font-bold text-gray-800">Frais d'expédition : </span>
                  <span>{sub.deliveryFeeFCFA.toLocaleString("fr-FR")} FCFA</span>
                </div>
                {sub.delivery?.courier ? (
                  <div className="text-right">
                    <span className="font-bold text-gray-800">Livreur assigné : </span>
                    <span>
                      {sub.delivery.courier.name} ({sub.delivery.courier.phone})
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">En attente d'attribution livreur</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link href="/boutique" className="text-sm text-[var(--color-primary)] hover:underline font-semibold">
          ← Retourner à la boutique
        </Link>
      </div>
    </main>
  );
}
