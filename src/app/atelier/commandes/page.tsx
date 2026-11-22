import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Calendar,
  Clock,
  Truck,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import SubOrderStatusUpdater from "@/components/atelier/SubOrderStatusUpdater";

export const dynamic = "force-dynamic";

const STATUS_BADGES: Record<
  string,
  { label: string; cls: string; desc: string }
> = {
  PENDING_PAYMENT: {
    label: "Paiement en attente",
    cls: "bg-amber-100 text-amber-800",
    desc: "En attente du règlement",
  },
  PAID: {
    label: "Payée — À traiter",
    cls: "bg-blue-100 text-blue-800",
    desc: "Nouvelle commande payée reçue",
  },
  ACCEPTED: {
    label: "Acceptée",
    cls: "bg-teal-100 text-teal-800",
    desc: "Acceptée par l'atelier",
  },
  IN_PREPARATION: {
    label: "En préparation",
    cls: "bg-indigo-100 text-indigo-800",
    desc: "En cours de confection",
  },
  SHIPPED: {
    label: "Expédiée",
    cls: "bg-purple-100 text-purple-800",
    desc: "Remise au transporteur",
  },
  DELIVERED: {
    label: "Livrée",
    cls: "bg-emerald-100 text-emerald-800",
    desc: "Réception confirmée",
  },
  REJECTED: {
    label: "Refusée",
    cls: "bg-rose-100 text-rose-800",
    desc: "Refusée par l'atelier",
  },
  CANCELLED: {
    label: "Annulée",
    cls: "bg-stone-100 text-stone-700",
    desc: "Commande annulée",
  },
};

export default async function AtelierCommandesPage() {
  const user = await getSessionUser();
  if (!user || !user.artisanProfileId) {
    redirect("/atelier/connexion?error=ArtisanAccessRequired");
  }

  // Règle 2 : Isolation stricte, l'artisan ne voit que ses sous-commandes
  const [artisan, subOrders] = await Promise.all([
    prisma.artisanProfile.findUnique({
      where: { id: user.artisanProfileId },
    }),
    prisma.subOrder.findMany({
      where: { artisanProfileId: user.artisanProfileId },
      orderBy: { createdAt: "desc" },
      include: {
        order: true,
        delivery: {
          include: { courier: true },
        },
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    }),
  ]);

  if (!artisan) {
    redirect("/atelier/inscription");
  }

  const toProcessCount = subOrders.filter(
    (s) => s.status === "PAID" || s.status === "ACCEPTED"
  ).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      {/* Header bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/atelier"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#125B3E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Tableau de bord atelier
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#125B3E]/10 text-[#125B3E]">
            {artisan.workshopName}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#131622]">
              Commandes reçues ({subOrders.length})
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Gérez le traitement, la préparation et l&apos;expédition de vos créations vendues.
            </p>
          </div>

          {toProcessCount > 0 && (
            <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{toProcessCount} commande(s) urgente(s) à traiter</span>
            </div>
          )}
        </div>

        {/* Rappel règle isolation et règle 3 */}
        <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#125B3E] shrink-0 mt-0.5" />
          <div>
            <strong>Règles de gestion atelier :</strong> Vous n&apos;avez accès qu&apos;aux pièces commandées dans votre atelier. Dans une commande groupée, votre décision (acceptation ou refus) n&apos;impacte que votre propre part (Règle 3).
          </div>
        </div>

        {/* Liste */}
        {subOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200/80 text-center space-y-3">
            <Package className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">
              Aucune commande pour le moment
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Dès qu&apos;un client achète une de vos créations, la sous-commande s&apos;affichera ici avec les coordonnées pour la livraison.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {subOrders.map((subOrder) => {
              const statusCfg =
                STATUS_BADGES[subOrder.status] || STATUS_BADGES.PAID;

              return (
                <div
                  key={subOrder.id}
                  className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#131622]">
                          {subOrder.subOrderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg.cls}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {new Date(subOrder.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-stone-500 block">
                          Part atelier
                        </span>
                        <span className="text-base font-bold text-[#125B3E]">
                          {subOrder.artisanPartFCFA.toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>

                      <Link
                        href={`/atelier/commandes/${subOrder.id}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Détails</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Articles de cette sous-commande */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100"
                      >
                        <div className="relative w-12 h-12 rounded-lg bg-stone-200 overflow-hidden shrink-0">
                          {item.product.images[0] ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#131622] truncate">
                            {item.product.title}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Quantité : <strong>{item.quantity}</strong> ×{" "}
                            {item.unitPriceFCFA.toLocaleString("fr-FR")} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions de mise à jour du statut */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
                    <div className="text-xs text-stone-500">
                      Client : <strong>{subOrder.order.customerName}</strong> (
                      {subOrder.order.customerPhone})
                    </div>
                    <SubOrderStatusUpdater
                      subOrderId={subOrder.id}
                      currentStatus={subOrder.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
