"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { RotateCcw, Save, Sparkles } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TarotCardFlip } from "@/components/tarot/TarotCardFlip";
import { LockedContent } from "@/components/shared/LockedContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getSpreadBySlug } from "@/data/spreads";
import { tarotCards, getTarotCardBySlug } from "@/data/tarotCards";
import { sendMessage } from "@/services/interpreter";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useHydration";
import { useFreeSpreadCooldown } from "@/hooks/useFreeSpreadCooldown";
import { getRandomItems } from "@/lib/utils";
import { formatCooldown } from "@/data/daily";
import { notFound } from "next/navigation";

type Step = "question" | "select" | "reveal" | "interpretation";

interface SelectedCard {
  positionId: string;
  cardSlug: string;
  flipped: boolean;
}

export default function SpreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const spread = getSpreadBySlug(slug);

  const [step, setStep] = useState<Step>("question");
  const [question, setQuestion] = useState("");
  const [deck, setDeck] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [interpretation, setInterpretation] = useState("");
  const [loadingInterpretation, setLoadingInterpretation] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveSpread = useAppStore((s) => s.saveSpread);
  const addToast = useAppStore((s) => s.addToast);
  const { isPremium, hydrated } = useAuth();
  const { available, remaining } = useFreeSpreadCooldown();

  if (!spread) notFound();

  const isLocked = spread.premium && !isPremium;
  const freeOnCooldown = !spread.premium && !isPremium && !available;

  const initDeck = useCallback(() => {
    const available = tarotCards.filter((c) => !c.premium || isPremium);
    setDeck(getRandomItems(available.map((c) => c.slug), available.length));
  }, [isPremium]);

  const handleStart = () => {
    if (!question.trim()) return;
    if (!isPremium && !available) {
      addToast({
        title: "Лимит раскладов",
        description: `Новый расклад через ${formatCooldown(remaining)}`,
        variant: "error",
      });
      return;
    }
    initDeck();
    setSelectedCards([]);
    setCurrentPositionIndex(0);
    setInterpretation("");
    setSaved(false);
    setStep("select");
  };

  const handleSelectCard = (cardSlug: string) => {
    if (currentPositionIndex >= spread.positions.length) return;

    const position = spread.positions[currentPositionIndex];
    const newSelected: SelectedCard = {
      positionId: position.id,
      cardSlug,
      flipped: false,
    };

    const updated = [...selectedCards, newSelected];
    setSelectedCards(updated);
    setDeck((d) => d.filter((s) => s !== cardSlug));

    if (currentPositionIndex + 1 >= spread.positions.length) {
      setStep("reveal");
    } else {
      setCurrentPositionIndex(currentPositionIndex + 1);
    }
  };

  const handleFlipCard = (index: number) => {
    setSelectedCards((cards) =>
      cards.map((c, i) => (i === index ? { ...c, flipped: true } : c))
    );
  };

  const allFlipped = selectedCards.every((c) => c.flipped);

  const handleGetInterpretation = async () => {
    setLoadingInterpretation(true);
    const cardNames = selectedCards
      .map((c) => getTarotCardBySlug(c.cardSlug)?.name)
      .filter(Boolean)
      .join(", ");
    const positionNames = selectedCards
      .map((c) => {
        const pos = spread.positions.find((p) => p.id === c.positionId);
        const card = getTarotCardBySlug(c.cardSlug);
        return `${pos?.name}: ${card?.name}`;
      })
      .join("; ");

    const result = await sendMessage(
      "spread",
      `Расклад «${spread.name}». Вопрос: ${question}. Позиции: ${positionNames}. Карты: ${cardNames}`
    );
    setInterpretation(result);
    setLoadingInterpretation(false);
    setStep("interpretation");

    saveSpread({
      spreadSlug: spread.slug,
      question: question.trim(),
      cards: selectedCards.map(({ positionId, cardSlug }) => ({ positionId, cardSlug })),
      interpretation: result,
    });
    setSaved(true);
    addToast({
      title: "Расклад сохранён",
      description: "Добавлен в Мою книгу → Расклады",
      variant: "success",
    });
  };

  const handleSave = () => {
    saveSpread({
      spreadSlug: spread.slug,
      question: question.trim(),
      cards: selectedCards.map(({ positionId, cardSlug }) => ({ positionId, cardSlug })),
      interpretation,
    });
    setSaved(true);
    addToast({
      title: "Расклад сохранён",
      description: "Добавлен в Мою книгу → Расклады",
      variant: "success",
    });
  };

  const handleReset = () => {
    setStep("question");
    setQuestion("");
    setSelectedCards([]);
    setCurrentPositionIndex(0);
    setInterpretation("");
    setSaved(false);
    setDeck([]);
  };

  const progressPercent =
    spread.positions.length > 0
      ? Math.round((selectedCards.length / spread.positions.length) * 100)
      : 0;

  if (!hydrated) {
    return <div className="animate-pulse h-96 bg-secondary/50 rounded-xl" />;
  }

  if (isLocked) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: "Расклады", href: "/platform/spreads" },
            { label: spread.name },
          ]}
        />
        <PageHeader title={spread.name} description={spread.description} />
        <LockedContent
          title={`Расклад «${spread.name}»`}
          description="Этот расклад доступен по подписке Гадалка+"
        />
      </>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Расклады", href: "/platform/spreads" },
          { label: spread.name },
        ]}
      />

      <PageHeader title={spread.name} description={spread.description}>
        <Badge variant={spread.premium ? "premium" : "free"}>
          {spread.premium ? "Премиум" : "Бесплатно"}
        </Badge>
      </PageHeader>

      {/* Spread info */}
      <div className="rounded-xl border border-border bg-card/50 p-6 mb-8">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <span>{spread.cardCount} карт</span>
          <span>·</span>
          <span>{spread.duration}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {spread.positions.map((pos, i) => (
            <div
              key={pos.id}
              className={`rounded-lg border p-3 text-sm ${
                selectedCards[i]
                  ? "border-gold/40 bg-burgundy/10"
                  : currentPositionIndex === i && step === "select"
                    ? "border-gold bg-burgundy/5"
                    : "border-border"
              }`}
            >
              <p className="font-medium">{pos.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{pos.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      {step !== "question" && (
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Прогресс расклада</span>
            <span>
              {selectedCards.length} / {spread.positions.length}
            </span>
          </div>
          <Progress value={progressPercent} />
        </div>
      )}

      {/* Step: Question */}
      {step === "question" && freeOnCooldown && (
        <div className="rounded-xl border border-gold/20 bg-burgundy/10 p-8 max-w-xl text-center">
          <p className="font-serif text-xl text-gold-light mb-2">Расклад на паузе</p>
          <p className="text-sm text-muted-foreground mb-6">
            Бесплатный расклад будет доступен через
          </p>
          <Button disabled className="min-w-[220px]">
            Через {formatCooldown(remaining)}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            На бесплатном тарифе — 1 расклад в сутки
          </p>
        </div>
      )}

      {step === "question" && !freeOnCooldown && (
        <div className="rounded-xl border border-border bg-card/50 p-8 max-w-xl">
          <SectionHeader
            title="Сформулируйте вопрос"
            description="Чёткий вопрос поможет получить более точное послание"
          />
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Ваш вопрос</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Например: Что мне важно понять в текущей ситуации?"
                className="mt-2"
              />
            </div>
            <Button onClick={handleStart} disabled={!question.trim()}>
              <Sparkles className="h-4 w-4 mr-2" />
              Сделать расклад
            </Button>
            {!isPremium && (
              <p className="text-xs text-muted-foreground">
                Бесплатный тариф: 1 расклад в сутки. После расклада он сохранится в Мою книгу.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step: Select cards */}
      {step === "select" && (
        <div>
          <SectionHeader
            title={`Выберите карту: ${spread.positions[currentPositionIndex]?.name}`}
            description={spread.positions[currentPositionIndex]?.description}
          />
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {deck.slice(0, 12).map((cardSlug) => (
              <button
                key={cardSlug}
                onClick={() => handleSelectCard(cardSlug)}
                className="aspect-[2/3] rounded-lg bg-gradient-to-br from-burgundy to-purple-deep border border-gold/20 hover:border-gold/50 transition-all flex items-center justify-center"
                aria-label="Выбрать карту"
              >
                <span className="text-gold text-lg">✦</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Выберите карту, которая откликается на позицию «{spread.positions[currentPositionIndex]?.name}»
          </p>
        </div>
      )}

      {/* Step: Reveal / Flip */}
      {(step === "reveal" || step === "interpretation") && (
        <div>
          <SectionHeader
            title={step === "reveal" ? "Откройте карты" : "Ваш расклад"}
            description={
              step === "reveal"
                ? "Нажмите на каждую карту, чтобы перевернуть"
                : question
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {selectedCards.map((selected, index) => {
              const card = getTarotCardBySlug(selected.cardSlug);
              const position = spread.positions.find((p) => p.id === selected.positionId);
              return (
                <div key={selected.positionId} className="text-center">
                  <p className="text-sm text-gold mb-1">{position?.name}</p>
                  <p className="text-xs text-muted-foreground mb-4">{position?.description}</p>
                  <div className="flex justify-center">
                    <TarotCardFlip
                      card={card}
                      flipped={selected.flipped}
                      onFlip={() => handleFlipCard(index)}
                      size="md"
                    />
                  </div>
                  {selected.flipped && card && (
                    <p className="font-serif text-lg mt-4">{card.name}</p>
                  )}
                </div>
              );
            })}
          </div>

          {step === "reveal" && allFlipped && (
            <div className="text-center">
              <Button onClick={handleGetInterpretation} disabled={loadingInterpretation}>
                {loadingInterpretation ? "Толкование..." : "Получить толкование"}
              </Button>
            </div>
          )}

          {step === "interpretation" && interpretation && (
            <div className="rounded-xl border border-gold/20 bg-burgundy/10 p-6 mb-6">
              <h3 className="font-serif text-xl mb-4">Толкование</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {interpretation}
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button onClick={handleSave} disabled={saved}>
                  <Save className="h-4 w-4 mr-2" />
                  {saved ? "Сохранено" : "Сохранить расклад"}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Новый расклад
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/platform/interpreter">Обсудить с Толкователем</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {step !== "question" && step !== "interpretation" && (
        <div className="mt-6">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Начать заново
          </Button>
        </div>
      )}

    </>
  );
}
