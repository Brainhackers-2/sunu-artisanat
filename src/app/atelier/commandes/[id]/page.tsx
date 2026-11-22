import { redirect, notFound } from "next/navigation";
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
  User,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import SubOrderStatusUpdater from "@/components/atelier/SubOrderStatusUpdater";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

const STATUS_BADGES: Record<
  string,
  { label: string; cls: string; desc: string }
> = {
  PENDING_PAYMENT: {
    label: "Paiement en attente",
    cls: "bg-amber-100 text-amber-800",
    desc: "En attente du règlement client",
  },
  PAID: {
    label: "Payée — À traiter d'urgence",
    cls: "bg-blue-100 text-blue-800",
    desc: "Veuillez accepter ou refuser la commande",
  },
  ACCEPTED: {
    label: "Acceptée par l'atelier",
    cls: "bg-teal-100 text-teal-800",
    desc: "Commande acceptée",
  },
  IN_PREPARATION: {
    label: "En préparation à l'atelier",
    cls: "bg-indigo-100 text-indigo-800",
    desc: "Pièces en cours de confection/emballage",
  },
  SHIPPED: {
    label: "Expédiée (Colis confié)",
    cls: "bg-purple-100 text-purple-800",
    desc: "Colis en cours de livraison",
  },
  DELIVERED: {
    label: "Livrée au client",
    cls: "bg-emerald-100 text-emerald-800",
    desc: "Commande terminée avec succès",
  },
  REJECTED: {
    label: "Refusée",
    cls: "bg-rose-100 text-rose-800",
    desc: "Vous avez décliné cette sous-commande",
  },
  CANCELLED: {
    label: "Annulée",
    cls: "bg-stone-100 text-stone-700",
    desc: "Sous-commande annulée",
  },
};

export default async function AtelierCommandeDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user || !user.artisanProfileId) {
    redirect("/atelier/connexion?error=ArtisanAccessRequired");
  }

  // Règle 2 : Isolation stricte, l'artisan ne peut voir que sa sous-commande
  const subOrder = await prisma.subOrder.findFirst({
    where: {
      id: params.id,
      artisanProfileId: user.artisanProfileId,
    },
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
      artisan: true,
    },
  });

  if (!subOrder) {
    notFound();
  }

  const statusCfg =
    STATUS_BADGES[subOrder.status] || STATUS_BADGES.PAID;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      {/* Header bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/atelier/commandes"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#125B3E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux commandes reçues
          </Link>
          <span className="text-xs font-mono font-bold text-stone-500">
            {subOrder.subOrderNumber}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-6">
        {/* Titre et statut */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#131622]">
                Sous-commande {subOrder.subOrderNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.cls}`}
              >
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>
                Commande globale n° {subOrder.order.orderNumber} • Reçue le{" "}
                {new Date(subOrder.createdAt).toLocaleDateString("fr-FR", {
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
            <span className="text-xs text-stone-500">Votre part artisan nette</span>
            <span className="text-xl font-extrabold text-[#125B3E]">
              {subOrder.artisanPartFCFA.toLocaleString("fr-FR")} FCFA
            </span>
            <span className="text-[11px] text-stone-400 mt-0.5">
              Sous-total articles : {subOrder.subTotalFCFA.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
        </div>

        {/* Action immédiate de gestion du statut */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#131622] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#125B3E]" /> Actions de gestion de la commande
          </h2>
          <p className="text-xs text-stone-600">
            Faites évoluer le statut dès que vous commencez le travail ou que vous remettez le paquet au livreur :
          </p>
          <SubOrderStatusUpdater
            subOrderId={subOrder.id}
            currentStatus={subOrder.status}
          />
        </div>

        {/* Coordonnées Client et Livraison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#131622] flex items-center gap-2">
              <User className="w-4 h-4 text-[#125B3E]" /> Destinataire
            </h3>
            <div className="space-y-1.5 text-xs text-stone-700">
              <p className="font-semibold text-stone-900">
                {subOrder.order.customerName}
              </p>
              <p className="flex items-center gap-2 text-stone-600">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{subOrder.order.customerPhone}</span>
              </p>
              <p className="flex items-center gap-2 text-stone-600">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>{subOrder.order.customerEmail}</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#131622] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#125B3E]" /> Logistique & Livraison
            </h3>
            <div className="space-y-1.5 text-xs text-stone-700">
              {subOrder.delivery ? (
                <>
                  <p>
                    Mode de livraison :{" "}
                    <strong>{subOrder.delivery.deliveryType}</strong> (Frais :{" "}
                    {subOrder.deliveryFeeFCFA.toLocaleString("fr-FR")} FCFA)
                  </p>
                  {subOrder.delivery.courier ? (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                      <p className="font-semibold text-stone-900">
                        Livreur désigné par la plateforme :
                      </p>
                      <p>
                        {subOrder.delivery.courier.name}{" "}
                        {subOrder.delivery.courier.companyName &&
                          `(${subOrder.delivery.courier.companyName})`}{" "}
                        — Tél : {subOrder.delivery.courier.phone}
                      </p>
                    </div>
                  ) : (
                    <p className="text-stone-500 italic">
                      Livreur en cours d&apos;attribution par l&apos;équipe administrative.
                    </p>
                  )}
                  {subOrder.delivery.trackingNumber && (
                    <p className="font-mono text-stone-600">
                      N° de suivi : {subOrder.delivery.trackingNumber}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-stone-500">Livraison standard à domicile.</p>
              )}
            </div>
          </div>
        </div>

        {/* Articles commandés */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-100">
            <h3 className="text-sm font-bold text-[#131622] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#125B3E]" /> Créations à confectionner / expédier
            </h3>
          </div>

          <div className="p-6 divide-y divide-stone-100">
            {subOrder.items.map((item) => (
              <div
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#131622]">
                      {item.product.title}
                    </h4>
                    <p className="text-xs text-stone-500">
                      Quantité demandée : <strong>{item.quantity}</strong>
                    </p>
                    <p className="text-xs text-stone-500">
                      Prix unitaire figé :{" "}
                      {item.unitPriceFCFA.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-[#131622]">
                    {(item.unitPriceFCFA * item.quantity).toLocaleString("fr-FR")}{" "}
                    FCFA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motif de refus */}
        {subOrder.status === "REJECTED" && subOrder.rejectionReason && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Motif du refus consigné :</span>{" "}
              {subOrder.rejectionReason}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
