"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TarotCardFlip } from "@/components/tarot/TarotCardFlip";
import { SymbolCard } from "@/components/platform/SymbolCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { getDailyCard, getDailySymbol } from "@/data/daily";
import { getTarotCardBySlug } from "@/data/tarotCards";
import { getSymbolBySlug } from "@/data/symbols";
import { getTodayHoroscope, getZodiacName } from "@/data/horoscopes";
import { questionTopics, dailyQuestions } from "@/data/achievements";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useHydration";
import { formatDate } from "@/lib/utils";
import type { ZodiacSign } from "@/types";

export default function TodayPage() {
  const { hydrated, user } = useAuth();
  const zodiacSign = user?.zodiacSign as ZodiacSign | undefined;
  const daily = getDailyCard(zodiacSign);
  const dailySymbol = getDailySymbol();
  const card = getTarotCardBySlug(daily.cardSlug);
  const symbol = getSymbolBySlug(dailySymbol.symbolSlug);
  const horoscope = zodiacSign ? getTodayHoroscope(zodiacSign) : null;
  const zodiacName = zodiacSign ? getZodiacName(zodiacSign) : null;

  const [flipped, setFlipped] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [whatHappened, setWhatHappened] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [cardMatched, setCardMatched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addEveningEntry = useAppStore((s) => s.addEveningEntry);
  const eveningEntries = useAppStore((s) => s.eveningEntries);
  const addToast = useAppStore((s) => s.addToast);

  const todayEntry = eveningEntries.find((e) => e.date === daily.date);

  const handleEveningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatHappened.trim()) return;

    addEveningEntry({
      date: daily.date,
      whatHappened: whatHappened.trim(),
      cardMatched,
      thoughts: thoughts.trim(),
    });
    addToast({ title: "Запись сохранена", description: "Вечерняя рефлексия добавлена в архив", variant: "success" });
    setSubmitted(true);
  };

  const activeQuestion = selectedTopic ? dailyQuestions[selectedTopic] : daily.question;

  if (!hydrated) {
    return <div className="animate-pulse h-96 bg-secondary/50 rounded-xl" />;
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Сегодня" }]} />
      <PageHeader
        title="Сегодня"
        description={`${formatDate(daily.date)} — ваш ежедневный ритуал размышления`}
      />

      <section className="mb-10">
        <SectionHeader title="Карта дня" description="Нажмите на карту, чтобы открыть послание" />
        <div className="glass-card rounded-2xl p-6 md:p-10">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start lg:gap-12">
            <div className="shrink-0 drop-shadow-[0_24px_40px_rgba(0,0,0,0.3)]">
              <TarotCardFlip
                card={card}
                flipped={flipped}
                onFlip={() => setFlipped(!flipped)}
                size="lg"
              />
            </div>

            <div className="min-w-0 flex-1 text-center md:text-left">
              {flipped && card ? (
                <div className="space-y-6">
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-gold/65">
                      Послание дня
                    </p>
                    <h3 className="font-serif text-3xl font-medium tracking-wide text-gold-light md:text-4xl">
                      {card.name}
                    </h3>
                    <p className="mt-3 text-sm text-cream-muted">{card.shortMeaning}</p>
                  </div>

                  <div className="decorative-line" />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-gold/65">Тема</p>
                      <p className="font-serif text-xl text-cream">{daily.theme}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-gold/65">Вопрос</p>
                      <p className="font-serif text-lg italic text-cream/85">
                        &ldquo;{activeQuestion}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-gold/65">
                      Толкование
                    </p>
                    <p className="text-sm leading-relaxed text-cream/90 md:text-[0.95rem]">
                      {card.fullMeaning}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <p className="rounded-lg border border-gold/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-mist/80">
                        <span className="mb-1 block text-gold/70">Светлая сторона</span>
                        {card.lightSide}
                      </p>
                      <p className="rounded-lg border border-gold/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-mist/80">
                        <span className="mb-1 block text-gold/70">Теневая сторона</span>
                        {card.shadowSide}
                      </p>
                    </div>
                  </div>

                  {horoscope && zodiacName ? (
                    <div className="rounded-xl border border-gold/20 bg-burgundy/10 p-5 space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-gold/70">
                        Соответствие со знаком · {zodiacName}
                      </p>
                      <p className="text-sm leading-relaxed text-cream/90">
                        Карта «{card.name}» сегодня резонирует с энергией {zodiacName}: тема «
                        {daily.theme}» усиливает то, что уже заложено в вашем гороскопе.
                      </p>
                      <p className="text-sm leading-relaxed text-cream-muted">
                        {horoscope.sections.general}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-gold/12 bg-black/15 p-3">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-gold/60 mb-1.5">
                            Любовь
                          </p>
                          <p className="text-xs leading-relaxed text-cream/80 line-clamp-4">
                            {horoscope.sections.love}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gold/12 bg-black/15 p-3">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-gold/60 mb-1.5">
                            Финансы
                          </p>
                          <p className="text-xs leading-relaxed text-cream/80 line-clamp-4">
                            {horoscope.sections.finance}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gold/15 bg-white/[0.03] p-5">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-gold/65">
                        Соответствие со знаком
                      </p>
                      <p className="text-sm leading-relaxed text-cream-muted">
                        Укажите знак зодиака в{" "}
                        <Link href="/platform/profile" className="text-gold underline-offset-2 hover:underline">
                          профиле
                        </Link>
                        , чтобы видеть, как карта дня связана с вашим гороскопом.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground md:pt-16">
                  Откройте карту, чтобы узнать послание дня
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader
          title="Знак дня"
          description="Обратите внимание на этот символ в течение дня"
        />
        {symbol && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SymbolCard symbol={symbol} />
            <div className="rounded-xl border border-border bg-card/50 p-6">
              <h3 className="font-serif text-lg mb-3">Вопросы для размышления</h3>
              <ul className="space-y-2">
                {symbol.reflectionQuestions.map((q) => (
                  <li key={q} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-gold shrink-0">✦</span>
                    {q}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href={`/platform/symbols/${symbol.slug}`}>Изучить символ</Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="mb-10">
        <SectionHeader
          title="Темы для вопросов"
          description="Выберите тему — получите персональный вопрос для размышления"
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {questionTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id === selectedTopic ? null : topic.id)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                selectedTopic === topic.id
                  ? "border-gold bg-burgundy/20 text-gold"
                  : "border-border hover:border-gold/30 text-muted-foreground"
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-gold/20 bg-burgundy/10 p-6">
          <p className="text-sm text-gold mb-2">Ваш вопрос на сегодня</p>
          <p className="font-serif text-lg italic">&ldquo;{activeQuestion}&rdquo;</p>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Вечерняя запись"
          description="Подведите итоги дня и отметьте, совпало ли послание карты"
        />
        {todayEntry || submitted ? (
          <div className="rounded-xl border border-border bg-card/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="h-5 w-5 text-gold" />
              <span className="font-medium">Запись на сегодня сохранена</span>
            </div>
            <p className="text-sm text-muted-foreground">{todayEntry?.whatHappened ?? whatHappened}</p>
            {(todayEntry?.cardMatched ?? cardMatched) && (
              <Badge variant="premium" className="mt-3">Карта дня отозвалась</Badge>
            )}
            {(todayEntry?.thoughts ?? thoughts) && (
              <p className="text-sm mt-3 italic text-muted-foreground">
                {todayEntry?.thoughts ?? thoughts}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleEveningSubmit} className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
            <div>
              <Label htmlFor="whatHappened">Что произошло сегодня?</Label>
              <Textarea
                id="whatHappened"
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                placeholder="Опишите ключевые события и впечатления дня..."
                className="mt-2 min-h-[100px]"
                required
              />
            </div>
            <div>
              <Label htmlFor="thoughts">Мысли и выводы</Label>
              <Textarea
                id="thoughts"
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder="Что вы поняли или почувствовали?"
                className="mt-2 min-h-[80px]"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="cardMatched"
                checked={cardMatched}
                onCheckedChange={setCardMatched}
              />
              <Label htmlFor="cardMatched" className="cursor-pointer">
                Карта дня отозвалась в событиях дня
              </Label>
            </div>
            <Button type="submit" disabled={!whatHappened.trim()}>
              Сохранить запись
            </Button>
          </form>
        )}
      </section>
    </>
  );
}
