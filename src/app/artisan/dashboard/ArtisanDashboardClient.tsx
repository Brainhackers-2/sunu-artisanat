"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Save,
  PlusCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Coins,
  ShoppingBag,
  AlertTriangle,
  Package,
  Plus,
  Minus,
  Check,
  Loader2,
  ExternalLink,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import { updateArtisanProfileAction, updateArtisanStockAction } from "@/actions/atelier";
import { useRouter } from "next/navigation";

interface ArtisanData {
  id: string;
  workshopName: string;
  slug: string;
  specialty: string;
  city: string;
  region: string;
  experienceYears: number;
  bio: string;
  logoUrl: string | null;
  coverUrl: string | null;
  verified: boolean;
  products: {
    id: string;
    title: string;
    priceFCFA: number;
    status: string;
    inventory: { quantity: number } | null;
    images: { url: string }[];
  }[];
  subOrders: {
    id: string;
    subOrderNumber: string;
    status: string;
    artisanPartFCFA: number;
    createdAt: Date | string;
    order: {
      customerName: string;
      customerPhone: string;
      customerEmail: string;
    };
    delivery: {
      deliveryType: string;
      streetAddress?: string | null;
      city?: string | null;
    } | null;
  }[];
}

export default function ArtisanDashboardClient({
  artisan,
}: {
  artisan: ArtisanData;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Formulaire d'édition de l'atelier
  const [formData, setFormData] = useState({
    workshopName: artisan.workshopName,
    specialty: artisan.specialty,
    city: artisan.city,
    region: artisan.region,
    experienceYears: artisan.experienceYears,
    bio: artisan.bio || "",
    logoUrl: artisan.logoUrl || "",
    coverUrl: artisan.coverUrl || "",
  });

  // Mise à jour du stock local
  const [stockUpdating, setStockUpdating] = useState<Record<string, boolean>>({});

  const handleStockChange = async (productId: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    setStockUpdating((prev) => ({ ...prev, [productId]: true }));
    try {
      await updateArtisanStockAction(productId, newQty);
      router.refresh();
    } finally {
      setStockUpdating((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileSuccess(false);
    setProfileError(null);
    try {
      const res = await updateArtisanProfileAction(formData);
      if (!res.success) {
        setProfileError(res.error || "Erreur de mise à jour");
      } else {
        setProfileSuccess(true);
        router.refresh();
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch {
      setProfileError("Erreur inattendue");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Calculs d'indicateurs clés
  const totalRevenueFCFA = artisan.subOrders
    .filter((s) => s.status !== "REJECTED" && s.status !== "CANCELLED")
    .reduce((acc, s) => acc + s.artisanPartFCFA, 0);

  const lowStockCount = artisan.products.filter(
    (p) => (p.inventory?.quantity ?? 0) <= 2
  ).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* 1. Grand Bandeau Supérieur : Fond vert forêt nuit (bg-forest-900 / #0A3524 text-white) */}
      <section className="bg-[#0A3524] text-white py-8 px-4 border-b border-[#125B3E]/40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden shrink-0">
              <Image
                src={
                  formData.logoUrl ||
                  artisan.logoUrl ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                }
                alt={artisan.workshopName}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                {/* Nom de l'atelier en grands caractères ivoire */}
                <h1 className="text-2xl sm:text-3xl font-black text-[#FAF8F5] tracking-tight">
                  {artisan.workshopName}
                </h1>
                {artisan.verified && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#125B3E] text-white border border-white/20">
                    ✓ Vérifié
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 mt-1 flex flex-wrap items-center gap-2">
                <span>{artisan.specialty}</span>
                <span>•</span>
                <span>
                  {artisan.city}, {artisan.region}
                </span>
                <span>•</span>
                <Link
                  href={`/artisans/${artisan.slug}`}
                  target="_blank"
                  className="text-[#FFB800] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Voir ma vitrine publique</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Bouton doré "Ajouter une création" */}
            <Link
              href="/atelier/produits/nouveau"
              className="px-4 py-2.5 rounded-xl bg-[#FFB800] hover:bg-[#E5A700] text-[#131622] font-black text-xs sm:text-sm tracking-wide inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajouter une création</span>
            </Link>

            {/* Bouton rouge sombre "Déconnexion" */}
            <div className="rounded-xl overflow-hidden shadow-xs">
              <SignOutButton />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        {/* 2. Cartes d'Indicateurs Clés */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-semibold block">
                Chiffre d&apos;Affaires Net
              </span>
              <strong className="text-2xl font-black text-[#125B3E]">
                {totalRevenueFCFA.toLocaleString("fr-FR")} FCFA
              </strong>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#125B3E] flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-semibold block">
                Commandes Reçues
              </span>
              <strong className="text-2xl font-black text-[#131622]">
                {artisan.subOrders.length}
              </strong>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-[#B38200] flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-semibold block">
                Alerte Stock Faible
              </span>
              <strong
                className={`text-2xl font-black ${
                  lowStockCount > 0 ? "text-rose-600" : "text-[#125B3E]"
                }`}
              >
                {lowStockCount} article{lowStockCount > 1 ? "s" : ""}
              </strong>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                lowStockCount > 0
                  ? "bg-rose-100 text-rose-600"
                  : "bg-stone-100 text-stone-500"
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3. Formulaire "Modifier l'Atelier" (Dépliable) */}
        <section className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
          <button
            onClick={() => setEditOpen(!editOpen)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-stone-50/70 transition-colors"
          >
            <div>
              <h2 className="font-bold text-base text-[#131622] flex items-center gap-2">
                <span>⚙️ Modifier l&apos;Atelier &amp; Photos de Vitrine</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Mettez à jour vos coordonnées, histoire, logo et bannière de couverture
              </p>
            </div>
            {editOpen ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </button>

          {editOpen && (
            <form onSubmit={handleProfileSubmit} className="p-6 pt-0 space-y-6 border-t border-stone-100">
              {profileSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Modifications de l&apos;atelier enregistrées avec succès !</span>
                </div>
              )}
              {profileError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold">
                  {profileError}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom de l&apos;Atelier *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.workshopName}
                    onChange={(e) =>
                      setFormData({ ...formData, workshopName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Spécialité Principale *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Région *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Années d&apos;expérience
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceYears: parseInt(e.target.value || "0", 10),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
                  />
                </div>

                {/* Nouveau champ : Photo de Profil / Logo (URL) avec aperçu visuel rond */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Photo de Profil / Logo (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, logoUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
                  />
                  {formData.logoUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-stone-200 shrink-0">
                        <Image
                          src={formData.logoUrl}
                          alt="Aperçu logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Aperçu logo en direct
                      </span>
                    </div>
                  )}
                </div>

                {/* Nouveau champ : Photo de Couverture / Bannière (URL) avec aperçu panoramique */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Photo de Couverture / Bannière (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.coverUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, coverUrl: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
                  />
                  {formData.coverUrl && (
                    <div className="mt-2 relative h-28 w-full rounded-2xl overflow-hidden border border-stone-200">
                      <Image
                        src={formData.coverUrl}
                        alt="Aperçu couverture"
                        fill
                        className="object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                        Aperçu bannière panoramique
                      </span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Histoire &amp; Biographie de l&apos;Atelier
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Racontez votre passion, vos maîtres d'apprentissage..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#125B3E]"
                  />
                </div>
              </div>

              {/* Bouton de sauvegarde vert forêt avec icône disquette */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="px-6 py-3 rounded-xl bg-[#125B3E] hover:bg-[#0E4831] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {loadingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Enregistrer les modifications de l&apos;atelier</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* 4. Gestionnaire de Produits : Tableau des articles avec édition rapide du stock en direct (+ / -) */}
        <section className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-[#131622] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#125B3E]" />
                <span>Gestionnaire des Produits ({artisan.products.length})</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Ajustez instantanément les quantités disponibles en atelier
              </p>
            </div>

            <Link
              href="/atelier/produits/nouveau"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#125B3E] text-white hover:bg-[#0E4831] transition-colors self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau produit</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-y border-stone-100 text-stone-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Création</th>
                  <th className="py-3 px-4">Prix FCFA</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-center">Édition Rapide Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {artisan.products.map((p) => {
                  const qty = p.inventory?.quantity ?? 0;
                  const isBusy = stockUpdating[p.id];
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          {p.images[0] ? (
                            <Image
                              src={p.images[0].url}
                              alt={p.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              🧵
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-stone-900 max-w-xs truncate">
                          {p.title}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-[#C2410C]">
                        {p.priceFCFA.toLocaleString("fr-FR")} FCFA
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                          {p.status}
                        </span>
                      </td>

                      {/* Édition rapide du stock en direct (+ / -) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStockChange(p.id, qty, -1)}
                            disabled={isBusy || qty <= 0}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition-colors disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="font-mono font-black text-xs text-[#131622] min-w-[28px] text-center">
                            {isBusy ? (
                              <Loader2 className="w-3 h-3 animate-spin mx-auto text-[#125B3E]" />
                            ) : (
                              qty
                            )}
                          </span>

                          <button
                            onClick={() => handleStockChange(p.id, qty, 1)}
                            disabled={isBusy}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition-colors disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Gestionnaire des Commandes Clients : Numéros de téléphone et adresses de livraison des clients */}
        <section className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="font-bold text-base text-[#131622] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#125B3E]" />
              <span>
                Gestionnaire des Commandes Clients ({artisan.subOrders.length})
              </span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Coordonnées et adresses complètes pour la confection et l&apos;expédition
            </p>
          </div>

          {artisan.subOrders.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">
              Aucune commande client reçue pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {artisan.subOrders.map((so) => (
                <div
                  key={so.id}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-stone-900">
                        {so.subOrderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {so.status}
                      </span>
                    </div>

                    <div className="text-xs text-stone-700 space-y-0.5 pt-1">
                      <p className="font-bold text-[#131622]">
                        Client : {so.order.customerName}
                      </p>
                      <p className="flex items-center gap-1.5 text-stone-600">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>Téléphone : <strong>{so.order.customerPhone}</strong></span>
                      </p>
                      {so.delivery && (
                        <p className="flex items-center gap-1.5 text-stone-600">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            Adresse : {so.delivery.streetAddress || "Standard"},{" "}
                            {so.delivery.city || "Dakar"} ({so.delivery.deliveryType})
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <span className="text-base font-black text-[#125B3E]">
                      {so.artisanPartFCFA.toLocaleString("fr-FR")} FCFA
                    </span>

                    <Link
                      href={`/atelier/commandes/${so.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-bold hover:bg-stone-100 transition-colors inline-flex items-center gap-1 shadow-2xs"
                    >
                      <span>Traiter la commande →</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
