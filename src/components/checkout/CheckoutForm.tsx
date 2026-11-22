"use client";

import { useState } from "react";
import { createOrderAction } from "@/actions/order";
import { DeliveryType, PaymentMethod } from "@prisma/client";
import { useRouter } from "next/navigation";

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
    paymentMethod: PaymentMethod.SIMULATION,
    deliveryNotes: "",
  });

  // Calcul indicatif des frais de livraison : forfait 2000 FCFA par artisan si même région, sinon 4000
  const estimatedDeliveryFee = artisansCount * (formData.region === "Dakar" ? 2000 : 4000);
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

      // Redirection vers la page de suivi de commande invité/client
      router.push(`/suivi/${res.trackingToken}?success=1`);
    } catch {
      setError("Une erreur inattendue est survenue");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      {/* Formulaire Coordonnées & Livraison */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Identité / Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span>👤</span> Vos coordonnées
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="ex: Aminata Diallo"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Téléphone (WhatsApp de préférence) *
              </label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="ex: +221 77 123 45 67"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Adresse email *
              </label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="Pour recevoir vos récapitulatifs et factures"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Adresse de livraison */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span>📍</span> Adresse de livraison au Sénégal
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Région *</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-white"
              >
                {REGIONS_SENEGAL.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ville / Quartier *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="ex: Mermoz, Dakar"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Adresse exacte / Repères de livraison *
              </label>
              <input
                type="text"
                required
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                placeholder="ex: Rue MZ-12, en face de la pharmacie"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Instructions particulières pour le livreur (optionnel)
              </label>
              <textarea
                value={formData.deliveryNotes}
                onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                rows={2}
                placeholder="Code portail, créneau d'appel avant livraison..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Mode de paiement */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span>💳</span> Mode de règlement
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                formData.paymentMethod === PaymentMethod.SIMULATION
                  ? "border-[var(--color-primary)] bg-green-50/50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={PaymentMethod.SIMULATION}
                checked={formData.paymentMethod === PaymentMethod.SIMULATION}
                onChange={() =>
                  setFormData({ ...formData, paymentMethod: PaymentMethod.SIMULATION })
                }
                className="mt-1"
              />
              <div>
                <span className="font-bold text-sm text-gray-900 block">
                  Simulation (Test plateforme)
                </span>
                <span className="text-xs text-gray-500">
                  Valide instantanément la commande sans débit réel (mode démonstration).
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                formData.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                  ? "border-[var(--color-primary)] bg-green-50/50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={PaymentMethod.CASH_ON_DELIVERY}
                checked={formData.paymentMethod === PaymentMethod.CASH_ON_DELIVERY}
                onChange={() =>
                  setFormData({ ...formData, paymentMethod: PaymentMethod.CASH_ON_DELIVERY })
                }
                className="mt-1"
              />
              <div>
                <span className="font-bold text-sm text-gray-900 block">
                  Paiement à la livraison
                </span>
                <span className="text-xs text-gray-500">
                  Règlement en espèces ou Wave au livreur lors de la réception.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Colonne Récapitulatif et Validation */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 text-base">Votre commande</h2>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Articles ({artisansCount} atelier{artisansCount > 1 ? "s" : ""})</span>
            <span className="font-semibold text-gray-900">
              {totalSubTotalFCFA.toLocaleString("fr-FR")} FCFA
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Frais de livraison estimés</span>
            <span className="font-semibold text-gray-900">
              {estimatedDeliveryFee.toLocaleString("fr-FR")} FCFA
            </span>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
            <span className="font-bold text-gray-900">Total à payer</span>
            <span className="text-xl font-extrabold text-[var(--color-primary)]">
              {totalWithDelivery.toLocaleString("fr-FR")} FCFA
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white font-bold py-3.5 px-4 rounded-xl text-center hover:opacity-90 transition min-h-[48px] flex items-center justify-center disabled:opacity-50"
          >
            {loading ? "Traitement de votre commande..." : "Confirmer la commande"}
          </button>

          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            Vos stocks sont automatiquement réservés lors de la commande. Les fonds ne sont
            reversés aux artisans qu'après confirmation de votre livraison.
          </p>
        </div>
      </div>
    </form>
  );
}
