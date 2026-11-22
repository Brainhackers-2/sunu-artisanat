"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export interface HeroCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
}

const DEFAULT_SLIDES = [
  {
    name: "Bijouterie & Orfèvrerie",
    slug: "bijouterie",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
    subtitle: "Filigrane d'or et d'argent forgé selon la tradition séculaire de Saint-Louis et Dakar.",
  },
  {
    name: "Maroquinerie d'Art",
    slug: "maroquinerie",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=80",
    subtitle: "Sacs, babouches et ceintures en cuir pleine fleur tanné naturellement à Thiès.",
  },
  {
    name: "Poterie & Céramique",
    slug: "poterie",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80",
    subtitle: "Argile rouge modelée à la main et cuite à l'étouffée par les potières de Casamance.",
  },
  {
    name: "Tissage & Textiles Manjak",
    slug: "tissage",
    image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1600&q=80",
    subtitle: "Pagnes tissés et motifs géométriques porteurs d'histoire et de bénédictions.",
  },
  {
    name: "Sculpture sur Bois d'Ébène",
    slug: "sculpture",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=80",
    subtitle: "Masques traditionnels et statuettes sculptés dans des bois nobles sénégalais.",
  },
];

interface AnimatedHeroProps {
  categories: HeroCategory[];
}

export default function AnimatedHero({ categories }: AnimatedHeroProps) {
  // Construire la liste des slides synchronisée sur les catégories réelles
  const slides =
    categories.length > 0
      ? categories.map((cat, idx) => {
          const fallback = DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length];
          return {
            name: cat.name,
            slug: cat.slug,
            image: cat.imageUrl || fallback.image,
            subtitle: cat.description || fallback.subtitle,
          };
        })
      : DEFAULT_SLIDES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Bascule automatique toutes les 5 secondes
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      className="relative w-full h-[480px] sm:h-[540px] lg:h-[580px] overflow-hidden bg-[#131622] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Images d'arrière-plan en transition fluide */}
      {slides.map((slide, index) => (
        <div
          key={slide.slug + index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
          }`}
          style={{ transition: "opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1), transform 6000ms ease-out" }}
        >
          <Image
            src={slide.image}
            alt={slide.name}
            fill
            priority={index === 0}
            className="object-cover object-center"
          />
          {/* Filtre sombre immersif (from-black/80 via-black/40) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
        </div>
      ))}

      {/* Contenu central */}
      <div className="relative z-10 max-w-5xl mx-auto h-full px-4 sm:px-6 flex flex-col justify-center items-center text-center">
        {/* Badge haut : Pilule vert émeraude (#167949) avec icône bouclier */}
        <div className="inline-flex items-center gap-2 bg-[#167949]/90 backdrop-blur-md text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4 shadow-lg border border-white/20">
          <Shield className="w-3.5 h-3.5 text-[#FFB800]" />
          <span>Catégorie • {currentSlide.name}</span>
        </div>

        {/* Grand Titre : Plateforme de l'Artisanat Sénégalais */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 leading-tight drop-shadow-md">
          Plateforme de l&apos;{" "}
          <span className="text-[#FFB800] underline decoration-[#FFB800]/40 decoration-wavy">
            Artisanat Sénégalais
          </span>
        </h1>

        {/* Sous-titre : Texte blanc/pierre (text-stone-200) valorisant le patrimoine et la traçabilité */}
        <p className="text-stone-200 text-sm sm:text-base lg:text-lg max-w-2xl mb-8 leading-relaxed drop-shadow-sm font-medium">
          {currentSlide.subtitle}
        </p>

        {/* Deux Boutons Centraux */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
          {/* Bouton 1 (Jaune or) : DÉCOUVRIR [CATÉGORIE] */}
          <Link
            href={`/categories/${currentSlide.slug}`}
            className="bg-[#FFB800] text-stone-950 hover:bg-[#E5A700] font-black text-xs sm:text-sm tracking-wider uppercase px-7 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 min-h-[48px] flex items-center gap-2"
          >
            <span>DÉCOUVRIR {currentSlide.name.toUpperCase()}</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </Link>

          {/* Bouton 2 (Contour blanc) : TOUTES LES CATÉGORIES */}
          <Link
            href="/categories"
            className="border-2 border-white text-white hover:bg-white/15 backdrop-blur-xs font-bold text-xs sm:text-sm tracking-wider uppercase px-7 py-3.5 rounded-full transition-all min-h-[48px] flex items-center justify-center"
          >
            TOUTES LES CATÉGORIES
          </Link>
        </div>
      </div>

      {/* Flèches latérales : Cercles sombres translucides avec chevrons blancs */}
      <button
        onClick={prevSlide}
        aria-label="Catégorie précédente"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all hover:scale-105"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Catégorie suivante"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all hover:scale-105"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination basse : Points de navigation avec barre étirée jaune or pour la slide active */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Aller au slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? "w-8 h-2.5 bg-[#FFB800] shadow-md"
                : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
