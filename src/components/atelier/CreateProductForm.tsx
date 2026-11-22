"use client";

import { useState } from "react";
import { createArtisanProductAction } from "@/actions/atelier";
import { useRouter } from "next/navigation";

interface CreateProductFormProps {
  categories: { id: string; name: string }[];
  defaultRegion: string;
}

export default function CreateProductForm({ categories, defaultRegion }: CreateProductFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [priceFCFA, setPriceFCFA] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [originRegion, setOriginRegion] = useState(defaultRegion || "Thiès");
  const [technique, setTechnique] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [materials, setMaterials] = useState([{ name: "", origin: defaultRegion || "Sénégal" }]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddMaterial = () => {
    setMaterials([...materials, { name: "", origin: originRegion }]);
  };

  const handleMaterialChange = (index: number, field: "name" | "origin", value: string) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    const validMaterials = materials.filter((m) => m.name.trim().length > 0);
    if (validMaterials.length === 0) {
      setError("Veuillez déclarer au moins un matériau principal");
      setLoading(false);
      return;
    }

    const res = await createArtisanProductAction({
      title,
      description,
      categoryId,
      priceFCFA: parseInt(priceFCFA, 10),
      quantity: parseInt(quantity, 10),
      originRegion,
      technique,
      imageUrl,
      materials: validMaterials,
    });

    if (!res.success) {
      setError(res.error ?? "Erreur lors de la création");
    } else {
      setMsg("Produit soumis avec succès ! Il sera examiné par l'administration avant publication.");
      setTitle("");
      setDescription("");
      setPriceFCFA("");
      setTechnique("");
      setImageUrl("");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-5">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-bold text-gray-900 text-base">Ajouter une nouvelle création</h2>
        <p className="text-xs text-gray-500">
          Chaque création doit être validée par l'administrateur avant d'être publiée (Règle 7).
        </p>
      </div>

      {msg && <p className="text-xs text-green-800 bg-green-50 p-3 rounded-xl border border-green-200">{msg}</p>}
      {error && <p className="text-xs text-red-800 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Titre de la création *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex: Sac en cuir tanné végétal avec motifs Casamance"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Catégorie *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[var(--color-primary)]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Prix (FCFA entier) *</label>
          <input
            type="number"
            required
            min="100"
            value={priceFCFA}
            onChange={(e) => setPriceFCFA(e.target.value)}
            placeholder="ex: 25000"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Quantité initiale en stock *</label>
          <input
            type="number"
            required
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Technique artisanale déclarée *</label>
          <input
            type="text"
            required
            value={technique}
            onChange={(e) => setTechnique(e.target.value)}
            placeholder="ex: Tissage manuel, Cuir repoussé, Filigrane"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">URL de la photo principale *</label>
          <input
            type="url"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... ou URL Supabase Storage"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Description détaillée *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Racontez l'histoire de la pièce, son usage, son inspiration culturelle..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Matériaux déclarés */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-semibold text-gray-700">Matériaux et Origine déclarée *</label>
          <button
            type="button"
            onClick={handleAddMaterial}
            className="text-xs text-[var(--color-primary)] hover:underline font-semibold"
          >
            + Ajouter un matériau
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {materials.map((mat, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="ex: Cuir de chèvre, Bois d'ébène"
                value={mat.name}
                onChange={(e) => handleMaterialChange(idx, "name", e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs"
              />
              <input
                type="text"
                placeholder="Origine déclarée (ex: Thiès)"
                value={mat.origin}
                onChange={(e) => handleMaterialChange(idx, "origin", e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto self-start bg-[var(--color-primary)] text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50 min-h-[44px]"
      >
        {loading ? "Enregistrement..." : "Soumettre la création à l'administration"}
      </button>
    </form>
  );
}
