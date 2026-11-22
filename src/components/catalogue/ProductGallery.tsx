"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: { id: string; url: string; altText?: string | null; isPrimary: boolean }[];
  productTitle: string;
}

export default function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  const [current, setCurrent] = useState(0);

  if (sorted.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-6xl">
        🧵
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
        <Image
          src={sorted[current].url}
          alt={sorted[current].altText ?? productTitle}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setCurrent(idx)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                idx === current
                  ? "border-[var(--color-primary)]"
                  : "border-transparent hover:border-gray-300"
              }`}
              aria-label={`Image ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? productTitle}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
