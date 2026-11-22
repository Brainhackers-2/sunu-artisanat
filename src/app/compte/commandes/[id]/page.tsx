import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Calendar,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Store,
  CreditCard,
  QrCode,
  MapPin,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

const SUBORDER_STATUS_MAP: Record<
  string,
  { label: string; cls: string; desc: string }
> = {
  PENDING_PAYMENT: {
    label: "Paiement en attente",
    cls: "bg-amber-100 text-amber-800 border-amber-200",
    desc: "En attente de confirmation de paiement",
  },
  PAID: {
    label: "Payée — En attente traitement",
    cls: "bg-blue-100 text-blue-800 border-blue-200",
    desc: "Paiement validé, transmis à l'artisan",
  },
  ACCEPTED: {
    label: "Acceptée par l'atelier",
    cls: "bg-teal-100 text-teal-800 border-teal-200",
    desc: "L'artisan a confirmé la réalisation",
  },
  IN_PREPARATION: {
    label: "En préparation à l'atelier",
    cls: "bg-indigo-100 text-indigo-800 border-indigo-200",
    desc: "L'artisan confectionne ou emballe vos articles",
  },
  SHIPPED: {
    label: "Expédiée",
    cls: "bg-purple-100 text-purple-800 border-purple-200",
    desc: "Colis confié au livreur désigné",
  },
  DELIVERED: {
    label: "Livrée",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    desc: "Commande réceptionnée avec succès",
  },
  REJECTED: {
    label: "Refusée par l'artisan",
    cls: "bg-rose-100 text-rose-800 border-rose-200",
    desc: "L'artisan n'a pas pu honorer cette part",
  },
  CANCELLED: {
    label: "Annulée",
    cls: "bg-stone-100 text-stone-700 border-stone-200",
    desc: "Sous-commande annulée",
  },
};

export default async function CompteCommandeDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/connexion?callbackUrl=/compte/commandes/${params.id}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      subOrders: {
        include: {
          artisan: true,
          delivery: {
            include: { courier: true },
          },
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                  qrCodes: { take: 1 },
                },
              },
            },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      invoices: {
        take: 1,
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Règle de sécurité : un client ne voit que ses commandes sauf s'il est admin
  const isOwner = order.userId === user.id;
  const isAdmin =
    user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN");

  if (!isOwner && !isAdmin) {
    redirect("/compte");
  }

  const payment = order.payments[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      {/* Header bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/compte/commandes"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#125B3E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à mes commandes
          </Link>
          <span className="text-xs font-mono font-bold text-stone-500">
            {order.orderNumber}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-6">
        {/* Titre et statut global */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-[#131622]">
                Commande {order.orderNumber}
              </h1>
              {order.isDemo && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                  🎭 Démo
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>
                Passée le{" "}
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-stone-500">Montant total réglé</span>
            <span className="text-xl font-extrabold text-[#125B3E]">
              {order.totalAmountFCFA.toLocaleString("fr-FR")} FCFA
            </span>
            {payment && (
              <span className="text-[11px] text-stone-500 mt-0.5">
                Moyen : {payment.method} ({payment.status})
              </span>
            )}
          </div>
        </div>

        {/* Note multi-artisans CDC Section 7 */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
          <Store className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              Règle multi-artisans (Section 7 du cahier des charges) :
            </p>
            <p className="text-amber-800 mt-0.5">
              Chaque atelier partenaire prépare et expédie ses créations de
              façon autonome. Vous suivez l&apos;évolution de chaque artisan
              ci-dessous.
            </p>
          </div>
        </div>

        {/* Liste des sous-commandes par artisan */}
        <div className="space-y-4">
          {order.subOrders.map((subOrder) => {
            const statusConfig =
              SUBORDER_STATUS_MAP[subOrder.status] ||
              SUBORDER_STATUS_MAP.PAID;

            return (
              <div
                key={subOrder.id}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden"
              >
                {/* Header sous-commande */}
                <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#125B3E]/10 text-[#125B3E] flex items-center justify-center font-bold text-sm">
                      {subOrder.artisan.workshopName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/artisans/${subOrder.artisan.slug}`}
                          className="font-bold text-sm text-[#131622] hover:text-[#125B3E] transition-colors"
                        >
                          {subOrder.artisan.workshopName}
                        </Link>
                        {subOrder.artisan.verified && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#125B3E]/10 text-[#125B3E]">
                            ✓ Atelier vérifié
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Sous-commande n° {subOrder.subOrderNumber} • {subOrder.artisan.region}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.cls}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Articles */}
                <div className="p-5 divide-y divide-stone-100">
                  {subOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          {item.product.images[0] ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/produits/${item.product.slug}`}
                            className="text-xs sm:text-sm font-bold text-[#131622] hover:text-[#125B3E] transition-colors line-clamp-1"
                          >
                            {item.product.title}
                          </Link>
                          <p className="text-[11px] text-stone-500">
                            Quantité : {item.quantity} ×{" "}
                            {item.unitPriceFCFA.toLocaleString("fr-FR")} FCFA
                          </p>

                          {/* Lien certificat QR si présent */}
                          {item.product.qrCodes[0] && (
                            <Link
                              href={`/certification/${item.product.qrCodes[0].code}`}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#125B3E] hover:underline mt-1"
                            >
                              <QrCode className="w-3 h-3" /> Passeport de traçabilité
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold text-[#131622]">
                          {(item.unitPriceFCFA * item.quantity).toLocaleString(
                            "fr-FR"
                          )}{" "}
                          FCFA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Livraison et transporteur */}
                {subOrder.delivery && (
                  <div className="p-4 bg-stone-50 border-t border-stone-100 text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#125B3E]" />
                      <span>
                        Mode : <strong>{subOrder.delivery.deliveryType}</strong>
                        {subOrder.delivery.courier && (
                          <>
                            {" "}
                            • Livreur :{" "}
                            <strong>
                              {subOrder.delivery.courier.name}
                              {subOrder.delivery.courier.companyName &&
                                ` (${subOrder.delivery.courier.companyName})`}
                            </strong>
                          </>
                        )}
                      </span>
                    </div>
                    {subOrder.delivery.trackingNumber && (
                      <span className="font-mono text-stone-700 bg-white px-2.5 py-1 rounded-md border border-stone-200">
                        Suivi colis : {subOrder.delivery.trackingNumber}
                      </span>
                    )}
                  </div>
                )}

                {/* Motif de refus si statut REJECTED */}
                {subOrder.status === "REJECTED" && subOrder.rejectionReason && (
                  <div className="p-4 bg-rose-50 border-t border-rose-100 text-xs text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Motif du refus :</span>{" "}
                      {subOrder.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Lien de suivi invité sécurisé */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-[#131622]">
              Lien public de suivi en direct
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Accessible sans connexion pour vos proches ou livreurs
            </p>
          </div>
          <Link
            href={`/suivi/${order.trackingToken}`}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <span>Ouvrir la page de suivi public</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
