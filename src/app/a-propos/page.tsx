import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Users, Store, QrCode } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos de Sunu Artisanat | Marketplace de l'artisanat sénégalais",
  description:
    "Sunu Artisanat connecte les maîtres artisans sénégalais (Thiès, Dakar, Casamance, Saint-Louis) à des clients du monde entier grâce à la traçabilité QR Code.",
};

export default function AProposPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* Fil d'Ariane */}
      <nav className="text-xs text-stone-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <span className="text-stone-900">À propos</span>
      </nav>

      {/* Hero compact */}
      <div className="bg-gradient-to-r from-[#131622] to-[#125B3E] text-white rounded-3xl px-8 py-12 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB800]/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="text-[#FFB800] text-sm font-bold uppercase tracking-wider">La plateforme</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-4">
            À propos de Sunu Artisanat
          </h1>
          <p className="text-stone-200 leading-relaxed">
            Sunu Artisanat (« Notre Artisanat » en wolof) est une marketplace sénégalaise dédiée à la valorisation, la numérisation et la traçabilité de l'artisanat d'art traditionnel du Sénégal.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {[
          { icon: <Store className="w-5 h-5" />, label: "Ateliers vérifiés", value: "12+", color: "text-[#125B3E]", bg: "bg-[#125B3E]/10" },
          { icon: <QrCode className="w-5 h-5" />, label: "Créations certifiées", value: "80+", color: "text-[#C2410C]", bg: "bg-[#C2410C]/10" },
          { icon: <Users className="w-5 h-5" />, label: "Clients satisfaits", value: "250+", color: "text-[#FFB800]", bg: "bg-[#FFB800]/20" },
          { icon: <ShieldCheck className="w-5 h-5" />, label: "Années de savoir-faire", value: "10 avg", color: "text-stone-600", bg: "bg-stone-100" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-5 text-center">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mx-auto mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-extrabold text-stone-900">{s.value}</p>
            <p className="text-xs text-stone-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Corps */}
      <div className="space-y-10 text-stone-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Notre vision</h2>
          <p className="mb-4">
            Chaque création artisanale raconte une histoire : celle d'un maître tisserand Manjak de Ziguinchor qui perpétue des motifs transmis depuis dix générations, d'une orfèvre de Dakar qui travaille le filigrane d'argent selon des techniques héritées des Lébous, d'un maroquinier de Thiès qui tanne le cuir de zébu à la manière ancestrale.
          </p>
          <p>
            Ces histoires méritent d'être entendues au-delà des marchés locaux. Sunu Artisanat donne à chaque atelier la visibilité numérique qu'il mérite, en France, au Canada, aux États-Unis, au Japon — partout où des amateurs d'artisanat authentique cherchent à soutenir des créateurs exceptionnels.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">La traçabilité, pas l'infalsifiabilité</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
            <p className="text-sm text-amber-800">
              <strong>Important :</strong> nos certificats QR Code attestent l'<strong>origine déclarée</strong> par l'artisan lui-même et les matériaux qu'il revendique. Ils ne remplacent pas une expertise indépendante. Le site dit « traçabilité », « origine déclarée », « atelier vérifié » — jamais « authenticité garantie » ni « infalsifiable ».
            </p>
          </div>
          <p>
            En scannant le QR Code d'une création, vous accédez à sa fiche de traçabilité : région d'origine, matériaux déclarés, technique artisanale, nom de l'atelier, date d'enregistrement et numéro de série unique. Ces informations sont déclarées et signées par l'artisan partenaire, validé par notre équipe.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Comment nous travaillons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                title: "Validation des ateliers",
                desc: "Chaque artisan est validé manuellement par notre équipe avant d'apparaître sur la plateforme. Son statut, ses documents et son atelier sont vérifiés.",
              },
              {
                step: "02",
                title: "Modération des produits",
                desc: "Chaque création soumise passe en revue avant publication. L'administrateur valide les informations, les images et attribue le QR Code de traçabilité.",
              },
              {
                step: "03",
                title: "Commande & livraison",
                desc: "Les commandes multi-artisans sont gérées avec une sous-commande par atelier. Chaque artisan gère sa partie, le client suit chaque colis en temps réel.",
              },
            ].map((step) => (
              <div key={step.step} className="bg-white border border-stone-200 rounded-2xl p-5">
                <span className="text-3xl font-extrabold text-[#125B3E]/20">{step.step}</span>
                <h3 className="font-bold text-stone-900 mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <div className="bg-[#125B3E] text-white rounded-3xl p-8 text-center">
          <h3 className="text-xl font-bold mb-3">
            Prêt à découvrir nos artisans ?
          </h3>
          <p className="text-stone-200 text-sm mb-6">
            Parcourez notre boutique ou lisez notre histoire complète pour en savoir plus sur notre démarche.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/boutique"
              className="bg-[#FFB800] text-[#131622] px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition min-h-[48px] flex items-center justify-center"
            >
              Explorer la boutique
            </Link>
            <Link
              href="/histoire"
              className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition min-h-[48px] flex items-center justify-center"
            >
              Notre histoire →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
