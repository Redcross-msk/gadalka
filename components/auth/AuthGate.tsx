"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { loginAction, registerAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { interestOptions } from "@/data/user";
import { zodiacSigns } from "@/data/horoscopes";
import { getZodiacFromDate } from "@/data/natal";
import { cn } from "@/lib/utils";
import type { ZodiacSign as AppZodiac } from "@/types";

type Mode = "login" | "register";

const appToDb: Record<AppZodiac, string> = {
  aries: "ARIES",
  taurus: "TAURUS",
  gemini: "GEMINI",
  cancer: "CANCER",
  leo: "LEO",
  virgo: "VIRGO",
  libra: "LIBRA",
  scorpio: "SCORPIO",
  sagittarius: "SAGITTARIUS",
  capricorn: "CAPRICORN",
  aquarius: "AQUARIUS",
  pisces: "PISCES",
};

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [zodiacSign, setZodiacSign] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);

  const forced = search.get("auth") === "required";
  const from = search.get("from") || "";

  const authenticated = status === "authenticated" && Boolean(session?.user?.id);
  const showGate = status !== "loading" && !authenticated;

  const derivedZodiac = useMemo(
    () => (birthDate ? getZodiacFromDate(birthDate) : null),
    [birthDate]
  );

  useEffect(() => {
    if (derivedZodiac) setZodiacSign(appToDb[derivedZodiac]);
  }, [derivedZodiac]);

  useEffect(() => {
    if (authenticated && forced) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      url.searchParams.delete("from");
      router.replace(url.pathname + url.search);
    }
  }, [authenticated, forced, router]);

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      if (mode === "login") {
        const result = await loginAction({ email, password });
        if (!result.ok) {
          setError(result.error);
          return;
        }
      } else {
        if (!birthDate || !birthTime || !birthPlace || !zodiacSign || interests.length === 0) {
          setError("Заполните все поля профиля: дата, время, город, знак и интересы");
          return;
        }
        const result = await registerAction({
          name,
          email,
          password,
          birthDate,
          birthTime,
          birthPlace,
          zodiacSign,
          interests,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
      }
      await update();
      router.refresh();
      if (from.startsWith("/")) router.push(from);
    });
  };

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#302a30] text-gold/70 font-serif tracking-[0.2em] uppercase text-sm">
        Открытие колоды…
      </div>
    );
  }

  return (
    <>
      <div className={cn(showGate && "select-none blur-[2px] opacity-40")}>
        {children}
      </div>

      {showGate && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-[#1a1618]/75 backdrop-blur-md" aria-hidden />
          <div className="relative z-10 w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-gold/25 bg-[#302a30] p-5 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.45)] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-gold/55">Колода Гадалки</p>
            <h2 className="font-serif text-2xl text-gold-light mt-1">
              {mode === "login" ? "Вход" : "Регистрация"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {mode === "login"
                ? "Войдите, чтобы открыть платформу, игру или магазин."
                : "Заполните профиль полностью — гороскоп и натальная карта подстроятся сразу."}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm",
                  mode === "login"
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-border/50 text-muted-foreground"
                )}
              >
                Войти
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm",
                  mode === "register"
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-border/50 text-muted-foreground"
                )}
              >
                Регистрация
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-5 space-y-3">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              {mode === "register" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="birthDate">Дата рождения *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="birthTime">Время рождения *</Label>
                      <Input
                        id="birthTime"
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="birthPlace">Город рождения *</Label>
                    <Input
                      id="birthPlace"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="Москва"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zodiac">Знак зодиака *</Label>
                    <select
                      id="zodiac"
                      value={zodiacSign}
                      onChange={(e) => setZodiacSign(e.target.value)}
                      required
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Выберите знак</option>
                      {zodiacSigns.map((z) => (
                        <option key={z.id} value={appToDb[z.id]}>
                          {z.name} ({z.dates})
                        </option>
                      ))}
                    </select>
                    {derivedZodiac && (
                      <p className="text-[11px] text-gold/60">
                        По дате рождения: {zodiacSigns.find((z) => z.id === derivedZodiac)?.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Интересы * (минимум 1)</Label>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {interestOptions.map((opt) => {
                        const on = interests.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleInterest(opt.id)}
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-[11px] touch-manipulation",
                              on
                                ? "border-gold/45 bg-gold/10 text-gold"
                                : "border-border/50 text-muted-foreground"
                            )}
                          >
                            {opt.emoji} {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {error && (
                <p className="text-sm text-destructive border border-destructive/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending
                  ? "Секунду…"
                  : mode === "login"
                    ? "Войти в колоду"
                    : "Создать профиль"}
              </Button>
            </form>

            <p className="mt-4 text-[10px] text-muted-foreground/70 leading-relaxed">
              Демо: demo@gadalka.local / password123
            </p>
          </div>
        </div>
      )}
    </>
  );
}
