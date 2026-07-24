"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Gamepad2, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const cards = [
  {
    href: "/platform",
    title: "Платформа",
    subtitle: "Карты Таро, знаки, сны и персональные разборы",
    description: "Цифровая платформа с картами, раскладами, энциклопедией символов, дневником снов и AI-ассистентом.",
    icon: Sparkles,
    gradient: "from-burgundy/40 to-purple-deep/40",
    border: "border-burgundy/30 hover:border-gold/40",
    glow: "glow-purple",
  },
  {
    href: "/game",
    title: "Онлайн-игра",
    subtitle: "Истории, задания, коллекции и интерактивные испытания",
    description: "Погрузитесь в истории сериала через интерактивные испытания, коллекции и задания.",
    icon: Gamepad2,
    gradient: "from-purple-deep/40 to-graphite-light/40",
    border: "border-purple-muted/30 hover:border-gold/40",
    glow: "glow-purple",
  },
  {
    href: "/shop",
    title: "Магазин",
    subtitle: "Колоды, свечи, аксессуары и коллекционные предметы",
    description: "Физические и цифровые товары: колоды, свечи, аксессуары с бонусами для платформы.",
    icon: ShoppingBag,
    gradient: "from-graphite-light/40 to-burgundy/30",
    border: "border-border hover:border-gold/40",
    glow: "glow-gold",
  },
];

export function EcosystemCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Link
              href={card.href}
              className={cn(
                "group block rounded-2xl border bg-gradient-to-br p-6 md:p-8 transition-all duration-300 hover:scale-[1.02] h-full",
                card.gradient,
                card.border,
                card.glow
              )}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-background/30 border border-gold/20 group-hover:border-gold/50 transition-colors">
                  <Icon className="h-7 w-7 text-gold" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-gold/80 mb-3">{card.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
              <Button variant="outline" size="sm" className="mt-6 pointer-events-none">
                Перейти
              </Button>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
