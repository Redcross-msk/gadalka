"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store/useAppStore";
import { interestOptions, directionOptions } from "@/data/user";
import { zodiacSigns } from "@/data/horoscopes";
import { getZodiacFromDate } from "@/data/natal";
import { cn } from "@/lib/utils";
import type { NatalChart, ZodiacSign } from "@/types";

const steps = [
  { id: 1, title: "Знак зодиака", description: "Обязательно — для гороскопа на сегодня" },
  { id: 2, title: "Интересы", description: "Что вам близко в жизни?" },
  { id: 3, title: "Направление", description: "С чего хотите начать?" },
  { id: 4, title: "Натальная карта", description: "Дата и время рождения" },
  { id: 5, title: "Готово", description: "Профиль настроен" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const addToast = useAppStore((s) => s.addToast);

  const [step, setStep] = useState(1);
  const [zodiacSign, setZodiacSign] = useState<ZodiacSign | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [direction, setDirection] = useState<"platform" | "game" | "shop">("platform");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");

  const progress = (step / steps.length) * 100;
  const derivedSign = birthDate ? getZodiacFromDate(birthDate) : null;

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
      return;
    }

    if (!zodiacSign) return;

    const natalChart: NatalChart | undefined = birthDate
      ? {
          birthDate,
          birthTime: birthTime || undefined,
          birthPlace: birthPlace || undefined,
        }
      : undefined;

    completeOnboarding({
      interests,
      direction,
      zodiacSign: derivedSign ?? zodiacSign,
      natalChart,
    });
    addToast({
      title: "Добро пожаловать!",
      description: "Профиль и натальная карта настроены",
      variant: "success",
    });
    router.push("/platform");
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed =
    step === 1 ? zodiacSign !== null :
    step === 2 ? interests.length > 0 :
    step === 3 ? !!direction :
    step === 4 ? !!birthDate :
    zodiacSign !== null;

  const selectedZodiac = zodiacSigns.find((z) => z.id === (derivedSign ?? zodiacSign));

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12 max-w-lg">
      <div className="flex justify-center mb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-burgundy/30 border border-gold/20">
          <Sparkles className="h-7 w-7 text-gold" />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Шаг {step} из {steps.length}</span>
          <span>{steps[step - 1].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-center">
            {steps[step - 1].title}
          </h1>
          <p className="text-muted-foreground text-center mt-2 mb-8">
            {steps[step - 1].description}
          </p>

          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {zodiacSigns.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setZodiacSign(z.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all min-h-[72px]",
                    zodiacSign === z.id
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-border hover:border-gold/30"
                  )}
                >
                  <p className="font-serif text-sm font-medium">{z.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{z.dates}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {interestOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleInterest(opt.id)}
                  className={cn(
                    "rounded-xl border p-3 text-sm text-left transition-all min-h-[56px]",
                    interests.includes(opt.id)
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-border hover:border-gold/30"
                  )}
                >
                  <span className="mr-1.5">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {directionOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDirection(opt.id as "platform" | "game" | "shop")}
                  className={cn(
                    "w-full rounded-xl border p-5 text-left transition-all",
                    direction === opt.id
                      ? "border-gold/50 bg-gold/10"
                      : "border-border hover:border-gold/30"
                  )}
                >
                  <p className="font-serif text-lg">{opt.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 rounded-xl border border-gold/20 bg-burgundy/10 p-5">
              <div>
                <Label htmlFor="onb-birthDate">Дата рождения</Label>
                <Input
                  id="onb-birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="onb-birthTime">Время рождения</Label>
                <Input
                  id="onb-birthTime"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="mt-2"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Необязательно</p>
              </div>
              <div>
                <Label htmlFor="onb-birthPlace">Место рождения</Label>
                <Input
                  id="onb-birthPlace"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Город"
                  className="mt-2"
                />
              </div>
              {derivedSign && (
                <p className="text-sm text-gold">
                  Знак по дате: {zodiacSigns.find((z) => z.id === derivedSign)?.name}
                </p>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-burgundy/20 to-purple-deep/20 p-6 md:p-8 text-center">
              <span className="text-5xl">✦</span>
              <h2 className="font-serif text-xl mt-4">Всё готово!</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Один профиль действует на платформе, в игре и в магазине.
              </p>
              <div className="mt-6 text-left text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">Знак:</span>{" "}
                  {selectedZodiac?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Интересы:</span>{" "}
                  {interests
                    .map((id) => {
                      const opt = interestOptions.find((o) => o.id === id);
                      return opt ? `${opt.emoji} ${opt.label}` : id;
                    })
                    .join(", ")}
                </p>
                <p>
                  <span className="text-muted-foreground">Направление:</span>{" "}
                  {directionOptions.find((o) => o.id === direction)?.label}
                </p>
                {birthDate && (
                  <p>
                    <span className="text-muted-foreground">Натальная карта:</span>{" "}
                    {new Date(birthDate).toLocaleDateString("ru-RU")}
                    {birthTime ? `, ${birthTime}` : ""}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-10">
        {step > 1 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад
          </Button>
        )}
        <Button onClick={handleNext} disabled={!canProceed} className="flex-1">
          {step === 5 ? "Перейти на платформу" : "Далее"}
          {step < 5 && <ArrowRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
