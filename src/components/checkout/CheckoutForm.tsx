"use client";

import { useState } from "react";
import { createOrderAction } from "@/actions/order";
import { DeliveryType, PaymentMethod } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ShieldCheck,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface CheckoutFormProps {
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  totalSubTotalFCFA: number;
  artisansCount: number;
}

const REGIONS_SENEGAL = [
  "Dakar",
  "Thiès",
  "Casamance (Ziguinchor)",
  "Saint-Louis",
  "Kaolack",
  "Diourbel",
  "Fatick",
  "Kolda",
  "Tambacounda",
  "Matam",
  "Kaffrine",
  "Kédougou",
  "Sédhiou",
  "Louga",
];

export default function CheckoutForm({
  initialData,
  totalSubTotalFCFA,
  artisansCount,
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    streetAddress: string;
    city: string;
    region: string;
    deliveryType: DeliveryType;
    paymentMethod: PaymentMethod;
    deliveryNotes: string;
  }>({
    customerName: initialData?.name ?? "",
    customerEmail: initialData?.email ?? "",
    customerPhone: initialData?.phone ?? "",
    streetAddress: "",
    city: "Dakar",
    region: "Dakar",
    deliveryType: DeliveryType.HOME,
    paymentMethod: PaymentMethod.WAVE,
    deliveryNotes: "",
  });

  const estimatedDeliveryFee =
    artisansCount * (formData.region === "Dakar" ? 2000 : 3500);
  const totalWithDelivery = totalSubTotalFCFA + estimatedDeliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await createOrderAction({
        ...formData,
      });

      if (!res.success) {
        setError(res.error ?? "Erreur lors de la validation de la commande");
        setLoading(false);
        return;
      }

      router.push(`/suivi/${res.trackingToken}?success=1`);
    } catch {
      setError("Une erreur inattendue est survenue");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      {/* Formulaire Coordonnées & Livraison */}
      <div className="lg:col-span-2 space-y-6">
        {/* Identité / Contact */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <User className="w-5 h-5 text-[#125B3E]" />
            <span>Coordonnées du Client</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder="ex: Aminata Diallo"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Téléphone au Sénégal (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                placeholder="ex: +221 77 123 45 67"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Adresse email (pour le reçu et le suivi) *
              </label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                placeholder="aminata.diallo@example.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
              />
            </div>
          </div>
        </div>

        {/* Adresse de Livraison */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#125B3E]" />
            <span>Adresse de Livraison au Sénégal</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Région de destination *
              </label>
              <select
                value={formData.region}
                onChange={(e) =>
                  setFormData({ ...formData, region: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E] bg-white font-medium"
              >
                {REGIONS_SENEGAL.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ville / Commune / Quartier *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="ex: Mermoz, Almadies, Thiès Nord..."
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Adresse exacte &amp; Repères pour le livreur *
              </label>
              <input
                type="text"
                required
                value={formData.streetAddress}
                onChange={(e) =>
                  setFormData({ ...formData, streetAddress: e.target.value })
                }
                placeholder="ex: Villa 45, près de la pharmacie, Rue MZ-12"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
              />
            </div>
          </div>
        </div>

        {/* Modes de Paiement avec Logos & Badges Visuels Officiels */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#125B3E]" />
            <span>Sélectionnez votre Mode de Règlement Sécurisé</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* 1. Wave */}
            <label
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                formData.paymentMethod === PaymentMethod.WAVE
                  ? "border-[#1B96FF] bg-sky-50/60 shadow-xs"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={PaymentMethod.WAVE}
                checked={formData.paymentMethod === PaymentMethod.WAVE}
                onChange={() =>
                  setFormData({ ...formData, paymentMethod: PaymentMethod.WAVE })
                }
                className="accent-[#1B96FF]"
              />
              <div className="flex-1">
                <span className="font-black text-sm text-[#0066CC] block">
                  Wave Sénégal 🌊
                </span>
                <span className="text-[11px] text-stone-500">
                  Paiement instantané par QR code ou numéro
                </span>
              </div>
            </label>

            {/* 2. Orange Money */}
            <label
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                formData.paymentMethod === PaymentMethod.ORANGE_MONEY
                  ? "border-[#FF7900] bg-orange-50/60 shadow-xs"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={PaymentMethod.ORANGE_MONEY}
                checked={formData.paymentMethod === PaymentMethod.ORANGE_MONEY}
                onChange={() =>
                  setFormData({
                    ...formData,
                    paymentMethod: PaymentMethod.ORANGE_MONEY,
                  })
                }
                className="accent-[#FF7900]"
              />
              <div className="flex-1">
                <span className="font-black text-sm text-[#FF7900] block">
                  Orange Money 🍊
                </span>
                <span className="text-[11px] text-stone-500">
                  Débit direct et sécurisé sur votre compte OM
                </span>
              </div>
            </label>

            {/* 3. Carte Bancaire */}
            <label
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                formData.paymentMethod === PaymentMethod.CARD
                  ? "border-indigo-500 bg-indigo-50/60 shadow-xs"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={PaymentMethod.CARD}
                checked={formData.paymentMethod === PaymentMethod.CARD}
                onChange={() =>
                  setFormData({
                    ...formData,
                    paymentMethod: PaymentMethod.CARD,
                  })
                }
                className="accent-indigo-600"
              />
              <div className="flex-1">
                <span className="font-black text-sm text-indigo-900 block">
                  Carte Bancaire (Visa / Mastercard) 💳
                </span>
                <span className="text-[11px] text-stone-500">
                  Paiement international sécurisé 3D Secure
                </span>
              </div>
            </label>

            {/* 4. Paiement à la Livraison */}
            <label
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                formData.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                  ? "border-[#C2410C] bg-amber-50/60 shadow-xs"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={PaymentMethod.CASH_ON_DELIVERY}
                checked={formData.paymentMethod === PaymentMethod.CASH_ON_DELIVERY}
                onChange={() =>
                  setFormData({
                    ...formData,
                    paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
                  })
                }
                className="accent-[#C2410C]"
              />
              <div className="flex-1">
                <span className="font-black text-sm text-[#C2410C] block">
                  Paiement à la Livraison 📦
                </span>
                <span className="text-[11px] text-stone-500">
                  Règlement en espèces ou Wave auprès du livreur
                </span>
              </div>
            </label>

            {/* 5. Mode Simulation Démo */}
            <label
              className={`sm:col-span-2 flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                formData.paymentMethod === PaymentMethod.SIMULATION
                  ? "border-[#125B3E] bg-emerald-50/60 shadow-xs"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={PaymentMethod.SIMULATION}
                checked={formData.paymentMethod === PaymentMethod.SIMULATION}
                onChange={() =>
                  setFormData({
                    ...formData,
                    paymentMethod: PaymentMethod.SIMULATION,
                  })
                }
                className="accent-[#125B3E]"
              />
              <div className="flex-1">
                <span className="font-bold text-xs text-stone-900 block">
                  Simulation de Démonstration (Sans débit réel)
                </span>
                <span className="text-[10px] text-stone-500">
                  Recommandé pour tester immédiatement le parcours de validation complet
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Colonne Récapitulatif et Bouton Final */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-sm sticky top-24 space-y-4">
          <h2 className="font-bold text-stone-900 text-base">
            Récapitulatif de Commande
          </h2>

          <div className="flex justify-between text-xs text-stone-600 pb-2 border-b border-stone-100">
            <span>
              Sous-total ({artisansCount} atelier{artisansCount > 1 ? "s" : ""})
            </span>
            <strong className="text-stone-900">
              {totalSubTotalFCFA.toLocaleString("fr-FR")} FCFA
            </strong>
          </div>

          <div className="flex justify-between text-xs text-stone-600 pb-2 border-b border-stone-100">
            <span>Frais de livraison ({formData.region})</span>
            <strong className="text-stone-900">
              {estimatedDeliveryFee.toLocaleString("fr-FR")} FCFA
            </strong>
          </div>

          <div className="pt-2 flex justify-between items-baseline">
            <span className="font-bold text-stone-900 text-sm">Montant Total</span>
            <span className="text-2xl font-black text-[#107C41]">
              {totalWithDelivery.toLocaleString("fr-FR")} FCFA
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Bouton Final de Paiement : Grand bouton vert forêt sécurisé (bg-[#107C41] hover:bg-[#0c6534] text-white font-bold) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#107C41] hover:bg-[#0c6534] text-white font-black py-4 px-5 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 min-h-[54px] disabled:opacity-50 text-sm tracking-wide"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validation en cours...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#FFB800]" />
                <span>Payer &amp; Confirmer ma commande</span>
              </>
            )}
          </button>

          <div className="pt-2 text-[11px] text-stone-400 text-center space-y-1">
            <p className="flex items-center justify-center gap-1 text-[#125B3E] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Paiement chiffré &amp; stock réservé</span>
            </p>
            <p>
              Les fonds ne sont reversés à l&apos;artisan qu&apos;après livraison confirmée.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
