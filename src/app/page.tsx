import Image from "next/image";
import { CheckCircle2, ShieldCheck, Smartphone, Layers, Database, Sparkles } from "lucide-react";

export default function HomePage() {
  const foundationItems = [
    {
      title: "Next.js 14 (App Router) & TypeScript Strict",
      desc: "Architecture modulaire et typage rigoureux sans compromis",
      icon: Layers,
    },
    {
      title: "Palette Sénégal & Variables de Thème",
      desc: "Vert Forêt (#125B3E), Or (#FFB800), Terre Cuite (#C2410C), Ébène, Ivoire",
      icon: Sparkles,
    },
    {
      title: "Supabase & Prisma avec Pooling",
      desc: "PostgreSQL avec transaction pooling (port 6543) et sessions directes",
      icon: Database,
    },
    {
      title: "Mobile-First & PWA Installable",
      desc: "Cibles tactiles >= 44px, manifest.json, optimisé pour 360px et plus",
      icon: Smartphone,
    },
    {
      title: "Sécurité & Vérification Côté Serveur",
      desc: "Règles métier, prix, statuts et contrôles de droits exécutés sur le serveur",
      icon: ShieldCheck,
    },
  ];

  const palette = [
    { name: "Vert Forêt (Casamance)", hex: "#125B3E", bg: "bg-[#125B3E]", text: "text-white" },
    { name: "Or d'Afrique", hex: "#FFB800", bg: "bg-[#FFB800]", text: "text-[#131622]" },
    { name: "Terre Cuite", hex: "#C2410C", bg: "bg-[#C2410C]", text: "text-white" },
    { name: "Noir Ébène", hex: "#131622", bg: "bg-[#131622]", text: "text-white" },
    { name: "Ivoire / Coton écru", hex: "#FAF8F5", bg: "bg-[#FAF8F5]", text: "text-[#131622]", border: true },
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-between p-4 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Header / Announcement */}
      <div className="w-full bg-[#125B3E] text-white text-xs sm:text-sm py-2 px-4 rounded-xl text-center shadow-sm flex items-center justify-center gap-2 mb-6">
        <span className="inline-block w-2 h-2 rounded-full bg-[#FFB800] animate-pulse"></span>
        <span>Plateforme nationale de l&apos;artisanat d&apos;art sénégalais — Phase 1 validée</span>
      </div>

      {/* Hero with Official Logo */}
      <section className="w-full flex flex-col items-center text-center my-4 sm:my-8 bg-white/70 backdrop-blur-sm p-6 sm:p-10 rounded-2xl border border-stone-200/80 shadow-sm">
        <div className="relative w-full max-w-[340px] sm:max-w-[420px] aspect-[3/2] mb-4">
          <Image
            src="/images/logo.png"
            alt="Logo officiel SUNU ARTISANAT"
            fill
            priority
            sizes="(max-width: 640px) 340px, 420px"
            className="object-contain"
          />
        </div>

        <p className="text-stone-600 max-w-xl text-base sm:text-lg mb-6 leading-relaxed">
          Plateforme e-commerce multi-artisans, traçabilité par QR Code, vitrines numériques d&apos;ateliers et paiements sénégalais &amp; internationaux.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#125B3E]/10 text-[#125B3E]">
            <CheckCircle2 className="w-4 h-4 text-[#125B3E]" /> Phase 1 : Fondations
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#C2410C]/10 text-[#C2410C]">
            <CheckCircle2 className="w-4 h-4 text-[#C2410C]" /> Conforme Cahier v2.0
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFB800]/20 text-[#9A6F00]">
            <CheckCircle2 className="w-4 h-4 text-[#FFB800]" /> PWA Ready
          </span>
        </div>
      </section>

      {/* Palette du Sénégal */}
      <section className="w-full my-6">
        <h2 className="text-lg font-bold text-[#131622] mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FFB800]" /> Charte Visuelle &amp; Thème Sénégal
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {palette.map((color) => (
            <div
              key={color.hex}
              className={`p-3 rounded-xl ${color.bg} ${color.text} ${
                color.border ? "border border-stone-300" : ""
              } shadow-sm flex flex-col justify-between min-h-[90px]`}
            >
              <span className="text-xs font-semibold line-clamp-1">{color.name}</span>
              <span className="text-xs font-mono font-bold mt-2">{color.hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist Socle Technique */}
      <section className="w-full my-6 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
        <h2 className="text-lg font-bold text-[#131622] mb-4">Socle Technique Déployé (Phase 1)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {foundationItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="p-2 rounded-lg bg-[#125B3E]/10 text-[#125B3E] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#131622]">{item.title}</h3>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer minimaliste de fondation */}
      <footer className="w-full text-center py-6 text-xs text-stone-500 border-t border-stone-200 mt-8">
        <p>© 2026 SUNU ARTISANAT. Fait avec passion pour valoriser le patrimoine sénégalais.</p>
        <p className="mt-1 text-[11px] text-stone-400">Casamance • Thiès • Dakar • Saint-Louis</p>
      </footer>
    </main>
  );
}
