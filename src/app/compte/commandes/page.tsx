import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes commandes | Mon Compte — Sunu Artisanat",
  robots: "noindex",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Payée", color: "bg-blue-100 text-blue-800" },
  ACCEPTED: { label: "Acceptée", color: "bg-indigo-100 text-indigo-800" },
  IN_PREPARATION: { label: "En préparation", color: "bg-purple-100 text-purple-800" },
  SHIPPED: { label: "Expédiée", color: "bg-cyan-100 text-cyan-800" },
  DELIVERED: { label: "Livrée ✓", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Annulée", color: "bg-gray-100 text-gray-700" },
};

export default async function MesCommandesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?callbackUrl=/compte/commandes");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      subOrders: {
        include: {
          artisan: { select: { workshopName: true, slug: true } },
          items: {
            include: {
              product: {
                select: { title: true, slug: true, images: { where: { isPrimary: true }, take: 1 } },
              },
            },
          },
        },
      },
      payments: { take: 1 },
    },
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/compte" className="text-sm text-stone-500 hover:underline">
          ← Mon compte
        </Link>
        <span className="text-stone-300">|</span>
        <h1 className="text-xl font-extrabold text-stone-900">Mes commandes</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <span className="text-5xl block mb-4">🛒</span>
          <p className="text-stone-600 font-medium mb-2">Vous n'avez pas encore passé de commande.</p>
          <p className="text-stone-400 text-xs mb-6">Découvrez nos créations artisanales certifiées.</p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[#125B3E] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90"
          >
            Explorer la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const globalStatus = order.subOrders[0]?.status ?? "PENDING_PAYMENT";
            const statusInfo = STATUS_LABELS[globalStatus] ?? { label: globalStatus, color: "bg-stone-100 text-stone-700" };

            return (
              <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                {/* En-tête */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-3 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-stone-900">{order.orderNumber}</span>
                      {order.isDemo && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">🎭 Démo</span>
                      )}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                      {" — "}
                      {order.subOrders.length} atelier{order.subOrders.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500">Total</p>
                    <p className="text-lg font-extrabold text-[#125B3E]">
                      {order.totalAmountFCFA.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </div>

                {/* Articles */}
                <div className="space-y-1 mb-4">
                  {order.subOrders.flatMap((sub) =>
                    sub.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span className="text-stone-500">{item.quantity}×</span>
                        <Link href={`/boutique/${item.product.slug}`} className="text-stone-800 hover:underline truncate">
                          {item.product.title}
                        </Link>
                        <span className="ml-auto text-stone-600 whitespace-nowrap">
                          {(item.unitPriceFCFA * item.quantity).toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {order.trackingToken && (
                    <Link
                      href={`/suivi/${order.trackingToken}`}
                      className="text-xs font-semibold bg-[#125B3E] text-white px-4 py-2 rounded-xl hover:opacity-90 transition min-h-[40px] flex items-center gap-1"
                    >
                      📦 Suivre la commande
                    </Link>
                  )}
                  <Link
                    href={`/commande/confirmation/${order.orderNumber}`}
                    className="text-xs font-semibold border border-stone-300 text-stone-600 px-4 py-2 rounded-xl hover:border-stone-400 transition min-h-[40px] flex items-center gap-1"
                  >
                    🧾 Voir le reçu
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
