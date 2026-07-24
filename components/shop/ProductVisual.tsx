"use client";

import type { ProductCategory } from "@/types";
import { cn } from "@/lib/utils";

interface ProductVisualProps {
  category: ProductCategory;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: 64, md: 120, lg: 200 };

export function ProductVisual({ category, className, size = "md" }: ProductVisualProps) {
  const dim = sizes[size];

  return (
    <svg
      viewBox="0 0 120 120"
      width={dim}
      height={dim}
      className={cn("mx-auto", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`prod-grad-${category}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5a4550" />
          <stop offset="100%" stopColor="#3a3238" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="8" fill={`url(#prod-grad-${category})`} />
      <rect x="12" y="12" width="96" height="96" rx="4" fill="none" stroke="#d8bc78" strokeWidth="0.8" opacity="0.35" />

      {category === "cards" && (
        <>
          <rect x="38" y="28" width="44" height="64" rx="3" fill="#4a3c44" stroke="#d8bc78" strokeWidth="1" opacity="0.9" />
          <rect x="32" y="34" width="44" height="64" rx="3" fill="none" stroke="#d8bc78" strokeWidth="0.6" opacity="0.5" />
          <circle cx="60" cy="58" r="10" fill="none" stroke="#d8bc78" strokeWidth="0.8" />
        </>
      )}

      {category === "candles" && (
        <>
          <rect x="28" y="52" width="10" height="36" rx="2" fill="#6b3d4c" />
          <rect x="44" y="44" width="10" height="44" rx="2" fill="#7a4050" />
          <rect x="60" y="50" width="10" height="38" rx="2" fill="#5a4550" />
          <line x1="33" y1="52" x2="33" y2="46" stroke="#d8bc78" strokeWidth="1.5" />
          <line x1="49" y1="44" x2="49" y2="38" stroke="#d8bc78" strokeWidth="1.5" />
          <line x1="65" y1="50" x2="65" y2="44" stroke="#d8bc78" strokeWidth="1.5" />
        </>
      )}

      {category === "accessories" && (
        <>
          <path d="M30 70 L60 35 L90 70 L60 95 Z" fill="none" stroke="#d8bc78" strokeWidth="1" />
          <circle cx="60" cy="62" r="14" fill="none" stroke="#d8bc78" strokeWidth="0.8" opacity="0.6" />
        </>
      )}

      {category === "gift_sets" && (
        <>
          <rect x="32" y="48" width="56" height="40" rx="2" fill="#4a3c44" stroke="#d8bc78" strokeWidth="0.8" />
          <line x1="32" y1="58" x2="88" y2="58" stroke="#d8bc78" strokeWidth="0.8" />
          <line x1="60" y1="48" x2="60" y2="88" stroke="#d8bc78" strokeWidth="0.8" />
        </>
      )}

      {category === "digital" && (
        <>
          <rect x="34" y="38" width="52" height="44" rx="4" fill="none" stroke="#d8bc78" strokeWidth="1" />
          <path d="M48 58 L56 66 L72 50" fill="none" stroke="#d8bc78" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}

      {category === "board_games" && (
        <>
          <rect x="30" y="40" width="60" height="40" rx="3" fill="#4a3c44" stroke="#d8bc78" strokeWidth="0.8" />
          <circle cx="45" cy="55" r="4" fill="#d8bc78" opacity="0.5" />
          <circle cx="75" cy="65" r="4" fill="#d8bc78" opacity="0.5" />
        </>
      )}
    </svg>
  );
}
