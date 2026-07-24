"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TarotCard } from "@/types";

interface TarotCardFlipProps {
  card?: TarotCard;
  flipped?: boolean;
  onFlip?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TarotCardFlip({ card, flipped: controlledFlipped, onFlip, className, size = "md" }: TarotCardFlipProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped ?? internalFlipped;

  const handleFlip = () => {
    if (onFlip) onFlip();
    else setInternalFlipped(!internalFlipped);
  };

  const sizes = {
    sm: "w-24 h-36",
    md: "w-32 h-48",
    lg: "w-40 h-60",
  };

  return (
    <div
      className={cn("perspective-1000 cursor-pointer", sizes[size], className)}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleFlip()}
      aria-label={isFlipped ? `Карта: ${card?.name}` : "Закрытая карта — нажмите, чтобы открыть"}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-burgundy to-purple-deep border-2 border-gold/30 flex items-center justify-center backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full border border-gold/40 flex items-center justify-center mb-2">
              <span className="text-gold text-xl">✦</span>
            </div>
            <p className="text-xs text-gold/60 font-serif tracking-widest uppercase">Гадалка</p>
          </div>
        </div>

        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-graphite-light to-burgundy/20 border-2 border-gold/40 flex items-center justify-center backface-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {card ? (
            <div className="text-center p-3">
              <span className="text-3xl font-serif text-gold">{card.number}</span>
              <p className="text-sm font-serif text-foreground mt-2">{card.name}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{card.shortMeaning}</p>
            </div>
          ) : (
            <span className="text-gold text-2xl">?</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
